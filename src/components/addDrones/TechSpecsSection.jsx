'use client';

import { useState } from 'react';
import { Plus, Trash2, Cpu, Sparkles } from 'lucide-react';

export default function TechSpecsSection({ data = {}, onChange }) {
  // Existing specs schema/object
  const specs = data.customSpecs || [];

  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');

  // Default Standard Drone Specs Fields
  const standardSpecs = [
    { key: 'Takeoff Weight', placeholder: 'e.g. 249 g' },
    { key: 'Max Flight Time', placeholder: 'e.g. 47 mins' },
    { key: 'Max Flight Distance', placeholder: 'e.g. 20 km' },
    { key: 'Video Transmission', placeholder: 'e.g. O4 (1080p/60fps)' },
    { key: 'Camera Sensor', placeholder: 'e.g. 1/1.3-inch CMOS' },
    { key: 'Obstacle Sensing', placeholder: 'e.g. Omnidirectional' },
  ];

  // Update Standard Spec Field
  const handleStandardChange = (key, val) => {
    onChange({
      ...data,
      standard: {
        ...(data.standard || {}),
        [key]: val,
      },
    });
  };

  // Add Dynamic Custom Spec Key-Value
  const handleAddCustomSpec = () => {
    if (!newKey.trim() || !newValue.trim()) return;

    const updatedCustom = [...specs, { id: Date.now(), key: newKey.trim(), value: newValue.trim() }];
    onChange({
      ...data,
      customSpecs: updatedCustom,
    });

    setNewKey('');
    setNewValue('');
  };

  // Remove Dynamic Custom Spec
  const handleRemoveCustomSpec = (id) => {
    const updatedCustom = specs.filter((item) => item.id !== id);
    onChange({
      ...data,
      customSpecs: updatedCustom,
    });
  };

  return (
    <div className="space-y-8 divide-y divide-slate-100">
      
      {/* 1. Standard Technical Specifications */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-slate-800">
          <Cpu className="h-4 w-4 text-blue-600" />
          <h2 className="text-sm font-bold tracking-tight">Standard Specifications</h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {standardSpecs.map((item) => (
            <div key={item.key} className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">{item.key}</label>
              <input
                type="text"
                placeholder={item.placeholder}
                value={(data.standard && data.standard[item.key]) || ''}
                onChange={(e) => handleStandardChange(item.key, e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 hover:border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none shadow-sm transition"
              />
            </div>
          ))}
        </div>
      </div>

      {/* 2. Dynamic Custom Specification Builder */}
      <div className="pt-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-800">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <h2 className="text-sm font-bold tracking-tight">Add Custom Specifications</h2>
          </div>
          <span className="text-[11px] font-medium text-slate-400">Add any extra features dynamically</span>
        </div>

        {/* Input Bar for New Custom Spec */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
          <div className="sm:col-span-2">
            <input
              type="text"
              placeholder="Spec Title (e.g. Thermal Resolution)"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none shadow-sm"
            />
          </div>

          <div className="sm:col-span-2">
            <input
              type="text"
              placeholder="Spec Value (e.g. 640×512 @ 30 Hz)"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none shadow-sm"
            />
          </div>

          <button
            type="button"
            onClick={handleAddCustomSpec}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition shadow-sm"
          >
            <Plus className="h-4 w-4" /> Add Spec
          </button>
        </div>

        {/* Custom Specifications List */}
        {specs.length > 0 && (
          <div className="space-y-2 pt-2">
            <label className="text-xs font-bold text-slate-700 block">Added Custom Specs ({specs.length}):</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {specs.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between bg-white border border-slate-200 rounded-lg px-3.5 py-2 shadow-sm"
                >
                  <div className="text-xs">
                    <span className="font-semibold text-slate-700">{item.key}: </span>
                    <span className="text-slate-600">{item.value}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveCustomSpec(item.id)}
                    className="text-slate-400 hover:text-rose-600 transition p-1"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}