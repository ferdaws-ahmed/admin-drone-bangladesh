'use client';

import { useState } from 'react';
import { InputGroup, SelectGroup } from './ProductFormHelpers';
import { Upload, X, Image as ImageIcon, Tag, DollarSign, Layers, Loader2, Plus, Minus } from 'lucide-react';
import { compressImage } from '@/lib/optimizeImage';

export default function BasicInfoSection({ data, onChange, productType = 'Drone' }) {
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  const update = (field, val) => onChange({ ...data, [field]: val });

  // Handle Regular Price
  const handleRegularPrice = (val) => {
    const regular = parseFloat(val) || 0;
    const discount = parseFloat(data.discountPercent) || 0;
    
    let offer = data.offerPrice;
    let savings = data.savingsAmount;

    if (discount > 0) {
      savings = (regular * discount) / 100;
      offer = regular - savings;
    } else if (data.offerPrice) {
      savings = regular - parseFloat(data.offerPrice || 0);
    }

    onChange({
      ...data,
      regularPrice: val,
      offerPrice: offer > 0 ? offer : '',
      savingsAmount: savings > 0 ? savings : 0,
    });
  };

  // Handle Discount Input (% Mode)
  const handleDiscountChange = (val) => {
    const discount = parseFloat(val) || 0;
    const regular = parseFloat(data.regularPrice) || 0;

    if (val === '' || discount === 0) {
      onChange({ ...data, discountPercent: '', offerPrice: '', savingsAmount: 0 });
      return;
    }

    const savings = (regular * discount) / 100;
    const offer = regular - savings;

    onChange({
      ...data,
      discountPercent: val,
      offerPrice: offer > 0 ? offer : '',
      savingsAmount: savings > 0 ? savings : 0,
    });
  };

  // Handle Direct Offer Price Input
  const handleOfferPriceChange = (val) => {
    const offer = parseFloat(val) || 0;
    const regular = parseFloat(data.regularPrice) || 0;

    if (val === '') {
      onChange({ ...data, offerPrice: '', savingsAmount: 0 });
      return;
    }

    const savings = regular - offer;
    onChange({
      ...data,
      offerPrice: val,
      discountPercent: '',
      savingsAmount: savings > 0 ? savings : 0,
    });
  };

  // Optimized Gallery Upload Handler
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    const currentImages = data.images || [];

    if (currentImages.length + files.length > 5) {
      alert('Maximum 5 product images allowed!');
      return;
    }

    try {
      setUploadingGallery(true);
      const processed = await Promise.all(
        files.map((file) => compressImage(file, 1200, 0.8))
      );
      update('images', [...currentImages, ...processed]);
    } catch (err) {
      console.error('Failed to compress gallery images:', err);
    } finally {
      setUploadingGallery(false);
    }
  };

  // Optimized Description Banner Upload Handler
  const handleBannerUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingBanner(true);
      const optimizedBanner = await compressImage(file, 1200, 0.8);
      update('descriptionImage', optimizedBanner);
    } catch (err) {
      console.error('Failed to compress banner image:', err);
    } finally {
      setUploadingBanner(false);
    }
  };

  const removeImage = (index) => {
    const updated = (data.images || []).filter((_, i) => i !== index);
    update('images', updated);
  };

  return (
    <div className="space-y-6">
      
      {/* 1. General Details */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3 text-slate-900">
          <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
            <Layers className="h-4 w-4" />
          </div>
          <h2 className="text-base font-bold">General Information</h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <InputGroup label={`${productType} Full Title`} placeholder={`e.g. DJI Mini 5 Pro`} value={data.title} onChange={(v) => update('title', v)} required />
          <InputGroup label="Product SKU / Code" placeholder="e.g. DRN-45168" value={data.productCode} onChange={(v) => update('productCode', v)} required />
          <InputGroup label="Brand Name" placeholder="e.g. DJI" value={data.brand} onChange={(v) => update('brand', v)} />
          <SelectGroup
            label="Stock Status"
            value={data.stockStatus || 'In Stock'}
            onChange={(v) => update('stockStatus', v)}
            options={['In Stock', 'Out of Stock', 'Pre-Order']}
          />
          <InputGroup label="Warranty Info" placeholder="e.g. 1 Year Official" value={data.warranty} onChange={(v) => update('warranty', v)} />
        </div>

        {/* Key Features Section */}
        <div className="border-t border-slate-100 pt-4">
          <label className="text-sm font-bold text-slate-900 mb-3 block">Key Features</label>
          <div className="space-y-2">
            {(data.keyFeatures || []).map((feature, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={feature}
                  onChange={(e) => {
                    const updated = [...(data.keyFeatures || [])];
                    updated[index] = e.target.value;
                    update('keyFeatures', updated);
                  }}
                  placeholder={`Feature ${index + 1}`}
                  className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    const updated = (data.keyFeatures || []).filter((_, i) => i !== index);
                    update('keyFeatures', updated);
                  }}
                  className="p-2 bg-rose-100 text-rose-600 rounded-lg hover:bg-rose-200 transition cursor-pointer"
                >
                  <Minus className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => update('keyFeatures', [...(data.keyFeatures || []), ''])}
              className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 text-xs font-bold rounded-lg hover:bg-blue-100 transition cursor-pointer border border-blue-200"
            >
              <Plus className="h-4 w-4" />
              Add Feature
            </button>
          </div>
        </div>
      </div>

      {/* 2. Pricing Architecture */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 text-slate-900">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <DollarSign className="h-4 w-4" />
            </div>
            <h2 className="text-base font-bold">Pricing Strategy</h2>
          </div>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
            Discount % OR Direct Offer Price
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/80">
          <InputGroup 
            label="Regular Price (BDT)" 
            type="number" 
            placeholder="140000" 
            value={data.regularPrice} 
            onChange={handleRegularPrice} 
            required 
          />

          <div>
            <InputGroup 
              label="Discount (%)" 
              type="number" 
              placeholder="10" 
              value={data.discountPercent} 
              onChange={handleDiscountChange} 
              disabled={Boolean(data.offerPrice && !data.discountPercent)} 
            />
            {data.offerPrice && !data.discountPercent && (
              <span className="text-xs text-slate-400 mt-1 block">Disabled (Offer Price in use)</span>
            )}
          </div>

          <div>
            <InputGroup 
              label="Offer Price (BDT)" 
              type="number" 
              placeholder="126000" 
              value={data.offerPrice} 
              onChange={handleOfferPriceChange} 
              disabled={Boolean(data.discountPercent)} 
            />
            {data.discountPercent && (
              <span className="text-xs text-blue-600 font-medium mt-1 block">Auto-calculated from {data.discountPercent}% OFF</span>
            )}
          </div>
        </div>

        {data.savingsAmount > 0 && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-sm font-bold">
            <Tag className="h-4 w-4" />
            <span>Customer Savings: ৳{data.savingsAmount.toLocaleString()} BDT</span>
          </div>
        )}

        {/* EMI Percentage */}
        <div className="border-t border-slate-100 pt-4">
          <InputGroup
            label="EMI Percentage (%)"
            type="number"
            placeholder="e.g. 5"
            value={data.emiPercentage || ''}
            onChange={(v) => update('emiPercentage', v)}
            helperText="Additional percentage added to regular price for EMI"
          />
        </div>
      </div>

      {/* 3. Product Gallery */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <label className="text-base font-bold text-slate-900">Product Image Gallery (Max 5)</label>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
            {(data.images || []).length} / 5 Uploaded
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
          {(data.images || []).map((img, idx) => (
            <div key={idx} className="relative aspect-square rounded-xl border border-slate-200 bg-white p-1 shadow-xs overflow-hidden group">
              <img src={img} alt="Product" className="w-full h-full object-cover rounded-lg" />
              <button
                type="button"
                onClick={() => removeImage(idx)}
                className="absolute top-1.5 right-1.5 bg-rose-600/90 text-white p-1 rounded-full hover:bg-rose-600 transition shadow cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}

          {(data.images || []).length < 5 && (
            <label className="flex flex-col items-center justify-center aspect-square rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-blue-50/50 hover:border-blue-500 transition cursor-pointer text-center p-2">
              {uploadingGallery ? (
                <Loader2 className="h-5 w-5 text-blue-600 animate-spin mb-1" />
              ) : (
                <Upload className="h-5 w-5 text-slate-500 mb-1" />
              )}
              <span className="text-xs font-bold text-slate-700">
                {uploadingGallery ? 'Optimizing...' : 'Upload Image'}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5">Auto WebP Compress</span>
              <input
                type="file"
                accept="image/*"
                multiple
                disabled={uploadingGallery}
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          )}
        </div>
      </div>

      {/* 4. Detailed Description & Feature Banner */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs space-y-4">
        <label className="text-base font-bold text-slate-900 block border-b border-slate-100 pb-3">
          Description & Spec Banner
        </label>
        
        <textarea
          rows={4}
          placeholder="Detailed specification overview, features & payload capabilities..."
          value={data.description || ''}
          onChange={(e) => update('description', e.target.value)}
          className="w-full rounded-xl border border-slate-300 p-3 text-sm text-slate-900 transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
        />

        {data.descriptionImage ? (
          <div className="relative max-w-md h-40 rounded-xl overflow-hidden border border-slate-200 shadow-xs">
            <img src={data.descriptionImage} alt="Description Banner" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => update('descriptionImage', null)}
              className="absolute top-2 right-2 bg-rose-600/90 text-white p-1.5 rounded-full hover:bg-rose-600 transition shadow cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <label className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg cursor-pointer transition border border-slate-200">
            {uploadingBanner ? (
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            ) : (
              <ImageIcon className="h-4 w-4 text-slate-600" />
            )}
            <span>{uploadingBanner ? 'Optimizing Banner...' : 'Add Detail Feature Banner'}</span>
            <input 
              type="file" 
              accept="image/*" 
              disabled={uploadingBanner}
              onChange={handleBannerUpload} 
              className="hidden" 
            />
          </label>
        )}
      </div>

    </div>
  );
}
