import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import AdminLayout from '@/components/admin/AdminLayout';

const AdminTransferLogs = () => {
  const [transfers, setTransfers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [users, setUsers] = useState<{[key: string]: string}>({});
  const [currencySymbol, setCurrencySymbol] = useState('$');
  const itemsPerPage = 10;

  useEffect(() => {
    fetchSiteSettings();
    fetchTransfers();
  }, [currentPage]);

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

  const fetchTransfers = async () => {
    try {
      setLoading(true);
      
      // First get the total count for pagination
      const { count } = await supabase
        .from('transactions')
        .select('*', { count: 'exact', head: true })
        .eq('type', 'transfer');

      if (count) {
        setTotalPages(Math.ceil(count / itemsPerPage));
      }

      // Fetch transfers with pagination
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('type', 'transfer')
        .order('created_at', { ascending: false })
        .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1);

      if (error) throw error;
      
      // Fetch user information separately to avoid relation issues
      if (data && data.length > 0) {
        const userIds = [...new Set([
          ...data.map(d => d.user_id),
          ...data.filter(d => d.description).map(d => {
            try {
              const desc = JSON.parse(d.description);
              return desc.receiver_id;
            } catch {
              return null;
            }
          }).filter(Boolean)
        ])];
        
        const { data: usersData } = await supabase
          .from('users')
          .select('id, username')
          .in('id', userIds);
        
        if (usersData) {
          const usersMap: {[key: string]: string} = {};
          usersData.forEach(user => {
            usersMap[user.id] = user.username;
          });
          setUsers(usersMap);
        }
      }
      
      setTransfers(data || []);
    } catch (error) {
      console.error('Error fetching transfers:', error);
      toast.error('Failed to fetch transfer logs');
    } finally {
      setLoading(false);
    }
  };

  const parseTransferData = (transaction: any) => {
    try {
      const description = JSON.parse(transaction.description || '{}');
      return {
        sender: users[transaction.user_id] || 'Unknown',
        receiver: users[description.receiver_id] || 'Unknown',
        amount: transaction.amount,
        charge: description.charge || 0,
        afterCharge: transaction.amount - (description.charge || 0),
        time: new Date(transaction.created_at).toLocaleString()
      };
    } catch {
      return {
        sender: users[transaction.user_id] || 'Unknown',
        receiver: 'Unknown',
        amount: transaction.amount,
        charge: 0,
        afterCharge: transaction.amount,
        time: new Date(transaction.created_at).toLocaleString()
      };
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
    <div>
      
      <AdminLayout>
        <div className="mx-[8px] mt-2">
          <div className="flex items-center mb-3">
            <div className="flex-auto">
              <h1 className="font-bold text-[20px] text-rose-500">All TransferLogs</h1>
              <h1 className="font-bold text-[14px] text-gray-400">Manage All TransferLogs from Here</h1>
            </div>
          </div>

          <div className="flex justify-center items-center rounded-lg text-white bg-rose-600 shadow-md shadow-rose-700/50 p-2 mb-3">
            <div className="flex-auto flex items-center">
              <i className="fi fi-sr-direction-signal leading-[0px]"></i>
              <h1 className="text-sm font-bold ps-2">TransferLogs</h1>
            </div>
          </div>

          <div className="overflow-x-auto bg-white shadow-md border border-rose-200 rounded-lg p-2">
            <table className="table">
              <thead>
                <tr className="text-rose-700 font-bold">
                  <th>Sender</th>
                  <th>Reciever</th>
                  <th>Amount</th>
                  <th>Charge</th>
                  <th>After Charge</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {transfers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center text-gray-500 py-8">
                      No transfer logs found
                    </td>
                  </tr>
                ) : (
                  transfers.map((transfer) => {
                    const transferData = parseTransferData(transfer);
                    
                    return (
                      <tr key={transfer.id} className="align-middle text-rose-500">
                        <td className="font-semibold">{transferData.sender}</td>
                        <td className="font-semibold">{transferData.receiver}</td>
                        <td className="font-bold text-orange-500">
                          {currencySymbol}{transferData.amount.toFixed(2)}
                        </td>
                        <td className="font-bold text-red-500">
                          {currencySymbol}{transferData.charge.toFixed(2)}
                        </td>
                        <td className="font-bold text-green-500">
                          {currencySymbol}{transferData.afterCharge.toFixed(2)}
                        </td>
                        <td>{transferData.time}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <nav className="flex justify-center my-3" aria-label="Page navigation example">
            <ul className="inline-flex -space-x-px text-sm">
              <li>
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`flex items-center justify-center px-3 h-8 ms-0 leading-tight border border-e-0 border-gray-300 rounded-s-lg ${
                    currentPage === 1 
                      ? 'text-gray-500 bg-gray-100' 
                      : 'text-gray-700 bg-white hover:bg-gray-100'
                  }`}
                >
                  Previous
                </button>
              </li>
              <li>
                <span className="flex items-center justify-center px-3 h-8 leading-tight border border-gray-300 cursor-pointer bg-rose-600 hover:bg-rose-700 text-white">
                  {currentPage}
                </span>
              </li>
              <li>
                <button 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`flex items-center justify-center px-3 h-8 leading-tight border border-gray-300 rounded-e-lg ${
                    currentPage === totalPages 
                      ? 'text-gray-500 bg-gray-100' 
                      : 'text-gray-700 bg-white hover:bg-gray-100'
                  }`}
                >
                  Next
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </AdminLayout>
    </div>
  );
};

export default AdminTransferLogs;
