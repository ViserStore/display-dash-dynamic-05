import React from 'react';
import { Link } from 'react-router-dom';
import { useUserData } from '@/contexts/UserDataContext';
import BottomNavigation from "../components/BottomNavigation";

const Wallet = () => {
  const { userData, coins, siteSettings, isLoading } = useUserData();

  const handleDrawerToggle = () => {
    const drawer = document.getElementById('drawer-navigation');
    if (drawer) {
      drawer.classList.toggle('-translate-x-full');
    }
  };

  // Skeleton loading component
  const SkeletonLoader = () => (
    <>
      {Array.from({ length: 10 }).map((_, index) => (
        <div key={index} className="flex items-center gap-3 border-b border-gray-700/60 py-3 opacity-35">
          <div className="animate-pulse w-[40px] h-[40px] rounded-[50%] border-t-[2px] border-gray-200 bg-gray-400 shadow-sm shadow-lime-500"></div>
          <div className="flex-auto">
            <h1 className="animate-pulse text-[16px] font-bold bg-gray-400 w-[80px] h-[20px] rounded-[5px] mb-[5px]"></h1>
            <h1 className="animate-pulse text-[11px] bg-gray-500 w-[120px] h-[16px] rounded-[5px]"></h1>
          </div>
          <div className="text-end">
            <h1 className="animate-pulse text-[16px] font-bold bg-gray-400 w-[120px] h-[20px] rounded-[5px] mb-[5px]"></h1>
            <h1 className="animate-pulse text-[11px] bg-gray-500 w-[60px] h-[16px] rounded-[5px] place-self-end"></h1>
          </div>
        </div>
      ))}
    </>
  );

  return (
    <div className="relative min-h-[100vh] mx-auto max-w-[480px] bg-black overflow-y-hidden">
      <div className="min-h-[100vh] pt-[0px] pb-[63px]">
        <div className="_relative_lq8ol_15 _z-[1]_lq8ol_510">
          {/* Header Section - Show immediately */}
          <div className="_relative_lq8ol_15 overflow-hidden mb-[10px]">
            <div className="image-bg _z-[1]_lq8ol_510"></div>
            <div className="_relative_lq8ol_15 _z-[2]_lq8ol_550 bg-white/10 rounded-b-[30px]">
              <div className="px-[15px] py-[15px] relative z-[2] rounded-b-[30px] undefined">
                <div className="_flex_lq8ol_19 _gap-3_lq8ol_180 _items-center_lq8ol_27 _justify-between_lq8ol_31">
                  <div className="_flex_lq8ol_19 _gap-2_lq8ol_43 _items-center_lq8ol_27 bg-black/20 _border_lq8ol_234 border-gray-500/50 blackdrop-blur _rounded-full_lq8ol_119 pe-[10px]">
                    <img className="w-[48px] _aspect-square_lq8ol_685 _border_lq8ol_234 border-gray-500/50 _rounded-full_lq8ol_119" src="https://img.freepik.com/premium-photo/3d-cartoon-avatar-man-minimal-3d-character_652053-2070.jpg" alt="" />
                    <h1 className="_text-white_lq8ol_196">{userData.username || 'User'}</h1>
                    <img className="_w-[15px]_lq8ol_272 _aspect-square_lq8ol_685 invert" src="https://cdn-icons-png.flaticon.com/128/2985/2985179.png" alt="" />
                  </div>
                  <Link className="_flex_lq8ol_19 _gap-2_lq8ol_43 _items-center_lq8ol_27 bg-black/20 _border_lq8ol_234 border-gray-500/50 blackdrop-blur _rounded-full_lq8ol_119 p-[10px]" to="/settings">
                    <img className="w-[28px] _aspect-square_lq8ol_685 invert animate-spin cursor-pointer" src="https://cdn-icons-png.flaticon.com/128/10613/10613709.png" alt="" onClick={handleDrawerToggle} />
                  </Link>
                </div>
              </div>

              {/* Balance Card - Show immediately with real data */}
              <div className="px-[15px] pb-[15px]">
                <div className="bg-lime-400 _rounded-[20px]_lq8ol_379 p-5 mt-1">
                  <div className="_flex_lq8ol_19 _items-center_lq8ol_27 _justify-between_lq8ol_31">
                    <div>
                      <h1 className="_text-[16px]_lq8ol_201 text-normal text-lime-900/70">Total Balance</h1>
                      <h1 className="text-[36px] text-normal _font-bold_lq8ol_110 text-black">
                        {`${siteSettings.currency_symbol || '$'}${userData.balance?.toFixed(2) || '0.00'}`}
                      </h1>
                    </div>
                    <div>
                      <h1 className="_text-[10px]_lq8ol_131 _text-end_lq8ol_531 text-normal text-lime-900/70">Pay Id</h1>
                      <h1 className="_text-[14px]_lq8ol_407 _text-end_lq8ol_531 text-normal _font-bold_lq8ol_110 text-lime-700">
                        {userData.pay_id || 'Not Set'}
                      </h1>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="_grid_lq8ol_157 grid-cols-4 _gap-3_lq8ol_180 _mt-3_lq8ol_94">
                    <Link className="_grid_lq8ol_157 _justify-items-center_lq8ol_578" to="/deposit">
                      <div className="w-[62px] h-[62px] _aspect-square_lq8ol_685 bg-black _rounded-full_lq8ol_119 p-[20px]">
                        <img className="_w-full_lq8ol_247 h-full invert" src="https://cdn-icons-png.flaticon.com/128/9678/9678508.png" alt="" />
                      </div>
                      <h1 className="text-black _text-[14px]_lq8ol_407 _mt-2_lq8ol_135">Deposit</h1>
                    </Link>
                    <Link className="_grid_lq8ol_157 _justify-items-center_lq8ol_578" to="/withdraw">
                      <div className="w-[62px] h-[62px] _aspect-square_lq8ol_685 bg-black _rounded-full_lq8ol_119 p-[20px]">
                        <img className="_w-full_lq8ol_247 h-full invert" src="https://cdn-icons-png.flaticon.com/128/9678/9678548.png" alt="" />
                      </div>
                      <h1 className="text-black _text-[14px]_lq8ol_407 _mt-2_lq8ol_135">Withdraw</h1>
                    </Link>
                    <Link className="_grid_lq8ol_157 _justify-items-center_lq8ol_578" to="/balance-transfer">
                      <div className="w-[62px] h-[62px] _aspect-square_lq8ol_685 bg-black _rounded-full_lq8ol_119 p-[20px]">
                        <img className="_w-full_lq8ol_247 h-full invert" src="https://cdn-icons-png.flaticon.com/128/9678/9678550.png" alt="" />
                      </div>
                      <h1 className="text-black _text-[14px]_lq8ol_407 _mt-2_lq8ol_135">Transfer</h1>
                    </Link>
                    <Link className="_grid_lq8ol_157 _justify-items-center_lq8ol_578" to="/leaderboard">
                      <div className="w-[62px] h-[62px] _aspect-square_lq8ol_685 bg-black _rounded-full_lq8ol_119 p-[20px]">
                        <img className="_w-full_lq8ol_247 h-full invert" src="https://cdn-icons-png.flaticon.com/128/13310/13310318.png" alt="" />
                      </div>
                      <h1 className="text-black _text-[14px]_lq8ol_407 _mt-2_lq8ol_135">Leaderboard</h1>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Balances Section */}
        <div className="backdrop-blur">
          <div className="_container_lq8ol_465 _mx-auto_lq8ol_1 px-[12px] _mt-2_lq8ol_135">
            <div className="flex items-center justify-between mb-3">
              <h1 className="_text-sm_lq8ol_214 _font-bold_lq8ol_110 text-gray-400">Balances</h1>
            </div>
            <div className="h-[calc(100vh-415px)] overflow-scroll">
              {isLoading ? (
                <SkeletonLoader />
              ) : coins.length > 0 ? (
                coins.map(coin => (
                  <div key={coin.id} className="flex items-center gap-3 border-b border-gray-700/60 py-3">
                    <img 
                      className="w-[40px] h-[40px] rounded-[50%] border-t-[2px] border-gray-200 bg-white shadow-sm shadow-lime-500" 
                      src={coin.image_url || "/assets/default-hiMwPs0P.png"} 
                      alt={coin.symbol} 
                      onError={(e) => {
                        e.currentTarget.src = "/assets/default-hiMwPs0P.png";
                      }} 
                    />
                    <div className="flex-auto">
                      <h1 className="text-[16px] font-bold text-white">
                        {coin.symbol}
                        <span className="text-gray-300 text-[14px] font-normal">/{siteSettings.site_currency || 'USDT'}</span>
                      </h1>
                      <h1 className="text-[11px] text-gray-500">{coin.symbol} /{siteSettings.site_currency || 'TetherUS'}</h1>
                    </div>
                    <div className="text-end">
                      <h1 className="text-[16px] font-bold text-white">0.000000</h1>
                      <h1 className="text-[11px] text-end font-medium text-gray-500">≈ 0.000{siteSettings.currency_symbol || '$'}</h1>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <p>No assets available</p>
                  <p className="text-sm mt-2">Start trading to see your balances</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <BottomNavigation />
    </div>
  );
};

export default Wallet;
