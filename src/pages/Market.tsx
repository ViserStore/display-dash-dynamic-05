
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import BottomNavigation from "../components/BottomNavigation";
import PageHeader from "../components/PageHeader";

interface Coin {
  id: number;
  symbol: string;
  image_url: string | null;
  status: string;
}

interface BinancePrice {
  symbol: string;
  price: string;
}

interface BinanceTicker {
  symbol: string;
  priceChangePercent: string;
}

const fetchCoinsFromDatabase = async (): Promise<Coin[]> => {
  const { data, error } = await supabase
    .from('coins')
    .select('*')
    .eq('status', 'active')
    .order('id', { ascending: true });

  if (error) {
    throw new Error('Failed to fetch coins from database');
  }

  return data || [];
};

const fetchBinancePrices = async (symbols: string[]): Promise<BinancePrice[]> => {
  if (symbols.length === 0) return [];
  
  const symbolsQuery = symbols.map(symbol => `${symbol}USDT`).join(',');
  const response = await fetch(
    `https://api.binance.com/api/v3/ticker/price?symbols=["${symbols.map(s => `${s}USDT`).join('","')}"]`
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch prices from Binance');
  }
  
  return response.json();
};

const fetchBinance24hTickers = async (symbols: string[]): Promise<BinanceTicker[]> => {
  if (symbols.length === 0) return [];
  
  const response = await fetch(
    `https://api.binance.com/api/v3/ticker/24hr?symbols=["${symbols.map(s => `${s}USDT`).join('","')}"]`
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch 24h tickers from Binance');
  }
  
  return response.json();
};

