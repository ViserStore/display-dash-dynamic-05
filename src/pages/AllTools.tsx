
import React from 'react';
import { Link } from 'react-router-dom';
import BottomNavigation from '../components/BottomNavigation';
import PageHeader from '../components/PageHeader';

const AllTools = () => {
  const handleLogout = () => {
    // Handle logout functionality
    console.log('Logout clicked');
  };

  return (
    <div className="relative min-h-[100vh] bg-black mx-auto max-w-[480px] overflow-y-hidden">
      <div className="min-h-[100vh] pt-[0px] pb-[63px]">
        <div className="relative z-[1]">
        
          {/* Header */}
          <PageHeader title="All Tools" />

          {/* Tools Grid */}
          <div className="px-[10px]">
            <div className="grid grid-cols-3 gap-4 mt-3 mb-2">
              <Link className="relative overflow-hidden p-2 flex flex-col items-center justify-center bg-gray-700/30 border border-gray-700/30 rounded-[13px]" to="/deposit">
                <div className="p-[1px] w-[75px] h-[75px] rounded-[13px] relative z-[2]">
                  <img className="saturate-[1.5] scale-[0.8] saturate-[1.5] hue-rotate-[-21deg]" src="https://cdn2.iconfinder.com/data/icons/frosted-glass/128/Add.png" alt="" />
                </div>
                <h1 className="text-center text-white font-bold text-[10px] mt-[4px] text-nowrap">Deposit</h1>
                <div className="absolute h-[140px] w-[140px] top-[-35px] right-[-35px]">
                  <img className="saturate-[1.5] scale-[0.8] blur-lg opacity-50 saturate-[1.5] hue-rotate-[-21deg]" src="https://cdn2.iconfinder.com/data/icons/frosted-glass/128/Add.png" alt="" />
                </div>
              </Link>

              <Link className="relative overflow-hidden p-2 flex flex-col items-center justify-center bg-gray-700/30 border border-gray-700/30 rounded-[13px]" to="/deposit/logs">
                <div className="p-[1px] w-[75px] h-[75px] rounded-[13px] relative z-[2]">
                  <img className="saturate-[1.5] scale-[0.8] saturate-[1.5] hue-rotate-[50deg]" src="https://cdn2.iconfinder.com/data/icons/frosted-glass/128/Buy.png" alt="" />
                </div>
                <h1 className="text-center text-white font-bold text-[10px] mt-[4px] text-nowrap">Deposit Logs</h1>
                <div className="absolute h-[140px] w-[140px] top-[-35px] right-[-35px]">
                  <img className="saturate-[1.5] scale-[0.8] blur-lg opacity-50 saturate-[1.5] hue-rotate-[50deg]" src="https://cdn2.iconfinder.com/data/icons/frosted-glass/128/Buy.png" alt="" />
                </div>
              </Link>

              <Link className="relative overflow-hidden p-2 flex flex-col items-center justify-center bg-gray-700/30 border border-gray-700/30 rounded-[13px]" to="/withdraw">
                <div className="p-[1px] w-[75px] h-[75px] rounded-[13px] relative z-[2]">
                  <img className="saturate-[1.5] scale-[0.8] saturate-[1.5] hue-rotate-[180deg]" src="https://cdn2.iconfinder.com/data/icons/frosted-glass/128/Wallet.png" alt="" />
                </div>
                <h1 className="text-center text-white font-bold text-[10px] mt-[4px] text-nowrap">Withdraw</h1>
                <div className="absolute h-[140px] w-[140px] top-[-35px] right-[-35px]">
                  <img className="saturate-[1.5] scale-[0.8] blur-lg opacity-50 saturate-[1.5] hue-rotate-[180deg]" src="https://cdn2.iconfinder.com/data/icons/frosted-glass/128/Wallet.png" alt="" />
                </div>
              </Link>

              <Link className="relative overflow-hidden p-2 flex flex-col items-center justify-center bg-gray-700/30 border border-gray-700/30 rounded-[13px]" to="/withdraw/logs">
                <div className="p-[1px] w-[75px] h-[75px] rounded-[13px] relative z-[2]">
                  <img className="saturate-[1.5] scale-[0.8] saturate-[1.5] hue-rotate-[245deg]" src="https://cdn2.iconfinder.com/data/icons/frosted-glass/128/Buy.png" alt="" />
                </div>
                <h1 className="text-center text-white font-bold text-[10px] mt-[4px] text-nowrap">Withdraw Logs</h1>
                <div className="absolute h-[140px] w-[140px] top-[-35px] right-[-35px]">
                  <img className="saturate-[1.5] scale-[0.8] blur-lg opacity-50 saturate-[1.5] hue-rotate-[245deg]" src="https://cdn2.iconfinder.com/data/icons/frosted-glass/128/Buy.png" alt="" />
                </div>
              </Link>

              <Link className="relative overflow-hidden p-2 flex flex-col items-center justify-center bg-gray-700/30 border border-gray-700/30 rounded-[13px]" to="/nft-invests">
                <div className="p-[1px] w-[75px] h-[75px] rounded-[13px] relative z-[2]">
                  <img className="saturate-[1.5] scale-[0.8] saturate-[1.5] hue-rotate-[245deg]" src="https://cdn2.iconfinder.com/data/icons/frosted-glass/128/Activity.png" alt="" />
                </div>
                <h1 className="text-center text-white font-bold text-[10px] mt-[4px] text-nowrap">NFT Invests</h1>
                <div className="absolute h-[140px] w-[140px] top-[-35px] right-[-35px]">
                  <img className="saturate-[1.5] scale-[0.8] blur-lg opacity-50 saturate-[1.5] hue-rotate-[245deg]" src="https://cdn2.iconfinder.com/data/icons/frosted-glass/128/Activity.png" alt="" />
                </div>
              </Link>

              <Link className="relative overflow-hidden p-2 flex flex-col items-center justify-center bg-gray-700/30 border border-gray-700/30 rounded-[13px]" to="/transfer/logs">
                <div className="p-[1px] w-[75px] h-[75px] rounded-[13px] relative z-[2]">
                  <img className="saturate-[1.5] scale-[0.8] saturate-[1.5] hue-rotate-[5deg]" src="https://cdn2.iconfinder.com/data/icons/frosted-glass/128/Clock.png" alt="" />
                </div>
                <h1 className="text-center text-white font-bold text-[10px] mt-[4px] text-nowrap">Transfer Logs</h1>
                <div className="absolute h-[140px] w-[140px] top-[-35px] right-[-35px]">
                  <img className="saturate-[1.5] scale-[0.8] blur-lg opacity-50 saturate-[1.5] hue-rotate-[5deg]" src="https://cdn2.iconfinder.com/data/icons/frosted-glass/128/Clock.png" alt="" />
                </div>
              </Link>

              <Link className="relative overflow-hidden p-2 flex flex-col items-center justify-center bg-gray-700/30 border border-gray-700/30 rounded-[13px]" to="/commissions">
                <div className="p-[1px] w-[75px] h-[75px] rounded-[13px] relative z-[2]">
                  <img className="saturate-[1.5] scale-[0.8] saturate-[1.5] hue-rotate-[30deg]" src="https://cdn2.iconfinder.com/data/icons/frosted-glass/128/Discount.png" alt="" />
                </div>
                <h1 className="text-center text-white font-bold text-[10px] mt-[4px] text-nowrap">Commissions</h1>
                <div className="absolute h-[140px] w-[140px] top-[-35px] right-[-35px]">
                  <img className="saturate-[1.5] scale-[0.8] blur-lg opacity-50 saturate-[1.5] hue-rotate-[30deg]" src="https://cdn2.iconfinder.com/data/icons/frosted-glass/128/Discount.png" alt="" />
                </div>
              </Link>

              <Link className="relative overflow-hidden p-2 flex flex-col items-center justify-center bg-gray-700/30 border border-gray-700/30 rounded-[13px]" to="/transactions">
                <div className="p-[1px] w-[75px] h-[75px] rounded-[13px] relative z-[2]">
                  <img className="saturate-[1.5] scale-[0.8] saturate-[1.5] hue-rotate-[30deg]" src="https://cdn2.iconfinder.com/data/icons/frosted-glass/128/Discovery.png" alt="" />
                </div>
                <h1 className="text-center text-white font-bold text-[10px] mt-[4px] text-nowrap">Transactions</h1>
                <div className="absolute h-[140px] w-[140px] top-[-35px] right-[-35px]">
                  <img className="saturate-[1.5] scale-[0.8] blur-lg opacity-50 saturate-[1.5] hue-rotate-[30deg]" src="https://cdn2.iconfinder.com/data/icons/frosted-glass/128/Discovery.png" alt="" />
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

          
        </div>
      </div>
    </div>
  );
};

export default AllTools;
