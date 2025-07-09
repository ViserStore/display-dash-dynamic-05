
import { useState, useEffect } from "react";
import { useUserData } from "@/contexts/UserDataContext";
import { useBinancePrice } from "@/hooks/useBinancePrice";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CoinSelector from "@/components/CoinSelector";

interface Coin {
  id: number;
  symbol: string;
  image_url: string | null;
  status: string;
}

const Swap = () => {
  const { user } = useAuth();
  const { userData, coins, siteSettings, updateBalance } = useUserData();
  const [fromCoin, setFromCoin] = useState<string>("BTC");
  const [toCoin, setToCoin] = useState<string>("ETH");
  const [fromAmount, setFromAmount] = useState<string>("");
  const [toAmount, setToAmount] = useState<string>("");
  const [isSwapping, setIsSwapping] = useState(false);
  
  const { price: fromPrice } = useBinancePrice(`${fromCoin}USDT`);
  const { price: toPrice } = useBinancePrice(`${toCoin}USDT`);

  // Calculate exchange rate and to amount
  useEffect(() => {
    if (fromAmount && fromPrice && toPrice && parseFloat(fromAmount) > 0) {
      const fromValue = parseFloat(fromAmount) * fromPrice;
      const toValue = fromValue / toPrice;
      setToAmount(toValue.toFixed(8));
    } else {
      setToAmount("");
    }
  }, [fromAmount, fromPrice, toPrice]);

  const handleSwapTokens = () => {
    const tempCoin = fromCoin;
    setFromCoin(toCoin);
    setToCoin(tempCoin);
    setFromAmount("");
    setToAmount("");
  };

  const handleSwap = async () => {
    if (!user || !fromAmount || parseFloat(fromAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    const amount = parseFloat(fromAmount);
    const requiredBalance = amount * fromPrice;

    if (userData.balance < requiredBalance) {
      toast.error(`Insufficient balance. Required: ${siteSettings.currency_symbol}${requiredBalance.toFixed(2)}`);
      return;
    }

    setIsSwapping(true);

    try {
      // Simulate swap transaction
      const { error } = await supabase
        .from('trade_transactions')
        .insert({
          user_id: user.id,
          symbol: `${fromCoin}/${toCoin}`,
          trade_type: 'SWAP',
          action: 'SWAP',
          amount: requiredBalance,
          price: fromPrice / toPrice,
          status: 'SUCCESS'
        });

      if (error) throw error;

      // Update user balance
      const newBalance = userData.balance - requiredBalance;
      const { error: updateError } = await supabase
        .from('users')
        .update({ balance: newBalance })
        .eq('id', user.id);

      if (updateError) throw updateError;

      updateBalance(newBalance);
      toast.success(`Successfully swapped ${fromAmount} ${fromCoin} for ${toAmount} ${toCoin}`);
      setFromAmount("");
      setToAmount("");
    } catch (error) {
      console.error('Swap error:', error);
      toast.error("Swap failed. Please try again.");
    } finally {
      setIsSwapping(false);
    }
  };

  const exchangeRate = fromPrice && toPrice ? (fromPrice / toPrice).toFixed(6) : '0';

  return (
    <div className="relative min-h-[100vh] mx-auto max-w-[480px] bg-black overflow-y-hidden">
      <div className="min-h-[100vh] pt-[0px] pb-[63px]">
        <div className="relative z-[1]">
          {/* Header Section */}
          <div className="relative overflow-hidden mb-[10px]">
            <div className="px-[15px] py-[15px] relative z-[2] rounded-b-[30px] px-[10px] pb-[5px]">
              <div className="flex gap-3 items-center justify-between">
                <div className="flex gap-2 items-center bg-gray-900/90 backdrop-blur-md border border-gray-600/40 rounded-full">
                  <img className="w-[40px] aspect-square border border-gray-600/40 rounded-full" src="https://img.freepik.com/premium-photo/3d-cartoon-avatar-man-minimal-3d-character_652053-2070.jpg" alt="" />
                  <div className="px-2">
                    <div className="text-xs font-bold text-white">
                      Token Swap
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 items-center bg-gray-900/90 backdrop-blur-md border border-gray-600/40 rounded-full ps-[10px]">
                  <h1 className="text-white text-sm">
                    {siteSettings.currency_symbol}{userData.balance.toFixed(2)}
                  </h1>
                  <img className="w-[40px] aspect-square border border-gray-600/40 rounded-full" src="https://openseauserdata.com/files/bb8d7f8bb662338f03224cb67bbccf0b.gif" alt="" />
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="container mx-auto px-[15px] pb-3">
            {/* Swap Interface */}
            <div className="bg-gray-900/95 backdrop-blur-lg border border-gray-700/40 rounded-3xl p-6 shadow-2xl">
              <h2 className="text-2xl font-bold text-white mb-6 text-center flex items-center justify-center gap-3">
                <ArrowUpDown className="w-6 h-6 text-green-400" />
                Swap Tokens
              </h2>
              
              {/* From Token */}
              <div className="bg-gray-800/60 backdrop-blur-md border border-gray-700/30 rounded-2xl p-4 mb-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-gray-300 text-sm font-medium">From</span>
                  <span className="text-gray-400 text-sm">
                    Balance: {siteSettings.currency_symbol}{userData.balance.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <CoinSelector
                    coins={coins}
                    selectedCoin={fromCoin}
                    onCoinSelect={setFromCoin}
                    className="flex-shrink-0"
                  />
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={fromAmount}
                    onChange={(e) => setFromAmount(e.target.value)}
                    className="flex-1 bg-transparent border-gray-600/30 text-white text-lg font-medium focus:border-green-400/50 h-12 rounded-xl"
                  />
                </div>
                <div className="text-right text-sm text-gray-400 mt-2">
                  ≈ {siteSettings.currency_symbol}{(parseFloat(fromAmount || "0") * fromPrice).toFixed(2)}
                </div>
              </div>

              {/* Swap Button */}
              <div className="flex justify-center my-6">
                <Button
                  onClick={handleSwapTokens}
                  variant="outline"
                  size="sm"
                  className="bg-green-600/90 backdrop-blur-md border-green-500/50 hover:bg-green-500/90 text-white rounded-full p-3 transition-all duration-300 hover:scale-110"
                >
                  <ArrowUpDown className="w-5 h-5" />
                </Button>
              </div>

              {/* To Token */}
              <div className="bg-gray-800/60 backdrop-blur-md border border-gray-700/30 rounded-2xl p-4 mb-6">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-gray-300 text-sm font-medium">To</span>
                  <span className="text-gray-400 text-sm">
                    Rate: 1 {fromCoin} = {exchangeRate} {toCoin}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <CoinSelector
                    coins={coins}
                    selectedCoin={toCoin}
                    onCoinSelect={setToCoin}
                    className="flex-shrink-0"
                  />
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={toAmount}
                    readOnly
                    className="flex-1 bg-transparent border-gray-600/30 text-white text-lg font-medium cursor-not-allowed h-12 rounded-xl"
                  />
                </div>
                <div className="text-right text-sm text-gray-400 mt-2">
                  ≈ {siteSettings.currency_symbol}{(parseFloat(toAmount || "0") * toPrice).toFixed(2)}
                </div>
              </div>

              {/* Swap Button */}
              <Button
                onClick={handleSwap}
                disabled={!fromAmount || parseFloat(fromAmount) <= 0 || isSwapping}
                className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-bold py-4 rounded-2xl disabled:opacity-50 transition-all duration-300 text-lg shadow-lg hover:shadow-green-500/25"
              >
                {isSwapping ? "Swapping..." : "Swap Tokens"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Swap;
