
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { notify } from '@/utils/notifications';
import BottomNavigation from '@/components/BottomNavigation';
import { useNavigate } from 'react-router-dom';

interface UserData {
  balance?: number;
  pay_id?: string;
  full_name?: string;
  username?: string;
}

interface ReceiverData {
  id: string;
  username: string;
  pay_id: string;
  full_name?: string;
}

interface SiteSettings {
  transfer_min_limit: number;
  transfer_charge: number;
  currency_symbol: string;
  site_currency: string;
}

const BalanceTransfer = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState<UserData>({});
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    transfer_min_limit: 10,
    transfer_charge: 3,
    currency_symbol: '$',
    site_currency: 'USDT'
  });
  const [transferAmount, setTransferAmount] = useState<string>('');
  const [payId, setPayId] = useState<string>('');
  const [receiverData, setReceiverData] = useState<ReceiverData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Database function to add balance to user
  const addUserBalanceRPC = async (userId: string, amount: number) => {
    const { data, error } = await supabase.rpc('add_user_balance', {
      user_id: userId,
      amount: amount
    });
    
    if (error) {
      // If RPC doesn't exist, update directly
      console.log('RPC not found, updating balance directly');
      const { data: currentUser, error: fetchError } = await supabase
        .from('users')
        .select('balance')
        .eq('id', userId)
        .single();
      
      if (fetchError) throw fetchError;
      
      const newBalance = (currentUser.balance || 0) + amount;
      const { error: updateError } = await supabase
        .from('users')
        .update({ balance: newBalance })
        .eq('id', userId);
      
      if (updateError) throw updateError;
    }
    
    return data;
  };

  // Database function to deduct balance from user
  const deductUserBalanceRPC = async (userId: string, amount: number) => {
    const { data, error } = await supabase.rpc('deduct_user_balance', {
      user_id: userId,
      amount: amount
    });
    
    if (error) {
      // If RPC doesn't exist, update directly
      console.log('RPC not found, updating balance directly');
      const { data: currentUser, error: fetchError } = await supabase
        .from('users')
        .select('balance')
        .eq('id', userId)
        .single();
      
      if (fetchError) throw fetchError;
      
      const newBalance = (currentUser.balance || 0) - amount;
      const { error: updateError } = await supabase
        .from('users')
        .update({ balance: newBalance })
        .eq('id', userId);
      
      if (updateError) throw updateError;
    }
    
    return data;
  };

  useEffect(() => {
    if (!user) {
      notify.error('Please login to access Balance Transfer');
      return;
    }

    const fetchUserDataAndSettings = async () => {
      try {
        // Fetch user data
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('pay_id, full_name, username, balance')
          .eq('id', user.id)
          .single();

        if (userError) {
          console.error('Error fetching user data:', userError);
          notify.error('Failed to load user data');
          return;
        }

        // Fetch site settings
        const { data: settingsData, error: settingsError } = await supabase
          .from('site_settings')
          .select('transfer_min_limit, transfer_charge, currency_symbol, site_currency')
          .single();

        if (settingsError) {
          console.error('Error fetching site settings:', settingsError);
          notify.error('Failed to load transfer settings');
        } else if (settingsData) {
          setSiteSettings({
            transfer_min_limit: settingsData.transfer_min_limit || 10,
            transfer_charge: settingsData.transfer_charge || 3,
            currency_symbol: settingsData.currency_symbol || '$',
            site_currency: settingsData.site_currency || 'USDT'
          });
        }

        if (userData) {
          setUserData({
            balance: userData.balance || 0.00,
            pay_id: userData.pay_id,
            full_name: userData.full_name,
            username: userData.username
          });
        }
      } catch (error) {
        console.error('Error:', error);
        notify.error('Failed to connect to database');
      }
    };

    fetchUserDataAndSettings();
  }, [user]);

  const calculateTransferDetails = () => {
    const amount = parseFloat(transferAmount) || 0;
    const charge = (amount * siteSettings.transfer_charge) / 100;
    const receiveAmount = amount - charge;
    
    return {
      amount,
      charge,
      receiveAmount: Math.max(0, receiveAmount)
    };
  };

  const searchReceiver = async () => {
    if (!payId || payId.length < 6) {
      notify.error('Please enter a valid Pay ID (minimum 6 digits)');
      return false;
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, username, pay_id, full_name')
        .eq('pay_id', payId)
        .single();

      if (error || !data) {
        setReceiverData(null);
        notify.error('Pay ID not found');
        return false;
      } else if (data.id === user?.id) {
        setReceiverData(null);
        notify.error('Cannot transfer to yourself');
        return false;
      } else {
        setReceiverData(data);
        return true;
      }
    } catch (error) {
      console.error('Error searching receiver:', error);
      setReceiverData(null);
      notify.error('Database connection error');
      return false;
    }
  };

  const handleNext = async () => {
    if (!user) {
      notify.error('Please login to continue with the transfer');
      return;
    }

    const { amount, receiveAmount } = calculateTransferDetails();
    
    if (!amount || amount < siteSettings.transfer_min_limit) {
      notify.error(`Minimum transfer amount is ${siteSettings.transfer_min_limit} ${siteSettings.site_currency}`);
      return;
    }

    if (amount > (userData.balance || 0)) {
      notify.error('Insufficient balance');
      return;
    }

    if (receiveAmount <= 0) {
      notify.error('Transfer amount too small after fees');
      return;
    }

    // Search for receiver when Next button is clicked
    const receiverFound = await searchReceiver();
    if (!receiverFound) {
      return;
    }

    setIsModalOpen(true);
  };

  const handleConfirmTransfer = async () => {
    if (!user || !receiverData) return;

    const { amount, charge, receiveAmount } = calculateTransferDetails();
    
    setIsLoading(true);
    try {
      // Start database transaction
      console.log('Starting transfer transaction...');

      // Create transfer transaction for sender
      const { error: transferError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: 'transfer',
          amount: -amount,
          status: 'completed',
          description: JSON.stringify({
            receiver_id: receiverData.id,
            receiver_username: receiverData.username,
            receiver_pay_id: receiverData.pay_id,
            charge: charge,
            original_amount: amount,
            receive_amount: receiveAmount
          })
        });

      if (transferError) {
        console.error('Transfer transaction error:', transferError);
        throw transferError;
      }

      // Create receive transaction for receiver
      const { error: receiveError } = await supabase
        .from('transactions')
        .insert({
          user_id: receiverData.id,
          type: 'transfer',
          amount: receiveAmount,
          status: 'completed',
          description: JSON.stringify({
            sender_id: user.id,
            sender_username: userData.username,
            sender_pay_id: userData.pay_id,
            original_amount: amount,
            charge: charge
          })
        });

      if (receiveError) {
        console.error('Receive transaction error:', receiveError);
        throw receiveError;
      }

      // Update sender balance
      await deductUserBalanceRPC(user.id, amount);

      // Update receiver balance
      await addUserBalanceRPC(receiverData.id, receiveAmount);

      // Update local user data
      setUserData(prev => ({
        ...prev,
        balance: (prev.balance || 0) - amount
      }));

      notify.success('Transfer completed successfully');
      setIsModalOpen(false);
      setTransferAmount('');
      setPayId('');
      setReceiverData(null);

      // Navigate to transfer logs
      navigate('/transfer/logs');

      console.log('Transfer completed successfully');

    } catch (error) {
      console.error('Transfer error:', error);
      notify.error('Transfer failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackClick = () => {
    window.history.back();
  };

  const { charge, receiveAmount } = calculateTransferDetails();

  // If user is not logged in, show login message
  if (!user) {
    return (
      <>
        
        <div className="relative min-h-[100vh] mx-auto max-w-[480px] bg-black overflow-y-hidden">
          <div className="min-h-[100vh] pt-[0px] pb-[63px] flex items-center justify-center">
            <div className="text-white text-center p-6">
              <h2 className="text-xl font-bold mb-4">Login Required</h2>
              <p className="text-gray-300 mb-6">Please login to access Balance Transfer</p>
              <a href="/login" className="bg-lime-500 text-black px-6 py-3 rounded-lg font-semibold hover:bg-lime-400 transition-colors">
                Go to Login
              </a>
            </div>
          </div>
        </div>
      </>
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
                    <h1 className="_text-white_lq8ol_196 _font-bold_lq8ol_110">Balance Transfer</h1>
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

            {/* Transfer Form */}
            <div className="_mx-auto_lq8ol_1 _px-[8px]_lq8ol_284 pb-[40px] _py-3_lq8ol_170 overflow-auto h-[calc(100vh-127px)]">
              <div className="_mx-2_lq8ol_165 _mt-3_lq8ol_94">
                
                {/* Transfer Amount */}
                <div className="relative">
                  <label htmlFor="Transfer Amount" className="block mb-2 text-sm font-medium text-gray-200 text-lime-500 absolute left-[20px] top-[-10px] z-[1] px-2 bg-black uppercase">
                    Transfer Amount
                  </label>
                  <div className="relative mb-3">
                    <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
                      <i className="fi fi-rr-coins w-4 h-5 text-lime-400"></i>
                    </div>
                    <input 
                      className="placeholder:text-gray-400 !text-lime-500 border-[1.5px] !border-lime-500 py-[17px] !rounded-[10px] !bg-transparent autofill:bg-autofillBg bg-transparent border hover:border-lime-500 focus:border-lime-500 focus:outline-0 text-gray-200 focus:text-gray-200 text-sm rounded-md focus:ring-rose-500 block w-full ps-10 p-2.5" 
                      type="number" 
                      placeholder="Amount" 
                      value={transferAmount}
                      onChange={(e) => setTransferAmount(e.target.value)}
                    />
                  </div>
                </div>

                {/* Balance Info */}
                <div className="_flex_lq8ol_19 _mb-2_lq8ol_493 -mt-1">
                  <h1 className="_text-gray-500_lq8ol_575 _text-[11px]_lq8ol_529 _flex-auto_lq8ol_192 _text-start_lq8ol_527">
                    Available <span className="text-lime-600">{userData.balance?.toFixed(2) || '0.00'}</span> {siteSettings.site_currency}
                  </h1>
                  <h1 className="_text-gray-500_lq8ol_575 _text-[11px]_lq8ol_529 _flex-auto_lq8ol_192 _text-end_lq8ol_531">
                    Minimum <span className="text-lime-600">{siteSettings.transfer_min_limit.toFixed(2)}</span> {siteSettings.site_currency}
                  </h1>
                </div>

                {/* Pay ID */}
                <div className="relative">
                  <label htmlFor="Pay Id" className="block mb-2 text-sm font-medium text-gray-200 text-lime-500 absolute left-[20px] top-[-10px] z-[1] px-2 bg-black uppercase">
                    Pay Id
                  </label>
                  <div className="relative mb-3">
                    <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
                      <i className="fi fi-rr-wallet w-4 h-5 text-lime-400"></i>
                    </div>
                    <input 
                      className="placeholder:text-gray-400 !text-lime-500 border-[1.5px] !border-lime-500 py-[17px] !rounded-[10px] !bg-transparent autofill:bg-autofillBg bg-transparent border hover:border-lime-500 focus:border-lime-500 focus:outline-0 text-gray-200 focus:text-gray-200 text-sm rounded-md focus:ring-rose-500 block w-full ps-10 p-2.5" 
                      type="number" 
                      placeholder="Ex: 123456" 
                      value={payId}
                      onChange={(e) => setPayId(e.target.value)}
                    />
                  </div>
                </div>

                {/* Charge Info */}
                <div className="_mx-2_lq8ol_165 _my-2_lq8ol_502">
                  <div className="_flex_lq8ol_19 _mb-2_lq8ol_493">
                    <h1 className="_text-gray-500_lq8ol_575 _text-[11px]_lq8ol_529 _flex-auto_lq8ol_192">
                      Charge <span className="text-lime-600">{charge.toFixed(2)}</span> {siteSettings.site_currency}
                    </h1>
                  </div>
                </div>

                {/* Note */}
                <div className="_flex_lq8ol_19 _text-gray-500_lq8ol_575 _text-[12px]_lq8ol_77 _mx-2_lq8ol_165">
                  <span className="text-[15px] pe-2">*</span>
                  <span>After filling all the information click the button.</span>
                </div>
              </div>

              {/* Bottom Action */}
              <div className="_fixed_lq8ol_326 bottom-[70px] _w-[100%]_lq8ol_371 max-w-lg -translate-x-1/2 left-1/2 px-3 border-t border-gray-800 pt-2">
                <div className="_flex_lq8ol_19 _items-center_lq8ol_27">
                  <div className="_flex-auto_lq8ol_192">
                    <h1 className="_text-gray-500_lq8ol_575 text-[13px]">Receive Amount</h1>
                    <h1 className="text-lime-600 _font-bold_lq8ol_110 _text-[18px]_lq8ol_310">
                      {receiveAmount.toFixed(2)} {siteSettings.site_currency}
                    </h1>
                    <h1 className="_text-gray-500_lq8ol_575 _text-[12px]_lq8ol_77">
                      Processing fee: <span className="text-lime-600 _font-bold_lq8ol_110">{siteSettings.transfer_charge}%</span>
                    </h1>
                  </div>
                  <button 
                    type="button" 
                    className="bg-gradient-to-r hover:bg-gradient-to-l bg-lime-400 to-rose-600 text-white w-[100%] p-2 rounded-[10px] !w-[110px] text-[14px] !font-semibold !py-0 !h-[40px] bg-lime-600 hover:bg-lime-500 !text-gray-100"
                    onClick={handleNext}
                    disabled={isLoading}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>

            {/* Confirmation Modal - Fixed z-index to appear above bottom navigation */}
            {isModalOpen && receiverData && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => !isLoading && setIsModalOpen(false)}></div>
                
                <dialog className="modal modal-bottom sm:modal-middle _max-w-[480px]_lq8ol_314 _mx-auto_lq8ol_1 relative z-[101]" open>
                  <div className="modal-box bg-gray-500/50 backdrop-blur _relative_lq8ol_15 _px-4_lq8ol_425">
                    <form className="_absolute_lq8ol_346 right-[10px] top-[10px]" method="dialog">
                      <button 
                        type="button"
                        className="_text-[18px]_lq8ol_310 hover:text-[20px] _text-gray-400_lq8ol_587 hover:text-gray-200"
                        onClick={() => !isLoading && setIsModalOpen(false)}
                        disabled={isLoading}
                      >
                        <i className="fi fi-sr-cross-circle"></i>
                      </button>
                    </form>
                    
                    <h3 className="_font-bold_lq8ol_110 _text-center_lq8ol_102 _text-white_lq8ol_196 _text-[14px]_lq8ol_407 -mt-3">
                      Confirm Transfer
                    </h3>
                    
                    <div className="_mt-3_lq8ol_94">
                      <h1 className="_text-[12px]_lq8ol_77 _text-white_lq8ol_196">Send To</h1>
                      <div className="bg-white/20 _p-2_lq8ol_81 rounded-[5px] _mt-2_lq8ol_135">
                        <div className="_flex_lq8ol_19 _gap-3_lq8ol_180 _items-center_lq8ol_27">
                          <img 
                            className="w-[35px] h-[35px]" 
                            src="data:image/svg+xml,%3csvg%20fill='%23000000'%20viewBox='0%200%2024%2024'%20id='user-circle-2'%20data-name='Flat%20Color'%20xmlns='http://www.w3.org/2000/svg'%20class='icon%20flat-color'%3e%3cg%20id='SVGRepo_bgCarrier'%20stroke-width='0'%3e%3c/g%3e%3cg%20id='SVGRepo_tracerCarrier'%20stroke-linecap='round'%20stroke-linejoin='round'%3e%3c/g%3e%3cg%20id='SVGRepo_iconCarrier'%3e%3ccircle%20id='primary'%20cx='12'%20cy='12'%20r='10'%20style='fill:%20%235f727c;'%3e%3c/circle%3e%3cpath%20id='secondary'%20d='M19.37,17.88a8,8,0,0,0-3.43-3.83,5,5,0,1,0-7.88,0,8,8,0,0,0-3.43,3.83A1,1,0,0,0,4.83,19a10,10,0,0,0,14.24.1l.09-.09A1,1,0,0,0,19.37,17.88Z'%20style='fill:%20%23fad900;'%3e%3c/path%3e%3c/g%3e%3c/svg%3e" 
                            alt=""
                          />
                          <div>
                            <h1 className="_font-bold_lq8ol_110 _text-white_lq8ol_196 _text-[14px]_lq8ol_407">
                              {receiverData.pay_id} (PAY ID)
                            </h1>
                            <h1 className="_font-normal_lq8ol_98 text-gray-300 _text-[14px]_lq8ol_407">
                              Username: {receiverData.username}
                            </h1>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-5">
                      <h1 className="_text-[12px]_lq8ol_77 _text-white_lq8ol_196">Amount</h1>
                      <div className="bg-white/20 _p-2_lq8ol_81 rounded-[5px] _mt-2_lq8ol_135">
                        <div className="_flex_lq8ol_19 _gap-3_lq8ol_180 _items-center_lq8ol_27">
                          <h1 className="_flex-auto_lq8ol_192 _font-normal_lq8ol_98 text-gray-300 _text-[14px]_lq8ol_407">
                            Payee Receives
                          </h1>
                          <div className="_text-end_lq8ol_531">
                            <h1 className="_font-bold_lq8ol_110 _text-white_lq8ol_196 _text-[14px]_lq8ol_407">
                              {receiveAmount.toFixed(2)} {siteSettings.site_currency}
                            </h1>
                            <h1 className="_font-normal_lq8ol_98 text-gray-300 _text-[14px]_lq8ol_407">
                              ≈ ({transferAmount} - {charge.toFixed(2)}){siteSettings.currency_symbol}
                            </h1>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white/20 _p-2_lq8ol_81 rounded-[5px] mt-12">
                      <h1 className="text-white/80 _text-[12px]_lq8ol_77">
                        Please ensure payee and amount information is correct. No refunds are supported.
                      </h1>
                    </div>
                    
                    <div className="_mt-3_lq8ol_94">
                      <button 
                        type="button" 
                        className="bg-gradient-to-r hover:bg-gradient-to-l bg-yellow-400 to-rose-600 text-white w-[100%] p-2 rounded-[10px] text-[14px] !font-semibold !py-0 !h-[40px] !rounded-[4px] !bg-gray-50 hover:bg-gray-200 !text-gray-800 disabled:opacity-50"
                        onClick={handleConfirmTransfer}
                        disabled={isLoading}
                      >
                        {isLoading ? 'Processing...' : 'Confirm'}
                      </button>
                    </div>
                    
                    <div className="modal-action _my-2_lq8ol_502"></div>
                  </div>
                </dialog>
              </div>
            )}
          </div>
        </div>
        
      
      </div>
    </>
  );
};

export default BalanceTransfer;
