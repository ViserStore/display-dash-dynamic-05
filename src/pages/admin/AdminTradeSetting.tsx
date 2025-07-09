import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X } from 'lucide-react';
import { notify } from '@/utils/notifications';
import AdminLayout from '@/components/admin/AdminLayout';

interface TimeProfitSetting {
  time_hours: number;
  profit_percentage: number;
}

interface TradeSettings {
  id: string;
  manual_min_trade_amount: number;
  manual_max_trade_amount: number;
  manual_daily_trade_limit: number;
  bot_profit_type: string;
  bot_min_trade_amount: number;
  bot_max_trade_amount: number;
  bot_daily_trade_limit: number;
  time_profit_settings: TimeProfitSetting[];
}

// Type guard function to check if an unknown value is a TimeProfitSetting array
const isTimeProfitSettingArray = (value: unknown): value is TimeProfitSetting[] => {
  if (!Array.isArray(value)) return false;
  return value.every(item => 
    typeof item === 'object' && 
    item !== null &&
    typeof (item as any).time_hours === 'number' &&
    typeof (item as any).profit_percentage === 'number'
  );
};

// Convert Json to TimeProfitSetting array safely
const convertToTimeProfitSettings = (jsonValue: any): TimeProfitSetting[] => {
  if (isTimeProfitSettingArray(jsonValue)) {
    return jsonValue;
  }
  // Return empty array if conversion fails
  return [];
};

