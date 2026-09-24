'use client';

/**
 * BannerController.jsx
 *
 * Full-featured banner management dashboard.
 *
 * Three sections:
 *   - All Products  (section = 'products')
 *   - Maintenance   (section = 'maintenance')
 *   - Contact       (section = 'contact')
 *
 * Per section:
 *   - List all banners for that section
 *   - Add Banner → modal with local file picker → base64 → server Cloudinary upload
 *   - Live Preview of uploaded image inside the modal
 *   - Active toggle (isActive) — only ONE per section can be active at a time
 *   - Edit banner title/subtitle
 *   - Delete banner
 *
 * Design:
 *   - Left side: banner content/text info
 *   - Right side: empty (bg image is the focus)
 *   - Preview card mirrors the real client-side banner layout
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Plus, Pencil, Trash2, ToggleLeft, ToggleRight,
  Loader2, ImageIcon, X, Eye, ShoppingBag, Wrench, Phone, RefreshCw,
} from 'lucide-react';
import Modal     from '@/components/common/Modal';
import adminApi  from '@/lib/adminApi';
import useAdminFetch from '@/hooks/useAdminFetch';

// ── Section config ─────────────────────────────────────────────────────────────
const SECTIONS = [
  {
    key:   'products',
    label: 'All Products',
    icon:  ShoppingBag,
    color: 'bg-blue-50 border-blue-200',
    badge: 'bg-blue-100 text-blue-700',
    dot:   'bg-blue-500',
    desc:  'Banner shown at the top of the /products catalogue page.',
  },
  {
    key:   'maintenance',
    label: 'Maintenance',
    icon:  Wrench,
    color: 'bg-violet-50 border-violet-200',
    badge: 'bg-violet-100 text-violet-700',
    dot:   'bg-violet-500',
    desc:  'Banner shown at the top of the /maintenance service page.',
  },
  {
    key:   'contact',
    label: 'Contact',
    icon:  Phone,
    color: 'bg-emerald-50 border-emerald-200',
    badge: 'bg-emerald-100 text-emerald-700',
    dot:   'bg-emerald-500',
    desc:  'Banner shown at the top of the /contact page.',
  },
];

// ── Empty form ─────────────────────────────────────────────────────────────────
const EMPTY_FORM = {
  imageUrl: '',   // base64 preview OR existing https URL
  section:  'products',
};

// ── File → base64 helper ──────────────────────────────────────────────────────
const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

// ── BannerFormModal ───────────────────────────────────────────────────────────
function BannerFormModal({ isOpen, onClose, initial, section, saving, onSubmit }) {
  const [form, setForm]         = useState(EMPTY_FORM);
  const [preview, setPreview]   = useState('');   // local data-URL for instant preview
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  // Reset form whenever modal opens
  useEffect(() => {
    if (isOpen) {
      if (initial) {
        setForm({
          imageUrl: initial.imageUrl || '',
          section:  initial.section  || section,
        });
        setPreview(initial.imageUrl || '');
      } else {
        setForm({ ...EMPTY_FORM, section });
        setPreview('');
      }
    }
  }, [isOpen, initial, section]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  // Pick a local file → base64
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate: image only, max 10 MB
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('Image must be under 10 MB.');
      return;
    }

    setUploading(true);
    try {
      const base64 = await fileToBase64(file);
      setPreview(base64);
      setForm((f) => ({ ...f, imageUrl: base64 }));
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.imageUrl) { alert('Please upload a banner image.'); return; }
    onSubmit(form);
  };

  const imgSrc = preview || form.imageUrl;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initial ? 'Change Banner Image' : 'Add New Banner'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5 text-xs">

        {/* ── Image picker ──────────────────────────────────────────── */}
        <div>
          <label className="label-xs mb-2 block">Banner Image *</label>

          {/* Drop zone / preview */}
          <div
            onClick={() => fileRef.current?.click()}
            className="relative flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 transition hover:border-blue-400 hover:bg-blue-50"
            style={{ minHeight: '160px' }}
          >
            {uploading ? (
              <div className="flex flex-col items-center gap-2 text-slate-400">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="text-xs">Processing image…</span>
              </div>
            ) : imgSrc ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imgSrc}
                  alt="Banner preview"
                  className="h-full w-full object-cover"
                  style={{ maxHeight: '220px' }}
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition hover:opacity-100">
                  <span className="rounded-lg bg-white/90 px-3 py-1.5 text-[11px] font-bold text-slate-800">
                    Click to change image
                  </span>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2 p-6 text-slate-400">
                <ImageIcon className="h-8 w-8" />
                <p className="font-semibold text-slate-600">Click to upload image</p>
                <p className="text-[11px]">PNG, JPG, WebP — max 10 MB</p>
              </div>
            )}
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="sr-only"
          />

          <p className="mt-1.5 text-[11px] text-slate-400">
            Image uploads to Cloudinary automatically when you save.
          </p>
        </div>

        {/* ── Live Preview ──────────────────────────────────────────── */}
        {imgSrc && (
          <div>
            <p className="label-xs mb-2 flex items-center gap-1.5">
              <Eye className="h-3.5 w-3.5" /> Preview
            </p>
            {/* Mirrors exactly what the client banner looks like */}
            <div
              className="relative overflow-hidden rounded-xl bg-[#0d1626]"
              style={{ minHeight: '110px' }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imgSrc}
                alt="Preview"
                className="absolute inset-0 h-full w-full object-cover object-right"
                style={{ opacity: 0.55 }}
              />
              {/* Left gradient so left side appears darker (mirrors client) */}
              <div className="absolute inset-0 bg-linear-to-r from-[#0d1626]/90 via-[#0d1626]/40 to-transparent" />
              {/* Bottom accent line */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-600" />
              {/* Placeholder text label — shows how client text will sit on top */}
              <div className="relative z-10 px-5 py-4">
                <p className="text-[9px] font-black uppercase tracking-widest text-red-400 opacity-60">
                  page text sits here (left side)
                </p>
                <p className="text-[11px] font-black text-white/40 italic">
                  → image visible on right
                </p>
              </div>
            </div>
            <p className="mt-1 text-[10px] text-slate-400">
              Left: static page text (not editable here) · Right: your image
            </p>
          </div>
        )}

        {/* ── Buttons ───────────────────────────────────────────────── */}
        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || uploading}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-60 transition shadow-sm"
          >
            {(saving || uploading) && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {initial ? 'Update Image' : 'Save Banner'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ── BannerCard ─────────────────────────────────────────────────────────────────
function BannerCard({ banner, onEdit, onDelete, onToggleActive, deleting }) {
  return (
    <div className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      {/* Image area — right side is the visual focus */}
      <div className="relative h-36 bg-[#0d1626]">
        {banner.imageUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={banner.imageUrl}
              alt={banner.title}
              className="absolute inset-0 h-full w-full object-cover object-right opacity-60 transition group-hover:opacity-70"
            />
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-slate-600">
            <ImageIcon className="h-10 w-10 opacity-30" />
          </div>
        )}

        {/* Left-side overlay — mirrors client layout */}
        <div className="absolute inset-0 bg-linear-to-r from-[#0d1626]/90 via-[#0d1626]/40 to-transparent" />
        {/* Bottom accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600" />

        {/* Active badge */}
        {banner.isActive && (
          <span className="absolute right-2 top-2 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-black text-white shadow">
            ACTIVE
          </span>
        )}
      </div>

      {/* Footer actions */}
      <div className="flex items-center justify-between gap-2 border-t border-slate-100 bg-slate-50/50 px-3 py-2.5">
        <p className="truncate text-[11px] font-semibold text-slate-600">{banner.title}</p>

        <div className="flex shrink-0 items-center gap-1">
          {/* Active toggle */}
          <button
            onClick={() => onToggleActive(banner)}
            title={banner.isActive ? 'Deactivate (hide from website)' : 'Activate (show on website)'}
            className="rounded-lg p-1.5 transition hover:bg-slate-100"
          >
            {banner.isActive
              ? <ToggleRight className="h-5 w-5 text-emerald-500" />
              : <ToggleLeft  className="h-5 w-5 text-slate-400" />
            }
          </button>

          {/* Edit */}
          <button
            onClick={() => onEdit(banner)}
            title="Edit banner"
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-blue-50 hover:text-blue-600"
          >
            <Pencil className="h-4 w-4" />
          </button>

          {/* Delete */}
          <button
            onClick={() => onDelete(banner._id)}
            disabled={deleting}
            title="Delete banner"
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:opacity-40"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── SectionPanel ───────────────────────────────────────────────────────────────
function SectionPanel({ sectionCfg, banners, onAdd, onEdit, onDelete, onToggleActive, deleting }) {
  const Icon   = sectionCfg.icon;
  const active = banners.filter((b) => b.isActive).length;

  return (
    <div className={`rounded-xl border ${sectionCfg.color} overflow-hidden`}>
      {/* Section header */}
      <div className="flex items-center gap-3 border-b border-inherit bg-white/60 px-5 py-3.5">
        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${sectionCfg.badge}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-slate-800">{sectionCfg.label} Banner</h3>
          <p className="text-[11px] text-slate-500 truncate">{sectionCfg.desc}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {active > 0 && (
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
              {active} active
            </span>
          )}
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${sectionCfg.badge}`}>
            {banners.length} banner{banners.length !== 1 ? 's' : ''}
          </span>
          <button
            onClick={() => onAdd(sectionCfg.key)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-[11px] font-bold text-white shadow-sm transition hover:bg-blue-700"
          >
            <Plus className="h-3.5 w-3.5" /> Add Banner
          </button>
        </div>
      </div>

      {/* Banner grid */}
      <div className="p-4">
        {banners.length === 0 ? (
          <div
            onClick={() => onAdd(sectionCfg.key)}
            className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-white/50 py-10 text-center text-slate-400 transition hover:border-blue-400 hover:text-blue-500"
          >
            <ImageIcon className="mb-2 h-8 w-8 opacity-40" />
            <p className="text-xs font-semibold">No banners yet</p>
            <p className="mt-0.5 text-[11px]">Click to add the first banner for this section</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {banners.map((banner) => (
              <BannerCard
                key={banner._id}
                banner={banner}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggleActive={onToggleActive}
                deleting={deleting}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── BannerController (main export) ────────────────────────────────────────────
export default function BannerController() {
  const [banners, setBanners]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState({ open: false, initial: null, section: 'products' });

  // ── Fetch all banners ───────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.cms.banners.list();
      if (res?.success) setBanners(res.data?.items ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── CRUD hooks ─────────────────────────────────────────────────────────────
  const { loading: creating, fire: fireCreate } = useAdminFetch({
    fn:             (payload) => adminApi.cms.banners.create(payload),
    successMessage: 'Banner created successfully.',
    onSuccess:      () => { setModal({ open: false, initial: null, section: 'products' }); load(); },
  });

  const { loading: updating, fire: fireUpdate } = useAdminFetch({
    fn:             (payload) => adminApi.cms.banners.update(modal.initial?._id, payload),
    successMessage: 'Banner updated successfully.',
    onSuccess:      () => { setModal({ open: false, initial: null, section: 'products' }); load(); },
  });

  const { loading: deleting, fire: fireDelete } = useAdminFetch({
    fn:             adminApi.cms.banners.remove,
    successMessage: 'Banner deleted.',
    onSuccess:      load,
  });

  const { fire: fireToggle } = useAdminFetch({
    fn:        (payload) => adminApi.cms.banners.update(payload.id, { isActive: payload.isActive }),
    onSuccess: load,
  });

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleSubmit = (formData) => {
    if (modal.initial) {
      // update: only send imageUrl (section stays same)
      fireUpdate({ imageUrl: formData.imageUrl });
    } else {
      fireCreate({ imageUrl: formData.imageUrl, section: modal.section });
    }
  };

  const handleDelete = (id) => {
    if (!window.confirm('Delete this banner permanently?')) return;
    fireDelete(id);
  };

  const handleToggleActive = (banner) => {
    // If activating, use the setLive endpoint (section-scoped deactivation)
    if (!banner.isActive) {
      adminApi.cms.banners.setLive(banner._id).then(load);
    } else {
      // Deactivate directly
      fireToggle({ id: banner._id, isActive: false });
    }
  };

  const openAdd  = (section) => setModal({ open: true, initial: null, section });
  const openEdit = (banner)  => setModal({ open: true, initial: banner, section: banner.section });

  // ── Group banners by section ───────────────────────────────────────────────
  const grouped = SECTIONS.reduce((acc, s) => {
    acc[s.key] = banners.filter((b) => b.section === s.key);
    return acc;
  }, {});

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Banners</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Manage banners for each page section. Activate one per section to display it on the website.
          </p>
        </div>
        <button
          onClick={load}
          title="Refresh"
          className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* How it works strip */}
      <div className="rounded-xl border border-blue-100 bg-blue-50 px-5 py-3.5 text-xs text-blue-800">
        <strong>How it works:</strong> Upload a banner image for each section. Toggle the{' '}
        <ToggleRight className="inline h-4 w-4 text-emerald-500" /> switch to make it{' '}
        <strong>Active</strong> — it will instantly appear on the website. Only one banner
        can be active per section at a time.
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="flex items-center justify-center py-24 text-slate-400">
          <Loader2 className="mr-2 h-6 w-6 animate-spin" /> Loading banners…
        </div>
      ) : (
        <div className="space-y-6">
          {SECTIONS.map((sectionCfg) => (
            <SectionPanel
              key={sectionCfg.key}
              sectionCfg={sectionCfg}
              banners={grouped[sectionCfg.key] ?? []}
              onAdd={openAdd}
              onEdit={openEdit}
              onDelete={handleDelete}
              onToggleActive={handleToggleActive}
              deleting={deleting}
            />
          ))}
        </div>
      )}

      {/* Create / Edit modal */}
      <BannerFormModal
        isOpen={modal.open}
        onClose={() => setModal({ open: false, initial: null, section: 'products' })}
        initial={modal.initial}
        section={modal.section}
        saving={creating || updating}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
