
-- Add profit_loss column to existing coins table
ALTER TABLE public.coins 
ADD COLUMN profit_loss NUMERIC DEFAULT 10;

-- Add some sample data to existing coins if table is empty
INSERT INTO public.coins (symbol, image_url, profit_loss, status) VALUES
('BTC', 'https://i.ibb.co/vdtQGJQ/1711137174306-Bitcoin-svg.png', 10, 'active'),
('ETH', 'https://i.ibb.co/GVY5981/1711137435289-63f5ae36e64321677045302.png', 12, 'active'),
('BNB', 'https://i.ibb.co/zmSk16z/1711137454561-63f5aefe3d51d1677045502.png', 8, 'active')
ON CONFLICT (symbol) DO NOTHING;
