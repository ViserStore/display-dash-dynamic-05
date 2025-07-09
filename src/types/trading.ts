
export interface Order {
  id: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  amount: number;
  openPrice: number;
  timer: number;
}

export interface LiveOrder extends Order {
  status: 'RUNNING' | 'COMPLETED';
  openTime: Date;
  returnTime?: Date; // Exact time when trade should complete
  timeRemaining: number;
  closePrice?: number;
  result?: 'WIN' | 'LOSE';
  profit?: number;
  closeTime?: Date;
}
