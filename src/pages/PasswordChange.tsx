
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { notify } from '@/utils/notifications';
import BottomNavigation from '../components/BottomNavigation';

const PasswordChange = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);

  const handleBackClick = () => {
    window.history.back();
  };

  const handleLogout = () => {
    console.log('Logout clicked');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const hashPassword = async (password: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
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
    if (!formData.newPassword || !formData.confirmPassword) {
      notify.error('Please fill in all fields');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      notify.error('New passwords do not match');
      return;
    }

    if (formData.newPassword.length < 6) {
      notify.error('New password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    const loadingToast = notify.loading('Updating password...');
    
    try {
      // Hash new password and update
      const newPasswordHash = await hashPassword(formData.newPassword);
      
      const { error } = await supabase
        .from('users')
        .update({
          password_hash: newPasswordHash,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      notify.dismiss(loadingToast);

      if (error) {
        console.error('Password update error:', error);
        notify.error('Failed to update password. Please try again.');
        return;
      }

      notify.success('Password updated successfully!');
      
      // Clear form
      setFormData({
        newPassword: '',
        confirmPassword: ''
      });
      
    } catch (error) {
      notify.dismiss(loadingToast);
      console.error('Password update error:', error);
      notify.error('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      
      <div className="relative min-h-[100vh] bg-black mx-auto max-w-[480px] overflow-y-hidden">
        <div className="min-h-[100vh] pt-[0px] pb-[63px]">
          <div className="relative z-[1]">
           
           

            {/* Header */}
            <div className="relative overflow-hidden mb-[10px]">
              <div className="p-[15px] relative z-[2] rounded-b-[30px]">
                <div className="flex gap-3 items-center justify-between">
                  <div className="flex gap-2 items-center bg-black/20 border border-gray-500/50 backdrop-blur rounded-full px-[20px] h-[48px]">
                    <div>
                      <img 
                        className="w-[18px] backBtn cursor-pointer" 
                        src="https://cdn-icons-png.flaticon.com/128/507/507257.png" 
                        alt="Back"
                        onClick={handleBackClick}
                      />
                    </div>
                    <h1 className="text-white font-bold">Change Password</h1>
                  </div>
                  <div className="flex gap-2 items-center bg-black/20 border border-gray-500/50 backdrop-blur rounded-full">
                    <img 
                      className="w-[48px] h-[48px] aspect-square border border-gray-500/50 rounded-full" 
                      src="https://img.freepik.com/premium-photo/3d-cartoon-avatar-man-minimal-3d-character_652053-2070.jpg" 
                      alt="Profile"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Password Change Form */}
            <div className="container mx-auto px-[8px] backdrop-blur overflow-auto h-[calc(100vh-154px)] pt-[30px] rounded-t-[20px]">
              <form className="grid grid-cols-1" onSubmit={handleSubmit}>
                <div className="w-[100%]">
                  <div className="relative">
                    <label htmlFor="newPassword" className="block mb-2 text-sm font-medium text-gray-200 text-lime-500 absolute left-[20px] top-[-10px] z-[1] px-2 bg-black uppercase">
                      New Password
                    </label>
                    <div className="relative mb-3">
                      <input 
                        className="placeholder:text-gray-400 !text-lime-500 border-[1.5px] !border-lime-500 py-[17px] !rounded-[10px] !bg-transparent autofill:bg-autofillBg bg-transparent border hover:border-lime-500 focus:border-lime-500 focus:outline-0 text-gray-200 focus:text-gray-200 text-sm rounded-md focus:ring-rose-500 block w-full p-2.5" 
                        type="password" 
                        placeholder="enter new password" 
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleInputChange}
                        required
                        minLength={6}
                      />
                    </div>
                  </div>
                </div>

                <div className="w-[100%]">
                  <div className="relative">
                    <label htmlFor="confirmPassword" className="block mb-2 text-sm font-medium text-gray-200 text-lime-500 absolute left-[20px] top-[-10px] z-[1] px-2 bg-black uppercase">
                      Confirm New Password
                    </label>
                    <div className="relative mb-3">
                      <input 
                        className="placeholder:text-gray-400 !text-lime-500 border-[1.5px] !border-lime-500 py-[17px] !rounded-[10px] !bg-transparent autofill:bg-autofillBg bg-transparent border hover:border-lime-500 focus:border-lime-500 focus:outline-0 text-gray-200 focus:text-gray-200 text-sm rounded-md focus:ring-rose-500 block w-full p-2.5" 
                        type="password" 
                        placeholder="confirm new password" 
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="bg-gradient-to-r hover:bg-gradient-to-l bg-lime-600 hover:bg-lime-500 !text-gray-100 py-4 to-rose-600 text-white w-[100%] p-2 rounded-[10px] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            </div>

            
          </div>
        </div>
      </div>
    </>
  );
};

export default PasswordChange;
