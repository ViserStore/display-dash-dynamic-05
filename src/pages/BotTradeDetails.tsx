import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { notify } from '@/utils/notifications';

interface TradeDetails {
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
  user_timezone: string | null;
  user_latitude: number | null;
  user_longitude: number | null;
  profit_or_lose: string;
  profit_percent: number;
  profit: number;
  invest_amount: number;
  return_amount: number;
  return_time: string | null;
}

interface BotToken {
  id: string;
  symbol: string;
  name: string;
  image_url: string | null;
  status: string;
}

const BotTradeDetails = () => {
  const { tradeId } = useParams<{ tradeId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Fetch trade details
  const { data: tradeDetails, isLoading, refetch } = useQuery({
    queryKey: ['bot-trade-details', tradeId],
    queryFn: async () => {
      if (!user || !tradeId) {
        throw new Error('User not authenticated or trade ID missing');
      }

      const { data, error } = await supabase
        .from('user_bot_trades')
        .select('*')
        .eq('id', tradeId)
        .eq('user_id', user.id)
        .single();

      if (error) {
        notify.error('Failed to load trade details');
        throw error;
      }

      return data as TradeDetails;
    },
    enabled: !!user && !!tradeId
  });

  // Fetch bot tokens for coin details
  const { data: botTokens } = useQuery({
    queryKey: ['bot-tokens'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bot_tokens')
        .select('*')
        .eq('status', 'active');

      if (error) {
        console.error('Error fetching bot tokens:', error);
        return [];
      }

      return data as BotToken[];
    }
  });

  const [displayCoinData, setDisplayCoinData] = useState<any[]>([]);
  const [tradeProcessed, setTradeProcessed] = useState(false);

  useEffect(() => {
    if (!tradeDetails || !botTokens) return;

    // Calculate coin performance from trade data
    if (tradeDetails.coins && tradeDetails.coins.length > 0) {
      const coinData = calculateRealisticCoinPerformance(
        tradeDetails.coins,
        tradeDetails.invest_amount,
        tradeDetails.profit_percent,
        tradeDetails.profit_or_lose,
        tradeDetails.return_amount || 0,
        tradeDetails.profit || tradeDetails.profit_loss || 0,
        botTokens
      );
      setDisplayCoinData(coinData);
    }

    // Check if trade time has ended and needs processing
    const checkAndProcessTrade = async () => {
      const openTime = new Date(tradeDetails.open_time);
      const currentTime = new Date();
      const tradeEndTime = new Date(openTime.getTime() + (tradeDetails.trade_timer * 60 * 60 * 1000));
      
      const isTradeCompleted = currentTime >= tradeEndTime;

      // Only process if trade is completed and hasn't been processed yet
      if (isTradeCompleted && tradeDetails.status === 'active' && !tradeProcessed) {
        await processCompletedTrade();
        setTradeProcessed(true);
      }
    };

    checkAndProcessTrade();
  }, [tradeDetails, botTokens, tradeProcessed]);

  const calculateRealisticCoinPerformance = (
    coins: string[], 
    investAmount: number, 
    profitPercent: number, 
    profitOrLose: string, 
    returnAmount: number, 
    totalProfitLoss: number,
    botTokens: BotToken[]
  ) => {
    const amountPerCoin = investAmount / coins.length;
    
    // Create a map of bot tokens for quick lookup
    const tokenMap = new Map(botTokens.map(token => [token.symbol, token]));
    
    // If trade is completed and we have return amount, calculate based on actual return
    if (returnAmount > 0 && totalProfitLoss !== 0) {
      // Generate individual coin profits/losses that sum to the total
      const coinProfits: number[] = [];
      let remainingProfit = totalProfitLoss;
      
      // Generate profits for all coins except the last one
      for (let i = 0; i < coins.length - 1; i++) {
        const coin = coins[i];
        const seed = coin.charCodeAt(0) + coin.charCodeAt(coin.length - 1) + i;
        
        // Calculate a reasonable range for this coin's profit/loss
        const maxProfitForCoin = totalProfitLoss * 0.4; // Max 40% of total profit for any coin
        const minProfitForCoin = totalProfitLoss * -0.2; // Max 20% loss for any coin
        
        // Generate variation factor to create realistic distribution
        const variationFactor = 0.1 + ((seed % 80) / 100); // 0.1 to 0.9 range
        
        let coinProfit = totalProfitLoss * variationFactor / coins.length;
        
        // Ensure it stays within reasonable bounds
        coinProfit = Math.max(minProfitForCoin, Math.min(maxProfitForCoin, coinProfit));
        
        // Add some randomness for realism
        const shouldFlipSign = (seed % 4) === 0; // 25% chance to flip for variety
        if (shouldFlipSign && totalProfitLoss > 0) {
          coinProfit = -Math.abs(coinProfit * 0.3); // Small loss
        }
        
        coinProfits.push(coinProfit);
        remainingProfit -= coinProfit;
      }
      
      // The last coin gets the remaining profit to ensure exact total
      coinProfits.push(remainingProfit);
      
      return coins.map((coin, index) => {
        const investedAmount = parseFloat(amountPerCoin.toFixed(6));
        const coinProfitLoss = parseFloat(coinProfits[index].toFixed(6));
        const collectAmount = parseFloat((investedAmount + coinProfitLoss).toFixed(6));
        const isProfit = coinProfitLoss >= 0;
        
        // Get coin details from bot_tokens
        const tokenDetails = tokenMap.get(coin);
        
        return {
          symbol: coin,
          name: tokenDetails?.name || coin,
          image_url: tokenDetails?.image_url || getCoinImage(coin),
          investedAmount,
          collectAmount,
          isProfit,
          profitLoss: coinProfitLoss
        };
      });
    }
    
    // For active trades, generate realistic projections with varied performance
    return coins.map((coin, index) => {
      const investedAmount = parseFloat(amountPerCoin.toFixed(6));
      
      // Create realistic variations for each coin using coin symbol as seed
      const seed = coin.charCodeAt(0) + coin.charCodeAt(coin.length - 1) + index;
      const randomFactor = 0.8 + ((seed % 40) / 100); // 0.8 to 1.2 range
      
      // Some coins profit, some lose - realistic distribution
      const shouldProfit = (seed % 3) !== 0; // About 66% profit, 33% loss
      
      let collectAmount;
      if (shouldProfit) {
        // Profit coins: 1% to 15% gains
        const profitMultiplier = 1 + ((seed % 15 + 1) / 100);
        collectAmount = parseFloat((investedAmount * profitMultiplier * randomFactor).toFixed(6));
      } else {
        // Loss coins: 5% to 25% losses
        const lossMultiplier = 1 - ((seed % 20 + 5) / 100);
        collectAmount = parseFloat((investedAmount * lossMultiplier * randomFactor).toFixed(6));
      }
      
      const profitLoss = parseFloat((collectAmount - investedAmount).toFixed(6));
      const isProfit = profitLoss >= 0;
      
      // Get coin details from bot_tokens
      const tokenDetails = tokenMap.get(coin);
      
      return {
        symbol: coin,
        name: tokenDetails?.name || coin,
        image_url: tokenDetails?.image_url || getCoinImage(coin),
        investedAmount,
        collectAmount,
        isProfit,
        profitLoss
      };
    });
  };

  const processCompletedTrade = async () => {
    if (!tradeDetails || !user || displayCoinData.length === 0) return;

    try {
      console.log('Processing completed trade:', tradeDetails.id);

      // Calculate total return amount from coin data
      const totalReturned = displayCoinData.reduce((sum, coin) => sum + coin.collectAmount, 0);
      const totalProfit = totalReturned - tradeDetails.invest_amount;

      // Update trade status to completed
      const { error: updateError } = await supabase
        .from('user_bot_trades')
        .update({
          status: 'completed',
          close_time: new Date().toISOString(),
          return_amount: totalReturned,
          profit_loss: totalProfit,
          return_time: new Date().toISOString()
        })
        .eq('id', tradeDetails.id);

      if (updateError) {
        console.error('Error updating trade status:', updateError);
        return;
      }

      // Update user's main balance with the return amount
      const { error: balanceError } = await supabase.rpc('add_user_balance', {
        user_id: user.id,
        amount: totalReturned
      });

      if (balanceError) {
        console.error('Error updating user balance:', balanceError);
      } else {
        console.log('User main balance updated with return amount:', totalReturned);
        notify.success(`Trade completed! Balance updated with $${totalReturned.toFixed(2)}`);
      }

      // Refetch trade details to show updated status
      refetch();

    } catch (error) {
      console.error('Error processing completed trade:', error);
    }
  };

  const handleBackClick = () => {
    navigate('/bot-trade');
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

  const getCoinImage = (coinSymbol: string) => {
    const coinImages: { [key: string]: string } = {
      'SOL': 'https://i.ibb.co/0YQJhzM/1711137080552-63f5b15b321561677046107.png',
      'ALGO': 'https://i.ibb.co/JBx1w9x/1711138271497-65b274eeea94b1706194158.png',
      'BCH': 'https://i.ibb.co/x33zq5k/1711139389480-1831.png',
      'ARB': 'https://i.ibb.co/Tv2xV5M/1711139634049-11841.png',
      'NTRN': 'https://i.ibb.co/PQ5rds6/26680.png',
      'XRP': 'https://i.ibb.co/K2qkxx4/1711137626248-63f5b06b27ce61677045867.png',
      'GALA': 'https://i.ibb.co/kQThwds/1711138741502-7080.png',
      'GMT': 'https://i.ibb.co/cx8MVYF/1711138891908-18069.png',
      'AAVE': 'https://i.ibb.co/8cnJshV/1711139761164-7278.png',
      'XMR': 'https://i.ibb.co/x6tQWqH/1711139789384-328.png',
      'BTC': 'https://i.ibb.co/vdtQGJQ/1711137174306-Bitcoin-svg.png',
      'ETH': 'https://i.ibb.co/GVY5981/1711137435289-63f5ae36e64321677045302.png',
      'LTC': 'https://i.ibb.co/vZDT3t6/1711138170595-64b0737bcd6471689285499.jpg',
      'ICP': 'https://i.ibb.co/qDzm0xR/1711139481440-8916.png',
      'DOT': 'https://i.ibb.co/MMZSLWT/Polkadot-Logo-Animation-64x64.gif',
      'LINK': 'https://i.ibb.co/48NtVW0/1711138140032-65b276149bdac1706194452.png',
      'ADA': 'https://i.ibb.co/GVZD7tC/1711137740064-63f5b09e9f94e1677045918.png',
      'STX': 'https://i.ibb.co/hdSTNkp/1711139575059-4847.png',
      'AVAX': 'https://i.ibb.co/W07JwvF/1711139227465-5805.png',
      'XLM': 'https://i.ibb.co/B2q6bKh/512.png',
      'QNT': 'https://i.ibb.co/MVymyvM/3155.png',
      'DASH': 'https://i.ibb.co/KDt7SSL/131.png',
      'TRX': 'https://i.ibb.co/VBBTjgM/1711137127040-63f5b1ee31d5b1677046254.png',
      'BNB': 'https://i.ibb.co/zmSk16z/1711137454561-63f5aefe3d51d1677045502.png',
      'DOGE': 'https://i.ibb.co/xqmnGMh/1711137870591-63f5b131cee801677046065.jpg',
      'NEAR': 'https://i.ibb.co/KyPDwwM/1711139510495-6535.png',
      'APT': 'https://i.ibb.co/SfMKk5K/1711138580329-21794.png',
      'ATOM': 'https://i.ibb.co/88Thdwf/1711138693569-3794.png',
      'ENS': 'https://i.ibb.co/tQTgxPd/13855.png',
      'AR': 'https://i.ibb.co/68HYdPs/5632.png',
      'BNX': 'https://i.ibb.co/yQHshML/23635.png',
      'AXL': 'https://i.ibb.co/VmqS7Q0/17799.png',
      'DEXE': 'https://i.ibb.co/fNczhgr/7326.png'
    };
    
    return coinImages[coinSymbol] || '/assets/default-hiMwPs0P.png' + coinSymbol;
  };

  if (!user) {
    return (
      <div className="relative min-h-[100vh] bg-black mx-auto max-w-[480px] flex items-center justify-center">
        <div className="text-white text-center p-8">
          <h2 className="text-xl font-bold mb-4">Please Log In</h2>
          <p className="text-gray-300 mb-6">You need to log in to view trade details.</p>
          <button 
            onClick={() => navigate('/login')}
            className="bg-lime-500 hover:bg-lime-600 text-white px-6 py-3 rounded-lg"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="relative min-h-[100vh] bg-black mx-auto max-w-[480px] flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-500 mx-auto mb-4"></div>
          <p>Loading trade details...</p>
        </div>
      </div>
    );
  }

  if (!tradeDetails) {
    return (
      <div className="relative min-h-[100vh] bg-black mx-auto max-w-[480px] flex items-center justify-center">
        <div className="text-white text-center p-8">
          <h2 className="text-xl font-bold mb-4">Trade Not Found</h2>
          <p className="text-gray-300 mb-6">The requested trade details could not be found.</p>
          <button 
            onClick={handleBackClick}
            className="bg-lime-500 hover:bg-lime-600 text-white px-6 py-3 rounded-lg"
          >
            Back to Bot Trading
          </button>
        </div>
      </div>
    );
  }

  // Calculate totals from trade data - use actual values from database
  const totalInvested = tradeDetails.invest_amount;
  const totalReturned = tradeDetails.return_amount || totalInvested;
  const totalProfit = tradeDetails.profit || tradeDetails.profit_loss || (totalReturned - totalInvested);

  return (
    <>
      
      <div className="relative min-h-[100vh] bg-black mx-auto max-w-[480px] overflow-y-auto">
        <div className="min-h-[100vh] pt-[0px] pb-[63px]">
          <div className="relative z-[1]">
            {/* Header Section */}
            <div className="relative overflow-hidden">
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
                    <h1 className="text-white font-bold">Bot Trade Details</h1>
                  </div>
                  <div className="flex gap-2 items-center bg-black/20 border border-gray-500/50 backdrop-blur rounded-full">
                    <img 
                      className="w-[48px] h-[48px] aspect-square border border-gray-500/50 rounded-full" 
                      src="https://img.freepik.com/premium-photo/3d-cartoon-avatar-man-minimal-3d-character_652053-2070.jpg" 
                      alt="" 
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Trade Summary */}
            <div className="bg-gray-900/80 backdrop-blur p-2">
              <div className="flex gap-3 items-center py-2">
                <img 
                  className="w-[20px] h-[20px] rotate-[270deg]" 
                  src="data:image/svg+xml,%3csvg%20height='200px'%20width='200px'%20version='1.1'%20id='Layer_1'%20xmlns='http://www.w3.org/2000/svg'%20xmlns:xlink='http://www.w3.org/1999/xlink'%20viewBox='0%200%20512.006%20512.006'%20xml:space='preserve'%20fill='%23000000'%3e%3cg%20id='SVGRepo_bgCarrier'%20stroke-width='0'%3e%3c/g%3e%3cg%20id='SVGRepo_tracerCarrier'%20stroke-linecap='round'%20stroke-linejoin='round'%3e%3c/g%3e%3cg%20id='SVGRepo_iconCarrier'%3e%3cpath%20style='fill:%23ea343d;'%20d='M23.151,149.616l115.072,115.072c7.901,7.901,20.713,7.901,28.614,0s7.901-20.713,0-28.614%20l-44.568-44.568h316.313v-0.001c31.036,0,56.198-25.16,56.198-56.198c0-31.036-25.16-56.198-56.198-56.198H122.269l44.568-44.568%20c3.951-3.951,5.927-9.129,5.927-14.308s-1.976-10.357-5.927-14.308c-7.901-7.901-20.713-7.901-28.614,0L23.151,121.002%20C15.25,128.903,15.25,141.715,23.151,149.616z'%3e%3c/path%3e%3cpath%20style='fill:%23fd6373;'%20d='M23.151,149.616l115.072,115.072c7.901,7.901,20.713,7.901,28.614,0s7.901-20.713,0-28.614%20l-44.568-44.568h139.247V79.111H122.269l44.568-44.568c3.951-3.951,5.927-9.129,5.927-14.308s-1.976-10.357-5.927-14.308%20c-7.901-7.901-20.713-7.901-28.614,0L23.151,121.002C15.25,128.903,15.25,141.715,23.151,149.616z'%3e%3c/path%3e%3cpath%20style='fill:%2343df7a;'%20d='M488.855,362.39L373.783,247.318c-7.901-7.901-20.713-7.901-28.614,0%20c-7.901,7.901-7.901,20.713,0,28.614l44.567,44.568H73.423v0.001c-31.036,0-56.198,25.16-56.198,56.198%20c0,31.036,25.16,56.198,56.198,56.198h316.314l-44.568,44.568c-3.951,3.951-5.927,9.129-5.927,14.308%20c0,5.179,1.976,10.357,5.927,14.308c7.901,7.901,20.713,7.901,28.614,0l115.072-115.072%20C496.757,383.103,496.757,370.291,488.855,362.39z'%3e%3c/path%3e%3cpath%20style='fill:%2300c254;'%20d='M488.855,362.39L373.783,247.318c-7.901-7.901-20.713-7.901-28.614,0%20c-7.901,7.901-7.901,20.713,0,28.614l44.567,44.568H261.518v112.395h128.218l-44.568,44.568c-3.951,3.951-5.927,9.129-5.927,14.308%20c0,5.179,1.976,10.357,5.927,14.308c7.901,7.901,20.713,7.901,28.614,0l115.072-115.072%20C496.757,383.103,496.757,370.291,488.855,362.39z'%3e%3c/path%3e%3c/g%3e%3c/svg%3e" 
                  alt=""
                />
                <div className="flex-auto">
                  <h1 className="text-gray-300 text-[12px]">
                    Invest: <span className="font-semibold">${totalInvested.toFixed(2)}</span>
                  </h1>
                  <h1 className="text-gray-300 text-[12px]">
                    Return: <span className="font-semibold">${totalReturned.toFixed(2)}</span>
                  </h1>
                  <h1 className="text-gray-300 text-[12px]">
                    Date: <span className="font-semibold">{formatDate(tradeDetails.open_time)}</span>
                  </h1>
                  <h1 className="text-gray-300 text-[12px]">
                    Status: <span className={`font-semibold ${tradeDetails.status === 'completed' ? 'text-green-400' : 'text-yellow-400'}`}>
                      {tradeDetails.status.charAt(0).toUpperCase() + tradeDetails.status.slice(1)}
                    </span>
                  </h1>
                </div>
                <div className="text-end">
                  {tradeDetails.status === 'completed' ? (
                    <button className={`border text-center rounded-full px-4 py-1 text-[11px] font-semibold ${
                      totalProfit >= 0 
                        ? 'border-green-400 bg-green-400/20 text-green-400' 
                        : 'border-red-400 bg-red-400/20 text-red-400'
                    }`}>
                      {totalProfit >= 0 ? 'PROFIT' : 'LOSS'}: ${Math.abs(totalProfit).toFixed(2)}
                    </button>
                  ) : (
                    <div className={`border text-center rounded-full px-4 text-[11px] ${
                      tradeDetails.profit_or_lose === 'profit'
                        ? 'border-green-400/50 text-green-400' 
                        : 'border-red-400/50 text-red-400'
                    }`}>
                      Expected: {tradeDetails.profit_or_lose === 'profit' ? 'Profit' : 'Loss'}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Coin Details */}
            <div className="overflow-x-auto h-[calc(100vh-238px)] mx-auto mt-2">
              {displayCoinData.length > 0 ? (
                displayCoinData.map((coinData, index) => (
                  <div key={index} className="flex items-center gap-4 border-b border-gray-800 rounded-[10px] p-2 my-2">
                    <img 
                      className="rounded-full w-[35px] h-[35px]" 
                      src={coinData.image_url} 
                      alt={coinData.symbol}
                      onError={(e) => {
                        e.currentTarget.src = getCoinImage(coinData.symbol);
                      }}
                    />
                    <div className="flex-auto">
                      <div className="flex">
                        <h1 className="text-[13px] text-gray-300 font-normal flex-auto">
                          Invest on {coinData.name}
                        </h1>
                        <h1 className="text-[13px] text-gray-300 font-semibold">
                          ${coinData.investedAmount.toFixed(6)}
                        </h1>
                      </div>
                      <div className="flex">
                        <h1 className="text-[13px] text-lime-400 font-normal flex-auto">
                          Collect from {coinData.name}
                        </h1>
                        <h1 className={`text-[13px] font-semibold ${
                          coinData.isProfit ? 'text-emerald-500' : 'text-rose-500'
                        }`}>
                          ${coinData.collectAmount.toFixed(6)}
                        </h1>
                      </div>
                      <div className="flex">
                        <h1 className="text-[11px] text-gray-400 font-normal flex-auto">
                          {coinData.isProfit ? 'Profit' : 'Loss'}
                        </h1>
                        <h1 className={`text-[11px] font-semibold ${
                          coinData.isProfit ? 'text-emerald-500' : 'text-rose-500'
                        }`}>
                          {coinData.isProfit ? '+' : ''}${coinData.profitLoss.toFixed(6)}
                        </h1>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center text-gray-400">
                    <p>No coin data available</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BotTradeDetails;
