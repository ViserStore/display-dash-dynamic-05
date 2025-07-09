
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import BottomNavigation from '../components/BottomNavigation';

const DepositPending = () => {
  const { depositId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Fetch deposit details from database
  const { data: deposit, isLoading, error } = useQuery({
    queryKey: ['deposit-pending', depositId],
    queryFn: async () => {
      if (!depositId || !user) return null;
      
      const { data, error } = await supabase
        .from('deposits')
        .select(`
          id,
          amount,
          status,
          transaction_id,
          created_at,
          deposit_methods (
            name,
            currency
          )
        `)
        .eq('id', depositId)
        .eq('user_id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!depositId && !!user
  });

  const handleBackClick = () => {
    window.history.back();
  };

  const handleSeeOtherTransactions = () => {
    navigate('/deposit/logs');
  };

  // Check if deposit is approved/completed
  const isDepositApproved = deposit?.status === 'complete' || deposit?.status === 'approved';

  if (isLoading) {
    return (
      <div className="relative min-h-[100vh] bg-black mx-auto max-w-[480px] overflow-y-hidden">
        <div className="min-h-[100vh] pt-[0px] pb-[63px]">
          <div className="_relative_lq8ol_15 _z-[1]_lq8ol_510">
            {/* Header Section */}
            <div className="_relative_lq8ol_15 overflow-hidden mb-[10px]">
              <div className="p-[15px] relative z-[2] rounded-b-[30px]">
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
                    <h1 className="_text-white_lq8ol_196 _font-bold_lq8ol_110">Deposit Log</h1>
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

            {/* Loading Content */}
            <div className="_container_lq8ol_465 _mx-auto_lq8ol_1 _px-[8px]_lq8ol_284">
              <div className="_flex_lq8ol_19 _justify-center_lq8ol_106 _items-center_lq8ol_27 mt-10">
                <span className="skeleton bg-gray-500/60 _w-[60px]_lq8ol_389 _h-[60px]_lq8ol_395 _rounded-[50%]_lq8ol_800"></span>
              </div>
              <div className="_flex_lq8ol_19 _justify-center_lq8ol_106 mt-5">
                <span className="skeleton bg-gray-500/60 w-[160px] h-[18px]"></span>
              </div>
              <h1 className="_text-white_lq8ol_196 _font-normal_lq8ol_98 text-[15px] _text-center_lq8ol_102 _mt-3_lq8ol_94">
                <span className="text-[25px] _font-medium_lq8ol_260">0.00</span> USDT
              </h1>
              <h1 className="_text-gray-500_lq8ol_575 _text-[12px]_lq8ol_77 _text-center_lq8ol_102 _mt-2_lq8ol_135">The recipient can check the balance in the wallet</h1>
              
              <div className="bg-gray-700/50 _rounded-[10px]_lq8ol_56 _p-2_lq8ol_81 _mt-3_lq8ol_94 mx-3 _shadow-md_lq8ol_498">
                <div className="_flex_lq8ol_19 _justify-between_lq8ol_31 my-1">
                  <h1 className="_text-gray-400_lq8ol_587 text-[13px]">Payment Method</h1>
                  <span className="skeleton bg-gray-500/60 _w-[90px]_lq8ol_759 h-[16px]"></span>
                </div>
                <div className="_flex_lq8ol_19 _justify-between_lq8ol_31 my-1">
                  <h1 className="_text-gray-400_lq8ol_587 text-[13px]">Currency</h1>
                  <span className="skeleton bg-gray-500/60 _w-[60px]_lq8ol_389 h-[16px]"></span>
                </div>
                <div className="_flex_lq8ol_19 _justify-between_lq8ol_31 my-1">
                  <h1 className="_text-gray-400_lq8ol_587 text-[13px]">Charge</h1>
                  <span className="skeleton bg-gray-500/60 w-[70px] h-[16px]"></span>
                </div>
                <div className="_flex_lq8ol_19 _justify-between_lq8ol_31 my-1">
                  <h1 className="_text-gray-400_lq8ol_587 text-[13px]">Final Amount</h1>
                  <span className="skeleton bg-gray-500/60 w-[80px] h-[16px]"></span>
                </div>
                <div className="_flex_lq8ol_19 _justify-between_lq8ol_31 mt-4 _mb-1_lq8ol_573">
                  <h1 className="_text-gray-400_lq8ol_587 text-[13px]">Transaction Id</h1>
                  <span className="skeleton bg-gray-500/60 w-[180px] h-[16px]"></span>
                </div>
              </div>
            </div>

            {/* Bottom Button */}
            <div className="_fixed_lq8ol_326 bottom-[70px] _w-[100%]_lq8ol_371 max-w-lg -translate-x-1/2 left-1/2 px-3">
              <a href="/deposit/logs">
                <button type="button" className="bg-gradient-to-r hover:bg-gradient-to-l bg-lime-400 to-rose-600 text-white w-[100%] p-2 rounded-[10px] w-100 py-[14px] text-[14px] !font-semibold bg-lime-600 hover:bg-lime-500 !text-gray-100">
                  See Others Transactions
                </button>
              </a>
            </div>

            
          </div>
        </div>
      </div>
    );
  }

  if (error) {
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
                    <h1 className="text-white font-bold">Deposit Status</h1>
                  </div>
                </div>
              </div>
            </div>

            {/* Error Content */}
            <div className="container mx-auto px-[8px]">
              <div className="flex flex-col justify-center items-center mt-20">
                <div className="text-red-500 text-6xl mb-4">⚠️</div>
                <h1 className="text-white font-medium text-[18px] mb-2">Error Loading Deposit</h1>
                <p className="text-gray-400 text-center text-[14px] mb-6">
                  Unable to load deposit details. Please try again.
                </p>
                <button 
                  onClick={() => window.location.reload()}
                  className="bg-lime-600 hover:bg-lime-500 text-white px-6 py-2 rounded-lg font-semibold"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!deposit) {
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
                    <h1 className="text-white font-bold">Deposit Status</h1>
                  </div>
                </div>
              </div>
            </div>

            {/* Not Found Content */}
            <div className="container mx-auto px-[8px]">
              <div className="flex flex-col justify-center items-center mt-20">
                <div className="text-gray-500 text-6xl mb-4">🔍</div>
                <h1 className="text-white font-medium text-[18px] mb-2">Deposit Not Found</h1>
                <p className="text-gray-400 text-center text-[14px] mb-6">
                  The deposit you're looking for doesn't exist or you don't have permission to view it.
                </p>
                <button 
                  onClick={() => navigate('/deposit/logs')}
                  className="bg-lime-600 hover:bg-lime-500 text-white px-6 py-2 rounded-lg font-semibold"
                >
                  View All Deposits
                </button>
              </div>
            </div>
          </div>
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
                  <h1 className="text-white font-bold">Deposit Status</h1>
                </div>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="container mx-auto px-[8px]">
            <div className="flex justify-center items-center mt-10">
              {isDepositApproved ? (
                <img 
                  className="w-[60px] h-[60px]" 
                  src="https://cdn-icons-png.flaticon.com/128/190/190411.png" 
                  alt="Approved" 
                />
              ) : (
                <img 
                  className="w-[60px] h-[60px] rounded-[50%] animate-spin hue-rotate-[173deg] brightness-[1.95]" 
                  src="https://cdn-icons-png.flaticon.com/128/10084/10084736.png" 
                  alt="Loading" 
                />
              )}
            </div>
            <div className="flex justify-center mt-5">
              <h1 className="text-white font-medium text-[15px]">
                {isDepositApproved ? 'Deposit Approved' : 'Request Pending'}
              </h1>
            </div>
            <h1 className="text-white font-normal text-[15px] text-center mt-3">
              <span className="text-[25px] font-medium">{deposit.amount.toFixed(2)}</span> {deposit.deposit_methods?.currency || 'USDT'}
            </h1>
            <h1 className="text-gray-500 text-[12px] text-center mt-2">
              {isDepositApproved 
                ? 'The deposit has been approved and added to your balance' 
                : 'The recipient can check the balance in the wallet'
              }
            </h1>
            
            <div className="bg-gray-700/50 rounded-[10px] p-2 mt-3 mx-3 shadow-md">
              <div className="flex justify-between my-1">
                <h1 className="text-gray-400 text-[13px]">Payment Method</h1>
                <h1 className="text-lime-500 font-semibold text-[13px]">{deposit.deposit_methods?.name || 'Unknown'}</h1>
              </div>
              <div className="flex justify-between my-1">
                <h1 className="text-gray-400 text-[13px]">Currency</h1>
                <h1 className="text-lime-500 font-semibold text-[13px]">{deposit.deposit_methods?.currency || 'USDT'}</h1>
              </div>
              <div className="flex justify-between my-1">
                <h1 className="text-gray-400 text-[13px]">Charge</h1>
                <h1 className="text-lime-500 font-semibold text-[13px]">0.00 {deposit.deposit_methods?.currency || 'USDT'}</h1>
              </div>
              <div className="flex justify-between my-1">
                <h1 className="text-gray-400 text-[13px]">Final Amount</h1>
                <h1 className="text-lime-500 font-semibold text-[13px]">{deposit.amount.toFixed(2)} {deposit.deposit_methods?.currency || 'USDT'}</h1>
              </div>
              <div className="flex justify-between mt-4 mb-1">
                <h1 className="text-gray-400 text-[13px]">Transaction Id</h1>
                <h1 className="text-lime-500 font-semibold text-[13px]">{deposit.transaction_id}</h1>
              </div>
            </div>
          </div>

          {/* Bottom Button */}
          <div className="fixed bottom-[70px] w-[100%] max-w-lg -translate-x-1/2 left-1/2 px-3">
            <button 
              type="button" 
              onClick={handleSeeOtherTransactions}
              className="bg-gradient-to-r hover:bg-gradient-to-l bg-lime-400 to-rose-600 text-white w-[100%] p-2 rounded-[10px] w-100 py-[14px] text-[14px] !font-semibold bg-lime-600 hover:bg-lime-500 !text-gray-100"
            >
              See Others Transactions
            </button>
          </div>

          
        </div>
      </div>
    </div>
  );
};

export default DepositPending;
