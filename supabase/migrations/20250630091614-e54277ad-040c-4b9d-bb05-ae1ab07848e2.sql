
-- Update the handle_referral_bonus function to also give signup bonus to new users
CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    referrer_id UUID;
    signup_bonus_amount NUMERIC;
    referral_bonus_amount NUMERIC;
BEGIN
    -- Get signup bonus from site settings (default to 5 if not set)
    SELECT COALESCE(signup_bonus, 5) INTO signup_bonus_amount 
    FROM public.site_settings 
    LIMIT 1;
    
    -- Give signup bonus to new user
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
    
    -- Handle referral bonus if user was referred
    IF NEW.referred_by IS NOT NULL THEN
        referrer_id := NEW.referred_by;
        referral_bonus_amount := signup_bonus_amount; -- Same amount as signup bonus
        
        -- Update referrer's stats and give them referral bonus
        UPDATE public.users 
        SET 
            total_referrals = total_referrals + 1,
            referral_earnings = referral_earnings + referral_bonus_amount,
            balance = balance + referral_bonus_amount,
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
            referral_bonus_amount,
            'Referral bonus for referring ' || NEW.username,
            'completed',
            NEW.id
        );
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create trigger to handle new user signup with bonuses
DROP TRIGGER IF EXISTS on_user_created ON public.users;
CREATE TRIGGER on_user_created
    AFTER INSERT ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_signup();
