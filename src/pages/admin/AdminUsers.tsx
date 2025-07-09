import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { notify } from '@/utils/notifications';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';

interface User {
  id: string;
  username: string;
  full_name: string | null;
  balance: number;
  pay_id: string | null;
  created_at: string;
}

const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [siteCurrency, setSiteCurrency] = useState('USDT');
  const itemsPerPage = 10;
  const navigate = useNavigate();

  useEffect(() => {
    fetchSiteSettings();
    fetchUsers();
  }, [currentPage, searchTerm]);

  const fetchSiteSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('site_currency')
        .single();

      if (error) throw error;
      if (data?.site_currency) {
        setSiteCurrency(data.site_currency);
      }
    } catch (error) {
      console.error('Error fetching site settings:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Build search query
      let query = supabase
        .from('users')
        .select('id, username, full_name, balance, pay_id, created_at', { count: 'exact' });

      if (searchTerm) {
        query = query.or(`username.ilike.%${searchTerm}%,full_name.ilike.%${searchTerm}%,pay_id.ilike.%${searchTerm}%`);
      }

      // Get total count
      const { count } = await query.range(0, 0);
      if (count !== null) {
        setTotalCount(count);
        setTotalPages(Math.ceil(count / itemsPerPage));
      }

      // Fetch paginated data
      let dataQuery = supabase
        .from('users')
        .select('id, username, full_name, balance, pay_id, created_at')
        .order('created_at', { ascending: false })
        .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1);

      if (searchTerm) {
        dataQuery = dataQuery.or(`username.ilike.%${searchTerm}%,full_name.ilike.%${searchTerm}%,pay_id.ilike.%${searchTerm}%`);
      }

      const { data, error } = await dataQuery;

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      notify.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleViewUser = (userId: string) => {
    navigate(`/admin/users/${userId}`);
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
              <h1 className="font-bold text-[20px] text-rose-500">Manage Users</h1>
              <h1 className="font-bold text-[14px] text-gray-400">Manage All Users from Here ({totalCount} total)</h1>
            </div>
            <label className="input bg-rose-100 text-rose-500 font-bold input-bordered flex items-center gap-2 w-[300px]">
              <input
                type="text"
                className="grow placeholder-rose-500/50"
                placeholder="Search users..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
              <i className="fi fi-rr-search leading-[0px]"></i>
            </label>
          </div>

          <div className="flex justify-center items-center rounded-lg text-white bg-rose-600 shadow-md shadow-rose-700/50 p-2 mb-3">
            <div className="flex-auto flex items-center">
              <i className="fi fi-sr-users leading-[0px]"></i>
              <h1 className="text-sm font-bold ps-2">Manage Users (Page {currentPage} of {totalPages})</h1>
            </div>
          </div>

          <div className="overflow-x-auto bg-white shadow-md border border-rose-200 rounded-lg p-2">
            <table className="table">
              <thead>
                <tr className="text-rose-700 font-bold">
                  <th>SL.</th>
                  <th>Username</th>
                  <th>Full Name</th>
                  <th>Balance</th>
                  <th>Pay ID</th>
                  <th>Joined</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center text-gray-500 py-8">
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((user, index) => (
                    <tr key={user.id} className="align-middle text-rose-500">
                      <th>{(currentPage - 1) * itemsPerPage + index + 1}</th>
                      <td>
                        <div className="flex items-center gap-2">
                          {user.username}
                        </div>
                      </td>
                      <td className="font-semibold">{user.full_name || 'N/A'}</td>
                      <td className="font-semibold text-green-600">{user.balance} {siteCurrency}</td>
                      <td>{user.pay_id || 'N/A'}</td>
                      <td>{new Date(user.created_at).toLocaleDateString()}</td>
                      <td>
                        <button 
                          className="bg-blue-500 hover:bg-blue-600 rounded-md text-[12px] text-white font-bold px-2 py-1 w-[100%]"
                          onClick={() => handleViewUser(user.id)}
                        >
                          View
                        </button>
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
      </AdminLayout>
    </>
  );
};

export default AdminUsers;
