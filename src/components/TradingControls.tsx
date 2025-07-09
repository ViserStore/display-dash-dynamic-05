import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../integrations/supabase/client';
import { useUserData } from '../contexts/UserDataContext';
import { useTradeSettings } from '../hooks/useTradeSettings';
import { notify } from '../utils/notifications';

interface TradingControlsProps {
  coinSymbol: string;
  onPlaceOrder: (order: {
    type: 'BUY' | 'SELL';
    amount: number;
    timer: number;
    openPrice: number;
  }) => void;
}

const TradingControls = ({ coinSymbol, onPlaceOrder }: TradingControlsProps) => {
  const { settings: tradeSettings } = useTradeSettings();
  const [amount, setAmount] = useState<number>(5);
  const [timer, setTimer] = useState<number>(0.5);
  const [isPlacingBuy, setIsPlacingBuy] = useState(false);
  const [isPlacingSell, setIsPlacingSell] = useState(false);
  const [dailyTradeCount, setDailyTradeCount] = useState<number>(0);
  const { user } = useAuth();
  const { userData, updateBalance } = useUserData();
  const balance = userData.balance;

  // Update default amount when trade settings load
  useEffect(() => {
    if (tradeSettings) {
      setAmount(tradeSettings.manual_min_trade_amount);
    }
  }, [tradeSettings]);

  // Fetch daily trade count
  useEffect(() => {
    const fetchDailyTradeCount = async () => {
      if (!user) return;

      try {
        const today = new Date().toISOString().split('T')[0];
        const { data, error } = await supabase
          .from('trade_transactions')
          .select('id')
          .eq('user_id', user.id)
          .gte('created_at', `${today}T00:00:00.000Z`)
          .lt('created_at', `${today}T23:59:59.999Z`);

        if (error) {
          console.error('Error fetching daily trade count:', error);
          return;
        }

        setDailyTradeCount(data?.length || 0);
      } catch (error) {
        console.error('Error fetching daily trade count:', error);
      }
    };

    fetchDailyTradeCount();
  }, [user]);

  const fetchFreshPrice = async (): Promise<number> => {
    try {
      const response = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${coinSymbol}USDT`);
      if (!response.ok) {
        throw new Error('Failed to fetch price');
      }
      const data = await response.json();
      return parseFloat(data.price);
    } catch (error) {
      console.error('Error fetching fresh price:', error);
      throw error;
    }
  };

  const deductBalance = async () => {
    if (!user) return false;

    try {
      const { error } = await supabase.rpc('deduct_user_balance', {
        user_id: user.id,
        amount: amount
      });

      if (error) {
        console.error('Error deducting balance:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deducting balance:', error);
      return false;
    }
  };

  const validateTradeAmount = () => {
    const minAmount = tradeSettings?.manual_min_trade_amount || 1;
    const maxAmount = tradeSettings?.manual_max_trade_amount || 1000;
    
    if (amount < minAmount) {
      notify.error(`Minimum trade amount is $${minAmount}. You entered $${amount}`);
      return false;
    }
    
    if (amount > maxAmount) {
      notify.error(`Maximum trade amount is $${maxAmount}. You entered $${amount}`);
      return false;
    }
    
    return true;
  };

  const validateDailyLimit = () => {
    const dailyLimit = tradeSettings?.manual_daily_trade_limit || 50;
    
    if (dailyTradeCount >= dailyLimit) {
      notify.error(`Daily trade limit exceeded! Limit: ${dailyLimit}, Current trades: ${dailyTradeCount}`);
      return false;
    }
    
    return true;
  };

  const validateBalance = () => {
    if (balance === 0) {
      notify.error('You have no balance available. Please deposit funds to start trading.');
      return false;
    }

    if (balance < amount) {
      notify.error(`Insufficient balance! Need $${amount.toFixed(2)}, have $${balance.toFixed(2)}`);
      return false;
    }

    return true;
  };

  const handleBuy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Only block the BUY button, not both
    if (isPlacingBuy) {
      console.log('Already placing BUY order, ignoring click');
      return;
    }
    
    // Validate all conditions before proceeding
    if (!validateTradeAmount() || !validateDailyLimit() || !validateBalance()) {
      return;
    }
    
    if (amount > 0 && timer > 0) {
      console.log('Starting BUY order process...');
      setIsPlacingBuy(true);
      
      try {
        const freshPrice = await fetchFreshPrice();
        console.log(`Fetched fresh price for BUY order: ${freshPrice}`);

        const balanceDeducted = await deductBalance();
        if (!balanceDeducted) {
          notify.error('Failed to deduct balance. Please try again.');
          return;
        }

        console.log('Balance deducted, placing BUY order...');
        await onPlaceOrder({
          type: 'BUY',
          amount,
          timer,
          openPrice: freshPrice
        });

        // Update daily trade count
        setDailyTradeCount(prev => prev + 1);

        // Show single success notification
        notify.success(`BUY trade opened: $${amount} at $${freshPrice.toFixed(4)}`);
        
        // Update balance in global context immediately
        updateBalance(balance - amount);

      } catch (error) {
        notify.error('Failed to place BUY order. Please try again.');
        console.error('Error placing buy order:', error);
      } finally {
        setIsPlacingBuy(false);
      }
    }
  };

  const handleSell = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Only block the SELL button, not both
    if (isPlacingSell) {
      console.log('Already placing SELL order, ignoring click');
      return;
    }
    
    // Validate all conditions before proceeding
    if (!validateTradeAmount() || !validateDailyLimit() || !validateBalance()) {
      return;
    }
    
    if (amount > 0 && timer > 0) {
      console.log('Starting SELL order process...');
      setIsPlacingSell(true);
      
      try {
        const freshPrice = await fetchFreshPrice();
        console.log(`Fetched fresh price for SELL order: ${freshPrice}`);

        const balanceDeducted = await deductBalance();
        if (!balanceDeducted) {
          notify.error('Failed to deduct balance. Please try again.');
          return;
        }

        console.log('Balance deducted, placing SELL order...');
        await onPlaceOrder({
          type: 'SELL',
          amount,
          timer,
          openPrice: freshPrice
        });

        // Update daily trade count
        setDailyTradeCount(prev => prev + 1);

        // Show single success notification
        notify.success(`SELL trade opened: $${amount} at $${freshPrice.toFixed(4)}`);
        
        // Update balance in global context immediately
        updateBalance(balance - amount);

      } catch (error) {
        notify.error('Failed to place SELL order. Please try again.');
        console.error('Error placing sell order:', error);
      } finally {
        setIsPlacingSell(false);
      }
    }
  };

  const handleAmountChange = (newAmount: number) => {
    const minAmount = tradeSettings?.manual_min_trade_amount || 1;
    const maxAmount = tradeSettings?.manual_max_trade_amount || 1000;
    
    // Show immediate notifications for invalid amounts
    if (newAmount < minAmount) {
      notify.error(`Amount too low! Minimum is $${minAmount}`);
    } else if (newAmount > maxAmount) {
      notify.error(`Amount too high! Maximum is $${maxAmount}`);
    }
    
    const clampedAmount = Math.max(minAmount, Math.min(maxAmount, newAmount));
    setAmount(clampedAmount);
  };

  const increaseAmount = () => {
    const maxAmount = tradeSettings?.manual_max_trade_amount || 1000;
    
    if (amount >= maxAmount) {
      notify.error(`Maximum trade amount reached: $${maxAmount}`);
      return;
    }
    
    const newAmount = Math.min(amount + 1, maxAmount);
    setAmount(newAmount);
  };
  
  const decreaseAmount = () => {
    const minAmount = tradeSettings?.manual_min_trade_amount || 1;
    
    if (amount <= minAmount) {
      notify.error(`Minimum trade amount reached: $${minAmount}`);
      return;
    }
    
    const newAmount = Math.max(amount - 1, minAmount);
    setAmount(newAmount);
  };

  const minAmount = tradeSettings?.manual_min_trade_amount || 1;
  const maxAmount = tradeSettings?.manual_max_trade_amount || 1000;

  return (
    <div className="fixed bg-black bottom-[63px] !max-w-[480px] w-full px-2 border-t border-black pt-[10px]">
      
      <div className="grid grid-cols-2 gap-3 mb-3 mt-1">
        <div className="relative">
          <label className="absolute bg-black px-3 top-[-10px] left-[15px] z-[2] block mb-2 text-[12px] font-medium text-lime-500 text-start">Timer</label>
          <select 
            value={timer} 
            onChange={(e) => setTimer(Number(e.target.value))}
            className="relative text-sm bg-transparent backdrop-blur rounded-[5px] border-[1px] border-lime-300/40 block w-full p-1.5 placeholder-gray-400 text-white !outline-none h-11"
          >
            <option value={0.5}>30 Seconds</option>
            <option value={1}>1 Minute</option>
            <option value={3}>3 Minutes</option>
            <option value={5}>5 Minutes</option>
            <option value={10}>10 Minutes</option>
            <option value={30}>30 Minutes</option>
            <option value={60}>1 Hour</option>
            <option value={120}>2 Hours</option>
            <option value={240}>4 Hours</option>
            <option value={480}>8 Hours</option>
            <option value={720}>12 Hours</option>
            <option value={1440}>1 Day</option>
          </select>
        </div>

        <div className="relative !w-100">
          <label className="absolute bg-black px-3 top-[-10px] right-[15px] z-[2] block mb-2 text-[12px] font-medium text-lime-500 text-end">Amount</label>
          <div className="relative flex items-center bg-black backdrop-blur rounded-[5px] border-[1px] border-lime-300/40">
            <button 
              type="button" 
              onClick={decreaseAmount}
              className="bg-transparent text-white hover:text-gray-200 rounded-s-[5px] p-3 h-11 !outline-none"
            >
              <i className="fi fi-sr-minus-circle"></i>
            </button>
            <input 
              type="number" 
              value={amount}
              onChange={(e) => handleAmountChange(Number(e.target.value))}
              min={minAmount}
              max={maxAmount}
              className="h-11 text-center text-sm block w-full py-2.5 bg-transparent placeholder-gray-400 text-white !focus:ring-yellow-500 !focus:border-yellow-500 !focus:outline-yellow-500 !outline-none" 
              placeholder="0.00" 
            />
            <button 
              type="button" 
              onClick={increaseAmount}
              className="bg-transparent text-white hover:text-gray-200 rounded-e-[5px] p-3 h-11 !outline-none"
            >
              <i className="fi fi-sr-add"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Buy/Sell Buttons - Each button disabled independently */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <button 
          type="button" 
          onClick={handleSell}
          disabled={isPlacingSell}
          className={`w-full p-2 rounded-[10px] !py-2 !rounded-[5px] flex px-2 justify-center items-center transition-all duration-200 ${
            isPlacingSell
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed opacity-50'
              : 'bg-gradient-to-r hover:bg-gradient-to-l bg-red-600 hover:bg-red-500 to-rose-600 text-white shadow-md shadow-red-500/60'
          }`}
        >
          <div>
            <h1 className="font-bold">
              {isPlacingSell ? 'PLACING...' : 'SELL'}
            </h1>
            <h1 className="text-[10px]">Fresh Price on Open</h1>
          </div>
        </button>
        <button 
          type="button" 
          onClick={handleBuy}
          disabled={isPlacingBuy}
          className={`w-full p-2 rounded-[10px] !py-2 !rounded-[5px] flex px-2 justify-center items-center transition-all duration-200 ${
            isPlacingBuy
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed opacity-50'
              : 'bg-gradient-to-r hover:bg-gradient-to-l bg-emerald-600 hover:bg-emerald-500 to-rose-600 text-white shadow-md shadow-emerald-500/60'
          }`}
        >
          <div>
            <h1 className="font-bold">
              {isPlacingBuy ? 'PLACING...' : 'BUY'}
            </h1>
            <h1 className="text-[10px]">Fresh Price on Open</h1>
          </div>
        </button>
      </div>
    </div>
  );
};

export default TradingControls;
