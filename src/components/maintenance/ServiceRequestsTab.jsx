'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Loader2, Search, RefreshCw, Trash2, ChevronLeft, ChevronRight,
  Inbox, Phone, Mail, User, Package, MessageSquare, Calendar,
  CheckCircle2, Clock, AlertCircle, XCircle, PhoneCall, CalendarCheck,
} from 'lucide-react';
import Modal from '@/components/common/Modal';
import adminApi from '@/lib/adminApi';
import useAdminFetch from '@/hooks/useAdminFetch';

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  New:       { label: 'New',       icon: Inbox,        color: 'bg-blue-100 text-blue-700' },
  Contacted: { label: 'Contacted', icon: PhoneCall,    color: 'bg-amber-100 text-amber-700' },
  Scheduled: { label: 'Scheduled', icon: CalendarCheck,color: 'bg-purple-100 text-purple-700' },
  Completed: { label: 'Completed', icon: CheckCircle2, color: 'bg-emerald-100 text-emerald-700' },
  Cancelled: { label: 'Cancelled', icon: XCircle,      color: 'bg-slate-100 text-slate-500' },
};
const STATUSES = Object.keys(STATUS_CONFIG);

const fmtDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-BD', { day: '2-digit', month: 'short', year: 'numeric' });
};

// ── Status badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.New;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${cfg.color}`}>
      <Icon className="h-3 w-3" />
      {cfg.label}
    </span>
  );
}

