import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTransactions: 0,
    totalDeposit: 0,
    pendingDeposit: 0,
    totalWithdraw: 0,
    pendingWithdraw: 0,
    pendingDepositCount: 0,
    pendingWithdrawCount: 0,
    todayTransfer: 0,
    totalTransfer: 0
  });
  const [currencySymbol, setCurrencySymbol] = useState('$');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
    fetchCurrencySymbol();
    
    // Set up real-time subscription for transactions
    const channel = supabase
      .channel('admin-dashboard-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions'
        },
        () => {
          // Refresh stats when transactions change
          fetchDashboardStats();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'deposits'
        },
        () => {
          fetchDashboardStats();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'withdrawals'
        },
        () => {
          fetchDashboardStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchCurrencySymbol = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('currency_symbol')
        .single();

      if (error) {
        console.error('Error fetching currency symbol:', error);
        return;
      }

      if (data && data.currency_symbol) {
        setCurrencySymbol(data.currency_symbol);
      }
    } catch (error) {
      console.error('Error fetching currency symbol:', error);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);

      // Fetch total users
      const { count: totalUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      // Fetch total transactions
      const { count: totalTransactions } = await supabase
        .from('transactions')
        .select('*', { count: 'exact', head: true });

      // Fetch deposit stats with proper error handling
      const { data: depositData, error: depositError } = await supabase
        .from('deposits')
        .select('amount, status');

      if (depositError) {
        console.error('Error fetching deposits:', depositError);
      }

      console.log('Deposit data:', depositData);

      let totalDeposit = 0;
      let pendingDeposit = 0;
      let pendingDepositCount = 0;

      if (depositData && Array.isArray(depositData)) {
        depositData.forEach(deposit => {
          const amount = Number(deposit.amount) || 0;
          if (deposit.status === 'completed' || deposit.status === 'approved') {
            totalDeposit += amount;
          } else if (deposit.status === 'pending') {
            pendingDeposit += amount;
            pendingDepositCount++;
          }
        });
      }

      // Fetch withdrawal stats
      const { data: withdrawalData, error: withdrawError } = await supabase
        .from('withdrawals')
        .select('amount, status');

      if (withdrawError) {
        console.error('Error fetching withdrawals:', withdrawError);
      }

      let totalWithdraw = 0;
      let pendingWithdraw = 0;
      let pendingWithdrawCount = 0;

      if (withdrawalData && Array.isArray(withdrawalData)) {
        withdrawalData.forEach(withdrawal => {
          const amount = Number(withdrawal.amount) || 0;
          if (withdrawal.status === 'complete' || withdrawal.status === 'completed') {
            totalWithdraw += amount;
          } else if (withdrawal.status === 'pending') {
            pendingWithdraw += amount;
            pendingWithdrawCount++;
          }
        });
      }

      // Fetch transfer stats from transactions table
      const { data: transferData } = await supabase
        .from('transactions')
        .select('amount, created_at, status')
        .eq('type', 'transfer')
        .eq('status', 'completed');

      const totalTransfer = transferData?.reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0) || 0;
      
      // Calculate today's transfers
      const today = new Date().toISOString().split('T')[0];
      const todayTransfer = transferData?.filter(t => 
        t.created_at.startsWith(today)
      ).reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0) || 0;

      console.log('Stats calculated:', {
        totalDeposit,
        pendingDeposit,
        pendingDepositCount,
        totalWithdraw,
        pendingWithdraw,
        pendingWithdrawCount
      });

      setStats({
        totalUsers: totalUsers || 0,
        totalTransactions: totalTransactions || 0,
        totalDeposit,
        pendingDeposit,
        totalWithdraw,
        pendingWithdraw,
        pendingDepositCount,
        pendingWithdrawCount,
        todayTransfer,
        totalTransfer
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePendingDepositClick = () => {
    navigate('/admin/deposit/pending');
  };

  const handlePendingWithdrawClick = () => {
    navigate('/admin/withdraw/pending');
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
    <AdminLayout>
      <div className="mx-[8px] mt-2">
        {/* Pending Alerts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          {/* Pending Deposit Alert */}
          {stats.pendingDepositCount > 0 && (
            <div className="card">
              <div className="card-body bg-white shadow-md shadow-gray-700/10 p-3 rounded-[10px]">
                <div className="flex justify-end gap-2">
                  <button 
                    className="btn btn-sm bg-green-500 hover:bg-green-600 border-green-500 hover:border-green-600 text-white w-auto cursor-pointer"
                    onClick={handlePendingDepositClick}
                  >
                    <i className="fi fi-br-loading leading-[0px] animate-spin"></i> 
                    <span>Pending Deposit ({stats.pendingDepositCount})</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Pending Withdraw Alert */}
          {stats.pendingWithdrawCount > 0 && (
            <div className="card">
              <div className="card-body bg-white shadow-md shadow-gray-700/10 p-3 rounded-[10px]">
                <div className="flex justify-end gap-2">
                  <button 
                    className="btn btn-sm bg-orange-500 hover:bg-orange-600 border-orange-500 hover:border-orange-600 text-white w-auto cursor-pointer"
                    onClick={handlePendingWithdrawClick}
                  >
                    <i className="fi fi-br-loading leading-[0px] animate-spin"></i> 
                    <span>Pending Withdraw ({stats.pendingWithdrawCount})</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Dashboard Stats Grid */}
        <div className="grid grid-cols md:grid-cols-2 lg:grid-cols-4 gap-2">
          {/* Total Users */}
          <div className="flex items-center bg-white rounded-lg w-[100%] p-4 shadow-md shadow-gray-700/10">
            <div className="flex-auto">
              <h1 className="text-rose-700/80 text-md">Total Users</h1>
              <h1 className="text-rose-700 font-bold text-md">{stats.totalUsers}</h1>
            </div>
            <div>
              <img className="w-[50px] h-[50px] rounded-[10px]" src="https://cdn-icons-gif.flaticon.com/11186/11186790.gif" alt="Total Users" />
            </div>
          </div>

          {/* Total Transactions */}
          <div className="flex items-center bg-white rounded-lg w-[100%] p-4 shadow-md shadow-gray-700/10">
            <div className="flex-auto">
              <h1 className="text-rose-700/80 text-md">Total Transactions</h1>
              <h1 className="text-rose-700 font-bold text-md">{stats.totalTransactions}</h1>
            </div>
            <div>
              <img className="w-[50px] h-[50px] rounded-[10px]" src="https://cdn-icons-gif.flaticon.com/11677/11677583.gif" alt="Total Transactions" />
            </div>
          </div>

          {/* Total Deposit */}
          <div className="flex items-center bg-white rounded-lg w-[100%] p-4 shadow-md shadow-gray-700/10">
            <div className="flex-auto">
              <h1 className="text-rose-700/80 text-md">Total Deposit</h1>
              <h1 className="text-rose-700 font-bold text-md">{currencySymbol} {stats.totalDeposit.toFixed(2)}</h1>
            </div>
            <div>
              <img className="w-[50px] h-[50px] rounded-[10px]" src="https://cdn-icons-gif.flaticon.com/12147/12147279.gif" alt="Total Deposit" />
            </div>
          </div>

          {/* Pending Deposit */}
          <div className="flex items-center bg-white rounded-lg w-[100%] p-4 shadow-md shadow-gray-700/10">
            <div className="flex-auto">
              <h1 className="text-rose-700/80 text-md">Pending Deposit</h1>
              <h1 className="text-rose-700 font-bold text-md">{currencySymbol} {stats.pendingDeposit.toFixed(2)}</h1>
            </div>
            <div>
              <img className="w-[50px] h-[50px] rounded-[10px]" src="https://cdn-icons-gif.flaticon.com/12147/12147282.gif" alt="Pending Deposit" />
            </div>
          </div>

          {/* Total Withdraw */}
          <div className="flex items-center bg-white rounded-lg w-[100%] p-4 shadow-md shadow-gray-700/10">
            <div className="flex-auto">
              <h1 className="text-rose-700/80 text-md">Total Withdraw</h1>
              <h1 className="text-rose-700 font-bold text-md">{currencySymbol} {stats.totalWithdraw.toFixed(2)}</h1>
            </div>
            <div>
              <img className="w-[50px] h-[50px] rounded-[10px]" src="https://cdn-icons-gif.flaticon.com/12417/12417289.gif" alt="Total Withdraw" />
            </div>
          </div>

          {/* Pending Withdraw */}
          <div className="flex items-center bg-white rounded-lg w-[100%] p-4 shadow-md shadow-gray-700/10">
            <div className="flex-auto">
              <h1 className="text-rose-700/80 text-md">Pending Withdraw</h1>
              <h1 className="text-rose-700 font-bold text-md">{currencySymbol} {stats.pendingWithdraw.toFixed(2)}</h1>
            </div>
            <div>
              <img className="w-[50px] h-[50px] rounded-[10px]" src="https://cdn-icons-gif.flaticon.com/12764/12764470.gif" alt="Pending Withdraw" />
            </div>
          </div>

          {/* Today Transfer */}
          <div className="flex items-center bg-white rounded-lg w-[100%] p-4 shadow-md shadow-gray-700/10">
            <div className="flex-auto">
              <h1 className="text-rose-700/80 text-md">Today Transfer</h1>
              <h1 className="text-rose-700 font-bold text-md">{currencySymbol} {stats.todayTransfer.toFixed(2)}</h1>
            </div>
            <div>
              <img className="w-[50px] h-[50px] rounded-[10px]" src="https://cdn-icons-gif.flaticon.com/13971/13971366.gif" alt="Today Transfer" />
            </div>
          </div>

          {/* Total Transfer */}
          <div className="flex items-center bg-white rounded-lg w-[100%] p-4 shadow-md shadow-gray-700/10">
            <div className="flex-auto">
              <h1 className="text-rose-700/80 text-md">Total Transfer</h1>
              <h1 className="text-rose-700 font-bold text-md">{currencySymbol} {stats.totalTransfer.toFixed(2)}</h1>
            </div>
            <div>
              <img className="w-[50px] h-[50px] rounded-[10px]" src="https://cdn-icons-gif.flaticon.com/12147/12147276.gif" alt="Total Transfer" />
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
