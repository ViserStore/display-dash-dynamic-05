
-- Create function to deduct balance from user account
CREATE OR REPLACE FUNCTION public.deduct_user_balance(user_id UUID, amount NUMERIC)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.users 
    SET balance = balance - amount,
        updated_at = now()
    WHERE id = user_id AND balance >= amount;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Insufficient balance or user not found';
    END IF;
END;
$$;

-- Create function to add balance to user account
CREATE OR REPLACE FUNCTION public.add_user_balance(user_id UUID, amount NUMERIC)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.users 
    SET balance = balance + amount,
        updated_at = now()
    WHERE id = user_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'User not found';
    END IF;
END;
$$;
