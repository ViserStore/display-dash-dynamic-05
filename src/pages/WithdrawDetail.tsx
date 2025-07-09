import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import BottomNavigation from '../components/BottomNavigation';
import PageHeader from '../components/PageHeader';
import { useToast } from '@/hooks/use-toast';
import { notify } from '@/utils/notifications';

const WithdrawDetail = () => {
  const {
    methodId
  } = useParams();
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [paymentAddress, setPaymentAddress] = useState('');
  const [withdrawPassword, setWithdrawPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const {
    user
  } = useAuth();
  const {
    toast
  } = useToast();

  // Fetch withdraw method details
  const {
    data: withdrawMethod,
    isLoading: methodLoading
  } = useQuery({
    queryKey: ['withdraw-method', methodId],
    queryFn: async () => {
      if (!methodId) return null;
      const {
        data,
        error
      } = await supabase.from('withdraw_methods').select('*').eq('id', methodId).single();
      if (error) throw error;
      return data;
    },
    enabled: !!methodId
  });

  // Fetch user's current balance
  const {
    data: userBalance
  } = useQuery({
    queryKey: ['user-balance', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const {
        data,
        error
      } = await supabase.from('users').select('balance').eq('id', user.id).single();
      if (error) throw error;
      return data?.balance || 0;
    },
    enabled: !!user
  });

  const hashPassword = async (password: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };
  const handleBackClick = () => {
    window.history.back();
  };
  const handleCopyPaymentAddress = () => {
    if (paymentAddress) {
      navigator.clipboard.writeText(paymentAddress).then(() => {
        notify.success("Payment address copied to clipboard!");
      }).catch(() => {
        notify.error("Failed to copy payment address");
      });
    } else {
      notify.warning("No payment address to copy");
    }
  };
  const handleWithdraw = async () => {
    if (!user || !withdrawMethod) return;

    // Validation
    if (!amount || !paymentAddress || !withdrawPassword) {
      notify.error("Please fill in all required fields");
      return;
    }
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      notify.error("Please enter a valid amount");
      return;
    }
    const minAmount = withdrawMethod.min_amount || 5;
    if (numAmount < minAmount) {
      notify.error(`Minimum withdraw amount is ${minAmount} ${withdrawMethod.currency}`);
      return;
    }
    const maxAmount = withdrawMethod.max_amount || 999999999;
    if (numAmount > maxAmount) {
      notify.error(`Maximum withdraw amount is ${maxAmount} ${withdrawMethod.currency}`);
      return;
    }
    if (numAmount > (userBalance || 0)) {
      notify.error("Insufficient balance");
      return;
    }
    setLoading(true);
    try {
      // Verify withdraw PIN by comparing with stored hash
      const pinHash = await hashPassword(withdrawPassword);

      // Get user's stored withdraw PIN hash
      const {
        data: userData,
        error: userError
      } = await supabase.from('users').select('withdraw_pin').eq('id', user.id).single();
      if (userError || !userData) {
        notify.error("Failed to verify user data");
        return;
      }
      if (userData.withdraw_pin !== pinHash) {
        notify.error("Invalid withdraw PIN");
        return;
      }

      // Create withdrawal record
      const {
        data: withdrawal,
        error: withdrawError
      } = await supabase.from('withdrawals').insert({
        user_id: user.id,
        withdraw_method_id: withdrawMethod.id,
        amount: numAmount,
        payment_address: paymentAddress,
        status: 'pending'
      }).select().single();
      if (withdrawError) {
        console.error('Withdrawal creation error:', withdrawError);
        notify.error("Failed to create withdrawal request");
        return;
      }

      // Create transaction record
      const {
        error: transactionError
      } = await supabase.from('transactions').insert({
        user_id: user.id,
        type: 'withdraw',
        amount: -numAmount,
        // Negative for withdrawal
        status: 'pending',
        description: `Withdrawal via ${withdrawMethod.name}`,
        reference_id: withdrawal.id
      });
      if (transactionError) {
        console.error('Transaction creation error:', transactionError);
      }
      notify.success("Your withdrawal request has been submitted successfully and is pending review");

      // Navigate to withdraw pending page instead of logs
      navigate(`/withdraw/pending/${withdrawal.id}`);
    } catch (error) {
      console.error('Withdrawal error:', error);
      notify.error("There was an error submitting your withdrawal request. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const calculateReceiveAmount = () => {
    if (!amount || !withdrawMethod) return '0.00';
    const numAmount = parseFloat(amount);
    const chargePercentage = withdrawMethod.charge_percentage || 5;
    const exchangeRate = withdrawMethod.exchange_rate || 1;
    const fee = numAmount * (chargePercentage / 100);
    return ((numAmount - fee) * exchangeRate).toFixed(2);
  };

  // Method not found state - show empty bar like deposit detail
  if (!methodLoading && !withdrawMethod) {
    return (
      <div>
        
        <div className="relative min-h-[100vh] bg-black mx-auto max-w-[480px] overflow-y-hidden">
          <div className="min-h-[100vh] pt-[0px] pb-[63px]">
            <div className="relative z-[1]">
              {/* Header Section */}
              <PageHeader title="Withdraw Methods" />

              {/* Content Section with Empty Bar */}
              <div className="overflow-auto h-[calc(100vh-100px)] mx-auto px-[8px] pb-[60px]">
                <div className="flex justify-center">
                  <div className="flex items-center justify-center w-[120px] h-[120px] bg-gray-700 rounded animate-pulse">
                    <svg className="w-8 h-8 text-gray-200 dark:text-gray-600" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 18">
                      <path d="M18 0H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4.376 10.481A1 1 0 0 1 16 15H4a1 1 0 0 1-.895-1.447l3.5-7A1 1 0 0 1 7.468 6a.965.965 0 0 1 .9.5l2.775 4.757 1.546-1.887a1 1 0 0 1 1.618.1l2.541 4a1 1 0 0 1 .028 1.011Z" />
                    </svg>
                  </div>
                </div>
                <h1 className="text-center font-bold mt-2" style={{color: '#e5e7eb'}}>Withdraw with Loading...</h1>
                
                {/* Method Info Empty */}
                <div className="mx-2 px-5 py-3 bg-gray-900/80 border border-gray-900 rounded-xl my-3">
                  <div className="border-b border-lime-700 pb-2">
                    <h1 className="text-[12px] text-gray-400 mb-1">Currency</h1>
                    <div className="flex">
                      <div className="flex-auto">
                        <h1 className="text-[12px] font-semibold bg-gray-500 w-[60px] h-[14px] my-[2px] rounded-full animate-pulse"></h1>
                      </div>
                    </div>
                  </div>
                  <div className="pt-2">
                    <h1 className="text-[12px] text-gray-400 mb-1">Loading...</h1>
                    <div className="flex">
                      <div className="flex-auto">
                        <h1 className="text-[12px] font-semibold bg-gray-500 w-[260px] h-[14px] my-[2px] rounded-full animate-pulse"></h1>
                      </div>
                      <i className="fi fi-sr-copy-alt text-sm text-lime-400 hover:text-yellow-400 cursor-pointer"></i>
                    </div>
                  </div>
                </div>

                {/* Empty Form Fields */}
                <div className="my-1 mx-2">
                  <div className="relative">
                    <label htmlFor="Withdraw Amount" className="block mb-2 text-sm font-medium text-gray-200 text-lime-500 absolute left-[20px] top-[-10px] z-[1] px-2 bg-black uppercase">
                      Withdraw Amount
                    </label>
                    <div className="relative mb-3">
                      <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
                        <i className="fi fi-sr-coins w-4 h-5 text-gray-400"></i>
                      </div>
                      <input className="placeholder:text-gray-400 !text-lime-500 border-[1.5px] !border-lime-500 py-[17px] !rounded-[10px] !bg-transparent autofill:bg-autofillBg bg-transparent border hover:border-lime-500 focus:border-lime-500 focus:outline-0 text-gray-200 focus:text-gray-200 text-sm rounded-md focus:ring-rose-500 block w-full ps-10 p-2.5" type="number" placeholder="Enter Withdraw Amount" value="" disabled />
                    </div>
                  </div>
                  
                  <div className="relative">
                    <label htmlFor="Payment Address" className="block mb-2 text-sm font-medium text-gray-200 text-lime-500 absolute left-[20px] top-[-10px] z-[1] px-2 bg-black uppercase">
                      Payment Address
                    </label>
                    <div className="relative mb-3">
                      <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
                        <i className="fi fi-sr-sim-card w-4 h-5 text-gray-400"></i>
                      </div>
                      <input className="placeholder:text-gray-400 !text-lime-500 border-[1.5px] !border-lime-500 py-[17px] !rounded-[10px] !bg-transparent autofill:bg-autofillBg bg-transparent border hover:border-lime-500 focus:border-lime-500 focus:outline-0 text-gray-200 focus:text-gray-200 text-sm rounded-md focus:ring-rose-500 block w-full ps-10 p-2.5" type="text" placeholder="Enter Payment Address" value="" disabled />
                    </div>
                  </div>
                </div>

                {/* Empty Info */}
                <div className="mx-2 my-2">
                  <div className="flex mb-2">
                    <h1 className="text-lime-400 text-[12px] flex-auto">Minimum limit</h1>
                    <h1 className="bg-gray-600 w-[60px] h-[14px] my-[2px] rounded-full animate-pulse"></h1>
                  </div>
                  <div className="flex mb-2">
                    <h1 className="text-lime-400 text-[12px] flex-auto">Maximum limit</h1>
                    <h1 className="bg-gray-600 w-[60px] h-[14px] my-[2px] rounded-full animate-pulse"></h1>
                  </div>
                  <div className="flex mb-2">
                    <h1 className="text-lime-400 text-[12px] flex-auto">1 USDT =</h1>
                    <h1 className="bg-gray-600 w-[60px] h-[14px] my-[2px] rounded-full animate-pulse"></h1>
                  </div>
                </div>

                <div className="flex text-gray-500 text-[12px] mx-2 mb-[50px]">
                  <span className="text-[15px] pe-2">*</span>
                  <span>After making the deposit and filling all the information click the button.</span>
                </div>
              </div>

              {/* Bottom Button */}
              <div className="fixed bottom-[70px] w-[100%] max-w-lg -translate-x-1/2 left-1/2 px-3">
                <button type="button" className="bg-gradient-to-r hover:bg-gradient-to-l bg-lime-400 to-rose-600 text-white w-[100%] p-2 rounded-[10px] w-100 py-[14px] text-[14px] !font-semibold bg-lime-500 hover:bg-lime-600 !text-gray-100" disabled>
                  Submit Withdraw Request
                </button>
              </div>

              
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (methodLoading) {
    return (
      <div>
        
        <div className="relative min-h-[100vh] bg-black mx-auto max-w-[480px] overflow-y-hidden">
          <div className="min-h-[100vh] pt-[0px] pb-[63px]">
            <div className="relative z-[1]">
              {/* Header Section */}
              <PageHeader title="Loading..." />
              
            
              
              
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      
      <div className="relative min-h-[100vh] bg-black mx-auto max-w-[480px] overflow-y-hidden">
        <div className="min-h-[100vh] pt-[0px] pb-[63px]">
          <div className="relative z-[1]">
            {/* Header Section */}
            <PageHeader title={`Withdraw with ${withdrawMethod.name}`} />

            {/* Content Section */}
            <div className="mx-auto px-[8px] pb-[40px] py-3 rounded-t-[20px] overflow-auto h-[calc(100vh-225px)]">
              <h1 className="text-center font-bold mt-2" style={{color: '#e5e7eb'}}>{`Withdraw with ${withdrawMethod.name}`}</h1>
              
              {/* Method Info */}
              <div className="mx-2 px-5 py-3 bg-gray-900/80 border border-gray-700 rounded-xl my-3">
                <div className="border-b border-gray-700 pb-2">
                  <h1 className="text-[12px] text-gray-500 mb-1">Currency</h1>
                  <div className="flex">
                    <div className="flex-auto">
                      <h1 className="text-[12px] text-lime-600 font-semibold">{withdrawMethod.currency}</h1>
                    </div>
                  </div>
                </div>
                <div className="pt-2">
                  <h1 className="text-[12px] text-gray-500 mb-1">Gateway</h1>
                  <div className="flex">
                    <div className="flex-auto">
                      <h1 className="text-[12px] text-lime-600 font-semibold">{withdrawMethod.name}</h1>
                    </div>
                  </div>
                </div>
              </div>

              {/* Withdraw Amount */}
              <div className="my-1 mx-2">
                <div className="relative">
                  <label htmlFor="Withdraw Amount" className="block mb-2 text-sm font-medium text-gray-200 text-lime-500 absolute left-[20px] top-[-10px] z-[1] px-2 bg-black uppercase">
                    Withdraw Amount
                  </label>
                  <div className="relative mb-3">
                    <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
                      <i className="fi fi-rr-file-invoice-dollar w-4 h-5 text-lime-400"></i>
                    </div>
                    <input className="placeholder:text-gray-400 !text-lime-500 border-[1.5px] !border-lime-500 py-[17px] !rounded-[10px] !bg-transparent autofill:bg-autofillBg bg-transparent border hover:border-lime-500 focus:border-lime-500 focus:outline-0 text-gray-200 focus:text-gray-200 text-sm rounded-md focus:ring-rose-500 block w-full ps-10 p-2.5" type="number" placeholder="Enter withdraw amount" value={amount} onChange={e => setAmount(e.target.value)} />
                  </div>
                </div>
                <div className="flex mb-2 -mt-1">
                  <h1 className="text-gray-500 text-[11px] flex-auto text-start">
                    Available <span className="text-lime-500">{userBalance ? parseFloat(userBalance.toString()).toFixed(2) : '0.00'}</span> USDT
                  </h1>
                  <h1 className="text-gray-500 text-[11px] flex-auto text-end">
                    Minimum <span className="text-lime-500">{withdrawMethod.min_amount ? parseFloat(withdrawMethod.min_amount.toString()).toFixed(2) : '5.00'}</span> USDT
                  </h1>
                </div>

                {/* Payment Address */}
                <div className="relative">
                  <label htmlFor="Payment Address" className="block mb-2 text-sm font-medium text-gray-200 text-lime-500 absolute left-[20px] top-[-10px] z-[1] px-2 bg-black uppercase">
                    Payment Address
                  </label>
                  <div className="relative mb-3">
                    <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
                      <i className="fi fi-rr-sim-card w-4 h-5 text-lime-400"></i>
                    </div>
                    <input className="placeholder:text-gray-400 !text-lime-500 border-[1.5px] !border-lime-500 py-[17px] !rounded-[10px] !bg-transparent autofill:bg-autofillBg bg-transparent border hover:border-lime-500 focus:border-lime-500 focus:outline-0 text-gray-200 focus:text-gray-200 text-sm rounded-md focus:ring-rose-500 block w-full ps-10 p-2.5" placeholder={withdrawMethod.user_info_label || `Enter Your ${withdrawMethod.name} Personal Number`} value={paymentAddress} onChange={e => setPaymentAddress(e.target.value)} />
                    <div className="absolute inset-y-0 end-0 flex items-center pe-3.5">
                      
                    </div>
                  </div>
                </div>

                {/* Withdraw PIN - Updated to 6 digits */}
                <div className="relative">
                  <label htmlFor="Withdraw PIN" className="block mb-2 text-sm font-medium text-gray-200 text-lime-500 absolute left-[20px] top-[-10px] z-[1] px-2 bg-black uppercase">
                    Withdraw PIN
                  </label>
                  <div className="relative mb-3">
                    <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
                      <i className="fi fi-rr-lock w-4 h-5 text-lime-400"></i>
                    </div>
                    <input className="placeholder:text-gray-400 !text-lime-500 border-[1.5px] !border-lime-500 py-[17px] !rounded-[10px] !bg-transparent autofill:bg-autofillBg bg-transparent border hover:border-lime-500 focus:border-lime-500 focus:outline-0 text-gray-200 focus:text-gray-200 text-sm rounded-md focus:ring-rose-500 block w-full ps-10 p-2.5" type="password" placeholder="Enter your 6-digit withdraw PIN" value={withdrawPassword} onChange={e => setWithdrawPassword(e.target.value)} maxLength={6} />
                  </div>
                </div>
              </div>

              {/* Limits Section */}
              <div className="mx-2 my-2">
                <div className="flex mb-2">
                  <h1 className="text-lime-400 text-[12px] flex-auto">Minimum limit</h1>
                  <h1 className="text-lime-500/80 text-[12px]">{withdrawMethod.min_amount} {withdrawMethod.currency}</h1>
                </div>
                <div className="flex mb-2">
                  <h1 className="text-lime-400 text-[12px] flex-auto">Maximum limit</h1>
                  <h1 className="text-lime-500/80 text-[12px]">{withdrawMethod.max_amount} {withdrawMethod.currency}</h1>
                </div>
                <div className="flex mb-2">
                  <h1 className="text-lime-400 text-[12px] flex-auto">
                    1 USDT = <span className="text-lime-500">{withdrawMethod.exchange_rate || 1}</span> {withdrawMethod.currency}
                  </h1>
                </div>
              </div>

              {/* Instructions */}
              <div className="flex text-gray-500 text-[12px] mx-2">
                <span className="text-[15px] pe-2">*</span>
                <span>After filling all the information click the button.</span>
              </div>
            </div>

            {/* Bottom Fixed Section */}
            <div className="fixed z-[3] bottom-[63px] w-[100%] max-w-lg -translate-x-1/2 left-1/2 px-3 border-t bg-black border-gray-800 pt-2">
              <div className="flex items-center">
                <div className="flex-auto">
                  <h1 className="text-gray-500 text-[13px]">Receive Amount</h1>
                  <h1 className="text-lime-500 font-bold text-[18px]">
                    {calculateReceiveAmount()} {withdrawMethod.currency}
                  </h1>
                  <h1 className="text-gray-500 text-[12px]">
                    Processing fee: <span className="text-lime-500 font-bold">{withdrawMethod.charge_percentage || 5}%</span>
                  </h1>
                </div>
                <button type="button" className="bg-gradient-to-r hover:bg-gradient-to-l bg-lime-400 to-rose-600 text-white w-[100%] p-2 rounded-[10px] !w-[110px] text-[14px] !font-semibold !py-0 !h-[40px] bg-lime-600 hover:bg-lime-500 !text-gray-100 disabled:opacity-50" onClick={handleWithdraw} disabled={loading}>
                  {loading ? 'Processing...' : 'Withdraw'}
                </button>
              </div>
            </div>

            
          </div>
        </div>
      </div>
    </div>
  );
};

export default WithdrawDetail;
