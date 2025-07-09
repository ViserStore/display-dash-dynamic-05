import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import BottomNavigation from '../components/BottomNavigation';

const WithdrawPending = () => {
  const { withdrawId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Fetch withdrawal details from database
  const { data: withdrawal, isLoading, error } = useQuery({
    queryKey: ['withdraw-pending', withdrawId],
    queryFn: async () => {
      if (!withdrawId || !user) return null;
      
      const { data, error } = await supabase
        .from('withdrawals')
        .select(`
          id,
          amount,
          status,
          payment_address,
          created_at,
          withdraw_methods (
            name,
            currency,
            charge_percentage,
            symbol
          )
        `)
        .eq('id', withdrawId)
        .eq('user_id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!withdrawId && !!user
  });

  const handleBackClick = () => {
    window.history.back();
  };

  const handleSeeOtherWithdrawals = () => {
    navigate('/withdraw/logs');
  };

  const calculateCharge = (amount: number, chargePercentage: number) => {
    return (amount * chargePercentage) / 100;
  };

  const calculateFinalAmount = (amount: number, chargePercentage: number) => {
    return amount - calculateCharge(amount, chargePercentage);
  };

  // Check if withdrawal is approved/completed
  const isWithdrawalApproved = withdrawal?.status === 'complete' || withdrawal?.status === 'approved';

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
                    <h1 className="text-white font-bold">Withdraw Status</h1>
                  </div>
                </div>
              </div>
            </div>

            {/* Loading Content */}
            <div className="container mx-auto px-[8px]">
              <div className="flex justify-center items-center mt-10">
                <span className="bg-gray-500/60 w-[60px] h-[60px] rounded-[50%] animate-pulse"></span>
              </div>
              <div className="flex justify-center mt-5">
                <span className="bg-gray-500/60 w-[160px] h-[18px] animate-pulse"></span>
              </div>
              <h1 className="text-white font-normal text-[15px] text-center mt-3">
                <span className="text-[25px] font-medium">0.00</span> USDT
              </h1>
              <h1 className="text-gray-500 text-[12px] text-center mt-2">Loading withdrawal details...</h1>
              
              <div className="bg-gray-700/50 rounded-[10px] p-2 mt-3 mx-3 shadow-md">
                <div className="flex justify-between my-1">
                  <h1 className="text-gray-400 text-[13px]">Payment Method</h1>
                  <span className="bg-gray-500/60 w-[90px] h-[16px] animate-pulse"></span>
                </div>
                <div className="flex justify-between my-1">
                  <h1 className="text-gray-400 text-[13px]">Currency</h1>
                  <span className="bg-gray-500/60 w-[60px] h-[16px] animate-pulse"></span>
                </div>
                <div className="flex justify-between my-1">
                  <h1 className="text-gray-400 text-[13px]">Charge</h1>
                  <span className="bg-gray-500/60 w-[70px] h-[16px] animate-pulse"></span>
                </div>
                <div className="flex justify-between my-1">
                  <h1 className="text-gray-400 text-[13px]">Final Amount</h1>
                  <span className="bg-gray-500/60 w-[80px] h-[16px] animate-pulse"></span>
                </div>
                <div className="flex justify-between mt-4 mb-1">
                  <h1 className="text-gray-400 text-[13px]">Payment Address</h1>
                  <span className="bg-gray-500/60 w-[180px] h-[16px] animate-pulse"></span>
                </div>
              </div>
            </div>

            {/* Bottom Button */}
            <div className="fixed bottom-[70px] w-[100%] max-w-lg -translate-x-1/2 left-1/2 px-3">
              <button 
                type="button" 
                onClick={handleSeeOtherWithdrawals}
                className="bg-gradient-to-r hover:bg-gradient-to-l bg-lime-400 to-rose-600 text-white w-[100%] p-2 rounded-[10px] w-100 py-[14px] text-[14px] !font-semibold bg-lime-600 hover:bg-lime-500 !text-gray-100"
              >
                See Other Withdrawals
              </button>
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
                    <h1 className="text-white font-bold">Withdraw Status</h1>
                  </div>
                </div>
              </div>
            </div>

            {/* Error Content */}
            <div className="container mx-auto px-[8px]">
              <div className="flex flex-col justify-center items-center mt-20">
                <div className="text-red-500 text-6xl mb-4">⚠️</div>
                <h1 className="text-white font-medium text-[18px] mb-2">Error Loading Withdrawal</h1>
                <p className="text-gray-400 text-center text-[14px] mb-6">
                  Unable to load withdrawal details. Please try again.
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

  if (!withdrawal) {
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
                    <h1 className="text-white font-bold">Withdraw Status</h1>
                  </div>
                </div>
              </div>
            </div>

            {/* Not Found Content */}
            <div className="container mx-auto px-[8px]">
              <div className="flex flex-col justify-center items-center mt-20">
                <div className="text-gray-500 text-6xl mb-4">🔍</div>
                <h1 className="text-white font-medium text-[18px] mb-2">Withdrawal Not Found</h1>
                <p className="text-gray-400 text-center text-[14px] mb-6">
                  The withdrawal you're looking for doesn't exist or you don't have permission to view it.
                </p>
                <button 
                  onClick={() => navigate('/withdraw/logs')}
                  className="bg-lime-600 hover:bg-lime-500 text-white px-6 py-2 rounded-lg font-semibold"
                >
                  View All Withdrawals
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const charge = calculateCharge(withdrawal.amount, withdrawal.withdraw_methods?.charge_percentage || 0);
  const finalAmount = calculateFinalAmount(withdrawal.amount, withdrawal.withdraw_methods?.charge_percentage || 0);

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
                  <h1 className="text-white font-bold">Withdraw Status</h1>
                </div>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="container mx-auto px-[8px]">
            <div className="flex justify-center items-center mt-10">
              {isWithdrawalApproved ? (
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
                {isWithdrawalApproved ? 'Withdrawal Approved' : 'Request Pending'}
              </h1>
            </div>
            <h1 className="text-white font-normal text-[15px] text-center mt-3">
              <span className="text-[25px] font-medium">{withdrawal.amount.toFixed(2)}</span> {withdrawal.withdraw_methods?.currency || 'USDT'}
            </h1>
            <h1 className="text-gray-500 text-[12px] text-center mt-2">
              {isWithdrawalApproved 
                ? 'The withdrawal has been processed and completed' 
                : 'The withdrawal will be processed soon'
              }
            </h1>
            
            <div className="bg-gray-700/50 rounded-[10px] p-2 mt-3 mx-3 shadow-md">
              <div className="flex justify-between my-1">
                <h1 className="text-gray-400 text-[13px]">Payment Method</h1>
                <h1 className="text-lime-500 font-semibold text-[13px]">{withdrawal.withdraw_methods?.name || 'Unknown'}</h1>
              </div>
              <div className="flex justify-between my-1">
                <h1 className="text-gray-400 text-[13px]">Currency</h1>
                <h1 className="text-lime-500 font-semibold text-[13px]">{withdrawal.withdraw_methods?.currency || 'USDT'}</h1>
              </div>
              <div className="flex justify-between my-1">
                <h1 className="text-gray-400 text-[13px]">Charge</h1>
                <h1 className="text-lime-500 font-semibold text-[13px]">{charge.toFixed(2)} {withdrawal.withdraw_methods?.currency || 'USDT'}</h1>
              </div>
              <div className="flex justify-between my-1">
                <h1 className="text-gray-400 text-[13px]">Final Amount</h1>
                <h1 className="text-lime-500 font-semibold text-[13px]">{finalAmount.toFixed(2)} {withdrawal.withdraw_methods?.currency || 'USDT'}</h1>
              </div>
              <div className="flex justify-between mt-4 mb-1">
                <h1 className="text-gray-400 text-[13px]">Payment Address</h1>
                <h1 className="text-lime-500 font-semibold text-[13px] break-all">{withdrawal.payment_address}</h1>
              </div>
            </div>
          </div>

          {/* Bottom Button */}
          <div className="fixed bottom-[70px] w-[100%] max-w-lg -translate-x-1/2 left-1/2 px-3">
            <button 
              type="button" 
              onClick={handleSeeOtherWithdrawals}
              className="bg-gradient-to-r hover:bg-gradient-to-l bg-lime-400 to-rose-600 text-white w-[100%] p-2 rounded-[10px] w-100 py-[14px] text-[14px] !font-semibold bg-lime-600 hover:bg-lime-500 !text-gray-100"
            >
              See Other Withdrawals
            </button>
          </div>

          
        </div>
      </div>
    </div>
  );
};

export default WithdrawPending;
