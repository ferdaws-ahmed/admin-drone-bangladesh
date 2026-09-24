'use client';

import { useCallback, useEffect, useState } from 'react';
import { Star, StarOff, RefreshCw, Loader2, ImageIcon, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import adminApi from '@/lib/adminApi';

const MAX_FEATURED = 4;

function CategoryCard({ category, onToggle, toggling }) {
  const isFeatured = !!category.isFeatured;
  return (
    <div
      className={`group relative flex items-center gap-4 rounded-xl border p-4 transition-all duration-200 ${
        isFeatured
          ? 'border-blue-200 bg-blue-50/60 shadow-sm'
          : 'border-slate-200 bg-white hover:border-slate-300'
      }`}
    >
      {/* Category image */}
      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-slate-100 border border-slate-200">
        {category.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={category.image}
            alt={category.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <ImageIcon className="h-5 w-5 text-slate-300" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-slate-900 truncate">{category.name}</p>
        <p className="text-[11px] text-slate-400 mt-0.5 capitalize">{category.type} category</p>
      </div>

      {/* Featured badge */}
      {isFeatured && (
        <span className="shrink-0 rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-bold text-blue-700">
          FEATURED
        </span>
      )}

      {/* Toggle button */}
      <button
        type="button"
        onClick={() => onToggle(category)}
        disabled={toggling === category._id}
        title={isFeatured ? 'Remove from featured' : 'Add to featured'}
        className={`shrink-0 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all disabled:opacity-50 ${
          isFeatured
            ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200'
            : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
        }`}
      >
        {toggling === category._id ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : isFeatured ? (
          <>
            <StarOff className="h-3.5 w-3.5" /> Unfeature
          </>
        ) : (
          <>
            <Star className="h-3.5 w-3.5" /> Feature
          </>
        )}
      </button>
    </div>
  );
}

export default function FeaturedCategoriesTab() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [toggling, setToggling]     = useState(null); // category._id being toggled

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.homepage.categories.getAll();
      if (res?.success) setCategories(res.data || []);
      else toast.error(res?.message || 'Failed to load categories');
    } catch {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleToggle = async (category) => {
    const featuredCount = categories.filter((c) => c.isFeatured).length;
    if (!category.isFeatured && featuredCount >= MAX_FEATURED) {
      toast.error(`Maximum ${MAX_FEATURED} categories can be featured. Unfeature one first.`);
      return;
    }

    setToggling(category._id);
    try {
      const res = await adminApi.homepage.categories.toggle(category._id);
      if (res?.success) {
        setCategories((prev) =>
          prev.map((c) =>
            c._id === category._id ? { ...c, isFeatured: res.data.isFeatured } : c
          )
        );
        toast.success(res.message || 'Updated');
      } else {
        toast.error(res?.message || 'Update failed');
      }
    } catch (err) {
      toast.error(err?.message || 'Update failed');
    } finally {
      setToggling(null);
    }
  };

  const featured = categories.filter((c) => c.isFeatured);
  const rest     = categories.filter((c) => !c.isFeatured);

  return (
    <div className="space-y-6">
      {/* Info banner */}
      <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3.5 text-xs text-blue-800">
        <Info className="h-4 w-4 shrink-0 mt-0.5 text-blue-500" />
        <p>
          Select up to <strong>{MAX_FEATURED} drone categories</strong> to feature on the
          home page. Featured categories appear in the "Featured Categories" section.
          Changes take effect immediately.
        </p>
      </div>

      {/* Progress bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-slate-600">
            Featured slots used
          </p>
          <span className={`text-xs font-bold ${featured.length >= MAX_FEATURED ? 'text-rose-600' : 'text-blue-600'}`}>
            {featured.length} / {MAX_FEATURED}
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              featured.length >= MAX_FEATURED ? 'bg-rose-500' : 'bg-blue-500'
            }`}
            style={{ width: `${(featured.length / MAX_FEATURED) * 100}%` }}
          />
        </div>
      </div>

      {/* Header + refresh */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-slate-700">
          All Drone Categories ({categories.length})
        </p>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 py-14 text-center text-sm text-slate-400">
          No categories found. Add drone categories first.
        </div>
      ) : (
        <div className="space-y-3">
          {/* Featured first */}
          {featured.length > 0 && (
            <>
              <p className="text-[11px] font-bold uppercase tracking-widest text-blue-500 px-1">
                Currently Featured
              </p>
              {featured.map((cat) => (
                <CategoryCard
                  key={cat._id}
                  category={cat}
                  onToggle={handleToggle}
                  toggling={toggling}
                />
              ))}
            </>
          )}

          {rest.length > 0 && (
            <>
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 px-1 pt-2">
                Available Categories
              </p>
              {rest.map((cat) => (
                <CategoryCard
                  key={cat._id}
                  category={cat}
                  onToggle={handleToggle}
                  toggling={toggling}
                />
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
