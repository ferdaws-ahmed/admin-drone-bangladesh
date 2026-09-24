'use client';

import { useCallback, useEffect, useState } from 'react';
import { Save, Loader2, ImageIcon, Type, Phone, Mail, MapPin, RefreshCw } from 'lucide-react';
import adminApi from '@/lib/adminApi';
import useAdminFetch from '@/hooks/useAdminFetch';

const EMPTY = {
  bannerImageUrl: '',
  heading:        'Professional Drone Maintenance & Repair',
  subheading:     'Keep your drone performing at its peak with our certified technicians.',
  contactPhone:   '+880 1317-768213',
  contactEmail:   'dronebangladesh567@gmail.com',
  contactAddress: 'Level-1, Block-B, Shop-43, Bashundhara City Shopping Complex, Dhaka-1215',
};

// ── small labelled field ──────────────────────────────────────────────────────
function Field({ icon: Icon, label, type = 'text', value, onChange, placeholder, rows }) {
  const shared = 'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition placeholder:text-slate-400';
  return (
    <div className="space-y-1">
      <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
        {Icon && <Icon className="h-3.5 w-3.5 text-slate-400" />}
        {label}
      </label>
      {rows ? (
        <textarea rows={rows} value={value} onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder} className={`${shared} resize-none`} />
      ) : (
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder} className={shared} />
      )}
    </div>
  );
}

export default function PageContentTab() {
  const [form,    setForm]    = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState(false);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  // ── fetch current content ─────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.maintenance.pageContent.get();
      if (res?.success && res.data) {
        setForm({
          bannerImageUrl: res.data.bannerImageUrl || '',
          heading:        res.data.heading        || EMPTY.heading,
          subheading:     res.data.subheading     || EMPTY.subheading,
          contactPhone:   res.data.contactPhone   || EMPTY.contactPhone,
          contactEmail:   res.data.contactEmail   || EMPTY.contactEmail,
          contactAddress: res.data.contactAddress || EMPTY.contactAddress,
        });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── save ──────────────────────────────────────────────────────────────────
  const { loading: saving, fire: save } = useAdminFetch({
    fn: adminApi.maintenance.pageContent.update,
    successMessage: 'Page content saved successfully.',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    save(form);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400">
        <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading content…
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-800">Page Content</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Controls the banner, hero text and contact info on the public Maintenance page.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={load}
            className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 transition" title="Refresh">
            <RefreshCw className="h-4 w-4" />
          </button>
          <button type="submit" disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-60 transition shadow-sm">
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            Save Changes
          </button>
        </div>
      </div>

      {/* Banner section */}
      <section className="rounded-xl border border-slate-200 bg-slate-50/50 p-5 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Hero Banner</h3>

        <Field
          icon={ImageIcon}
          label="Banner Image URL"
          value={form.bannerImageUrl}
          onChange={(v) => set('bannerImageUrl', v)}
          placeholder="https://cdn.example.com/maintenance-banner.jpg"
        />

        {/* Image preview toggle */}
        {form.bannerImageUrl && (
          <div className="space-y-2">
            <button type="button" onClick={() => setPreview((p) => !p)}
              className="text-xs font-medium text-blue-600 hover:underline">
              {preview ? 'Hide preview' : 'Show preview'}
            </button>
            {preview && (
              <div className="relative h-40 w-full rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={form.bannerImageUrl}
                  alt="Banner preview"
                  className="h-full w-full object-cover"
                  onError={(e) => { e.currentTarget.src = ''; e.currentTarget.alt = 'Invalid image URL'; }}
                />
              </div>
            )}
          </div>
        )}

        <Field
          icon={Type}
          label="Hero Heading"
          value={form.heading}
          onChange={(v) => set('heading', v)}
          placeholder="Professional Drone Maintenance & Repair"
        />

        <Field
          label="Hero Subheading"
          value={form.subheading}
          onChange={(v) => set('subheading', v)}
          placeholder="Short description under the main heading…"
          rows={2}
        />
      </section>

      {/* Contact info section */}
      <section className="rounded-xl border border-slate-200 bg-slate-50/50 p-5 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Contact Info</h3>
        <p className="text-xs text-slate-400">Displayed in the sidebar of the Maintenance page and on the "Schedule Service" modal.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            icon={Phone}
            label="Phone"
            value={form.contactPhone}
            onChange={(v) => set('contactPhone', v)}
            placeholder="+880 1317-768213"
          />
          <Field
            icon={Mail}
            label="Email"
            type="email"
            value={form.contactEmail}
            onChange={(v) => set('contactEmail', v)}
            placeholder="support@dronebangladesh.com"
          />
        </div>

        <Field
          icon={MapPin}
          label="Address"
          value={form.contactAddress}
          onChange={(v) => set('contactAddress', v)}
          placeholder="Level-1, Block-B, Shop-43, Bashundhara City…"
          rows={2}
        />
      </section>

      {/* Live preview card */}
      <section className="rounded-xl border border-slate-200 p-5 space-y-3 bg-[#0d1626] text-white">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Live Preview</h3>
        {form.bannerImageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={form.bannerImageUrl} alt="Preview" className="h-28 w-full rounded-lg object-cover opacity-70" />
        )}
        <h1 className="text-xl font-black leading-tight">{form.heading || <span className="opacity-30">Heading…</span>}</h1>
        <p className="text-xs text-slate-400 leading-relaxed">{form.subheading || <span className="opacity-30">Subheading…</span>}</p>
        <div className="flex flex-wrap gap-4 text-xs text-slate-400 pt-2 border-t border-slate-700">
          {form.contactPhone   && <span>📞 {form.contactPhone}</span>}
          {form.contactEmail   && <span>✉ {form.contactEmail}</span>}
          {form.contactAddress && <span>📍 {form.contactAddress}</span>}
        </div>
      </section>
    </form>
  );
}
