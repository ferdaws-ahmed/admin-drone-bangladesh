'use client';

/**
 * PackagesTab.jsx
 *
 * Rebuilt admin maintenance packages manager.
 *
 * Features:
 *  - Packages grouped by category: Basic | Standard | Premium (+ Other)
 *  - Prominent "Add Package" button at the top
 *  - Per-card: active/inactive toggle, edit button, delete button
 *  - Toggle isActive → auto-shows/hides on client frontend
 *  - Create / Edit via Modal with full PackageForm
 *  - Category selector in the form (Basic / Standard / Premium / Custom)
 *  - Sort order up/down within each category group
 */

import { useCallback, useEffect, useState } from 'react';
import {
  Plus, Pencil, Trash2, GripVertical,
  ChevronUp, ChevronDown, Loader2,
  ToggleLeft, ToggleRight, X, Star, Zap,
  CheckCircle2, Package,
} from 'lucide-react';
import Modal      from '@/components/common/Modal';
import adminApi   from '@/lib/adminApi';
import useAdminFetch from '@/hooks/useAdminFetch';

// ── Constants ─────────────────────────────────────────────────────────────────
const CATEGORIES = ['Basic', 'Standard', 'Premium'];

const CATEGORY_META = {
  Basic:    { color: 'bg-sky-50 border-sky-200',    badge: 'bg-sky-100 text-sky-700',    dot: 'bg-sky-500'    },
  Standard: { color: 'bg-violet-50 border-violet-200', badge: 'bg-violet-100 text-violet-700', dot: 'bg-violet-500' },
  Premium:  { color: 'bg-amber-50 border-amber-200',  badge: 'bg-amber-100 text-amber-700',  dot: 'bg-amber-500'  },
  Other:    { color: 'bg-slate-50 border-slate-200',  badge: 'bg-slate-100 text-slate-600',  dot: 'bg-slate-400'  },
};

const BADGE_OPTIONS = [
  { value: 'none',        label: 'None' },
  { value: 'popular',     label: 'Popular' },
  { value: 'best-value',  label: 'Best Value' },
  { value: 'recommended', label: 'Recommended' },
];

const BADGE_STYLES = {
  popular:      'bg-amber-100 text-amber-700',
  'best-value': 'bg-emerald-100 text-emerald-700',
  recommended:  'bg-blue-100 text-blue-700',
};

const APPLIES_TO = ['both', 'drone', 'handheld'];

const EMPTY_FORM = {
  name: '', category: 'Basic',
  price: '',
  appliesTo: 'both', duration: '3-5 business days',
  shortDescription: '', description: '',
  features: [''], inclusions: [''], exclusions: [''],
  badge: 'none', sortOrder: 0, isActive: true,
};

// ── Helpers ───────────────────────────────────────────────────────────────────
/** Infer category from package name when not explicitly stored */
const inferCategory = (pkg) => {
  if (pkg.category) return pkg.category;
  const n = (pkg.name || '').toLowerCase();
  if (n.includes('basic'))    return 'Basic';
  if (n.includes('standard')) return 'Standard';
  if (n.includes('premium'))  return 'Premium';
  return 'Other';
};

const normalise = (pkg) => ({
  ...EMPTY_FORM,
  ...pkg,
  category:   pkg.category || inferCategory(pkg),
  price:      String(pkg.price ?? ''),
  sortOrder:  Number(pkg.sortOrder ?? 0),
  features:   pkg.features?.length ? pkg.features : [''],
  inclusions: pkg.inclusions?.length ? pkg.inclusions : [''],
  exclusions: pkg.exclusions?.length ? pkg.exclusions : [''],
});

