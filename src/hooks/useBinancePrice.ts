
import { useState, useEffect } from 'react';

interface PriceData {
  symbol: string;
  price: string;
}

export const useBinancePrice = (symbol: string, autoFetch: boolean = true) => {
  const [price, setPrice] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrice = async () => {
    try {
      setLoading(true);
      const response = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`);
      if (!response.ok) {
        throw new Error('Failed to fetch price');
      }
      const data: PriceData = await response.json();
      setPrice(parseFloat(data.price));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!autoFetch) return;

    fetchPrice();
    const interval = setInterval(fetchPrice, 1000); // Update every second

    return () => clearInterval(interval);
  }, [symbol, autoFetch]);

  return { price, loading, error, fetchPrice };
};
