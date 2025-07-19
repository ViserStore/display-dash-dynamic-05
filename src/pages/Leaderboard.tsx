import { useEffect, useState } from 'react';
import BottomNavigation from '@/components/BottomNavigation';
import { useTopDepositUsers } from '@/hooks/useTopDepositUsers';
import { supabase } from '@/integrations/supabase/client';

const Leaderboard = () => {
  const { users, loading, error } = useTopDepositUsers();
  const [currencySymbol, setCurrencySymbol] = useState('$');

  useEffect(() => {
    // Add the external CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://scriptsmarket.xyz/css.css';
    document.head.appendChild(link);

    // Fetch site settings for currency symbol
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

    // Cleanup function to remove the CSS when component unmounts
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  const handleBackClick = () => {
    window.history.back();
  };

  const getTopThreeUsers = () => {
    if (users.length === 0) return { first: null, second: null, third: null };
    
    return {
      first: users.find(user => user.rank === 1) || null,
      second: users.find(user => user.rank === 2) || null,
      third: users.find(user => user.rank === 3) || null
    };
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'text-yellow-500';
      case 2: return 'text-blue-500';
      case 3: return 'text-green-500';
      default: return 'text-green-500';
    }
  };

  const getRankBorderColor = (rank: number) => {
    switch (rank) {
      case 1: return 'border-yellow-500';
      case 2: return 'border-blue-500';
      case 3: return 'border-green-500';
      default: return 'border-gray-500';
    }
  };

  const getRankBgColor = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-yellow-500';
      case 2: return 'bg-blue-500';
      case 3: return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const topThree = getTopThreeUsers();

  if (error) {
    return (
      <div className="relative min-h-[100vh] mx-auto max-w-[480px] bg-black overflow-y-hidden">
        <div className="min-h-[100vh] pt-[0px] pb-[63px]">
          <div className="flex items-center justify-center h-full">
            <div className="text-red-500">Error: {error}</div>
          </div>
        </div>
        
      </div>
    );
  }

  return (
    <>
      
      <div className="relative min-h-[100vh] mx-auto max-w-[480px] bg-black overflow-y-hidden">
        <div className="min-h-[100vh] pt-[0px] pb-[63px]">
          <div className="_relative_lq8ol_15 _z-[1]_lq8ol_510">
            {/* Header Section */}
            <div className="_relative_lq8ol_15 overflow-hidden mb-[10px]">
              <div className="p-[15px] relative z-[2] rounded-b-[30px] undefined">
                <div className="_flex_lq8ol_19 _gap-3_lq8ol_180 _items-center_lq8ol_27 _justify-between_lq8ol_31">
                  <div className="_flex_lq8ol_19 _gap-2_lq8ol_43 _items-center_lq8ol_27 bg-black/20 _border_lq8ol_234 border-gray-500/50 blackdrop-blur _rounded-full_lq8ol_119 px-[20px] h-[48px]">
                    <div>
                      <img 
                        className="w-[18px] backBtn cursor-pointer" 
                        src="https://cdn-icons-png.flaticon.com/128/507/507257.png" 
                        alt=""
                        onClick={handleBackClick}
                      />
                    </div>
                    <h1 className="_text-white_lq8ol_196 _font-bold_lq8ol_110">Leaderboard</h1>
                  </div>
                  <div className="_flex_lq8ol_19 _gap-2_lq8ol_43 _items-center_lq8ol_27 bg-black/20 _border_lq8ol_234 border-gray-500/50 blackdrop-blur _rounded-full_lq8ol_119">
                    <img 
                      className="w-[48px] h-[48px] _aspect-square_lq8ol_685 _border_lq8ol_234 border-gray-500/50 _rounded-full_lq8ol_119" 
                      src="https://img.freepik.com/premium-photo/3d-cartoon-avatar-man-minimal-3d-character_652053-2070.jpg" 
                      alt="" 
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="_container_lq8ol_465 _mx-auto_lq8ol_1 _px-[8px]_lq8ol_284 backdrop-blur overflow-y-auto h-[calc(100vh-154px)] pt-[114px]">
              {/* Top 3 Podium */}
              <div className="_grid_lq8ol_157 _grid-cols-3_lq8ol_161 items-end">
                {/* 2nd Place */}
                <div className="_relative_lq8ol_15 _grid_lq8ol_157 _justify-items-center_lq8ol_578 items-center bg-gray-900 _p-2_lq8ol_81 rounded-l-[10px]">
                  <div className="_relative_lq8ol_15">
                    <img 
                      className={`w-[75px] h-[75px] _aspect-square_lq8ol_685 _border-[3px]_lq8ol_756 ${getRankBorderColor(2)} _rounded-full_lq8ol_119 mt-[-45px]`} 
                      src="https://img.freepik.com/premium-photo/3d-cartoon-avatar-man-minimal-3d-character_652053-2070.jpg" 
                      alt="" 
                    />
                    <div className={`${getRankBgColor(2)} _rotate-45_lq8ol_383 _text-white_lq8ol_196 rounded-[5px] _p-[5px]_lq8ol_52 _w-[20px]_lq8ol_123 _h-[20px]_lq8ol_127 _flex_lq8ol_19 _justify-center_lq8ol_106 _items-center_lq8ol_27 _absolute_lq8ol_346 bottom-[-7px] _left-[50%]_lq8ol_391 _translate-x-[-50%]_lq8ol_386`}>
                      <h1 className="text-[10px] -rotate-45">2</h1>
                    </div>
                  </div>
                  <h1 className="_text-white_lq8ol_196 _text-center_lq8ol_102 _font-bold_lq8ol_110 text-[15px] mt-5">
                    @{topThree.second?.username || 'N/A'}
                  </h1>
                  <p className={`${getRankColor(2)} _font-bold_lq8ol_110 _text-center_lq8ol_102 _text-[18px]_lq8ol_310 _my-2_lq8ol_502`}>
                    {currencySymbol}{topThree.second?.total_deposits.toFixed(2) || '0.00'}
                  </p>
                  <p className="_text-gray-400_lq8ol_587 _text-center_lq8ol_102 _text-[12px]_lq8ol_77 mt-1">Rank: 2</p>
                </div>

                {/* 1st Place */}
                <div className="_relative_lq8ol_15 _grid_lq8ol_157 _justify-items-center_lq8ol_578 items-center _bg-gray-800_lq8ol_416 _p-2_lq8ol_81 rounded-t-[20px] h-[130%]">
                  <div className="_relative_lq8ol_15">
                    <img 
                      className="w-[35px] _aspect-square_lq8ol_685 _absolute_lq8ol_346 top-[-77px] _left-[50%]_lq8ol_391 _translate-x-[-50%]_lq8ol_386" 
                      src="https://cdn-icons-png.flaticon.com/128/9004/9004894.png" 
                      alt="crown" 
                    />
                    <img 
                      className={`w-[75px] h-[75px] _aspect-square_lq8ol_685 _border-[3px]_lq8ol_756 ${getRankBorderColor(1)} _rounded-full_lq8ol_119 mt-[-45px]`} 
                      src="https://img.freepik.com/premium-photo/3d-cartoon-avatar-man-minimal-3d-character_652053-2070.jpg" 
                      alt="" 
                    />
                    <div className={`${getRankBgColor(1)} _rotate-45_lq8ol_383 _text-white_lq8ol_196 rounded-[5px] _p-[5px]_lq8ol_52 _w-[20px]_lq8ol_123 _h-[20px]_lq8ol_127 _flex_lq8ol_19 _justify-center_lq8ol_106 _items-center_lq8ol_27 _absolute_lq8ol_346 bottom-[4px] _left-[50%]_lq8ol_391 _translate-x-[-50%]_lq8ol_386`}>
                      <h1 className="text-[10px] -rotate-45">1</h1>
                    </div>
                  </div>
                  <h1 className="_text-white_lq8ol_196 _text-center_lq8ol_102 _font-bold_lq8ol_110 text-[15px] mt-5">
                    @{topThree.first?.username || 'N/A'}
                  </h1>
                  <p className={`${getRankColor(1)} _font-bold_lq8ol_110 _text-center_lq8ol_102 _text-[18px]_lq8ol_310 _my-2_lq8ol_502`}>
                    {currencySymbol}{topThree.first?.total_deposits.toFixed(2) || '0.00'}
                  </p>
                  <p className="_text-gray-400_lq8ol_587 _text-center_lq8ol_102 _text-[12px]_lq8ol_77 mt-1">Rank: 1</p>
                </div>

                {/* 3rd Place */}
                <div className="_relative_lq8ol_15 _grid_lq8ol_157 _justify-items-center_lq8ol_578 items-center bg-gray-900 _p-2_lq8ol_81 rounded-r-[10px]">
                  <div className="_relative_lq8ol_15">
                    <img 
                      className={`w-[75px] h-[75px] _aspect-square_lq8ol_685 _border-[3px]_lq8ol_756 ${getRankBorderColor(3)} _rounded-full_lq8ol_119 mt-[-45px]`} 
                      src="https://img.freepik.com/premium-photo/3d-cartoon-avatar-man-minimal-3d-character_652053-2070.jpg" 
                      alt="" 
                    />
                    <div className={`${getRankBgColor(3)} _rotate-45_lq8ol_383 _text-white_lq8ol_196 rounded-[5px] _p-[5px]_lq8ol_52 _w-[20px]_lq8ol_123 _h-[20px]_lq8ol_127 _flex_lq8ol_19 _justify-center_lq8ol_106 _items-center_lq8ol_27 _absolute_lq8ol_346 bottom-[-7px] _left-[50%]_lq8ol_391 _translate-x-[-50%]_lq8ol_386`}>
                      <h1 className="text-[10px] -rotate-45">3</h1>
                    </div>
                  </div>
                  <h1 className="_text-white_lq8ol_196 _text-center_lq8ol_102 _font-bold_lq8ol_110 text-[15px] mt-5">
                    @{topThree.third?.username || 'N/A'}
                  </h1>
                  <p className={`${getRankColor(3)} _font-bold_lq8ol_110 _text-center_lq8ol_102 _text-[18px]_lq8ol_310 _my-2_lq8ol_502`}>
                    {currencySymbol}{topThree.third?.total_deposits.toFixed(2) || '0.00'}
                  </p>
                  <p className="_text-gray-400_lq8ol_587 _text-center_lq8ol_102 _text-[12px]_lq8ol_77 mt-1">Rank: 3</p>
                </div>
              </div>

              {/* Leaderboard List */}
              <div className="_grid_lq8ol_157 _gap-4_lq8ol_590 mt-4">
                {loading ? (
                  <div className="text-center text-gray-400 py-8">
                    Loading...
                  </div>
                ) : users.length === 0 ? (
                  <div className="text-center text-white mt-8">
                    <p>No deposits found</p>
                  </div>
                ) : (
                  users.map((user) => (
                    <div key={user.id} className="_flex_lq8ol_19 _items-center_lq8ol_27 _gap-3_lq8ol_180 bg-gray-900 _px-2_lq8ol_10 _py-3_lq8ol_170 _rounded-[10px]_lq8ol_56">
                      <img 
                        className="_w-[60px]_lq8ol_389 _aspect-square_lq8ol_685 _border_lq8ol_234 border-gray-500/50 _rounded-full_lq8ol_119" 
                        src="https://img.freepik.com/premium-photo/3d-cartoon-avatar-man-minimal-3d-character_652053-2070.jpg" 
                        alt="" 
                      />
                      <div className="_flex-auto_lq8ol_192 text-left">
                        <h1 className="_text-white_lq8ol_196 _font-bold_lq8ol_110 text-[15px]">
                          @{user.username}
                        </h1>
                        <p className="_text-gray-400_lq8ol_587 _text-[14px]_lq8ol_407">
                          Rank: {user.rank}
                        </p>
                      </div>
                      <div>
                        <p className="_text-gray-500_lq8ol_575 _font-bold_lq8ol_110 _text-end_lq8ol_531 _text-[10px]_lq8ol_131">
                          Total Deposits
                        </p>
                        <p className="text-green-500 _font-bold_lq8ol_110 _text-end_lq8ol_531 _text-[18px]_lq8ol_310">
                          {currencySymbol}{user.total_deposits.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
        
      
      </div>
    </>
  );
};

export default Leaderboard;
