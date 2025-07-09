
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';

const AdminDepositMethods = () => {
  // Fetch deposit methods from database
  const { data: depositMethods, isLoading } = useQuery({
    queryKey: ['admin-deposit-methods'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deposit_methods')
        .select('*')
        .order('order_priority', { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex flex-col justify-center items-center h-[calc(100vh-150px)]">
          <span className="loading loading-bars text-rose-500 loading-lg -mt-[60px]"></span>
        </div>
      </AdminLayout>
    );
  }

  return (
    <div>
      
      <AdminLayout>
        <div className="mx-[8px] mt-2">
          <div className="flex justify-center items-center rounded-lg text-white bg-rose-600 shadow-md shadow-rose-700/50 p-2 mb-3">
            <div className="flex-auto flex items-center">
              <i className="fi fi-sr-direction-signal leading-[0px]"></i>
              <h1 className="text-sm font-bold ps-2">Manage Deposit Methods</h1>
            </div>
            <Link 
              className="flex items-center gap-2 bg-white hover:bg-rose-50 text-rose-500 rounded-[10px] px-2 py-0" 
              to="/admin/deposit/methods/add"
            >
              <i className="fi fi-sr-add leading-[0px] cursor-pointer"></i>
              Add Method
            </Link>
          </div>
          
          <div className="overflow-x-auto bg-white shadow-md border border-rose-200 rounded-lg p-2">
            <table className="table">
              <thead>
                <tr className="text-rose-700 font-bold">
                  <th>Name</th>
                  <th>Currency</th>
                  <th>Symbol</th>
                  <th>Min Limit - Max Limit</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {depositMethods?.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center text-rose-500 py-4">
                      No deposit methods found
                    </td>
                  </tr>
                ) : (
                  depositMethods?.map((method) => (
                    <tr key={method.id} className="align-middle text-rose-500">
                      <td className="flex gap-2 items-center">
                        <img 
                          className="w-[30px] h-[30px] rounded-[8px]" 
                          src={method.image_url} 
                          alt={method.name}
                        />
                        <p className="font-bold">{method.name}</p>
                      </td>
                      <td className="font-semibold">{method.currency}</td>
                      <td className="font-semibold">{method.symbol}</td>
                      <td className="font-semibold">
                        ${method.min_amount} - ${method.max_amount}
                      </td>
                      <td className={method.status === 'active' ? 'text-green-500' : 'text-red-500'}>
                        {method.status}
                      </td>
                      <td>
                        <div className="grid gap-2">
                          <Link 
                            className="bg-amber-500 hover:bg-amber-600 rounded-md text-[14px] text-white text-center font-bold px-2 py-1 w-[100%]" 
                            to={`/admin/deposit/methods/edit/${method.id}`}
                          >
                            Edit
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </AdminLayout>
    </div>
  );
};

export default AdminDepositMethods;
