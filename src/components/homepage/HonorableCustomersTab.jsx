'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Plus, Pencil, Trash2, Loader2, ImageIcon, X, RefreshCw, Users, Info,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '@/components/common/Modal';
import adminApi from '@/lib/adminApi';

// ─── File → base64 ────────────────────────────────────────────────────────────
const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload  = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });

// ─── Empty form ───────────────────────────────────────────────────────────────
const EMPTY = { name: '', date: '', description: '', image: '' };

// ─── Customer Form Modal ──────────────────────────────────────────────────────
function CustomerFormModal({ isOpen, onClose, initial, onSubmit, saving }) {
  const [form, setForm]       = useState(EMPTY);
  const [preview, setPreview] = useState('');
  const [imgLoading, setImgLoading] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    if (initial) {
      setForm({
        name:        initial.name        || '',
        date:        initial.date        ? initial.date.split('T')[0] : '',
        description: initial.description || '',
        image:       initial.image       || '',
      });
      setPreview(initial.image || '');
    } else {
      setForm(EMPTY);
      setPreview('');
    }
  }, [isOpen, initial]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file.'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5 MB.'); return; }
    setImgLoading(true);
    try {
      const b64 = await fileToBase64(file);
      setPreview(b64);
      set('image', b64);
    } finally { setImgLoading(false); }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim())        { toast.error('Name is required');        return; }
    if (!form.description.trim()) { toast.error('Description is required'); return; }
    onSubmit(form);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initial ? 'Edit Customer' : 'Add Honorable Customer'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">

        {/* Image picker */}
        <div>
          <label className="label-xs mb-1.5 block">Customer Photo</label>
          <div
            onClick={() => fileRef.current?.click()}
            className="relative flex cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 hover:border-blue-400 hover:bg-blue-50 transition"
            style={{ minHeight: 120 }}
          >
            {imgLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            ) : preview ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview} alt="Preview" className="h-28 w-28 rounded-xl object-cover" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition">
                  <span className="rounded-lg bg-white/90 px-2.5 py-1 text-[11px] font-bold text-slate-800">
                    Change photo
                  </span>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2 p-4 text-slate-400">
                <ImageIcon className="h-7 w-7" />
                <span className="text-[11px] font-medium">Click to upload photo</span>
                <span className="text-[10px]">PNG, JPG · max 5 MB</span>
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="sr-only" />
        </div>

        {/* Name */}
        <div>
          <label className="label-xs">Customer Name *</label>
          <input
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="e.g. Rahim Uddin"
            className="input-xs w-full mt-1"
            required
          />
        </div>

        {/* Date */}
        <div>
          <label className="label-xs">Purchase Date</label>
          <input
            type="date"
            value={form.date}
            onChange={(e) => set('date', e.target.value)}
            className="input-xs w-full mt-1"
          />
        </div>

        {/* Description */}
        <div>
          <label className="label-xs">What Did They Buy / Their Story *</label>
          <textarea
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            placeholder="e.g. Purchased DJI Mini 4 Pro for wedding videography. Extremely happy with the product and service."
            rows={4}
            className="input-xs w-full mt-1 resize-none"
            required
          />
        </div>

        {/* Actions */}
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
            disabled={saving || imgLoading}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-60 transition shadow-sm"
          >
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {initial ? 'Save Changes' : 'Add Customer'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Customer Card ─────────────────────────────────────────────────────────────
function CustomerCard({ customer, onEdit, onDelete, deleting }) {
  const formattedDate = customer.date
    ? new Date(customer.date).toLocaleDateString('en-BD', { year: 'numeric', month: 'short', day: 'numeric' })
    : '';

  return (
    <div className="group flex gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-all">
      {/* Avatar */}
      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-slate-100 ring-2 ring-slate-100">
        {customer.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={customer.image} alt={customer.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Users className="h-5 w-5 text-slate-300" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-bold text-slate-900">{customer.name}</p>
            {formattedDate && (
              <p className="text-[11px] text-slate-400 mt-0.5">{formattedDate}</p>
            )}
          </div>
          {/* Actions */}
          <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(customer)}
              title="Edit"
              className="rounded-lg p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => onDelete(customer._id)}
              disabled={deleting === customer._id}
              title="Delete"
              className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors disabled:opacity-50"
            >
              {deleting === customer._id
                ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                : <Trash2 className="h-3.5 w-3.5" />
              }
            </button>
          </div>
        </div>
        <p className="mt-2 text-xs text-slate-600 line-clamp-2">{customer.description}</p>
      </div>
    </div>
  );
}

// ─── Main Tab ─────────────────────────────────────────────────────────────────
export default function HonorableCustomersTab() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [modal, setModal]         = useState({ open: false, initial: null });
  const [saving, setSaving]       = useState(false);
  const [deleting, setDeleting]   = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.homepage.customers.getAll();
      if (res?.success) setCustomers(res.data || []);
      else toast.error(res?.message || 'Failed to load customers');
    } catch {
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSubmit = async (form) => {
    setSaving(true);
    try {
      let res;
      if (modal.initial) {
        res = await adminApi.homepage.customers.update(modal.initial._id, form);
      } else {
        res = await adminApi.homepage.customers.create(form);
      }
      if (res?.success) {
        toast.success(modal.initial ? 'Customer updated' : 'Customer added');
        setModal({ open: false, initial: null });
        load();
      } else {
        toast.error(res?.message || 'Save failed');
      }
    } catch (err) {
      toast.error(err?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this customer permanently?')) return;
    setDeleting(id);
    try {
      const res = await adminApi.homepage.customers.remove(id);
      if (res?.success) {
        toast.success('Customer deleted');
        setCustomers((prev) => prev.filter((c) => c._id !== id));
      } else {
        toast.error(res?.message || 'Delete failed');
      }
    } catch (err) {
      toast.error(err?.message || 'Delete failed');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Info */}
      <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3.5 text-xs text-blue-800">
        <Info className="h-4 w-4 shrink-0 mt-0.5 text-blue-500" />
        <p>
          Add honorable customers to showcase on the home page slider (up to{' '}
          <strong>5 shown</strong>) and on the full{' '}
          <strong>/customers</strong> page. Include a photo, name, date, and what they purchased.
        </p>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-bold text-slate-700">
          Honorable Customers ({customers.length})
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            type="button"
            onClick={() => setModal({ open: true, initial: null })}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700 shadow-sm transition"
          >
            <Plus className="h-3.5 w-3.5" /> Add Customer
          </button>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
      ) : customers.length === 0 ? (
        <div
          onClick={() => setModal({ open: true, initial: null })}
          className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 py-14 text-center text-slate-400 transition hover:border-blue-400 hover:text-blue-500"
        >
          <Users className="mb-2 h-9 w-9 opacity-40" />
          <p className="text-sm font-semibold">No honorable customers yet</p>
          <p className="mt-0.5 text-xs">Click to add your first customer story</p>
        </div>
      ) : (
        <div className="space-y-3">
          {customers.map((c) => (
            <CustomerCard
              key={c._id}
              customer={c}
              onEdit={(cust) => setModal({ open: true, initial: cust })}
              onDelete={handleDelete}
              deleting={deleting}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <CustomerFormModal
        isOpen={modal.open}
        onClose={() => setModal({ open: false, initial: null })}
        initial={modal.initial}
        onSubmit={handleSubmit}
        saving={saving}
      />
    </div>
  );
}
