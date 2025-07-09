import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../integrations/supabase/client';

interface UnifiedTransaction {
  id: string;
  type: string;
  amount: number;
  status: string;
  description: string | null;
  created_at: string;
  source_table: string;
}

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<UnifiedTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [currencySymbol, setCurrencySymbol] = useState('$');
  const [siteCurrency, setSiteCurrency] = useState('USDT');
  const { user } = useAuth();
  const itemsPerPage = 10;

  useEffect(() => {
    if (user) {
      fetchCurrencySettings();
      fetchAllTransactions();
    }
  }, [user, currentPage]);

  const fetchCurrencySettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('currency_symbol, site_currency')
        .single();

      if (error) throw error;
      if (data?.currency_symbol) {
        setCurrencySymbol(data.currency_symbol);
      }
      if (data?.site_currency) {
        setSiteCurrency(data.site_currency);
      }
    } catch (error) {
      console.error('Error fetching currency settings:', error);
    }
  };

  const fetchAllTransactions = async () => {
    try {
      setLoading(true);
      
      console.log('Fetching all transactions for user:', user?.id);
      
      const allTransactions: UnifiedTransaction[] = [];

      // Fetch from transactions table - EXCLUDE referral_bonus type
      const { data: transactionData, error: transactionError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user?.id)
        .neq('type', 'referral_bonus') // Filter out referral bonus transactions
        .order('created_at', { ascending: false });

      if (transactionError) {
        console.error('Error fetching transactions:', transactionError);
      } else if (transactionData) {
        console.log('Found transactions:', transactionData.length);
        transactionData.forEach(tx => {
          allTransactions.push({
            id: tx.id,
            type: tx.type,
            amount: tx.amount,
            status: tx.status,
            description: tx.description,
            created_at: tx.created_at,
            source_table: 'transactions'
          });
        });
      }

      // Fetch from deposits table - get ALL deposits regardless of status
      const { data: depositData, error: depositError } = await supabase
        .from('deposits')
        .select('id, amount, status, created_at, transaction_id')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (depositError) {
        console.error('Error fetching deposits:', depositError);
      } else if (depositData) {
        console.log('Found deposits:', depositData.length);
        depositData.forEach(deposit => {
          allTransactions.push({
            id: deposit.id,
            type: 'deposit',
            amount: deposit.amount,
            status: deposit.status,
            description: `Deposit - Transaction ID: ${deposit.transaction_id}`,
            created_at: deposit.created_at,
            source_table: 'deposits'
          });
        });
      }

      // Fetch from withdrawals table - get ALL withdrawals regardless of status
      const { data: withdrawalData, error: withdrawalError } = await supabase
        .from('withdrawals')
        .select('id, amount, status, created_at, payment_address')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (withdrawalError) {
        console.error('Error fetching withdrawals:', withdrawalError);
      } else if (withdrawalData) {
        console.log('Found withdrawals:', withdrawalData.length);
        withdrawalData.forEach(withdrawal => {
          allTransactions.push({
            id: withdrawal.id,
            type: 'withdrawal',
            amount: withdrawal.amount,
            status: withdrawal.status,
            description: `Withdrawal to ${withdrawal.payment_address}`,
            created_at: withdrawal.created_at,
            source_table: 'withdrawals'
          });
        });
      }

      // Fetch from trade_transactions table
      const { data: tradeData, error: tradeError } = await supabase
        .from('trade_transactions')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (tradeError) {
        console.error('Error fetching trade transactions:', tradeError);
      } else if (tradeData) {
        console.log('Found trade transactions:', tradeData.length);
        tradeData.forEach(trade => {
          allTransactions.push({
            id: trade.id,
            type: 'trade',
            amount: trade.profit_loss || trade.amount,
            status: trade.status,
            description: `${trade.action} ${trade.trade_type} ${trade.symbol} at $${trade.price}`,
            created_at: trade.created_at,
            source_table: 'trade_transactions'
          });
        });
      }

      // Sort all transactions by created_at descending
      allTransactions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      console.log('Total transactions found:', allTransactions.length);
      console.log('Transaction types:', allTransactions.map(t => t.type));
      console.log('Sample transactions:', allTransactions.slice(0, 5));
      
      // Calculate pagination
      const totalTransactions = allTransactions.length;
      const calculatedTotalPages = Math.ceil(totalTransactions / itemsPerPage);
      setTotalPages(calculatedTotalPages);
      
      // Get transactions for current page
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedTransactions = allTransactions.slice(startIndex, endIndex);
      
      setTransactions(paginatedTransactions);
    } catch (error) {
      console.error('Error fetching all transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTransactionDisplay = (transaction: UnifiedTransaction) => {
    const date = new Date(transaction.created_at).toLocaleString();
    let displayText = '';
    let amountText = '';
    let statusColor = 'text-emerald-500';

    console.log('Formatting transaction:', transaction.type, transaction.amount, transaction.status);

    switch (transaction.type) {
      case 'deposit':
        displayText = `Deposit | ${transaction.description || 'Bank Transfer'}`;
        amountText = `+${Math.abs(transaction.amount).toFixed(2)} ${siteCurrency}`;
        break;
      case 'withdrawal':
      case 'withdraw':
        displayText = `Withdrawal | ${transaction.description || 'Bank Transfer'}`;
        amountText = `-${Math.abs(transaction.amount).toFixed(2)} ${siteCurrency}`;
        break;
      case 'transfer':
        // Parse transfer description if it's JSON
        let transferDescription = 'Money Transfer';
        try {
          if (transaction.description) {
            const desc = JSON.parse(transaction.description);
            if (desc.receiver_username) {
              transferDescription = `Send money to ${desc.receiver_username}`;
            } else if (desc.sender_username) {
              transferDescription = `Received money from ${desc.sender_username}`;
            }
          }
        } catch (e) {
          // If not JSON, use as is or default
          transferDescription = transaction.description || 'Money Transfer';
        }
        displayText = `Transfer | ${transferDescription}`;
        amountText = `-${Math.abs(transaction.amount).toFixed(2)} ${siteCurrency}`;
        break;
      case 'trade':
        displayText = transaction.description || 'Trade Transaction';
        amountText = `${transaction.amount >= 0 ? '+' : ''}${transaction.amount.toFixed(2)} ${siteCurrency}`;
        break;
      case 'commission':
        displayText = `Commission | ${transaction.description || 'Referral Bonus'}`;
        amountText = `+${Math.abs(transaction.amount).toFixed(2)} ${siteCurrency}`;
        break;
      case 'nft_investment':
        displayText = `NFT Investment | ${transaction.description || 'NFT Purchase'}`;
        amountText = `-${Math.abs(transaction.amount).toFixed(2)} ${siteCurrency}`;
        break;
      case 'admin_credit':
        displayText = `Admin Credit | ${transaction.description || 'Account Adjustment'}`;
        amountText = `${transaction.amount >= 0 ? '+' : ''}${transaction.amount.toFixed(2)} ${siteCurrency}`;
        break;
      default:
        displayText = transaction.description || transaction.type;
        amountText = `${transaction.amount >= 0 ? '+' : ''}${transaction.amount.toFixed(2)} ${siteCurrency}`;
    }

    // Set status color based on transaction status
    if (transaction.status === 'pending') {
      statusColor = 'text-yellow-500';
    } else if (transaction.status === 'failed' || transaction.status === 'FAILED') {
      statusColor = 'text-red-500';
    } else if (transaction.status === 'completed' || transaction.status === 'SUCCESS' || transaction.status === 'complete') {
      statusColor = 'text-emerald-500';
    }

    console.log('Formatted display:', { displayText, amountText, statusColor });

    return {
      displayText,
      amountText,
      statusColor,
      date,
      statusText: transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1).toLowerCase(),
      sourceTable: transaction.source_table
    };
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return {
    transactions,
    loading,
    formatTransactionDisplay,
    refetch: fetchAllTransactions,
    currentPage,
    totalPages,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
    onNextPage: goToNextPage,
    onPreviousPage: goToPreviousPage,
    onGoToPage: goToPage,
    currencySymbol,
    siteCurrency
  };
};
