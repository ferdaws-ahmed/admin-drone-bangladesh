'use client';

import { useState } from 'react';
import {
  LayoutTemplate,
  Star,
  Zap,
  Users,
  ExternalLink,
} from 'lucide-react';
import FeaturedCategoriesTab  from './FeaturedCategoriesTab';
import ProductFlagsTab        from './ProductFlagsTab';
import HonorableCustomersTab  from './HonorableCustomersTab';
import { STORE_URL }          from '@/lib/adminApi';

// ─── Tab config ───────────────────────────────────────────────────────────────
const TABS = [
  {
    id:          'categories',
    label:       'Featured Categories',
    shortLabel:  'Categories',
    icon:        Star,
    description: 'Select up to 4 drone categories to feature on the home page.',
    badge:       'max 4',
    badgeColor:  'bg-blue-100 text-blue-700',
  },
  {
    id:          'products',
    label:       'Product Sections',
    shortLabel:  'Products',
    icon:        Zap,
    description: 'Assign New Arrival, DJI, Personal, and Beginner flags to products.',
    badge:       '4 sections',
    badgeColor:  'bg-violet-100 text-violet-700',
  },
  {
    id:          'customers',
    label:       'Honorable Customers',
    shortLabel:  'Customers',
    icon:        Users,
    description: 'Add customer stories shown in the home page slider and /customers page.',
    badge:       'slider',
    badgeColor:  'bg-emerald-100 text-emerald-700',
  },
];

// ─── Home page section map (for preview strip) ────────────────────────────────
const SECTIONS = [
  { label: 'Hero Slider',          note: 'Static — managed in code',        color: 'bg-slate-200' },
  { label: 'Brand / Feature Strip',note: 'Static — always visible',         color: 'bg-slate-200' },
  { label: 'Featured Categories',  note: 'Dynamic → Categories tab',        color: 'bg-blue-200' },
  { label: 'New Arrivals',         note: 'Dynamic → isNewArrival flag',     color: 'bg-violet-200' },
  { label: 'DJI Drones',           note: 'Dynamic → isDjiDrone flag',       color: 'bg-violet-200' },
  { label: 'Personal Drones',      note: 'Dynamic → isPersonalDrone flag',  color: 'bg-violet-200' },
  { label: 'Beginner Drones',      note: 'Dynamic → isBeginnerDrone flag',  color: 'bg-violet-200' },
  { label: 'Honorable Customers',  note: 'Dynamic → Customers tab',         color: 'bg-emerald-200' },
  { label: 'Visit Our Stores',     note: 'Static — always visible',         color: 'bg-slate-200' },
];

// ─── Page Structure Preview ───────────────────────────────────────────────────
function PageStructurePreview() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Page Layout</p>
          <h3 className="text-sm font-bold text-slate-800 mt-0.5">Home Page Section Order</h3>
        </div>
        <a
          href={STORE_URL || 'http://localhost:3000'}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
        >
          <ExternalLink className="h-3.5 w-3.5" /> Preview Store
        </a>
      </div>

      <div className="space-y-1.5 pt-1">
        {SECTIONS.map((section, idx) => (
          <div
            key={idx}
            className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-2.5"
          >
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-600">
              {idx + 1}
            </span>
            <div className={`h-2 w-2 rounded-full shrink-0 ${section.color}`} />
            <div className="flex-1 min-w-0">
              <span className="text-xs font-semibold text-slate-800">{section.label}</span>
            </div>
            <span className="text-[10px] text-slate-400 truncate hidden sm:block">{section.note}</span>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 pt-2 border-t border-slate-100">
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
          <span className="h-2 w-2 rounded-full bg-slate-300" /> Static
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-blue-600">
          <span className="h-2 w-2 rounded-full bg-blue-300" /> Categories tab
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-violet-600">
          <span className="h-2 w-2 rounded-full bg-violet-300" /> Products tab
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-emerald-600">
          <span className="h-2 w-2 rounded-full bg-emerald-300" /> Customers tab
        </div>
      </div>
    </div>
  );
}

// ─── HomePageManager ──────────────────────────────────────────────────────────
export default function HomePageManager() {
  const [activeTab, setActiveTab] = useState('categories');

  const currentTab = TABS.find((t) => t.id === activeTab);

  return (
    <div className="space-y-6">

      {/* ── Page Header ────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
            Content Management
          </p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <LayoutTemplate className="h-6 w-6 text-blue-600" />
            Home Page Control
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage featured categories, product sections, and customer stories shown on the storefront home page.
          </p>
        </div>
        <a
          href={STORE_URL || 'http://localhost:3000'}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition shrink-0"
        >
          <ExternalLink className="h-4 w-4 text-blue-500" />
          View Store
        </a>
      </div>

      {/* ── Page structure preview ──────────────────────────────────────────── */}
      <PageStructurePreview />

      {/* ── Tab Navigation ─────────────────────────────────────────────────── */}
      <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Home page management tabs">
        {TABS.map((tab) => {
          const Icon    = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(tab.id)}
              className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.shortLabel}</span>
              <span
                className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${
                  isActive ? 'bg-white/20 text-white' : tab.badgeColor
                }`}
              >
                {tab.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Active Tab Description ──────────────────────────────────────────── */}
      <div className="rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <div className="flex items-center gap-3">
          {currentTab && (
            <>
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50">
                <currentTab.icon className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">{currentTab.label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{currentTab.description}</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Tab Content ────────────────────────────────────────────────────── */}
      <div role="tabpanel">
        {activeTab === 'categories' && <FeaturedCategoriesTab />}
        {activeTab === 'products'   && <ProductFlagsTab />}
        {activeTab === 'customers'  && <HonorableCustomersTab />}
      </div>

    </div>
  );
}
