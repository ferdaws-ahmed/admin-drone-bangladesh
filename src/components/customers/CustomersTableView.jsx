'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  User, Search, RefreshCw, Trash2, Lock, Unlock,
  Loader2, X, AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import adminApi from '@/lib/adminApi';
import useDebounce from '@/hooks/useDebounce';

// ─── Avatar circle ────────────────────────────────────────────────────────────
function Avatar({ customer }) {
  if (customer.avatar) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={customer.avatar}
        alt={customer.name}
        className="h-9 w-9 rounded-full object-cover shrink-0"
      />
    );
  }
  const initials = customer.name
    ? customer.name.split(' ').slice(0, 2).map((w) => w[0]?.toUpperCase()).join('')
    : '?';
  return (
    <div className="h-9 w-9 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center shrink-0">
      {initials}
    </div>
  );
}

// ─── Confirm dialog ───────────────────────────────────────────────────────────
function ConfirmDialog({ target, action, onConfirm, onCancel, loading }) {
  if (!target) return null;
  const isDelete = action === 'delete';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDelete ? 'bg-rose-50' : 'bg-amber-50'}`}>
              <AlertCircle className={`w-5 h-5 ${isDelete ? 'text-rose-600' : 'text-amber-600'}`} />
            </div>
            <div>
              <p className="font-bold text-slate-900 text-sm">
                {isDelete ? 'Delete Customer?' : target.isActive === false ? 'Unfreeze Account?' : 'Freeze Account?'}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">{target.name}</p>
            </div>
          </div>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-slate-600 mb-4">
          {isDelete
            ? 'This will permanently remove the customer account and cannot be undone.'
            : target.isActive === false
            ? 'The customer will be able to log in again.'
            : 'The customer will not be able to log in until unfrozen.'}
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-3.5 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold text-white transition-colors disabled:opacity-60 ${
              isDelete ? 'bg-rose-600 hover:bg-rose-700' : 'bg-amber-500 hover:bg-amber-600'
            }`}
          >
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {isDelete ? 'Delete' : target.isActive === false ? 'Unfreeze' : 'Freeze'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function CustomersTableView() {
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage]       = useState(1);
  const [total, setTotal]     = useState(0);
  const [query, setQuery]     = useState('');
  const debounced             = useDebounce(query, 400);

  // Confirm dialog state
  const [confirm, setConfirm] = useState({ target: null, action: null });
  const [actioning, setActioning] = useState(false);

  const LIMIT = 50;

  const load = useCallback(async (p = page, q = debounced) => {
    setLoading(true);
    try {
      const params = { page: p, limit: LIMIT };
      if (q) params.search = q;
      const res = await adminApi.customers.list(params);
      if (res?.success) {
        setItems(res.data?.items || []);
        setTotal(res.data?.pagination?.total || 0);
      } else {
        toast.error(res?.message || 'Failed to load customers');
        setItems([]);
      }
    } catch (err) {
      toast.error(err?.message || 'Server error');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [page, debounced]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset to page 1 when search changes
  useEffect(() => {
    setPage(1);
  }, [debounced]);

  useEffect(() => {
    load(page, debounced);
  }, [page, debounced]); // eslint-disable-line react-hooks/exhaustive-deps

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  // ── Actions ──────────────────────────────────────────────────────────────────
  const handleConfirm = async () => {
    const { target, action } = confirm;
    if (!target) return;
    setActioning(true);
    try {
      let res;
      if (action === 'delete') {
        res = await adminApi.customers.delete(target._id);
        if (res?.success) {
          toast.success('Customer deleted');
          setItems((prev) => prev.filter((c) => c._id !== target._id));
          setTotal((t) => t - 1);
        } else {
          toast.error(res?.message || 'Delete failed');
        }
      } else {
        res = await adminApi.customers.toggleFreeze(target._id);
        if (res?.success) {
          const frozen = !res.data?.isActive;
          toast.success(frozen ? 'Account frozen' : 'Account unfrozen');
          setItems((prev) =>
            prev.map((c) =>
              c._id === target._id ? { ...c, isActive: res.data.isActive } : c
            )
          );
        } else {
          toast.error(res?.message || 'Action failed');
        }
      }
    } catch (err) {
      toast.error(err?.message || 'Unexpected error');
    } finally {
      setActioning(false);
      setConfirm({ target: null, action: null });
    }
  };

  return (
    <>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">User Management</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">Customers</h1>
            <p className="mt-1 text-sm text-slate-500">
              {loading ? 'Loading…' : `${total} registered customer${total !== 1 ? 's' : ''}`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name or email…"
                className="h-10 w-64 pl-9 pr-3 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition"
              />
            </div>

            {/* Refresh */}
            <button
              type="button"
              onClick={() => load(page, debounced)}
              disabled={loading}
              className="inline-flex items-center gap-1.5 h-10 px-3.5 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-24 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              Loading customers…
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-sm text-left">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-5 py-3 font-semibold">Customer</th>
                      <th className="px-4 py-3 font-semibold">Email</th>
                      <th className="px-4 py-3 font-semibold">Phone</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                      <th className="px-4 py-3 font-semibold">Joined</th>
                      <th className="px-4 py-3 text-right font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {items.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-5 py-16 text-center text-slate-400">
                          <User className="w-10 h-10 mx-auto mb-3 opacity-30" />
                          {query ? 'No customers match your search.' : 'No customers registered yet.'}
                        </td>
                      </tr>
                    ) : (
                      items.map((c) => {
                        const isFrozen = c.isActive === false;
                        return (
                          <tr key={c._id} className={`hover:bg-slate-50/70 transition-colors ${isFrozen ? 'opacity-60' : ''}`}>
                            {/* Customer */}
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-3">
                                <Avatar customer={c} />
                                <div>
                                  <p className="font-semibold text-slate-800">{c.name}</p>
                                  <p className="text-[11px] text-slate-400">ID: …{String(c._id).slice(-8)}</p>
                                </div>
                              </div>
                            </td>

                            {/* Email */}
                            <td className="px-4 py-3 text-slate-700 max-w-[200px] truncate">{c.email}</td>

                            {/* Phone */}
                            <td className="px-4 py-3 text-slate-600">
                              {c.phone || <span className="text-slate-300">—</span>}
                            </td>

                            {/* Status */}
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                isFrozen
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${isFrozen ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                                {isFrozen ? 'Frozen' : 'Active'}
                              </span>
                            </td>

                            {/* Joined */}
                            <td className="px-4 py-3 text-slate-500 text-xs tabular-nums">
                              {c.createdAt
                                ? new Date(c.createdAt).toLocaleDateString('en-BD', { day: '2-digit', month: 'short', year: 'numeric' })
                                : '—'}
                            </td>

                            {/* Actions */}
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-end gap-1">
                                {/* Freeze / Unfreeze */}
                                <button
                                  type="button"
                                  onClick={() => setConfirm({ target: c, action: 'freeze' })}
                                  title={isFrozen ? 'Unfreeze account' : 'Freeze account'}
                                  className="rounded-lg p-2 text-slate-400 hover:bg-amber-50 hover:text-amber-600 transition-colors"
                                >
                                  {isFrozen
                                    ? <Unlock className="w-4 h-4" />
                                    : <Lock className="w-4 h-4" />
                                  }
                                </button>

                                {/* Delete */}
                                <button
                                  type="button"
                                  onClick={() => setConfirm({ target: c, action: 'delete' })}
                                  title="Delete customer"
                                  className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50/50 text-xs text-slate-600">
                  <span>
                    Showing {((page - 1) * LIMIT) + 1}–{Math.min(page * LIMIT, total)} of {total}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      disabled={page <= 1}
                      onClick={() => setPage((p) => p - 1)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-40 transition-colors font-semibold"
                    >
                      ← Prev
                    </button>
                    <span className="px-2 font-semibold">
                      {page} / {totalPages}
                    </span>
                    <button
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => p + 1)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-40 transition-colors font-semibold"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Confirm dialog (portal-like overlay) */}
      <ConfirmDialog
        target={confirm.target}
        action={confirm.action}
        onConfirm={handleConfirm}
        onCancel={() => setConfirm({ target: null, action: null })}
        loading={actioning}
      />
    </>
  );
}
