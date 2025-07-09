import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { uploadImageToImgBB } from '@/utils/imageUpload';

interface Coin {
  id: number;
  symbol: string;
  image_url: string;
  profit_loss: number;
  status: string;
}

interface CoinFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  coin?: Coin | null;
  onCoinSaved: () => void;
}

const CoinFormModal = ({ isOpen, onClose, coin, onCoinSaved }: CoinFormModalProps) => {
  const [formData, setFormData] = useState({
    symbol: '',
    image_url: '',
    profit_loss: 10,
    status: 'active'
  });
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUploading, setImageUploading] = useState(false);

  // Reset form and load coin data when modal opens or coin changes
  useEffect(() => {
    if (isOpen) {
      if (coin) {
        console.log('Loading coin data for editing:', coin);
        setFormData({
          symbol: coin.symbol || '',
          image_url: coin.image_url || '',
          profit_loss: Number(coin.profit_loss) || 10,
          status: coin.status || 'active'
        });
      } else {
        console.log('Resetting form for new coin');
        setFormData({
          symbol: '',
          image_url: '',
          profit_loss: 10,
          status: 'active'
        });
      }
      setImageFile(null);
    }
  }, [coin, isOpen]);

  const handleImageUpload = async (file: File) => {
    try {
      setImageUploading(true);
      console.log('Starting image upload for coin...');
      const imageUrl = await uploadImageToImgBB(file);
      console.log('Image uploaded successfully:', imageUrl);
      
      setFormData(prev => ({
        ...prev,
        image_url: imageUrl
      }));
      
      toast.success('Image uploaded successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image. Please try again.');
    } finally {
      setImageUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      handleImageUpload(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.symbol.trim()) {
      toast.error('Please enter a coin symbol');
      return;
    }

    setLoading(true);

    try {
      const coinData = {
        symbol: formData.symbol.toUpperCase().trim(),
        image_url: formData.image_url || null,
        profit_loss: Number(formData.profit_loss),
        status: formData.status
      };

      console.log('Submitting coin data:', coinData);

      if (coin) {
        // Update existing coin
        console.log('Updating coin with ID:', coin.id);
        const { data, error } = await supabase
          .from('coins')
          .update(coinData)
          .eq('id', coin.id)
          .select()
          .single();

        if (error) {
          console.error('Error updating coin:', error);
          throw error;
        }

        console.log('Coin updated successfully:', data);
        toast.success('Coin updated successfully');
      } else {
        // Create new coin
        console.log('Creating new coin');
        const { data, error } = await supabase
          .from('coins')
          .insert(coinData)
          .select()
          .single();

        if (error) {
          console.error('Error creating coin:', error);
          throw error;
        }

        console.log('Coin created successfully:', data);
        toast.success('Coin created successfully');
      }

      // Close modal and notify parent
      onCoinSaved();
      
    } catch (error) {
      console.error('Error saving coin:', error);
      if (error.message?.includes('duplicate')) {
        toast.error('A coin with this symbol already exists');
      } else {
        toast.error('Failed to save coin. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    console.log(`Updating field ${field} to:`, value);
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-rose-600">
            {coin ? `Update Coin - ${coin.symbol}` : 'Add New Coin'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="symbol" className="text-rose-600 font-medium">Coin Symbol</Label>
            <Input
              id="symbol"
              value={formData.symbol}
              onChange={(e) => handleInputChange('symbol', e.target.value.toUpperCase())}
              placeholder="e.g., BTC, ETH, SOL"
              required
              className="border-rose-200 focus:border-rose-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image_upload" className="text-rose-600 font-medium">Upload Coin Image</Label>
            <Input
              id="image_upload"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={imageUploading}
              className="border-rose-200 focus:border-rose-500"
            />
            {imageUploading && (
              <p className="text-sm text-rose-500">Uploading image...</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="image_url" className="text-rose-600 font-medium">Or Enter Image URL</Label>
            <Input
              id="image_url"
              value={formData.image_url}
              onChange={(e) => handleInputChange('image_url', e.target.value)}
              placeholder="https://example.com/coin-image.png"
              className="border-rose-200 focus:border-rose-500"
            />
          </div>

          {formData.image_url && (
            <div className="space-y-2">
              <Label className="text-rose-600 font-medium">Image Preview</Label>
              <div className="flex justify-center">
                <img 
                  src={formData.image_url} 
                  alt="Preview" 
                  className="w-20 h-20 rounded-lg object-cover border-2 border-rose-200"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/assets/default-hiMwPs0P.png';
                  }}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="profit_loss" className="text-rose-600 font-medium">Profit/Loss Percentage (%)</Label>
            <Input
              id="profit_loss"
              type="number"
              step="0.01"
              value={formData.profit_loss}
              onChange={(e) => handleInputChange('profit_loss', parseFloat(e.target.value) || 0)}
              placeholder="10"
              required
              className="border-rose-200 focus:border-rose-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status" className="text-rose-600 font-medium">Coin Status</Label>
            <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
              <SelectTrigger className="border-rose-200 focus:border-rose-500">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="border-rose-200 text-rose-600 hover:bg-rose-50">
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || imageUploading}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              {loading ? 'Saving...' : coin ? 'Update Coin' : 'Add Coin'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CoinFormModal;
