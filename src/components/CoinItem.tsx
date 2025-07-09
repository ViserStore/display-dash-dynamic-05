
import React from 'react';

interface CoinItemProps {
  coin: {
    id: number;
    symbol: string;
    image_url: string | null;
    status: string;
  };
  price?: number;
  change?: number;
  fullName?: string;
  isSelected?: boolean;
  onClick: () => void;
}

const CoinItem: React.FC<CoinItemProps> = ({ 
  coin, 
  price = 0, 
  change = 0, 
  fullName,
  isSelected = false,
  onClick 
}) => {
  const changeColor = change >= 0 ? 'text-green-400' : 'text-red-400';
  const changeSign = change >= 0 ? '+' : '';

  return (
    <div 
      className="flex items-center gap-3 border-b border-gray-700/30 py-2.5 cursor-pointer hover:bg-gray-800/40 px-2 rounded-lg transition-all duration-200 mx-1"
      onClick={onClick}
    >
      <div className="relative">
        <img 
          className="w-8 h-8 rounded-full border border-gray-600/50 bg-white shadow-sm"
          src={coin.image_url || `/assets/default-hiMwPs0P.png?text=${coin.symbol.charAt(0)}`}
          alt={coin.symbol}
        />
        {isSelected && (
          <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border border-gray-900"></div>
        )}
      </div>
      <div className="flex-auto min-w-0">
        <h1 className="text-sm font-semibold text-white flex items-center">
          {coin.symbol}
          <span className="text-gray-400 text-xs font-normal ml-1">/USDT</span>
        </h1>
        <h1 className="text-xs text-gray-500 truncate">
          {fullName || coin.symbol}
        </h1>
      </div>
      <div className="text-right flex-shrink-0">
        <h1 className="text-sm font-semibold text-white">
          ${price.toLocaleString()}
        </h1>
        <h1 className={`text-xs font-medium ${changeColor}`}>
          {changeSign}{change.toFixed(1)}%
        </h1>
      </div>
    </div>
  );
};

export default CoinItem;
