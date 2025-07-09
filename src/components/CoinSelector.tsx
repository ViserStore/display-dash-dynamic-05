
import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import CoinItem from './CoinItem';

interface Coin {
  id: number;
  symbol: string;
  image_url: string | null;
  status: string;
}

interface CoinSelectorProps {
  coins: Coin[];
  selectedCoin: string;
  onCoinSelect: (symbol: string) => void;
  className?: string;
}

const CoinSelector: React.FC<CoinSelectorProps> = ({
  coins,
  selectedCoin,
  onCoinSelect,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const selectedCoinData = coins.find(coin => coin.symbol === selectedCoin);
  
  const filteredCoins = coins.filter(coin =>
    coin.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCoinSelect = (symbol: string) => {
    onCoinSelect(symbol);
    setIsOpen(false);
    setSearchQuery('');
  };

  // Mock price data for demonstration
  const getCoinData = (symbol: string) => {
    const mockData: { [key: string]: { price: number; change: number; fullName: string } } = {
      'BTC': { price: 63450, change: 2.4, fullName: 'Bitcoin' },
      'ETH': { price: 3380, change: 1.8, fullName: 'Ethereum' },
      'XLM': { price: 0.133, change: -0.5, fullName: 'Stellar' },
      'ICP': { price: 12.45, change: 5.2, fullName: 'Internet Computer' },
      'USDT': { price: 1.00, change: 0.0, fullName: 'Tether' },
    };
    return mockData[symbol] || { price: 0, change: 0, fullName: symbol };
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`flex items-center gap-2 bg-gray-800/90 backdrop-blur-sm border border-green-500/30 rounded-2xl px-3 py-2 hover:border-green-400/50 hover:bg-gray-700/90 transition-all duration-200 shadow-sm ${className}`}
      >
        {selectedCoinData?.image_url && (
          <img 
            src={selectedCoinData.image_url || `/assets/default-hiMwPs0P.png?text=${selectedCoin.charAt(0)}`}
            alt={selectedCoin}
            className="w-5 h-5 rounded-full border border-green-500/30"
          />
        )}
        <span className="text-white font-medium text-sm">{selectedCoin}</span>
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-gray-900/95 backdrop-blur-xl rounded-2xl w-full max-w-sm border border-gray-700/50 shadow-2xl">
          <DialogHeader className="pb-2">
            <div className="flex justify-between items-center">
              <DialogTitle className="text-base font-bold text-white">
                Select Token
              </DialogTitle>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-800/50 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            {/* Search Input */}
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search coins..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-800/80 backdrop-blur-sm text-white pl-9 pr-3 py-2.5 rounded-xl border border-gray-700/50 focus:outline-none focus:ring-1 focus:ring-green-500/50 focus:border-green-500/50 text-sm"
                autoFocus
              />
            </div>
          </DialogHeader>

          {/* Coin List */}
          <div className="max-h-[40vh] overflow-y-auto scrollbar-hide">
            {filteredCoins.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 text-sm">No tokens found</div>
                <div className="text-gray-500 text-xs mt-1">Try a different search term</div>
              </div>
            ) : (
              filteredCoins.map((coin) => {
                const coinData = getCoinData(coin.symbol);
                return (
                  <CoinItem
                    key={coin.id}
                    coin={coin}
                    price={coinData.price}
                    change={coinData.change}
                    fullName={coinData.fullName}
                    isSelected={coin.symbol === selectedCoin}
                    onClick={() => handleCoinSelect(coin.symbol)}
                  />
                );
              })
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CoinSelector;
