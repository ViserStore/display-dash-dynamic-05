import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import QRCode from 'qrcode';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import BottomNavigation from '@/components/BottomNavigation';
import PageHeader from '@/components/PageHeader';
import { notify } from '@/utils/notifications';

const Referral = () => {
  const { user } = useAuth();
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

  // Fetch user data with referral info
  const { data: userData, refetch: refetchUserData } = useQuery({
    queryKey: ['user-referral-data', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      console.log('Fetching referral data for user:', user.id);
      
      const { data, error } = await supabase
        .from('users')
        .select('referral_code, total_referrals, referral_earnings, username, pay_id')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error('Error fetching user referral data:', error);
        throw error;
      }
      
      console.log('Fetched user referral data:', data);
      
      // If user doesn't have a referral code, generate one in base64 format
      if (!data.referral_code) {
        console.log('User has no referral code, generating one...');
        
        // Generate a base64 encoded referral code
        const baseString = `${data.username || 'user'}_${Date.now()}`;
        const referralCode = btoa(baseString).replace(/[+=\/]/g, '').substring(0, 12);
        
        const { error: updateError } = await supabase
          .from('users')
          .update({ referral_code: referralCode })
          .eq('id', user.id);
        
        if (updateError) {
          console.error('Error updating referral code:', updateError);
        } else {
          console.log('Generated referral code:', referralCode);
          data.referral_code = referralCode;
        }
      }
      
      return data;
    },
    enabled: !!user?.id
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

  // Fetch referral settings with real-time updates - only active ones
  const { data: referralSettings, refetch: refetchReferralSettings } = useQuery({
    queryKey: ['referral-settings'],
    queryFn: async () => {
      console.log('Fetching referral settings...');
      const { data, error } = await supabase
        .from('referral_settings')
        .select('*')
        .eq('active', true)  // Only fetch active settings
        .order('setting_type')
        .order('level_number');
      
      if (error) {
        console.error('Error fetching referral settings:', error);
        throw error;
      }
      
      console.log('Fetched referral settings:', data);
      return data;
    }
  });

  // Fetch user's referral transactions (today's bonus)
  const { data: todayBonus } = useQuery({
    queryKey: ['today-referral-bonus', user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;
      
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('transactions')
        .select('amount')
        .eq('user_id', user.id)
        .eq('type', 'referral_bonus')
        .gte('created_at', `${today}T00:00:00`)
        .lt('created_at', `${today}T23:59:59`);
      
      if (error) throw error;
      
      const totalToday = data?.reduce((sum, transaction) => sum + Number(transaction.amount), 0) || 0;
      return totalToday;
    },
    enabled: !!user?.id
  });

  // Fetch team deposit total
  const { data: teamDeposit } = useQuery({
    queryKey: ['team-deposit-total', user?.id],
    queryFn: async () => {
      if (!user?.id || !userData?.referral_code) return 0;
      
      // Get all users referred by this user
      const { data: referredUsers, error: usersError } = await supabase
        .from('users')
        .select('id')
        .eq('referred_by', user.id);
      
      if (usersError) throw usersError;
      if (!referredUsers?.length) return 0;
      
      const referredUserIds = referredUsers.map(u => u.id);
      
      // Get total deposits of referred users
      const { data: deposits, error: depositsError } = await supabase
        .from('deposits')
        .select('amount')
        .in('user_id', referredUserIds)
        .eq('status', 'completed');
      
      if (depositsError) throw depositsError;
      
      const totalDeposits = deposits?.reduce((sum, deposit) => sum + Number(deposit.amount), 0) || 0;
      return totalDeposits;
    },
    enabled: !!user?.id && !!userData?.referral_code
  });

  // Count active referrals (users who have made at least one deposit)
  const { data: activeReferrals } = useQuery({
    queryKey: ['active-referrals', user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;
      
      // Get all users referred by this user
      const { data: referredUsers, error: usersError } = await supabase
        .from('users')
        .select('id')
        .eq('referred_by', user.id);
      
      if (usersError) throw usersError;
      if (!referredUsers?.length) return 0;
      
      const referredUserIds = referredUsers.map(u => u.id);
      
      // Count users who have made at least one completed deposit
      const { data: activeUsers, error: activeError } = await supabase
        .from('deposits')
        .select('user_id')
        .in('user_id', referredUserIds)
        .eq('status', 'completed');
      
      if (activeError) throw activeError;
      
      // Get unique user IDs who have made deposits
      const uniqueActiveUsers = new Set(activeUsers?.map(d => d.user_id) || []);
      return uniqueActiveUsers.size;
    },
    enabled: !!user?.id
  });

  // Get current website domain
  const currentWebsite = window.location.origin;
  
  const referralLink = userData?.referral_code 
    ? `${currentWebsite}/referral/${userData.referral_code}`
    : '';

  useEffect(() => {
    // Generate QR code when component mounts or referral link changes
    const generateQRCode = async () => {
      if (!referralLink) return;
      
      try {
        const qrDataUrl = await QRCode.toDataURL(referralLink, {
          width: 200,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
        setQrCodeDataUrl(qrDataUrl);
      } catch (error) {
        console.error('Error generating QR code:', error);
      }
    };

    generateQRCode();
  }, [referralLink]);

  // Set up real-time subscriptions for both user data and referral settings
  useEffect(() => {
    if (!user?.id) return;

    console.log('Setting up real-time subscriptions for referral data');

    // Subscribe to user data changes
    const userChannel = supabase
      .channel('user-referral-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${user.id}`
        },
        (payload) => {
          console.log('User data updated:', payload);
          refetchUserData();
        }
      )
      .subscribe();

    // Subscribe to referral settings changes
    const settingsChannel = supabase
      .channel('referral-settings-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'referral_settings'
        },
        (payload) => {
          console.log('Referral settings updated:', payload);
          refetchReferralSettings();
        }
      )
      .subscribe();

    // Subscribe to new referral transactions
    const transactionChannel = supabase
      .channel('referral-transaction-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('New transaction:', payload);
          if (payload.new.type === 'referral_bonus') {
            refetchUserData();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(userChannel);
      supabase.removeChannel(settingsChannel);
      supabase.removeChannel(transactionChannel);
    };
  }, [user?.id, refetchUserData, refetchReferralSettings]);

  const handleInviteWithQR = () => {
    const modal = document.getElementById('my_modal_3') as HTMLDialogElement;
    if (modal) {
      modal.showModal();
    }
  };

  const handleCopyReferralId = () => {
    if (userData?.referral_code) {
      navigator.clipboard.writeText(userData.referral_code);
      notify.success("Referral ID copied to clipboard");
    }
  };

  const handleCopyReferralLink = () => {
    if (referralLink) {
      navigator.clipboard.writeText(referralLink);
      notify.success("Referral link copied to clipboard");
    }
  };

  // Group referral settings by type - show only active levels
  const depositSettings = referralSettings?.filter(s => s.setting_type === 'deposit' && s.active && s.bonus_percentage > 0) || [];
  const tradeWinSettings = referralSettings?.filter(s => s.setting_type === 'trade_win' && s.active && s.bonus_percentage > 0) || [];

  const siteCurrency = siteSettings?.site_currency || 'USDT';

  return (
    <div className="relative min-h-[100vh] bg-black mx-auto max-w-[480px] overflow-y-hidden">
      <div className="min-h-[100vh] pt-[0px] pb-[63px]">
        <div className="relative z-[1]">
          {/* Header Section */}
          <PageHeader title="Referral" />

          {/* Content Section */}
          <div className="relative overflow-x-auto h-[calc(100vh-154px)]">
            <div className="relative z-[2]">
              <div className="p-[15px]">
                <div className="mx-auto">
                  <div>
                    <h1 className="font-semibold text-[25px] text-center text-white">Earn Crypto Together.</h1>
                    <h1 className="font-normal text-[15px] text-gray-50 mt-3 text-center">Earn up to 20% commission on every successful referral trade!</h1>
                  </div>

                  {/* Bonus Stats */}
                  <div className="relative bg-white/20 backdrop-blur-sm shadow-sm rounded-lg p-4 mt-10">
                    <div className="w-[70px] h-[70px] absolute right-[10px] -top-[50px]"></div>
                    <div className="flex items-center">
                      <div className="pe-1">
                        <img className="w-[13px]" src="data:image/svg+xml,%3csvg%20height='200px'%20width='200px'%20version='1.1'%20id='Layer_1'%20xmlns='http://www.w3.org/2000/svg'%20xmlns:xlink='http://www.w3.org/1999/xlink'%20viewBox='0%200%20393.051%20393.051'%20xml:space='preserve'%20fill='%23000000'%20transform='rotate(0)'%3e%3cg%20id='SVGRepo_bgCarrier'%20stroke-width='0'%3e%3c/g%3e%3cg%20id='SVGRepo_tracerCarrier'%20stroke-linecap='round'%20stroke-linejoin='round'%3e%3c/g%3e%3cg%20id='SVGRepo_iconCarrier'%3e%3cpath%20style='fill:%23a3a3a3;'%20d='M21.98,103.628h41.18v-29.22h-8.404c-6.012,0-10.925-4.848-10.925-10.925s4.848-10.925,10.925-10.925%20h283.539c6.012,0,10.925,4.848,10.925,10.925s-4.849,10.925-10.925,10.925h-8.404v29.22h41.115V23.467H21.98V103.628z'%3e%3c/path%3e%3cpath%20style='fill:%23a3a3a300;'%20d='M307.846,74.473H84.816V343.79c5.883-3.168,12.606-4.978,19.717-4.978%20c12.154,0,23.014,5.172,30.578,13.511c7.564-8.275,18.489-13.511,30.578-13.511c12.154,0,23.014,5.172,30.578,13.511%20c7.564-8.275,18.489-13.511,30.578-13.511c12.089,0,23.014,5.172,30.578,13.511c7.564-8.275,18.489-13.511,30.578-13.511c7.111,0,13.834,1.745,19.717,4.978L307.846,74.473L307.846,74.473z'%3e%3c/path%3e%3cpath%20style='fill:%23ffdf0f;'%20d='M106.602,96.129v111.968h30.319c6.012,0,10.925,4.848,10.925,10.925%20c0,6.012-4.848,10.925-10.925,10.925h-30.319v23.079H121.6c6.012,0,10.925,4.848,10.925,10.925c0,6.012-4.848,10.925-10.925,10.925%20h-14.998v42.085c10.279,0.323,20.04,3.168,28.509,7.887c9.051-5.042,19.459-7.887,30.578-7.887c11.119,0,21.527,2.844,30.578,7.887%20c9.051-5.042,19.523-7.887,30.578-7.887c11.055,0,21.527,2.844,30.578,7.887c8.469-4.719,18.166-7.499,28.509-7.887V96.129H106.602z%20'%3e%3c/path%3e%3cpath%20d='M194.586,202.731h0.065C195.038,202.667,194.65,202.667,194.586,202.731z'%3e%3c/path%3e%3cg%3e%3cpath%20style='fill:%23a3a3a3;'%20d='M196.331,269.317c-12.347,0-22.497-10.15-22.497-22.497c0-6.012-4.848-10.925-10.925-10.925%20c-6.012,0-10.925,4.848-10.925,10.925c0,20.622,14.222,38.012,33.358,42.861v10.731c0,6.012,4.848,10.925,10.925,10.925%20c6.012,0,10.925-4.848,10.925-10.925v-10.731c19.135-4.848,33.358-22.238,33.358-42.861c0-24.436-21.527-44.154-45.964-44.154%20c-0.129,0-0.129,0-0.065,0c-11.572-0.905-20.687-10.602-20.687-22.432c0-12.347,10.02-22.497,22.497-22.497%20c12.347,0,22.497,10.15,22.497,22.497c0,6.012,4.848,10.925,10.925,10.925c6.012,0,10.925-4.848,10.925-10.925%20c0-20.622-14.222-38.012-33.358-42.861v-10.796c0-6.012-4.848-10.925-10.925-10.925c-6.077,0-10.925,4.848-10.925,10.925v10.796%20c-19.135,4.848-33.358,22.238-33.358,42.861c0,24.436,19.846,44.283,44.283,44.283c-0.388,0.065,0,0,0.065,0%20c11.572,0.905,22.303,10.537,22.303,22.238C218.828,259.297,208.679,269.317,196.331,269.317z'%3e%3c/path%3e%3cpath%20style='fill:%23a3a3a3;'%20d='M381.737,1.681H10.925C4.913,1.681,0,6.659,0,12.671v102.012c0,6.012,4.848,10.925,10.925,10.925%20H63.03v254.836c0,6.012,4.848,10.925,10.925,10.925s10.925-4.848,10.925-10.925c0-10.925,8.792-19.717,19.717-19.717%20s19.717,8.792,19.717,19.717c0,6.012,4.848,10.925,10.925,10.925s10.925-4.848,10.925-10.925c0-10.925,8.792-19.717,19.717-19.717%20s19.717,8.792,19.717,19.717c0,6.012,4.848,10.925,10.925,10.925c6.077,0,10.925-4.848,10.925-10.925%20c0-10.925,8.792-19.717,19.717-19.717c10.925,0,19.717,8.792,19.717,19.717l0,0l0,0l0,0l0,0l0,0l0,0l0,0l0,0l0,0l0,0l0,0l0,0l0,0c0.065,5.947,4.913,10.731,10.925,10.731s10.925-4.848,10.925-10.925V125.479h52.105%20c6.012,0,10.925-4.848,10.925-10.925V12.541C392.598,6.594,387.749,1.681,381.737,1.681z%20M84.816,74.473h223.03V343.79%20c-5.883-3.168-12.606-4.978-19.717-4.978c-12.154,0-23.014,5.172-30.578,13.511c-7.564-8.275-18.489-13.511-30.578-13.511%20c-12.089,0-23.014,5.172-30.578,13.511c-7.564-8.275-18.489-13.511-30.578-13.511c-12.089,0-23.014,5.172-30.578,13.511%20c-7.564-8.275-18.489-13.511-30.578-13.511c-7.111,0-13.834,1.745-19.717,4.978%20M370.812,103.628h-41.18v-29.22h8.404%20c6.012,0,10.925-4.848,10.925-10.925s-4.848-10.925-10.925-10.925H54.626c-6.012,0-10.925,4.848-10.925,10.925%20s4.848,10.925,10.925,10.925h8.404v29.22h-41.18V23.467h348.962L370.812,103.628L370.812,103.628z'%3e%3c/path%3e%3c/g%3e%3c/g%3e%3c/svg%3e" alt="" />
                      </div>
                      <div className="flex-auto">
                        <h1 className="text-sm text-gray-100">Total Bonus</h1>
                      </div>
                      <div>
                        <h1 className="text-sm text-white font-semibold">
                          {userData?.referral_earnings?.toFixed(2) || '0.00'} {siteCurrency}
                        </h1>
                      </div>
                    </div>
                    <div className="flex items-center mt-3">
                      <div className="pe-1">
                        <img className="w-[13px]" src="data:image/svg+xml,%3csvg%20height='200px'%20width='200px'%20version='1.1'%20id='Layer_1'%20xmlns='http://www.w3.org/2000/svg'%20xmlns:xlink='http://www.w3.org/1999/xlink'%20viewBox='0%200%20512%20512'%20xml:space='preserve'%20fill='%23a6a0a0'%20stroke='%23a6a0a0'%3e%3cg%20id='SVGRepo_bgCarrier'%20stroke-width='0'%3e%3c/g%3e%3cg%20id='SVGRepo_tracerCarrier'%20stroke-linecap='round'%20stroke-linejoin='round'%3e%3c/g%3e%3cg%20id='SVGRepo_iconCarrier'%3e%3cpolygon%20style='fill:%23bababa;'%20points='152.288,283.696%2062.448,390.904%20119.136,390.808%20128.512,447.208%20218.816,339.448%20'%3e%3c/polygon%3e%3cpolygon%20style='fill:%23a6a0a0;'%20points='218.816,339.448%20128.512,447.208%20119.136,390.808%20185.552,311.568%20'%3e%3c/polygon%3e%3cpolygon%20points='340.264,251.032%20340.264,510.656%20259.712,442.928%20179.16,512%20179.16,251.032%20'%3e%3c/polygon%3e%3cpolygon%20style='fill:%23bababa;'%20points='179.16,251.032%20179.16,512%20259.712,442.928%20259.712,251.032%20'%3e%3c/polygon%3e%3cpath%20style='fill:%23ffd500;'%20d='M449.552,190.4l-49.848-40.184l32-55.592l-67.632-5.912l-5.888-65.056l-56.952,27.2L262.112,0%20l-36.8,52.048l-59.336-30.76l-3.56,67.424l-66.448,3.552l24.92,63.872l-51.024,30.752l52.248,39.032l-26.104,55.592l65.256,7.096%20l3.56,66.24l60.488-28.384l40.344,53.224l35.592-53.224l55.768,27.2l4.744-66.24l65.256-1.184l-23.728-54.4L449.552,190.4z'%3e%3c/path%3e%3ccircle%20style='fill:%23ffd500;'%20cx='259.712'%20cy='189.384'%20r='128.32'%3e%3c/circle%3e%3cpath%20style='fill:%23CCCCCC;'%20d='M259.712,84.8c57.752,0,104.576,46.824,104.576,104.576s-46.824,104.576-104.576,104.576%20s-104.568-46.816-104.576-104.568C155.192,131.656,201.976,84.864,259.712,84.8%20M259.712,76.8%20c-62.176,0-112.576,50.4-112.576,112.576s50.4,112.576,112.576,112.576c62.168,0,112.568-50.4,112.576-112.568%20C372.288,127.208,321.888,76.808,259.712,76.8L259.712,76.8z'%3e%3c/path%3e%3cpolygon%20points='277.168,165.224%20259.712,111.504%20242.248,165.224%20185.752,165.224%20231.464,198.424%20214,252.168%20259.712,218.944%20305.424,252.168%20287.952,198.424%20333.664,165.224%20'%3e%3c/polygon%3e%3c/g%3e%3c/svg%3e" alt="" />
                      </div>
                      <div className="flex-auto">
                        <h1 className="text-sm text-gray-100">Today Bonus</h1>
                      </div>
                      <div>
                        <h1 className="text-sm text-white font-semibold">
                          {todayBonus?.toFixed(2) || '0.00'} {siteCurrency}
                        </h1>
                      </div>
                    </div>
                  </div>

                  {/* Commission Structure */}
                  <div className="bg-white/20 backdrop-blur-sm shadow-sm rounded-lg p-4 mt-5">
                    {/* Deposit Commission */}
                    <div className="my-2">
                      <div className="flex gap-2 mb-2">
                        <div className="bg-black/50 text-center text-white rounded-[5px] text-[14px] py-1 px-2 flex-auto">Deposit Refer Commission</div>
                      </div>
                      {depositSettings.length > 0 ? (
                        depositSettings.map((setting) => (
                          <div key={setting.id} className="flex gap-2 mt-1">
                            <div className="bg-black/50 text-white rounded-[5px] text-[14px] py-1 px-2 flex-auto">Level {setting.level_number}:</div>
                            <div className="bg-black/50 text-white rounded-[5px] text-[14px] py-1 px-2">{setting.bonus_percentage}%</div>
                          </div>
                        ))
                      ) : (
                        <div className="flex gap-2 mt-1">
                          <div className="bg-black/50 text-white rounded-[5px] text-[14px] py-1 px-2 flex-auto">No active levels</div>
                          <div className="bg-black/50 text-white rounded-[5px] text-[14px] py-1 px-2">0%</div>
                        </div>
                      )}
                    </div>

                    {/* Trade Win Commission */}
                    <div className="my-2">
                      <div className="flex gap-2 mb-2">
                        <div className="bg-black/50 text-center text-white rounded-[5px] text-[14px] py-1 px-2 flex-auto">Trade Win Commission</div>
                      </div>
                      {tradeWinSettings.length > 0 ? (
                        tradeWinSettings.map((setting) => (
                          <div key={setting.id} className="flex gap-2 mt-1">
                            <div className="bg-black/50 text-white rounded-[5px] text-[14px] py-1 px-2 flex-auto">Level {setting.level_number}:</div>
                            <div className="bg-black/50 text-white rounded-[5px] text-[14px] py-1 px-2">{setting.bonus_percentage}%</div>
                          </div>
                        ))
                      ) : (
                        <div className="flex gap-2 mt-1">
                          <div className="bg-black/50 text-white rounded-[5px] text-[14px] py-1 px-2 flex-auto">No active levels</div>
                          <div className="bg-black/50 text-white rounded-[5px] text-[14px] py-1 px-2">0%</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Referral Information */}
                  <div className="bg-white/20 backdrop-blur-sm shadow-sm rounded-lg p-4 mt-5 mb-4">
                    <div className="grid grid-cols-2 gap-2 bg-black/50 p-3 rounded-[5px] mb-3">
                      <div className="text-center">
                        <h1 className="text-[12px] text-white">Total Referrals</h1>
                        <h1 className="text-[16px] text-white font-semibold">{userData?.total_referrals || 0}</h1>
                      </div>
                      <div className="text-center border-l-[1.5px] border-white/80 -ml-1 pl-3">
                        <h1 className="text-[12px] text-white">Active Referrals</h1>
                        <h1 className="text-[16px] text-white font-semibold">{activeReferrals || 0}</h1>
                      </div>
                      <div className="text-center border-white/80 -ml-1 pl-3 col-span-2">
                        <h1 className="text-[12px] text-white">Total Team Deposit</h1>
                        <h1 className="text-[16px] text-white font-semibold">{teamDeposit?.toFixed(0) || 0} {siteCurrency}</h1>
                      </div>
                    </div>

                    <div className="flex gap-3 bg-black/50 p-[10px] rounded-[5px]">
                      <div className="flex-auto">
                        <h1 className="text-sm text-gray-100 text-nowrap">Referral ID</h1>
                      </div>
                      <h1 className="text-sm text-gray-50 font-normal truncate">
                        {userData?.referral_code || 'Loading...'}
                      </h1>
                      <div>
                        <i 
                          className="fi fi-sr-copy-alt text-[14px] text-gray-50 hover:text-white leading-[0px] cursor-pointer"
                          onClick={handleCopyReferralId}
                        ></i>
                      </div>
                    </div>

                    <div className="flex gap-3 bg-black/50 p-[10px] rounded-[5px] mt-3">
                      <div className="flex-auto">
                        <h1 className="text-sm text-gray-100 text-nowrap">Referral Link</h1>
                      </div>
                      <div className="text-sm text-gray-50 font-normal truncate">{referralLink || 'Loading...'}</div>
                      <div>
                        <i 
                          className="fi fi-sr-copy-alt text-[14px] text-gray-50 hover:text-white leading-[0px] cursor-pointer"
                          onClick={handleCopyReferralLink}
                        ></i>
                      </div>
                    </div>

                    <div className="mt-3">
                      <button 
                        type="button" 
                        className="bg-gradient-to-r hover:bg-gradient-to-l bg-white hover:bg-white !rounded-[5px] !text-gray-700 to-rose-600 text-white w-[100%] p-2 rounded-[10px]"
                        onClick={handleInviteWithQR}
                        disabled={!userData?.referral_code}
                      >
                        Invite With QR Code
                      </button>
                    </div>
                  </div>

                  {/* QR Code Modal */}
                  <dialog id="my_modal_3" className="modal">
                    <div className="modal-box bg-white/20 backdrop-blur max-w-[300px]">
                      <form method="dialog">
                        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                      </form>
                      <h3 className="font-bold text-white text-lg">TradeBull</h3>
                      <p className="py-2 text-[12px] text-white text-center">Register Now & Earn Crypto Together.</p>
                      <div className="flex justify-center mt-4">
                        <div className="bg-white w-[220px] h-[200px] p-1 rounded flex items-center justify-center">
                          {qrCodeDataUrl ? (
                            <img 
                              src={qrCodeDataUrl} 
                              alt="QR Code" 
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <div className="text-gray-500 text-sm">Generating QR Code...</div>
                          )}
                        </div>
                      </div>
                      <div className="text-center bg-white/90 px-2 py-1 mt-2 rounded-[5px]">
                        <h1 className="text-[12px] font-normal text-black">Referral ID</h1>
                        <h1 className="text-[16px] font-semibold text-black">
                          {userData?.referral_code || 'Loading...'}
                        </h1>
                      </div>
                    </div>
                    <form method="dialog" className="modal-backdrop">
                      <button>close</button>
                    </form>
                  </dialog>
                </div>
              </div>
            </div>
          </div>

          
        </div>
      </div>
    </div>
  );
};

export default Referral;
