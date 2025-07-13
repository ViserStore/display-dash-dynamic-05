
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import AdminLayout from '@/components/admin/AdminLayout';
import CoinFormModal from '@/components/admin/CoinFormModal';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Coin {
  id: number;
  symbol: string;
  image_url: string;
  profit_loss: number;
  status: string;
  created_at: string;
}

const AdminCoins = () => {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCoin, setSelectedCoin] = useState<Coin | null>(null);

  useEffect(() => {
    fetchCoins();
    
    // Set up real-time subscription for coins
    const channel = supabase
      .channel('admin-coins-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'coins'
        },
        (payload) => {
          console.log('Real-time coin change:', payload);
          handleRealTimeUpdate(payload);
        }
      )
      .subscribe((status) => {
        console.log('Coins subscription status:', status);
      });

    return () => {
      console.log('Cleaning up coins subscription');
      supabase.removeChannel(channel);
    };
  }, []);

  const handleRealTimeUpdate = (payload: any) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    
    setCoins(prevCoins => {
      switch (eventType) {
        case 'INSERT':
          console.log('Adding new coin:', newRecord);
          return [newRecord, ...prevCoins];
        case 'UPDATE':
          console.log('Updating coin:', newRecord);
          return prevCoins.map(coin => 
            coin.id === newRecord.id ? { ...newRecord } : coin
          );
        case 'DELETE':
          console.log('Removing coin:', oldRecord);
          return prevCoins.filter(coin => coin.id !== oldRecord.id);
        default:
          return prevCoins;
      }
    });
  };

  const fetchCoins = async () => {
    try {
      setLoading(true);
      console.log('Fetching coins from database...');
      
      const { data, error } = await supabase
        .from('coins')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching coins:', error);
        // Don't throw error for empty results, just show empty state
        if (error.code === 'PGRST116') {
          console.log('No coins found in database');
          setCoins([]);
          return;
        }
        throw error;
      }
      
      console.log('Fetched coins:', data);
      setCoins(data || []);
    } catch (error) {
      console.error('Error fetching coins:', error);
      toast.error('Failed to fetch coins. Please check if the coins table exists.');
      setCoins([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleAddCoin = () => {
    console.log('Opening modal for new coin');
    setSelectedCoin(null);
    setIsModalOpen(true);
  };

  const handleEditCoin = (coin: Coin) => {
    console.log('Opening modal for editing coin:', coin);
    setSelectedCoin({
      id: coin.id,
      symbol: coin.symbol,
      image_url: coin.image_url || '',
      profit_loss: coin.profit_loss || 0,
      status: coin.status || 'active',
      created_at: coin.created_at
    });
    setIsModalOpen(true);
  };

  const handleDeleteCoin = async (coinId: number) => {
    if (!confirm('Are you sure you want to delete this coin?')) {
      return;
    }

    try {
      console.log('Deleting coin:', coinId);
      const { error } = await supabase
        .from('coins')
        .delete()
        .eq('id', coinId);

      if (error) {
        console.error('Error deleting coin:', error);
        throw error;
      }
      
      console.log('Coin deleted successfully');
      toast.success('Coin deleted successfully');
    } catch (error) {
      console.error('Error deleting coin:', error);
      toast.error('Failed to delete coin');
    }
  };

  const handleCoinSaved = () => {
    console.log('Coin saved, closing modal');
    setIsModalOpen(false);
    setSelectedCoin(null);
  };

  const handleModalClose = () => {
    console.log('Closing modal');
    setIsModalOpen(false);
    setSelectedCoin(null);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex flex-col justify-center items-center h-[calc(100vh-150px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
          <p className="mt-4 text-rose-500">Loading coins...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mx-[8px] mt-2">
        <div className="flex justify-between items-center rounded-lg text-white bg-rose-600 shadow-md shadow-rose-700/50 p-4 mb-6">
          <div className="flex items-center">
            <i className="fi fi-sr-coins leading-[0px] text-xl"></i>
            <h1 className="text-lg font-bold ps-3">Manage Coins</h1>
          </div>
          <Button 
            onClick={handleAddCoin}
            className="flex items-center gap-2 bg-white hover:bg-rose-50 text-rose-500 rounded-lg px-4 py-2"
          >
            <Plus size={16} />
            Add Coin
          </Button>
        </div>
        
        <div className="bg-white shadow-md border border-rose-200 rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-rose-50">
                <TableHead className="text-rose-700 font-bold">SL.</TableHead>
                <TableHead className="text-rose-700 font-bold">Name</TableHead>
                <TableHead className="text-rose-700 font-bold">Symbol</TableHead>
                <TableHead className="text-rose-700 font-bold">Image</TableHead>
                <TableHead className="text-rose-700 font-bold">Profit/Loss (%)</TableHead>
                <TableHead className="text-rose-700 font-bold">Status</TableHead>
                <TableHead className="text-rose-700 font-bold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coins.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-rose-500 py-8">
                    <div className="flex flex-col items-center gap-2">
                      <p>No coins found in the database.</p>
                      <p className="text-sm text-gray-500">Click "Add Coin" to create your first coin or run the SQL migrations to populate sample data.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                coins.map((coin, index) => (
                  <TableRow key={coin.id} className="hover:bg-rose-50/50">
                    <TableCell className="font-medium text-rose-600">{index + 1}</TableCell>
                    <TableCell className="text-rose-600 font-semibold">{coin.symbol}</TableCell>
                    <TableCell className="text-rose-600 font-bold">{coin.symbol}</TableCell>
                    <TableCell>
                      <img 
                        className="w-10 h-10 rounded-full object-cover border border-rose-200" 
                        src={coin.image_url || '/assets/default-hiMwPs0P.png'} 
                        alt={coin.symbol}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/assets/default-hiMwPs0P.png';
                        }}
                      />
                    </TableCell>
                    <TableCell className="font-semibold text-rose-600">{coin.profit_loss}%</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        coin.status === 'active' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {coin.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleEditCoin(coin)}
                          className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1 text-sm rounded-md"
                          size="sm"
                        >
                          <Edit size={14} className="mr-1" />
                          Edit
                        </Button>
                        <Button
                          onClick={() => handleDeleteCoin(coin.id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 text-sm rounded-md"
                          size="sm"
                        >
                          <Trash2 size={14} className="mr-1" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <CoinFormModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        coin={selectedCoin}
        onCoinSaved={handleCoinSaved}
      />
    </AdminLayout>
  );
};

export default AdminCoins;
