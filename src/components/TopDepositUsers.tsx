
import React from 'react';
import { useTopDepositUsers } from '@/hooks/useTopDepositUsers';

const TopDepositUsers = () => {
  const { users, loading, error } = useTopDepositUsers();

  if (loading) {
    return (
      <div className="bg-white/10 p-4 rounded-lg mb-4">
        <h3 className="text-white font-bold text-sm mb-3">Top Depositors</h3>
        <div className="text-gray-300 text-sm">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/10 p-4 rounded-lg mb-4">
        <h3 className="text-white font-bold text-sm mb-3">Top Depositors</h3>
        <div className="text-red-400 text-sm">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white/10 p-4 rounded-lg mb-4">
      <h3 className="text-white font-bold text-sm mb-3">🏆 Top Depositors</h3>
      {users.length === 0 ? (
        <div className="text-gray-300 text-sm">No deposit data available</div>
      ) : (
        <div className="space-y-2">
          {users.slice(0, 5).map((user, index) => (
            <div key={user.id} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-lime-500 flex items-center justify-center text-xs font-bold text-black">
                  {index + 1}
                </div>
                <div>
                  <div className="text-white text-sm font-medium">
                    {user.username}
                  </div>
                  {user.full_name && (
                    <div className="text-gray-400 text-xs">
                      {user.full_name}
                    </div>
                  )}
                </div>
              </div>
              <div className="text-lime-400 text-sm font-bold">
                {user.total_deposits.toFixed(2)} USDT
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TopDepositUsers;
