
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import AdminLayout from '@/components/admin/AdminLayout';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2 } from 'lucide-react';

interface ReferralSetting {
  id: string;
  setting_type: 'deposit' | 'trade_win';
  level_number: number;
  bonus_percentage: number;
  active: boolean;
}

const AdminReferralSetting = () => {
  const [depositSettings, setDepositSettings] = useState<ReferralSetting[]>([]);
  const [tradeWinSettings, setTradeWinSettings] = useState<ReferralSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchReferralSettings();
  }, []);

  const fetchReferralSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('referral_settings')
        .select('*')
        .order('level_number');

      if (error) throw error;

      const deposit = data?.filter(item => item.setting_type === 'deposit') || [];
      const tradeWin = data?.filter(item => item.setting_type === 'trade_win') || [];

      setDepositSettings(deposit as ReferralSetting[]);
      setTradeWinSettings(tradeWin as ReferralSetting[]);
    } catch (error) {
      console.error('Error fetching referral settings:', error);
      toast.error('Failed to fetch referral settings');
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (id: string, updates: Partial<ReferralSetting>) => {
    try {
      const { error } = await supabase
        .from('referral_settings')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      toast.success('Setting updated successfully');
    } catch (error) {
      console.error('Error updating setting:', error);
      toast.error('Failed to update setting');
      throw error;
    }
  };

  const addNewLevel = async (settingType: 'deposit' | 'trade_win') => {
    try {
      setUpdating(true);
      const settings = settingType === 'deposit' ? depositSettings : tradeWinSettings;
      const maxLevel = Math.max(...settings.map(s => s.level_number), 0);
      const newLevel = maxLevel + 1;

      const { data, error } = await supabase
        .from('referral_settings')
        .insert({
          setting_type: settingType,
          level_number: newLevel,
          bonus_percentage: 0,
          active: false
        })
        .select()
        .single();

      if (error) throw error;

      // Update state immediately without reloading
      const newSetting = data as ReferralSetting;
      if (settingType === 'deposit') {
        setDepositSettings(prev => [...prev, newSetting].sort((a, b) => a.level_number - b.level_number));
      } else {
        setTradeWinSettings(prev => [...prev, newSetting].sort((a, b) => a.level_number - b.level_number));
      }

      toast.success(`Level ${newLevel} added successfully`);
    } catch (error) {
      console.error('Error adding new level:', error);
      toast.error('Failed to add new level');
    } finally {
      setUpdating(false);
    }
  };

  const removeLevel = async (settingType: 'deposit' | 'trade_win', levelNumber: number) => {
    try {
      setUpdating(true);
      const settings = settingType === 'deposit' ? depositSettings : tradeWinSettings;
      
      // Get all levels from the selected level to the highest level
      const levelsToRemove = settings.filter(s => s.level_number >= levelNumber);
      
      // Remove all levels from selected level to max level (no need to check if active)
      const levelIds = levelsToRemove.map(s => s.id);
      const { error } = await supabase
        .from('referral_settings')
        .delete()
        .in('id', levelIds);

      if (error) throw error;

      // Update state immediately without reloading
      if (settingType === 'deposit') {
        setDepositSettings(prev => prev.filter(s => s.level_number < levelNumber));
      } else {
        setTradeWinSettings(prev => prev.filter(s => s.level_number < levelNumber));
      }

      const removedLevels = levelsToRemove.map(s => s.level_number).join(', ');
      toast.success(`Levels ${removedLevels} removed successfully`);
    } catch (error) {
      console.error('Error removing levels:', error);
      toast.error('Failed to remove levels');
    } finally {
      setUpdating(false);
    }
  };

  const canActivateLevel = (settings: ReferralSetting[], level: number, isActivating: boolean) => {
    if (!isActivating) return true; // Can always deactivate

    // Level 1 can always be activated
    if (level === 1) return true;

    // For other levels, check if all previous levels are active
    for (let i = 1; i < level; i++) {
      const prevSetting = settings.find(s => s.level_number === i);
      if (!prevSetting || !prevSetting.active) {
        return false;
      }
    }
    return true;
  };

  const deactivateHigherLevels = async (settings: ReferralSetting[], fromLevel: number, settingType: 'deposit' | 'trade_win') => {
    const higherActiveLevels = settings.filter(s => s.level_number > fromLevel && s.active);
    
    if (higherActiveLevels.length > 0) {
      const updatePromises = higherActiveLevels.map(setting => 
        updateSetting(setting.id, { active: false })
      );
      
      await Promise.all(updatePromises);
      
      // Update local state
      if (settingType === 'deposit') {
        setDepositSettings(prev => prev.map(s => 
          s.level_number > fromLevel ? { ...s, active: false } : s
        ));
      } else {
        setTradeWinSettings(prev => prev.map(s => 
          s.level_number > fromLevel ? { ...s, active: false } : s
        ));
      }
      
      const deactivatedLevels = higherActiveLevels.map(s => s.level_number).join(', ');
      toast.success(`Levels ${deactivatedLevels} automatically deactivated`);
    }
  };

  const handleDepositChange = async (level: number, field: string, value: any) => {
    const setting = depositSettings.find(s => s.level_number === level);
    if (!setting) return;

    // Check sequential validation for active status changes
    if (field === 'active' && value === true) {
      if (!canActivateLevel(depositSettings, level, true)) {
        toast.error(`Please activate all previous levels first (levels 1-${level - 1})`);
        return;
      }
    }

    // If deactivating a level, deactivate all higher levels automatically
    if (field === 'active' && value === false) {
      await deactivateHigherLevels(depositSettings, level, 'deposit');
    }

    // Optimistic update
    setDepositSettings(prev => prev.map(setting =>
      setting.level_number === level
        ? { ...setting, [field]: field === 'bonus_percentage' ? parseFloat(value) || 0 : value }
        : setting
    ));

    // If it's an active status change, update immediately 
    if (field === 'active') {
      try {
        await updateSetting(setting.id, { active: value });
      } catch (error) {
        // Revert optimistic update on error
        setDepositSettings(prev => prev.map(s =>
          s.level_number === level ? { ...s, active: !value } : s
        ));
      }
    }
  };

  const handleTradeWinChange = async (level: number, field: string, value: any) => {
    const setting = tradeWinSettings.find(s => s.level_number === level);
    if (!setting) return;

    // Check sequential validation for active status changes
    if (field === 'active' && value === true) {
      if (!canActivateLevel(tradeWinSettings, level, true)) {
        toast.error(`Please activate all previous levels first (levels 1-${level - 1})`);
        return;
      }
    }

    // If deactivating a level, deactivate all higher levels automatically
    if (field === 'active' && value === false) {
      await deactivateHigherLevels(tradeWinSettings, level, 'trade_win');
    }

    // Optimistic update
    setTradeWinSettings(prev => prev.map(setting =>
      setting.level_number === level
        ? { ...setting, [field]: field === 'bonus_percentage' ? parseFloat(value) || 0 : value }
        : setting
    ));

    // If it's an active status change, update immediately
    if (field === 'active') {
      try {
        await updateSetting(setting.id, { active: value });
      } catch (error) {
        // Revert optimistic update on error
        setTradeWinSettings(prev => prev.map(s =>
          s.level_number === level ? { ...s, active: !value } : s
        ));
      }
    }
  };

  const handleSubmit = async () => {
    try {
      setUpdating(true);

      // Update all settings (only bonus_percentage for non-active changes)
      const allUpdates = [
        ...depositSettings.map(setting => updateSetting(setting.id, { bonus_percentage: setting.bonus_percentage })),
        ...tradeWinSettings.map(setting => updateSetting(setting.id, { bonus_percentage: setting.bonus_percentage }))
      ];

      await Promise.all(allUpdates);
      toast.success('Referral settings updated successfully!');

      // Refresh the data to ensure consistency
      await fetchReferralSettings();
    } catch (error) {
      console.error('Error updating referral settings:', error);
      toast.error('Failed to update referral settings');
    } finally {
      setUpdating(false);
    }
  };

  const renderLevelInputs = (settings: ReferralSetting[], onChange: (level: number, field: string, value: any) => void, settingType: 'deposit' | 'trade_win') => {
    const inputs = [];

    // Sort settings by level number to ensure proper display order
    const sortedSettings = [...settings].sort((a, b) => a.level_number - b.level_number);

    for (const setting of sortedSettings) {
      const level = setting.level_number;

      // Check if this level can be activated
      const canActivate = canActivateLevel(settings, level, true);
      const maxLevel = Math.max(...settings.map(s => s.level_number));

      inputs.push(
        <div key={level} className="border border-rose-200 rounded-lg p-3 bg-rose-50/50 relative">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-rose-600">
              Level {level}
            </label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Active</span>
              <Switch
                checked={setting?.active || false}
                onCheckedChange={(isChecked) => onChange(level, 'active', isChecked)}
                disabled={updating || (!canActivate && !(setting?.active || false))}
              />
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
              %
            </div>
            <input
              className="text-gray-600 focus:text-gray-600 border-2 border-rose-300 hover:border-rose-400 focus:border-rose-500 focus:ring-rose-500 bg-white text-sm rounded-md block w-full ps-10 p-2.5 disabled:opacity-50"
              type="number"
              step="0.01"
              min="0"
              max="100"
              placeholder="0.00"
              value={setting?.bonus_percentage || ''}
              onChange={(e) => onChange(level, 'bonus_percentage', e.target.value)}
              disabled={updating || !setting?.active}
            />
          </div>
          <div className="mt-1 flex items-center justify-between">
            <div className="text-xs text-gray-500">
              Status: {setting?.active ? 'Active' : 'Inactive'}
            </div>
            {level > 1 && (
              <button
                onClick={() => removeLevel(settingType, level)}
                disabled={updating}
                className="text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed bg-white rounded-full p-1 shadow-sm border"
                title={`Remove levels ${level} to ${maxLevel}`}
              >
                <Trash2 size={12} />
              </button>
            )}
          </div>
        </div>
      );
    }

    return inputs;
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
              <h1 className="font-bold text-[20px] text-rose-500">Referral Setting</h1>
              <h1 className="font-bold text-[14px] text-gray-400">Manage Referral Settings from Here</h1>
            </div>
          </div>

          <div className="card shadow-md shadow-rose-500/40 bg-white">
            <div className="card-body p-3">
              {/* Deposit Referral Bonus Section */}
              <div className="flex gap-2 items-center mb-4">
                <h1 className="text-[18px] font-bold text-rose-500">Deposit Referral Bonus (%)</h1>
                <button
                  onClick={() => addNewLevel('deposit')}
                  disabled={updating}
                  className="btn btn-sm bg-green-500 hover:bg-green-600 text-white border-none disabled:opacity-50"
                  title="Add new level"
                >
                  <Plus size={16} />
                  Add Level
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 my-4">
                {renderLevelInputs(depositSettings, handleDepositChange, 'deposit')}
              </div>

              {/* Trade Win Referral Bonus Section */}
              <div className="flex gap-2 items-center mb-4">
                <h1 className="text-[18px] font-bold text-rose-500">Trade Win Referral Bonus (%)</h1>
                <button
                  onClick={() => addNewLevel('trade_win')}
                  disabled={updating}
                  className="btn btn-sm bg-green-500 hover:bg-green-600 text-white border-none disabled:opacity-50"
                  title="Add new level"
                >
                  <Plus size={16} />
                  Add Level
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 my-4">
                {renderLevelInputs(tradeWinSettings, handleTradeWinChange, 'trade_win')}
              </div>

              <button
                type="button"
                className="bg-gradient-to-r hover:bg-gradient-to-l from-rose-500 to-rose-600 text-white w-[100%] p-2 rounded-[10px] mb-2 disabled:opacity-50"
                onClick={handleSubmit}
                disabled={updating}
              >
                {updating ? 'Updating...' : 'Update Information'}
              </button>
            </div>
          </div>
        </div>
      </AdminLayout>
    </>
  );
};

export default AdminReferralSetting;
