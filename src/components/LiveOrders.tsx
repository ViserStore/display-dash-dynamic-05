import { useEffect, useState, useRef } from 'react';
import { LiveOrder } from '../types/trading';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../integrations/supabase/client';
import TradeResultPopup from './TradeResultPopup';
import { Timer, CheckCircle, TrendingUp, TrendingDown } from 'lucide-react';

interface LiveOrdersProps {
  orders: LiveOrder[];
}

interface TradeResult {
  id: string;
  symbol: string;
  trade_type: 'BUY' | 'SELL';
  amount: number;
  openPrice: number;
  closePrice: number;
  result: 'WIN' | 'LOSE';
  profit: number;
  profitLoss: number;
  win_loss: 'win' | 'lose';
  trade_status: 'PROFIT' | 'LOSS';
  timestamp: Date;
}

const LiveOrders = ({ orders }: LiveOrdersProps) => {
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState<number>(Date.now());
  const [showResultPopup, setShowResultPopup] = useState(false);
  const [currentTradeResult, setCurrentTradeResult] = useState<TradeResult | null>(null);
  const [processedTrades, setProcessedTrades] = useState<Set<string>>(new Set());
  const [pendingPopups, setPendingPopups] = useState<TradeResult[]>([]);
  const [liveRunningOrders, setLiveRunningOrders] = useState<LiveOrder[]>([]);
  const [recentResults, setRecentResults] = useState<TradeResult[]>([]);
  const realtimeChannel = useRef<any>(null);

  // Update current time every second for accurate timing
  useEffect(() => {
    const timeInterval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(timeInterval);
  }, []);

  // Fetch recent 5 completed trades from database
  const fetchRecentResults = async () => {
    if (!user) return;

    try {
      console.log('Fetching recent 5 completed trades...');
      const { data: completedTrades, error } = await supabase
        .from('trade_transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'complete')
        .not('win_loss', 'is', null)
        .order('updated_at', { ascending: false })
        .limit(5); // Only get last 5 trades

      if (error) {
        console.error('Error fetching recent completed trades:', error);
        return;
      }

      if (completedTrades && completedTrades.length > 0) {
        console.log(`Found ${completedTrades.length} recent completed trades`);
        
        const recentTradeResults: TradeResult[] = completedTrades.map((trade: any) => ({
          id: trade.id,
          symbol: trade.symbol,
          trade_type: trade.trade_type as 'BUY' | 'SELL',
          amount: trade.amount,
          openPrice: trade.buy_price || trade.price,
          closePrice: trade.trade_close_price || trade.close_price || 0,
          result: trade.win_loss === 'win' ? 'WIN' : 'LOSE',
          profit: trade.profit_loss || 0,
          profitLoss: trade.profit_loss || 0,
          win_loss: trade.win_loss as 'win' | 'lose',
          trade_status: trade.trade_status || (trade.win_loss === 'win' ? 'PROFIT' : 'LOSS'),
          timestamp: new Date(trade.updated_at || trade.created_at)
        }));
        
        setRecentResults(recentTradeResults);
      } else {
        console.log('No recent completed trades found');
        setRecentResults([]);
      }
    } catch (error) {
      console.error('Error fetching recent completed trades:', error);
    }
  };

  // Fetch running orders from database
  const fetchRunningOrders = async () => {
    if (!user) return;

    try {
      console.log('Fetching running orders from database...');
      const { data: runningTrades, error } = await supabase
        .from('trade_transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'running')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching running orders:', error);
        return;
      }

      if (runningTrades && runningTrades.length > 0) {
        console.log(`Found ${runningTrades.length} running orders`);
        
        const liveOrders: LiveOrder[] = runningTrades.map((trade: any) => {
          const openTime = new Date(trade.created_at);
          const returnTime = trade.return_time ? new Date(trade.return_time) : new Date(openTime.getTime() + (60 * 1000));
          const now = new Date();
          
          const remainingMs = returnTime.getTime() - now.getTime();
          const remainingSeconds = Math.max(0, Math.floor(remainingMs / 1000));
          
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
        
        setLiveRunningOrders(liveOrders);
      } else {
        console.log('No running orders found');
        setLiveRunningOrders([]);
      }
    } catch (error) {
      console.error('Error fetching running orders:', error);
    }
  };

  // Handle pending popups queue - show next popup when current one closes
  useEffect(() => {
    if (pendingPopups.length > 0 && !showResultPopup) {
      const nextPopup = pendingPopups[0];
      console.log(`Showing queued popup for trade ${nextPopup.id}`);
      setCurrentTradeResult(nextPopup);
      setShowResultPopup(true);
      setPendingPopups(prev => prev.slice(1));
    }
  }, [pendingPopups, showResultPopup]);

  // Set up real-time listening for trade updates with better error handling
  useEffect(() => {
    if (!user) return;

    console.log('Setting up real-time listener for completed trades...');
    
    // Clean up any existing channel
    if (realtimeChannel.current) {
      supabase.removeChannel(realtimeChannel.current);
      realtimeChannel.current = null;
    }

    // Create real-time channel for trade_transactions with unique channel name
    const channelName = `trade-results-${user.id}-${Date.now()}`;
    realtimeChannel.current = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'trade_transactions',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Real-time trade update received:', payload);
          
          const updatedTrade = payload.new;
          const oldTrade = payload.old;
          
          // Check if this is a trade completion (status changed to complete)
          const isNewCompletion = (
            updatedTrade.status === 'complete' && 
            oldTrade?.status !== 'complete' &&
            updatedTrade.win_loss && 
            updatedTrade.win_loss !== 'pending'
          );
          
          if (isNewCompletion && !processedTrades.has(updatedTrade.id)) {
            console.log(`Trade ${updatedTrade.id} completed! Result: ${updatedTrade.win_loss}`);
            
            // Mark this trade as processed to prevent duplicate popups
            setProcessedTrades(prev => new Set([...prev, updatedTrade.id]));
            
            // Create trade result object
            const tradeResult: TradeResult = {
              id: updatedTrade.id,
              symbol: updatedTrade.symbol,
              trade_type: updatedTrade.trade_type,
              amount: updatedTrade.amount,
              openPrice: updatedTrade.buy_price || updatedTrade.price,
              closePrice: updatedTrade.trade_close_price || updatedTrade.close_price || 0,
              result: updatedTrade.win_loss === 'win' ? 'WIN' : 'LOSE',
              profit: updatedTrade.profit_loss || 0,
              profitLoss: updatedTrade.profit_loss || 0,
              win_loss: updatedTrade.win_loss as 'win' | 'lose',
              trade_status: updatedTrade.trade_status || (updatedTrade.win_loss === 'win' ? 'PROFIT' : 'LOSS'),
              timestamp: new Date()
            };

            console.log('Creating trade result:', tradeResult);

            // Add to recent results list (keep only last 5)
            setRecentResults(prev => [tradeResult, ...prev].slice(0, 5));

            // Show popup immediately if none is currently showing
            if (!showResultPopup) {
              console.log(`Showing popup immediately for trade ${tradeResult.id}`);
              setCurrentTradeResult(tradeResult);
              setShowResultPopup(true);
            } else {
              // Add to queue if popup is already showing
              setPendingPopups(prev => {
                const alreadyQueued = prev.some(p => p.id === tradeResult.id);
                if (alreadyQueued) {
                  console.log(`Trade ${tradeResult.id} already in queue, skipping`);
                  return prev;
                }
                
                console.log(`Adding trade ${tradeResult.id} to popup queue`);
                return [...prev, tradeResult];
              });
            }
          }

          // Refresh orders when there's any update
          fetchRunningOrders();
        }
      )
      .subscribe((status) => {
        console.log('Real-time trade results subscription status:', status);
        if (status === 'CHANNEL_ERROR') {
          console.error('Channel error, will retry...');
          // Don't immediately retry to avoid infinite loops
        }
      });

    return () => {
      if (realtimeChannel.current) {
        console.log('Cleaning up real-time trade results subscription');
        supabase.removeChannel(realtimeChannel.current);
        realtimeChannel.current = null;
      }
    };
  }, [user, showResultPopup]); // Removed orders and liveRunningOrders from dependencies to prevent infinite loops

  // Set up automatic refresh of running orders every 3 seconds
  useEffect(() => {
    if (!user) return;

    fetchRunningOrders();
    fetchRecentResults(); // Fetch recent results on component mount

    const refreshInterval = setInterval(() => {
      fetchRunningOrders();
      // Don't refresh recent results too often, only when component mounts
    }, 3000);

    return () => {
      clearInterval(refreshInterval);
    };
  }, [user]);

  // Use live running orders fetched from database instead of props
  const visibleOrders = liveRunningOrders.filter(order => order.status === 'RUNNING');

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleClosePopup = () => {
    console.log('Closing trade result popup');
    setShowResultPopup(false);
    setCurrentTradeResult(null);
    // The useEffect will automatically show the next popup in queue if any
  };

  return (
    <>
      <div className="absolute top-[50px] left-[10px] bg-black/50 backdrop-blur rounded-[10px] px-[0px]">
        <div className="flex items-center justify-between px-2">
          <h1 className="text-[12px] font-semibold text-center text-lime-400">Live Orders</h1>
        </div>
        
        {/* Show running orders */}
        {visibleOrders.map(order => {
          let displayTimeRemaining = order.timeRemaining;
          if (order.returnTime) {
            displayTimeRemaining = Math.max(0, Math.floor((order.returnTime.getTime() - currentTime) / 1000));
          }
          
          const isTimerEnded = displayTimeRemaining <= 0;
          
          return (
            <div key={order.id} className="bg-gray-900/95 border-2 border-gray-700/50 rounded-[10px] px-2.5 my-1">
              <div className="flex flex-col gap-1 text-[10px] text-white">
                <div className="flex items-center justify-between">
                  <span>
                    <i className={`fi ${order.type === 'BUY' ? 'fi-sr-up text-emerald-500' : 'fi-sr-down text-rose-500'} leading-[0px]`}></i>
                    {order.symbol} (${order.openPrice.toFixed(4)})
                  </span>
                  <span className="flex items-center gap-1">
                    {isTimerEnded ? (
                      <CheckCircle className="w-3 h-3 text-green-500" />
                    ) : (
                      <>
                        <Timer className="w-3 h-3 text-yellow-400" />
                        <span className="text-yellow-400 font-mono text-[9px]">
                          {formatTime(displayTimeRemaining)}
                        </span>
                      </>
                    )}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {visibleOrders.length === 0 && (
          <div className="bg-gray-900/95 border-2 border-gray-700/50 rounded-[10px] px-2.5 my-1">
            <div className="text-center py-2 text-gray-400 text-[10px]">
              No active trades
            </div>
          </div>
        )}

        {/* Recent Results Section - Show last 5 completed trades */}
        {recentResults.length > 0 && (
          <div className="mt-2">
            <div className="text-[10px] text-gray-300 px-2 mb-1">Recent Results (Last 5):</div>
            {recentResults.map(result => (
              <div key={result.id} className="bg-gray-800/90 border border-gray-600/50 rounded-[8px] px-2 py-1 mx-1 mb-1">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    {result.trade_type === 'BUY' ? (
                      <TrendingUp className="w-2 h-2 text-emerald-500" />
                    ) : (
                      <TrendingDown className="w-2 h-2 text-rose-500" />
                    )}
                    <span className="text-[9px] text-white">{result.symbol}</span>
                    <span className="text-[8px] text-gray-400">${result.amount}</span>
                  </span>
                  <span className={`text-[9px] font-bold ${result.win_loss === 'win' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {result.win_loss === 'win' ? '+' : ''}${result.profitLoss.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {pendingPopups.length > 0 && (
          <div className="text-center py-1 text-yellow-400 text-[8px]">
            {pendingPopups.length} results pending
          </div>
        )}
      </div>

      <TradeResultPopup
        isOpen={showResultPopup}
        onClose={handleClosePopup}
        tradeResult={currentTradeResult}
      />
    </>
  );
};

export default LiveOrders;
