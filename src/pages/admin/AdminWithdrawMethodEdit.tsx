
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import AdminLayout from '@/components/admin/AdminLayout';
import { uploadImageToImgBB } from '@/utils/imageUpload';

interface WithdrawMethodForm {
  name: string;
  currency: string;
  symbol: string;
  exchange_rate: number;
  min_amount: number;
  max_amount: number;
  charge_percentage: number;
  user_info_label: string;
  status: 'active' | 'inactive';
  image_file?: FileList;
}

const AdminWithdrawMethodEdit = () => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [currentImageUrl, setCurrentImageUrl] = useState<string>('');
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm<WithdrawMethodForm>();

  const watchImageFile = watch('image_file');

  // Fetch existing method data
  useEffect(() => {
    const fetchMethod = async () => {
      if (!id) return;

      try {
        const { data, error } = await supabase
          .from('withdraw_methods')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;

        if (data) {
          setValue('name', data.name);
          setValue('currency', data.currency);
          setValue('symbol', data.symbol);
          setValue('exchange_rate', data.exchange_rate);
          setValue('min_amount', data.min_amount);
          setValue('max_amount', data.max_amount);
          setValue('charge_percentage', data.charge_percentage);
          setValue('user_info_label', data.user_info_label);
          setValue('status', data.status as 'active' | 'inactive');
          setCurrentImageUrl(data.image_url);
          setImagePreview(data.image_url);
        }
      } catch (error) {
        console.error('Error fetching withdraw method:', error);
        toast.error('Failed to load withdraw method');
      }
    };

    fetchMethod();
  }, [id, setValue]);

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

  const onSubmit = async (data: WithdrawMethodForm) => {
    if (!id) return;

    try {
      setLoading(true);
      
      let imageUrl = currentImageUrl;
      
      if (data.image_file && data.image_file[0]) {
        imageUrl = await uploadImageToImgBB(data.image_file[0]);
      }

      const { error } = await supabase
        .from('withdraw_methods')
        .update({
          name: data.name,
          currency: data.currency,
          symbol: data.symbol,
          exchange_rate: data.exchange_rate,
          min_amount: data.min_amount,
          max_amount: data.max_amount,
          charge_percentage: data.charge_percentage,
          user_info_label: data.user_info_label,
          image_url: imageUrl,
          status: data.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      toast.success('Withdraw method updated successfully');
      navigate('/admin/withdraw/methods');
    } catch (error) {
      console.error('Error updating withdraw method:', error);
      toast.error('Failed to update withdraw method');
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
                <i className="fi fi-sr-wallet leading-[0px] text-rose-500 text-[20px]"></i>
                <h1 className="text-rose-500 text-[20px] font-bold flex-auto">Update Withdraw Method</h1>
                <Link 
                  className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white rounded-[10px] px-2 py-0" 
                  to="/admin/withdraw/methods"
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
                      <label className="block mb-2 text-sm font-medium text-rose-500">1 USDT = ? {watch('currency')}</label>
                      <div className="relative mb-3">
                        <input 
                          {...register('exchange_rate', { required: 'Exchange rate is required' })}
                          className="!text-rose-500 border-2 bg-transparent border hover:border-lime-500 focus:border-lime-500 focus:outline-0 text-sm rounded-md focus:ring-rose-500 block w-full p-2.5" 
                          type="number"
                          step="0.01"
                          placeholder="Ex: 10"
                        />
                        {errors.exchange_rate && <p className="text-red-500 text-xs mt-1">{errors.exchange_rate.message}</p>}
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

                  <div>
                    <div className="relative">
                      <label className="block mb-2 text-sm font-medium text-rose-500">Charge (%)</label>
                      <div className="relative mb-3">
                        <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
                          <h1 className="text-rose-500">%</h1>
                        </div>
                        <input 
                          {...register('charge_percentage', { required: 'Charge percentage is required' })}
                          className="!text-rose-500 border-2 bg-transparent border hover:border-lime-500 focus:border-lime-500 focus:outline-0 text-sm rounded-md focus:ring-rose-500 block w-full ps-10 p-2.5" 
                          type="number"
                          step="0.01"
                          placeholder="Ex: 5"
                        />
                        {errors.charge_percentage && <p className="text-red-500 text-xs mt-1">{errors.charge_percentage.message}</p>}
                      </div>
                    </div>
                  </div>

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

                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <div className="relative">
                      <label className="block mb-2 text-sm font-medium text-rose-500">Information from User</label>
                      <div className="relative mb-3">
                        <input 
                          {...register('user_info_label', { required: 'User info label is required' })}
                          className="!text-rose-500 border-2 bg-transparent border hover:border-lime-500 focus:border-lime-500 focus:outline-0 text-sm rounded-md focus:ring-rose-500 block w-full p-2.5" 
                          type="text"
                          placeholder="Ex: Your (TRC 20) Address"
                        />
                        {errors.user_info_label && <p className="text-red-500 text-xs mt-1">{errors.user_info_label.message}</p>}
                      </div>
                    </div>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="bg-gradient-to-r hover:bg-gradient-to-l from-rose-500 to-rose-600 text-white w-[100%] p-2 rounded-[10px] disabled:opacity-50"
                >
                  {loading ? 'Updating Method...' : 'Update This Method'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </AdminLayout>
    </div>
  );
};

export default AdminWithdrawMethodEdit;
