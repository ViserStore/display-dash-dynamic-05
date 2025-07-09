
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import BottomNavigation from '../components/BottomNavigation';
import CustomPagination from '../components/CustomPagination';

interface NFT {
  id: string;
  title: string;
  image_url: string | null;
  min_invest_limit: number;
  max_invest_limit: number;
  details: string | null;
  is_verified: boolean;
  status: string;
}

const AllNfts = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data: nfts, isLoading, error } = useQuery({
    queryKey: ['nfts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('nfts')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as NFT[];
    }
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

  // Pagination logic
  const totalItems = nfts?.length || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentNfts = nfts?.slice(startIndex, endIndex) || [];

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleGoToPage = (page: number) => {
    setCurrentPage(page);
  };

  const currencySymbol = siteSettings?.currency_symbol || '$';
  const siteCurrency = siteSettings?.site_currency || 'USDT';

  if (isLoading) {
    return (
      <div className="relative min-h-[100vh] bg-black mx-auto max-w-[480px] overflow-y-hidden">
        <div className="min-h-[100vh] pt-[0px] pb-[63px]">
          <div className="relative z-[1]">
        
            {/* Header Section */}
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
                    <h1 className="text-white font-bold">All NFTs</h1>
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

            {/* Loading State */}
            <div className="overflow-auto h-[calc(100vh-153px)]">
              <div className="absolute top-[50%] translate-y-[-50%] left-[50%] translate-x-[-50%] flex flex-col items-center justify-center gap-2">
                <img className="invert opacity-25 w-[50px]" src="https://cdn-icons-png.flaticon.com/128/9332/9332404.png" alt="" />
                <div className="text-white text-[12px] font-semibold">Loading...</div>
              </div>
            </div>

            
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative min-h-[100vh] bg-black mx-auto max-w-[480px] overflow-y-hidden">
        <div className="flex items-center justify-center h-screen">
          <div className="text-red-500">Error loading NFTs</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[100vh] bg-black mx-auto max-w-[480px] overflow-y-hidden">
      <div className="min-h-[100vh] pt-[0px] pb-[63px]">
        <div className="relative z-[1]">
  

          {/* Header Section */}
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
                  <h1 className="text-white font-bold">All NFTs</h1>
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

          {/* NFTs List */}
          <div className="overflow-auto h-[calc(100vh-153px)]">
            <div className="grid gap-2">
              {currentNfts && currentNfts.length > 0 ? (
                currentNfts.map((nft) => (
                  <div key={nft.id} className="flex gap-4 bg-gray-950 p-2 border-b border-gray-700">
                    <img 
                      className="w-[45%] rounded-md" 
                      src={nft.image_url || '/placeholder.svg'} 
                      alt={nft.title}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder.svg';
                      }}
                    />
                    <div className="flex-auto">
                      <h1 className="font-bold text-lime-500 hover:text-lime-400 text-[20px]">{nft.title}</h1>
                      <h1 className="font-semibold text-white text-[12px] mb-2">
                        Invest Limit: {currencySymbol}{nft.min_invest_limit} - {currencySymbol}{nft.max_invest_limit}
                      </h1>
                      {nft.is_verified && (
                        <h1 className="flex items-center gap-1 font-bold text-lime-500 hover:text-lime-400 text-[10px] my-2">
                          <i className="fi fi-sr-badge-check text-[16px] leading-[0px]"></i> verified
                        </h1>
                      )}
                      <h1 className="font-semibold text-gray-400 text-[12px] mt-2">
                        {nft.details ? (nft.details.length > 50 ? `${nft.details.substring(0, 50)}...` : nft.details) : 'No description available'}
                      </h1>
                      <div className="mt-4">
                        <Link 
                          className="bg-gray-900 hover:bg-gray-800 text-white text-center rounded-[8px] px-3 py-2 !w-[120px] cursor-pointer" 
                          to={`/nft/${nft.id}`}
                        >
                          Read More
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="absolute top-[50%] translate-y-[-50%] left-[50%] translate-x-[-50%] flex flex-col items-center justify-center gap-2">
                  <img className="invert opacity-25 w-[50px]" src="https://cdn-icons-png.flaticon.com/128/9332/9332404.png" alt="" />
                  <div className="text-white text-[12px] font-semibold">No NFTs available at the moment</div>
                </div>
              )}
            </div>
          </div>

          {/* Pagination */}
          <CustomPagination
            currentPage={currentPage}
            totalPages={totalPages}
            hasNextPage={currentPage < totalPages}
            hasPreviousPage={currentPage > 1}
            onNextPage={handleNextPage}
            onPreviousPage={handlePreviousPage}
            onGoToPage={handleGoToPage}
          />

          
        </div>
      </div>
    </div>
  );
};

export default AllNfts;
