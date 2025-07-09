
import { useState, useEffect } from 'react';

interface ProjectConfig {
  project: {
    name: string;
    version: string;
    description: string;
    website: string;
    logo: string;
    environment: string;
  };
  supabase: {
    url: string;
    publishable_key: string;
  };
  features: {
    trading: boolean;
    nft_investments: boolean;
    referral_system: boolean;
    kyc_verification: boolean;
    daily_checkin: boolean;
  };
  ui: {
    theme_color: string;
    currency_symbol: string;
    default_currency: string;
  };
}

export const useProjectConfig = () => {
  const [config, setConfig] = useState<ProjectConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Only load from config.json
        const configResponse = await fetch('/config.json');
        if (configResponse.ok) {
          const configData = await configResponse.json();
          setConfig(configData);
        } else {
          throw new Error('config.json not found');
        }
        
      } catch (err) {
        console.error('Failed to load project configuration:', err);
        setError('Failed to load configuration');
        setConfig(null);
      } finally {
        setLoading(false);
      }
    };

    loadConfig();
  }, []);

  return { config, loading, error };
};
