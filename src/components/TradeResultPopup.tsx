
import { useEffect, useState } from 'react';
import { Dialog, DialogContent } from './ui/dialog';

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
}

interface TradeResultPopupProps {
  isOpen: boolean;
  onClose: () => void;
  tradeResult: TradeResult | null;
}

const TradeResultPopup = ({ isOpen, onClose, tradeResult }: TradeResultPopupProps) => {
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    if (isOpen && tradeResult) {
      const isWin = tradeResult.result === 'WIN' || tradeResult.win_loss === 'win' || tradeResult.trade_status === 'PROFIT';
      if (isWin) {
        setShowAnimation(true);
        const timer = setTimeout(() => setShowAnimation(false), 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [isOpen, tradeResult]);

  if (!tradeResult) return null;

  // Determine if trade is a win - check multiple fields for compatibility
  const isWin = tradeResult.result === 'WIN' || 
                tradeResult.win_loss === 'win' || 
                tradeResult.trade_status === 'PROFIT' ||
                (tradeResult.profitLoss || tradeResult.profit || 0) > 0;

  const profitAmount = Math.abs(tradeResult.profitLoss || tradeResult.profit || 0);
  const resultText = isWin ? 'WIN' : 'LOSE';
  const resultColor = isWin ? 'text-emerald-400' : 'text-rose-400';
  const bgColor = isWin ? 'bg-emerald-500/20 border-emerald-500/40' : 'bg-rose-500/20 border-rose-500/40';
  const buttonColor = isWin ? 'bg-emerald-600/40 hover:bg-emerald-600/60 border-emerald-500/20' : 'bg-rose-600/40 hover:bg-rose-600/60 border-rose-500/20';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xs mx-auto bg-gray-900/95 backdrop-blur-xl border border-gray-700/30 text-white rounded-xl shadow-2xl p-4">
        <div className="space-y-4">
          {/* Result Status - Compact */}
          <div className="text-center space-y-2">
            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl border ${bgColor} ${resultColor} ${showAnimation ? 'animate-pulse' : ''}`}>
              <span className="text-lg font-bold">
                {isWin ? '✓' : '✗'}
              </span>
            </div>
            <div className={`text-lg font-bold ${resultColor}`}>
              {resultText}
            </div>
          </div>

          {/* Trade Info - Compact */}
          <div className="bg-gray-800/20 rounded-lg p-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">{tradeResult.symbol}</span>
              <span className={`px-2 py-0.5 rounded text-xs ${
                tradeResult.trade_type === 'BUY' 
                  ? 'bg-emerald-500/20 text-emerald-400' 
                  : 'bg-rose-500/20 text-rose-400'
              }`}>
                {tradeResult.trade_type}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Amount</span>
              <span className="text-white">${tradeResult.amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Open</span>
              <span className="text-white">${tradeResult.openPrice.toFixed(4)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Close</span>
              <span className="text-white">${tradeResult.closePrice.toFixed(4)}</span>
            </div>
          </div>

          {/* Profit/Loss - Compact */}
          <div className="text-center">
            <div className={`text-2xl font-bold ${resultColor}`}>
              {isWin ? '+' : '-'}${profitAmount.toFixed(2)}
            </div>
          </div>

          {/* Close Button - Compact */}
          <button
            onClick={onClose}
            className={`w-full py-2 rounded-lg font-medium text-white transition-all backdrop-blur-sm border ${buttonColor}`}
          >
            Continue
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TradeResultPopup;
