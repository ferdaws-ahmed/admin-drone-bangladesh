'use client';

import { useEffect, useState } from 'react';
import { Plus, Tag, Trash2 } from 'lucide-react';
import adminApi from '@/lib/adminApi';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useToast } from '@/components/common/ToastProvider';

const initialForm = {
  code: '',
  minOrderAmount: '',
  discountAmount: '',
  maxDiscountAmount: '',
  expiresAt: '',
};

export default function CouponsManager() {
  const { push } = useToast();
  const [coupons, setCoupons] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const response = await adminApi.coupons.list();
      if (!response?.success) throw new Error(response?.message || 'Failed to load coupons');
      setCoupons(response.data || []);
    } catch (error) {
      push(error.message || 'Failed to load coupons', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const createCoupon = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await adminApi.coupons.create({
        ...form,
        code: form.code.trim().toUpperCase(),
        minOrderAmount: Number(form.minOrderAmount),
        discountAmount: Number(form.discountAmount),
        maxDiscountAmount: Number(form.maxDiscountAmount || form.discountAmount),
        expiresAt: form.expiresAt || null,
      });
      if (!response?.success) throw new Error(response?.message || 'Failed to create coupon');
      setCoupons((current) => [response.data, ...current]);
      setForm(initialForm);
      push('Coupon created successfully');
    } catch (error) {
      push(error.message || 'Failed to create coupon', 'error');
    } finally {
      setSaving(false);
    }
  };

  const deleteCoupon = async (coupon) => {
    if (!window.confirm(`Delete coupon ${coupon.code}?`)) return;
    try {
      const response = await adminApi.coupons.delete(coupon._id);
      if (!response?.success) throw new Error(response?.message || 'Failed to delete coupon');
      setCoupons((current) => current.filter((item) => item._id !== coupon._id));
      push('Coupon deleted successfully');
    } catch (error) {
      push(error.message || 'Failed to delete coupon', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Coupon Codes</h1>
        <p className="mt-1 text-sm text-slate-500">Create discount codes with minimum order conditions.</p>
      </header>

      <form onSubmit={createCoupon} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex items-center gap-2"><Tag className="h-5 w-5 text-blue-600" /><h2 className="text-base font-bold text-slate-900">Add Coupon Code</h2></div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <label className="text-sm font-semibold text-slate-700">Code<input required name="code" value={form.code} onChange={handleChange} placeholder="WELCOME500" className="mt-2 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm uppercase outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" /></label>
          <label className="text-sm font-semibold text-slate-700">Minimum order<input required min="0" type="number" name="minOrderAmount" value={form.minOrderAmount} onChange={handleChange} placeholder="5000" className="mt-2 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" /></label>
          <label className="text-sm font-semibold text-slate-700">Discount amount<input required min="1" type="number" name="discountAmount" value={form.discountAmount} onChange={handleChange} placeholder="500" className="mt-2 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" /></label>
          <label className="text-sm font-semibold text-slate-700">Max discount<input min="1" type="number" name="maxDiscountAmount" value={form.maxDiscountAmount} onChange={handleChange} placeholder="500" className="mt-2 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" /></label>
          <label className="text-sm font-semibold text-slate-700">Expiry (optional)<input type="date" name="expiresAt" value={form.expiresAt} onChange={handleChange} className="mt-2 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" /></label>
        </div>
        <button disabled={saving} className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"><Plus className="h-4 w-4" />{saving ? 'Saving...' : 'Add coupon'}</button>
      </form>

      {loading ? <LoadingSpinner label="Loading coupons..." /> : <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-slate-50 text-slate-600"><tr><th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Code</th><th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider">Minimum order</th><th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider">Discount</th><th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Expiry</th><th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider">Action</th></tr></thead><tbody className="divide-y divide-slate-100">{coupons.map((coupon) => <tr key={coupon._id} className="hover:bg-slate-50"><td className="px-4 py-3 font-bold text-slate-800">{coupon.code}</td><td className="px-4 py-3 text-right text-slate-700">BDT {Number(coupon.minOrderAmount || 0).toLocaleString()}</td><td className="px-4 py-3 text-right font-semibold text-emerald-600">BDT {Number(coupon.discountAmount || 0).toLocaleString()}</td><td className="px-4 py-3 text-slate-600">{coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString() : 'No expiry'}</td><td className="px-4 py-3 text-right"><button type="button" onClick={() => deleteCoupon(coupon)} aria-label={`Delete ${coupon.code}`} className="rounded-md p-2 text-slate-500 transition hover:bg-rose-50 hover:text-rose-600"><Trash2 className="h-4 w-4" /></button></td></tr>)}{!coupons.length && <tr><td colSpan={5} className="px-4 py-16 text-center text-slate-400">No coupon codes found.</td></tr>}</tbody></table></div></div>}
    </div>
  );
}
