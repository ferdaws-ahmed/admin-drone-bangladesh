'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import CategoryManager from '../shared/CategoryManager';
import BasicInfoSection from '../shared/BasicInfoSection';
import TechSpecsSection from '../shared/TechSpecsSection';
import FaqSection from '../shared/FaqSection';
import { Save, FileText, Cpu, HelpCircle, Loader2, Package, ChevronDown } from 'lucide-react';
import adminApi from '@/lib/adminApi';

export default function AddHandheldsMain() {
  const [editId, setEditId] = useState(null);
  const [activeTab, setActiveTab] = useState('basic');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    category: '', // Category type from dropdown
    subCategory: '', // Subcategory from CategoryManager
    basic: {},
    specs: {},
    faqs: [],
    accessories: [],
    combos: [],
  });

  // Available categories
  const categories = ['Handheld', 'Accessories', 'Combo'];

  // Accessories and Combo state
  const [accessoriesList, setAccessoriesList] = useState([]);
  const [combosList, setCombosList] = useState([]);
  const [loadingAccessories, setLoadingAccessories] = useState(false);
  const [loadingCombos, setLoadingCombos] = useState(false);

  // Fetch accessories and combos on mount
  useEffect(() => {
    fetchAccessories();
    fetchCombos();
  }, []);

  useEffect(() => {
    setEditId(new URLSearchParams(window.location.search).get('edit'));
  }, []);

  useEffect(() => {
    if (!editId) return;
    const loadProduct = async () => {
      try {
        const response = await adminApi.products.getAdminProduct(editId, 'handheld');
        const product = response.data;
        setFormData({
          category: product.category || '',
          subCategory: product.subCategory || '',
          basic: { ...product, ...product.pricing, images: product.images || [], descriptionImage: product.descriptionImage || '' },
          specs: product.techSpecs || {}, faqs: product.faqs || [],
          accessories: (product.accessories || []).map((item) => item.toString()),
          combos: (product.combos || []).map((item) => item.toString()),
        });
      } catch (error) {
        console.error('Failed to load handheld product', error);
        toast.error('Unable to load product for editing');
      }
    };
    loadProduct();
  }, [editId]);

  const fetchAccessories = async () => {
    try {
      setLoadingAccessories(true);
      const response = await adminApi.handhelds.getByCategory('Accessories');
      setAccessoriesList(response.data || []);
    } catch (error) {
      console.error('Error fetching accessories:', error);
      toast.error('Failed to load accessories');
    } finally {
      setLoadingAccessories(false);
    }
  };

  const fetchCombos = async () => {
    try {
      setLoadingCombos(true);
      const response = await adminApi.handhelds.getByCategory('Combo');
      setCombosList(response.data || []);
    } catch (error) {
      console.error('Error fetching combos:', error);
      toast.error('Failed to load combos');
    } finally {
      setLoadingCombos(false);
    }
  };

  const handleSave = async () => {
    if (!formData.category) {
      toast.error('Please select a category type before saving!');
      return;
    }

    if (!formData.subCategory) {
      toast.error('Please select a subcategory before saving!');
      return;
    }

    if (!formData.basic?.title || !formData.basic?.productCode || !formData.basic?.regularPrice) {
      toast.error('Required fields (Title, SKU, Price) are missing!');
      setActiveTab('basic');
      return;
    }

    // Validate tech specs (optional - allow empty specs)
    // If specs exist, at least one should have a value
    if (formData.specs && Object.keys(formData.specs).length > 0) {
      const specValues = Object.values(formData.specs);
      const hasSpecValue = specValues.some(val => val && typeof val === 'string' && val.trim().length > 0);
      if (!hasSpecValue) {
        toast.error('If adding specs, please fill in at least one value!');
        setActiveTab('specs');
        return;
      }
    }

    // Validate FAQs
    if (!formData.faqs || formData.faqs.length === 0) {
      toast.error('Please add at least one FAQ!');
      setActiveTab('faq');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = editId
        ? await adminApi.products.updateProduct(editId, { ...formData, productType: 'handheld' })
        : await adminApi.handhelds.createHandheld(formData);
      
      toast.success(response.message || (editId ? 'Handheld product updated successfully!' : 'Handheld product created successfully!'));
      
      // Reset Form
      setFormData({
        category: '',
        subCategory: '',
        basic: {},
        specs: {},
        faqs: [],
        accessories: [],
        combos: [],
      });
    } catch (error) {
      console.error('Save error:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to save product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabs = [
    { id: 'basic', label: '1. General & Pricing', icon: FileText },
    { id: 'specs', label: '2. Technical Specs', icon: Cpu },
    { id: 'faq', label: '3. FAQs & Q/A', icon: HelpCircle },
  ];

  return (
    <div className="w-full space-y-5 p-4 md:p-6">
      
      {/* Top Bar */}
      <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Handheld Inventory Entry</h1>
          <p className="text-xs text-slate-500">Insert technical parameters & specification details.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSubmitting}
          type="button"
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-emerald-700 disabled:opacity-60 cursor-pointer"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          <span>{isSubmitting ? 'Saving...' : 'Save Handheld Data'}</span>
        </button>
      </div>

      {/* Category Dropdown */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Category Type</h3>
            <p className="text-xs text-slate-500">Select the category for this product.</p>
          </div>
          <div className="relative">
            <select
              value={formData.category}
              onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
              className="appearance-none bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 pr-10 text-sm font-semibold text-slate-700 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none cursor-pointer"
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Category Manager */}
      <CategoryManager
        selectedSubCategory={formData.subCategory}
        onSelectSubCategory={(cat) => setFormData((prev) => ({ ...prev, subCategory: cat }))}
        categoryType="handheld"
        allowAdd={true}
        allowDelete={true}
      />

      {/* Add Accessories and Combo Section */}
      {/* Only show if category type is NOT Accessories or Combo */}
      {formData.category !== 'Accessories' && formData.category !== 'Combo' && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center gap-2 text-slate-800 mb-4">
            <Package className="h-4 w-4 text-blue-600" />
            <h3 className="text-sm font-bold">Add Accessories and Combo</h3>
          </div>
          
          <div className="space-y-4">
            {/* Accessories Multi-Select */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">Accessories</label>
              {loadingAccessories ? (
                <div className="text-xs text-slate-500">Loading accessories...</div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 max-h-48 overflow-y-auto">
                  {accessoriesList.length > 0 ? (
                    accessoriesList.map((item) => (
                      <label 
                        key={item._id} 
                        className={`relative flex flex-col items-center p-2 rounded-lg border-2 cursor-pointer transition-all ${
                          formData.accessories.includes(item._id) 
                            ? 'border-blue-600 bg-blue-50' 
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.accessories.includes(item._id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData((prev) => ({
                                ...prev,
                                accessories: [...prev.accessories, item._id],
                              }));
                            } else {
                              setFormData((prev) => ({
                                ...prev,
                                accessories: prev.accessories.filter((id) => id !== item._id),
                              }));
                            }
                          }}
                          className="sr-only"
                        />
                        <div className="w-full h-14 mb-1.5 rounded-md overflow-hidden bg-slate-100">
                          {item.images && item.images.length > 0 ? (
                            <img 
                              src={item.images[0]} 
                              alt={item.title} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400 text-[10px]">
                              No Image
                            </div>
                          )}
                        </div>
                        <span className="text-[10px] font-medium text-slate-700 text-center line-clamp-2 leading-tight">{item.title}</span>
                        {formData.accessories.includes(item._id) && (
                          <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                            <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </label>
                    ))
                  ) : (
                    <div className="col-span-full text-xs text-slate-500 text-center py-4">No accessories available</div>
                  )}
                </div>
              )}
            </div>

            {/* Combos Multi-Select */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">Combos</label>
              {loadingCombos ? (
                <div className="text-xs text-slate-500">Loading combos...</div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 max-h-48 overflow-y-auto">
                  {combosList.length > 0 ? (
                    combosList.map((item) => (
                      <label 
                        key={item._id} 
                        className={`relative flex flex-col items-center p-2 rounded-lg border-2 cursor-pointer transition-all ${
                          formData.combos.includes(item._id) 
                            ? 'border-blue-600 bg-blue-50' 
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.combos.includes(item._id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData((prev) => ({
                                ...prev,
                                combos: [...prev.combos, item._id],
                              }));
                            } else {
                              setFormData((prev) => ({
                                ...prev,
                                combos: prev.combos.filter((id) => id !== item._id),
                              }));
                            }
                          }}
                          className="sr-only"
                        />
                        <div className="w-full h-14 mb-1.5 rounded-md overflow-hidden bg-slate-100">
                          {item.images && item.images.length > 0 ? (
                            <img 
                              src={item.images[0]} 
                              alt={item.title} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400 text-[10px]">
                              No Image
                            </div>
                          )}
                        </div>
                        <span className="text-[10px] font-medium text-slate-700 text-center line-clamp-2 leading-tight">{item.title}</span>
                        {formData.combos.includes(item._id) && (
                          <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                            <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </label>
                    ))
                  ) : (
                    <div className="col-span-full text-xs text-slate-500 text-center py-4">No combos available</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab Controls */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-bold transition ${
                isActive ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Icon className="h-3.5 w-3.5" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        {activeTab === 'basic' && (
          <BasicInfoSection
            data={formData.basic}
            onChange={(val) => setFormData((prev) => ({ ...prev, basic: val }))}
            productType="Handheld"
          />
        )}
        {activeTab === 'specs' && (
          <TechSpecsSection
            data={formData.specs}
            onChange={(val) => setFormData((prev) => ({ ...prev, specs: val }))}
            productType="Handheld"
          />
        )}
        {activeTab === 'faq' && (
          <FaqSection
            faqs={formData.faqs}
            onChange={(val) => setFormData((prev) => ({ ...prev, faqs: val }))}
          />
        )}
      </div>

    </div>
  );
}
