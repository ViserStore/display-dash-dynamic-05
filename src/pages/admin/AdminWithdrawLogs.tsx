import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useSearchParams } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';

const AdminWithdrawLogs = () => {
  const [searchParams] = useSearchParams();
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<any>(null);
  const [users, setUsers] = useState<{[key: string]: string}>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchWithdrawals();
  }, [statusFilter, currentPage]);

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      
      // Build query for counting
      let countQuery = supabase
        .from('withdrawals')
        .select('*', { count: 'exact', head: true });

      if (statusFilter !== 'all') {
        countQuery = countQuery.eq('status', statusFilter);
      }

      const { count } = await countQuery;

      if (count !== null) {
        setTotalCount(count);
        setTotalPages(Math.ceil(count / itemsPerPage));
      }

      // Build query for data
      let query = supabase
        .from('withdrawals')
        .select(`
          id,
          amount,
          status,
          payment_address,
          created_at,
          updated_at,
          user_id,
          withdraw_method_id,
          withdraw_methods (
            name,
            currency,
            charge_percentage,
            symbol
          )
        `)
        .order('created_at', { ascending: false })
        .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1);

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Fetch user information separately to avoid relation issues
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
      
      setWithdrawals(data || []);
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
      toast.error('Failed to fetch withdrawal logs');
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

  const handleStatusUpdate = async (withdrawalId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('withdrawals')
        .update({ status: newStatus })
        .eq('id', withdrawalId);

      if (error) throw error;

      toast.success(`Withdrawal ${newStatus} successfully`);
      fetchWithdrawals();
      setShowAcceptModal(false);
      setShowRejectModal(false);
      setSelectedWithdrawal(null);
    } catch (error) {
      console.error('Error updating withdrawal status:', error);
      toast.error('Failed to update withdrawal status');
    }
  };

  const openAcceptModal = (withdrawal: any) => {
    setSelectedWithdrawal(withdrawal);
    setShowAcceptModal(true);
  };

  const openRejectModal = (withdrawal: any) => {
    setSelectedWithdrawal(withdrawal);
    setShowRejectModal(true);
  };

  const copyPaymentAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    toast.success('Payment address copied to clipboard');
  };

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      pending: 'text-yellow-500 border-yellow-500',
      complete: 'text-green-500 border-green-500',
      reject: 'text-red-500 border-red-500'
    };

    return (
      <span className={`border rounded-full px-2 py-[2px] ${statusClasses[status as keyof typeof statusClasses] || 'text-gray-500 border-gray-500'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const calculateCharge = (amount: number, chargePercentage: number) => {
    return (amount * chargePercentage) / 100;
  };

  const calculatePayableAmount = (amount: number, chargePercentage: number) => {
    return amount - calculateCharge(amount, chargePercentage);
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
              <h1 className="font-bold text-[20px] text-rose-500">All Withdraw Logs</h1>
              <h1 className="font-bold text-[14px] text-gray-400">Manage All Withdraw Logs from Here ({totalCount} total)</h1>
            </div>
            <div>
              <select 
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1); // Reset to first page when filter changes
                }}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-rose-500 focus:border-rose-500 block w-full p-2.5 mb-3 grow select select-bordered bg-rose-100 text-rose-500 placeholder-rose-500/50 !w-[100px]"
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="complete">Complete</option>
                <option value="reject">Rejected</option>
              </select>
            </div>
          </div>

          <div className="flex justify-center items-center rounded-lg text-white bg-rose-600 shadow-md shadow-rose-700/50 p-2 mb-3">
            <div className="flex-auto flex items-center">
              <i className="fi fi-sr-direction-signal leading-[0px]"></i>
              <h1 className="text-sm font-bold ps-2">Logs (Page {currentPage} of {totalPages})</h1>
            </div>
          </div>

          <div className="overflow-x-auto bg-white shadow-md border border-rose-200 rounded-lg p-2">
            <table className="table">
              <thead>
                <tr className="text-rose-700 font-bold">
                  <th>Gateway</th>
                  <th>User</th>
                  <th>Amount</th>
                  <th>Charge</th>
                  <th>Need To Pay</th>
                  <th>Payment Address</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center text-gray-500 py-8">
                      No withdrawals found
                    </td>
                  </tr>
                ) : (
                  withdrawals.map((withdrawal) => {
                    const charge = calculateCharge(withdrawal.amount, withdrawal.withdraw_methods?.charge_percentage || 0);
                    const payableAmount = calculatePayableAmount(withdrawal.amount, withdrawal.withdraw_methods?.charge_percentage || 0);
                    
                    return (
                      <tr key={withdrawal.id} className="align-middle text-rose-500">
                        <td className="font-semibold">{withdrawal.withdraw_methods?.name || 'Unknown'}</td>
                        <td className="font-semibold">{users[withdrawal.user_id] || 'Unknown'}</td>
                        <td className="font-semibold text-rose-500">
                          {withdrawal.withdraw_methods?.symbol || '$'}{withdrawal.amount.toFixed(2)}
                        </td>
                        <td className="text-rose-400">
                          {withdrawal.withdraw_methods?.symbol || '$'}{charge.toFixed(2)}
                        </td>
                        <td className="font-bold text-cyan-500">
                          {payableAmount.toFixed(2)} {withdrawal.withdraw_methods?.currency || 'USDT'}
                        </td>
                        <td className="font-bold text-amber-500">
                          <div className="flex items-center gap-2">
                            {withdrawal.payment_address}
                            <i 
                              className="fi fi-sr-copy-alt cursor-pointer leading-[0px]"
                              onClick={() => copyPaymentAddress(withdrawal.payment_address)}
                            ></i>
                          </div>
                        </td>
                        <td>{getStatusBadge(withdrawal.status)}</td>
                        <td>
                          {withdrawal.status === 'pending' ? (
                            <div className="grid gap-2">
                              <button 
                                onClick={() => openAcceptModal(withdrawal)}
                                className="bg-green-500 hover:bg-green-600 shadow-md shadow-green-400 rounded-md text-[14px] text-white font-bold px-2 py-1 w-[100%]"
                              >
                                Accept
                              </button>
                              <button 
                                onClick={() => openRejectModal(withdrawal)}
                                className="bg-red-500 hover:bg-red-600 shadow-md shadow-red-400 rounded-md text-[14px] text-white font-bold px-2 py-1 w-[100%]"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            'Done'
                          )}
                        </td>
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
                  <h3 className="mb-5 text-lg font-normal text-gray-500">Are you sure to Accept this withdraw request?</h3>
                  <button 
                    onClick={() => selectedWithdrawal && handleStatusUpdate(selectedWithdrawal.id, 'complete')}
                    type="button" 
                    className="text-white bg-green-600 hover:bg-green-800 focus:ring-4 focus:outline-none font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center"
                  >
                    Yes, Sure
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
                  <h3 className="mb-5 text-lg font-normal text-gray-500">Are you sure to Reject this withdraw request?</h3>
                  <button 
                    onClick={() => selectedWithdrawal && handleStatusUpdate(selectedWithdrawal.id, 'reject')}
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

export default AdminWithdrawLogs;
