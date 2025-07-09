
-- First, clear the existing bot tokens
DELETE FROM public.bot_tokens;

-- Insert the new comprehensive list of bot tokens
INSERT INTO public.bot_tokens (symbol, name, image_url) VALUES
('BTC', 'Bitcoin', 'https://i.ibb.co/vdtQGJQ/1711137174306-Bitcoin-svg.png'),
('SOL', 'Solana', 'https://i.ibb.co/0YQJhzM/1711137080552-63f5b15b321561677046107.png'),
('TRX', 'TRON', 'https://i.ibb.co/VBBTjgM/1711137127040-63f5b1ee31d5b1677046254.png'),
('ETH', 'Ethereum', 'https://i.ibb.co/GVY5981/1711137435289-63f5ae36e64321677045302.png'),
('BNB', 'BNB', 'https://i.ibb.co/zmSk16z/1711137454561-63f5aefe3d51d1677045502.png'),
('XRP', 'XRP', 'https://i.ibb.co/K2qkxx4/1711137626248-63f5b06b27ce61677045867.png'),
('ADA', 'Cardano', 'https://i.ibb.co/GVZD7tC/1711137740064-63f5b09e9f94e1677045918.png'),
('DOGE', 'Dogecoin', 'https://i.ibb.co/xqmnGMh/1711137870591-63f5b131cee801677046065.jpg'),
('NEAR', 'NEAR Protocol', 'https://i.ibb.co/KyPDwwM/1711139510495-6535.png'),
('LINK', 'Chainlink', 'https://i.ibb.co/48NtVW0/1711138140032-65b276149bdac1706194452.png'),
('LTC', 'Litecoin', 'https://i.ibb.co/vZDT3t6/1711138170595-64b0737bcd6471689285499.jpg'),
('ALGO', 'Algorand', 'https://i.ibb.co/JBx1w9x/1711138271497-65b274eeea94b1706194158.png'),
('APT', 'Aptos', 'https://i.ibb.co/SfMKk5K/1711138580329-21794.png'),
('STX', 'Stacks', 'https://i.ibb.co/hdSTNkp/1711139575059-4847.png'),
('ATOM', 'Cosmos', 'https://i.ibb.co/88Thdwf/1711138693569-3794.png'),
('GALA', 'Gala', 'https://i.ibb.co/kQThwds/1711138741502-7080.png'),
('ICP', 'Internet Computer', 'https://i.ibb.co/qDzm0xR/1711139481440-8916.png'),
('GMT', 'STEPN', 'https://i.ibb.co/cx8MVYF/1711138891908-18069.png'),
('BCH', 'Bitcoin Cash', 'https://i.ibb.co/x33zq5k/1711139389480-1831.png'),
('AVAX', 'Avalanche', 'https://i.ibb.co/W07JwvF/1711139227465-5805.png'),
('ARB', 'Arbitrum', 'https://i.ibb.co/Tv2xV5M/1711139634049-11841.png'),
('AAVE', 'Aave', 'https://i.ibb.co/8cnJshV/1711139761164-7278.png'),
('XMR', 'Monero', 'https://i.ibb.co/x6tQWqH/1711139789384-328.png'),
('ENS', 'ENS', 'https://i.ibb.co/tQTgxPd/13855.png'),
('DOT', 'Polkadot', 'https://i.ibb.co/MMZSLWT/Polkadot-Logo-Animation-64x64.gif'),
('AR', 'Arweave', 'https://i.ibb.co/68HYdPs/5632.png'),
('XLM', 'Stellar', 'https://i.ibb.co/B2q6bKh/512.png'),
('S', 'Sonic', 'https://i.ibb.co.com/b5s7SXjJ/32684.png'),
('BNX', 'BinaryX', 'https://i.ibb.co/yQHshML/23635.png'),
('NTRN', 'Neutron', 'https://i.ibb.co/PQ5rds6/26680.png'),
('QNT', 'Quant', 'https://i.ibb.co/MVymyvM/3155.png'),
('AXL', 'Axelar', 'https://i.ibb.co/VmqS7Q0/17799.png'),
('DASH', 'Dash', 'https://i.ibb.co/KDt7SSL/131.png'),
('DEXE', 'DeXe', 'https://i.ibb.co/fNczhgr/7326.png')
ON CONFLICT (symbol) DO UPDATE SET
name = EXCLUDED.name,
image_url = EXCLUDED.image_url;
