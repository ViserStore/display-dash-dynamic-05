
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { notify } from '@/utils/notifications';
import BottomNavigation from '../components/BottomNavigation';
import PageHeader from '../components/PageHeader';

const WithdrawPin = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    newPin: '',
    confirmPin: ''
  });
  const [loading, setLoading] = useState(false);
  const [hasPin, setHasPin] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const fetchPinStatus = async () => {
      if (!user) return;
      
      setInitialLoading(true);
      
      try {
        // Fetch real-time PIN status from database
        const { data, error } = await supabase
          .from('users')
          .select('withdraw_pin')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error checking PIN status:', error);
          notify.error('Failed to load PIN status');
        } else if (data?.withdraw_pin) {
          setHasPin(true);
        }
      } catch (error) {
        console.error('Error checking PIN status:', error);
        notify.error('Failed to load PIN status');
      } finally {
        setInitialLoading(false);
      }
    };

    fetchPinStatus();
  }, [user]);

  const handleBackClick = () => {
    window.history.back();
  };

  const handleLogout = () => {
    console.log('Logout clicked');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Only allow numbers and limit to 6 digits
    if (value.length <= 6 && /^\d*$/.test(value)) {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const hashPin = async (pin: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(pin);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      notify.error('Please login first');
      return;
    }

    // Validation
    if (!formData.newPin || !formData.confirmPin) {
      notify.error('Please fill in all required fields');
      return;
    }

    if (formData.newPin !== formData.confirmPin) {
      notify.error('PINs do not match');
      return;
    }

    if (formData.newPin.length !== 6) {
      notify.error('PIN must be exactly 6 digits');
      return;
    }

    setLoading(true);
    const loadingToast = notify.loading(hasPin ? 'Updating PIN...' : 'Setting up PIN...');
    
    try {
      // Hash new PIN and update
      const newPinHash = await hashPin(formData.newPin);
      
      const { error } = await supabase
        .from('users')
        .update({
          withdraw_pin: newPinHash,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      notify.dismiss(loadingToast);

      if (error) {
        console.error('PIN update error:', error);
        notify.error('Failed to update PIN. Please try again.');
        return;
      }

      notify.success(hasPin ? 'PIN updated successfully!' : 'PIN set successfully!');
      
      // Clear form and update state
      setFormData({
        newPin: '',
        confirmPin: ''
      });
      setHasPin(true);
      
    } catch (error) {
      notify.dismiss(loadingToast);
      console.error('PIN update error:', error);
      notify.error('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[100vh] bg-black mx-auto max-w-[480px] overflow-y-hidden">
      <div className="min-h-[100vh] pt-[0px] pb-[63px]">
        <div className="relative z-[1]">
          <PageHeader title="Withdraw PIN" />

          {/* PIN Form */}
          <div className="container mx-auto px-[8px] backdrop-blur overflow-auto h-[calc(100vh-154px)] pt-[30px] rounded-t-[20px]">
            {initialLoading ? (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-400"></div>
                <p className="text-gray-400 mt-4">Loading PIN status...</p>
              </div>
            ) : (
              <form className="grid grid-cols-1" onSubmit={handleSubmit}>
                <div className="w-[100%]">
                  <div className="relative">
                    <label htmlFor="newPin" className="block mb-2 text-sm font-medium text-gray-200 text-lime-500 absolute left-[20px] top-[-10px] z-[1] px-2 bg-black uppercase">
                      {hasPin ? 'New PIN' : 'Set PIN'}
                    </label>
                    <div className="relative mb-3">
                      <input 
                        className="placeholder:text-gray-400 !text-lime-500 border-[1.5px] !border-lime-500 py-[17px] !rounded-[10px] !bg-transparent autofill:bg-autofillBg bg-transparent border hover:border-lime-500 focus:border-lime-500 focus:outline-0 text-gray-200 focus:text-gray-200 text-sm rounded-md focus:ring-rose-500 block w-full p-2.5 text-center tracking-[0.5em]" 
                        type="password" 
                        placeholder="••••••" 
                        name="newPin"
                        value={formData.newPin}
                        onChange={handleInputChange}
                        maxLength={6}
                        inputMode="numeric"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="w-[100%]">
                  <div className="relative">
                    <label htmlFor="confirmPin" className="block mb-2 text-sm font-medium text-gray-200 text-lime-500 absolute left-[20px] top-[-10px] z-[1] px-2 bg-black uppercase">
                      Confirm PIN
                    </label>
                    <div className="relative mb-3">
                      <input 
                        className="placeholder:text-gray-400 !text-lime-500 border-[1.5px] !border-lime-500 py-[17px] !rounded-[10px] !bg-transparent autofill:bg-autofillBg bg-transparent border hover:border-lime-500 focus:border-lime-500 focus:outline-0 text-gray-200 focus:text-gray-200 text-sm rounded-md focus:ring-rose-500 block w-full p-2.5 text-center tracking-[0.5em]" 
                        type="password" 
                        placeholder="••••••" 
                        name="confirmPin"
                        value={formData.confirmPin}
                        onChange={handleInputChange}
                        maxLength={6}
                        inputMode="numeric"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-xs text-gray-400 text-center">
                    PIN must be exactly 6 digits and will be used for withdrawal verification.
                  </p>
                </div>

                <div>
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="bg-gradient-to-r hover:bg-gradient-to-l bg-lime-600 hover:bg-lime-500 !text-gray-100 py-4 to-rose-600 text-white w-[100%] p-2 rounded-[10px] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (hasPin ? 'Updating...' : 'Setting...') : (hasPin ? 'Update PIN' : 'Set PIN')}
                  </button>
                </div>
              </form>
            )}
          </div>

          
        </div>
      </div>
    </div>
  );
};

export default WithdrawPin;
