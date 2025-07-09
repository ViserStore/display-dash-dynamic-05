
-- Update the referral code generation function to use base64 encoding
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TEXT 
LANGUAGE plpgsql 
AS $$
DECLARE
    code TEXT;
    exists_check BOOLEAN;
    random_string TEXT;
BEGIN
    LOOP
        -- Generate a random string and encode it in base64
        random_string := substring(md5(random()::text) from 1 for 6);
        code := encode(random_string::bytea, 'base64');
        
        -- Remove any padding characters and make it URL safe
        code := replace(replace(code, '+', '-'), '/', '_');
        code := rtrim(code, '=');
        
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
