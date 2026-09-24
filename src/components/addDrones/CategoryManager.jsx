'use client';

import { useState, useEffect } from 'react';
import { Upload, Plus, CheckCircle2, Loader2, X } from 'lucide-react';
import { compressImage } from '@/lib/optimizeImage';
import adminApi from '@/lib/adminApi';
import toast from 'react-hot-toast';

export default function CategoryManager({ selectedSubCategory, onSelectSubCategory }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // New Category Form State
  const [newCatName, setNewCatName] = useState('');
  const [newCatImage, setNewCatImage] = useState('');
  const [isCompressing, setIsCompressing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // 1. Fetch categories using adminApi service
  const fetchCategories = async () => {
    try {
      setLoading(true);
      console.log('Fetching categories from API...');
      
      // Check if user is authenticated
      const token = localStorage.getItem('admin_token');
      console.log('Auth token exists:', !!token);
      console.log('Auth token:', token ? token.substring(0, 20) + '...' : 'none');
      
      const res = await adminApi.categories.getAll();
      console.log('Categories API response:', res);
      
      // ডাটা স্ট্রাকচার হ্যান্ডেলিং
      const list = res.data || res.categories || res || [];
      console.log('Categories list:', list);
      setCategories(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      console.error('Error details:', err.message, err.stack);
      toast.error(`Failed to load categories: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // 2. Handle Image Compression
  const handleImageFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsCompressing(true);
      const optimizedBase64 = await compressImage(file, 600, 0.75);
      setNewCatImage(optimizedBase64);
    } catch (err) {
      toast.error('Image compression failed');
    } finally {
      setIsCompressing(false);
    }
  };

  // 3. Create New Category
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) {
      toast.error('Category name is required!');
      return;
    }

    try {
      setIsSaving(true);
      const payload = { name: newCatName.trim(), image: newCatImage };

      const res = await adminApi.categories.create(payload);
      toast.success('Category added successfully!');

      setNewCatName('');
      setNewCatImage('');
      setShowAddForm(false);
      fetchCategories();
      
      const createdName = res.data?.name || res.name || payload.name;
      if (createdName) {
        onSelectSubCategory(createdName);
      }
    } catch (err) {
      console.error('Failed to save category:', err);
      toast.error(err.message || 'Failed to create category');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-800">Category Selection</h3>
          <p className="text-xs text-slate-500">Select a category or add a new one with an image.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-100 transition cursor-pointer"
        >
          {showAddForm ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
          <span>{showAddForm ? 'Cancel' : 'Add Category'}</span>
        </button>
      </div>

      {/* Dynamic Category List */}
      {loading ? (
        <div className="flex items-center gap-2 text-xs text-slate-500 py-2">
          <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
          <span>Loading categories...</span>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2.5">
          {categories.map((cat) => {
            const catName = typeof cat === 'string' ? cat : cat.name;
            const catImg = typeof cat === 'object' ? cat.image : null;
            const isSelected = selectedSubCategory === catName;

            return (
              <button
                key={cat._id || catName}
                type="button"
                onClick={() => onSelectSubCategory(catName)}
                className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer border ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {catImg && (
                  <img src={catImg} alt={catName} className="h-5 w-5 rounded object-cover" />
                )}
                <span>{catName}</span>
                {isSelected && <CheckCircle2 className="h-3.5 w-3.5 ml-0.5" />}
              </button>
            );
          })}
        </div>
      )}

      {/* Form to Add New Category */}
      {showAddForm && (
        <form onSubmit={handleCreateCategory} className="pt-4 border-t border-slate-100 space-y-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
          <h4 className="text-xs font-bold text-slate-800">Add New Category</h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Category Name</label>
              <input
                type="text"
                placeholder="e.g. Agricultural Drones"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs focus:border-blue-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Category Image</label>
              {newCatImage ? (
                <div className="relative w-16 h-10 rounded border border-slate-200 overflow-hidden group">
                  <img src={newCatImage} alt="Category" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setNewCatImage('')}
                    className="absolute top-0.5 right-0.5 bg-rose-600 text-white p-0.5 rounded-full cursor-pointer"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:border-blue-500 rounded-lg cursor-pointer text-xs font-semibold text-slate-600">
                  {isCompressing ? <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600" /> : <Upload className="h-3.5 w-3.5" />}
                  <span>{isCompressing ? 'Compressing...' : 'Select Device Image'}</span>
                  <input type="file" accept="image/*" disabled={isCompressing} onChange={handleImageFile} className="hidden" />
                </label>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={isSaving || isCompressing}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition disabled:opacity-60 cursor-pointer"
            >
              {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>{isSaving ? 'Saving...' : 'Save Category'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}