// ── Detail / Edit modal content ───────────────────────────────────────────────
function RequestDetail({ req, onStatusChange, onClose, saving }) {
  const [status,    setStatus]    = useState(req.status);
  const [adminNote, setAdminNote] = useState(req.adminNote || '');

  const handleSave = () => onStatusChange(req._id, { status, adminNote });

  return (
    <div className="space-y-5">
      {/* Customer info */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <InfoRow icon={User}    label="Customer"       value={req.customer?.name} />
        <InfoRow icon={Phone}   label="Phone"          value={req.customer?.phone} />
        <InfoRow icon={Mail}    label="Email"          value={req.customer?.email || '—'} />
        <InfoRow icon={Package} label="Package"        value={req.package?.name} />
        <InfoRow icon={Inbox}   label="Drone"          value={req.drone?.model} />
        <InfoRow icon={Calendar}label="Submitted"      value={fmtDate(req.createdAt)} />
        {req.subject       && <InfoRow icon={MessageSquare} label="Subject"        value={req.subject} />}
        {req.preferredDate && <InfoRow icon={Clock}         label="Preferred Date" value={req.preferredDate} />}
      </div>

      {/* Service Details */}
      {req.serviceDetails && (
        <div className="rounded-lg bg-blue-50 border border-blue-100 p-3">
          <p className="text-[11px] font-semibold text-blue-600 mb-1">Service Details</p>
          <p className="text-xs text-slate-700 leading-relaxed">{req.serviceDetails}</p>
        </div>
      )}

      {/* Message */}
      {req.message && (
        <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
          <p className="text-[11px] font-semibold text-slate-500 mb-1 flex items-center gap-1">
            <MessageSquare className="h-3 w-3" /> Message
          </p>
          <p className="text-xs text-slate-700 leading-relaxed">{req.message}</p>
        </div>
      )}

      {/* Status update */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-700">Update Status</label>
        <div className="flex flex-wrap gap-2">
          {STATUSES.map((s) => (
            <button key={s} type="button" onClick={() => setStatus(s)}
              className={`rounded-full px-3 py-1 text-[11px] font-bold border transition ${
                status === s
                  ? STATUS_CONFIG[s].color + ' border-current ring-2 ring-offset-1 ring-current/30'
                  : 'border-slate-200 text-slate-500 hover:bg-slate-50'
              }`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Admin note */}
      <div className="space-y-1">
        <label className="text-xs font-semibold text-slate-700">Admin Note (internal)</label>
        <textarea rows={3} value={adminNote} onChange={(e) => setAdminNote(e.target.value)}
          placeholder="Add an internal note about this request…"
          className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition" />
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-2 pt-1 border-t border-slate-100">
        <button type="button" onClick={onClose}
          className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition">
          Close
        </button>
        <button type="button" onClick={handleSave} disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-60 transition">
          {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Save Changes
        </button>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="h-3.5 w-3.5 text-slate-400 mt-0.5 shrink-0" />
      <div>
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="text-xs text-slate-800 font-medium">{value || '—'}</p>
      </div>
    </div>
  );
}

// ── ServiceRequestsTab ─────────────────────────────────────────────────────────
export default function ServiceRequestsTab() {
  const [requests,  setRequests]  = useState([]);
  const [byStatus,  setByStatus]  = useState({});
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page,      setPage]      = useState(1);
  const [selected,  setSelected]  = useState(null); // req for detail modal

  // ── fetch ──────────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (search)       params.search = search;
      if (statusFilter) params.status = statusFilter;

      const res = await adminApi.maintenance.serviceRequests.list(params);
      if (res?.success) {
        setRequests(res.data?.items      ?? []);
        setByStatus(res.data?.byStatus   ?? {});
        setPagination(res.data?.pagination ?? { total: 0, page: 1, totalPages: 1 });
      }
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => { load(); }, [load]);

  // ── update status ─────────────────────────────────────────────────────────
  const { loading: updating, fire: fireUpdate } = useAdminFetch({
    fn: ({ id, payload }) => adminApi.maintenance.serviceRequests.update(id, payload),
    successMessage: 'Request updated.',
    onSuccess: () => { setSelected(null); load(); },
  });

  // ── delete ────────────────────────────────────────────────────────────────
  const { loading: deleting, fire: fireDelete } = useAdminFetch({
    fn: adminApi.maintenance.serviceRequests.remove,
    successMessage: 'Request deleted.',
    onSuccess: load,
  });

  const handleDelete = (id) => {
    if (!window.confirm('Permanently delete this service request?')) return;
    fireDelete(id);
  };

  // ── search debounce ───────────────────────────────────────────────────────
  const [searchInput, setSearchInput] = useState('');
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  // total "New" count for badge
  const newCount = byStatus.New || 0;

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-5">
        <div>
          <h2 className="text-base font-bold text-slate-800">
            Service Requests
            {newCount > 0 && (
              <span className="ml-2 inline-flex items-center rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-bold text-rose-700">
                {newCount} New
              </span>
            )}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Customer booking submissions from the public Maintenance page.
          </p>
        </div>
        <button onClick={load}
          className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 transition" title="Refresh">
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Status filter pills */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button onClick={() => { setStatusFilter(''); setPage(1); }}
          className={`rounded-full px-3 py-1 text-[11px] font-bold border transition ${!statusFilter ? 'bg-slate-800 text-white border-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
          All ({pagination.total})
        </button>
        {STATUSES.map((s) => (
          <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`rounded-full px-3 py-1 text-[11px] font-bold border transition ${
              statusFilter === s
                ? STATUS_CONFIG[s].color + ' border-current'
                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}>
            {s} {byStatus[s] ? `(${byStatus[s]})` : ''}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search by name, phone, email, package, drone…"
          className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-4 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading…
        </div>
      ) : requests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
          <Inbox className="h-10 w-10 mb-3 opacity-30" />
          <p className="text-sm font-semibold">No service requests found.</p>
          <p className="text-xs mt-1">Submissions from the Maintenance page will appear here.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-left">
                {['ID', 'Customer', 'Drone / Package', 'Status', 'Date', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {requests.map((req) => (
                <tr key={req._id} className="hover:bg-slate-50/60 transition">
                  <td className="px-4 py-3 font-mono text-slate-500 whitespace-nowrap">{req.requestId}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <p className="font-semibold text-slate-800">{req.customer?.name}</p>
                    <p className="text-slate-400">{req.customer?.phone}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-700">{req.drone?.model}</p>
                    <p className="text-slate-400">{req.package?.name}</p>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <StatusBadge status={req.status} />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-slate-500">{fmtDate(req.createdAt)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setSelected(req)}
                        className="rounded-lg px-2.5 py-1 text-[11px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 transition">
                        View
                      </button>
                      <button onClick={() => handleDelete(req._id)} disabled={deleting}
                        className="rounded-lg p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition disabled:opacity-40">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-xs text-slate-500">
          <span>
            Showing {((page - 1) * 15) + 1}–{Math.min(page * 15, pagination.total)} of {pagination.total}
          </span>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
              className="rounded-lg border border-slate-200 p-1.5 hover:bg-slate-50 disabled:opacity-30 transition">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-3 py-1 rounded-lg bg-slate-100 font-semibold text-slate-700">
              {page} / {pagination.totalPages}
            </span>
            <button onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page === pagination.totalPages}
              className="rounded-lg border border-slate-200 p-1.5 hover:bg-slate-50 disabled:opacity-30 transition">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <Modal
          isOpen={!!selected}
          onClose={() => setSelected(null)}
          title={`Request ${selected.requestId}`}
          size="md"
        >
          <RequestDetail
            req={selected}
            onStatusChange={(id, payload) => fireUpdate({ id, payload })}
            onClose={() => setSelected(null)}
            saving={updating}
          />
        </Modal>
      )}
    </>
  );
}
