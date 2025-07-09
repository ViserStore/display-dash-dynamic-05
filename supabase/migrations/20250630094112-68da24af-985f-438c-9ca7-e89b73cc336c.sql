
-- Create function to handle deposit referral commissions
CREATE OR REPLACE FUNCTION public.handle_deposit_referral_commission(deposit_user_id uuid, deposit_amount numeric)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_referrer_id uuid;
    current_level integer := 1;
    commission_percentage numeric;
    commission_amount numeric;
    level_setting RECORD;
BEGIN
    -- Start with the user who made the deposit
    SELECT referred_by INTO current_referrer_id
    FROM public.users 
    WHERE id = deposit_user_id;
    
    -- Loop through referral levels
    WHILE current_referrer_id IS NOT NULL AND current_level <= 15 LOOP
        -- Get the referral setting for current level
        SELECT * INTO level_setting
        FROM public.referral_settings 
        WHERE setting_type = 'deposit' 
        AND level_number = current_level 
        AND active = true;
        
        -- If level is active and has bonus percentage
        IF level_setting.id IS NOT NULL AND level_setting.bonus_percentage > 0 THEN
            commission_percentage := level_setting.bonus_percentage;
            commission_amount := (deposit_amount * commission_percentage) / 100;
            
            -- Add commission to referrer's balance
            UPDATE public.users 
            SET 
                balance = balance + commission_amount,
                referral_earnings = referral_earnings + commission_amount,
                updated_at = now()
            WHERE id = current_referrer_id;
            
            -- Create transaction record for commission
            INSERT INTO public.transactions (
                user_id, 
                type, 
                amount, 
                description, 
                status
            ) VALUES (
                current_referrer_id,
                'commission',
                commission_amount,
                'Level ' || current_level || ' deposit referral commission (' || commission_percentage || '%)',
                'completed'
            );
            
            -- Log the commission for debugging
            RAISE NOTICE 'Level % commission: User % received % (% of %)', 
                current_level, current_referrer_id, commission_amount, commission_percentage, deposit_amount;
        END IF;
        
        -- Move to next level (get referrer of current referrer)
        SELECT referred_by INTO current_referrer_id
        FROM public.users 
        WHERE id = current_referrer_id;
        
        current_level := current_level + 1;
    END LOOP;
END;
$$;

-- Create function to handle deposit approval
CREATE OR REPLACE FUNCTION public.approve_deposit_and_process_referrals()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Only process when deposit status changes to 'complete' or 'approved'
    IF OLD.status != NEW.status AND (NEW.status = 'complete' OR NEW.status = 'approved') THEN
        -- Add deposit amount to user's balance
        UPDATE public.users 
        SET 
            balance = balance + NEW.amount,
            updated_at = now()
        WHERE id = NEW.user_id;
        
        -- Create transaction record for the deposit
        INSERT INTO public.transactions (
            user_id, 
            type, 
            amount, 
            description, 
            status,
            reference_id
        ) VALUES (
            NEW.user_id,
            'deposit',
            NEW.amount,
            'Deposit approved - Transaction ID: ' || NEW.transaction_id,
            'completed',
            NEW.id
        );
        
        -- Process referral commissions
        PERFORM public.handle_deposit_referral_commission(NEW.user_id, NEW.amount);
        
        RAISE NOTICE 'Deposit approved for user % with amount %. Referral commissions processed.', NEW.user_id, NEW.amount;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create trigger for deposit approval
DROP TRIGGER IF EXISTS on_deposit_status_change ON public.deposits;
CREATE TRIGGER on_deposit_status_change
    AFTER UPDATE ON public.deposits
    FOR EACH ROW 
    EXECUTE FUNCTION public.approve_deposit_and_process_referrals();
