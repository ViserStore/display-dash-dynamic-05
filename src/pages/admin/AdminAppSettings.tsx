import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/utils/notifications';
import { uploadImageToImageKit } from '@/utils/imageUpload';
import AdminLayout from '@/components/admin/AdminLayout';
import { X, Eye, Upload, Trash2 } from 'lucide-react';

interface AppSetting {
  id: string;
  app_name: string;
  app_description: string;
  app_logo_url: string;
  app_rating: number;
  app_reviews_count: string;
  app_downloads_count: string;
  app_download_url: string;
  app_screenshots: string[];
  app_about: string;
}

const AdminAppSettings = () => {
  const [settings, setSettings] = useState<AppSetting | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadingScreenshots, setUploadingScreenshots] = useState(false);
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('app_settings')
        .select('*')
        .maybeSingle();

      if (error) throw error;
      setSettings(data);
    } catch (error) {
      console.error('Error fetching app settings:', error);
      toast.error('Failed to fetch app settings');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    if (!settings) return;
    
    setSettings(prev => ({
      ...prev!,
      [field]: value
    }));
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !settings) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    try {
      setUploading(true);
      const imageUrl = await uploadImageToImageKit(file);
      
      setSettings(prev => ({
        ...prev!,
        app_logo_url: imageUrl
      }));
      
      toast.success('Logo uploaded successfully');
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast.error('Failed to upload logo');
    } finally {
      setUploading(false);
    }
  };

  const handleScreenshotUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !settings) return;

    // Check if total screenshots won't exceed 5
    const currentScreenshots = settings.app_screenshots || [];
    if (currentScreenshots.length + files.length > 5) {
      toast.error('Maximum 5 screenshots allowed');
      return;
    }

    try {
      setUploadingScreenshots(true);
      const uploadPromises = Array.from(files).map(file => {
        // Check file type
        if (!file.type.startsWith('image/')) {
          throw new Error('Please select only image files');
        }

        // Check file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
          throw new Error('Image size should be less than 5MB');
        }

        return uploadImageToImageKit(file);
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      
      setSettings(prev => ({
        ...prev!,
        app_screenshots: [...currentScreenshots, ...uploadedUrls]
      }));
      
      toast.success(`${uploadedUrls.length} screenshot(s) uploaded successfully`);
    } catch (error) {
      console.error('Error uploading screenshots:', error);
      toast.error('Failed to upload screenshots');
    } finally {
      setUploadingScreenshots(false);
    }
  };

  const removeScreenshot = (index: number) => {
    if (!settings) return;
    
    const newScreenshots = [...(settings.app_screenshots || [])];
    newScreenshots.splice(index, 1);
    
    setSettings(prev => ({
      ...prev!,
      app_screenshots: newScreenshots
    }));
    
    toast.success('Screenshot removed');
  };

  const saveSettings = async (settings: AppSetting) => {
    const { error } = await supabase
      .from('app_settings')
      .update({
        app_name: settings.app_name,
        app_description: settings.app_description,
        app_logo_url: settings.app_logo_url,
        app_rating: settings.app_rating,
        app_reviews_count: settings.app_reviews_count,
        app_downloads_count: settings.app_downloads_count,
        app_download_url: settings.app_download_url,
        app_screenshots: settings.app_screenshots,
        app_about: settings.app_about
      })
      .eq('id', settings.id);

    if (error) throw error;
    return settings;
  };

  const handleUpdateSettings = async () => {
    if (!settings) return;

    toast.promise(
      saveSettings(settings),
      {
        loading: 'Saving app settings...',
        success: <b>App settings saved successfully!</b>,
        error: <b>Could not save app settings.</b>,
      }
    );
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

  if (!settings) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-rose-700 text-lg">No app settings found</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <>
      
      <AdminLayout>
        <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 p-4 md:p-6">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-rose-600 mb-2">App Settings</h1>
                  <p className="text-gray-600">Configure your mobile app settings and appearance</p>
                </div>
                <div className="hidden md:block">
                  <div className="bg-white rounded-lg p-4 shadow-lg border border-rose-200">
                    <div className="text-sm text-gray-500">Last Updated</div>
                    <div className="text-rose-600 font-medium">{new Date().toLocaleDateString()}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Settings Panel */}
              <div className="lg:col-span-2 space-y-6">
                {/* Basic Info Card */}
                <div className="bg-white rounded-xl shadow-lg border border-rose-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-rose-500 to-pink-500 px-6 py-4">
                    <h2 className="text-xl font-semibold text-white">Basic Information</h2>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block mb-2 text-sm font-medium text-rose-600">App Name</label>
                        <input
                          className="w-full px-4 py-3 border-2 border-rose-200 rounded-lg focus:border-rose-400 focus:ring-2 focus:ring-rose-200 transition-colors"
                          type="text"
                          value={settings.app_name}
                          onChange={(e) => handleInputChange('app_name', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block mb-2 text-sm font-medium text-rose-600">App Description</label>
                        <input
                          className="w-full px-4 py-3 border-2 border-rose-200 rounded-lg focus:border-rose-400 focus:ring-2 focus:ring-rose-200 transition-colors"
                          type="text"
                          value={settings.app_description}
                          onChange={(e) => handleInputChange('app_description', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block mb-2 text-sm font-medium text-rose-600">App Rating</label>
                        <input
                          className="w-full px-4 py-3 border-2 border-rose-200 rounded-lg focus:border-rose-400 focus:ring-2 focus:ring-rose-200 transition-colors"
                          type="number"
                          step="0.1"
                          min="0"
                          max="5"
                          value={settings.app_rating}
                          onChange={(e) => handleInputChange('app_rating', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div>
                        <label className="block mb-2 text-sm font-medium text-rose-600">Reviews Count</label>
                        <input
                          className="w-full px-4 py-3 border-2 border-rose-200 rounded-lg focus:border-rose-400 focus:ring-2 focus:ring-rose-200 transition-colors"
                          type="text"
                          value={settings.app_reviews_count}
                          onChange={(e) => handleInputChange('app_reviews_count', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block mb-2 text-sm font-medium text-rose-600">Downloads Count</label>
                        <input
                          className="w-full px-4 py-3 border-2 border-rose-200 rounded-lg focus:border-rose-400 focus:ring-2 focus:ring-rose-200 transition-colors"
                          type="text"
                          value={settings.app_downloads_count}
                          onChange={(e) => handleInputChange('app_downloads_count', e.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium text-rose-600">Download URL</label>
                      <input
                        className="w-full px-4 py-3 border-2 border-rose-200 rounded-lg focus:border-rose-400 focus:ring-2 focus:ring-rose-200 transition-colors"
                        type="url"
                        value={settings.app_download_url}
                        onChange={(e) => handleInputChange('app_download_url', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* App About Card */}
                <div className="bg-white rounded-xl shadow-lg border border-rose-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-rose-500 to-pink-500 px-6 py-4">
                    <h2 className="text-xl font-semibold text-white">App Description</h2>
                  </div>
                  <div className="p-6">
                    <textarea
                      className="w-full px-4 py-3 border-2 border-rose-200 rounded-lg focus:border-rose-400 focus:ring-2 focus:ring-rose-200 transition-colors resize-none"
                      rows={6}
                      value={settings.app_about}
                      onChange={(e) => handleInputChange('app_about', e.target.value)}
                      placeholder="Enter detailed app description..."
                    />
                  </div>
                </div>
              </div>

              {/* Logo and Screenshots Panel */}
              <div className="space-y-6">
                {/* App Logo Card */}
                <div className="bg-white rounded-xl shadow-lg border border-rose-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-rose-500 to-pink-500 px-6 py-4">
                    <h2 className="text-xl font-semibold text-white">App Logo</h2>
                  </div>
                  <div className="p-6">
                    <div className="text-center mb-4">
                      {settings.app_logo_url ? (
                        <div className="inline-block relative">
                          <img 
                            src={settings.app_logo_url} 
                            alt="App Logo" 
                            className="w-24 h-24 object-cover rounded-2xl shadow-lg border-2 border-rose-200"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = "https://tradebull.scriptbasket.com/logo/logo.png";
                            }}
                          />
                          <div className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                            ✓
                          </div>
                        </div>
                      ) : (
                        <div className="w-24 h-24 bg-gray-100 rounded-2xl mx-auto flex items-center justify-center border-2 border-dashed border-gray-300">
                          <Upload className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      disabled={uploading}
                      className="w-full px-4 py-3 border-2 border-rose-200 rounded-lg focus:border-rose-400 transition-colors"
                    />
                    
                    {uploading && (
                      <div className="mt-3 text-center">
                        <div className="inline-flex items-center px-4 py-2 bg-rose-100 text-rose-600 rounded-lg">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-rose-500 mr-2"></div>
                          Uploading...
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* App Screenshots Card */}
                <div className="bg-white rounded-xl shadow-lg border border-rose-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-rose-500 to-pink-500 px-6 py-4">
                    <h2 className="text-xl font-semibold text-white flex items-center justify-between">
                      App Screenshots
                      <span className="text-rose-200 text-sm">
                        {settings.app_screenshots?.length || 0}/5
                      </span>
                    </h2>
                  </div>
                  <div className="p-6">
                    {/* Upload Button */}
                    <div className="mb-6">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleScreenshotUpload}
                        disabled={uploadingScreenshots}
                        className="w-full px-4 py-3 border-2 border-rose-200 rounded-lg focus:border-rose-400 transition-colors"
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        Select multiple images (Max 5 total)
                      </p>
                      
                      {uploadingScreenshots && (
                        <div className="mt-3 text-center">
                          <div className="inline-flex items-center px-4 py-2 bg-rose-100 text-rose-600 rounded-lg">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-rose-500 mr-2"></div>
                            Uploading...
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Screenshots Grid */}
                    {settings.app_screenshots && settings.app_screenshots.length > 0 && (
                      <div className="space-y-3">
                        {settings.app_screenshots.map((screenshot, index) => (
                          screenshot && (
                            <div key={index} className="relative group bg-gray-50 rounded-lg p-3 border border-gray-200 hover:border-rose-300 transition-colors">
                              <div className="flex items-center space-x-3">
                                <div className="relative">
                                  <img 
                                    src={screenshot} 
                                    alt={`Screenshot ${index + 1}`} 
                                    className="w-16 h-28 object-cover rounded-lg shadow-sm border border-gray-200"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.style.display = 'none';
                                    }}
                                  />
                                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-opacity flex items-center justify-center">
                                    <Eye 
                                      className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                      onClick={() => setSelectedScreenshot(screenshot)}
                                    />
                                  </div>
                                </div>
                                <div className="flex-1">
                                  <div className="font-medium text-gray-800">Screenshot {index + 1}</div>
                                  <div className="text-xs text-gray-500 mt-1">
                                    Mobile App Preview
                                  </div>
                                </div>
                                <button
                                  onClick={() => removeScreenshot(index)}
                                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          )
                        ))}
                      </div>
                    )}

                    {(!settings.app_screenshots || settings.app_screenshots.length === 0) && (
                      <div className="text-center py-8 text-gray-500">
                        <Upload className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p>No screenshots uploaded yet</p>
                        <p className="text-sm">Add screenshots to showcase your app</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="mt-8 text-center">
              <button
                type="button"
                className="px-8 py-4 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleUpdateSettings}
                disabled={uploading || uploadingScreenshots}
              >
                {uploading || uploadingScreenshots ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Saving Changes...
                  </div>
                ) : (
                  'Save App Settings'
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Full Screen Screenshot Modal */}
        {selectedScreenshot && (
          <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
            <div className="relative max-w-md max-h-full">
              <button
                onClick={() => setSelectedScreenshot(null)}
                className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
              >
                <X className="w-8 h-8" />
              </button>
              <div className="bg-white rounded-2xl p-2 shadow-2xl">
                <img 
                  src={selectedScreenshot} 
                  alt="Screenshot Preview" 
                  className="w-full h-auto rounded-xl shadow-lg"
                  style={{ maxHeight: '80vh' }}
                />
              </div>
              <div className="text-center mt-4">
                <p className="text-white text-sm">App Screenshot Preview</p>
                <p className="text-gray-300 text-xs mt-1">Click X to close</p>
              </div>
            </div>
          </div>
        )}
      </AdminLayout>
    </>
  );
};

export default AdminAppSettings;
