import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import BottomNavigation from '../components/BottomNavigation';
import PageHeader from '../components/PageHeader';
import CustomPagination from '../components/CustomPagination';
import { useToast } from '@/hooks/use-toast';

interface Deposit {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  deposit_methods: {
    name: string;
    currency: string;
  } | null;
}

const DepositLogs = () => {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [siteCurrency, setSiteCurrency] = useState('USDT');
  const { user } = useAuth();
  const { toast } = useToast();
  const itemsPerPage = 10;

  useEffect(() => {
    if (user) {
      fetchCurrencySettings();
      fetchDeposits();
    }
  }, [user, currentPage]);

  const fetchCurrencySettings = async () => {
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
      console.error('Error fetching currency settings:', error);
    }
  };

  const fetchDeposits = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Get total count
      const { count } = await supabase
        .from('deposits')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (count) {
        setTotalCount(count);
        setTotalPages(Math.ceil(count / itemsPerPage));
      }

      // Fetch deposits with pagination
      const { data, error } = await supabase
        .from('deposits')
        .select(`
          id,
          amount,
          status,
          created_at,
          deposit_methods (
            name,
            currency
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1);

      if (error) {
        console.error('Error fetching deposits:', error);
        toast({
          title: "Error",
          description: "Failed to fetch deposit logs",
          variant: "destructive",
        });
      } else {
        setDeposits(data || []);
      }
    } catch (error) {
      console.error('Error fetching deposits:', error);
      toast({
        title: "Error",
        description: "Failed to fetch deposit logs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'complete':
        return 'text-emerald-500';
      case 'pending':
        return 'text-yellow-500';
      case 'reject':
      case 'rejected':
        return 'text-rose-500';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    return 'fi-ss-bullet';
  };

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

  const renderSkeletonRows = () => {
    return Array.from({ length: 10 }, (_, index) => (
      <div key={index} className="flex justify-between w-100 animate-pulse w-100 border-b border-gray-700">
        <div className="!pt-[13px] !pb-[13px]">
          <div className="h-3.5 bg-gray-600 rounded-[5px] ms-2 w-20 mb-2.5"></div>
          <div className="w-24 h-2 bg-gray-700 rounded-[5px] ms-2"></div>
        </div>
        <div className="px-2 !pt-[13px] !pb-[13px] grid justify-items-end">
          <div className="h-3.5 bg-gray-600 rounded-[5px] ms-2 w-20 mb-2.5"></div>
          <div className="w-14 h-2 bg-gray-700 rounded-[5px] ms-2"></div>
        </div>
      </div>
    ));
  };

  return (
    <div className="relative min-h-[100vh] bg-black mx-auto max-w-[480px] overflow-y-hidden">
      <div className="min-h-[100vh] pt-[0px] pb-[63px]">
        <div className="relative z-[1]">
          <PageHeader title="Deposit Logs" />

          <div className="container mx-auto px-[8px] pb-[40px] py-3 rounded-t-[20px] overflow-y-auto h-[calc(100vh-200px)]">
            <div className="relative overflow-x-auto">
              <table className="w-full text-sm text-left rtl:text-right text-gray-300 dark:text-gray-400">
                <thead className="text-[10px] text-gray-400">
                  <tr>
                    <th scope="col" className="px-2 pt-1 pb-0">Details & Time</th>
                    <th scope="col" className="px-2 pt-1 pb-0 text-end">Amount & Status</th>
                  </tr>
                </thead>
              </table>
            </div>
            
            <div className="infinite-scroll-component__outerdiv">
              <div className="infinite-scroll-component flex flex-col w-full text-sm text-left text-gray-300 dark:text-gray-400" style={{height: 'auto', overflow: 'auto'}}>
                {loading ? (
                  renderSkeletonRows()
                ) : deposits.length === 0 ? (
                  <div className="text-center text-gray-400 py-8">No deposits found</div>
                ) : (
                  deposits.map((deposit) => (
                    <div key={deposit.id} className="flex justify-between border-b border-gray-700 max-w-[100%]">
                      <div className="px-2 pt-1 pb-2 font-medium text-gray-300">
                        <span className="font-medium text-gray-300">
                          Deposit with {deposit.deposit_methods?.name || 'Unknown Method'}
                        </span>
                        <h1 className="text-[10px] text-gray-300/90">{formatDate(deposit.created_at)}</h1>
                      </div>
                      <div className="px-2 pt-1 pb-2 text-end">
                        <h1 className="font-medium whitespace-nowrap text-gray-300">
                          {deposit.amount.toFixed(2)} {siteCurrency}
                        </h1>
                        <div className="flex justify-end items-center gap-[1px]">
                          <i className={`${getStatusIcon(deposit.status)} ${getStatusColor(deposit.status)} leading-[0px]`}></i>
                          <h1 className="text-[10px] text-gray-300/90 capitalize">{deposit.status}</h1>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <CustomPagination
            currentPage={currentPage}
            totalPages={totalPages}
            hasNextPage={currentPage < totalPages}
            hasPreviousPage={currentPage > 1}
            onNextPage={goToNextPage}
            onPreviousPage={goToPreviousPage}
            onGoToPage={goToPage}
            hasTransactions={deposits.length > 0}
          />

          
        </div>
      </div>
    </div>
  );
};

export default DepositLogs;
