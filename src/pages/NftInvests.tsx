import React, { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import BottomNavigation from '../components/BottomNavigation';
import PageHeader from '../components/PageHeader';
import CountdownTimer from '../components/CountdownTimer';
import CustomPagination from '../components/CustomPagination';
import { useNftReturns } from '@/hooks/useNftReturns';

interface NFTInvestment {
  id: string;
  investment_amount: number;
  return_amount: number;
  latest_return_amount: number;
  return_count: number;
  status: string;
  invested_at: string;
  expires_at: string;
  next_return_at: string | null;
  nfts: {
    id: string;
    title: string;
    image_url: string | null;
    validity_days: number;
    min_profit_percentage: number;
    max_profit_percentage: number;
  };
}

const NftInvests = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { nftReturns } = useNftReturns();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [currencySymbol, setCurrencySymbol] = useState('$');
  const itemsPerPage = 10;

  // Fetch site settings for currency symbol
  useEffect(() => {
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

    fetchSiteSettings();
  }, []);

  // Set up real-time subscription
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('nft-investments-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'nft_transactions',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          queryClient.invalidateQueries({
            queryKey: ['nft-investments', user.id, currentPage]
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient, currentPage]);

  // Fetch user's NFT investments with pagination
  const { data: nftInvestments } = useQuery({
    queryKey: ['nft-investments', user?.id, currentPage],
    queryFn: async () => {
      if (!user?.id) return { data: [], totalCount: 0 };
      
      // Get total count
      const { count } = await supabase
        .from('nft_transactions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Set total pages
      if (count) {
        setTotalPages(Math.ceil(count / itemsPerPage));
      }
      
      const { data, error } = await supabase
        .from('nft_transactions')
        .select(`
          *,
          nfts:nft_id (
            id,
            title,
            image_url,
            validity_days,
            min_profit_percentage,
            max_profit_percentage
          )
        `)
        .eq('user_id', user.id)
        .order('invested_at', { ascending: false })
        .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1);
      
      if (error) throw error;
      return { data: data as NFTInvestment[], totalCount: count || 0 };
    },
    enabled: !!user?.id
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusDisplay = (investment: NFTInvestment) => {
    const now = new Date();
    const expiryDate = new Date(investment.expires_at);
    
    if (now > expiryDate || investment.status === 'completed') {
      return <span className="text-gray-500">Complete</span>;
    }
    
    if (investment.next_return_at) {
      const nextReturnDate = new Date(investment.next_return_at);
      if (now >= nextReturnDate) {
        return <span className="text-green-500 font-semibold">Return Ready</span>;
      }
      return <CountdownTimer targetDate={investment.next_return_at} />;
    }
    
    return <span className="text-blue-500">Active</span>;
  };

  const getProfitInfo = (investment: NFTInvestment) => {
    const minProfit = (investment.investment_amount * investment.nfts.min_profit_percentage) / 100;
    const maxProfit = (investment.investment_amount * investment.nfts.max_profit_percentage) / 100;
    
    return {
      minProfit: minProfit.toFixed(2),
      maxProfit: maxProfit.toFixed(2),
      totalEarned: investment.return_amount.toFixed(2),
      lastReturn: investment.latest_return_amount.toFixed(2),
      returnCount: investment.return_count
    };
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

  const investments = nftInvestments?.data || [];
  const hasInvestments = investments.length > 0;

  return (
    <div className="relative min-h-[100vh] bg-black mx-auto max-w-[480px] overflow-y-hidden">
      <div className="min-h-[100vh] pt-[0px] pb-[63px]">
        <div className="relative z-[1]">
          <PageHeader title="My NFTs" />

          <div className="h-[calc(100vh-153px)] overflow-auto">
            <div className="px-[6px]">
              {hasInvestments ? (
                investments.map((investment) => {
                  const profitInfo = getProfitInfo(investment);
                  return (
                    <div key={investment.id} className="flex items-center gap-4 bg-gray-950 p-2 border-b border-gray-700">
                      <img 
                        className="w-auto h-[100px] m-auto aspect-square rounded-md" 
                        src={investment.nfts.image_url || '/placeholder.svg'} 
                        alt={investment.nfts.title}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder.svg';
                        }}
                      />
                      <div className="flex-auto">
                        <h1 className="font-bold text-lime-500 text-[16px] mb-1">
                          {investment.nfts.title}
                        </h1>
                        <h1 className="font-semibold text-white text-[14px]">
                          Investment: <span className="font-semibold text-lime-500">{currencySymbol}{investment.investment_amount}</span>
                        </h1>
                        <h1 className="font-semibold text-white text-[12px]">
                          Total Earned: <span className="font-semibold text-lime-500">{currencySymbol}{profitInfo.totalEarned}</span>
                          {profitInfo.returnCount > 0 && (
                            <span className="text-gray-400 ml-1">({profitInfo.returnCount} returns)</span>
                          )}
                        </h1>
                        <h1 className="font-semibold text-white text-[12px]">
                          Expected: <span className="font-semibold text-yellow-500">{currencySymbol}{profitInfo.minProfit} - {currencySymbol}{profitInfo.maxProfit}/24h</span>
                        </h1>
                        <h1 className="font-semibold text-white text-[12px]">
                          Next Return: {getStatusDisplay(investment)}
                        </h1>
                        <h1 className="font-semibold text-white text-[12px]">
                          Valid Until: {formatDate(investment.expires_at)}
                        </h1>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="absolute left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]">
                  <h1 className="text-white/50 text-[16px] font-bold text-nowrap">No Investments Found</h1>
                </div>
              )}
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
            hasTransactions={hasInvestments}
          />
        </div>
      </div>
      <BottomNavigation />
    </div>
  );
};

export default NftInvests;
