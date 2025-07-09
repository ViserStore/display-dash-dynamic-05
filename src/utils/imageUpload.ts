import { supabase } from '@/integrations/supabase/client';

export const uploadImageToImgBB = async (file: File): Promise<string> => {
  try {
    console.log('Starting ImgBB upload process...');

    // Get ImgBB API key from Supabase
    const { data: settings, error } = await supabase
      .from('site_settings')
      .select('imgbb_api_key')
      .single();

    if (error || !settings) {
      console.error('Failed to fetch ImgBB settings:', error);
      throw new Error('Failed to fetch ImgBB settings from database');
    }

    const { imgbb_api_key } = settings;

    if (!imgbb_api_key) {
      console.error('ImgBB API key missing');
      throw new Error('ImgBB API key not configured in site settings');
    }

    console.log('ImgBB API key loaded successfully');

    // Create form data for upload
    const formData = new FormData();
    formData.append('image', file);
    formData.append('key', imgbb_api_key);
    formData.append('name', `banner_${Date.now()}_${file.name}`);

    console.log('Uploading to ImgBB...');

    // Make the upload request
    const response = await fetch('https://api.imgbb.com/1/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ImgBB upload error:', errorText);
      throw new Error(`ImgBB upload failed: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('ImgBB upload successful:', result);

    if (!result.success) {
      throw new Error('ImgBB upload failed: ' + (result.error?.message || 'Unknown error'));
    }

    return result.data.url;
  } catch (error) {
    console.error('Error uploading to ImgBB:', error);
    throw error;
  }
};

// Keep the old function name for backward compatibility
export const uploadImageToImageKit = uploadImageToImgBB;
