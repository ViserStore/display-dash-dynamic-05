import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate, Link } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import { uploadImageToImgBB } from '@/utils/imageUpload';

interface DepositMethodForm {
  name: string;
  currency: string;
  symbol: string;
  conversion_rate: number;
  min_amount: number;
  max_amount: number;
  payment_address_type: string;
  deposit_address: string;
  status: 'active' | 'inactive';
  image_file?: FileList;
}

const AdminDepositMethodAdd = () => {
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm<DepositMethodForm>({
    defaultValues: {
      status: 'active',
      conversion_rate: 1,
      min_amount: 5,
      max_amount: 1000
    }
  });

  const watchImageFile = watch('image_file');

  React.useEffect(() => {
    if (watchImageFile && watchImageFile[0]) {
      const file = watchImageFile[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, [watchImageFile]);

  const onSubmit = async (data: DepositMethodForm) => {
    try {
      setLoading(true);
      
      let imageUrl = '/assets/default-hiMwPs0P.png';
      
      if (data.image_file && data.image_file[0]) {
        imageUrl = await uploadImageToImgBB(data.image_file[0]);
      }

      const { error } = await supabase
        .from('deposit_methods')
        .insert({
          name: data.name,
          currency: data.currency,
          symbol: data.symbol,
          min_amount: data.min_amount,
          max_amount: data.max_amount,
          deposit_address: data.deposit_address,
          image_url: imageUrl,
          status: data.status,
          order_priority: 1
        });

      if (error) throw error;

      toast.success('Deposit method added successfully');
      navigate('/admin/deposit/methods');
    } catch (error) {
      console.error('Error adding deposit method:', error);
      toast.error('Failed to add deposit method');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      
      <AdminLayout>
        <div className="mx-[8px] mt-2">
          <div className="card w-[100%] bg-white shadow-xl">
            <div className="card-header px-3 py-2 border-b-2">
              <div className="flex items-center gap-2">
                <i className="fi fi-sr-piggy-bank leading-[0px] text-rose-500 text-[20px]"></i>
                <h1 className="text-rose-500 text-[20px] font-bold flex-auto">Add Deposit Method</h1>
                <Link 
                  className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white rounded-[10px] px-2 py-0" 
                  to="/admin/deposit/methods"
                >
                  <i className="fi fi-sr-left leading-[0px] cursor-pointer"></i>
                  Back
                </Link>
              </div>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="flex gap-2 items-end mb-3">
                  <div className="border-2 border-rose-500 rounded-lg p-2 w-[100px] aspect-square">
                    <img 
                      className="w-[full] aspect-square rounded-lg" 
                      src={imagePreview || "/assets/default-hiMwPs0P.png"} 
                      alt="Preview"
                    />
                  </div>
                  <div>
                    <div className="mb-3 !mb-0">
                      <input 
                        {...register('image_file')}
                        className="block w-full text-lg text-gray-400 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none !mb-0" 
                        type="file"
                        accept="image/*"
                      />
                      <p className="mt-1 text-[12px] text-gray-400 text-start">SVG, PNG, JPG or GIF (MAX. 300x300px)</p>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-3">
                  <div>
                    <div className="relative">
                      <label className="block mb-2 text-sm font-medium text-rose-500">Method Name</label>
                      <div className="relative mb-3">
                        <input 
                          {...register('name', { required: 'Method name is required' })}
                          className="!text-rose-500 border-2 bg-transparent border hover:border-lime-500 focus:border-lime-500 focus:outline-0 text-sm rounded-md focus:ring-rose-500 block w-full p-2.5" 
                          placeholder="Ex: Binance"
                        />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="relative">
                      <label className="block mb-2 text-sm font-medium text-rose-500">Method Currency</label>
                      <div className="relative mb-3">
                        <input 
                          {...register('currency', { required: 'Currency is required' })}
                          className="!text-rose-500 border-2 bg-transparent border hover:border-lime-500 focus:border-lime-500 focus:outline-0 text-sm rounded-md focus:ring-rose-500 block w-full p-2.5" 
                          placeholder="Ex: USDT"
                        />
                        {errors.currency && <p className="text-red-500 text-xs mt-1">{errors.currency.message}</p>}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="relative">
                      <label className="block mb-2 text-sm font-medium text-rose-500">Method Symbol</label>
                      <div className="relative mb-3">
                        <input 
                          {...register('symbol', { required: 'Symbol is required' })}
                          className="!text-rose-500 border-2 bg-transparent border hover:border-lime-500 focus:border-lime-500 focus:outline-0 text-sm rounded-md focus:ring-rose-500 block w-full p-2.5" 
                          placeholder="Ex: $"
                        />
                        {errors.symbol && <p className="text-red-500 text-xs mt-1">{errors.symbol.message}</p>}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="relative">
                      <label className="block mb-2 text-sm font-medium text-rose-500">1 USDT = ? {watch('currency') || 'Currency'}</label>
                      <div className="relative mb-3">
                        <input 
                          {...register('conversion_rate', { required: 'Conversion rate is required' })}
                          className="!text-rose-500 border-2 bg-transparent border hover:border-lime-500 focus:border-lime-500 focus:outline-0 text-sm rounded-md focus:ring-rose-500 block w-full p-2.5" 
                          type="number"
                          step="0.01"
                          placeholder="Ex: 10"
                        />
                        {errors.conversion_rate && <p className="text-red-500 text-xs mt-1">{errors.conversion_rate.message}</p>}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="relative">
                      <label className="block mb-2 text-sm font-medium text-rose-500">Minimum Limit</label>
                      <div className="relative mb-3">
                        <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
                          <h1 className="text-rose-500">$</h1>
                        </div>
                        <input 
                          {...register('min_amount', { required: 'Minimum amount is required' })}
                          className="!text-rose-500 border-2 bg-transparent border hover:border-lime-500 focus:border-lime-500 focus:outline-0 text-sm rounded-md focus:ring-rose-500 block w-full ps-10 p-2.5" 
                          type="number"
                          step="0.01"
                          placeholder="Ex: 10"
                        />
                        {errors.min_amount && <p className="text-red-500 text-xs mt-1">{errors.min_amount.message}</p>}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="relative">
                      <label className="block mb-2 text-sm font-medium text-rose-500">Maximum Limit</label>
                      <div className="relative mb-3">
                        <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
                          <h1 className="text-rose-500">$</h1>
                        </div>
                        <input 
                          {...register('max_amount', { required: 'Maximum amount is required' })}
                          className="!text-rose-500 border-2 bg-transparent border hover:border-lime-500 focus:border-lime-500 focus:outline-0 text-sm rounded-md focus:ring-rose-500 block w-full ps-10 p-2.5" 
                          type="number"
                          step="0.01"
                          placeholder="Ex: 100"
                        />
                        {errors.max_amount && <p className="text-red-500 text-xs mt-1">{errors.max_amount.message}</p>}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <div className="relative">
                      <label className="block mb-2 text-sm font-medium text-rose-500">Payment Address Type</label>
                      <div className="relative mb-3">
                        <input 
                          {...register('payment_address_type')}
                          className="!text-rose-500 border-2 bg-transparent border hover:border-lime-500 focus:border-lime-500 focus:outline-0 text-sm rounded-md focus:ring-rose-500 block w-full p-2.5" 
                          placeholder="Ex: USDT (TRC 20) Address"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="relative">
                      <label className="block mb-2 text-sm font-medium text-rose-500">Payment Address</label>
                      <div className="relative mb-3">
                        <input 
                          {...register('deposit_address', { required: 'Payment address is required' })}
                          className="!text-rose-500 border-2 bg-transparent border hover:border-lime-500 focus:border-lime-500 focus:outline-0 text-sm rounded-md focus:ring-rose-500 block w-full p-2.5" 
                          placeholder="Ex: TAjQiD4J3xJbNAaEbE3EvcuvSygXgM4rA5"
                        />
                        {errors.deposit_address && <p className="text-red-500 text-xs mt-1">{errors.deposit_address.message}</p>}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-3">
                  <div>
                    <div>
                      <label className="block mb-1 ms-1 text-[13px] font-medium text-rose-500">Status</label>
                      <select 
                        {...register('status')}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-rose-500 focus:border-rose-500 block w-full p-2.5 mb-3 !bg-emerald-500 border-emerald-400 hover:border-emerald-500 focus:border-emerald-500 focus:ring-emerald-500 !text-gray-50 border-2"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="bg-gradient-to-r hover:bg-gradient-to-l from-rose-500 to-rose-600 text-white w-[100%] p-2 rounded-[10px] disabled:opacity-50"
                >
                  {loading ? 'Adding Method...' : 'Add This Method'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </AdminLayout>
    </div>
  );
};

export default AdminDepositMethodAdd;