const AdminTradeSetting = () => {
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<Partial<TradeSettings>>({});

  const { data: tradeSettings, isLoading } = useQuery({
    queryKey: ['trade-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trade_settings')
        .select('*')
        .single();
      
      if (error) throw error;
      
      // Safely convert the time_profit_settings
      const convertedData = {
        ...data,
        time_profit_settings: convertToTimeProfitSettings(data.time_profit_settings)
      };
      
      return convertedData as TradeSettings;
    }
  });

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('trade-settings-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all changes (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'trade_settings'
        },
        (payload) => {
          console.log('Trade settings changed:', payload);
          // Process the real-time data and convert JSON properly
          if (payload.new && typeof payload.new === 'object') {
            const newData = payload.new as any;
            if ('time_profit_settings' in newData) {
              const convertedPayload = {
                ...newData,
                time_profit_settings: convertToTimeProfitSettings(newData.time_profit_settings)
              };
              console.log('Converted payload:', convertedPayload);
              
              // Update the form data directly with the converted data
              setFormData(convertedPayload as TradeSettings);
            }
          }
          
          // Also invalidate and refetch the query to ensure consistency
          queryClient.invalidateQueries({ queryKey: ['trade-settings'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Update form data when trade settings change
  useEffect(() => {
    if (tradeSettings) {
      setFormData(tradeSettings);
    }
  }, [tradeSettings]);

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<TradeSettings>) => {
      console.log('Updating with data:', data);
      console.log('Time profit settings:', data.time_profit_settings);
      
      // Convert TimeProfitSetting[] to Json format for database
      const timeProfit = data.time_profit_settings || [];
      const jsonTimeProfit = timeProfit.map(setting => ({
        time_hours: setting.time_hours,
        profit_percentage: setting.profit_percentage
      }));
      
      const { data: result, error } = await supabase
        .from('trade_settings')
        .update({
          manual_min_trade_amount: data.manual_min_trade_amount,
          manual_max_trade_amount: data.manual_max_trade_amount,
          manual_daily_trade_limit: data.manual_daily_trade_limit,
          bot_profit_type: data.bot_profit_type,
          bot_min_trade_amount: data.bot_min_trade_amount,
          bot_max_trade_amount: data.bot_max_trade_amount,
          bot_daily_trade_limit: data.bot_daily_trade_limit,
          time_profit_settings: jsonTimeProfit as any
        })
        .eq('id', tradeSettings?.id)
        .select()
        .single();

      if (error) {
        console.error('Database update error:', error);
        throw error;
      }
      
      console.log('Database update result:', result);
      return result;
    },
    onSuccess: (result) => {
      console.log('Update successful:', result);
      notify.success("Trade settings updated successfully");
      queryClient.invalidateQueries({ queryKey: ['trade-settings'] });
    },
    onError: (error) => {
      console.error('Update error:', error);
      notify.error("Failed to update trade settings");
    }
  });

  const handleInputChange = (field: keyof TradeSettings, value: any) => {
    console.log(`Updating field ${field} with value:`, value);
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTimeProfitChange = (index: number, field: keyof TimeProfitSetting, value: number) => {
    console.log(`Updating time profit setting ${index}, field ${field} with value:`, value);
    setFormData(prev => {
      const newTimeProfit = [...(prev.time_profit_settings || [])];
      newTimeProfit[index] = {
        ...newTimeProfit[index],
        [field]: value
      };
      console.log('New time profit settings:', newTimeProfit);
      return {
        ...prev,
        time_profit_settings: newTimeProfit
      };
    });
  };

  const addTimeProfitSetting = () => {
    console.log('Adding new time profit setting');
    setFormData(prev => ({
      ...prev,
      time_profit_settings: [
        ...(prev.time_profit_settings || []),
        { time_hours: 1, profit_percentage: 1 }
      ]
    }));
  };

  const removeTimeProfitSetting = (index: number) => {
    console.log('Removing time profit setting at index:', index);
    setFormData(prev => ({
      ...prev,
      time_profit_settings: (prev.time_profit_settings || []).filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting form data:', formData);
    updateMutation.mutate(formData);
  };

  if (isLoading) {
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
              <h1 className="font-bold text-[20px] text-rose-500">Trade Settings</h1>
              <h1 className="font-bold text-[14px] text-gray-400">Configure trading parameters from here</h1>
            </div>
          </div>

          <div className="flex justify-center items-center rounded-lg text-white bg-rose-600 shadow-md shadow-rose-700/50 p-2 mb-3">
            <div className="flex-auto flex items-center">
              <i className="fi fi-ss-stats leading-[0px]"></i>
              <h1 className="text-sm font-bold ps-2">Trade Configuration</h1>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Manual Trade Settings */}
            <div className="bg-white shadow-md border border-rose-200 rounded-lg p-4">
              <div className="border-b-2 border-rose-500 pb-2 mb-4">
                <h2 className="text-rose-500 font-bold text-lg">Manual Trade Settings</h2>
                <p className="text-gray-400 text-sm">Configure manual trading parameters</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-rose-500">Min Trade Amount</label>
                  <input
                    type="number"
                    className="text-gray-600 focus:text-gray-600 border-2 border-rose-400 hover:border-rose-500 focus:border-rose-500 focus:ring-rose-500 bg-transparent text-sm rounded-md block w-full p-2.5"
                    value={formData.manual_min_trade_amount || ''}
                    onChange={(e) => handleInputChange('manual_min_trade_amount', Number(e.target.value))}
                    placeholder="5"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-rose-500">Max Trade Amount</label>
                  <input
                    type="number"
                    className="text-gray-600 focus:text-gray-600 border-2 border-rose-400 hover:border-rose-500 focus:border-rose-500 focus:ring-rose-500 bg-transparent text-sm rounded-md block w-full p-2.5"
                    value={formData.manual_max_trade_amount || ''}
                    onChange={(e) => handleInputChange('manual_max_trade_amount', Number(e.target.value))}
                    placeholder="100"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-rose-500">Daily Trade Limit</label>
                  <input
                    type="number"
                    className="text-gray-600 focus:text-gray-600 border-2 border-rose-400 hover:border-rose-500 focus:border-rose-500 focus:ring-rose-500 bg-transparent text-sm rounded-md block w-full p-2.5"
                    value={formData.manual_daily_trade_limit || ''}
                    onChange={(e) => handleInputChange('manual_daily_trade_limit', Number(e.target.value))}
                    placeholder="100"
                  />
                </div>
              </div>
            </div>

            {/* Bot Trade Settings */}
            <div className="bg-white shadow-md border border-rose-200 rounded-lg p-4">
              <div className="border-b-2 border-rose-500 pb-2 mb-4">
                <h2 className="text-rose-500 font-bold text-lg">Bot Trade Settings</h2>
                <p className="text-gray-400 text-sm">Configure automated trading parameters</p>
              </div>
              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium text-rose-500">Bot Profit Type</label>
                <select 
                  className="bg-rose-100 border-2 border-rose-400 text-rose-600 text-sm rounded-lg focus:ring-rose-500 focus:border-rose-500 block w-full p-2.5"
                  value={formData.bot_profit_type || 'profit'} 
                  onChange={(e) => handleInputChange('bot_profit_type', e.target.value)}
                >
                  <option value="profit">Profit</option>
                  <option value="lose">Lose</option>
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-rose-500">Min Trade Amount</label>
                  <input
                    type="number"
                    className="text-gray-600 focus:text-gray-600 border-2 border-rose-400 hover:border-rose-500 focus:border-rose-500 focus:ring-rose-500 bg-transparent text-sm rounded-md block w-full p-2.5"
                    value={formData.bot_min_trade_amount || ''}
                    onChange={(e) => handleInputChange('bot_min_trade_amount', Number(e.target.value))}
                    placeholder="10"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-rose-500">Max Trade Amount</label>
                  <input
                    type="number"
                    className="text-gray-600 focus:text-gray-600 border-2 border-rose-400 hover:border-rose-500 focus:border-rose-500 focus:ring-rose-500 bg-transparent text-sm rounded-md block w-full p-2.5"
                    value={formData.bot_max_trade_amount || ''}
                    onChange={(e) => handleInputChange('bot_max_trade_amount', Number(e.target.value))}
                    placeholder="200"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-rose-500">Daily Trade Limit</label>
                  <input
                    type="number"
                    className="text-gray-600 focus:text-gray-600 border-2 border-rose-400 hover:border-rose-500 focus:border-rose-500 focus:ring-rose-500 bg-transparent text-sm rounded-md block w-full p-2.5"
                    value={formData.bot_daily_trade_limit || ''}
                    onChange={(e) => handleInputChange('bot_daily_trade_limit', Number(e.target.value))}
                    placeholder="5"
                  />
                </div>
              </div>
            </div>

            {/* Time & Profit Settings */}
            <div className="bg-white shadow-md border border-rose-200 rounded-lg p-4">
              <div className="border-b-2 border-rose-500 pb-2 mb-4">
                <h2 className="text-rose-500 font-bold text-lg">Time & Profit Settings</h2>
                <p className="text-gray-400 text-sm">Configure time-based profit percentages</p>
              </div>
              {(formData.time_profit_settings || []).map((setting, index) => (
                <div key={index} className="flex items-center gap-4 p-4 border border-rose-200 rounded-lg mb-4">
                  <div className="flex-1">
                    <label className="block mb-2 text-sm font-medium text-rose-500">Time (Hours)</label>
                    <input
                      type="number"
                      className="text-gray-600 focus:text-gray-600 border-2 border-rose-400 hover:border-rose-500 focus:border-rose-500 focus:ring-rose-500 bg-transparent text-sm rounded-md block w-full p-2.5"
                      value={setting.time_hours}
                      onChange={(e) => handleTimeProfitChange(index, 'time_hours', Number(e.target.value))}
                      placeholder="1"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block mb-2 text-sm font-medium text-rose-500">Profit Percentage (%)</label>
                    <input
                      type="number"
                      className="text-gray-600 focus:text-gray-600 border-2 border-rose-400 hover:border-rose-500 focus:border-rose-500 focus:ring-rose-500 bg-transparent text-sm rounded-md block w-full p-2.5"
                      value={setting.profit_percentage}
                      onChange={(e) => handleTimeProfitChange(index, 'profit_percentage', Number(e.target.value))}
                      placeholder="2"
                    />
                  </div>
                  <button
                    type="button"
                    className="bg-red-500 hover:bg-red-600 text-white rounded-md px-3 py-2 mt-6"
                    onClick={() => removeTimeProfitSetting(index)}
                    disabled={(formData.time_profit_settings || []).length <= 1}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="bg-rose-100 hover:bg-rose-200 text-rose-600 border-2 border-rose-400 rounded-md px-4 py-2 w-full flex items-center justify-center gap-2"
                onClick={addTimeProfitSetting}
              >
                <Plus className="w-4 h-4" />
                Add Time & Profit Setting
              </button>
            </div>

            <div className="flex justify-end">
              <button 
                type="submit" 
                disabled={updateMutation.isPending}
                className="bg-gradient-to-r from-rose-500 to-rose-600 hover:bg-gradient-to-l text-white font-bold px-8 py-2 rounded-md disabled:opacity-50"
              >
                {updateMutation.isPending ? 'Updating...' : 'Update Settings'}
              </button>
            </div>
          </form>
        </div>
      </AdminLayout>
    </>
  );
};

export default AdminTradeSetting;
