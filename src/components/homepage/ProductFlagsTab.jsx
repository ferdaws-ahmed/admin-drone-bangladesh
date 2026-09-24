'use client';

import { useCallback, useEffect, useState } from 'react';
import { RefreshCw, Search, Loader2, Info, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import adminApi from '@/lib/adminApi';

// Flag definitions — label + colour
const FLAGS = [
  { key: 'isNewArrival',    label: 'New Arrival',     color: 'text-emerald-700 bg-emerald-50 border-emerald-200',  dot: 'bg-emerald-500' },
  { key: 'isDjiDrone',      label: 'DJI Drone',       color: 'text-blue-700 bg-blue-50 border-blue-200',           dot: 'bg-blue-500' },
  { key: 'isPersonalDrone', label: 'Personal Drone',  color: 'text-violet-700 bg-violet-50 border-violet-200',     dot: 'bg-violet-500' },
  { key: 'isBeginnerDrone', label: 'Beginner Drone',  color: 'text-amber-700 bg-amber-50 border-amber-200',        dot: 'bg-amber-500' },
];

// Single flag toggle chip
function FlagChip({ flagDef, active, productId, productTitle, onToggle, busy }) {
  return (
    <button
      type="button"
      disabled={busy}
      onClick={() => onToggle(productId, flagDef.key, !active)}
      title={`${active ? 'Remove' : 'Add'} "${flagDef.label}" flag for ${productTitle}`}
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold transition-all disabled:opacity-50 ${
        active
          ? `${flagDef.color} shadow-sm`
          : 'border-slate-200 bg-slate-50 text-slate-400 hover:border-slate-300'
      }`}
    >
      {busy ? (
        <Loader2 className="h-2.5 w-2.5 animate-spin" />
      ) : (
        <span className={`h-1.5 w-1.5 rounded-full ${active ? flagDef.dot : 'bg-slate-300'}`} />
      )}
      {flagDef.label}
    </button>
  );
}

export default function ProductFlagsTab() {
  const [products, setProducts]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  // busyMap: { `${productId}_${flag}`: true }
  const [busyMap, setBusyMap]     = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.homepage.productFlags.getAll();
      if (res?.success) setProducts(res.data || []);
      else toast.error(res?.message || 'Failed to load products');
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleToggle = async (productId, flag, value) => {
    const busyKey = `${productId}_${flag}`;
    setBusyMap((prev) => ({ ...prev, [busyKey]: true }));
    try {
      const res = await adminApi.homepage.productFlags.update(productId, flag, value);
      if (res?.success) {
        setProducts((prev) =>
          prev.map((p) =>
            p._id === productId ? { ...p, [flag]: value } : p
          )
        );
        // no toast for individual flag toggles — too noisy; silent update
      } else {
        toast.error(res?.message || 'Update failed');
      }
    } catch (err) {
      toast.error(err?.message || 'Update failed');
    } finally {
      setBusyMap((prev) => {
        const next = { ...prev };
        delete next[busyKey];
        return next;
      });
    }
  };

  const filtered = products.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      p.title?.toLowerCase().includes(q) ||
      p.productCode?.toLowerCase().includes(q) ||
      p.brand?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-5">
      {/* Info */}
      <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3.5 text-xs text-blue-800">
        <Info className="h-4 w-4 shrink-0 mt-0.5 text-blue-500" />
        <p>
          Toggle homepage section flags for each product. A product can appear in{' '}
          <strong>multiple sections</strong> simultaneously. Changes take effect immediately.
        </p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2">
        {FLAGS.map((f) => (
          <span key={f.key} className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold ${f.color}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${f.dot}`} />
            {f.label}
          </span>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex gap-3 flex-col sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, SKU or brand…"
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-8 pr-3 text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition"
          />
        </div>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition shrink-0"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 py-14 text-center text-sm text-slate-400">
          {search ? 'No products match your search.' : 'No drone products found.'}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <p className="text-xs font-semibold text-slate-700">{filtered.length} products</p>
            <p className="text-[11px] text-slate-400">Click a flag to toggle it on/off</p>
          </div>
          <div className="divide-y divide-slate-100">
            {filtered.map((product) => (
              <div
                key={product._id}
                className="flex flex-col sm:flex-row sm:items-center gap-3 px-4 py-3.5 hover:bg-slate-50/60 transition-colors"
              >
                {/* Product identity */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                    {product.images?.[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.images[0]}
                        alt={product.title}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Zap className="h-4 w-4 text-slate-300" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-800 truncate">{product.title}</p>
                    <p className="text-[10px] text-slate-400 truncate">
                      {product.brand && `${product.brand} · `}SKU: {product.productCode || 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Flag chips */}
                <div className="flex flex-wrap gap-1.5 sm:shrink-0">
                  {FLAGS.map((flagDef) => (
                    <FlagChip
                      key={flagDef.key}
                      flagDef={flagDef}
                      active={!!product[flagDef.key]}
                      productId={product._id}
                      productTitle={product.title}
                      onToggle={handleToggle}
                      busy={!!busyMap[`${product._id}_${flagDef.key}`]}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
