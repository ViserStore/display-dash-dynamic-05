
import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';

interface TradeSettings {
  manual_min_trade_amount: number;
  manual_max_trade_amount: number;
  manual_daily_trade_limit: number;
  bot_min_trade_amount: number;
  bot_max_trade_amount: number;
  bot_daily_trade_limit: number;
  time_profit_settings: Array<{
    time_hours: number;
    profit_percentage: number;
  }>;
}

export const useTradeSettings = () => {
  const [settings, setSettings] = useState<TradeSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTradeSettings();
  }, []);

  const fetchTradeSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('trade_settings')
        .select('*')
        .single();

      if (error) {
        console.error('Error fetching trade settings:', error);
        return;
      }

      if (data) {
        // Parse the time_profit_settings JSON properly
        const parsedSettings = {
          ...data,
          time_profit_settings: typeof data.time_profit_settings === 'string' 
            ? JSON.parse(data.time_profit_settings) 
            : data.time_profit_settings
        };
        setSettings(parsedSettings);
      }
    } catch (error) {
      console.error('Error fetching trade settings:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    settings,
    loading,
    refetch: fetchTradeSettings
  };
};
