import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getSupabaseClient } from '@/integrations/supabase/client';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { notify } from '@/utils/notifications';
import { useAuth } from '@/contexts/AuthContext';
import LottieAnimation from '@/contexts/LottieAnimation';

interface BotToken {
  id: string;
  symbol: string;
  name: string;
  image_url: string;
  status: string;
}

interface UserBotTrade {
  id: string;
  user_id: string;
  profit_loss: number;
  trade_timer: number;
  status: string;
  open_time: string;
  close_time: string | null;
  created_at: string;
  updated_at: string;
  coins: string[] | null;
  profit_or_lose: string;
  profit_percent: number;
  profit: number;
  invest_amount: number;
  return_amount: number;
  return_time: string | null;
}

interface TradeSettings {
  bot_max_trade_amount: number;
  bot_min_trade_amount: number;
  bot_profit_type: string;
  bot_daily_trade_limit: number;
  time_profit_settings: Array<{
    time_hours: number;
    profit_percentage: number;
  }>;
}

const BotTrade = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCoins, setSelectedCoins] = useState<string[]>([]);
  const [tradeTimer, setTradeTimer] = useState<number>(1);
  const [investAmount, setInvestAmount] = useState<string>('');
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [liveReturnAmounts, setLiveReturnAmounts] = useState<{[key: string]: number}>({});
  const [tradeProgress, setTradeProgress] = useState<{[key: string]: number}>({});
  const [tradesReadyToClose, setTradesReadyToClose] = useState<number>(0);
  const [tradeRemainingTimes, setTradeRemainingTimes] = useState<{[key: string]: string}>({});
  const [serverTime, setServerTime] = useState<string>('');
  const [pakistanTime, setPakistanTime] = useState<string>('');
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Calculate profit for each selected coin
  const calculateCoinProfit = (totalAmount: number, selectedCoins: string[], profitPercentage: number) => {
    if (!selectedCoins || selectedCoins.length === 0) return 0;
    
    // Divide total amount equally among selected coins
    const amountPerCoin = totalAmount / selectedCoins.length;
    
    // Calculate profit per coin and total profit
    const profitPerCoin = amountPerCoin * (profitPercentage / 100);
    const totalProfit = profitPerCoin * selectedCoins.length;
    
    console.log(`Profit calculation: Total: $${totalAmount}, Coins: ${selectedCoins.length}, Per coin: $${amountPerCoin.toFixed(2)}, Profit %: ${profitPercentage}%, Total profit: $${totalProfit.toFixed(2)}`);
    
    return totalProfit;
  };

  // Fetch trade settings
  const { data: tradeSettings, isLoading: settingsLoading } = useQuery({
    queryKey: ['trade-settings'],
    queryFn: async () => {
      const supabase = await getSupabaseClient();
      const { data, error } = await supabase
        .from('trade_settings')
        .select('*')
        .single();
      
      if (error) {
        console.error('Error fetching trade settings:', error);
        notify.error('Failed to load trade settings');
        throw error;
      }
      
      let parsedTimeSettings = [];
      try {
        if (typeof data.time_profit_settings === 'string') {
          parsedTimeSettings = JSON.parse(data.time_profit_settings);
        } else if (Array.isArray(data.time_profit_settings)) {
          parsedTimeSettings = data.time_profit_settings;
        }
      } catch (parseError) {
        console.error('Error parsing time_profit_settings:', parseError);
        parsedTimeSettings = [
          { time_hours: 1, profit_percentage: 2 },
          { time_hours: 3, profit_percentage: 5 },
          { time_hours: 6, profit_percentage: 10 },
          { time_hours: 12, profit_percentage: 15 },
          { time_hours: 24, profit_percentage: 20 }
        ];
      }
      
      return {
        ...data,
        time_profit_settings: parsedTimeSettings as Array<{ time_hours: number; profit_percentage: number; }>
      } as TradeSettings;
    }
  });

  // Fetch bot tokens
  const { data: botTokens = [], isLoading: tokensLoading } = useQuery({
    queryKey: ['bot-tokens'],
    queryFn: async () => {
      const supabase = await getSupabaseClient();
      const { data, error } = await supabase
        .from('bot_tokens')
        .select('*')
        .eq('status', 'active')
        .order('symbol');
      
      if (error) {
        notify.error('Failed to load available tokens');
        throw error;
      }
      return data as BotToken[];
    }
  });

  // Fetch user bot trades with real-time subscription
  const { data: userBotTrades = [], isLoading: tradesLoading } = useQuery({
    queryKey: ['user-bot-trades'],
    queryFn: async () => {
      if (!user) {
        return [];
      }

      const supabase = await getSupabaseClient();
      const { data, error } = await supabase
        .from('user_bot_trades')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        notify.error('Failed to load your bot trades');
        throw error;
      }
      return data as UserBotTrade[];
    },
    enabled: !!user
  });

  // Set up real-time subscription for user bot trades
  useEffect(() => {
    if (!user) return;

    console.log('Setting up real-time subscription for user bot trades...');
    
    const setupSubscription = async () => {
      const supabase = await getSupabaseClient();
      const channel = supabase
        .channel('user-bot-trades-realtime')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'user_bot_trades',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('Real-time bot trade update:', payload);
            // Invalidate and refetch the trades query
            queryClient.invalidateQueries({ queryKey: ['user-bot-trades'] });
          }
        )
        .subscribe((status) => {
          console.log('Real-time subscription status:', status);
        });

      return () => {
        console.log('Cleaning up real-time subscription');
        supabase.removeChannel(channel);
      };
    };

    const cleanup = setupSubscription();
    return () => {
      cleanup.then(fn => fn && fn());
    };
  }, [user, queryClient]);

  // Fetch user balance and bot balance
  const { data: userBalances, isLoading: balanceLoading } = useQuery({
    queryKey: ['user-balances'],
    queryFn: async () => {
      if (!user) {
        return { balance: 0, bot_balance: 0 };
      }
      
      const supabase = await getSupabaseClient();
      const { data, error } = await supabase
        .from('users')
        .select('balance, bot_balance')
        .eq('id', user.id)
        .single();
      
      if (error) {
        notify.error('Failed to load your balance');
        throw error;
      }
      return { balance: data?.balance || 0, bot_balance: data?.bot_balance || 0 };
    },
    enabled: !!user
  });

  // Live return amount simulation for active trades using UTC time for consistency
  useEffect(() => {
    const activeTrades = userBotTrades.filter(trade => trade.status === 'active');
    
    if (activeTrades.length > 0) {
      const interval = setInterval(() => {
        // Use UTC time for consistent calculations regardless of user timezone
        const currentUTC = new Date();
        const newReturnAmounts: {[key: string]: number} = {};
        const newProgress: {[key: string]: number} = {};
        const newRemainingTimes: {[key: string]: string} = {};
        let readyToCloseCount = 0;
        
        // Update server time and Pakistan time for display
        setServerTime(currentUTC.toUTCString());
        setPakistanTime(currentUTC.toLocaleString('en-US', { 
          timeZone: 'Asia/Karachi',
          hour12: false,
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }));
        
        activeTrades.forEach(trade => {
          // Get profit percentage from settings based on trade timer
          let profitPercentage = 10; // Default fallback
          if (tradeSettings && tradeSettings.time_profit_settings) {
            const timeSetting = tradeSettings.time_profit_settings.find(
              setting => setting.time_hours === trade.trade_timer
            );
            if (timeSetting) {
              profitPercentage = timeSetting.profit_percentage;
            }
          }
          
          // Use UTC time for consistent calculations
          const openTimeUTC = new Date(trade.open_time);
          const timerMs = trade.trade_timer * 60 * 60 * 1000;
          const elapsedMs = currentUTC.getTime() - openTimeUTC.getTime();
          const elapsedPercentage = Math.min(elapsedMs / timerMs, 1);
          
          // Store progress percentage
          newProgress[trade.id] = Math.floor(elapsedPercentage * 100);
          
          // Calculate remaining time based on UTC
          const remainingMs = Math.max(0, timerMs - elapsedMs);
          const remainingHours = Math.floor(remainingMs / (1000 * 60 * 60));
          const remainingMinutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
          const remainingSeconds = Math.floor((remainingMs % (1000 * 60)) / 1000);
          
          if (remainingMs > 0) {
            newRemainingTimes[trade.id] = `${remainingHours.toString().padStart(2, '0')}:${remainingMinutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
          } else {
            newRemainingTimes[trade.id] = 'Ready to close';
          }
          
          // Check if trade is ready to close (100% complete) - only when actually 100%
          if (elapsedPercentage >= 1 && remainingMs <= 0) {
            readyToCloseCount++;
          }
          
          // Don't show return amount during processing, just show progress
          newReturnAmounts[trade.id] = 0;
          
          console.log(`Trade ${trade.id}: Progress: ${newProgress[trade.id]}%, Remaining: ${remainingMs}ms (UTC time: ${currentUTC.toISOString()})`);
        });
        
        setLiveReturnAmounts(newReturnAmounts);
        setTradeProgress(newProgress);
        setTradeRemainingTimes(newRemainingTimes);
        setTradesReadyToClose(readyToCloseCount);
      }, 1000); // Update every second
      
      return () => clearInterval(interval);
    } else {
      setTradesReadyToClose(0);
      setTradeRemainingTimes({});
      setServerTime('');
      setPakistanTime('');
    }
  }, [userBotTrades, tradeSettings]);

  // Create bot trade mutation
  const createTradeMutation = useMutation({
    mutationFn: async (tradeData: {
      invest_amount: number;
      selected_coins: string[];
      trade_timer: number;
    }) => {
      if (!user) {
        notify.error('Please log in to start trading');
        throw new Error('User not authenticated');
      }

      // Check if user has sufficient main balance
      if (!userBalances || userBalances.balance < tradeData.invest_amount) {
        notify.error(`Insufficient main balance! Need $${tradeData.invest_amount.toFixed(2)}, have $${userBalances?.balance.toFixed(2) || '0.00'}`);
        throw new Error('Insufficient main balance');
      }

      const supabase = await getSupabaseClient();

      // Check daily trade limit
      if (tradeSettings) {
        const today = new Date().toISOString().split('T')[0];
        const { data: todayTrades } = await supabase
          .from('user_bot_trades')
          .select('id')
          .eq('user_id', user.id)
          .gte('created_at', today + 'T00:00:00.000Z')
          .lt('created_at', today + 'T23:59:59.999Z');

        if (todayTrades && todayTrades.length >= tradeSettings.bot_daily_trade_limit) {
          notify.error(`Daily trade limit reached! Maximum ${tradeSettings.bot_daily_trade_limit} trades per day.`);
          throw new Error('Daily trade limit reached');
        }
      }

      // Get profit percentage for selected timer
      let profitPercentage = 10; // Default
      if (tradeSettings && tradeSettings.time_profit_settings) {
        const timeSetting = tradeSettings.time_profit_settings.find(
          setting => setting.time_hours === tradeData.trade_timer
        );
        if (timeSetting) {
          profitPercentage = timeSetting.profit_percentage;
        }
      }

      // Calculate return time using UTC time
      const currentTime = new Date();
      const returnTime = new Date(currentTime);
      returnTime.setHours(returnTime.getHours() + tradeData.trade_timer);

      // Log trade creation details
      console.log(`Creating trade with ${tradeData.selected_coins.length} coins, Timer: ${tradeData.trade_timer}h, Profit: ${profitPercentage}%`);
      console.log(`Selected coins: ${tradeData.selected_coins.join(', ')}`);
      console.log(`Amount per coin: $${(tradeData.invest_amount / tradeData.selected_coins.length).toFixed(2)}`);
      console.log(`UTC time: ${currentTime.toISOString()}, Return time: ${returnTime.toISOString()}`);

      // Create trade record with new structure - profit_or_lose will be determined when trade closes
      const tradeRecord = {
        user_id: user.id,
        trade_timer: tradeData.trade_timer,
        status: 'active',
        coins: tradeData.selected_coins,
        profit_or_lose: 'pending', // Will be updated when trade closes
        profit_percent: profitPercentage,
        profit: 0,
        invest_amount: tradeData.invest_amount,
        return_amount: tradeData.invest_amount,
        return_time: returnTime.toISOString()
      };

      const { data, error } = await supabase
        .from('user_bot_trades')
        .insert([tradeRecord])
        .select();

      if (error) {
        notify.error('Failed to create bot trade');
        throw error;
      }

      // Transfer amount from main balance to bot balance
      const { error: balanceError } = await supabase
        .from('users')
        .update({ 
          balance: userBalances.balance - tradeData.invest_amount,
          bot_balance: userBalances.bot_balance + tradeData.invest_amount,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (balanceError) {
        notify.error('Failed to update balances');
        throw balanceError;
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['user-bot-trades'] });
      queryClient.invalidateQueries({ queryKey: ['user-balances'] });
      setIsModalOpen(false);
      setSelectedCoins([]);
      setInvestAmount('');
      setTradeTimer(1);
      
      notify.success(`Successfully created bot trade with ${selectedCoins.length} coins!`);
    },
    onError: (error: any) => {
      console.error('Error creating bot trade:', error);
      if (!error.message.includes('Insufficient main balance') && !error.message.includes('Daily trade limit')) {
        notify.error('Failed to create bot trade. Please try again.');
      }
    }
  });

  // Close all active trades mutation using UTC time for consistency
  const closeAllTradesMutation = useMutation({
    mutationFn: async () => {
      if (!user) {
        notify.error('Please log in to close trades');
        throw new Error('User not authenticated');
      }

      const supabase = await getSupabaseClient();
      const { data: activeTrades, error: fetchError } = await supabase
        .from('user_bot_trades')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active');

      if (fetchError) {
        notify.error('Failed to fetch active trades');
        throw fetchError;
      }

      if (!activeTrades || activeTrades.length === 0) {
        notify.info('No active trades to close');
        return [];
      }

      // Close trades one by one based on their individual timers using UTC time
      const currentUTC = new Date();
      const updatedTrades = [];

      for (const trade of activeTrades) {
        const openTimeUTC = new Date(trade.open_time);
        const timerMs = trade.trade_timer * 60 * 60 * 1000;
        const elapsedMs = currentUTC.getTime() - openTimeUTC.getTime();
        
        // Only close trades that have ACTUALLY completed their timer (not just close to it)
        if (elapsedMs >= timerMs) {
          // Get profit percentage from settings for this trade's timer
          let profitPercentage = trade.profit_percent || 10;
          if (tradeSettings && tradeSettings.time_profit_settings) {
            const timeSetting = tradeSettings.time_profit_settings.find(
              setting => setting.time_hours === trade.trade_timer
            );
            if (timeSetting) {
              profitPercentage = timeSetting.profit_percentage;
            }
          }

          // Determine win/lose based on bot_profit_type setting and randomness
          let isWin = false;
          let actualTradeResult = '';
          
          if (tradeSettings?.bot_profit_type === 'profit') {
            // If bot_profit_type is 'profit', 85% chance of winning
            isWin = Math.random() > 0.15;
            actualTradeResult = isWin ? 'profit' : 'lose';
          } else if (tradeSettings?.bot_profit_type === 'lose') {
            // If bot_profit_type is 'lose', 15% chance of winning
            isWin = Math.random() > 0.85;
            actualTradeResult = isWin ? 'profit' : 'lose';
          } else {
            // Default 50/50 chance
            isWin = Math.random() > 0.5;
            actualTradeResult = isWin ? 'profit' : 'lose';
          }

          // Calculate profit based on selected coins and settings
          const totalProfit = calculateCoinProfit(trade.invest_amount, trade.coins || [], profitPercentage);
          const finalProfit = isWin ? totalProfit : -totalProfit;
          const finalReturnAmount = isWin ? trade.invest_amount + totalProfit : trade.invest_amount - Math.abs(totalProfit);
          
          console.log(`Closing trade ${trade.id}: ${trade.coins?.length} coins, ${trade.trade_timer}h timer, ${profitPercentage}% rate`);
          console.log(`Bot setting: ${tradeSettings?.bot_profit_type}, Actual result: ${actualTradeResult}, Profit: $${finalProfit.toFixed(2)}, Return: $${finalReturnAmount.toFixed(2)}`);
          console.log(`UTC time used: ${currentUTC.toISOString()}, Elapsed: ${elapsedMs}ms, Required: ${timerMs}ms`);
          
          updatedTrades.push({
            ...trade,
            status: 'completed',
            close_time: currentUTC.toISOString(),
            profit_loss: finalProfit,
            profit_or_lose: actualTradeResult, // Store the actual trade outcome, not the bot setting
            profit: finalProfit,
            return_amount: finalReturnAmount
          });
        }
      }

      if (updatedTrades.length === 0) {
        notify.info('No trades are ready to close yet. Please wait for the timer to complete.');
        return [];
      }

      const { data, error } = await supabase
        .from('user_bot_trades')
        .upsert(updatedTrades)
        .select();

      if (error) {
        notify.error('Failed to close bot trades');
        throw error;
      }

      // Calculate total returns and update main balance (not bot balance)
      const totalReturns = updatedTrades.reduce((sum, trade) => sum + trade.return_amount, 0);
      const totalProfit = updatedTrades.reduce((sum, trade) => sum + trade.profit, 0);
      
      // Update user's main balance with the total return amount
      const { error: balanceError } = await supabase
        .from('users')
        .update({ 
          balance: userBalances!.balance + totalReturns,
          bot_balance: Math.max(0, userBalances!.bot_balance - updatedTrades.reduce((sum, trade) => sum + trade.invest_amount, 0)),
          updated_at: currentUTC.toISOString()
        })
        .eq('id', user.id);

      if (balanceError) {
        notify.error('Failed to update balance');
        throw balanceError;
      }

      console.log(`Trades closed using UTC time. Total return: $${totalReturns.toFixed(2)}, Total profit: $${totalProfit.toFixed(2)}`);

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['user-bot-trades'] });
      queryClient.invalidateQueries({ queryKey: ['user-balances'] });
      if (data && data.length > 0) {
        const totalReturn = data.reduce((sum, trade) => sum + (trade.return_amount || 0), 0);
        const totalProfit = data.reduce((sum, trade) => sum + (trade.profit || 0), 0);
        notify.success(`Successfully closed ${data.length} trades! Total return: $${totalReturn.toFixed(2)}, Profit: $${totalProfit.toFixed(2)}`);
      }
    },
    onError: (error: any) => {
      console.error('Error closing bot trades:', error);
    }
  });

  // Timer countdown effect using UTC time - show countdown for first active trade
  useEffect(() => {
    const activeTrades = userBotTrades.filter(trade => trade.status === 'active');
    if (activeTrades.length > 0) {
      const trade = activeTrades[0]; // Show timer for first active trade
      const interval = setInterval(() => {
        const currentUTC = new Date();
        const openTimeUTC = new Date(trade.open_time);
        const timerMs = trade.trade_timer * 60 * 60 * 1000;
        const elapsedMs = currentUTC.getTime() - openTimeUTC.getTime();
        const remaining = timerMs - elapsedMs;
        
        if (remaining <= 0) {
          setTimeRemaining('00:00:00:00');
        } else {
          const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
          const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
          
          setTimeRemaining(`${days.toString().padStart(2, '0')}:${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        }
      }, 1000);
      
      return () => clearInterval(interval);
    } else {
      setTimeRemaining('');
    }
  }, [userBotTrades]);

  const handleBackClick = () => {
    window.history.back();
  };

  const handleViewDetails = (tradeId: string) => {
    navigate(`/bot-trade/details/${tradeId}`);
  };

  const handleTokenSelect = (tokenSymbol: string) => {
    if (selectedCoins.includes(tokenSymbol)) {
      setSelectedCoins(selectedCoins.filter(coin => coin !== tokenSymbol));
    } else {
      setSelectedCoins([...selectedCoins, tokenSymbol]);
    }
  };

  const handleStartTrading = () => {
    if (!user) {
      notify.error('Please log in to start trading');
      return;
    }
    
    if (!userBalances || userBalances.balance <= 0) {
      notify.error('Insufficient main balance! Please deposit funds to your account first.');
      return;
    }

    setIsModalOpen(true);
  };

  const handleTradeSubmit = () => {
    if (!user) {
      notify.error('Please log in to start trading');
      return;
    }

    if (selectedCoins.length < 8) {
      notify.warning('Please select at least 8 tokens');
      return;
    }
    
    if (!investAmount || parseFloat(investAmount) <= 0) {
      notify.warning('Please enter a valid investment amount');
      return;
    }

    const amount = parseFloat(investAmount);
    
    if (tradeSettings) {
      if (amount < tradeSettings.bot_min_trade_amount) {
        notify.error(`Minimum investment amount is $${tradeSettings.bot_min_trade_amount}`);
        return;
      }
      if (amount > tradeSettings.bot_max_trade_amount) {
        notify.error(`Maximum investment amount is $${tradeSettings.bot_max_trade_amount}`);
        return;
      }
    }

    if (!userBalances || amount > userBalances.balance) {
      notify.error(`Insufficient main balance! Need $${amount.toFixed(2)}, have $${userBalances?.balance.toFixed(2) || '0.00'}`);
      return;
    }

    createTradeMutation.mutate({
      invest_amount: amount,
      selected_coins: selectedCoins,
      trade_timer: tradeTimer,
    });
  };

  const handleCloseAllTrades = () => {
    if (!user) {
      notify.error('Please log in to close trades');
      return;
    }

    const activeTrades = userBotTrades.filter(trade => trade.status === 'active');
    if (activeTrades.length === 0) {
      notify.info('No active trades to close');
      return;
    }
    
    // Check how many trades are ready to close using UTC time
    const currentUTC = new Date();
    const readyTrades = activeTrades.filter(trade => {
      const openTimeUTC = new Date(trade.open_time);
      const timerMs = trade.trade_timer * 60 * 60 * 1000;
      const elapsedMs = currentUTC.getTime() - openTimeUTC.getTime();
      return elapsedMs >= timerMs; // Only truly completed trades
    });

    if (readyTrades.length === 0) {
      notify.info('No trades are ready to close yet. Please wait for the timer to complete.');
      return;
    }
    
   
      closeAllTradesMutation.mutate();
  };

  const formatDateToPakistan = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      timeZone: 'Asia/Karachi',
      day: '2-digit',
      month: 'short',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Set default timer when trade settings are loaded
  useEffect(() => {
    if (tradeSettings && tradeSettings.time_profit_settings.length > 0) {
      setTradeTimer(tradeSettings.time_profit_settings[0].time_hours);
    }
  }, [tradeSettings]);

  // Show login required message if user is not authenticated
  if (!user) {
    return (
      <div className="relative min-h-[100vh] bg-black mx-auto max-w-[480px] flex items-center justify-center">
        <div className="text-white text-center p-8">
          <h2 className="text-xl font-bold mb-4">Please Log In</h2>
          <p className="text-gray-300 mb-6">You need to log in to access bot trading features.</p>
          <button 
            onClick={() => window.location.href = '/login'}
            className="bg-lime-500 hover:bg-lime-600 text-white px-6 py-3 rounded-lg"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Use UTC-based calculations for determining button states
  const hasActiveTrades = userBotTrades.some(trade => trade.status === 'active');
  const currentUTC = new Date();
  const actuallyCompletedTrades = userBotTrades.filter(trade => {
    if (trade.status !== 'active') return false;
    const openTimeUTC = new Date(trade.open_time);
    const timerMs = trade.trade_timer * 60 * 60 * 1000;
    const elapsedMs = currentUTC.getTime() - openTimeUTC.getTime();
    return elapsedMs >= timerMs;
  });
  const allTradesCompleted = actuallyCompletedTrades.length > 0 && actuallyCompletedTrades.length === userBotTrades.filter(trade => trade.status === 'active').length;

  return (
    <>
      
      <div className="relative min-h-[100vh] bg-black mx-auto max-w-[480px] overflow-y-hidden">
        <div className="min-h-[100vh] pt-[0px] pb-[0px]">
          <div className="relative z-[1]">
            {/* Header Section */}
            <div className="relative overflow-hidden mb-[10px]">
              <div className="p-[15px] relative z-[2] rounded-b-[30px]">
                <div className="flex gap-3 items-center justify-between">
                  <div className="flex gap-2 items-center bg-black/20 border border-gray-500/50 blackdrop-blur rounded-full px-[20px] h-[48px]">
                    <div>
                      <img 
                        className="w-[18px] backBtn cursor-pointer" 
                        src="https://cdn-icons-png.flaticon.com/128/507/507257.png" 
                        alt=""
                        onClick={handleBackClick}
                      />
                    </div>
                    <h1 className="text-white font-bold">Bot Trading</h1>
                  </div>
                  <div className="flex gap-2 items-center bg-black/20 border border-gray-500/50 blackdrop-blur rounded-full">
                    <img 
                      className="w-[48px] h-[48px] aspect-square border border-gray-500/50 rounded-full" 
                      src="https://img.freepik.com/premium-photo/3d-cartoon-avatar-man-minimal-3d-character_652053-2070.jpg" 
                      alt="" 
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Balance Section */}
            <div className="container mx-auto px-[18px] border-b border-gray-700 pb-3">
              <div className="flex items-center">
                <div className="text-start flex-auto">
                  <h1 className="text-[12px] text-gray-300">Main Balance (USDT)</h1>
                  <h1 className="text-[24px] font-bold text-gray-100">{userBalances?.balance.toFixed(2) || '0.00'}</h1>
                  <h1 className="text-[10px] text-gray-400 flex items-center">≈ {userBalances?.balance.toFixed(2) || '0.00'}$</h1>
                </div>
                <div className="text-end flex-auto">
                  <h1 className="text-[12px] text-gray-300">Bot Balance (USDT)</h1>
                  <h1 className="text-[24px] font-bold text-gray-100">{userBalances?.bot_balance.toFixed(2) || '0.00'}</h1>
                  <h1 className="text-[10px] text-gray-400 flex items-center justify-end">≈ {userBalances?.bot_balance.toFixed(2) || '0.00'}$</h1>
                </div>
              </div>
            </div>

<div className="w-[200px] h-[200px] mx-auto">
       
    <LottieAnimation />
  </div>


         
              
              {hasActiveTrades && !allTradesCompleted && timeRemaining && (
                <div className="_flex_lq8ol_19 _justify-center_lq8ol_106">
                  <span className="bg-gray-400 _text-white_lq8ol_196 _text-center_lq8ol_102 _text-[14px]_lq8ol_407 w-[130px] _px-2_lq8ol_10 _py-1_lq8ol_445 _mt-3_lq8ol_94 _rounded-full_lq8ol_119">{timeRemaining}</span>
                </div>
              )}

              <div className="flex gap-3 justify-center">
                {!hasActiveTrades ? (
                  // Show Start Trading button when no active trades
                  <button 
                    type="button" 
                    className="bg-gradient-to-r hover:bg-gradient-to-l bg-lime-500 hover:bg-lime-600 !text-gray-100 text-[14px] to-rose-600 text-white w-[130px] p-2 rounded-[10px] _px-2_lq8ol_10 _py-1_lq8ol_445 _mt-3_lq8ol_94 _rounded-full_lq8ol_119"
                    onClick={handleStartTrading}
                    disabled={createTradeMutation.isPending}
                  >
                    {createTradeMutation.isPending ? 'Creating...' : 'Start Trading'}
                  </button>
                ) : allTradesCompleted ? (
                  // Show Close Trade button when all trades are actually completed (not just close to completion)
                  <button 
                    type="button" 
                    className="bg-gradient-to-r hover:bg-gradient-to-l bg-lime-500 hover:bg-lime-600 !text-gray-100 text-[14px] to-rose-600 text-white w-[130px] p-2 rounded-[10px] _px-2_lq8ol_10 _py-1_lq8ol_445 _mt-3_lq8ol_94 _rounded-full_lq8ol_119"
                    onClick={handleCloseAllTrades}
                    disabled={closeAllTradesMutation.isPending}
                  >
                    {closeAllTradesMutation.isPending ? 'Closing...' : 'Close Trade'}
                  </button>
                ) : null}
                {/* No button shown when trades are still running (timer is displayed instead) */}
              </div>
            </div>

            {/* Bot Trade History */}
            <div className="_mx-auto_lq8ol_1 py-[10px] mt-4">
              <div className="bg-gray-700/20 backdrop-blur shadow-t _shadow-md_lq8ol_498 _shadow-gray-500_lq8ol_400">
                <div className="_px-4_lq8ol_425 _py-2_lq8ol_422 _border-b_lq8ol_596 border-solid border-gray-400/20">
                  <h1 className="_text-[14px]_lq8ol_407 _text-white_lq8ol_196 _font-semibold_lq8ol_73">Bot Trade History</h1>
                </div>
                <div className="_p-2_lq8ol_81 overflow-scroll h-[calc(100vh-480px)]">
                  {userBotTrades.length === 0 ? (
                    <div className="text-center text-gray-400 py-8">
                      <p>No bot trades yet</p>
                      <p className="text-sm">Start your first bot trade above!</p>
                    </div>
                  ) : (
                    userBotTrades.map((trade) => (
                      <div key={trade.id} className="flex gap-3 items-center border-b border-solid border-gray-400/10 py-2">
                        <img 
                          className="_w-[20px]_lq8ol_123 _h-[20px]_lq8ol_127 rotate-[270deg]" 
                          src="data:image/svg+xml,%3csvg%20height='200px'%20width='200px'%20version='1.1'%20id='Layer_1'%20xmlns='http://www.w3.org/2000/svg'%20xmlns:xlink='http://www.w3.org/1999/xlink'%20viewBox='0%200%20512.006%20512.006'%20xml:space='preserve'%20fill='%23000000'%3e%3cg%20id='SVGRepo_bgCarrier'%20stroke-width='0'%3e%3c/g%3e%3cg%20id='SVGRepo_tracerCarrier'%20stroke-linecap='round'%20stroke-linejoin='round'%3e%3c/g%3e%3cg%20id='SVGRepo_iconCarrier'%3e%3cpath%20style='fill:%23ea343d;'%20d='M23.151,149.616l115.072,115.072c7.901,7.901,20.713,7.901,28.614,0s7.901-20.713,0-28.614%20l-44.568-44.568h316.313v-0.001c31.036,0,56.198-25.16,56.198-56.198c0-31.036-25.16-56.198-56.198-56.198H122.269l44.568-44.568%20c3.951-3.951,5.927-9.129,5.927-14.308s-1.976-10.357-5.927-14.308c-7.901-7.901-20.713-7.901-28.614,0L23.151,121.002%20C15.25,128.903,15.25,141.715,23.151,149.616z'%3e%3c/path%3e%3cpath%20style='fill:%23fd6373;'%20d='M23.151,149.616l115.072,115.072c7.901,7.901,20.713,7.901,28.614,0s7.901-20.713,0-28.614%20l-44.568-44.568h139.247V79.111H122.269l44.568-44.568c3.951-3.951,5.927-9.129,5.927-14.308s-1.976-10.357-5.927-14.308%20c-7.901-7.901-20.713-7.901-28.614,0L23.151,121.002C15.25,128.903,15.25,141.715,23.151,149.616z'%3e%3c/path%3e%3cpath%20style='fill:%2343df7a;'%20d='M488.855,362.39L373.783,247.318c-7.901-7.901-20.713-7.901-28.614,0%20c-7.901,7.901-7.901,20.713,0,28.614l44.567,44.568H73.423v0.001c-31.036,0-56.198,25.16-56.198,56.198%20c0,31.036,25.16,56.198,56.198,56.198h316.314l-44.568,44.568c-3.951,3.951-5.927,9.129-5.927,14.308%20c0,5.179,1.976,10.357,5.927,14.308c7.901,7.901,20.713,7.901,28.614,0l115.072-115.072%20C496.757,383.103,496.757,370.291,488.855,362.39z'%3e%3c/path%3e%3cpath%20style='fill:%2300c254;'%20d='M488.855,362.39L373.783,247.318c-7.901-7.901-20.713-7.901-28.614,0%20c-7.901,7.901-7.901,20.713,0,28.614l44.567,44.568H261.518v112.395h128.218l-44.568,44.568c-3.951,3.951-5.927,9.129-5.927,14.308%20c0,5.179,1.976,10.357,5.927,14.308c7.901,7.901,20.713,7.901,28.614,0l115.072-115.072%20C496.757,383.103,496.757,370.291,488.855,362.39z'%3e%3c/path%3e%3c/g%3e%3c/svg%3e" 
                          alt="" 
                        />
                        <div className="_flex-auto_lq8ol_192">
                          <h1 className="text-gray-300 _text-[12px]_lq8ol_77">
                            Trade Amount: <span className="_font-semibold_lq8ol_73">${trade.invest_amount.toFixed(2)}</span>
                          </h1>
                          <h1 className="text-gray-300 _text-[12px]_lq8ol_77">
                            {trade.status === 'active' ? (
                              <>Process: <span className="_font-semibold_lq8ol_73 text-yellow-400">
                                {tradeProgress[trade.id] !== undefined ? `${tradeProgress[trade.id]}%` : 'Starting...'}
                              </span></>
                            ) : (
                              <>Return Amount: <span className="_font-semibold_lq8ol_73">${trade.return_amount?.toFixed(2) || '0.00'}</span></>
                            )}
                          </h1>
                          <h1 className="text-gray-300 _text-[12px]_lq8ol_77">
                            Date: <span className="_font-semibold_lq8ol_73">{formatDateToPakistan(trade.created_at)}</span>
                          </h1>
                        </div>
                        <div className="_text-end_lq8ol_531">
                          {trade.status === 'active' ? (
                            <div className="_border_lq8ol_234 border-yellow-500/50 _text-center_lq8ol_102 _rounded-full_lq8ol_119 _px-4_lq8ol_425 _text-[11px]_lq8ol_529 text-yellow-500">
                              Processing
                            </div>
                          ) : (
                            <>
                              <div className={`_border_lq8ol_234 ${
                                trade.profit_or_lose === 'profit' ? 'border-green-500/50 text-green-500' : 'border-red-500/50 text-red-500'
                              } _text-center_lq8ol_102 _rounded-full_lq8ol_119 _px-4_lq8ol_425 _text-[11px]_lq8ol_529`}>
                                {trade.profit_or_lose === 'profit' ? 'Profit' : 'Loss'}: ${(trade.profit || trade.profit_loss || 0).toFixed(2)}
                              </div>
                              <button 
                                className="bg-gray-400/50 _text-center_lq8ol_102 _rounded-full_lq8ol_119 _px-5_lq8ol_358 _py-[3px]_lq8ol_139 !w-[100%] _text-[11px]_lq8ol_529 _text-white_lq8ol_196 mt-1 cursor-pointer hover:bg-gray-400/70 transition-colors"
                                onClick={() => handleViewDetails(trade.id)}
                              >
                                See Details
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Trading Modal */}
            {isModalOpen && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] p-4">
                <div className="bg-gray-500/50 backdrop-blur relative _px-4_lq8ol_425 rounded-lg max-w-md w-full">
                  <button 
                    className="absolute right-[10px] top-[10px] _text-[18px]_lq8ol_310 hover:text-[20px] _text-gray-400_lq8ol_587 hover:text-gray-200"
                    onClick={() => setIsModalOpen(false)}
                  >
                    <i className="fi fi-sr-cross-circle"></i>
                  </button>
                  
                  <h3 className="_font-bold_lq8ol_110 _text-center_lq8ol_102 _text-white_lq8ol_196 _text-[14px]_lq8ol_407 -mt-3 py-6">Open Trade</h3>
                  
                  <div className="mt-5">
                    <div>
                      <label className="block mb-1 ms-1 text-[13px] font-medium _text-white_lq8ol_196">Select Trade Timer</label>
                      <select 
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-rose-500 focus:border-rose-500 block w-full p-2.5 mb-3 border-gray-50 !bg-gray-200/50 placeholder:!text-gray-100/50 !text-gray-50 focus:border-yellow-400"
                        value={tradeTimer}
                        onChange={(e) => setTradeTimer(parseInt(e.target.value))}
                      >
                        {tradeSettings && tradeSettings.time_profit_settings && tradeSettings.time_profit_settings.length > 0 ? (
                          tradeSettings.time_profit_settings.map((setting) => (
                            <option key={setting.time_hours} value={setting.time_hours} className="!text-gray-900 !bg-white">
                              {setting.time_hours} Hour{setting.time_hours > 1 ? 's' : ''} ({setting.profit_percentage}% profit)
                            </option>
                          ))
                        ) : (
                          <option value={1} className="!text-gray-900 !bg-white">1 Hour (Default)</option>
                        )}
                      </select>
                    </div>

                    <div>
                      <label className="block mb-1 ms-1 text-[13px] font-medium _text-white_lq8ol_196">Select at least 8 tokens</label>
                      <div className="grid grid-cols-3 gap-2 mb-4 max-h-32 overflow-y-auto">
                        {botTokens.map((token) => (
                          <div
                            key={token.id}
                            className={`p-2 rounded-lg cursor-pointer border ${
                              selectedCoins.includes(token.symbol)
                                ? 'bg-lime-500/20 border-lime-500'
                                : 'bg-gray-700/20 border-gray-600'
                            }`}
                            onClick={() => handleTokenSelect(token.symbol)}
                          >
                            <div className="_text-center_lq8ol_102">
                              <img 
                                src={token.image_url} 
                                alt={token.symbol}
                                className="w-6 h-6 mx-auto mb-1"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                              <p className="text-xs _text-white_lq8ol_196">{token.symbol}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="relative">
                      <label className="block mb-2 text-sm font-medium text-gray-200">
                        Investment Amount (${tradeSettings?.bot_min_trade_amount} - ${tradeSettings?.bot_max_trade_amount})
                      </label>
                      <div className="relative mb-3">
                        <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
                          <i className="fi fi-rr-coins w-4 h-5 text-gray-200"></i>
                        </div>
                        <input 
                          className="border-gray-50 !bg-gray-200/50 placeholder:!text-gray-100/50 !text-gray-50 focus:border-yellow-400 bg-transparent border hover:border-lime-500 focus:border-lime-500 focus:outline-0 text-gray-200 focus:text-gray-200 text-sm rounded-md focus:ring-rose-500 block w-full ps-10 p-2.5"
                          type="number" 
                          placeholder={`Min: $${tradeSettings?.bot_min_trade_amount || 10}`}
                          min={tradeSettings?.bot_min_trade_amount || 10}
                          max={tradeSettings?.bot_max_trade_amount || 200}
                          value={investAmount}
                          onChange={(e) => setInvestAmount(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="bg-white/20 _p-2_lq8ol_81 rounded-[5px] mt-12">
                      <h1 className="text-white/80 _text-[12px]_lq8ol_77">
                        Select multiple coins carefully and then enter investment amount correctly on input box.
                        Selected: {selectedCoins.length}/8 tokens minimum
                        {selectedCoins.length > 0 && investAmount && (
                          <div className="text-xs text-blue-400 mt-1">
                            💰 Amount per coin: ${(parseFloat(investAmount) / selectedCoins.length).toFixed(2)}
                          </div>
                        )}
                      </h1>
                    </div>

                    <div className="_flex_lq8ol_19 _justify-center_lq8ol_106 mt-5">
                      <button 
                        type="button" 
                        className="bg-gradient-to-r hover:bg-gradient-to-l bg-gray-50 hover:bg-gray-200 !text-gray-700 text-[14px] to-rose-600 text-white w-[100%] p-2 rounded-[10px] relative z-[99999] _w-[100%]_lq8ol_371 _px-2_lq8ol_10 _mt-3_lq8ol_94 rounded-[4px]"
                        onClick={handleTradeSubmit}
                        disabled={createTradeMutation.isPending}
                      >
                        {createTradeMutation.isPending ? 'Creating Trade...' : 'Trade Open'}
                      </button>
                    </div>
                  </div>
                  
                  <div className="py-4"></div>
                </div>
              </div>
            )}
          </div>
        </div>
   
    </>
  );
};

export default BotTrade;
