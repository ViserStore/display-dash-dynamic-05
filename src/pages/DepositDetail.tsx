import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { notify } from '@/utils/notifications';
import BottomNavigation from '../components/BottomNavigation';
import PageHeader from '../components/PageHeader';
import QRCode from 'qrcode';

const DepositDetail = () => {
  const { methodId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [depositAmount, setDepositAmount] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch deposit method details from database
  const { data: depositMethod, isLoading } = useQuery({
    queryKey: ['deposit-method', methodId],
    queryFn: async () => {
      if (!methodId) return null;
      
      const { data, error } = await supabase
        .from('deposit_methods')
        .select('*')
        .eq('id', methodId)
        .eq('status', 'active')
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!methodId
  });

  // Generate QR code when deposit method data is available
  useEffect(() => {
    if (depositMethod?.deposit_address) {
      QRCode.toDataURL(depositMethod.deposit_address, {
        width: 120,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      }).then(url => {
        setQrCodeUrl(url);
      }).catch(err => {
        console.error('Error generating QR code:', err);
      });
    }
  }, [depositMethod?.deposit_address]);

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

  const handleCopyAddress = () => {
    if (depositMethod?.deposit_address) {
      navigator.clipboard.writeText(depositMethod.deposit_address).then(() => {
        notify.success("Address copied to clipboard!");
      }).catch(() => {
        notify.error("Failed to copy address");
      });
    }
  };

  const handleSubmitDeposit = async () => {
    if (!user) {
      notify.error("Please log in to submit a deposit request");
      return;
    }

    if (!depositAmount || !transactionId || !methodId) {
      notify.error("Please fill in all required fields");
      return;
    }

    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      notify.error("Please enter a valid deposit amount");
      return;
    }

    if (depositMethod?.min_amount && amount < depositMethod.min_amount) {
      notify.error(`Minimum deposit amount is ${depositMethod.min_amount} ${depositMethod.currency}`);
      return;
    }

    if (depositMethod?.max_amount && amount > depositMethod.max_amount) {
      notify.error(`Maximum deposit amount is ${depositMethod.max_amount} ${depositMethod.currency}`);
      return;
    }

    setIsSubmitting(true);

    try {
      // Create deposit record
      const { data: depositData, error: depositError } = await supabase
        .from('deposits')
        .insert({
          user_id: user.id,
          deposit_method_id: methodId,
          amount: amount,
          transaction_id: transactionId,
          status: 'pending'
        })
        .select()
        .single();

      if (depositError) {
        console.error('Error creating deposit:', depositError);
        throw depositError;
      }

      // Create transaction record
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: 'deposit',
          amount: amount,
          status: 'pending',
          reference_id: depositData.id,
          description: `Deposit via ${depositMethod?.name} - Transaction ID: ${transactionId}`
        });

      if (transactionError) {
        console.error('Error creating transaction:', transactionError);
        throw transactionError;
      }

      notify.success("Your deposit request has been submitted successfully and is pending review");

      // Redirect to pending page with deposit ID
      navigate(`/deposit/pending/${depositData.id}`);

    } catch (error) {
      console.error('Error submitting deposit:', error);
      notify.error("There was an error submitting your deposit request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-[100vh] bg-black mx-auto max-w-[480px] overflow-y-hidden">
      <div className="min-h-[100vh] pt-[0px] pb-[63px]">
        <div className="relative z-[1]">
         

          {/* Header Section */}
          <PageHeader 
            title="Deposit Methods" 
            profileImageUrl="https://img.freepik.com/premium-photo/3d-cartoon-avatar-man-minimal-3d-character_652053-2070.jpg"
            onBackClick={() => window.history.back()}
          />

          {/* Content Section */}
          <div className="overflow-auto h-[calc(100vh-100px)] mx-auto px-[8px] pb-[60px]">
            {isLoading ? (
              <>
                {/* QR Code Skeleton */}
                <div className="flex justify-center">
                  <div className="flex items-center justify-center w-[120px] h-[120px] bg-gray-700 rounded animate-pulse">
                    <svg className="w-8 h-8 text-gray-200 dark:text-gray-600" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 18">
                      <path d="M18 0H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4.376 10.481A1 1 0 0 1 16 15H4a1 1 0 0 1-.895-1.447l3.5-7A1 1 0 0 1 7.468 6a.965.965 0 0 1 .9.5l2.775 4.757 1.546-1.887a1 1 0 0 1 1.618.1l2.541 4a1 1 0 0 1 .028 1.011Z"/>
                    </svg>
                  </div>
                </div>

                <h1 className="text-center font-bold mt-2 text-lime-600">Deposit with Loading...</h1>

                {/* Address Section Skeleton */}
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

                {/* Input Fields */}
                <div className="my-1 mx-2">
                  <div className="relative">
                    <label htmlFor="Deposit Amount" className="block mb-2 text-sm font-medium text-gray-200 text-lime-500 absolute left-[20px] top-[-10px] z-[1] px-2 bg-black uppercase">Deposit Amount</label>
                    <div className="relative mb-3">
                      <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
                        <i className="fi fi-sr-coins w-4 h-5 text-gray-400"></i>
                      </div>
                      <input 
                        className="placeholder:text-gray-400 !text-lime-500 border-[1.5px] !border-lime-500 py-[17px] !rounded-[10px] !bg-transparent autofill:bg-autofillBg bg-transparent border hover:border-lime-500 focus:border-lime-500 focus:outline-0 text-gray-200 focus:text-gray-200 text-sm rounded-md focus:ring-rose-500 block w-full ps-10 p-2.5" 
                        type="number" 
                        placeholder="Enter Deposit Amount" 
                        value=""
                        disabled
                      />
                    </div>
                  </div>
                  
                  <div className="relative">
                    <label htmlFor="Transaction Id" className="block mb-2 text-sm font-medium text-gray-200 text-lime-500 absolute left-[20px] top-[-10px] z-[1] px-2 bg-black uppercase">Transaction Id</label>
                    <div className="relative mb-3">
                      <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
                        <i className="fi fi-sr-sim-card w-4 h-5 text-gray-400"></i>
                      </div>
                      <input 
                        className="placeholder:text-gray-400 !text-lime-500 border-[1.5px] !border-lime-500 py-[17px] !rounded-[10px] !bg-transparent autofill:bg-autofillBg bg-transparent border hover:border-lime-500 focus:border-lime-500 focus:outline-0 text-gray-200 focus:text-gray-200 text-sm rounded-md focus:ring-rose-500 block w-full ps-10 p-2.5" 
                        type="text" 
                        placeholder="Enter Deposit Transaction Id" 
                        value=""
                        disabled
                      />
                    </div>
                  </div>
                </div>

                {/* Limits Section Skeleton */}
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
              </>
            ) : !depositMethod ? (
              <div className="text-white text-center py-8">Deposit method not found</div>
            ) : (
              <>
                {/* QR Code Section */}
                <div className="flex justify-center">
                  <div className="bg-white w-[120px] h-[120px] p-1 rounded">
                    {qrCodeUrl ? (
                      <img src={qrCodeUrl} alt="QR Code" className="w-full h-full" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500">
                        Loading QR...
                      </div>
                    )}
                  </div>
                </div>

                <h1 className="text-center font-bold mt-2 text-lime-600">Deposit with {depositMethod.name}</h1>

                {/* Address Section */}
                <div className="mx-2 px-5 py-3 bg-gray-900/80 border border-gray-900 rounded-xl my-3">
                  <div className="border-b border-lime-700 pb-2">
                    <h1 className="text-[12px] text-gray-400 mb-1">Currency</h1>
                    <div className="flex">
                      <div className="flex-auto">
                        <h1 className="text-[12px] text-lime-600 font-semibold">{depositMethod.currency}</h1>
                      </div>
                    </div>
                  </div>
                  <div className="pt-2">
                    <h1 className="text-[12px] text-gray-400 mb-1">{depositMethod.name} Address</h1>
                    <div className="flex">
                      <div className="flex-auto">
                        <h1 className="text-[12px] text-lime-600 font-semibold">{depositMethod.deposit_address}</h1>
                      </div>
                      <i 
                        className="fi fi-sr-copy-alt text-sm text-lime-400 hover:text-yellow-400 cursor-pointer"
                        onClick={handleCopyAddress}
                      ></i>
                    </div>
                  </div>
                </div>

                {/* Input Fields */}
                <div className="my-1 mx-2">
                  <div className="relative">
                    <label htmlFor="Deposit Amount" className="block mb-2 text-sm font-medium text-gray-200 text-lime-500 absolute left-[20px] top-[-10px] z-[1] px-2 bg-black uppercase">Deposit Amount</label>
                    <div className="relative mb-3">
                      <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
                        <i className="fi fi-sr-coins w-4 h-5 text-gray-400"></i>
                      </div>
                      <input 
                        className="placeholder:text-gray-400 !text-lime-500 border-[1.5px] !border-lime-500 py-[17px] !rounded-[10px] !bg-transparent autofill:bg-autofillBg bg-transparent border hover:border-lime-500 focus:border-lime-500 focus:outline-0 text-gray-200 focus:text-gray-200 text-sm rounded-md focus:ring-rose-500 block w-full ps-10 p-2.5" 
                        type="number" 
                        placeholder="Enter Deposit Amount" 
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                  
                  <div className="relative">
                    <label htmlFor="Transaction Id" className="block mb-2 text-sm font-medium text-gray-200 text-lime-500 absolute left-[20px] top-[-10px] z-[1] px-2 bg-black uppercase">Transaction Id</label>
                    <div className="relative mb-3">
                      <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
                        <i className="fi fi-sr-sim-card w-4 h-5 text-gray-400"></i>
                      </div>
                      <input 
                        className="placeholder:text-gray-400 !text-lime-500 border-[1.5px] !border-lime-500 py-[17px] !rounded-[10px] !bg-transparent autofill:bg-autofillBg bg-transparent border hover:border-lime-500 focus:border-lime-500 focus:outline-0 text-gray-200 focus:text-gray-200 text-sm rounded-md focus:ring-rose-500 block w-full ps-10 p-2.5" 
                        type="text" 
                        placeholder="Enter Deposit Transaction Id" 
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                </div>

                {/* Limits Section */}
                <div className="mx-2 my-2">
                  <div className="flex mb-2">
                    <h1 className="text-lime-400 text-[12px] flex-auto">Minimum limit</h1>
                    <h1 className="text-lime-500/80 text-[12px]">{depositMethod.min_amount} {depositMethod.currency}</h1>
                  </div>
                  <div className="flex mb-2">
                    <h1 className="text-lime-400 text-[12px] flex-auto">Maximum limit</h1>
                    <h1 className="text-lime-500/80 text-[12px]">{depositMethod.max_amount} {depositMethod.currency}</h1>
                  </div>
                  <div className="flex mb-2">
                    <h1 className="text-lime-400 text-[12px] flex-auto">1 {depositMethod.currency} =</h1>
                    <h1 className="text-lime-500/80 text-[12px]">1.00 {depositMethod.currency}</h1>
                  </div>
                </div>

                <div className="flex text-gray-500 text-[12px] mx-2 mb-[50px]">
                  <span className="text-[15px] pe-2">*</span>
                  <span>After making the deposit and filling all the information click the button.</span>
                </div>
              </>
            )}
          </div>

          {/* Submit Button */}
          <div className="fixed bottom-[70px] w-[100%] max-w-lg -translate-x-1/2 left-1/2 px-3">
            <button 
              type="button" 
              className="bg-gradient-to-r hover:bg-gradient-to-l bg-lime-400 to-rose-600 text-white w-[100%] p-2 rounded-[10px] w-100 py-[14px] text-[14px] !font-semibold bg-lime-500 hover:bg-lime-600 !text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleSubmitDeposit}
              disabled={isSubmitting || !depositAmount || !transactionId || isLoading}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Deposit Request'}
            </button>
          </div>

          
        </div>
      </div>
    </div>
  );
};

export default DepositDetail;
