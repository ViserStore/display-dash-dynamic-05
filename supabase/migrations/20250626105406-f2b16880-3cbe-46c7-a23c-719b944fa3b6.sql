
-- Add referral tracking columns to the users table
ALTER TABLE public.users 
ADD COLUMN referred_by UUID NULL REFERENCES public.users(id) ON DELETE SET NULL,
ADD COLUMN referral_code TEXT UNIQUE NULL,
ADD COLUMN total_referrals INTEGER DEFAULT 0,
ADD COLUMN referral_earnings NUMERIC DEFAULT 0.00;

-- Create index for faster referral code lookups
CREATE INDEX idx_users_referral_code ON public.users(referral_code);

-- Create a function to generate unique referral codes
CREATE OR REPLACE FUNCTION generate_referral_code() 
RETURNS TEXT 
LANGUAGE plpgsql 
AS $$
DECLARE
    code TEXT;
    exists_check BOOLEAN;
BEGIN
    LOOP
        -- Generate a random 8-character code
        code := upper(substring(md5(random()::text) from 1 for 8));
        
        -- Check if code already exists
        SELECT EXISTS(SELECT 1 FROM public.users WHERE referral_code = code) INTO exists_check;
        
        -- Exit loop if code is unique
        IF NOT exists_check THEN
            EXIT;
        END IF;
    END LOOP;
    
    RETURN code;
END;
$$;

-- Create a trigger to automatically generate referral codes for new users
CREATE OR REPLACE FUNCTION auto_generate_referral_code()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.referral_code IS NULL THEN
        NEW.referral_code := generate_referral_code();
    END IF;
    RETURN NEW;
END;
$$;

-- Create the trigger
CREATE TRIGGER trigger_auto_generate_referral_code
    BEFORE INSERT ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION auto_generate_referral_code();

-- Create a function to handle referral bonuses
CREATE OR REPLACE FUNCTION handle_referral_bonus()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    referrer_id UUID;
    bonus_amount NUMERIC;
BEGIN
    -- Only process if user was referred by someone
    IF NEW.referred_by IS NOT NULL THEN
        referrer_id := NEW.referred_by;
        
        -- Get signup bonus from site settings (or default to 5)
        SELECT COALESCE(signup_bonus, 5) INTO bonus_amount 
        FROM public.site_settings 
        LIMIT 1;
        
        -- Update referrer's stats and give them referral bonus
        UPDATE public.users 
        SET 
            total_referrals = total_referrals + 1,
            referral_earnings = referral_earnings + bonus_amount,
            balance = balance + bonus_amount,
            updated_at = now()
        WHERE id = referrer_id;
        
        -- Create transaction record for referrer
        INSERT INTO public.transactions (
            user_id, 
            type, 
            amount, 
            description, 
            status, 
            reference_id
        ) VALUES (
            referrer_id,
            'referral_bonus',
            bonus_amount,
            'Referral bonus for referring ' || NEW.username,
            'completed',
            NEW.id
        );
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create trigger for referral bonuses
CREATE TRIGGER trigger_handle_referral_bonus
    AFTER INSERT ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_referral_bonus();
