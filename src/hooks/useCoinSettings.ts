
import { useState, useEffect } from 'react';
import { getSupabaseClient } from '../integrations/supabase/client';

interface CoinSettings {
  id: number;
  symbol: string;
  profit_loss: number;
  status: string;
}

export const useCoinSettings = (coinSymbol: string) => {
  const [coinSettings, setCoinSettings] = useState<CoinSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCoinSettings = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log(`Fetching settings for coin: ${coinSymbol}`);
        
        const supabase = await getSupabaseClient();
        const { data, error } = await supabase
          .from('coins')
          .select('*')
          .eq('symbol', coinSymbol)
          .eq('status', 'active')
          .single();

        if (error) {
          console.error('Error fetching coin settings:', error);
          setError(`No settings found for ${coinSymbol}`);
          return;
        }

        if (data) {
          // Validate that we have required profit_loss value
          if (data.profit_loss === null || data.profit_loss === undefined) {
            console.error(`No profit_loss percentage set for ${coinSymbol}`);
            setError(`No profit percentage configured for ${coinSymbol}`);
            return;
          }

          console.log(`Coin settings for ${coinSymbol}:`, data);
          const coinSettingsData: CoinSettings = {
            id: data.id,
            symbol: data.symbol,
            profit_loss: data.profit_loss,
            status: data.status || 'active'
          };
          setCoinSettings(coinSettingsData);
        } else {
          setError(`No active coin found for ${coinSymbol}`);
        }
      } catch (error) {
        console.error('Error fetching coin settings:', error);
        setError('Failed to fetch coin settings');
      } finally {
        setLoading(false);
      }
    };

    if (coinSymbol) {
      fetchCoinSettings();
    }
  }, [coinSymbol]);

  return {
    coinSettings,
    loading,
    error,
    profitPercentage: coinSettings?.profit_loss || null
  };
};