const Market = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();

  const { data: coins = [], isLoading: coinsLoading } = useQuery({
    queryKey: ['database-coins'],
    queryFn: fetchCoinsFromDatabase,
  });

  const coinSymbols = coins.map(coin => coin.symbol);

  const { data: prices = [], isLoading: pricesLoading } = useQuery({
    queryKey: ['binance-prices', coinSymbols],
    queryFn: () => fetchBinancePrices(coinSymbols),
    enabled: coinSymbols.length > 0,
    refetchInterval: 1000, // Update every second
  });

  const { data: tickers = [], isLoading: tickersLoading } = useQuery({
    queryKey: ['binance-tickers', coinSymbols],
    queryFn: () => fetchBinance24hTickers(coinSymbols),
    enabled: coinSymbols.length > 0,
    refetchInterval: 5000, // Update every 5 seconds
  });

  // Combine coin data with prices and tickers
  const coinsWithPrices = coins.map(coin => {
    const priceData = prices.find(p => p.symbol === `${coin.symbol}USDT`);
    const tickerData = tickers.find(t => t.symbol === `${coin.symbol}USDT`);
    
    return {
      ...coin,
      current_price: priceData ? parseFloat(priceData.price) : 0,
      price_change_percentage_24h: tickerData ? parseFloat(tickerData.priceChangePercent) : 0,
    };
  });

  const filteredCoins = coinsWithPrices.filter(coin => {
    const matchesSearch = coin.symbol.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === "gainers") {
      return matchesSearch && coin.price_change_percentage_24h > 0;
    } else if (filter === "losers") {
      return matchesSearch && coin.price_change_percentage_24h < 0;
    }
    
    return matchesSearch;
  });

  const handleCoinClick = (coinSymbol: string) => {
    navigate(`/trading/${coinSymbol}`);
  };

  const isLoading = coinsLoading || pricesLoading || tickersLoading;

  return (
    <div className="relative min-h-[100vh] mx-auto max-w-[480px] bg-black overflow-y-hidden">
      <div className="min-h-[100vh] pt-[0px] pb-[63px]">
        <div className="_relative_lq8ol_15 _z-[1]_lq8ol_510">
          <PageHeader title="Markets" />
          {/* Main Content */}
          <div className="_container_lq8ol_465 _mx-auto_lq8ol_1 px-[15px] pb-3">
            {/* Search Section */}
            <div className="_flex_lq8ol_19 _gap-2_lq8ol_43 _items-center_lq8ol_27 _mb-3_lq8ol_512">
              <div className="_flex-auto_lq8ol_192">
                <h1 className="text-lime-500 _text-[20px]_lq8ol_468 font-extrabold">Coins</h1>
                <h1 className="text-lime-500/60 _text-[10px]_lq8ol_131 font-extrabold">Select Coin to Trade</h1>
              </div>
              <label className="input _flex_lq8ol_19 _items-center_lq8ol_27 _gap-2_lq8ol_43 _rounded-full_lq8ol_119 bg-transparent border-lime-500/40">
                <input 
                  type="text" 
                  className="grow max-w-[120px]" 
                  placeholder="Search" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <i className="fi fi-br-search text-lime-500 _leading-[0px]_lq8ol_306 opacity-70"></i>
              </label>
            </div>

            {/* Filter Tabs */}
            <div className="bg-gradient-to-r from-lime-500/80 via-lime-500/70 to-lime-500/40 p-[1px] _rounded-[10px]_lq8ol_56 _my-2_lq8ol_502">
              <div className="_grid_lq8ol_157 _grid-cols-3_lq8ol_161 gap-[3px] bg-black/80 p-[3px] rounded-[9px]">
                <button 
                  className={`text-[14px] font-normal text-center px-2 py-3 rounded-[7px] ${
                    filter === 'all' 
                      ? 'text-black bg-gradient-to-tr from-yellow-300 via-lime-400 to-cyan-400' 
                      : 'text-white'
                  }`}
                  onClick={() => setFilter('all')}
                >
                  All Coins
                </button>
                <button 
                  className={`text-[14px] font-normal text-center px-2 py-3 rounded-[7px] ${
                    filter === 'gainers' 
                      ? 'text-black bg-gradient-to-tr from-yellow-300 via-lime-400 to-cyan-400' 
                      : 'text-white'
                  }`}
                  onClick={() => setFilter('gainers')}
                >
                  Gainers
                </button>
                <button 
                  className={`text-[14px] font-normal text-center px-2 py-3 rounded-[7px] ${
                    filter === 'losers' 
                      ? 'text-black bg-gradient-to-tr from-yellow-300 via-lime-400 to-cyan-400' 
                      : 'text-white'
                  }`}
                  onClick={() => setFilter('losers')}
                >
                  Losers
                </button>
              </div>
            </div>

            {/* Coins List */}
            <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="text-white">Loading market data...</div>
                </div>
              ) : (
                <div className="_grid_lq8ol_157 _gap-3_lq8ol_180">
                  {filteredCoins.map((coin) => (
                    <div 
                      key={coin.id} 
                      className="flex items-center gap-3 border-b border-gray-700/60 py-3 cursor-pointer hover:bg-gray-800/30 transition-colors"
                      onClick={() => handleCoinClick(coin.symbol)}
                    >
                      <img 
                        className="w-[40px] h-[40px] rounded-[50%] border-t-[2px] border-gray-200 bg-white shadow-sm shadow-lime-500" 
                        src={coin.image_url || `/assets/default-hiMwPs0P.png${coin.symbol.charAt(0)}`}
                        alt={coin.symbol}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `/assets/default-hiMwPs0P.png${coin.symbol.charAt(0)}`;
                        }}
                      />
                      <div className="flex-auto">
                        <h1 className="text-[16px] font-bold text-white">
                          {coin.symbol}
                          <span className="text-gray-300 text-[14px] font-normal">/USDT</span>
                        </h1>
                        <h1 className="text-[11px] text-gray-500">{coin.symbol}/TetherUS</h1>
                      </div>
                      <div className="text-end">
                        <h1 className="text-[16px] font-bold text-white">
                          ${coin.current_price?.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 6
                          }) || '0.00'}
                        </h1>
                        <h1 className={`text-[11px] ${
                          coin.price_change_percentage_24h >= 0 ? 'text-emerald-500' : 'text-red-500'
                        }`}>
                          {coin.price_change_percentage_24h >= 0 ? '+' : ''}
                          {coin.price_change_percentage_24h?.toFixed(4) || '0.0000'}%
                        </h1>
                      </div>
                    </div>
                  ))}
                  
                  {filteredCoins.length === 0 && !isLoading && (
                    <div className="text-center py-8">
                      <div className="text-gray-400">No coins found</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Bottom Navigation */}
          <BottomNavigation />
        </div>
      </div>
    </div>
  );
};

export default Market;
