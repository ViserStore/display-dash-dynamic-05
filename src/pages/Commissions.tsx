import React from 'react';
import BottomNavigation from '../components/BottomNavigation';
import PageHeader from '../components/PageHeader';
import CustomPagination from '../components/CustomPagination';
import { useTransactions } from '../hooks/useTransactions';

const Commissions = () => {
  const { 
    transactions, 
    loading, 
    formatTransactionDisplay, 
    currentPage, 
    totalPages, 
    hasNextPage, 
    hasPreviousPage, 
    onNextPage, 
    onPreviousPage,
    onGoToPage
  } = useTransactions();

  // Filter transactions to only show commission-related ones, EXCLUDING referral_bonus
  const commissionTransactions = transactions.filter(transaction => 
    transaction.type === 'commission' && 
    !transaction.description?.toLowerCase().includes('referral bonus for referring')
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  // Loading skeleton rows
  const renderSkeletonRows = () => {
    return Array.from({ length: 10 }, (_, index) => (
      <div key={index} className="flex justify-between w-100 animate-pulse w-100 border-b border-gray-700">
        <div className="!pt-[13px] !pb-[13px]">
          <div className="h-3.5 bg-gray-600 rounded-[5px] ms-2 w-20 mb-2.5"></div>
          <div className="w-24 h-2 bg-gray-700 rounded-[5px] ms-2"></div>
        </div>
        <div className="px-2 !pt-[13px] !pb-[13px] grid justify-items-end">
          <div className="h-3.5 bg-gray-600 rounded-[5px] ms-2 w-20 mb-2.5"></div>
          <div className="w-14 h-2 bg-gray-700 rounded-[5px] ms-2"></div>
        </div>
      </div>
    ));
  };

  return (
    <div className="relative min-h-[100vh] bg-black mx-auto max-w-[480px] overflow-y-hidden">
      <div className="min-h-[100vh] pt-[0px] pb-[63px]">
        <div className="relative z-[1]">
          <PageHeader title="Commissions" />

          <div className="container mx-auto px-[8px] pb-[40px] py-3 rounded-t-[20px] overflow-y-auto h-[calc(100vh-200px)]">
            <div className="relative overflow-x-auto">
              <table className="w-full text-sm text-left rtl:text-right text-gray-300 dark:text-gray-400">
                <thead className="text-[10px] text-gray-400">
                  <tr>
                    <th scope="col" className="px-2 pt-1 pb-0">Commission Details & Time</th>
                    <th scope="col" className="px-2 pt-1 pb-0 text-end">Amount & Status</th>
                  </tr>
                </thead>
              </table>
            </div>
            
            <div className="infinite-scroll-component__outerdiv">
              <div className="infinite-scroll-component flex flex-col w-full text-sm text-left text-gray-300 dark:text-gray-400" style={{height: 'auto', overflow: 'auto'}}>
                {loading ? (
                  renderSkeletonRows()
                ) : commissionTransactions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full py-8">
                    <h1 className="text-white/50 text-[16px] font-bold text-nowrap">No Commissions Found</h1>
                  </div>
                ) : (
                  commissionTransactions.map((transaction) => {
                    const displayData = formatTransactionDisplay(transaction);
                    
                    return (
                      <div key={transaction.id} className="flex justify-between border-b border-gray-700 max-w-[100%]">
                        <div className="px-2 pt-1 pb-2 font-medium text-gray-300">
                          <span className="font-medium text-gray-300">
                            {displayData.displayText}
                          </span>
                          <h1 className="text-[10px] text-gray-300/90">
                            {formatDate(transaction.created_at)}
                          </h1>
                        </div>
                        <div className="px-2 pt-1 pb-2 text-end">
                          <h1 className={`font-medium whitespace-nowrap ${displayData.statusColor}`}>
                            {displayData.amountText}
                          </h1>
                          <h1 className="text-[10px] text-gray-300/90">
                            {displayData.statusText}
                          </h1>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <CustomPagination
            currentPage={currentPage}
            totalPages={totalPages}
            hasNextPage={hasNextPage}
            hasPreviousPage={hasPreviousPage}
            onNextPage={onNextPage}
            onPreviousPage={onPreviousPage}
            onGoToPage={onGoToPage}
            hasTransactions={commissionTransactions.length > 0}
          />

          
        </div>
      </div>
    </div>
  );
};

export default Commissions;
