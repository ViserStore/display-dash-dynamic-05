
-- Create function to process NFT returns when they're due
CREATE OR REPLACE FUNCTION public.process_nft_returns()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    investment_record RECORD;
    profit_amount NUMERIC;
    new_next_return_at TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Find all NFT investments that are due for returns
    FOR investment_record IN 
        SELECT nt.*, n.min_profit_percentage, n.max_profit_percentage, n.validity_days
        FROM public.nft_transactions nt
        JOIN public.nfts n ON nt.nft_id = n.id
        WHERE nt.status = 'active' 
        AND nt.next_return_at IS NOT NULL 
        AND nt.next_return_at <= NOW()
        AND nt.expires_at > NOW()
    LOOP
        -- Calculate profit amount (random between min and max profit percentage)
        profit_amount := investment_record.investment_amount * 
            (investment_record.min_profit_percentage + 
             (random() * (investment_record.max_profit_percentage - investment_record.min_profit_percentage))) / 100;
        
        -- Add profit to user's balance
        UPDATE public.users 
        SET balance = balance + profit_amount,
            updated_at = now()
        WHERE id = investment_record.user_id;
        
        -- Create transaction record for the profit
        INSERT INTO public.transactions (
            user_id, 
            type, 
            amount, 
            description, 
            status
        ) VALUES (
            investment_record.user_id,
            'nft_return',
            profit_amount,
            'NFT Return - ' || (SELECT title FROM public.nfts WHERE id = investment_record.nft_id),
            'completed'
        );
        
        -- Update NFT transaction record
        -- Calculate next return time (24 hours from now)
        new_next_return_at := NOW() + INTERVAL '24 hours';
        
        -- If next return would be after expiry, set to null (completed)
        IF new_next_return_at >= investment_record.expires_at THEN
            new_next_return_at := NULL;
        END IF;
        
        UPDATE public.nft_transactions
        SET 
            latest_return_amount = profit_amount,
            return_amount = return_amount + profit_amount,
            return_count = return_count + 1,
            next_return_at = new_next_return_at,
            status = CASE 
                WHEN new_next_return_at IS NULL THEN 'completed'
                ELSE 'active'
            END,
            updated_at = now()
        WHERE id = investment_record.id;
        
        -- Log the return processing
        RAISE NOTICE 'Processed NFT return: User % received % profit from investment %', 
            investment_record.user_id, profit_amount, investment_record.id;
    END LOOP;
END;
$$;

-- Create a trigger to automatically set next_return_at when NFT investment is created
CREATE OR REPLACE FUNCTION public.set_initial_nft_return_time()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    -- Set next return time to 24 hours after investment
    NEW.next_return_at := NEW.invested_at + INTERVAL '24 hours';
    
    -- If next return would be after expiry, set to null
    IF NEW.next_return_at >= NEW.expires_at THEN
        NEW.next_return_at := NULL;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create trigger for new NFT investments
DROP TRIGGER IF EXISTS set_nft_return_time ON public.nft_transactions;
CREATE TRIGGER set_nft_return_time
    BEFORE INSERT ON public.nft_transactions
    FOR EACH ROW
    EXECUTE FUNCTION public.set_initial_nft_return_time();

-- Enable extensions needed for cron jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create cron job to process NFT returns every hour
SELECT cron.schedule(
    'process-nft-returns-hourly',
    '0 * * * *', -- Every hour at minute 0
    $$
    SELECT public.process_nft_returns();
    $$
);
