
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../integrations/supabase/client';

export const usePaginatedTrades = (pageSize: number = 10, filterStatus?: 'PENDING' | 'COMPLETED') => {
  const [trades, setTrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const { user } = useAuth();

  const fetchTrades = async (page: number) => {
    if (!user) return;

    try {
      setLoading(true);
      const offset = (page - 1) * pageSize;

      // Build query based on filter status
      let query = supabase
        .from('trade_transactions')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id);

      // Apply status filter
      if (filterStatus === 'PENDING') {
        query = query.eq('status', 'running');
      } else if (filterStatus === 'COMPLETED') {
        query = query.eq('status', 'complete');
      }

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + pageSize - 1);

      if (error) {
        console.error('Error fetching trades:', error);
        return;
      }

      setTrades(data || []);
      setTotalCount(count || 0);
      setTotalPages(Math.ceil((count || 0) / pageSize));
    } catch (error) {
      console.error('Error fetching trades:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrades(currentPage);
  }, [user, currentPage, pageSize, filterStatus]);

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;

  return {
    trades,
    loading,
    currentPage,
    totalPages,
    totalCount,
    hasNextPage,
    hasPreviousPage,
    goToNextPage,
    goToPreviousPage,
    goToPage,
    refresh: () => fetchTrades(currentPage)
  };
};
