
-- Create admin users table
CREATE TABLE public.admin_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name TEXT,
  email TEXT,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster username lookups
CREATE INDEX idx_admin_users_username ON public.admin_users(username);

-- Insert a default admin user (username: admin, password: admin123)
-- Correct password hash for 'admin123' using SHA-256
INSERT INTO public.admin_users (username, password_hash, full_name, email, role)
VALUES ('admin', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'Administrator', 'admin@tradebull.com', 'admin');
