
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import BottomNavigation from '../components/BottomNavigation';
import { notify } from '@/utils/notifications';

interface NFT {
  id: string;
  title: string;
  image_url: string | null;
  min_invest_limit: number;
  max_invest_limit: number;
  min_profit_percentage: number;
  max_profit_percentage: number;
  nft_date: string | null;
  validity_days: number;
  website_link: string | null;
  details: string | null;
  is_verified: boolean;
  status: string;
}

const NftDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [investAmount, setInvestAmount] = useState(20);
  const [showInvestModal, setShowInvestModal] = useState(false);
  const queryClient = useQueryClient();

  // Fetch individual NFT data
  const { data: nft, isLoading, error } = useQuery({
    queryKey: ['nft', id],
    queryFn: async () => {
      if (!id) throw new Error('NFT ID is required');
      
      const { data, error } = await supabase
        .from('nfts')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as NFT;
    },
    enabled: !!id
  });

  // Fetch user balance
  const { data: userBalance } = useQuery({
    queryKey: ['user-balance', user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;
      
      const { data, error } = await supabase
        .from('users')
        .select('balance')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data.balance || 0;
    },
    enabled: !!user?.id
  });

  // Fetch currency symbol from site settings
  const { data: siteSettings } = useQuery({
    queryKey: ['site-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('currency_symbol, site_currency')
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  // Investment mutation
  const investMutation = useMutation({
    mutationFn: async (amount: number) => {
      if (!nft) throw new Error('NFT not found');
      if (!user?.id) throw new Error('User not authenticated');
      
      // Calculate expiry date based on validity days
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + nft.validity_days);
      
      // Calculate next return date (assuming daily returns)
      const nextReturnDate = new Date();
      nextReturnDate.setDate(nextReturnDate.getDate() + 1);

      // Create NFT transaction record
      const { data: nftTransaction, error: nftError } = await supabase
        .from('nft_transactions')
        .insert({
          user_id: user.id,
          nft_id: nft.id,
          investment_amount: amount,
          return_amount: 0,
          latest_return_amount: 0,
          return_count: 0,
          status: 'active',
          expires_at: expiryDate.toISOString(),
          next_return_at: nextReturnDate.toISOString()
        })
        .select()
        .single();

      if (nftError) throw nftError;

      // Create transaction record for accounting
      const { data: transaction, error: transactionError } = await supabase
        .from('transactions')
        .insert({
          type: 'nft_investment',
          amount: amount,
          status: 'completed',
          reference_id: nftTransaction.id,
          description: `Investment in NFT: ${nft.title}`,
          user_id: user.id
        })
        .select()
        .single();

      if (transactionError) throw transactionError;

      // Deduct amount from user balance
      const { error: balanceError } = await supabase.rpc('deduct_user_balance', {
        user_id: user.id,
        amount: amount
      });

      if (balanceError) throw balanceError;

      return { nftTransaction, transaction };
    },
    onSuccess: () => {
      notify.dismiss();
      notify.success('NFT Investment Successful!');
      setShowInvestModal(false);
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['user-balance'] });
      queryClient.invalidateQueries({ queryKey: ['nft-investments'] });
      
      setTimeout(() => {
        navigate('/nft-invests');
      }, 1500);
    },
    onError: (error) => {
      notify.dismiss();
      notify.error(`Investment failed: ${error.message}`);
    }
  });

  const handleDrawerToggle = () => {
    const drawer = document.getElementById('drawer-navigation');
    if (drawer) {
      drawer.classList.toggle('-translate-x-full');
    }
  };

  const handleLogout = () => {
    console.log('Logout clicked');
  };

  const handleBackClick = () => {
    window.history.back();
  };

  const handleInvestClick = () => {
    if (!user) {
      notify.error('Please login to invest');
      return;
    }
    setShowInvestModal(true);
  };

  const handleInvestSubmit = () => {
    if (!nft || !user) return;
    
    if (investAmount < nft.min_invest_limit || investAmount > nft.max_invest_limit) {
      notify.error(`Investment amount must be between ${currencySymbol}${nft.min_invest_limit} and ${currencySymbol}${nft.max_invest_limit}`);
      return;
    }

    if (userBalance && investAmount > userBalance) {
      notify.error('Insufficient balance');
      return;
    }

    notify.loading('Processing your investment...');
    investMutation.mutate(investAmount);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInvestAmount(Number(e.target.value));
  };

  // Set initial invest amount when NFT data loads
  React.useEffect(() => {
    if (nft && investAmount < nft.min_invest_limit) {
      setInvestAmount(nft.min_invest_limit);
    }
  }, [nft]);

  const currencySymbol = siteSettings?.currency_symbol || '$';
  const siteCurrency = siteSettings?.site_currency || 'USDT';

  if (error || (!isLoading && !nft)) {
    return (
      <div className="relative min-h-[100vh] bg-black mx-auto max-w-[480px] overflow-y-hidden">
        <div className="flex items-center justify-center h-screen">
          <div className="text-red-500">Error loading NFT</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[100vh] bg-black mx-auto max-w-[480px] overflow-y-hidden">
      <div className="min-h-[100vh] pt-[0px] pb-[63px]">
        <div className="relative z-[1]">
          

          {/* Header Section */}
          <div>
            <div className="relative overflow-hidden mb-[10px]">
              <div className="p-[15px] relative z-[2] rounded-b-[30px]">
                <div className="flex gap-3 items-center justify-between">
                  <div className="flex gap-2 items-center bg-black/20 border border-gray-500/50 backdrop-blur rounded-full px-[20px] h-[48px]">
                    <div>
                      <img 
                        className="w-[18px] backBtn cursor-pointer" 
                        src="https://cdn-icons-png.flaticon.com/128/507/507257.png" 
                        alt=""
                        onClick={handleBackClick}
                      />
                    </div>
                    <h1 className="text-white font-bold">NFT Details</h1>
                  </div>
                  <div className="flex gap-2 items-center bg-black/20 border border-gray-500/50 backdrop-blur rounded-full">
                    <img 
                      className="w-[48px] h-[48px] aspect-square border border-gray-500/50 rounded-full" 
                      src="https://img.freepik.com/premium-photo/3d-cartoon-avatar-man-minimal-3d-character_652053-2070.jpg" 
                      alt=""
                      onClick={handleDrawerToggle}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="px-[8px] overflow-auto max-h-[calc(100vh-153px)]">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <img 
                    className="invert opacity-25 w-[50px]" 
                    src="https://cdn-icons-png.flaticon.com/128/9332/9332404.png" 
                    alt="" 
                  />
                  <div className="text-white text-[12px] font-semibold mt-2">Loading...</div>
                </div>
              ) : nft ? (
                <>
                  <h1 className="font-bold text-[20px] text-lime-500">{nft.title}</h1>
                  <img 
                    className="w-full rounded-md" 
                    alt={nft.title} 
                    src={nft.image_url || '/placeholder.svg'} 
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder.svg';
                    }}
                  />
                  
                  <div className="border border-gray-500/50 rounded-md p-3 my-3">
                    {nft.is_verified && (
                      <h1 className="flex items-center gap-1 font-bold text-lime-500 hover:text-lime-400 text-[18px] mb-2">
                        <i className="fi fi-sr-badge-check text-[18px] leading-[0px]"></i> verified
                      </h1>
                    )}
                    {nft.nft_date && (
                      <h1 className="font-semibold text-white text-[18px] mb-2">{nft.nft_date}</h1>
                    )}
                    {nft.website_link && (
                      <a 
                        className="border-2 border-gray-500/50 hover:border-lime-500 hover:text-lime-500 rounded-md p-2 w-[120px] flex justify-center items-center gap-1 font-semibold text-gray-400 text-[16px]" 
                        href={nft.website_link} 
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <i className="fi fi-ss-globe leading-[0px]"></i>Website
                      </a>
                    )}
                  </div>

                  <div className="border border-gray-500/50 rounded-md p-3 my-3">
                    <div className="flex items-center">
                      <div className="flex-auto">
                        <h1 className="font-semibold text-white text-[14px]">Validity: {nft.validity_days} Days</h1>
                        <h1 className="font-semibold text-white text-[14px]">Profit: {nft.min_profit_percentage}% - {nft.max_profit_percentage}%</h1>
                        <h1 className="font-semibold text-white text-[14px]">Invest Limit: {currencySymbol}{nft.min_invest_limit} - {currencySymbol}{nft.max_invest_limit}</h1>
                      </div>
                      <div 
                        className="bg-lime-600 hover:bg-lime-500 text-white text-center rounded-[8px] px-3 py-2 !w-[120px] cursor-pointer"
                        onClick={handleInvestClick}
                      >
                        Invest Now
                      </div>
                    </div>
                  </div>

                  {nft.details && (
                    <div className="my-3">
                      <h1 className="font-semibold text-justify text-gray-200 text-[16px]">
                        {nft.details}
                      </h1>
                    </div>
                  )}
                </>
              ) : null}
            </div>

            {/* Investment Modal */}
            {showInvestModal && (
              <div className="fixed inset-0 z-50 flex justify-center items-center w-full h-full bg-gray-900/60">
                <div className="relative p-4 w-full max-w-md max-h-full">
                  <div className="relative bg-white rounded-lg shadow !bg-gray-800">
                    <button 
                      type="button" 
                      className="absolute top-3 end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
                      onClick={() => setShowInvestModal(false)}
                    >
                      <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"></path>
                      </svg>
                      <span className="sr-only">Close modal</span>
                    </button>
                    <form>
                      <div className="p-4 md:p-5 text-center">
                        <h3 className="mb-5 text-lg font-bold text-lime-500">Invest on this NFT</h3>
                        <div>
                          <input 
                            type="range" 
                            className="range" 
                            step="1" 
                            value={investAmount} 
                            min={nft.min_invest_limit} 
                            max={nft.max_invest_limit}
                            onChange={handleSliderChange}
                          />
                          <div className="flex w-full justify-between px-2 text-xs">
                            <span><span>|</span><br/>{currencySymbol}{nft.min_invest_limit}</span>
                            <span><span>|</span><br/>{currencySymbol}{Math.round(nft.min_invest_limit + (nft.max_invest_limit - nft.min_invest_limit) * 0.2)}</span>
                            <span><span>|</span><br/>{currencySymbol}{Math.round(nft.min_invest_limit + (nft.max_invest_limit - nft.min_invest_limit) * 0.4)}</span>
                            <span><span>|</span><br/>{currencySymbol}{Math.round(nft.min_invest_limit + (nft.max_invest_limit - nft.min_invest_limit) * 0.6)}</span>
                            <span><span>|</span><br/>{currencySymbol}{Math.round(nft.min_invest_limit + (nft.max_invest_limit - nft.min_invest_limit) * 0.8)}</span>
                            <span><span>|</span><br/>{currencySymbol}{nft.max_invest_limit}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between my-3">
                          <h1 className="font-semibold text-white text-[16px] text-left">
                            Amount: {currencySymbol}{investAmount}<br/>
                            <span className="text-[12px] text-gray-400 font-normal">Current Balance: {currencySymbol}{userBalance || 0}</span>
                          </h1>
                          <h1 className="font-semibold text-white text-[16px]">
                            Profit: {nft.min_profit_percentage}% - {nft.max_profit_percentage}%
                          </h1>
                        </div>
                        <button 
                          type="button" 
                          className="text-white bg-lime-600 hover:bg-lime-800 focus:ring-4 focus:outline-none font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center disabled:opacity-50"
                          onClick={handleInvestSubmit}
                          disabled={investMutation.isPending}
                        >
                          {investMutation.isPending ? 'Investing...' : 'Invest Now'}
                        </button>
                        <button 
                          type="button" 
                          className="py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-rose-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                          onClick={() => setShowInvestModal(false)}
                        >
                          No, cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </div>

          
        </div>
      </div>
    </div>
  );
};

export default NftDetails;
