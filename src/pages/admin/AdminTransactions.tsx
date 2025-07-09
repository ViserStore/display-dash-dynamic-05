import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { notify } from '@/utils/notifications';
import AdminLayout from '@/components/admin/AdminLayout';

interface UnifiedTransaction {
  id: string;
  user_id: string;
  username?: string;
  type: string;
  amount: number;
  status: string;
  description: string;
  created_at: string;
  source_table: string;
}

const AdminTransactions = () => {
  const [transactions, setTransactions] = useState<UnifiedTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [currencySymbol, setCurrencySymbol] = useState('$');
  const itemsPerPage = 10;

  useEffect(() => {
    fetchSiteSettings();
    fetchAllTransactions();
  }, [currentPage, searchTerm]);

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

  const fetchAllTransactions = async () => {
    try {
      setLoading(true);
      
      const allTransactions: UnifiedTransaction[] = [];
      const userCache = new Map<string, string>();

      const fetchUsername = async (userId: string): Promise<string> => {
        if (userCache.has(userId)) {
          return userCache.get(userId)!;
        }
        
        const { data: userData } = await supabase
          .from('users')
          .select('username')
          .eq('id', userId)
          .single();
        
        const username = userData?.username || 'Unknown';
        userCache.set(userId, username);
        return username;
      };

      // Fetch from transactions table - EXCLUDE referral_bonus transactions
      const { data: transactionData, error: transactionError } = await supabase
        .from('transactions')
        .select('*')
        .neq('type', 'transfer')
        .neq('type', 'referral_bonus') // Filter out referral bonus transactions
        .ilike('description', `%${searchTerm}%`)
        .order('created_at', { ascending: false });

      if (transactionError) {
        console.error('Error fetching transactions:', transactionError);
      } else if (transactionData) {
        for (const tx of transactionData) {
          const username = await fetchUsername(tx.user_id);
          allTransactions.push({
            id: tx.id,
            user_id: tx.user_id,
            username,
            type: tx.type,
            amount: tx.amount,
            status: tx.status,
            description: tx.description || `${tx.type} transaction`,
            created_at: tx.created_at,
            source_table: 'transactions'
          });
        }
      }

      // Fetch from deposits table
      const { data: depositData, error: depositError } = await supabase
        .from('deposits')
        .select('*')
        .order('created_at', { ascending: false });

      if (depositError) {
        console.error('Error fetching deposits:', depositError);
      } else if (depositData) {
        for (const deposit of depositData) {
          const username = await fetchUsername(deposit.user_id);
          allTransactions.push({
            id: deposit.id,
            user_id: deposit.user_id,
            username,
            type: 'deposit',
            amount: deposit.amount,
            status: deposit.status,
            description: `Deposit - Transaction ID: ${deposit.transaction_id}`,
            created_at: deposit.created_at,
            source_table: 'deposits'
          });
        }
      }

      // Fetch from withdrawals table
      const { data: withdrawalData, error: withdrawalError } = await supabase
        .from('withdrawals')
        .select('*')
        .order('created_at', { ascending: false });

      if (withdrawalError) {
        console.error('Error fetching withdrawals:', withdrawalError);
      } else if (withdrawalData) {
        for (const withdrawal of withdrawalData) {
          const username = await fetchUsername(withdrawal.user_id);
          allTransactions.push({
            id: withdrawal.id,
            user_id: withdrawal.user_id,
            username,
            type: 'withdraw',
            amount: withdrawal.amount,
            status: withdrawal.status,
            description: `Withdrawal to ${withdrawal.payment_address}`,
            created_at: withdrawal.created_at,
            source_table: 'withdrawals'
          });
        }
      }

      // Fetch from trade_transactions table
      const { data: tradeData, error: tradeError } = await supabase
        .from('trade_transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (tradeError) {
        console.error('Error fetching trade transactions:', tradeError);
      } else if (tradeData) {
        for (const trade of tradeData) {
          const username = await fetchUsername(trade.user_id);
          allTransactions.push({
            id: trade.id,
            user_id: trade.user_id,
            username,
            type: trade.action === 'OPEN' ? 'trade_open' : 'trade_close',
            amount: trade.action === 'OPEN' ? -Math.abs(trade.amount) : (trade.profit_loss || trade.amount),
            status: trade.status,
            description: `Trade ${trade.action} | ${trade.symbol} = ${trade.price} | ${trade.trade_type}`,
            created_at: trade.created_at,
            source_table: 'trade_transactions'
          });
        }
      }

      // Sort all transactions by created_at descending
      allTransactions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      // Filter by search term if provided
      const filteredTransactions = searchTerm 
        ? allTransactions.filter(tx => 
            tx.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tx.description.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : allTransactions;
      
      // Calculate pagination
      const totalTransactions = filteredTransactions.length;
      const calculatedTotalPages = Math.ceil(totalTransactions / itemsPerPage);
      setTotalPages(calculatedTotalPages);
      
      // Get transactions for current page
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);
      
      setTransactions(paginatedTransactions);
    } catch (error) {
      console.error('Error fetching all transactions:', error);
      notify.error('Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount: number) => {
    const isPositive = amount >= 0;
    const formattedAmount = `${isPositive ? '+' : ''}${currencySymbol}${Math.abs(amount).toFixed(2)}`;
    const colorClass = isPositive ? 'text-green-500' : 'text-red-500';
    
    return { formattedAmount, colorClass };
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const renderPaginationNumbers = () => {
    const pages = [];
    const maxPagesToShow = 20;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    
    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <li key={i}>
          <span
            className={`flex items-center justify-center px-3 h-8 leading-tight border border-gray-300 cursor-pointer ${
              i === currentPage
                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                : 'bg-white hover:bg-gray-100 text-gray-500'
            }`}
            onClick={() => handlePageClick(i)}
          >
            {i}
          </span>
        </li>
      );
    }

    return pages;
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
              <h1 className="font-bold text-[20px] text-rose-500">All Transactions</h1>
              <h1 className="font-bold text-[14px] text-gray-400">Manage All Transactions from Here</h1>
            </div>
            <label className="input bg-rose-100 text-rose-500 font-bold input-bordered flex items-center gap-2 w-[300px]">
              <input
                type="text"
                className="grow placeholder-rose-500/50"
                placeholder="Search details"
                value={searchTerm}
                onChange={handleSearchChange}
              />
              <i className="fi fi-rr-search leading-[0px]"></i>
            </label>
          </div>

          <div className="flex justify-center items-center rounded-lg text-white bg-rose-600 shadow-md shadow-rose-700/50 p-2 mb-3">
            <div className="flex-auto flex items-center">
              <i className="fi fi-sr-direction-signal leading-[0px]"></i>
              <h1 className="text-sm font-bold ps-2">Transactions</h1>
            </div>
          </div>

          <div className="overflow-x-auto bg-white shadow-md border border-rose-200 rounded-lg p-2">
            <table className="table">
              <thead>
                <tr className="text-rose-700 font-bold">
                  <th>User</th>
                  <th>Details</th>
                  <th>Amount</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center text-gray-500 py-8">
                      No transactions found
                    </td>
                  </tr>
                ) : (
                  transactions.map((transaction) => {
                    const { formattedAmount, colorClass } = formatAmount(transaction.amount);
                    
                    return (
                      <tr key={transaction.id} className="align-middle text-rose-500">
                        <td className="font-semibold">{transaction.username}</td>
                        <td>{transaction.description}</td>
                        <td className={`font-bold ${colorClass}`}>{formattedAmount}</td>
                        <td>{formatDate(transaction.created_at)}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <nav className="flex justify-center my-3" aria-label="Page navigation example">
              <ul className="inline-flex -space-x-px text-sm">
                <li>
                  <button
                    disabled={currentPage === 1}
                    className={`flex items-center justify-center px-3 h-8 ms-0 leading-tight border border-e-0 border-gray-300 rounded-s-lg ${
                      currentPage === 1
                        ? 'text-gray-500 bg-gray-100'
                        : 'text-gray-500 bg-white hover:text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => handlePageClick(currentPage - 1)}
                  >
                    Previous
                  </button>
                </li>
                {renderPaginationNumbers()}
                <li>
                  <button
                    disabled={currentPage === totalPages}
                    className={`flex items-center justify-center px-3 h-8 leading-tight border border-gray-300 rounded-e-lg ${
                      currentPage === totalPages
                        ? 'text-gray-500 bg-gray-100'
                        : 'text-gray-500 bg-white hover:text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => handlePageClick(currentPage + 1)}
                  >
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </div>
      </AdminLayout>
    </>
  );
};

export default AdminTransactions;
