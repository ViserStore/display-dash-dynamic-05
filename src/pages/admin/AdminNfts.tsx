import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import AdminLayout from '@/components/admin/AdminLayout';
import NftFormModal from '@/components/admin/NftFormModal';

interface Nft {
  id: string;
  title: string;
  image_url: string | null;
  min_invest_limit: number;
  max_invest_limit: number;
  min_profit_percentage: number;
  max_profit_percentage: number;
  validity_days: number;
  nft_date: string;
  website_link: string | null;
  details: string | null;
  is_verified: boolean;
  status: string;
  created_at: string;
  updated_at: string;
}

const AdminNfts = () => {
  const [nfts, setNfts] = useState<Nft[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedNft, setSelectedNft] = useState<Nft | null>(null);
  const [currencySymbol, setCurrencySymbol] = useState('$');

  useEffect(() => {
    fetchSiteSettings();
    fetchNfts();
  }, []);

  const fetchSiteSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('currency_symbol')
        .single();

      if (error) throw error;
      if (data?.currency_symbol) {
        setCurrencySymbol(data.currency_symbol);
      }
    } catch (error) {
      console.error('Error fetching site settings:', error);
    }
  };

  const fetchNfts = async () => {
    try {
      setLoading(true);
      console.log('Fetching NFTs from database...');
      const { data, error } = await supabase
        .from('nfts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('NFTs fetched successfully:', data);
      setNfts(data || []);
    } catch (error) {
      console.error('Error fetching NFTs:', error);
      toast.error('Failed to fetch NFTs');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNft = async (formData: any) => {
    try {
      console.log('Adding NFT with data:', formData);
      const { error } = await supabase
        .from('nfts')
        .insert([formData]);

      if (error) {
        console.error('Insert error:', error);
        throw error;
      }
      
      console.log('NFT added successfully');
      toast.success('NFT added successfully!');
      setShowAddModal(false);
      fetchNfts();
    } catch (error) {
      console.error('Error adding NFT:', error);
      toast.error('Failed to add NFT');
    }
  };

  const handleEditNft = async (formData: any) => {
    if (!selectedNft) return;

    try {
      console.log('Updating NFT with data:', formData);
      const { error } = await supabase
        .from('nfts')
        .update(formData)
        .eq('id', selectedNft.id);

      if (error) {
        console.error('Update error:', error);
        throw error;
      }
      
      console.log('NFT updated successfully');
      toast.success('NFT updated successfully!');
      setShowEditModal(false);
      setSelectedNft(null);
      fetchNfts();
    } catch (error) {
      console.error('Error updating NFT:', error);
      toast.error('Failed to update NFT');
    }
  };

  const handleDeleteNft = async () => {
    if (!selectedNft) return;

    try {
      console.log('Deleting NFT with ID:', selectedNft.id);
      const { error } = await supabase
        .from('nfts')
        .delete()
        .eq('id', selectedNft.id);

      if (error) {
        console.error('Delete error:', error);
        throw error;
      }
      
      console.log('NFT deleted successfully');
      toast.success('NFT deleted successfully!');
      setShowDeleteModal(false);
      setSelectedNft(null);
      fetchNfts();
    } catch (error) {
      console.error('Error deleting NFT:', error);
      toast.error('Failed to delete NFT');
    }
  };

  const openEditModal = (nft: Nft) => {
    console.log('Opening edit modal for NFT:', nft);
    setSelectedNft(nft);
    setShowEditModal(true);
  };

  const openDeleteModal = (nft: Nft) => {
    console.log('Opening delete modal for NFT:', nft);
    setSelectedNft(nft);
    setShowDeleteModal(true);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex flex-col justify-center items-center h-[calc(100vh-150px)]">
          <span className="loading loading-bars text-rose-500 loading-lg -mt-[60px]"></span>
        </div>
      </AdminLayout>
    );
  }

  return (
    <>
      
      <AdminLayout>
        <div className="mx-[8px] mt-2">
          <div className="flex justify-center items-center rounded-lg text-white bg-rose-600 shadow-md shadow-rose-700/50 p-2 mb-3">
            <div className="flex-auto flex items-center">
              <i className="fi fi-sr-direction-signal leading-[0px]"></i>
              <h1 className="text-sm font-bold ps-2">Manage All NFTs</h1>
            </div>
            <i 
              className="fi fi-sr-add leading-[0px] cursor-pointer"
              onClick={() => {
                console.log('Add NFT button clicked');
                setShowAddModal(true);
              }}
            ></i>
          </div>

          <div className="overflow-x-auto bg-white shadow-md border border-rose-200 rounded-lg p-2">
            <table className="table">
              <thead>
                <tr className="text-rose-700 font-bold">
                  <th>SL.</th>
                  <th>Title</th>
                  <th>NFT Image</th>
                  <th>Invest Limits</th>
                  <th>Profit Range</th>
                  <th>Is Verified</th>
                  <th>Validity</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {nfts.map((nft, index) => (
                  <tr key={nft.id} className="align-middle text-rose-500">
                    <th>{index + 1}</th>
                    <td>
                      <div className="flex items-center gap-2">{nft.title}</div>
                    </td>
                    <td>
                      <img 
                        className="rounded-[8px] h-[60px] aspect-square object-cover" 
                        src={nft.image_url || '/assets/default-hiMwPs0P.png'} 
                        alt={nft.title}
                      />
                    </td>
                    <td className="font-semibold">
                      min:{currencySymbol}{nft.min_invest_limit} - max:{currencySymbol}{nft.max_invest_limit}
                    </td>
                    <td className="font-semibold">
                      {nft.min_profit_percentage}% - {nft.max_profit_percentage}%
                    </td>
                    <td className={nft.is_verified ? 'text-green-500' : 'text-red-500'}>
                      {nft.is_verified ? 'Verified' : 'Not Verified'}
                    </td>
                    <td className="font-semibold">{nft.validity_days} Days</td>
                    <td className={nft.status === 'active' ? 'text-green-500' : 'text-red-500'}>
                      {nft.status}
                    </td>
                    <td>
                      <div className="grid gap-2">
                        <button 
                          className="bg-amber-500 hover:bg-amber-600 rounded-md text-[14px] text-white font-bold px-2 py-1 w-[100%]"
                          onClick={() => openEditModal(nft)}
                        >
                          Edit
                        </button>
                        <button 
                          className="bg-red-500 hover:bg-red-600 rounded-md text-[14px] text-white font-bold px-2 py-1 w-[100%]"
                          onClick={() => openDeleteModal(nft)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add NFT Modal */}
        <NftFormModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddNft}
          title="Add NFT"
          submitText="Add NFT"
        />

        {/* Edit NFT Modal */}
        <NftFormModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSubmit={handleEditNft}
          initialData={selectedNft}
          title="Update NFT"
          submitText="Update NFT"
        />

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex justify-center items-center bg-gray-900/60">
            <div className="relative p-4 w-full max-w-md max-h-full">
              <div className="relative bg-white rounded-lg shadow">
                <button 
                  type="button" 
                  className="absolute top-3 end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
                  onClick={() => setShowDeleteModal(false)}
                >
                  <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                  </svg>
                  <span className="sr-only">Close modal</span>
                </button>
                <div className="p-4 md:p-5 text-center">
                  <i className="fi fi-sr-seal-exclamation text-red-500/80 text-[50px]"></i>
                  <h3 className="mb-5 text-lg font-normal text-gray-500">
                    Are you sure to remove this NFT?
                  </h3>
                  <button 
                    type="button" 
                    className="text-white bg-red-600 hover:bg-red-800 focus:ring-4 focus:outline-none font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center"
                    onClick={handleDeleteNft}
                  >
                    Yes, Sure
                  </button>
                  <button 
                    type="button" 
                    className="py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-rose-700"
                    onClick={() => setShowDeleteModal(false)}
                  >
                    No, cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </AdminLayout>
    </>
  );
};

export default AdminNfts;
