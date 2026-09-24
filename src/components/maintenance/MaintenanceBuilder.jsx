'use client';

/**
 * MaintenanceBuilder — admin orchestration for the Maintenance section.
 *
 * Tabs:
 *   1. Packages          — CRUD for service tiers shown on the public page
 *   2. Maintenance Requests — booking leads submitted by customers
 */

import { useState } from 'react';
import { Wrench, Inbox } from 'lucide-react';
import PackagesTab        from './PackagesTab';
import ServiceRequestsTab from './ServiceRequestsTab';

const TABS = [
  { id: 'packages', label: 'Packages',              icon: Wrench },
  { id: 'requests', label: 'Maintenance Requests',  icon: Inbox  },
];

export default function MaintenanceBuilder() {
  const [activeTab, setActiveTab] = useState('packages');

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Maintenance</h1>
        <p className="mt-0.5 text-sm text-slate-500">
          Manage service packages and customer booking requests.
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex items-center gap-1 border-b border-slate-200">
        {TABS.map((tab) => {
          const Icon     = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`-mb-px inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
                isActive
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div>
        {activeTab === 'packages' && <PackagesTab />}
        {activeTab === 'requests' && <ServiceRequestsTab />}
      </div>
    </div>
  );
}
