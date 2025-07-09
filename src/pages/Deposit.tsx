
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { notify } from '@/utils/notifications';
import BottomNavigation from "../components/BottomNavigation";
import PageHeader from "../components/PageHeader";

const Deposit = () => {
  const navigate = useNavigate();

  // Fetch deposit methods from database
  const { data: depositMethods, error, isLoading } = useQuery({
    queryKey: ['deposit-methods'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deposit_methods')
        .select('*')
        .eq('status', 'active')
        .order('order_priority', { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });

  // Handle error state
  React.useEffect(() => {
    if (error) {
      notify.error('Failed to load deposit methods');
    }
  }, [error]);

  const handleDepositMethodClick = (method: any) => {
    // Navigate to deposit detail page with method ID as route parameter
    navigate(`/deposit/${method.id}`);
  };

  return (
    <div className="relative min-h-[100vh] mx-auto max-w-[480px] bg-black overflow-y-hidden">
      <div className="min-h-[100vh] pt-[0px] pb-[63px]">
        <div className="_relative_lq8ol_15 _z-[1]_lq8ol_510">
          {/* Header Section */}
          <PageHeader title="Deposit Methods" />
        </div>

        {/* Main Content */}
        <div className="_container_lq8ol_465 _py-3_lq8ol_170 _mx-auto_lq8ol_1 _px-[8px]_lq8ol_284 h-[calc(100vh-154px)] overflow-auto">
          <h1 className="text-left _text-gray-500_lq8ol_575 _text-[16px]_lq8ol_201 _font-bold_lq8ol_110">Deposit With</h1>
          
          <div className="_grid_lq8ol_157 grid-cols-1 _gap-3_lq8ol_180 _mt-3_lq8ol_94 overflow-auto">
            {isLoading ? (
              // Loading skeleton with your specified HTML structure
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="border border-gray-700 rounded-xl p-4 flex items-center mb-2 animate-pulse">
                  <div className="pe-3">
                    <div className="bg-gray-600 w-[16px] h-[16px] rounded-[8px]"></div>
                  </div>
                  <div className="flex-auto">
                    <h1 className="text-sm bg-gray-600 w-[50px] h-[17px] rounded-[8px] mb-[8px]"></h1>
                    <h1 className="text-[10px] text-gray-500 bg-gray-700 w-[130px] h-[10px] rounded-[8px]"></h1>
                  </div>
                  <div>
                    <i className="fi fi-sr-angle-small-right text-gray-500"></i>
                  </div>
                </div>
              ))
            ) : depositMethods?.map((method) => (
              <div 
                key={method.id}
                className="bg-gray-700/30 _border_lq8ol_234 border-gray-700/30 _rounded-[13px]_lq8ol_562 p-4 _flex_lq8ol_19 _items-center_lq8ol_27 _cursor-pointer_lq8ol_381"
                onClick={() => handleDepositMethodClick(method)}
              >
                <div className="pe-3">
                  <img className="w-[40px] h-[40px] _rounded-[10px]_lq8ol_56" src={method.image_url} alt={method.name} />
                </div>
                <div className="flex-auto">
                  <h1 className="_text-[18px]_lq8ol_310 _font-bold_lq8ol_110 _text-white_lq8ol_196">{method.name}</h1>
                  <h1 className="_text-[10px]_lq8ol_131 _text-gray-500_lq8ol_575">Deposit with currency: {method.currency}</h1>
                </div>
                <div className="mt-1">
                  <i className="fi fi-sr-angle-small-right _text-gray-500_lq8ol_575"></i>
                </div>
              </div>
            ))}
          </div>
        </div>

      
      </div>
    </div>
  );
};

export default Deposit;
