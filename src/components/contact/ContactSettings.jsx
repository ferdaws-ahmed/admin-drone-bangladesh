'use client';

import { useEffect, useState } from 'react';
import { Inbox, Search, Eye, Send, CheckCircle2, Archive, MessageSquareText, ChevronLeft, ChevronRight } from 'lucide-react';
import adminApi from '@/lib/adminApi';
import { useToast } from '@/components/common/ToastProvider';

const STATUS_STYLES = {
  New: 'bg-rose-50 text-rose-700 border-rose-200',
  Read: 'bg-sky-50 text-sky-700 border-sky-200',
  Replied: 'bg-amber-50 text-amber-700 border-amber-200',
  Resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Archived: 'bg-slate-100 text-slate-600 border-slate-200',
};

const STATUS_ICONS = {
  New: Inbox,
  Read: Eye,
  Replied: Send,
  Resolved: CheckCircle2,
  Archived: Archive,
};

const normalizeSubmission = (item = {}) => ({
  ...item,
  _id: item._id ? String(item._id) : item.id ? String(item.id) : '',
  name: item.name || 'Unknown',
  email: item.email || '',
  phone: item.phone || '',
  subject: item.subject || 'General Inquiry',
  message: item.message || '',
  status: item.status || 'New',
  createdAt: item.createdAt || item.created_at || new Date().toISOString(),
  updatedAt: item.updatedAt || item.updated_at || item.createdAt || item.created_at || new Date().toISOString(),
});

export default function ContactSettings() {
  const [submissions, setSubmissions] = useState([]);
  const [stats, setStats] = useState({ total: 0, byStatus: { New: 0, Read: 0, Replied: 0, Resolved: 0 } });
  const [page, setPage] = useState(1);
  const [pageLimit] = useState(8);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const { push } = useToast();

  useEffect(() => {
    loadStats();
    loadSubmissions(page, searchTerm);
  }, [page, searchTerm]);

  const loadStats = async () => {
    try {
      const res = await adminApi.contact.stats();
      if (res?.success) setStats(res.data);
    } catch (err) {
      console.error('Failed to load message stats', err);
    }
  };

  const loadSubmissions = async (currentPage = page, currentSearch = searchTerm) => {
    setLoading(true);
    try {
      const res = await adminApi.contact.list({
        page: currentPage,
        limit: pageLimit,
        search: currentSearch || undefined,
      });

      if (res?.success) {
        const payload = res.data || {};
        const items = Array.isArray(payload.submissions)
          ? payload.submissions
          : Array.isArray(payload.data)
            ? payload.data
            : [];

        setSubmissions(items.map(normalizeSubmission));
        setTotalPages(payload.pagination?.pages || 0);
      }
    } catch (err) {
      console.error('Failed to load messages', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (event) => {
    event.preventDefault();
    const nextSearch = searchValue.trim();
    setPage(1);
    setSearchTerm(nextSearch);
    setExpandedId(null);
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await adminApi.contact.updateStatus(id, newStatus);
      if (res?.success) {
        setSubmissions((prev) =>
          prev.map((item) => (item._id === id ? { ...item, status: newStatus, updatedAt: new Date() } : item))
        );
        push(`Status updated to ${newStatus}.`, 'success');
        loadStats();
      }
    } catch (err) {
      push('Failed to update status.', 'error');
    }
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-600">
            <MessageSquareText className="h-3.5 w-3.5" />
            Customer Messages
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Inbox</h1>
        </div>

        <form onSubmit={handleSearch} className="w-full max-w-md">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Search by name or email"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </form>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{stats.total || 0}</p>
        </div>
        <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-rose-600">Unread</p>
          <p className="mt-2 text-2xl font-bold text-rose-700">{stats.byStatus?.New || 0}</p>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">Resolved</p>
          <p className="mt-2 text-2xl font-bold text-emerald-700">{stats.byStatus?.Resolved || 0}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-sm text-slate-500">Loading messages...</div>
        ) : submissions.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <Inbox className="h-6 w-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-800">No messages found</h3>
            <p className="mt-1 text-sm text-slate-500">Try another name or email address.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {submissions.map((item) => {
              const expanded = expandedId === item._id;
              const StatusIcon = STATUS_ICONS[item.status] || Inbox;

              return (
                <div key={item._id} className="p-4 sm:p-5">
                  <button
                    type="button"
                    onClick={() => {
                      setExpandedId(expanded ? null : item._id);
                      if (item.status === 'New') handleStatusChange(item._id, 'Read');
                    }}
                    className="w-full text-left"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-base font-semibold text-slate-900">{item.name}</p>
                          <span className="text-xs text-slate-500">{item.email}</span>
                        </div>
                        <p className="mt-1 text-sm text-slate-600">{item.subject || 'General Inquiry'}</p>
                        <p className="mt-2 max-w-3xl text-sm text-slate-500 line-clamp-2">{item.message}</p>
                      </div>

                      <div className="flex shrink-0 items-center gap-2 sm:flex-col sm:items-end">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${STATUS_STYLES[item.status] || STATUS_STYLES.New}`}
                        >
                          <StatusIcon className="h-3.5 w-3.5" />
                          {item.status}
                        </span>
                        <span className="text-xs text-slate-400">{formatDate(item.createdAt)}</span>
                      </div>
                    </div>
                  </button>

                  {expanded && (
                    <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Full message</p>
                      <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">{item.message}</p>

                      <div className="mt-4 flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="text-xs text-slate-500">
                          Sent: {formatDate(item.createdAt)}
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {['New', 'Read', 'Replied', 'Resolved', 'Archived'].map((status) => (
                            <button
                              key={status}
                              type="button"
                              onClick={() => handleStatusChange(item._id, status)}
                              className={`rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold transition ${
                                item.status === status
                                  ? `${STATUS_STYLES[status]} shadow-sm`
                                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                              }`}
                            >
                              {status}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-3 text-sm">
            <p className="text-slate-500">
              Page <span className="font-semibold text-slate-700">{page}</span> of {totalPages}
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page === 1}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Prev
              </button>
              <button
                type="button"
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                disabled={page === totalPages}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
