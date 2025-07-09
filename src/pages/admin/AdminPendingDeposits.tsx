import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import AdminLayout from '@/components/admin/AdminLayout';

interface Deposit {
  id: string;
  amount: number;
  status: string;
  transaction_id: string | null;
  created_at: string;
  user_id: string;
  deposit_methods: {
    name: string;
    currency: string;
  } | null;
}

const AdminPendingDeposits = () => {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedDeposit, setSelectedDeposit] = useState<Deposit | null>(null);
  const [users, setUsers] = useState<{[key: string]: string}>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchPendingDeposits();
  }, [currentPage]);

  const fetchPendingDeposits = async () => {
    try {
      setLoading(true);
      
      // Get total count first
      const { count } = await supabase
        .from('deposits')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      if (count) {
        setTotalPages(Math.ceil(count / itemsPerPage));
      }

      const { data, error } = await supabase
        .from('deposits')
        .select(`
          id,
          amount,
          status,
          transaction_id,
          created_at,
          user_id,
          deposit_methods (
            name,
            currency
          )
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1);

      if (error) throw error;
      
      // Fetch user information separately
      if (data && data.length > 0) {
        const userIds = [...new Set(data.map(d => d.user_id))];
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
      
      setDeposits(data || []);
    } catch (error) {
      console.error('Error fetching pending deposits:', error);
      toast.error('Failed to fetch pending deposits');
    } finally {
      setLoading(false);
    }
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
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

  const handleStatusUpdate = async (depositId: string, newStatus: string) => {
    try {
      console.log(`Updating deposit ${depositId} to status: ${newStatus}`);
      
      // Update deposit status - the trigger will handle everything else
      const { error } = await supabase
        .from('deposits')
        .update({ status: newStatus })
        .eq('id', depositId);

      if (error) throw error;

      const statusText = newStatus === 'complete' ? 'approved' : newStatus;
      toast.success(`Deposit ${statusText} successfully`);
      
      if (newStatus === 'complete') {
        console.log('Deposit approved - referral commissions will be processed automatically');
      }
      
      fetchPendingDeposits();
      setShowAcceptModal(false);
      setShowRejectModal(false);
      setSelectedDeposit(null);
    } catch (error) {
      console.error('Error updating deposit status:', error);
      toast.error('Failed to update deposit status');
    }
  };

  const openAcceptModal = (deposit: Deposit) => {
    setSelectedDeposit(deposit);
    setShowAcceptModal(true);
  };

  const openRejectModal = (deposit: Deposit) => {
    setSelectedDeposit(deposit);
    setShowRejectModal(true);
  };

  const copyTransactionId = (transactionId: string) => {
    navigator.clipboard.writeText(transactionId);
    toast.success('Transaction ID copied to clipboard');
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-rose-700">Loading pending deposits...</div>
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
              <h1 className="font-bold text-[20px] text-rose-500">Pending Deposits</h1>
              <h1 className="font-bold text-[14px] text-gray-400">Manage Pending Deposit Requests</h1>
            </div>
          </div>

          <div className="flex justify-center items-center rounded-lg text-white bg-rose-600 shadow-md shadow-rose-700/50 p-2 mb-3">
            <div className="flex-auto flex items-center">
              <i className="fi fi-sr-hourglass leading-[0px]"></i>
              <h1 className="text-sm font-bold ps-2">Pending Deposits ({deposits.length})</h1>
            </div>
          </div>

          <div className="overflow-x-auto bg-white shadow-md border border-rose-200 rounded-lg p-2">
            <table className="table">
              <thead>
                <tr className="text-rose-700 font-bold">
                  <th>Gateway</th>
                  <th>User</th>
                  <th>Amount</th>
                  <th>Transaction Id</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {deposits.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center text-gray-500 py-8">
                      No pending deposits found
                    </td>
                  </tr>
                ) : (
                  deposits.map((deposit) => (
                    <tr key={deposit.id} className="align-middle text-rose-500">
                      <td className="font-semibold">{deposit.deposit_methods?.name || 'Unknown'}</td>
                      <td className="font-semibold">{users[deposit.user_id] || 'Unknown'}</td>
                      <td className="font-bold text-rose-500">
                        {deposit.amount.toFixed(2)} {deposit.deposit_methods?.currency || 'USDT'}
                      </td>
                      <td className="font-bold text-green-500">
                        {deposit.transaction_id ? (
                          <div className="flex items-center gap-2">
                            {deposit.transaction_id}
                            <i 
                              className="fi fi-sr-copy-alt cursor-pointer leading-[0px]"
                              onClick={() => copyTransactionId(deposit.transaction_id!)}
                            ></i>
                          </div>
                        ) : 'N/A'}
                      </td>
                      <td className="text-gray-600">
                        {new Date(deposit.created_at).toLocaleDateString()}
                      </td>
                      <td>
                        <div className="grid gap-2">
                          <button 
                            onClick={() => openAcceptModal(deposit)}
                            className="bg-green-500 hover:bg-green-600 shadow-md shadow-green-400 rounded-md text-[14px] text-white font-bold px-2 py-1 w-[100%]"
                          >
                            Accept
                          </button>
                          <button 
                            onClick={() => openRejectModal(deposit)}
                            className="bg-red-500 hover:bg-red-600 shadow-md shadow-red-400 rounded-md text-[14px] text-white font-bold px-2 py-1 w-[100%]"
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
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

        {/* Accept Modal */}
        {showAcceptModal && (
          <div className="fixed overflow-y-auto overflow-x-hidden top-0 right-0 left-0 z-50 flex justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full bg-gray-900/60">
            <div className="relative p-4 w-full max-w-md max-h-full">
              <div className="relative bg-white rounded-lg shadow">
                <button 
                  type="button" 
                  onClick={() => setShowAcceptModal(false)}
                  className="absolute top-3 end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
                >
                  <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                  </svg>
                  <span className="sr-only">Close modal</span>
                </button>
                <div className="p-4 md:p-5 text-center">
                  <i className="fi fi-ss-badge-check text-green-500/80 text-[50px]"></i>
                  <h3 className="mb-2 text-lg font-normal text-gray-500">Are you sure to Accept this deposit request?</h3>
                  <p className="mb-5 text-sm text-gray-400">This will automatically process referral commissions based on your referral settings.</p>
                  <button 
                    onClick={() => selectedDeposit && handleStatusUpdate(selectedDeposit.id, 'complete')}
                    type="button" 
                    className="text-white bg-green-600 hover:bg-green-800 focus:ring-4 focus:outline-none font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center"
                  >
                    Yes, Approve & Process Commissions
                  </button>
                  <button 
                    onClick={() => setShowAcceptModal(false)}
                    type="button" 
                    className="py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-rose-700 focus:z-10 focus:ring-4 focus:ring-gray-100"
                  >
                    No, cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reject Modal */}
        {showRejectModal && (
          <div className="fixed overflow-y-auto overflow-x-hidden top-0 right-0 left-0 z-50 flex justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full bg-gray-900/60">
            <div className="relative p-4 w-full max-w-md max-h-full">
              <div className="relative bg-white rounded-lg shadow">
                <button 
                  type="button" 
                  onClick={() => setShowRejectModal(false)}
                  className="absolute top-3 end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
                >
                  <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                  </svg>
                  <span className="sr-only">Close modal</span>
                </button>
                <div className="p-4 md:p-5 text-center">
                  <i className="fi fi-sr-circle-xmark text-red-500/80 text-[50px]"></i>
                  <h3 className="mb-5 text-lg font-normal text-gray-500">Are you sure to Reject this deposit request?</h3>
                  <button 
                    onClick={() => selectedDeposit && handleStatusUpdate(selectedDeposit.id, 'reject')}
                    type="button" 
                    className="text-white bg-red-600 hover:bg-red-800 focus:ring-4 focus:outline-none font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center"
                  >
                    Yes, Sure
                  </button>
                  <button 
                    onClick={() => setShowRejectModal(false)}
                    type="button" 
                    className="py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-rose-700 focus:z-10 focus:ring-4 focus:ring-gray-100"
                  >
                    No, cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </AdminLayout>
    </div>
  );
};

export default AdminPendingDeposits;
