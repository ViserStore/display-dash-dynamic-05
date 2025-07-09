import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { notify } from '@/utils/notifications';
import AdminLayout from '@/components/admin/AdminLayout';
import CountdownTimer from '@/components/CountdownTimer';

interface NftInvestment {
  id: string;
  user_id: string;
  username?: string;
  nft_title: string;
  investment_amount: number;
  return_amount: number;
  latest_return_amount: number;
  return_count: number;
  next_return_at: string | null;
  invested_at: string;
  status: string;
}

const AdminNftInvests = () => {
  const [investments, setInvestments] = useState<NftInvestment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [currencySymbol, setCurrencySymbol] = useState('$');
  const itemsPerPage = 10;

  useEffect(() => {
    fetchSiteSettings();
    fetchNftInvestments();
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

  const fetchNftInvestments = async () => {
    try {
      setLoading(true);
      
      // Build query with search filter
      let query = supabase
        .from('nft_transactions')
        .select(`
          *,
          nfts:nft_id (
            title
          )
        `, { count: 'exact' });

      // Get total count first
      const { count } = await query.range(0, 0);
      if (count) {
        setTotalCount(count);
        setTotalPages(Math.ceil(count / itemsPerPage));
      }

      // Fetch paginated data
      const { data: investmentData, error } = await supabase
        .from('nft_transactions')
        .select(`
          *,
          nfts:nft_id (
            title
          )
        `)
        .order('invested_at', { ascending: false })
        .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1);

      if (error) throw error;

      // Get unique user IDs to fetch usernames
      const userIds = [...new Set(investmentData?.map(inv => inv.user_id) || [])];
      const userCache = new Map<string, string>();

      // Fetch usernames for all users
      if (userIds.length > 0) {
        const { data: userData } = await supabase
          .from('users')
          .select('id, username')
          .in('id', userIds);
        
        userData?.forEach(user => {
          userCache.set(user.id, user.username);
        });
      }

      // Format the data
      const formattedInvestments: NftInvestment[] = (investmentData || []).map(investment => ({
        id: investment.id,
        user_id: investment.user_id,
        username: userCache.get(investment.user_id) || 'Unknown',
        nft_title: investment.nfts?.title || 'Unknown NFT',
        investment_amount: investment.investment_amount,
        return_amount: investment.return_amount,
        latest_return_amount: investment.latest_return_amount,
        return_count: investment.return_count,
        next_return_at: investment.next_return_at,
        invested_at: investment.invested_at,
        status: investment.status
      }));

      // Filter by search term if provided
      const filteredInvestments = searchTerm
        ? formattedInvestments.filter(inv =>
            inv.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            inv.nft_title.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : formattedInvestments;

      setInvestments(filteredInvestments);
    } catch (error) {
      console.error('Error fetching NFT investments:', error);
      notify.error('Failed to fetch NFT investments');
    } finally {
      setLoading(false);
    }
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
              <h1 className="font-bold text-[20px] text-rose-500">NFT Investments</h1>
              <h1 className="font-bold text-[14px] text-gray-400">Manage All NFT Investments from Here ({totalCount} total)</h1>
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
              <h1 className="text-sm font-bold ps-2">NFT Invests (Page {currentPage} of {totalPages})</h1>
            </div>
          </div>

          <div className="overflow-x-auto bg-white shadow-md border border-rose-200 rounded-lg p-2">
            <table className="table">
              <thead>
                <tr className="text-rose-700 font-bold">
                  <th>User</th>
                  <th>Details</th>
                  <th>Invest Amount</th>
                  <th>Return Amount</th>
                  <th>Latest Return</th>
                  <th>Return Count</th>
                  <th>Next Payment</th>
                  <th>Invest Time</th>
                </tr>
              </thead>
              <tbody>
                {investments.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center text-gray-500 py-8">
                      No NFT investments found
                    </td>
                  </tr>
                ) : (
                  investments.map((investment) => (
                    <tr key={investment.id} className="align-middle text-rose-500">
                      <td className="font-semibold">
                        <a className="hover:underline" href={`/admin/users/${investment.user_id}`}>
                          {investment.username}
                        </a>
                      </td>
                      <td>Invest On <b>{investment.nft_title}</b></td>
                      <td className="font-bold">{currencySymbol}{investment.investment_amount.toFixed(2)}</td>
                      <td className="font-bold">{currencySymbol}{investment.return_amount.toFixed(2)}</td>
                      <td className="font-bold">{currencySymbol}{investment.latest_return_amount.toFixed(2)}</td>
                      <td className="font-bold">{investment.return_count} Times</td>
                      <td>
                        <span className="text-nowrap">
                          {investment.next_return_at ? (
                            <CountdownTimer targetDate={investment.next_return_at} />
                          ) : (
                            'Complete'
                          )}
                        </span>
                      </td>
                      <td>{formatDate(investment.invested_at)}</td>
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

export default AdminNftInvests;
