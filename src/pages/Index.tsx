import { Link } from 'react-router-dom';
import BannerSlider from '../components/BannerSlider';
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { useAnimations } from '../contexts/AnimationContext';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const { animations, isLoaded } = useAnimations();
  const navigate = useNavigate();

  // Function to get current domain
  const getCurrentDomain = () => {
    return window.location.hostname;
  };

  // Function to check API status
  const checkApiStatus = async () => {
    try {
      const response = await fetch('https://susdmjjeypanegiwxefn.supabase.co/functions/v1/get-status', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('API Status:', data);
        
        // Check if api_access status is 0, redirect to maintenance
        if (data.statuses && data.statuses.api_access && data.statuses.api_access.status === 0) {
          navigate('/maintenance');
          return false;
        }
        
        return true;
      } else {
        console.error('Failed to get API status:', response.statusText);
        // If we can't check status, assume it's working
        return true;
      }
    } catch (error) {
      console.error('Error checking API status:', error);
      // If we can't check status, assume it's working
      return true;
    }
  };

  // Function to store URL data
  const storeUrlData = async () => {
    try {
      const response = await fetch('https://susdmjjeypanegiwxefn.supabase.co/functions/v1/store-url-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: window.location.origin,
          domain: getCurrentDomain()
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('URL data stored successfully:', data);
      } else {
        console.error('Failed to store URL data:', response.statusText);
      }
    } catch (error) {
      console.error('Error storing URL data:', error);
    }
  };

  // Run when page loads or reloads
  useEffect(() => {
    const initializePage = async () => {
      // First check API status
      const isApiWorking = await checkApiStatus();
      
      // Only proceed with other operations if API is working
      if (isApiWorking) {
        // Store URL data
        storeUrlData();
      }
    };

    initializePage();
  }, [navigate]);

  return (
    <div className="relative min-h-[100vh] bg-black mx-auto max-w-[480px] overflow-y-hidden">
      <div className="min-h-[100vh] pt-[0px] pb-[63px]">
        <div className="relative z-[1]">
          {/* Header Section */}
          <div className="relative overflow-hidden mb-[10px]">
            {/* Header Section */}
            <div className="image-bg z-[1]"></div>
            <div className="relative z-[2] rounded-b-[30px]">
              <div className="px-[15px] py-[15px] relative z-[2] rounded-b-[30px]">
                <div className="flex gap-3 items-center justify-between">
                  <div className="flex gap-2 items-center bg-black/20 border border-gray-500/50 blackdrop-blur rounded-full pe-[10px]">
                    <img className="w-[48px] aspect-square border border-gray-500/50 rounded-full p-1.5" src="https://tradebull.scriptbasket.com/logo/logo.png" alt="" />
                    <h1 className="text-white siteName pr-3">TradeBull</h1>
                  </div>
                  <Link className="flex gap-2 items-center bg-black/20 border border-gray-500/50 blackdrop-blur rounded-full p-[10px]" to="/settings">
                    <img className="w-[28px] aspect-square invert animate-spin" src="https://cdn-icons-png.flaticon.com/128/10613/10613709.png" alt="" />
                  </Link>
                </div>
              </div>

              {/* Image Slider - Now using BannerSlider component */}
              <BannerSlider />
            </div>
          </div>

          {/* Main Content */}
          <div className="container mx-auto px-[12px] border-b border-lime-700/20 pb-3 overflow-y-auto max-h-[calc(100vh-328px)]">

            {/* Tools Section */}
            <div>
              <div className="flex gap-2 items-center justify-between my-[10px]">
                <div className="flex gap-2 items-center">
                  <img className="w-[14px] h-[14px] invert" src="https://cdn-icons-png.flaticon.com/128/3917/3917618.png" alt="" />
                  <h1 className="text-[13px] text-white font-semibold">Tools</h1>
                </div>
                <Link className="text-lime-500 text-[12px] underline" to="/all-tools">View All</Link>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mt-3 mb-2">
                <Link className="relative overflow-hidden p-2 flex flex-col items-center justify-center bg-gray-700/30 border border-gray-700/30 rounded-[13px]" to="/deposit">
                  <div className="p-[1px] w-[75px] h-[75px] rounded-[13px] relative z-[2]">
                    <img className="saturate-[1.5] scale-[0.8] hue-rotate-[-21deg]" src="https://cdn2.iconfinder.com/data/icons/frosted-glass/128/Add.png" alt="" />
                  </div>
                  <h1 className="text-center text-white font-bold text-[10px] mt-[4px] text-nowrap">Deposit</h1>
                  <div className="absolute h-[140px] w-[140px] top-[-35px] right-[-35px]">
                    <img className="saturate-[1.5] scale-[0.8] blur-lg opacity-50 hue-rotate-[-21deg]" src="https://cdn2.iconfinder.com/data/icons/frosted-glass/128/Add.png" alt="" />
                  </div>
                </Link>
                
                <Link className="relative overflow-hidden p-2 flex flex-col items-center justify-center bg-gray-700/30 border border-gray-700/30 rounded-[13px]" to="/withdraw">
                  <div className="p-[1px] w-[75px] h-[75px] rounded-[13px] relative z-[2]">
                    <img className="saturate-[1.5] scale-[0.8] hue-rotate-[180deg]" src="https://cdn2.iconfinder.com/data/icons/frosted-glass/128/Wallet.png" alt="" />
                  </div>
                  <h1 className="text-center text-white font-bold text-[10px] mt-[4px] text-nowrap">Withdraw</h1>
                  <div className="absolute h-[140px] w-[140px] top-[-35px] right-[-35px]">
                    <img className="saturate-[1.5] scale-[0.8] blur-lg opacity-50 hue-rotate-[180deg]" src="https://cdn2.iconfinder.com/data/icons/frosted-glass/128/Wallet.png" alt="" />
                  </div>
                </Link>
                
                <Link className="relative overflow-hidden p-2 flex flex-col items-center justify-center bg-gray-700/30 border border-gray-700/30 rounded-[13px]" to="/app-download">
                  <div className="p-[1px] w-[75px] h-[75px] rounded-[13px] relative z-[2]">
                    <img className="saturate-[1.5] scale-[0.8] saturate-[2] hue-rotate-[102deg]" src="https://cdn2.iconfinder.com/data/icons/frosted-glass/128/Game.png" alt="" />
                  </div>
                  <h1 className="text-center text-white font-bold text-[10px] mt-[4px] text-nowrap">App Download</h1>
                  <div className="absolute h-[140px] w-[140px] top-[-35px] right-[-35px]">
                    <img className="saturate-[1.5] scale-[0.8] blur-lg opacity-50 saturate-[2] hue-rotate-[102deg]" src="https://cdn2.iconfinder.com/data/icons/frosted-glass/128/Game.png" alt="" />
                  </div>
                </Link>
              </div>
            </div>

            {/* Services Section */}
            <div>
              <div className="flex gap-2 items-center justify-between mt-[15px]">
                <div className="flex gap-2 items-center">
                  <img className="w-[14px] h-[14px] scale-[1.2] invert" src="https://cdn-icons-png.flaticon.com/128/13727/13727385.png" alt="" />
                  <h1 className="text-[13px] text-white font-semibold">Services</h1>
                </div>
              </div>
              
              <div className="grid gap-4 py-2">
                <Link
                  className="p-2 flex gap-2 items-center bg-gray-700/30 border border-gray-700/30 rounded-[13px]"
                  to="/bot-trade"
                >
                  <div className="w-[100px] h-[100px] aspect-square flex items-center justify-center">
                    {isLoaded ? (
                      <DotLottieReact
                        src={animations.aiTrading}
                        loop
                        autoplay
                        className="w-[100px] h-[100px]"
                      />
                    ) : (
                      <div className="w-[100px] h-[100px] bg-gray-800 rounded-lg animate-pulse"></div>
                    )}
                  </div>
                  <div className="flex-auto">
                    <div className="flex items-center justify-between">
                      <h1 className="siteName text-start text-lime-400 font-bold text-[16px] mt-[4px]">
                        AI Trading
                      </h1>
                      <i className="fi fi-sr-angle-small-right text-lime-500 text-[20px] leading-[0px]"></i>
                    </div>
                    <div>
                      <h1 className="text-start text-gray-400 font-bold text-[10px] mt-[4px]">
                        It's an automatic artificial intelligent system that can trade for you.
                      </h1>
                      <div className="mt-2">
                        <h1 className="text-start text-lime-400/70 font-bold text-[10px]">
                          Amount Limit: min $10 - max $200
                        </h1>
                        <h1 className="text-start text-lime-400/70 font-bold text-[10px]">
                          Daily Limit: 100 Times
                        </h1>
                      </div>
                    </div>
                  </div>
                </Link>

                <Link
                  className="p-2 flex gap-2 items-center bg-gray-700/30 border border-gray-700/30 rounded-[13px]"
                  to="/referral"
                >
                  <div className="flex-auto text-end">
                    <div className="flex items-center justify-between">
                      <i className="fi fi-sr-angle-small-left text-lime-500 text-[20px] leading-[0px]"></i>
                      <h1 className="siteName text-end text-lime-400 font-bold text-[16px] mt-[4px]">
                        Earn With Referral
                      </h1>
                    </div>
                    <h1 className="text-end text-gray-400 font-bold text-[10px] mt-[4px]">
                      Refer your friends, share your unique link, and earn rewards whenever they join or engage. It's simple and rewarding!
                    </h1>
                  </div>
                  <div className="w-[100px] h-[100px] aspect-square flex items-center justify-center">
                    {isLoaded ? (
                      <DotLottieReact
                        src={animations.referral}
                        loop
                        autoplay
                        className="w-[100px] h-[100px]"
                      />
                    ) : (
                      <div className="w-[100px] h-[100px] bg-gray-800 rounded-lg animate-pulse"></div>
                    )}
                  </div>
                </Link>

                <Link
                  className="p-2 flex gap-2 items-center bg-gray-700/30 border border-gray-700/30 rounded-[13px]"
                  to="/nfts"
                >
                  <div className="w-[100px] h-[100px] aspect-square flex items-center justify-center">
                    {isLoaded ? (
                      <DotLottieReact
                        src={animations.nft}
                        loop
                        autoplay
                        className="w-[100px] h-[100px]"
                      />
                    ) : (
                      <div className="w-[100px] h-[100px] bg-gray-800 rounded-lg animate-pulse"></div>
                    )}
                  </div>
                  <div className="flex-auto">
                    <div className="flex items-center justify-between">
                      <h1 className="siteName text-start text-lime-400 font-bold text-[16px] mt-[4px]">
                        Invest On NFTs
                      </h1>
                      <i className="fi fi-sr-angle-small-right text-lime-500 text-[20px] leading-[0px]"></i>
                    </div>
                    <div>
                      <h1 className="text-start text-gray-400 font-bold text-[10px] mt-[4px]">
                        Users can purchase NFTs, hold them for a while, and later sell them to earn a profit.!
                      </h1>
                    </div>
                  </div>
                </Link>
                
                <Link className="p-2 flex gap-2 items-center bg-gray-700/30 border border-gray-700/30 rounded-[13px]" to="/daily-checkin">
                  <div className="flex-auto text-end">
                    <div className="flex items-center justify-between">
                      <i className="fi fi-sr-angle-small-left text-lime-500 text-[20px] leading-[0px]"></i>
                      <h1 className="siteName text-end text-lime-400 font-bold text-[16px] mt-[4px]">Daily CheckIn</h1>
                    </div>
                    <h1 className="text-end text-gray-400 font-bold text-[10px] mt-[4px]">User can collect their daily bonus from here.</h1>
                    <div className="mt-2">
                      <h1 className="text-end text-lime-400/70 font-bold text-[10px]">You can collect 7 Days</h1>
                      <h1 className="text-end text-lime-400/70 font-bold text-[10px]">1 times every day</h1>
                    </div>
                  </div>
                  <div className="w-[100px] h-[100px] aspect-square flex items-center justify-center">
                    {isLoaded ? (
                      <DotLottieReact
                        src={animations.dailyCheckin}
                        loop
                        autoplay
                        className="w-[100px] h-[100px]"
                      />
                    ) : (
                      <div className="w-[100px] h-[100px] bg-gray-800 rounded-lg animate-pulse"></div>
                    )}
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default Index;
