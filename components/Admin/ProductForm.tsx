import React, { useState, useRef } from 'react';
import { Product } from '../../types';
import { Button } from '../ui/Button';
import { Input, TextArea } from '../ui/Input';
import { analyzeFlowerImage } from '../../services/geminiService';
import { fileToBase64 } from '../../services/storageService';
import { Sparkles, Upload, X } from 'lucide-react';

interface ProductFormProps {
  initialData?: Partial<Product>;
  onSave: (product: Product) => void;
  onCancel: () => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({ initialData, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Product>>(initialData || {
    name: '',
    description: '',
    price: 0,
    category: '',
    tags: [],
    inStock: true
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(initialData?.imageUrl || '');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      // Create local preview
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleAIAutoFill = async () => {
    if (!imageFile) {
      setError("Please upload an image first for AI analysis.");
      return;
    }

    setIsAnalyzing(true);
    setError('');

    try {
      const base64 = await fileToBase64(imageFile);
      const result = await analyzeFlowerImage(base64);

      setFormData(prev => ({
        ...prev,
        name: result.name,
        description: result.description,
        price: result.price,
        category: result.category,
        tags: result.tags
      }));
    } catch (err) {
      setError("AI Analysis failed. Please try again or fill manually.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price) {
      setError("Name and Price are required.");
      return;
    }

    let finalImageUrl = previewUrl;
    
    // In a real app, we would upload the imageFile to S3/Cloudinary here.
    // For this demo, we'll store the base64 string if it's a new file.
    if (imageFile) {
        finalImageUrl = await fileToBase64(imageFile);
    }

    onSave({
      id: initialData?.id || Date.now().toString(),
      name: formData.name,
      description: formData.description || '',
      price: Number(formData.price),
      imageUrl: finalImageUrl,
      category: formData.category || 'General',
      tags: formData.tags || [],
      inStock: formData.inStock ?? true,
    });
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg max-w-3xl mx-auto border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-serif text-gray-900">
          {initialData ? 'Edit Product' : 'Add New Product'}
        </h2>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
          <X className="h-6 w-6" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column: Image Upload */}
        <div className="space-y-4">
            <div 
              className={`relative aspect-[4/5] bg-gray-50 border-2 border-dashed rounded-lg flex items-center justify-center overflow-hidden cursor-pointer hover:bg-gray-100 transition-colors ${!previewUrl ? 'border-gray-300' : 'border-primary'}`}
              onClick={() => fileInputRef.current?.click()}
            >
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center text-gray-500">
                  <Upload className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-medium">Click to upload image</p>
                </div>
              )}
              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleFileChange}
              />
            </div>

            {/* AI Action */}
            <Button 
              type="button" 
              onClick={handleAIAutoFill} 
              disabled={!imageFile || isAnalyzing}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-none shadow-lg hover:shadow-xl"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              {isAnalyzing ? 'Analyzing with Gemini...' : 'Auto-Fill Details with AI'}
            </Button>
            {error && <p className="text-red-500 text-xs text-center">{error}</p>}
        </div>

        {/* Right Column: Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            label="Product Name" 
            value={formData.name} 
            onChange={e => setFormData({...formData, name: e.target.value})}
            placeholder="e.g. Summer Breeze"
          />
          
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Price ($)" 
              type="number" 
              step="0.01"
              value={formData.price} 
              onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})}
            />
             <Input 
              label="Category" 
              value={formData.category} 
              onChange={e => setFormData({...formData, category: e.target.value})}
              placeholder="e.g. Wedding"
            />
          </div>

          <TextArea 
            label="Description" 
            rows={4}
            value={formData.description} 
            onChange={e => setFormData({...formData, description: e.target.value})}
            placeholder="Describe the arrangement..."
          />

          <Input 
            label="Tags (comma separated)" 
            value={formData.tags?.join(', ')} 
            onChange={e => setFormData({...formData, tags: e.target.value.split(',').map(s => s.trim())})}
            placeholder="rose, red, love"
          />

           <div className="flex items-center space-x-2 pt-2">
            <input 
              type="checkbox" 
              id="inStock"
              checked={formData.inStock}
              onChange={e => setFormData({...formData, inStock: e.target.checked})}
              className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label htmlFor="inStock" className="text-sm text-gray-700">Available in Stock</label>
          </div>

          <div className="pt-4 flex gap-3">
             <Button type="button" variant="ghost" onClick={onCancel} className="flex-1">
               Cancel
             </Button>
             <Button type="submit" variant="primary" className="flex-1">
               Save Product
             </Button>
          </div>
        </form>
      </div>
    </div>
  );
};