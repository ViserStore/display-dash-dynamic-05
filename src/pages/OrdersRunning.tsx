
import { Link } from "react-router-dom";
import BottomNavigation from "../components/BottomNavigation";
import { usePaginatedTrades } from "../hooks/usePaginatedTrades";
import CustomPagination from "../components/CustomPagination";

const OrdersRunning = () => {
  const { 
    trades: runningTrades, 
    loading, 
    currentPage, 
    totalPages, 
    totalCount,
    hasNextPage,
    hasPreviousPage,
    goToNextPage,
    goToPreviousPage,
    goToPage
  } = usePaginatedTrades(10, 'PENDING');

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
      day: '2-digit',
      month: 'short'
    });
  };

  const formatPrice = (price: number) => {
    return price.toFixed(price < 1 ? 6 : 2);
  };

  const getTimeRemaining = (returnTime: string) => {
    const now = new Date();
    const endTime = new Date(returnTime);
    const diff = endTime.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const minutes = Math.floor(diff / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  function renderSkeletonRows() {
    return (
      <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
        <div className="_grid_lq8ol_157 gap-0 my-3">
          {Array.from({ length: 10 }, (_, index) => (
            <div key={index} className="border-b border-b-slate-400/50 py-2">
              <div className="flex justify-between items-center my-[2px]">
                <h1 className="text-[14px] font-semibold bg-gray-400/50 w-[90px] h-[20px] rounded-[5px] animate-pulse"></h1>
                <h1 className="text-[14px] font-semibold bg-gray-500/50 w-[80px] h-[20px] rounded-[5px] animate-pulse"></h1>
              </div>
              <div className="flex justify-between items-center my-[2px]">
                <h1 className="text-[14px] font-semibold bg-gray-400/50 w-[140px] h-[20px] rounded-[5px] animate-pulse"></h1>
                <h1 className="text-[14px] font-semibold bg-gray-500/50 w-[60px] h-[20px] rounded-[5px] animate-pulse"></h1>
              </div>
              <div className="flex justify-between items-center my-[2px]">
                <h1 className="text-[14px] font-semibold bg-gray-400/50 w-[100px] h-[20px] rounded-[5px] animate-pulse"></h1>
                <h1 className="text-[14px] font-semibold bg-gray-500/50 w-[80px] h-[20px] rounded-[5px] animate-pulse"></h1>
              </div>
              <div className="flex justify-between items-center my-[2px]">
                <h1 className="text-[14px] font-semibold bg-gray-400/50 w-[80px] h-[20px] rounded-[5px] animate-pulse"></h1>
                <h1 className="text-[14px] font-semibold bg-gray-500/50 w-[100px] h-[20px] rounded-[5px] animate-pulse"></h1>
              </div>
              <div className="flex justify-between items-center my-[2px]">
                <h1 className="text-[14px] font-semibold bg-gray-400/50 w-[60px] h-[20px] rounded-[5px] animate-pulse"></h1>
                <h1 className="text-[14px] font-semibold bg-gray-500/50 w-[80px] h-[20px] rounded-[5px] animate-pulse"></h1>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[100vh] mx-auto max-w-[480px] bg-black overflow-y-hidden">
      <div className="min-h-[100vh] pt-[0px] pb-[63px]">
        <div className="_relative_lq8ol_15 _z-[1]_lq8ol_510">
          {/* Header Section */}
          <div className="_relative_lq8ol_15 overflow-hidden mb-[10px]">
            <div className="p-[15px] relative z-[2] rounded-b-[30px]">
              <div className="_flex_lq8ol_19 _gap-3_lq8ol_180 _items-center_lq8ol_27 _justify-between_lq8ol_31">
                <div className="_flex_lq8ol_19 _gap-2_lq8ol_43 _items-center_lq8ol_27 bg-black/20 _border_lq8ol_234 border-gray-500/50 blackdrop-blur _rounded-full_lq8ol_119 px-[20px] h-[48px]">
                  <div>
                    <img className="w-[18px] backBtn cursor-pointer" src="https://cdn-icons-png.flaticon.com/128/507/507257.png" alt="" />
                  </div>
                  <h1 className="_text-white_lq8ol_196 _font-bold_lq8ol_110">Running Orders ({totalCount})</h1>
                </div>
                <div className="_flex_lq8ol_19 _gap-2_lq8ol_43 _items-center_lq8ol_27 bg-black/20 _border_lq8ol_234 border-gray-500/50 blackdrop-blur _rounded-full_lq8ol_119">
                  <img className="w-[48px] h-[48px] _aspect-square_lq8ol_685 _border_lq8ol_234 border-gray-500/50 _rounded-full_lq8ol_119" src="https://img.freepik.com/premium-photo/3d-cartoon-avatar-man-minimal-3d-character_652053-2070.jpg" alt="" />
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="px-[15px] mb-3">
            <div className="bg-gradient-to-r from-lime-500/80 via-lime-500/70 to-lime-500/40 p-[1px] _rounded-[10px]_lq8ol_56">
              <div className="_grid_lq8ol_157 _grid-cols-3_lq8ol_161 gap-[3px] bg-black/80 p-[3px] rounded-[9px]">
                <Link 
                  to="/orders/all" 
                  className="text-[14px] font-normal text-center text-white px-2 py-3 rounded-[7px]"
                >
                  All Orders
                </Link>
                <Link 
                  to="/orders/running" 
                  className="text-[14px] font-normal text-center text-black bg-gradient-to-tr from-yellow-300 via-lime-400 to-cyan-400 px-2 py-3 rounded-[7px]"
                >
                  Running
                </Link>
                <Link 
                  to="/orders/completed" 
                  className="text-[14px] font-normal text-center text-white px-2 py-3 rounded-[7px]"
                >
                  Completed
                </Link>
              </div>
            </div>
          </div>

          {/* Running Orders List */}
          {loading ? (
            renderSkeletonRows()
          ) : (
            <div className="px-[15px] overflow-y-auto max-h-[calc(100vh-250px)]">
              <div className="_grid_lq8ol_157 gap-0 my-3">
                {runningTrades.length === 0 ? (
                  <div className="text-center text-white py-8">
                    <div className="text-gray-400">No running trades</div>
                    <div className="text-sm text-gray-500 mt-2">Start trading to see active orders</div>
                  </div>
                ) : (
                  runningTrades.map((trade) => (
                    <div key={trade.id} className="_border-b_lq8ol_596 border-b-slate-400/50 _py-2_lq8ol_422">
                      <div className="_flex_lq8ol_19 _justify-between_lq8ol_31 _items-center_lq8ol_27">
                        <h1 className="_text-[14px]_lq8ol_407 _font-semibold_lq8ol_73 _text-gray-400_lq8ol_587">Currency</h1>
                        <h1 className="_flex_lq8ol_19 _items-center_lq8ol_27 _gap-1_lq8ol_525 _text-[14px]_lq8ol_407 _font-semibold_lq8ol_73">
                          <i className={`fi ${trade.trade_type === 'BUY' ? 'fi-sr-up text-emerald-500' : 'fi-sr-down text-rose-500'} leading-[0px] text-[12px]`}></i>
                          <span className="_font-medium_lq8ol_260 whitespace-nowrap _text-white_lq8ol_196">{trade.symbol}</span> 
                          <span className="_text-gray-400_lq8ol_587 _text-[12px]_lq8ol_77">/USDT</span>
                        </h1>
                      </div>
                      <div className="_flex_lq8ol_19 _justify-between_lq8ol_31 _items-center_lq8ol_27">
                        <h1 className="_text-[14px]_lq8ol_407 _font-semibold_lq8ol_73 _text-gray-400_lq8ol_587">
                          {trade.trade_type === 'BUY' ? 'Buy' : 'Sell'} Amount(USDT)
                        </h1>
                        <h1 className="_text-[14px]_lq8ol_407 _font-semibold_lq8ol_73 _text-white_lq8ol_196">
                          {trade.amount.toFixed(2)}
                        </h1>
                      </div>
                      <div className="_flex_lq8ol_19 _justify-between_lq8ol_31 _items-center_lq8ol_27">
                        <h1 className="_text-[14px]_lq8ol_407 _font-semibold_lq8ol_73 _text-gray-400_lq8ol_587">Opening Price</h1>
                        <h1 className="_text-[14px]_lq8ol_407 _font-semibold_lq8ol_73 _text-white_lq8ol_196">
                          {formatPrice(trade.buy_price || trade.price)}
                        </h1>
                      </div>
                      {trade.return_time && (
                        <div className="_flex_lq8ol_19 _justify-between_lq8ol_31 _items-center_lq8ol_27">
                          <h1 className="_text-[14px]_lq8ol_407 _font-semibold_lq8ol_73 _text-gray-400_lq8ol_587">Time Remaining</h1>
                          <h1 className="_text-[14px]_lq8ol_407 _font-semibold_lq8ol_73 _text-yellow-400_lq8ol_196">
                            {getTimeRemaining(trade.return_time)}
                          </h1>
                        </div>
                      )}
                      <div className="_flex_lq8ol_19 _justify-between_lq8ol_31 _items-center_lq8ol_27">
                        <h1 className="_text-[14px]_lq8ol_407 _font-semibold_lq8ol_73 _text-gray-400_lq8ol_587">Start Time</h1>
                        <h1 className="_text-[14px]_lq8ol_407 _font-semibold_lq8ol_73 _text-white_lq8ol_196">
                          {formatDateTime(trade.created_at)}
                        </h1>
                      </div>
                      <div className="_flex_lq8ol_19 _justify-between_lq8ol_31 _items-center_lq8ol_27">
                        <h1 className="_text-[14px]_lq8ol_407 _font-semibold_lq8ol_73 _text-gray-400_lq8ol_587">Status</h1>
                        <div className="_text-[14px]_lq8ol_407 _font-semibold_lq8ol_73 _text-white_lq8ol_196">
                          <h1 className="text-[14px] rounded-[5px] text-yellow-500 animate-pulse">
                            RUNNING
                          </h1>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          <CustomPagination
            currentPage={currentPage}
            totalPages={totalPages}
            hasNextPage={hasNextPage}
            hasPreviousPage={hasPreviousPage}
            onNextPage={goToNextPage}
            onPreviousPage={goToPreviousPage}
            onGoToPage={goToPage}
          />
        </div>
      </div>
    </div>
  );
};

export default OrdersRunning;
