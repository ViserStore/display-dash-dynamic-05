import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { notify } from '@/utils/notifications';
import AdminLayout from '@/components/admin/AdminLayout';

interface SiteSetting {
  id: string;
  site_title: string;
  site_currency: string;
  currency_symbol: string;
  signup_bonus: number;
  transfer_min_limit: number;
  transfer_charge: number;
  refer_need: number;
  imgbb_api_key: string | null;
}

const AdminSettings = () => {
  const [settings, setSettings] = useState<SiteSetting | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('site_settings')
        .select('id, site_title, site_currency, currency_symbol, signup_bonus, transfer_min_limit, transfer_charge, refer_need, imgbb_api_key')
        .maybeSingle();

      if (error) throw error;
      setSettings(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
      notify.error('Failed to fetch site settings');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    if (!settings) return;
    
    setSettings(prev => ({
      ...prev!,
      [field]: value
    }));
  };

  const saveSettings = async (settings: SiteSetting) => {
    const { error } = await supabase
      .from('site_settings')
      .update({
        site_title: settings.site_title,
        site_currency: settings.site_currency,
        currency_symbol: settings.currency_symbol,
        signup_bonus: settings.signup_bonus,
        transfer_min_limit: settings.transfer_min_limit,
        transfer_charge: settings.transfer_charge,
        refer_need: settings.refer_need,
        imgbb_api_key: settings.imgbb_api_key
      })
      .eq('id', settings.id);

    if (error) throw error;
    return settings;
  };

  const handleUpdateSettings = async () => {
    if (!settings) return;

    try {
      await saveSettings(settings);
      notify.success('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      notify.error('Could not save settings.');
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex flex-col justify-center items-center h-[calc(100vh-150px)]">
          <span className="loading loading-bars text-rose-500 loading-lg -mt-[60px]"></span>
        </div>
      </AdminLayout>
    );
  }

  if (!settings) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-rose-700">No settings found</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <>
      
      <AdminLayout>
        <div className="mx-[8px] mt-2">
          <div className="flex items-center mb-3">
            <div className="flex-auto">
              <h1 className="font-bold text-[20px] text-rose-500">Site Settings</h1>
              <h1 className="font-bold text-[14px] text-gray-400">Configure your site settings</h1>
            </div>
          </div>

          <div className="card shadow-md shadow-rose-500/40 bg-white">
            <div className="card-body p-3">
              <h1 className="text-20px font-bold text-rose-500">General Settings</h1>
              
              <div className="grid grid-cols grid-cols-1 md:grid-cols-2 gap-2 mb-3 mt-1">
                <div>
                  <label className="block mb-2 text-sm font-medium text-rose-500">Site Title</label>
                  <input
                    className="text-gray-600 focus:text-gray-600 border-2 border-rose-400 hover:border-rose-500 focus:border-rose-500 bg-transparent text-sm rounded-md block w-full p-2.5"
                    type="text"
                    value={settings.site_title}
                    onChange={(e) => handleInputChange('site_title', e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block mb-2 text-sm font-medium text-rose-500">Site Currency</label>
                  <input
                    className="text-gray-600 focus:text-gray-600 border-2 border-rose-400 hover:border-rose-500 focus:border-rose-500 bg-transparent text-sm rounded-md block w-full p-2.5"
                    type="text"
                    value={settings.site_currency}
                    onChange={(e) => handleInputChange('site_currency', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-rose-500">Currency Symbol</label>
                  <input
                    className="text-gray-600 focus:text-gray-600 border-2 border-rose-400 hover:border-rose-500 focus:border-rose-500 bg-transparent text-sm rounded-md block w-full p-2.5"
                    type="text"
                    value={settings.currency_symbol}
                    onChange={(e) => handleInputChange('currency_symbol', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-rose-500">Signup Bonus</label>
                  <input
                    className="text-gray-600 focus:text-gray-600 border-2 border-rose-400 hover:border-rose-500 focus:border-rose-500 bg-transparent text-sm rounded-md block w-full p-2.5"
                    type="number"
                    step="0.01"
                    value={settings.signup_bonus}
                    onChange={(e) => handleInputChange('signup_bonus', parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-rose-500">Transfer Min Limit</label>
                  <input
                    className="text-gray-600 focus:text-gray-600 border-2 border-rose-400 hover:border-rose-500 focus:border-rose-500 bg-transparent text-sm rounded-md block w-full p-2.5"
                    type="number"
                    step="0.01"
                    value={settings.transfer_min_limit}
                    onChange={(e) => handleInputChange('transfer_min_limit', parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-rose-500">Transfer Charge</label>
                  <input
                    className="text-gray-600 focus:text-gray-600 border-2 border-rose-400 hover:border-rose-500 focus:border-rose-500 bg-transparent text-sm rounded-md block w-full p-2.5"
                    type="number"
                    step="0.01"
                    value={settings.transfer_charge}
                    onChange={(e) => handleInputChange('transfer_charge', parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-rose-500">Referral Requirement</label>
                  <input
                    className="text-gray-600 focus:text-gray-600 border-2 border-rose-400 hover:border-rose-500 focus:border-rose-500 bg-transparent text-sm rounded-md block w-full p-2.5"
                    type="number"
                    value={settings.refer_need}
                    onChange={(e) => handleInputChange('refer_need', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>

              <h1 className="text-20px font-bold text-rose-500 mt-6 mb-3">ImgBB API Settings</h1>
              
              <div className="grid grid-cols-1 gap-2 mb-3">
                <div>
                  <label className="block mb-2 text-sm font-medium text-rose-500">ImgBB API Key</label>
                  <input
                    className="text-gray-600 focus:text-gray-600 border-2 border-rose-400 hover:border-rose-500 focus:border-rose-500 bg-transparent text-sm rounded-md block w-full p-2.5"
                    type="password"
                    value={settings.imgbb_api_key || ''}
                    onChange={(e) => handleInputChange('imgbb_api_key', e.target.value)}
                    placeholder="Enter ImgBB API key"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Get your API key from{' '}
                    <a href="https://api.imgbb.com/" target="_blank" rel="noopener noreferrer" className="text-rose-500 hover:underline">
                      ImgBB API
                    </a>
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="bg-gradient-to-r hover:bg-gradient-to-l from-rose-500 to-rose-600 text-white w-[100%] p-2 rounded-[10px] mb-2"
                onClick={handleUpdateSettings}
              >
                Update Settings
              </button>
            </div>
          </div>
        </div>
      </AdminLayout>
    </>
  );
};

export default AdminSettings;
