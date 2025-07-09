
import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';

interface TopDepositUser {
  id: string;
  username: string;
  full_name: string | null;
  total_deposits: number;
  rank: number;
}

export const useTopDepositUsers = () => {
  const [users, setUsers] = useState<TopDepositUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTopDepositUsers = async () => {
    try {
      setLoading(true);
      
      console.log('Fetching top deposit users...');
      
      // Get all completed deposits with user information
      // Try 'complete' status first (as seen in admin pages)
      const { data: depositsData, error: depositsError } = await supabase
        .from('deposits')
        .select(`
          user_id,
          amount,
          users!inner(
            id,
            username,
            full_name
          )
        `)
        .eq('status', 'complete');

      console.log('Deposits query result:', { depositsData, depositsError });

      if (depositsError) {
        console.error('Error fetching deposits:', depositsError);
        setError('Failed to fetch deposit data');
        return;
      }

      if (!depositsData || depositsData.length === 0) {
        console.log('No completed deposits found, trying to fetch all deposits to check status values...');
        
        // Debug: Check what status values exist
        const { data: allDeposits, error: allError } = await supabase
          .from('deposits')
          .select('status')
          .limit(10);
        
        console.log('Available deposit statuses:', allDeposits?.map(d => d.status));
        
        setUsers([]);
        setError(null);
        return;
      }

      // Group deposits by user and calculate totals
      const userDeposits = new Map<string, {
        user: any;
        total: number;
      }>();

      depositsData.forEach((deposit) => {
        const userId = deposit.user_id;
        const amount = parseFloat(deposit.amount.toString());
        
        if (userDeposits.has(userId)) {
          userDeposits.get(userId)!.total += amount;
        } else {
          userDeposits.set(userId, {
            user: deposit.users,
            total: amount
          });
        }
      });

      // Convert to array and sort by total deposits
      const sortedUsers = Array.from(userDeposits.entries())
        .map(([userId, data]) => ({
          id: userId,
          username: data.user.username || 'Unknown',
          full_name: data.user.full_name,
          total_deposits: data.total,
          rank: 0
        }))
        .sort((a, b) => b.total_deposits - a.total_deposits)
        .slice(0, 20) // Top 20 users only
        .map((user, index) => ({
          ...user,
          rank: index + 1
        }));

      console.log('Sorted top users:', sortedUsers);
      setUsers(sortedUsers);
      setError(null);
    } catch (error) {
      console.error('Error fetching top deposit users:', error);
      setError('Failed to fetch top deposit users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopDepositUsers();
  }, []);

  return {
    users,
    loading,
    error,
    refresh: fetchTopDepositUsers
  };
};
