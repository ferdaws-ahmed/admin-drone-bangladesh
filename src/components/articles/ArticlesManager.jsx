'use client';

import { useCallback, useEffect, useState } from 'react';
import { Eye, Pencil, RefreshCw, Search, Trash2, X, Plus, FileText, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ArticleEditor from '@/components/articles/ArticleEditor';
import adminApi from '@/lib/adminApi';

const getArticleId = (article) => article._id || article.id;

const formatDate = (value) => {
  if (!value) return '';
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));
};

const statusColors = {
  published: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  draft: 'bg-slate-100 text-slate-600 border-slate-200',
  scheduled: 'bg-amber-50 text-amber-700 border-amber-200',
};

const articleCategories = [
  'Guides',
  'News',
  'Reviews',
  'Tutorials',
  'Buying Tips',
  'Product Updates',
  'Industry',
  'General',
];

export default function ArticlesManager() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);

  const loadArticles = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const response = await adminApi.cms.articles.list();
      let items = response?.success ? response.data?.items || [] : [];

      if (search.trim()) {
        const s = search.trim().toLowerCase();
        items = items.filter(
          (a) =>
            a.title?.toLowerCase().includes(s) ||
            a.author?.toLowerCase().includes(s) ||
            a.category?.toLowerCase().includes(s) ||
            a.excerpt?.toLowerCase().includes(s)
        );
      }
      if (categoryFilter) {
        items = items.filter((a) => (a.category || '').toLowerCase() === categoryFilter.toLowerCase());
      }
      if (statusFilter) {
        items = items.filter((a) => (a.status || 'draft') === statusFilter);
      }

      setArticles(items);
    } catch (error) {
      console.error('Failed to load articles', error);
      toast.error('Unable to load articles');
      setArticles([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [categoryFilter, search, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => loadArticles(), 250);
    return () => clearTimeout(timer);
  }, [loadArticles]);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const response = await adminApi.cms.articles.remove(getArticleId(deleteTarget));
      if (!response?.success) throw new Error(response?.message || 'Delete failed');
      setArticles((current) => current.filter((item) => getArticleId(item) !== getArticleId(deleteTarget)));
      setDeleteTarget(null);
      toast.success('Article deleted');
    } catch (error) {
      console.error('Failed to delete article', error);
      toast.error('Unable to delete article');
    } finally {
      setDeleting(false);
    }
  };

  const openEditor = (article = null) => {
    setEditingArticle(article);
    setShowEditor(true);
  };

  const closeEditor = () => {
    setShowEditor(false);
    setEditingArticle(null);
  };

  if (loading) return <LoadingSpinner label="Loading articles..." />;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">Content Management</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">Articles</h1>
          <p className="mt-1 text-sm text-slate-500">Manage editorial content, news, guides, and blog posts.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => loadArticles(true)}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
          </button>
          <button
            type="button"
            onClick={() => openEditor()}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" /> New Article
          </button>
        </div>
      </div>

      {/* Editor Modal */}
      {showEditor && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/40 p-4 py-8">
          <div role="dialog" aria-modal="true" className="w-full max-w-5xl">
            <ArticleEditor
              article={editingArticle}
              onSaved={async () => {
                closeEditor();
                await loadArticles();
              }}
              onCancel={closeEditor}
            />
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[minmax(0,1fr)_180px_180px]">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search title, author, category or excerpt"
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
          />
        </label>
        <select
          value={categoryFilter}
          onChange={(event) => setCategoryFilter(event.target.value)}
          className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500"
        >
          <option value="">All categories</option>
          {articleCategories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500"
        >
          <option value="">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="scheduled">Scheduled</option>
        </select>
      </div>

      {/* Articles Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <p className="text-sm font-semibold text-slate-800">{articles.length} articles</p>
          <p className="text-xs text-slate-500">
            <FileText className="inline h-3.5 w-3.5 mr-1" />
            Changes save instantly
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Article</th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">Author</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">
                  <Calendar className="inline h-3.5 w-3.5 mr-1" />
                  Created
                </th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {articles.map((article) => {
                const id = getArticleId(article);
                const status = article.status || 'draft';
                return (
                  <tr key={id} className="align-middle hover:bg-slate-50/70">
                    <td className="px-4 py-3">
                      <div className="flex min-w-[280px] items-center gap-3">
                        <div className="h-12 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                          {article.imageUrl ? (
                            <img
                              src={article.imageUrl}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-slate-400">
                              <FileText className="h-5 w-5" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-slate-900 truncate">
                            {article.title || 'Untitled article'}
                          </p>
                          <p className="text-xs text-slate-500 truncate">
                            {article.excerpt || article.slug || 'No excerpt'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 capitalize">
                        {article.category || 'General'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700 font-medium">
                      {article.author || 'Drone Bangladesh'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${
                          statusColors[status] || statusColors.draft
                        }`}
                      >
                        {status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500 font-medium">
                      {formatDate(article.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <a
                          href={`${adminApi.storeUrl}/articles/${article.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`View ${article.title}`}
                          className="rounded-md p-2 text-slate-500 transition hover:bg-slate-100 hover:text-blue-600"
                        >
                          <Eye className="h-4 w-4" />
                        </a>
                        <button
                          type="button"
                          onClick={() => openEditor(article)}
                          aria-label={`Edit ${article.title}`}
                          className="rounded-md p-2 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(article)}
                          aria-label={`Delete ${article.title}`}
                          className="rounded-md p-2 text-slate-500 transition hover:bg-rose-50 hover:text-rose-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {!articles.length && (
          <div className="px-6 py-14 text-center text-sm text-slate-500">
            No articles match the selected filters.
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl"
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Delete article?</h2>
                <p className="mt-1 text-sm text-slate-500">
                  This will permanently remove “{deleteTarget.title}”.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                aria-label="Close confirmation"
                className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="rounded-lg border border-slate-200 px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="rounded-lg bg-rose-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
              >
                {deleting ? 'Deleting...' : 'Delete article'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
