import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { notify } from '@/utils/notifications';
import BottomNavigation from '../components/BottomNavigation';
import PageHeader from '../components/PageHeader';

const ProfileSettings = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    phoneNumber: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      
      try {
        // Fetch fresh user data from database
        const { data: userData, error } = await supabase
          .from('users')
          .select('full_name, username, pay_id')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching user data:', error);
          notify.error('Failed to load user data');
          return;
        }

        if (userData) {
          setFormData({
            fullName: userData.full_name || '',
            username: userData.username || '',
            email: '', // We don't store email in our custom users table
            phoneNumber: '' // We don't have phone number field yet
          });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        notify.error('Failed to load user data');
      }
    };

    fetchUserData();
  }, [user]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      notify.error('Please login first');
      return;
    }

    if (!formData.fullName.trim()) {
      notify.warning('Please enter your full name');
      return;
    }

    setLoading(true);
    const loadingToast = notify.loading('Updating profile...');
    
    try {
      const { error } = await supabase
        .from('users')
        .update({
          full_name: formData.fullName,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      notify.dismiss(loadingToast);

      if (error) {
        console.error('Profile update error:', error);
        notify.error('Failed to update profile. Please try again.');
        return;
      }

      notify.success('Profile updated successfully!');
      
      // Update the auth context with new data
      const updatedUser = {
        ...user,
        full_name: formData.fullName
      };
      localStorage.setItem('tradebull_user', JSON.stringify(updatedUser));
      
    } catch (error) {
      notify.dismiss(loadingToast);
      console.error('Profile update error:', error);
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
            <PageHeader title="Profile Settings" />

            {/* Profile Settings Form */}
            <div className="container mx-auto px-[8px] backdrop-blur overflow-y-auto h-[calc(100vh-154px)] pt-[30px]">
              <form className="grid grid-cols-1" onSubmit={handleSubmit}>
                <div className="w-[100%]">
                  <div className="relative">
                    <label htmlFor="fullName" className="block mb-2 text-sm font-medium text-gray-200 text-lime-500 absolute left-[20px] top-[-10px] z-[1] px-2 bg-black uppercase">
                      Full Name
                    </label>
                    <div className="relative mb-3">
                      <input 
                        className="placeholder:text-gray-400 !text-lime-500 border-[1.5px] !border-lime-500 py-[17px] !rounded-[10px] !bg-transparent autofill:bg-autofillBg bg-transparent border hover:border-lime-500 focus:border-lime-500 focus:outline-0 text-gray-200 focus:text-gray-200 text-sm rounded-md focus:ring-rose-500 block w-full p-2.5" 
                        type="text" 
                        placeholder="enter your fullname" 
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>

                <div className="w-[100%]">
                  <div className="relative">
                    <label htmlFor="username" className="block mb-2 text-sm font-medium text-gray-200 text-lime-500 absolute left-[20px] top-[-10px] z-[1] px-2 bg-black uppercase">
                      Username
                    </label>
                    <div className="relative mb-3">
                      <input 
                        className="placeholder:text-gray-400 !text-lime-500 border-[1.5px] !border-lime-500 py-[17px] !rounded-[10px] !bg-transparent autofill:bg-autofillBg bg-transparent border hover:border-lime-500 focus:border-lime-500 focus:outline-0 text-gray-200 focus:text-gray-200 text-sm rounded-md focus:ring-rose-500 block w-full p-2.5" 
                        type="text" 
                        placeholder="enter your username" 
                        name="username"
                        value={formData.username}
                        readOnly
                        title="Username cannot be changed"
                      />
                    </div>
                  </div>
                </div>

                <div className="w-[100%]">
                  <div className="relative">
                    <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-200 text-lime-500 absolute left-[20px] top-[-10px] z-[1] px-2 bg-black uppercase">
                      Pay ID
                    </label>
                    <div className="relative mb-3">
                      <input 
                        className="placeholder:text-gray-400 !text-lime-500 border-[1.5px] !border-lime-500 py-[17px] !rounded-[10px] !bg-transparent autofill:bg-autofillBg bg-transparent border hover:border-lime-500 focus:border-lime-500 focus:outline-0 text-gray-200 focus:text-gray-200 text-sm rounded-md focus:ring-rose-500 block w-full p-2.5" 
                        type="text" 
                        placeholder="Your Pay ID" 
                        name="payId"
                        value={user?.pay_id || ''}
                        readOnly
                        title="Pay ID cannot be changed"
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
                    {loading ? 'Updating...' : 'Update Data'}
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

export default ProfileSettings;
