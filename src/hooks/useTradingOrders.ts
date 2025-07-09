
import { useState, useEffect, useRef } from 'react';
import { Order, LiveOrder } from '../types/trading';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../integrations/supabase/client';
import { useTradeTransactions } from './useTradeTransactions';
import { useUserBalance } from './useUserBalance';
import { useCoinSettings } from './useCoinSettings';

export const useTradingOrders = (coinSymbol: string) => {
  const [orders, setOrders] = useState<LiveOrder[]>([]);
  const { user } = useAuth();
  const { createTradeTransaction } = useTradeTransactions();
  const { refreshBalance } = useUserBalance();
  const { coinSettings } = useCoinSettings(coinSymbol);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const realtimeChannel = useRef<any>(null);
  const processedTradeIds = useRef<Set<string>>(new Set());

  // Set up real-time listening for new trades
  useEffect(() => {
    if (!user) return;

    console.log('Setting up real-time listener for new trades...');
    
    // Create real-time channel for trade_transactions
    realtimeChannel.current = supabase
      .channel('user-trades')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'trade_transactions',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Real-time new trade received:', payload.new);
          
          const newTrade = payload.new;
          
          // Only add if it's a running trade and not already in our list
          if (newTrade.status === 'running') {
            const openTime = new Date(newTrade.created_at);
            const returnTime = newTrade.return_time ? new Date(newTrade.return_time) : new Date(openTime.getTime() + (60 * 1000));
            const now = new Date();
            
            const remainingMs = returnTime.getTime() - now.getTime();
            const remainingSeconds = Math.max(0, Math.floor(remainingMs / 1000));
            
            const newOrder: LiveOrder = {
              id: newTrade.id,
              symbol: newTrade.symbol,
              type: newTrade.trade_type as 'BUY' | 'SELL',
              amount: newTrade.amount,
              openPrice: newTrade.buy_price || newTrade.price,
              timer: 1,
              status: remainingSeconds > 0 ? 'RUNNING' as const : 'COMPLETED' as const,
              openTime: openTime,
              timeRemaining: remainingSeconds,
              returnTime: returnTime
            };
            
            setOrders(prev => {
              const exists = prev.find(order => order.id === newOrder.id);
              if (exists) {
                console.log('Trade already exists in local state, not adding duplicate');
                return prev;
              }
              console.log('Adding new trade from real-time update:', newOrder);
              return [...prev, newOrder];
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'trade_transactions',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Real-time trade update received:', payload.new);
          
          const updatedTrade = payload.new;
          
          // If trade completed, remove from local orders list after a short delay
          if (updatedTrade.status === 'complete') {
            console.log(`Trade ${updatedTrade.id} completed, will remove from orders list`);
            setTimeout(() => {
              setOrders(prev => prev.filter(order => order.id !== updatedTrade.id));
              // Remove from processed set to allow future processing if needed
              processedTradeIds.current.delete(updatedTrade.id);
            }, 3000); // 3 second delay to allow popup to show
          }
        }
      )
      .subscribe((status) => {
        console.log('Real-time trades subscription status:', status);
      });

    return () => {
      if (realtimeChannel.current) {
        console.log('Cleaning up real-time trades subscription');
        supabase.removeChannel(realtimeChannel.current);
      }
    };
  }, [user]);

  // Load existing running trades from database when component mounts
  useEffect(() => {
    const loadExistingTrades = async () => {
      if (!user) return;
      
      try {
        console.log('Loading existing running trades from database...');
        const { data: trades, error } = await supabase
          .from('trade_transactions')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'running')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error loading existing trades:', error);
          return;
        }
        
        const now = new Date();
        const liveOrders: LiveOrder[] = trades.map((trade: any) => {
          const openTime = new Date(trade.created_at);
          const returnTime = trade.return_time ? new Date(trade.return_time) : new Date(openTime.getTime() + (60 * 1000));
          
          const remainingMs = returnTime.getTime() - now.getTime();
          const remainingSeconds = Math.max(0, Math.floor(remainingMs / 1000));
          
          console.log(`Trade ${trade.id}: Open at ${openTime.toISOString()}, Return at ${returnTime.toISOString()}, Remaining: ${remainingSeconds}s`);
          
          return {
            id: trade.id,
            symbol: trade.symbol,
            type: trade.trade_type as 'BUY' | 'SELL',
            amount: trade.amount,
            openPrice: trade.buy_price || trade.price,
            timer: 1,
            status: remainingSeconds > 0 ? 'RUNNING' as const : 'COMPLETED' as const,
            openTime: openTime,
            timeRemaining: remainingSeconds,
            returnTime: returnTime
          };
        });
        
        console.log('Loaded existing running trades:', liveOrders);
        setOrders(liveOrders);
      } catch (error) {
        console.error('Error loading existing trades:', error);
      }
    };

    loadExistingTrades();
  }, [user]);

  // Function to fetch fresh price from Binance API
  const fetchFreshPrice = async (symbol: string): Promise<number> => {
    try {
      const response = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}USDT`);
      if (!response.ok) {
        throw new Error('Failed to fetch price');
      }
      const data = await response.json();
      console.log(`Fresh price for ${symbol}: ${data.price}`);
      return parseFloat(data.price);
    } catch (error) {
      console.error('Error fetching fresh price:', error);
      throw error;
    }
  };

  const placeOrder = async (orderData: {
    type: 'BUY' | 'SELL';
    amount: number;
    timer: number;
    openPrice: number;
  }) => {
    const now = new Date();
    const timerInMinutes = orderData.timer;
    const returnTime = new Date(now.getTime() + (timerInMinutes * 60 * 1000));
    
    console.log(`Creating trade with open price: ${orderData.openPrice} for ${coinSymbol}`);
    console.log(`Trade will complete at: ${returnTime.toISOString()}`);
    console.log(`Using coin settings:`, coinSettings);

    // Create trade transaction in database first
    try {
      const createdTrade = await createTradeTransaction({
        symbol: coinSymbol,
        trade_type: orderData.type,
        action: 'OPEN',
        amount: orderData.amount,
        price: orderData.openPrice,
        buy_price: orderData.openPrice,
        trade_close_price: 0,
        status: 'running',
        trade_status: 'PENDING',
        win_loss: 'pending',
        return_time: returnTime.toISOString()
      });
      
      console.log('Trade transaction created successfully with running status');
      
      // Real-time will handle adding the order to local state
      
    } catch (error) {
      console.error('Failed to create trade transaction:', error);
      throw error;
    }
  };

  const updateUserBalance = async (amount: number) => {
    if (!user) return;

    try {
      const { error } = await supabase.rpc('add_user_balance', {
        user_id: user.id,
        amount: amount
      });

      if (error) {
        console.error('Error updating balance:', error);
      } else {
        refreshBalance();
        console.log('Balance updated:', amount);
      }
    } catch (error) {
      console.error('Error updating balance:', error);
    }
  };

  // Process expired trade using real market data
  const processExpiredTrade = async (order: LiveOrder) => {
    if (!user || !coinSettings) return;

    // Ensure we have valid profit/loss percentage from database
    if (coinSettings.profit_loss === null || coinSettings.profit_loss === undefined) {
      console.error(`No profit_loss percentage set for ${order.symbol}, cannot process trade ${order.id}`);
      return;
    }

    // Prevent duplicate processing
    if (processedTradeIds.current.has(order.id)) {
      console.log(`Trade ${order.id} already processed, skipping`);
      return;
    }

    // Add to processed set immediately
    processedTradeIds.current.add(order.id);

    try {
      console.log(`Processing expired trade ${order.id} using real market data`);
      
      // Double check if trade is actually expired with a small buffer
      const now = new Date();
      const timeBuffer = 2000; // 2 second buffer
      if (order.returnTime && (now.getTime() < (order.returnTime.getTime() - timeBuffer))) {
        console.log(`Trade ${order.id} not yet expired, removing from processed set`);
        processedTradeIds.current.delete(order.id);
        return;
      }
      
      const freshClosePrice = await fetchFreshPrice(order.symbol);
      const closeTime = new Date();
      
      // Use real market data to determine win/loss
      const openPrice = order.openPrice;
      const closePrice = freshClosePrice;
      
      let isWin = false;
      let result: 'WIN' | 'LOSE';
      
      // Determine win/loss based on trade type and actual price movement
      if (order.type === 'BUY') {
        // BUY trade wins if price goes up
        isWin = closePrice > openPrice;
      } else {
        // SELL trade wins if price goes down
        isWin = closePrice < openPrice;
      }
      
      result = isWin ? 'WIN' : 'LOSE';
      let profit = 0;
      let winLoss: 'win' | 'lose' = isWin ? 'win' : 'lose';
      let tradeStatus: 'PROFIT' | 'LOSS' = isWin ? 'PROFIT' : 'LOSS';

      const profitPercentage = coinSettings.profit_loss; // Use exact value from database

      console.log(`Trade ${order.id} real market analysis:`, {
        symbol: order.symbol,
        trade_type: order.type,
        openPrice: openPrice,
        closePrice: closePrice,
        priceChange: closePrice - openPrice,
        priceChangePercent: ((closePrice - openPrice) / openPrice * 100).toFixed(2) + '%',
        isWin: isWin,
        profitPercentage: profitPercentage
      });

      // Calculate profit/loss based on percentage from database
      if (isWin) {
        // Win: User gets back original amount + profit percentage
        profit = (order.amount * profitPercentage) / 100;
        console.log(`Trade ${order.id} WON based on real market movement. Profit: ${profit} (${profitPercentage}%)`);
      } else {
        // Loss: User loses the profit percentage amount
        profit = -((order.amount * profitPercentage) / 100);
        console.log(`Trade ${order.id} LOST based on real market movement. Loss: ${Math.abs(profit)} (${profitPercentage}%)`);
      }

      console.log(`Trade ${order.id} result: ${result}, Open: ${openPrice}, Close: ${closePrice}, Profit/Loss: ${profit}`);

      // Update trade in database to complete - this will trigger real-time update
      const { error: updateError } = await supabase
        .from('trade_transactions')
        .update({
          status: 'complete',
          trade_close_price: freshClosePrice,
          close_price: freshClosePrice,
          win_loss: winLoss,
          trade_status: tradeStatus,
          profit_loss: profit,
          closing_time: closeTime.toISOString()
        })
        .eq('id', order.id);

      if (updateError) {
        console.error('Failed to update expired trade in database:', updateError);
        // Remove from processed set on error to allow retry
        processedTradeIds.current.delete(order.id);
      } else {
        console.log(`Trade ${order.id} successfully updated in database`);
        
        // Update user balance based on result
        if (result === 'WIN') {
          await updateUserBalance(order.amount + profit);
          console.log(`User won! Added ${order.amount + profit} to balance`);
        } else {
          // Return original amount minus loss percentage
          const returnAmount = order.amount + profit; // profit is negative for losses
          await updateUserBalance(returnAmount);
          console.log(`User lost ${Math.abs(profit)} (${profitPercentage}%) but got ${returnAmount} back`);
        }
      }
    } catch (error) {
      console.error(`Failed to process expired trade ${order.id}:`, error);
      // Remove from processed set on error to allow retry
      processedTradeIds.current.delete(order.id);
    }
  };

  // Real-time timer system that processes trades immediately when they expire
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(async () => {
      const now = new Date();
      
      // Update local state and process expired trades immediately
      setOrders(prevOrders => {
        const updatedOrders = prevOrders.map(order => {
          if (order.status === 'RUNNING' && order.returnTime) {
            const remainingMs = order.returnTime.getTime() - now.getTime();
            const remainingSeconds = Math.max(0, Math.floor(remainingMs / 1000));
            
            // If trade just expired (timer hit zero) and not already processed
            if (remainingSeconds <= 0 && order.timeRemaining > 0 && !processedTradeIds.current.has(order.id)) {
              console.log(`Trade ${order.id} expired! Processing immediately...`);
              processExpiredTrade(order);
              return {
                ...order,
                timeRemaining: 0
              };
            }

            return {
              ...order,
              timeRemaining: remainingSeconds
            };
          }
          return order;
        });

        return updatedOrders;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [user, coinSymbol, coinSettings]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (realtimeChannel.current) {
        supabase.removeChannel(realtimeChannel.current);
      }
      // Clear processed trades set
      processedTradeIds.current.clear();
    };
  }, []);

  const getRunningOrders = () => orders.filter(order => order.status === 'RUNNING');
  const getCompletedOrders = () => orders.filter(order => order.status === 'COMPLETED');

  return {
    orders,
    placeOrder,
    getRunningOrders,
    getCompletedOrders
  };
};
