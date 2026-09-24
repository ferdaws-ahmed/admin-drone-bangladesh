'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Cpu, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export default function TechSpecsSection({ data = {}, onChange, productType = 'Drone' }) {
  // All specs stored in one object
  const specs = data || {};

  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');

  // Get all spec keys from specs object
  const allSpecKeys = Object.keys(specs);

  // Update Spec Field
  const handleSpecChange = (key, val) => {
    onChange({
      ...specs,
      [key]: val,
    });
  };

  // Add New Spec Field
  const handleAddSpec = () => {
    if (!newKey.trim()) {
      toast.error('Spec title is required!');
      return;
    }

    // Check for duplicate title
    if (allSpecKeys.includes(newKey.trim())) {
      toast.error('Spec title already exists!');
      return;
    }

    const updatedSpecs = {
      ...specs,
      [newKey.trim()]: newValue.trim(),
    };

    onChange(updatedSpecs);

    setNewKey('');
    setNewValue('');
  };

  // Remove Spec Field
  const handleRemoveSpec = (key) => {
    const updatedSpecs = { ...specs };
    delete updatedSpecs[key];
    onChange(updatedSpecs);
  };

  // Remove All Specs
  const handleRemoveAllSpecs = () => {
    onChange({});
  };

  return (
    <div className="space-y-8">
      
      {/* 1. All Specifications */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-800">
            <Cpu className="h-4 w-4 text-blue-600" />
            <h2 className="text-sm font-bold tracking-tight">Technical Specifications</h2>
          </div>
          {Object.keys(specs).length > 0 && (
            <button
              type="button"
              onClick={handleRemoveAllSpecs}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 transition"
            >
              Clear All
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {allSpecKeys.map((key) => {
            return (
              <div key={key} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700 block">{key}</label>
                  <button
                    type="button"
                    onClick={() => handleRemoveSpec(key)}
                    className="text-slate-400 hover:text-rose-600 transition p-0.5"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Enter value"
                  value={specs[key] || ''}
                  onChange={(e) => handleSpecChange(key, e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 hover:border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none shadow-sm transition"
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Add New Specification */}
      <div className="pt-6 space-y-4 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-800">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <h2 className="text-sm font-bold tracking-tight">Add Specification</h2>
          </div>
          <span className="text-[11px] font-medium text-slate-400">Add fields dynamically</span>
        </div>

        {/* Input Bar for New Spec */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
          <div className="sm:col-span-2">
            <input
              type="text"
              placeholder="Spec Title (e.g. Battery Life)"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none shadow-sm"
            />
          </div>

          <div className="sm:col-span-2">
            <input
              type="text"
              placeholder="Spec Value (e.g. 4 hours)"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none shadow-sm"
            />
          </div>

          <button
            type="button"
            onClick={handleAddSpec}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition shadow-sm"
          >
            <Plus className="h-4 w-4" /> Add Field
          </button>
        </div>
      </div>

    </div>
  );
}