// ── ArrayField (features / inclusions / exclusions) ──────────────────────────
function ArrayField({ label, items, onChange }) {
  const update = (idx, val) => { const n = [...items]; n[idx] = val; onChange(n); };
  const add    = ()         => onChange([...items, '']);
  const remove = (idx)      => onChange(items.filter((_, i) => i !== idx));

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="label-xs">{label}</label>
        <button type="button" onClick={add}
          className="flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:text-blue-700">
          <Plus className="h-3 w-3" /> Add
        </button>
      </div>
      <div className="space-y-1.5">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <input
              value={item}
              onChange={(e) => update(i, e.target.value)}
              placeholder={`${label} ${i + 1}`}
              className="input-xs flex-1"
            />
            {items.length > 1 && (
              <button type="button" onClick={() => remove(i)}
                className="rounded p-1 text-slate-400 hover:text-rose-500 transition">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Package Form ──────────────────────────────────────────────────────────────
function PackageForm({ initial, onSubmit, onClose, saving }) {
  const [form, setForm] = useState(() => normalise(initial || {}));
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...form,
      price: Number(form.price) || 0,
      sortOrder: Number(form.sortOrder) || 0,
      features: form.features.filter(Boolean),
      inclusions: form.inclusions.filter(Boolean),
      exclusions: form.exclusions.filter(Boolean),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-xs">
      {/* Row: name + category */}
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 sm:col-span-1">
          <label className="label-xs">Package Name *</label>
          <input
            required value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="e.g. Basic Maintenance"
            className="input-xs w-full"
          />
        </div>
        <div>
          <label className="label-xs">Category *</label>
          <select
            value={form.category}
            onChange={(e) => set('category', e.target.value)}
            className="input-xs w-full"
          >
            {[...CATEGORIES, 'Other'].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Price */}
      <div>
        <label className="label-xs">Price (৳) *</label>
        <input required type="number" min="0" value={form.price}
          onChange={(e) => set('price', e.target.value)}
          placeholder="7500" className="input-xs w-full" />
      </div>

      {/* Row: appliesTo + badge */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label-xs">Applies To</label>
          <select value={form.appliesTo} onChange={(e) => set('appliesTo', e.target.value)}
            className="input-xs w-full capitalize">
            {APPLIES_TO.map((a) => (
              <option key={a} value={a} className="capitalize">{a}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label-xs">Badge</label>
          <select value={form.badge} onChange={(e) => set('badge', e.target.value)}
            className="input-xs w-full">
            {BADGE_OPTIONS.map((b) => (
              <option key={b.value} value={b.value}>{b.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Duration */}
      <div>
        <label className="label-xs">Duration</label>
        <input value={form.duration} onChange={(e) => set('duration', e.target.value)}
          placeholder="3-5 business days" className="input-xs w-full" />
      </div>

      {/* Short description */}
      <div>
        <label className="label-xs">Short Description</label>
        <input value={form.shortDescription}
          onChange={(e) => set('shortDescription', e.target.value)}
          placeholder="One-line summary shown on cards"
          className="input-xs w-full" />
      </div>

      {/* Full description */}
      <div>
        <label className="label-xs">Full Description</label>
        <textarea rows={3} value={form.description}
          onChange={(e) => set('description', e.target.value)}
          placeholder="Detailed description shown in Learn More modal…"
          className="input-xs w-full resize-none" />
      </div>

      {/* Array fields */}
      <ArrayField label="Features"   items={form.features}   onChange={(v) => set('features', v)} />
      <ArrayField label="Inclusions" items={form.inclusions} onChange={(v) => set('inclusions', v)} />
      <ArrayField label="Exclusions" items={form.exclusions} onChange={(v) => set('exclusions', v)} />

      {/* Sort order + active */}
      <div className="flex items-center gap-4">
        <div className="w-24">
          <label className="label-xs">Sort Order</label>
          <input type="number" min="0" value={form.sortOrder}
            onChange={(e) => set('sortOrder', e.target.value)}
            className="input-xs w-full" />
        </div>
        <label className="mt-4 flex cursor-pointer items-center gap-2">
          <input type="checkbox" checked={form.isActive}
            onChange={(e) => set('isActive', e.target.checked)}
            className="h-3.5 w-3.5 rounded accent-blue-600" />
          <span className="text-xs font-medium text-slate-700">Active (visible on website)</span>
        </label>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
        <button type="button" onClick={onClose}
          className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition">
          Cancel
        </button>
        <button type="submit" disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-60 transition">
          {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {initial?._id ? 'Save Changes' : 'Create Package'}
        </button>
      </div>
    </form>
  );
}

// ── Single package card row ───────────────────────────────────────────────────
function PackageRow({ pkg, idx, total, onEdit, onDelete, onToggle, onMoveUp, onMoveDown, deleting }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow transition">
      {/* Reorder */}
      <div className="flex shrink-0 flex-col gap-0.5 mt-1">
        <button onClick={onMoveUp} disabled={idx === 0}
          className="rounded p-0.5 text-slate-300 hover:text-slate-600 disabled:opacity-20 transition">
          <ChevronUp className="h-4 w-4" />
        </button>
        <GripVertical className="mx-auto h-4 w-4 text-slate-300" />
        <button onClick={onMoveDown} disabled={idx === total - 1}
          className="rounded p-0.5 text-slate-300 hover:text-slate-600 disabled:opacity-20 transition">
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <h4 className="text-sm font-semibold text-slate-800">{pkg.name}</h4>

          {/* Badge */}
          {pkg.badge && pkg.badge !== 'none' && (
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold capitalize ${BADGE_STYLES[pkg.badge] || 'bg-slate-100 text-slate-600'}`}>
              <Star className="mr-0.5 inline h-2.5 w-2.5 -mt-px" />
              {pkg.badge}
            </span>
          )}

          {/* Active status pill */}
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
            pkg.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
          }`}>
            {pkg.isActive ? 'Active' : 'Inactive'}
          </span>

          {/* Applies-to pill */}
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500 capitalize">
            {pkg.appliesTo}
          </span>
        </div>

        <p className="mb-2 truncate text-xs text-slate-500">{pkg.shortDescription}</p>

        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-700">
          <span className="font-bold text-slate-900">৳{Number(pkg.price).toLocaleString()}</span>
          {pkg.originalPrice > 0 && (
            <span className="text-slate-400 line-through">৳{Number(pkg.originalPrice).toLocaleString()}</span>
          )}
          {pkg.duration && (
            <>
              <span className="text-slate-300">·</span>
              <span className="text-slate-500">{pkg.duration}</span>
            </>
          )}
          {pkg.features?.filter(Boolean).length > 0 && (
            <>
              <span className="text-slate-300">·</span>
              <span className="flex items-center gap-1 text-emerald-600">
                <CheckCircle2 className="h-3 w-3" />
                {pkg.features.filter(Boolean).length} features
              </span>
            </>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-1">
        {/* Active toggle */}
        <button
          onClick={onToggle}
          title={pkg.isActive ? 'Deactivate (hide from website)' : 'Activate (show on website)'}
          className="rounded-lg p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition"
        >
          {pkg.isActive
            ? <ToggleRight className="h-5 w-5 text-emerald-500" />
            : <ToggleLeft  className="h-5 w-5" />
          }
        </button>

        {/* Edit */}
        <button
          onClick={onEdit}
          title="Edit package"
          className="rounded-lg p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition"
        >
          <Pencil className="h-4 w-4" />
        </button>

        {/* Delete */}
        <button
          onClick={onDelete}
          disabled={deleting}
          title="Delete package"
          className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-40 transition"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// ── Category section ──────────────────────────────────────────────────────────
function CategorySection({ category, packages, onEdit, onDelete, onToggle, onMove, deleting }) {
  const meta = CATEGORY_META[category] || CATEGORY_META.Other;

  if (packages.length === 0) return null;

  return (
    <div className={`rounded-xl border ${meta.color} overflow-hidden`}>
      {/* Category header */}
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-inherit">
        <span className={`h-2.5 w-2.5 rounded-full ${meta.dot}`} />
        <h3 className="text-sm font-bold text-slate-700">{category}</h3>
        <span className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold ${meta.badge}`}>
          {packages.length} package{packages.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Package rows */}
      <div className="space-y-2 p-3">
        {packages.map((pkg, idx) => (
          <PackageRow
            key={pkg._id}
            pkg={pkg}
            idx={idx}
            total={packages.length}
            onEdit={() => onEdit(pkg)}
            onDelete={() => onDelete(pkg._id)}
            onToggle={() => onToggle(pkg)}
            onMoveUp={() => onMove(pkg._id, 'up', category)}
            onMoveDown={() => onMove(pkg._id, 'down', category)}
            deleting={deleting}
          />
        ))}
      </div>
    </div>
  );
}

// ── PackagesTab (main export) ─────────────────────────────────────────────────
export default function PackagesTab() {
  const [packages, setPackages] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [modal,    setModal]    = useState({ open: false, pkg: null });

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.maintenance.packages.list();
      if (res?.success) setPackages(res.data?.items ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── CRUD hooks ────────────────────────────────────────────────────────────
  const { loading: creating, fire: fireCreate } = useAdminFetch({
    fn: adminApi.maintenance.packages.create,
    successMessage: 'Package created successfully.',
    onSuccess: () => { setModal({ open: false, pkg: null }); load(); },
  });

  const { loading: updating, fire: fireUpdate } = useAdminFetch({
    fn: (payload) => adminApi.maintenance.packages.update(modal.pkg?._id, payload),
    successMessage: 'Package updated successfully.',
    onSuccess: () => { setModal({ open: false, pkg: null }); load(); },
  });

  const { loading: deleting, fire: fireDelete } = useAdminFetch({
    fn: adminApi.maintenance.packages.remove,
    successMessage: 'Package deleted.',
    onSuccess: load,
  });

  const handleSubmit = (payload) =>
    modal.pkg ? fireUpdate(payload) : fireCreate(payload);

  const handleDelete = (id) => {
    if (!window.confirm('Delete this package? This cannot be undone.')) return;
    fireDelete(id);
  };

  const toggleActive = async (pkg) => {
    await adminApi.maintenance.packages.update(pkg._id, { isActive: !pkg.isActive });
    load();
  };

  // ── Move within category ──────────────────────────────────────────────────
  const handleMove = async (id, direction, category) => {
    // Get all packages in this category, sorted by sortOrder
    const catPkgs = packages
      .filter((p) => inferCategory(p) === category)
      .sort((a, b) => a.sortOrder - b.sortOrder);

    const idx  = catPkgs.findIndex((p) => p._id === id);
    const swap = direction === 'up' ? idx - 1 : idx + 1;
    if (swap < 0 || swap >= catPkgs.length) return;

    // Swap sortOrder values
    const updated = [...catPkgs];
    [updated[idx], updated[swap]] = [updated[swap], updated[idx]];

    // Optimistic update
    setPackages((prev) => {
      const map = new Map(prev.map((p) => [p._id, p]));
      updated.forEach((p, i) => {
        const existing = map.get(p._id);
        if (existing) map.set(p._id, { ...existing, sortOrder: i });
      });
      return Array.from(map.values());
    });

    // Persist
    await Promise.all(
      updated.map((p, i) =>
        adminApi.maintenance.packages.update(p._id, { sortOrder: i })
      )
    );
  };

  // ── Group packages by category ────────────────────────────────────────────
  const grouped = [...CATEGORIES, 'Other'].reduce((acc, cat) => {
    acc[cat] = packages
      .filter((p) => inferCategory(p) === cat)
      .sort((a, b) => a.sortOrder - b.sortOrder);
    return acc;
  }, {});

  const totalPackages = packages.length;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="text-base font-bold text-slate-800">Maintenance Packages</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Packages are grouped by tier. Toggle active/inactive to show or hide them on the website instantly.
          </p>
        </div>

        {/* Prominent Add button */}
        <button
          onClick={() => setModal({ open: true, pkg: null })}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-black text-white shadow-md hover:bg-blue-700 transition"
        >
          <Plus className="h-4 w-4" />
          Add Package
        </button>
      </div>

      {/* ── Stats row ──────────────────────────────────────────────────── */}
      {!loading && totalPackages > 0 && (
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-center shadow-sm">
            <p className="text-lg font-black text-slate-900">{totalPackages}</p>
            <p className="text-[11px] text-slate-500">Total</p>
          </div>
          {CATEGORIES.map((cat) => {
            const meta = CATEGORY_META[cat];
            return (
              <div key={cat} className={`rounded-xl border px-4 py-3 text-center shadow-sm ${meta.color}`}>
                <p className="text-lg font-black text-slate-900">{grouped[cat]?.length ?? 0}</p>
                <p className={`text-[11px] font-bold ${meta.badge.split(' ')[1]}`}>{cat}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Content ────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="flex items-center justify-center py-24 text-slate-400">
          <Loader2 className="mr-2 h-6 w-6 animate-spin" /> Loading packages…
        </div>
      ) : totalPackages === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 py-20 text-center text-slate-400">
          <Package className="mb-3 h-10 w-10 opacity-30" />
          <p className="text-sm font-semibold">No packages yet</p>
          <p className="mt-1 text-xs">Click &ldquo;Add Package&rdquo; to create your first maintenance tier.</p>
          <button
            onClick={() => setModal({ open: true, pkg: null })}
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition"
          >
            <Plus className="h-4 w-4" /> Add Package
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {[...CATEGORIES, 'Other'].map((cat) => (
            <CategorySection
              key={cat}
              category={cat}
              packages={grouped[cat] ?? []}
              onEdit={(pkg) => setModal({ open: true, pkg })}
              onDelete={handleDelete}
              onToggle={toggleActive}
              onMove={handleMove}
              deleting={deleting}
            />
          ))}
        </div>
      )}

      {/* ── Create / Edit modal ─────────────────────────────────────────── */}
      <Modal
        isOpen={modal.open}
        onClose={() => setModal({ open: false, pkg: null })}
        title={modal.pkg ? `Edit: ${modal.pkg.name}` : 'Add New Package'}
        size="md"
      >
        <PackageForm
          initial={modal.pkg}
          onSubmit={handleSubmit}
          onClose={() => setModal({ open: false, pkg: null })}
          saving={creating || updating}
        />
      </Modal>
    </>
  );
}
