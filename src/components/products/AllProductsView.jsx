'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Eye, Pencil, RefreshCw, Search, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import adminApi from '@/lib/adminApi';

const badgeOptions = [
  { value: '', label: 'No badge' },
  { value: 'BEST SELLER', label: 'Best Seller' },
  { value: 'POPULAR', label: 'Popular' },
  { value: 'HOT', label: 'Hot' },
];

const getProductId = (product) => product._id || product.id;
const getProductType = (product) => product.productType || (product.collectionName === 'Drones' ? 'drone' : 'handheld');
const getProductPath = (product) => (getProductType(product) === 'drone' ? 'drones' : 'handhelds');
const getBadge = (product) => product.badge || (product.isBestSeller ? 'BEST SELLER' : product.isPopular ? 'POPULAR' : product.isHot ? 'HOT' : '');

export default function AllProductsView() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [stockStatus, setStockStatus] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadProducts = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const response = await adminApi.products.list({ search: search.trim(), category, stockStatus, limit: 100 });
      setProducts(response?.success ? response.data?.items || [] : []);
    } catch (error) {
      console.error('Failed to load products', error);
      toast.error('Unable to load products');
      setProducts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [category, search, stockStatus]);

  useEffect(() => {
    const timer = setTimeout(() => loadProducts(), 250);
    return () => clearTimeout(timer);
  }, [loadProducts]);

  const updateBadge = async (product, badge) => {
    try {
      const response = await adminApi.products.updateProduct(getProductId(product), {
        productType: getProductType(product), badge: badge || null,
        isBestSeller: badge === 'BEST SELLER', isPopular: badge === 'POPULAR', isHot: badge === 'HOT',
      });
      if (!response?.success) throw new Error(response?.message || 'Badge update failed');
      setProducts((current) => current.map((item) => getProductId(item) === getProductId(product)
        ? { ...item, badge: badge || null, isBestSeller: badge === 'BEST SELLER', isPopular: badge === 'POPULAR', isHot: badge === 'HOT' } : item));
      toast.success('Badge updated');
    } catch (error) {
      console.error('Failed to update badge', error);
      toast.error('Unable to update badge');
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const response = await adminApi.products.deleteProduct(getProductId(deleteTarget), getProductType(deleteTarget));
      if (!response?.success) throw new Error(response?.message || 'Delete failed');
      setProducts((current) => current.filter((item) => getProductId(item) !== getProductId(deleteTarget)));
      setDeleteTarget(null);
      toast.success('Product deleted');
    } catch (error) {
      console.error('Failed to delete product', error);
      toast.error('Unable to delete product');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <LoadingSpinner label="Loading products..." />;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">Inventory control</p><h1 className="mt-1 text-2xl font-bold text-slate-900">Products</h1><p className="mt-1 text-sm text-slate-500">Manage drones and handheld products from one catalog.</p></div>
        <button type="button" onClick={() => loadProducts(true)} disabled={refreshing} className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"><RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} /> Refresh</button>
      </div>

      <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[minmax(0,1fr)_180px_180px]">
        <label className="relative block"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search title, SKU, brand or subcategory" className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white" /></label>
        <select value={category} onChange={(event) => setCategory(event.target.value)} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500"><option value="">All categories</option><option value="Drone">Drone</option><option value="Handheld">Handheld</option><option value="Combo">Combo</option><option value="Accessories">Accessories</option></select>
        <select value={stockStatus} onChange={(event) => setStockStatus(event.target.value)} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500"><option value="">All stock status</option><option value="In Stock">In Stock</option><option value="Out of Stock">Out of Stock</option><option value="Pre-Order">Pre-Order</option></select>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><div className="flex items-center justify-between border-b border-slate-100 px-4 py-3"><p className="text-sm font-semibold text-slate-800">{products.length} products</p><p className="text-xs text-slate-500">Changes save instantly</p></div><div className="overflow-x-auto"><table className="w-full min-w-[920px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3 font-semibold">Product</th><th className="px-4 py-3 font-semibold">Type / Category</th><th className="px-4 py-3 font-semibold">Price</th><th className="px-4 py-3 font-semibold">Stock</th><th className="px-4 py-3 font-semibold">Badge</th><th className="px-4 py-3 text-right font-semibold">Actions</th></tr></thead><tbody className="divide-y divide-slate-100">
        {products.map((product) => { const id = getProductId(product); const path = getProductPath(product); return <tr key={`${getProductType(product)}-${id}`} className="align-middle hover:bg-slate-50/70"><td className="px-4 py-3"><div className="flex min-w-[280px] items-center gap-3"><div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-slate-100">{product.images?.[0] ? <img src={product.images[0]} alt="" className="h-full w-full object-contain" /> : null}</div><div><p className="font-semibold text-slate-900">{product.title || 'Untitled product'}</p><p className="text-xs text-slate-500">SKU: {product.productCode || 'N/A'} · {product.brand || 'No brand'}</p></div></div></td><td className="px-4 py-3"><p className="font-medium capitalize text-slate-700">{getProductType(product)}</p><p className="text-xs text-slate-500">{product.category || 'General'} / {product.subCategory || 'N/A'}</p></td><td className="px-4 py-3 font-semibold text-slate-800">৳{Number(product.pricing?.offerPrice || 0).toLocaleString()}</td><td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${product.stockStatus === 'In Stock' ? 'bg-emerald-50 text-emerald-700' : product.stockStatus === 'Pre-Order' ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'}`}>{product.stockStatus || 'Unknown'}</span></td><td className="px-4 py-3"><select aria-label={`Badge for ${product.title}`} value={getBadge(product)} onChange={(event) => updateBadge(product, event.target.value)} className="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:border-blue-500">{badgeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></td><td className="px-4 py-3"><div className="flex justify-end gap-1"><Link href={`/${path}/product/${id}`} target="_blank" aria-label={`View ${product.title}`} className="rounded-md p-2 text-slate-500 transition hover:bg-slate-100 hover:text-blue-600"><Eye className="h-4 w-4" /></Link><Link href={`/products/add-${getProductType(product) === 'drone' ? 'drones' : 'handhelds'}?edit=${id}`} aria-label={`Edit ${product.title}`} className="rounded-md p-2 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600"><Pencil className="h-4 w-4" /></Link><button type="button" onClick={() => setDeleteTarget(product)} aria-label={`Delete ${product.title}`} className="rounded-md p-2 text-slate-500 transition hover:bg-rose-50 hover:text-rose-600"><Trash2 className="h-4 w-4" /></button></div></td></tr>; })}
      </tbody></table></div>{!products.length && <div className="px-6 py-14 text-center text-sm text-slate-500">No products match the selected filters.</div>}</div>

      {deleteTarget && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"><div role="dialog" aria-modal="true" className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl"><div className="flex items-start justify-between"><div><h2 className="text-lg font-bold text-slate-900">Delete product?</h2><p className="mt-1 text-sm text-slate-500">This will permanently remove “{deleteTarget.title}”.</p></div><button type="button" onClick={() => setDeleteTarget(null)} aria-label="Close confirmation" className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><X className="h-5 w-5" /></button></div><div className="mt-5 flex justify-end gap-2"><button type="button" onClick={() => setDeleteTarget(null)} className="rounded-lg border border-slate-200 px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button><button type="button" onClick={confirmDelete} disabled={deleting} className="rounded-lg bg-rose-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60">{deleting ? 'Deleting...' : 'Delete product'}</button></div></div></div>}
    </div>
  );
}
