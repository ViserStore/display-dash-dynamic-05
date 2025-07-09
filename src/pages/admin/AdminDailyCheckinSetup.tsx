import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { notify } from '@/utils/notifications';
import AdminLayout from '@/components/admin/AdminLayout';

interface DailyCheckinSetting {
  id: string;
  day_name: string;
  bonus_amount: number;
}

const AdminDailyCheckinSetup = () => {
  const [settings, setSettings] = useState<DailyCheckinSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [currencySymbol, setCurrencySymbol] = useState('$');

  const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    fetchSiteSettings();
    fetchSettings();
  }, []);

  const fetchSiteSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('currency_symbol')
        .single();

      if (error) throw error;
      if (data?.currency_symbol) {
        setCurrencySymbol(data.currency_symbol);
      }
    } catch (error) {
      console.error('Error fetching site settings:', error);
    }
  };

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('daily_checkin_settings')
        .select('*')
        .order('day_name');

      if (error) throw error;

      // Sort by day order
      const sortedSettings = dayOrder.map(day => 
        data?.find(setting => setting.day_name === day)
      ).filter(Boolean) as DailyCheckinSetting[];

      setSettings(sortedSettings);
    } catch (error) {
      console.error('Error fetching settings:', error);
      notify.error('Failed to fetch check-in settings');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (dayName: string, value: string) => {
    const numericValue = parseFloat(value) || 0;
    setSettings(prev => 
      prev.map(setting => 
        setting.day_name === dayName 
          ? { ...setting, bonus_amount: numericValue }
          : setting
      )
    );
  };

  const handleUpdateSettings = async () => {
    try {
      setUpdating(true);
      
      const updates = settings.map(setting => ({
        id: setting.id,
        bonus_amount: setting.bonus_amount
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('daily_checkin_settings')
          .update({ bonus_amount: update.bonus_amount })
          .eq('id', update.id);

        if (error) throw error;
      }

      notify.success('Check-in settings updated successfully!');
    } catch (error) {
      console.error('Error updating settings:', error);
      notify.error('Failed to update check-in settings');
    } finally {
      setUpdating(false);
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

  return (
    <>
      <AdminLayout>
        <div className="mx-[8px] mt-2">
          <div className="flex items-center mb-3">
            <div className="flex-auto">
              <h1 className="font-bold text-[20px] text-rose-500">Check In Setup</h1>
              <h1 className="font-bold text-[14px] text-gray-400">Setup Daily Check In System</h1>
            </div>
          </div>

          <div className="card shadow-md shadow-rose-500/40 bg-white">
            <div className="card-body p-3">
              <h1 className="text-20px font-bold text-rose-500">Daily Check In Setup</h1>
              
              <div className="grid grid-cols grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mb-3 mt-1">
                {settings.map((setting) => (
                  <div key={setting.id}>
                    <div className="relative">
                      <label 
                        htmlFor={`${setting.day_name} Bonus in (${currencySymbol})`}
                        className="block mb-2 text-sm font-medium text-gray-200 text-rose-500"
                      >
                        {setting.day_name} Bonus in ({currencySymbol})
                      </label>
                      <div className="relative mb-3">
                        <input
                          className="text-gray-600 focus:text-gray-600 border-2 border-rose-400 hover:border-rose-500 focus:border-rose-500 focus:ring-rose-500 bg-transparent border hover:border-lime-500 focus:border-lime-500 focus:outline-0 text-gray-200 focus:text-gray-200 text-sm rounded-md focus:ring-rose-500 block w-full undefined p-2.5"
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder={`Enter ${setting.day_name} Bonus`}
                          value={setting.bonus_amount}
                          onChange={(e) => handleInputChange(setting.day_name, e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                className="bg-gradient-to-r hover:bg-gradient-to-l from-rose-500 to-rose-600 text-white w-[100%] p-2 rounded-[10px] mb-2 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleUpdateSettings}
                disabled={updating}
              >
                {updating ? 'Updating...' : 'Update Setting'}
              </button>
            </div>
          </div>
        </div>
      </AdminLayout>
    </>
  );
};

export default AdminDailyCheckinSetup;
