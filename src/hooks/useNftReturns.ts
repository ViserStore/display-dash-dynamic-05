
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useNftReturns = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: nftReturns, isLoading } = useQuery({
    queryKey: ['nft-returns', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('type', 'nft_return')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  const processNftReturns = async () => {
    try {
      const { data, error } = await supabase.rpc('process_nft_returns');
      if (error) throw error;
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['nft-investments'] });
      queryClient.invalidateQueries({ queryKey: ['nft-returns'] });
      queryClient.invalidateQueries({ queryKey: ['user-balance'] });
      
      return data;
    } catch (error) {
      console.error('Error processing NFT returns:', error);
      throw error;
    }
  };

  return {
    nftReturns,
    isLoading,
    processNftReturns
  };
};
