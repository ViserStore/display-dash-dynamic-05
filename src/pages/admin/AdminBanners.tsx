import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { notify } from '@/utils/notifications';
import { uploadImageToImgBB } from '@/utils/imageUpload';
import AdminLayout from '@/components/admin/AdminLayout';
import { Upload, Image as ImageIcon } from 'lucide-react';

interface Banner {
  id: string;
  image_url: string;
  status: string;
}

const AdminBanners = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [deletingBanner, setDeletingBanner] = useState<Banner | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    image_url: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .order('created_at');

      if (error) throw error;
      setBanners(data || []);
    } catch (error) {
      console.error('Error fetching banners:', error);
      notify.error('Failed to fetch banners');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setFormData(prev => ({ ...prev, image_url: '' })); // Clear URL input when file is selected
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setUploading(true);
      let imageUrl = formData.image_url;

      // If a file is selected, upload it first
      if (selectedFile) {
        try {
          imageUrl = await uploadImageToImgBB(selectedFile);
        } catch (uploadError) {
          console.error('ImgBB upload error:', uploadError);
          notify.error('Failed to upload image. Please check ImgBB API key in admin settings.');
          return;
        }
      }

      if (!imageUrl) {
        notify.error('Please provide an image URL or upload an image');
        return;
      }

      if (editingBanner) {
        const { error } = await supabase
          .from('banners')
          .update({
            image_url: imageUrl
          })
          .eq('id', editingBanner.id);

        if (error) throw error;
        notify.success('Banner updated successfully!');
      } else {
        const { error } = await supabase
          .from('banners')
          .insert({
            image_url: imageUrl
          });

        if (error) throw error;
        notify.success('Banner added successfully!');
      }

      resetForm();
      fetchBanners();
    } catch (error) {
      console.error('Error saving banner:', error);
      notify.error('Failed to save banner');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingBanner) return;

    try {
      const { error } = await supabase
        .from('banners')
        .delete()
        .eq('id', deletingBanner.id);

      if (error) throw error;
      notify.success('Banner deleted successfully!');
      setDeletingBanner(null);
      fetchBanners();
    } catch (error) {
      console.error('Error deleting banner:', error);
      notify.error('Failed to delete banner');
    }
  };

  const resetForm = () => {
    setFormData({ image_url: '' });
    setSelectedFile(null);
    setPreviewUrl('');
    setShowAddModal(false);
    setEditingBanner(null);
  };

  const startEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData({
      image_url: banner.image_url
    });
    setPreviewUrl(banner.image_url); // Show current image as preview
    setSelectedFile(null);
    setShowAddModal(true);
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
              <i className="fi fi-sr-ad leading-[0px]"></i>
              <h1 className="text-sm font-bold ps-2">Manage Banners</h1>
            </div>
            <i 
              className="fi fi-sr-add leading-[0px] cursor-pointer"
              onClick={() => setShowAddModal(true)}
            ></i>
          </div>

          <div className="overflow-x-auto bg-white shadow-md border border-rose-200 rounded-lg p-2">
            <table className="table">
              <thead>
                <tr className="text-rose-700 font-bold">
                  <th>SL.</th>
                  <th>Image</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {banners.map((banner, index) => (
                  <tr key={banner.id} className="align-middle text-rose-500">
                    <th>{index + 1}</th>
                    <td>
                      <img 
                        src={banner.image_url} 
                        alt="Banner" 
                        className="w-16 h-10 object-cover rounded"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder.svg';
                        }}
                      />
                    </td>
                    <td className="text-green-500">{banner.status}</td>
                    <td>
                      <div className="grid gap-2">
                        <button 
                          className="bg-amber-500 hover:bg-amber-600 rounded-md text-[14px] text-white font-bold px-2 py-1 w-[100%]"
                          onClick={() => startEdit(banner)}
                        >
                          Edit
                        </button>
                        <button 
                          className="bg-red-500 hover:bg-red-600 rounded-md text-[14px] text-white font-bold px-2 py-1 w-[100%]"
                          onClick={() => setDeletingBanner(banner)}
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

          {/* Add/Edit Modal */}
          {showAddModal && (
            <div className="fixed inset-0 z-50 flex justify-center items-center bg-gray-900/60">
              <div className="relative p-4 w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="relative bg-white rounded-lg shadow">
                  <button 
                    type="button" 
                    className="absolute top-3 end-2.5 text-gray-400 hover:text-gray-900 rounded-lg text-sm w-8 h-8 flex justify-center items-center"
                    onClick={resetForm}
                  >
                    <span className="text-xl">&times;</span>
                  </button>
                  <div className="p-4 md:p-5">
                    <h3 className="mb-5 text-lg font-normal text-gray-500 text-center">
                      {editingBanner ? 'Update Banner' : 'Add Banner'}
                    </h3>
                    
                    {/* Image Preview */}
                    {previewUrl && (
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Image Preview
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                          <img 
                            src={previewUrl} 
                            alt="Preview" 
                            className="w-full h-32 object-cover rounded-lg"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder.svg';
                            }}
                          />
                        </div>
                      </div>
                    )}

                    <form onSubmit={handleSubmit}>
                      {/* File Upload */}
                      <div className="relative mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Upload Image
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-rose-400 transition-colors">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="hidden"
                            id="banner-upload"
                          />
                          <label
                            htmlFor="banner-upload"
                            className="cursor-pointer flex flex-col items-center justify-center space-y-2"
                          >
                            <Upload className="w-8 h-8 text-gray-400" />
                            <span className="text-sm text-gray-500">
                              Click to upload banner image
                            </span>
                            <span className="text-xs text-gray-400">
                              PNG, JPG, JPEG up to 10MB
                            </span>
                          </label>
                        </div>
                        {selectedFile && (
                          <p className="text-sm text-green-600 mt-2">
                            Selected: {selectedFile.name}
                          </p>
                        )}
                      </div>

                      {/* OR Divider */}
                      <div className="flex items-center my-4">
                        <div className="flex-1 border-t border-gray-300"></div>
                        <span className="px-3 text-gray-500 text-sm">OR</span>
                        <div className="flex-1 border-t border-gray-300"></div>
                      </div>

                      {/* Image URL Input */}
                      <div className="relative mb-3">
                        <input
                          className="text-gray-800 bg-transparent border border-gray-300 text-sm rounded-md block w-full p-2.5"
                          placeholder="Enter Image URL"
                          value={formData.image_url}
                          onChange={(e) => {
                            setFormData(prev => ({ ...prev, image_url: e.target.value }));
                            if (e.target.value) {
                              setPreviewUrl(e.target.value);
                              setSelectedFile(null);
                            }
                          }}
                        />
                      </div>

                      <div className="flex justify-center space-x-2">
                        <button 
                          type="submit"
                          disabled={uploading || (!selectedFile && !formData.image_url)}
                          className="text-white bg-rose-600 hover:bg-rose-800 font-medium rounded-lg text-sm px-5 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {uploading ? 'Uploading...' : (editingBanner ? 'Update Banner' : 'Add Banner')}
                        </button>
                        <button 
                          type="button"
                          className="py-2.5 px-5 text-sm font-medium text-gray-900 bg-white rounded-lg border border-gray-200 hover:bg-gray-100"
                          onClick={resetForm}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Delete Modal */}
          {deletingBanner && (
            <div className="fixed inset-0 z-50 flex justify-center items-center bg-gray-900/60">
              <div className="relative p-4 w-full max-w-md">
                <div className="relative bg-white rounded-lg shadow">
                  <button 
                    type="button" 
                    className="absolute top-3 end-2.5 text-gray-400 hover:text-gray-900 rounded-lg text-sm w-8 h-8 flex justify-center items-center"
                    onClick={() => setDeletingBanner(null)}
                  >
                    <span className="text-xl">&times;</span>
                  </button>
                  <div className="p-4 md:p-5 text-center">
                    <i className="fi fi-sr-seal-exclamation text-red-500/80 text-[50px]"></i>
                    <h3 className="mb-5 text-lg font-normal text-gray-500">
                      Are you sure to remove this banner?
                    </h3>
                    <button 
                      type="button"
                      className="text-white bg-red-600 hover:bg-red-800 font-medium rounded-lg text-sm px-5 py-2.5 mr-2"
                      onClick={handleDelete}
                    >
                      Yes, Sure
                    </button>
                    <button 
                      type="button"
                      className="py-2.5 px-5 text-sm font-medium text-gray-900 bg-white rounded-lg border border-gray-200 hover:bg-gray-100"
                      onClick={() => setDeletingBanner(null)}
                    >
                      No, cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </AdminLayout>
    </>
  );
};

export default AdminBanners;
