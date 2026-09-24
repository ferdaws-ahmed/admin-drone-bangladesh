'use client';

import { useState } from 'react';
import { User, ShieldCheck, Save } from 'lucide-react';

const initialProfile = {
  name: 'Admin User',
  email: 'admin@dronebangladesh.com',
  role: 'Super Admin',
};

export default function AdminProfileView() {
  const [profile, setProfile] = useState(initialProfile);

  const handleChange = (field, value) => {
    setProfile((current) => ({ ...current, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Admin Profile</h1>
        <p className="text-sm text-slate-500">Update account information and security preferences.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-blue-100 text-2xl font-bold text-blue-700">
            {profile.name.charAt(0)}
          </div>
          <div className="mt-5 text-center">
            <h2 className="text-xl font-semibold text-slate-800">{profile.name}</h2>
            <p className="mt-1 text-sm text-slate-500">{profile.role}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
              <User className="h-4 w-4 text-slate-600" />
              <input
                value={profile.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full border-none bg-transparent text-sm text-slate-700 outline-none"
              />
            </div>

            <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
              <ShieldCheck className="h-4 w-4 text-slate-600" />
              <input
                value={profile.role}
                onChange={(e) => handleChange('role', e.target.value)}
                className="w-full border-none bg-transparent text-sm text-slate-700 outline-none"
              />
            </div>

            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
              {profile.email}
            </div>

            <button className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700">
              <Save className="h-4 w-4" />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
