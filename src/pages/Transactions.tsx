
import React from 'react';
import BottomNavigation from '../components/BottomNavigation';
import PageHeader from '../components/PageHeader';
import CustomPagination from '../components/CustomPagination';
import { useTransactions } from '../hooks/useTransactions';

const Transactions = () => {
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
    onGoToPage,
    currencySymbol
  } = useTransactions();

  // Filter out transfer, deposit, and withdrawal transactions, and only show successful ones
  const filteredTransactions = transactions.filter(transaction => 
    !['transfer', 'deposit', 'withdrawal', 'withdraw'].includes(transaction.type) &&
    (transaction.status === 'completed' || transaction.status === 'complete' || transaction.status === 'success' || transaction.status === 'SUCCESS')
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'complete':
      case 'success':
        return 'text-emerald-500';
      case 'pending':
        return 'text-yellow-500';
      case 'failed':
      case 'reject':
      case 'rejected':
        return 'text-rose-500';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    return 'fi-ss-bullet';
  };

  function renderSkeletonRows() {
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
  }

  return (
    <div className="relative min-h-[100vh] bg-black mx-auto max-w-[480px] overflow-y-hidden">
      <div className="min-h-[100vh] pt-[0px] pb-[63px]">
        <div className="relative z-[1]">
          <PageHeader title="Transactions" />

          <div className="container mx-auto px-[8px] pb-[40px] py-3 rounded-t-[20px] overflow-y-auto h-[calc(100vh-200px)]">
            <div className="relative overflow-x-auto">
              <table className="w-full text-sm text-left rtl:text-right text-gray-300 dark:text-gray-400">
                <thead className="text-[10px] text-gray-400">
                  <tr>
                    <th scope="col" className="px-2 pt-1 pb-0">Details & Time</th>
                    <th scope="col" className="px-2 pt-1 pb-0 text-end">Amount & Status</th>
                  </tr>
                </thead>
              </table>
            </div>
            
            <div className="infinite-scroll-component__outerdiv">
              <div className="infinite-scroll-component flex flex-col w-full text-sm text-left text-gray-300 dark:text-gray-400" style={{height: 'auto', overflow: 'auto'}}>
                {loading ? (
                  renderSkeletonRows()
                ) : filteredTransactions.length === 0 ? (
                  <div className="text-center text-gray-400 py-8">No transactions found</div>
                ) : (
                  filteredTransactions.map((transaction) => {
                    const displayData = formatTransactionDisplay(transaction);
                    
                    return (
                      <div key={transaction.id} className="flex justify-between border-b border-gray-700 max-w-[100%]">
                        <div className="px-2 pt-1 pb-2 font-medium text-gray-300">
                          <span className="font-medium text-[13px] text-gray-300">
                            {displayData.displayText}
                          </span>
                          <h1 className="text-[10px] text-gray-300/90">
                            {formatDate(transaction.created_at)}
                          </h1>
                        </div>
                        <div className="px-2 pt-1 pb-2 text-end">
                          <h1 className="font-medium whitespace-nowrap text-[13px] text-gray-300">
                            {displayData.amountText}
                          </h1>
                          <div className="flex justify-end items-center gap-[1px]">
                            <i className={`${getStatusIcon(transaction.status)} ${getStatusColor(transaction.status)} leading-[0px]`}></i>
                            <h1 className="text-[10px] text-gray-300/90">Successful</h1>
                          </div>
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
            hasTransactions={filteredTransactions.length > 0}
          />

          
        </div>
      </div>
    </div>
  );
};

export default Transactions;
