
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { uploadImageToImageKit } from '@/utils/imageUpload';
import { Image } from 'lucide-react';

interface NftFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: any) => Promise<void>;
  initialData?: any;
  title: string;
  submitText: string;
}

const NftFormModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData, 
  title, 
  submitText 
}: NftFormModalProps) => {
  const [formData, setFormData] = useState({
    title: '',
    image_url: '',
    min_invest_limit: 0,
    max_invest_limit: 0,
    min_profit_percentage: 0,
    max_profit_percentage: 0,
    nft_date: '',
    validity_days: 0,
    website_link: '',
    details: '',
    is_verified: true,
    status: 'active'
  });
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        console.log('Setting form data from initial data:', initialData);
        setFormData({
          title: initialData.title || '',
          image_url: initialData.image_url || '',
          min_invest_limit: initialData.min_invest_limit || 0,
          max_invest_limit: initialData.max_invest_limit || 0,
          min_profit_percentage: initialData.min_profit_percentage || 0,
          max_profit_percentage: initialData.max_profit_percentage || 0,
          nft_date: initialData.nft_date || '',
          validity_days: initialData.validity_days || 0,
          website_link: initialData.website_link || '',
          details: initialData.details || '',
          is_verified: initialData.is_verified !== undefined ? initialData.is_verified : true,
          status: initialData.status || 'active'
        });
      } else {
        console.log('Resetting form data for new NFT');
        setFormData({
          title: '',
          image_url: '',
          min_invest_limit: 0,
          max_invest_limit: 0,
          min_profit_percentage: 0,
          max_profit_percentage: 0,
          nft_date: '',
          validity_days: 0,
          website_link: '',
          details: '',
          is_verified: true,
          status: 'active'
        });
      }
    }
  }, [isOpen, initialData]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    try {
      setUploading(true);
      console.log('Uploading image...');
      const imageUrl = await uploadImageToImageKit(file);
      console.log('Image uploaded successfully:', imageUrl);
      setFormData({ ...formData, image_url: imageUrl });
      toast.success('Image uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (submitting) return;

    if (!formData.title.trim()) {
      toast.error('Please enter NFT title');
      return;
    }

    if (!formData.image_url.trim()) {
      toast.error('Please upload NFT image');
      return;
    }

    try {
      setSubmitting(true);
      console.log('Submitting NFT data:', formData);
      await onSubmit(formData);
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Failed to save NFT');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center bg-gray-900/60">
      <div className="relative p-4 w-full max-w-2xl max-h-full overflow-y-auto">
        <div className="relative bg-white rounded-lg shadow">
          <button 
            type="button" 
            className="absolute top-3 end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center z-10"
            onClick={onClose}
          >
            <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
            </svg>
            <span className="sr-only">Close modal</span>
          </button>
          
          <form onSubmit={handleSubmit}>
            <div className="p-4 md:p-5 text-center">
              <h3 className="mb-5 text-lg font-normal text-gray-500">{title}</h3>
              
              {/* Image Upload Section */}
              <div className="mb-3">
                <p className="mb-0 text-sm">Image preview:</p>
                <div className="mb-3">
                  {formData.image_url ? (
                    <img 
                      className="h-[100px] mx-auto border rounded-[10px] object-cover" 
                      src={formData.image_url} 
                      alt="NFT preview" 
                    />
                  ) : (
                    <div className="h-[100px] w-[100px] mx-auto border rounded-[10px] bg-gray-100 flex items-center justify-center">
                      <Image className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                </div>
                
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="nft-image-upload"
                  disabled={uploading}
                />
                
                <label
                  htmlFor="nft-image-upload"
                  className={`block w-full text-lg text-gray-400 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none ${
                    uploading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <div className="p-3">
                    {uploading ? 'Uploading...' : 'Choose Image'}
                  </div>
                </label>
                <p className="mt-1 text-[12px] text-gray-400 text-start">SVG, PNG, JPG or GIF (MAX. 200x200px)</p>
              </div>

              {/* NFT Title */}
              <div className="relative">
                <label className="block mb-2 text-sm font-medium text-gray-500 text-left">NFT Title</label>
                <div className="relative mb-3">
                  <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
                    <i className="fi fi-ss-images leading-[0px]"></i>
                  </div>
                  <input 
                    className="text-gray-800 focus:text-gray-800 bg-transparent border hover:border-lime-500 focus:border-lime-500 focus:outline-0 text-sm rounded-md focus:ring-rose-500 block w-full ps-10 p-2.5"
                    placeholder="Enter NFT Title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                  />
                </div>
              </div>

              {/* Invest Limits */}
              <div className="grid gap-2 grid-cols-2">
                <div className="relative">
                  <label className="block mb-2 text-sm font-medium text-gray-500 text-left">Min Invest Limit</label>
                  <div className="relative mb-3">
                    <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
                      <i className="fi fi-sr-money-bill-wave leading-[0px]"></i>
                    </div>
                    <input 
                      className="text-gray-800 focus:text-gray-800 bg-transparent border hover:border-lime-500 focus:border-lime-500 focus:outline-0 text-sm rounded-md focus:ring-rose-500 block w-full ps-10 p-2.5"
                      type="number"
                      step="any"
                      placeholder="min invest limit"
                      value={formData.min_invest_limit}
                      onChange={(e) => setFormData({...formData, min_invest_limit: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                </div>
                <div className="relative">
                  <label className="block mb-2 text-sm font-medium text-gray-500 text-left">Max Invest Limit</label>
                  <div className="relative mb-3">
                    <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
                      <i className="fi fi-sr-money-bill-wave leading-[0px]"></i>
                    </div>
                    <input 
                      className="text-gray-800 focus:text-gray-800 bg-transparent border hover:border-lime-500 focus:border-lime-500 focus:outline-0 text-sm rounded-md focus:ring-rose-500 block w-full ps-10 p-2.5"
                      type="number"
                      step="any"
                      placeholder="max invest limit"
                      value={formData.max_invest_limit}
                      onChange={(e) => setFormData({...formData, max_invest_limit: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                </div>
              </div>

              {/* Profit Percentage */}
              <div className="grid gap-2 grid-cols-2">
                <div className="relative">
                  <label className="block mb-2 text-sm font-medium text-gray-500 text-left">Min Profit Percentage (%)</label>
                  <div className="relative mb-3">
                    <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
                      <i className="fi fi-sr-tax-alt leading-[0px]"></i>
                    </div>
                    <input 
                      className="text-gray-800 focus:text-gray-800 bg-transparent border hover:border-lime-500 focus:border-lime-500 focus:outline-0 text-sm rounded-md focus:ring-rose-500 block w-full ps-10 p-2.5"
                      type="number"
                      step="any"
                      placeholder="min profit percentage"
                      value={formData.min_profit_percentage}
                      onChange={(e) => setFormData({...formData, min_profit_percentage: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                </div>
                <div className="relative">
                  <label className="block mb-2 text-sm font-medium text-gray-500 text-left">Max Profit Percentage (%)</label>
                  <div className="relative mb-3">
                    <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
                      <i className="fi fi-sr-tax-alt leading-[0px]"></i>
                    </div>
                    <input 
                      className="text-gray-800 focus:text-gray-800 bg-transparent border hover:border-lime-500 focus:border-lime-500 focus:outline-0 text-sm rounded-md focus:ring-rose-500 block w-full ps-10 p-2.5"
                      type="number"
                      step="any"
                      placeholder="max profit percentage"
                      value={formData.max_profit_percentage}
                      onChange={(e) => setFormData({...formData, max_profit_percentage: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                </div>
              </div>

              {/* NFT Date */}
              <div className="relative">
                <label className="block mb-2 text-sm font-medium text-gray-500 text-left">NFT Date</label>
                <div className="relative mb-3">
                  <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
                    <i className="fi fi-ss-calendar-clock leading-[0px]"></i>
                  </div>
                  <input 
                    className="text-gray-800 focus:text-gray-800 bg-transparent border hover:border-lime-500 focus:border-lime-500 focus:outline-0 text-sm rounded-md focus:ring-rose-500 block w-full ps-10 p-2.5"
                    placeholder="Ex: Feb 01, 2025"
                    value={formData.nft_date}
                    onChange={(e) => setFormData({...formData, nft_date: e.target.value})}
                  />
                </div>
              </div>

              {/* Validity Days */}
              <div className="relative">
                <label className="block mb-2 text-sm font-medium text-gray-500 text-left">NFT Validity (in days)</label>
                <div className="relative mb-3">
                  <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
                    <i className="fi fi-ss-calendar-clock leading-[0px]"></i>
                  </div>
                  <input 
                    className="text-gray-800 focus:text-gray-800 bg-transparent border hover:border-lime-500 focus:border-lime-500 focus:outline-0 text-sm rounded-md focus:ring-rose-500 block w-full ps-10 p-2.5"
                    type="number"
                    placeholder="Ex: 10"
                    value={formData.validity_days}
                    onChange={(e) => setFormData({...formData, validity_days: parseInt(e.target.value) || 0})}
                  />
                </div>
              </div>

              {/* Website Link */}
              <div className="relative">
                <label className="block mb-2 text-sm font-medium text-gray-500 text-left">NFT Website Link</label>
                <div className="relative mb-3">
                  <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
                    <i className="fi fi-ss-calendar-clock leading-[0px]"></i>
                  </div>
                  <input 
                    className="text-gray-800 focus:text-gray-800 bg-transparent border hover:border-lime-500 focus:border-lime-500 focus:outline-0 text-sm rounded-md focus:ring-rose-500 block w-full ps-10 p-2.5"
                    placeholder="Ex: https://sitename.com"
                    value={formData.website_link}
                    onChange={(e) => setFormData({...formData, website_link: e.target.value})}
                  />
                </div>
              </div>

              {/* NFT Details */}
              <div className="mt-2">
                <p className="mb-2 text-left text-gray-500 text-sm font-medium">NFT Details</p>
                <textarea 
                  className="bg-white border border-gray-300 rounded-lg w-full p-3"
                  rows={3}
                  placeholder="Enter NFT Details Here..."
                  value={formData.details}
                  onChange={(e) => setFormData({...formData, details: e.target.value})}
                />
              </div>

              {/* Status and Verification */}
              <div className="grid gap-2 grid-cols-2">
                <div>
                  <label className="block mb-1 ms-1 text-[13px] font-medium text-gray-500 text-left">Is Verified?</label>
                  <select 
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-rose-500 focus:border-rose-500 block w-full p-2.5 mb-3"
                    value={formData.is_verified.toString()}
                    onChange={(e) => setFormData({...formData, is_verified: e.target.value === 'true'})}
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1 ms-1 text-[13px] font-medium text-gray-500 text-left">Status</label>
                  <select 
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-rose-500 focus:border-rose-500 block w-full p-2.5 mb-3"
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <button 
                type="submit" 
                className="text-white bg-rose-600 hover:bg-rose-800 focus:ring-4 focus:outline-none font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center disabled:opacity-50"
                disabled={uploading || submitting}
              >
                {submitting ? 'Saving...' : submitText}
              </button>
              <button 
                type="button" 
                className="py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-rose-700"
                onClick={onClose}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NftFormModal;
