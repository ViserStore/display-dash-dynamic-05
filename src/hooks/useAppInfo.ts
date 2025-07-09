
import { useState, useEffect } from 'react';
import { useProjectConfig } from './useProjectConfig';

interface AppInfo {
  name: string;
  version: string;
  website: string;
  description?: string;
  logo?: string;
}

export const useAppInfo = () => {
  const { config, loading: configLoading } = useProjectConfig();
  const [appInfo, setAppInfo] = useState<AppInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!configLoading && config) {
      setAppInfo({
        name: config.project.name,
        version: config.project.version,
        website: config.project.website,
        description: config.project.description,
        logo: config.project.logo
      });
      setLoading(false);
    } else if (!configLoading && !config) {
      setLoading(false);
    }
  }, [config, configLoading]);

  return { appInfo, loading };
};
