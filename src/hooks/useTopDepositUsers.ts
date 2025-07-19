
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
        .select('user_id, amount')
        .eq('status', 'complete');

      console.log('Deposits query result:', { depositsData, depositsError });

      if (depositsError) {
        console.error('Error fetching deposits:', depositsError);
        if (depositsError.code === 'PGRST200' || depositsError.message?.includes('relationship')) {
          setError('Database fetch error');
        } else {
          setError('Failed to fetch deposit data');
        }
        return;
      }

      if (!depositsData || depositsData.length === 0) {
        console.log('No completed deposits found');
        setUsers([]);
        setError(null);
        return;
      }

      // Group deposits by user and calculate totals
      const userDeposits = new Map<string, {
        total: number;
      }>();

      depositsData.forEach((deposit) => {
        const userId = deposit.user_id;
        const amount = parseFloat(deposit.amount.toString());
        
        if (userDeposits.has(userId)) {
          userDeposits.get(userId)!.total += amount;
        } else {
          userDeposits.set(userId, {
            total: amount
          });
        }
      });

      // Get user details for users who have deposits
      const userIds = Array.from(userDeposits.keys());
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, username, full_name')
        .in('id', userIds);

      if (usersError) {
        console.error('Error fetching users:', usersError);
        setError('Failed to fetch user data');
        return;
      }

      if (!usersData || usersData.length === 0) {
        console.log('No users found for deposits');
        setUsers([]);
        setError(null);
        return;
      }

      // Convert to array and sort by total deposits
      const sortedUsers = usersData
        .map((user) => ({
          id: user.id,
          username: user.username || 'Unknown',
          full_name: user.full_name,
          total_deposits: userDeposits.get(user.id)?.total || 0,
          rank: 0
        }))
        .filter(user => user.total_deposits > 0)
        .sort((a, b) => b.total_deposits - a.total_deposits)
        .slice(0, 20) // Top 20 users only
        .map((user, index) => ({
          ...user,
          rank: index + 1
        }));

      console.log('Sorted top users:', sortedUsers);
      setUsers(sortedUsers);
      setError(null);
    } catch (error: any) {
      console.error('Error fetching top deposit users:', error);
      if (error?.code === 'PGRST200' || error?.message?.includes('relationship')) {
        setError('Database fetch error');
      } else {
        setError('Failed to fetch top deposit users');
      }
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
