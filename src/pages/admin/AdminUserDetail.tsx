
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { notify } from '@/utils/notifications';
import AdminLayout from '@/components/admin/AdminLayout';

interface User {
  id: string;
  username: string;
  full_name: string | null;
  balance: number;
  pay_id: string | null;
  created_at: string;
  password_hash: string;
}

interface UserStats {
  totalDeposits: number;
  totalWithdrawals: number;
}

const AdminUserDetail = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [userStats, setUserStats] = useState<UserStats>({ totalDeposits: 0, totalWithdrawals: 0 });
  const [loading, setLoading] = useState(true);
  
  // Individual loading states for each button
  const [addBalanceLoading, setAddBalanceLoading] = useState(false);
  const [subtractBalanceLoading, setSubtractBalanceLoading] = useState(false);
  const [updateInfoLoading, setUpdateInfoLoading] = useState(false);
  const [updatePasswordLoading, setUpdatePasswordLoading] = useState(false);
  
  // Form states
  const [balanceAdd, setBalanceAdd] = useState('');
  const [balanceSubtract, setBalanceSubtract] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [accountStatus, setAccountStatus] = useState('active');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (userId) {
      fetchUserDetails();
      fetchUserStats();
    }
  }, [userId]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      
      setUser(data);
      setFullName(data.full_name || '');
      setEmail('');
    } catch (error) {
      console.error('Error fetching user details:', error);
      notify.error('Failed to fetch user details');
      navigate('/admin/users');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      // Fetch deposits
      const { data: deposits, error: depositsError } = await supabase
        .from('deposits')
        .select('amount')
        .eq('user_id', userId)
        .eq('status', 'completed');

      if (depositsError) throw depositsError;

      // Fetch withdrawals
      const { data: withdrawals, error: withdrawalsError } = await supabase
        .from('withdrawals')
        .select('amount')
        .eq('user_id', userId)
        .eq('status', 'completed');

      if (withdrawalsError) throw withdrawalsError;

      const totalDeposits = deposits?.reduce((sum, deposit) => sum + Number(deposit.amount), 0) || 0;
      const totalWithdrawals = withdrawals?.reduce((sum, withdrawal) => sum + Number(withdrawal.amount), 0) || 0;

      setUserStats({ totalDeposits, totalWithdrawals });
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const handleBalanceAdd = async () => {
    if (!balanceAdd || Number(balanceAdd) <= 0) {
      notify.error('Please enter a valid amount to add');
      return;
    }

    try {
      setAddBalanceLoading(true);
      const newBalance = Number(user?.balance || 0) + Number(balanceAdd);
      
      const { error } = await supabase
        .from('users')
        .update({ balance: newBalance })
        .eq('id', userId);

      if (error) throw error;

      // Create transaction record
      await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          type: 'admin_credit',
          amount: Number(balanceAdd),
          description: 'Balance added by admin',
          status: 'completed'
        });

      notify.success(`Successfully added $${balanceAdd} to user balance!`);
      setBalanceAdd('');
      fetchUserDetails();
    } catch (error) {
      console.error('Error adding balance:', error);
      notify.error('Failed to add balance');
    } finally {
      setAddBalanceLoading(false);
    }
  };

  const handleBalanceSubtract = async () => {
    if (!balanceSubtract || Number(balanceSubtract) <= 0) {
      notify.error('Please enter a valid amount to subtract');
      return;
    }

    if (Number(balanceSubtract) > Number(user?.balance || 0)) {
      notify.error('Cannot subtract more than current balance');
      return;
    }

    try {
      setSubtractBalanceLoading(true);
      const newBalance = Number(user?.balance || 0) - Number(balanceSubtract);
      
      const { error } = await supabase
        .from('users')
        .update({ balance: newBalance })
        .eq('id', userId);

      if (error) throw error;

      // Create transaction record
      await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          type: 'admin_debit',
          amount: Number(balanceSubtract),
          description: 'Balance subtracted by admin',
          status: 'completed'
        });

      notify.success(`Successfully subtracted $${balanceSubtract} from user balance!`);
      setBalanceSubtract('');
      fetchUserDetails();
    } catch (error) {
      console.error('Error subtracting balance:', error);
      notify.error('Failed to subtract balance');
    } finally {
      setSubtractBalanceLoading(false);
    }
  };

  const handleUpdateInformation = async () => {
    try {
      setUpdateInfoLoading(true);
      const { error } = await supabase
        .from('users')
        .update({ 
          full_name: fullName,
        })
        .eq('id', userId);

      if (error) throw error;
      notify.success('User information updated successfully!');
      fetchUserDetails();
    } catch (error) {
      console.error('Error updating information:', error);
      notify.error('Failed to update information');
    } finally {
      setUpdateInfoLoading(false);
    }
  };

  const hashPassword = async (password: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handlePasswordUpdate = async () => {
    if (!newPassword || !confirmPassword) {
      notify.error('Please fill in both password fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      notify.error('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      notify.error('Password must be at least 6 characters long');
      return;
    }

    try {
      setUpdatePasswordLoading(true);
      const passwordHash = await hashPassword(newPassword);
      
      const { error } = await supabase
        .from('users')
        .update({ password_hash: passwordHash })
        .eq('id', userId);

      if (error) throw error;
      notify.success('Password updated successfully!');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Error updating password:', error);
      notify.error('Failed to update password');
    } finally {
      setUpdatePasswordLoading(false);
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

  if (!user) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-rose-700">User not found</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <>
      
      <AdminLayout>
        <div className="mx-[8px] mt-2">
          <div className="flex justify-center items-center rounded-lg text-white bg-rose-600 shadow-md shadow-rose-700/50 p-2 mb-3">
            <div className="flex-auto flex items-center">
              <i className="fi fi-sr-user leading-[0px]"></i>
              <h1 className="flex-auto text-sm font-bold ps-2">User Detail - {user.username}</h1>
              <a 
                href={`/admin/users`} 
                className="flex gap-2 items-center text-nowrap bg-white rounded-full px-2 py-[2px] text-[12px] font-bold text-rose-500"
              >
                <i className="fi fi-sr-arrow-left leading-[0]"></i> Back to Users
              </a>
            </div>
          </div>

          <div className="grid grid-cols grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2 mb-3">
            <div className="flex items-center bg-white rounded-lg w-[100%] p-4 shadow-md shadow-gray-700/10">
              <div className="flex-auto">
                <h1 className="text-rose-700/80 text-md">Balance</h1>
                <h1 className="text-rose-700 font-bold text-md">${user.balance}</h1>
              </div>
              <div className="">
                <img 
                  className="w-[50px] h-[50px] rounded-[10px] hue-rotate-[179deg] saturate-[5]" 
                  src="https://cdn-icons-gif.flaticon.com/7994/7994407.gif" 
                  alt="balance gif"
                />
              </div>
            </div>
            <div className="flex items-center bg-white rounded-lg w-[100%] p-4 shadow-md shadow-gray-700/10">
              <div className="flex-auto">
                <h1 className="text-rose-700/80 text-md">Deposits</h1>
                <h1 className="text-rose-700 font-bold text-md">${userStats.totalDeposits}</h1>
              </div>
              <div className="">
                <img 
                  className="w-[50px] h-[50px] rounded-[10px] hue-rotate-[179deg] saturate-[5]" 
                  src="https://cdn-icons-gif.flaticon.com/11259/11259489.gif" 
                  alt="deposit gif"
                />
              </div>
            </div>
            <div className="flex items-center bg-white rounded-lg w-[100%] p-4 shadow-md shadow-gray-700/10">
              <div className="flex-auto">
                <h1 className="text-rose-700/80 text-md">Withdrawals</h1>
                <h1 className="text-rose-700 font-bold text-md">${userStats.totalWithdrawals}</h1>
              </div>
              <div className="">
                <img 
                  className="w-[50px] h-[50px] rounded-[10px] hue-rotate-[179deg] saturate-[5]" 
                  src="https://cdn-icons-gif.flaticon.com/7994/7994400.gif" 
                  alt="withdraw gif"
                />
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 md:gap-3">
            <div className="items-center bg-white rounded-lg w-[100%] p-2 shadow-md shadow-gray-700/10 mb-3">
              <h1 className="text-rose-500/80 font-bold text-md border-b-2 border-rose-500">Balance Add/Subtract</h1>
              <div className="flex mt-3">
                <div className="flex-auto">
                  <div className="relative">
                    <div className="relative mb-3">
                      <input 
                        className="text-gray-600 focus:text-gray-600 border-2 border-green-400 hover:border-green-500 focus:border-green-500 focus:ring-rose-500 bg-transparent border hover:border-lime-500 focus:border-lime-500 focus:outline-0 text-gray-200 focus:text-gray-200 text-sm rounded-md focus:ring-rose-500 block w-full p-2.5" 
                        type="number" 
                        placeholder="Enter amount to add" 
                        value={balanceAdd}
                        onChange={(e) => setBalanceAdd(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <button 
                  type="button" 
                  className="bg-gradient-to-r hover:bg-gradient-to-l from-green-500 to-green-400 text-white w-[100%] p-2 rounded-[10px] w-[100px] h-[42px] flex items-center justify-center gap-1 disabled:opacity-50"
                  onClick={handleBalanceAdd}
                  disabled={addBalanceLoading}
                >
                  Add <i className="fi fi-sr-add leading-[0px]"></i>
                </button>
              </div>
              <div className="flex mt-3">
                <div className="flex-auto">
                  <div className="relative">
                    <div className="relative mb-3">
                      <input 
                        className="text-gray-600 focus:text-gray-600 border-2 border-rose-400 hover:border-rose-500 focus:border-rose-500 focus:ring-rose-500 bg-transparent border hover:border-lime-500 focus:border-lime-500 focus:outline-0 text-gray-200 focus:text-gray-200 text-sm rounded-md focus:ring-rose-500 block w-full p-2.5" 
                        type="number" 
                        placeholder="Enter amount to subtract" 
                        value={balanceSubtract}
                        onChange={(e) => setBalanceSubtract(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <button 
                  type="button" 
                  className="bg-gradient-to-r hover:bg-gradient-to-l from-rose-600 to-rose-500 text-white w-[100%] p-2 rounded-[10px] w-[100px] h-[42px] flex items-center justify-center gap-1 disabled:opacity-50"
                  onClick={handleBalanceSubtract}
                  disabled={subtractBalanceLoading}
                >
                  Sub <i className="fi fi-sr-minus-circle leading-[0px]"></i>
                </button>
              </div>
            </div>

            <div className="md:col-span-2 items-center bg-white rounded-lg w-[100%] p-2 shadow-md shadow-gray-700/10 mb-3">
              <div>
                <h1 className="text-rose-500/80 font-bold text-md border-b-2 border-rose-500">
                  Information of <span className="text-rose-600">{user.username}</span>
                </h1>
                <div className="grid grid-cols grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 my-3">
                  <div>
                    <div className="relative">
                      <label htmlFor="Full Name" className="block mb-2 text-sm font-medium text-gray-200 text-rose-500">Full Name</label>
                      <div className="relative mb-3">
                        <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
                          <i className="fi fi-sr-user text-rose-700/80 leading-[0px]"></i>
                        </div>
                        <input 
                          className="text-gray-600 focus:text-gray-600 border-2 border-rose-400 hover:border-rose-500 focus:border-rose-500 focus:ring-rose-500 bg-transparent border hover:border-lime-500 focus:border-lime-500 focus:outline-0 text-gray-200 focus:text-gray-200 text-sm rounded-md focus:ring-rose-500 block w-full ps-10 p-2.5" 
                          type="text" 
                          placeholder="Enter Full Name" 
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="relative">
                      <label htmlFor="Email" className="block mb-2 text-sm font-medium text-gray-200 text-rose-500">Email</label>
                      <div className="relative mb-3">
                        <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
                          <i className="fi fi-sr-envelope text-rose-700/80 leading-[0px]"></i>
                        </div>
                        <input 
                          className="text-gray-600 focus:text-gray-600 border-2 border-rose-400 hover:border-rose-500 focus:border-rose-500 focus:ring-rose-500 bg-transparent border hover:border-lime-500 focus:border-lime-500 focus:outline-0 text-gray-200 focus:text-gray-200 text-sm rounded-md focus:ring-rose-500 block w-full ps-10 p-2.5" 
                          type="email" 
                          placeholder="Enter Email Address" 
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <div>
                      <label htmlFor="username" className="block mb-1 ms-1 text-[13px] font-medium text-gray-900 z-100">Account Status</label>
                      <select 
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-rose-500 focus:border-rose-500 block w-full p-2.5 mb-3 bg-green-500 text-white"
                        value={accountStatus}
                        onChange={(e) => setAccountStatus(e.target.value)}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                </div>
                <button 
                  type="button" 
                  className="bg-gradient-to-r hover:bg-gradient-to-l from-rose-500 to-rose-600 text-white w-[100%] p-2 rounded-[10px] mb-2 disabled:opacity-50"
                  onClick={handleUpdateInformation}
                  disabled={updateInfoLoading}
                >
                  Update Information
                </button>
              </div>
              <div className="mt-3">
                <h1 className="text-rose-500/80 font-bold text-md border-b-2 border-rose-500">Password Change Option</h1>
                <div className="grid grid-cols grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-2 my-3">
                  <div>
                    <div className="relative">
                      <label htmlFor="New Password" className="block mb-2 text-sm font-medium text-gray-200 text-rose-500">New Password</label>
                      <div className="relative mb-3">
                        <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
                          <i className="fi fi-sr-key text-rose-700/80 leading-[0px]"></i>
                        </div>
                        <input 
                          className="text-gray-600 focus:text-gray-600 border-2 border-rose-400 hover:border-rose-500 focus:border-rose-500 focus:ring-rose-500 bg-transparent border hover:border-lime-500 focus:border-lime-500 focus:outline-0 text-gray-200 focus:text-gray-200 text-sm rounded-md focus:ring-rose-500 block w-full ps-10 p-2.5" 
                          type="password" 
                          placeholder="Enter New Password" 
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="relative">
                      <label htmlFor="Confirm Password" className="block mb-2 text-sm font-medium text-gray-200 text-rose-500">Confirm Password</label>
                      <div className="relative mb-3">
                        <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
                          <i className="fi fi-sr-key text-rose-700/80 leading-[0px]"></i>
                        </div>
                        <input 
                          className="text-gray-600 focus:text-gray-600 border-2 border-rose-400 hover:border-rose-500 focus:border-rose-500 focus:ring-rose-500 bg-transparent border hover:border-lime-500 focus:border-lime-500 focus:outline-0 text-gray-200 focus:text-gray-200 text-sm rounded-md focus:ring-rose-500 block w-full ps-10 p-2.5" 
                          type="password" 
                          placeholder="Enter Confirm Password" 
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <button 
                  type="button" 
                  className="bg-gradient-to-r hover:bg-gradient-to-l from-rose-500 to-rose-600 text-white w-[100%] p-2 rounded-[10px] mb-2 disabled:opacity-50"
                  onClick={handlePasswordUpdate}
                  disabled={updatePasswordLoading}
                >
                  Update Password
                </button>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    </>
  );
};

export default AdminUserDetail;
