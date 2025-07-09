
-- Update the function to only give signup bonus to new users, not referrers
CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    signup_bonus_amount NUMERIC;
BEGIN
    -- Get signup bonus from site settings (default to 5 if not set)
    SELECT COALESCE(signup_bonus, 5) INTO signup_bonus_amount 
    FROM public.site_settings 
    LIMIT 1;
    
    -- Give signup bonus to new user only
    UPDATE public.users 
    SET balance = balance + signup_bonus_amount,
        updated_at = now()
    WHERE id = NEW.id;
    
    -- Create transaction record for signup bonus
    INSERT INTO public.transactions (
        user_id, 
        type, 
        amount, 
        description, 
        status
    ) VALUES (
        NEW.id,
        'signup_bonus',
        signup_bonus_amount,
        'Welcome signup bonus',
        'completed'
    );
    
    -- Only update referrer stats (no bonus payment)
    IF NEW.referred_by IS NOT NULL THEN
        -- Update referrer's referral count only
        UPDATE public.users 
        SET 
            total_referrals = total_referrals + 1,
            updated_at = now()
        WHERE id = NEW.referred_by;
    END IF;
    
    RETURN NEW;
END;
$$;
