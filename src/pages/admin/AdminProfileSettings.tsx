import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { notify } from '@/utils/notifications';
import AdminLayout from '@/components/admin/AdminLayout';

interface AdminProfile {
  id: string;
  username: string;
  full_name: string | null;
  email: string | null;
}

const AdminProfileSettings = () => {
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    username: '',
    email: ''
  });
  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    fetchAdminProfile();
  }, []);

  const fetchAdminProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('admin_users')
        .select('id, username, full_name, email')
        .single();

      if (error) throw error;
      
      setProfile(data);
      setProfileForm({
        full_name: data.full_name || '',
        username: data.username || '',
        email: data.email || ''
      });
    } catch (error) {
      console.error('Error fetching admin profile:', error);
      notify.error('Failed to fetch profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileInputChange = (field: string, value: string) => {
    setProfileForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePasswordInputChange = (field: string, value: string) => {
    setPasswordForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateProfile = async () => {
    if (!profile) return;

    if (!profileForm.full_name || !profileForm.username || !profileForm.email) {
      notify.error('Please fill all profile fields');
      return;
    }

    try {
      const { error } = await supabase
        .from('admin_users')
        .update({
          full_name: profileForm.full_name,
          username: profileForm.username,
          email: profileForm.email,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id);

      if (error) throw error;
      
      notify.success('Profile updated successfully!');
      fetchAdminProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      notify.error('Failed to update profile');
    }
  };

  const hashPassword = async (password: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  };

  const updatePassword = async () => {
    if (!profile) return;

    if (!passwordForm.newPassword || !passwordForm.confirmPassword) {
      notify.error('Please fill both password fields');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      notify.error('Passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      notify.error('Password must be at least 6 characters long');
      return;
    }

    try {
      const passwordHash = await hashPassword(passwordForm.newPassword);
      
      const { error } = await supabase
        .from('admin_users')
        .update({
          password_hash: passwordHash,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id);

      if (error) throw error;
      
      notify.success('Password updated successfully!');
      setPasswordForm({ newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error('Error updating password:', error);
      notify.error('Failed to update password');
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
              <h1 className="font-bold text-[20px] text-rose-500">Admin Profile Setting</h1>
              <h1 className="font-bold text-[14px] text-gray-400">Manage Admin Profile Settings from Here</h1>
            </div>
          </div>

          <div className="card shadow-md shadow-rose-500/40 bg-white">
            <div className="card-body p-3">
              <h1 className="text-20px font-bold text-rose-500">Profile Setting</h1>
              
              <div className="grid grid-cols grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mb-3 mt-1">
                <div>
                  <div className="relative">
                    <label htmlFor="Name" className="block mb-2 text-sm font-medium text-rose-500">Name</label>
                    <div className="relative mb-3">
                      <input
                        className="text-gray-600 focus:text-gray-600 border-2 border-rose-400 hover:border-rose-500 focus:border-rose-500 focus:ring-rose-500 bg-transparent text-sm rounded-md block w-full p-2.5"
                        type="text"
                        placeholder="Enter Name"
                        value={profileForm.full_name}
                        onChange={(e) => handleProfileInputChange('full_name', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <div className="relative">
                    <label htmlFor="Username" className="block mb-2 text-sm font-medium text-rose-500">Username</label>
                    <div className="relative mb-3">
                      <input
                        className="text-gray-600 focus:text-gray-600 border-2 border-rose-400 hover:border-rose-500 focus:border-rose-500 focus:ring-rose-500 bg-transparent text-sm rounded-md block w-full p-2.5"
                        type="text"
                        placeholder="Enter Username"
                        value={profileForm.username}
                        onChange={(e) => handleProfileInputChange('username', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <div className="relative">
                    <label htmlFor="Email" className="block mb-2 text-sm font-medium text-rose-500">Email</label>
                    <div className="relative mb-3">
                      <input
                        className="text-gray-600 focus:text-gray-600 border-2 border-rose-400 hover:border-rose-500 focus:border-rose-500 focus:ring-rose-500 bg-transparent text-sm rounded-md block w-full p-2.5"
                        type="email"
                        placeholder="Enter Email"
                        value={profileForm.email}
                        onChange={(e) => handleProfileInputChange('email', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="bg-gradient-to-r hover:bg-gradient-to-l from-rose-500 to-rose-600 text-white w-[100%] p-2 rounded-[10px] mb-2"
                onClick={updateProfile}
              >
                Update Information
              </button>

              <h1 className="text-20px font-bold text-rose-500">Password Setting</h1>
              
              <div className="grid grid-cols grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mb-3 mt-1">
                <div>
                  <div className="relative">
                    <label htmlFor="New Password" className="block mb-2 text-sm font-medium text-rose-500">New Password</label>
                    <div className="relative mb-3">
                      <input
                        className="text-gray-600 focus:text-gray-600 border-2 border-rose-400 hover:border-rose-500 focus:border-rose-500 focus:ring-rose-500 bg-transparent text-sm rounded-md block w-full p-2.5"
                        type="password"
                        placeholder="Enter New Password"
                        value={passwordForm.newPassword}
                        onChange={(e) => handlePasswordInputChange('newPassword', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <div className="relative">
                    <label htmlFor="New Password Again" className="block mb-2 text-sm font-medium text-rose-500">New Password Again</label>
                    <div className="relative mb-3">
                      <input
                        className="text-gray-600 focus:text-gray-600 border-2 border-rose-400 hover:border-rose-500 focus:border-rose-500 focus:ring-rose-500 bg-transparent text-sm rounded-md block w-full p-2.5"
                        type="password"
                        placeholder="Enter New Password Again"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => handlePasswordInputChange('confirmPassword', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="bg-gradient-to-r hover:bg-gradient-to-l from-rose-500 to-rose-600 text-white w-[100%] p-2 rounded-[10px] mb-2"
                onClick={updatePassword}
              >
                Update Password
              </button>
            </div>
          </div>
        </div>
      </AdminLayout>
    </>
  );
};

export default AdminProfileSettings;
