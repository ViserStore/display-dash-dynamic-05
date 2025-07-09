
import React from 'react';
import BottomNavigation from '../components/BottomNavigation';
import PageHeader from '../components/PageHeader';
import CustomPagination from '../components/CustomPagination';
import { useTransactions } from '../hooks/useTransactions';

const TransferLogs = () => {
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
    siteCurrency
  } = useTransactions();

  // Filter transactions to only show transfers
  const transferTransactions = transactions.filter(transaction => transaction.type === 'transfer');

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

  // Format transfer transaction specifically for transfer logs
  const formatTransferTransaction = (transaction: any) => {
    let transferDescription = '';
    let charge = '';
    let amountText = '';
    let statusText = 'Successful';
    
    try {
      // Try to parse description as JSON for transfer details
      if (transaction.description) {
        const desc = JSON.parse(transaction.description);
        if (desc.receiver_username) {
          // This is a sent transfer (negative amount)
          transferDescription = `Send money to ${desc.receiver_username}`;
          amountText = `${Math.abs(transaction.amount).toFixed(2)} ${siteCurrency}`;
          if (desc.charge) {
            charge = `${desc.charge.toFixed(2)} ${siteCurrency}`;
          }
        } else if (desc.sender_username) {
          // This is a received transfer (should be positive)
          transferDescription = `Received money from ${desc.sender_username}`;
          amountText = `${Math.abs(transaction.amount).toFixed(2)} ${siteCurrency}`;
        }
      }
    } catch (e) {
      // If not JSON, determine if it's sent or received based on amount
      if (transaction.amount < 0) {
        transferDescription = 'Send money';
        amountText = `${Math.abs(transaction.amount).toFixed(2)} ${siteCurrency}`;
      } else {
        transferDescription = 'Received money';
        amountText = `${Math.abs(transaction.amount).toFixed(2)} ${siteCurrency}`;
      }
    }

    return {
      transferDescription,
      amountText,
      charge,
      statusText
    };
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
          <PageHeader title="Transfer Logs" />

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
                ) : transferTransactions.length === 0 ? (
                  <div className="text-center text-gray-400 py-8">No transfer logs found</div>
                ) : (
                  transferTransactions.map((transaction) => {
                    const transferData = formatTransferTransaction(transaction);

                    return (
                      <div key={transaction.id} className="flex justify-between border-b border-gray-700 max-w-[100%]">
                        <div className="px-2 pt-1 pb-2 font-medium text-gray-300">
                          <span className="font-medium text-gray-300">
                            {transferData.transferDescription}
                          </span>
                          <h1 className="text-[10px] text-gray-300/90">
                            {formatDate(transaction.created_at)}
                          </h1>
                        </div>
                        <div className="px-2 pt-1 pb-2 text-end">
                          <h1 className="font-medium whitespace-nowrap text-gray-300">
                            {transferData.amountText}
                          </h1>
                          <div className="flex justify-end items-center gap-[1px]">
                            {transferData.charge ? (
                              <>
                                <i className="fi fi-ss-bullet text-yellow-500 leading-[0px]"></i>
                                <h1 className="text-[10px] text-gray-300/90">Charge: {transferData.charge}</h1>
                              </>
                            ) : (
                              <>
                                <i className="fi fi-ss-bullet text-green-500 leading-[0px]"></i>
                                <h1 className="text-[10px] text-gray-300/90">{transferData.statusText}</h1>
                              </>
                            )}
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
            hasTransactions={transferTransactions.length > 0}
          />

          
        </div>
      </div>
    </div>
  );
};

export default TransferLogs;
