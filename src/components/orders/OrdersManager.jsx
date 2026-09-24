'use client';

/* Orders Manager - Full CRUD status actions with toast */

import { useEffect, useRef, useState } from 'react';
import { Eye, XCircle, Search, CheckCircle2, Send, CalendarDays, Trash2 } from 'lucide-react';
import Modal from '@/components/common/Modal';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useToast } from '@/components/common/ToastProvider';
import adminApi from '@/lib/adminApi';
import useDebounce from '@/hooks/useDebounce';
import useAdminFetch from '@/hooks/useAdminFetch';
import { ORDER_SEEN_KEY, markSeen } from '@/lib/notificationState';

const fmt = (n) => '৳' + (Number(n) || 0).toLocaleString('en-BD');

const DELIVERY_STATUS = ['Processing', 'Shipped', 'Out For Delivery', 'Delivered', 'Cancelled'];
const PAYMENT_STATUS = ['Pending', 'Paid', 'Partial', 'Refunded'];
const ORDER_STATUS = ['Pending', 'Confirmed', 'Cancelled'];
const DATE_PRESETS = ['Today', 'Yesterday', 'This week', 'This month', 'This year'];

const formatDateInput = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getDateRange = (preset) => {
  if (!preset) return { from: '', to: '' };
  const now = new Date();
  const start = new Date(now);
  const end = new Date(now);
  if (preset === 'Yesterday') {
    start.setDate(start.getDate() - 1);
    end.setDate(end.getDate() - 1);
  } else if (preset === 'This week') {
    start.setDate(start.getDate() - start.getDay());
  } else if (preset === 'This month') {
    start.setDate(1);
  } else if (preset === 'This year') {
    start.setMonth(0, 1);
  }
  return { from: formatDateInput(start), to: formatDateInput(end) };
};

export default function OrdersManager() {
  const { push } = useToast();
  const pushRef = useRef(push);
  pushRef.current = push;

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [orderFilter, setOrderFilter] = useState('');
  const [deliveryFilter, setDeliveryFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [datePreset, setDatePreset] = useState('');
  const [loadError, setLoadError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const debounced = useDebounce(query, 350);

  const [open, setOpen] = useState(null); // order being edited

  useEffect(() => {
    markSeen(ORDER_SEEN_KEY);
  }, []);
  useEffect(() => {
    let cancelled = false;

    const loadOrders = async () => {
      setLoading(true);
      setLoadError('');
      try {
        const params = { page, limit };
        if (debounced) params.search = debounced;
        if (paymentFilter) params.paymentStatus = paymentFilter;
        if (orderFilter) params.orderStatus = orderFilter;
        if (deliveryFilter) params.deliveryStatus = deliveryFilter;
        if (dateFrom) params.dateFrom = dateFrom;
        if (dateTo) params.dateTo = dateTo;

        const r = await adminApi.orders.list(params);
        if (!r?.success) {
          if (!cancelled) {
            setLoadError(r?.message || 'Failed to load orders');
            pushRef.current(r?.message || 'Failed to load orders', 'error');
          }
          return;
        }

        if (!cancelled) {
          setOrders(r.data?.items || r.data || []);
          setTotal(r.data?.pagination?.total || 0);
        }
      } catch (error) {
        console.error('Failed to load orders:', error);
        if (!cancelled) {
          setLoadError(error.message || 'Unable to connect to the orders service');
          pushRef.current(error.message || 'Unable to connect to the orders service', 'error');
          setOrders([]);
          setTotal(0);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadOrders();
    return () => { cancelled = true; };
  }, [page, limit, debounced, paymentFilter, orderFilter, deliveryFilter, dateFrom, dateTo]);

  const updateOrder = async (id, payload) => {
    const r = await adminApi.orders.setStatus(id, payload);
    if (r?.success) {
      setOrders((prev) => prev.map((o) => (o._id === id ? r.data : o)));
      push(payload.paymentStatus === 'Paid' ? 'Payment verified and order confirmed' : 'Order updated', 'success');
    } else push(r?.message || 'Update failed', 'error');
  };

  const sendToCourier = async (order) => {
    try {
      const response = await adminApi.orders.sendToCourier(order._id);
      if (response?.success) {
        setOrders((current) => current.map((item) => item._id === order._id ? response.data : item));
        push('Order sent to RedX successfully', 'success');
      } else push(response?.message || 'Could not send order to courier', 'error');
    } catch (error) {
      push(error.message || 'Could not send order to courier', 'error');
    }
  };

  const deleteOrder = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const response = await adminApi.orders.delete(deleteTarget._id);
      if (response?.success) {
        setOrders((current) => current.filter((item) => item._id !== deleteTarget._id));
        setTotal((current) => Math.max(0, current - 1));
        setDeleteTarget(null);
        push('Order deleted successfully', 'success');
      } else push(response?.message || 'Could not delete order', 'error');
    } catch (error) {
      push(error.message || 'Could not delete order', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const canSendToCourier = (order) => order.paymentMethod === 'Cash on Delivery' || order.paymentStatus === 'Paid';

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Orders Manager</h1>
          <p className="text-sm text-slate-500 mt-1">{total} orders found — review, ship, and update status.</p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search ID, customer, phone…"
            className="w-full h-10 pl-10 pr-3 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
          />
        </div>
        <select value={paymentFilter} onChange={(event) => { setPage(1); setPaymentFilter(event.target.value); }} className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-500"><option value="">All payments</option>{PAYMENT_STATUS.map((status) => <option key={status}>{status}</option>)}</select>
        <select value={orderFilter} onChange={(event) => { setPage(1); setOrderFilter(event.target.value); }} className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-500"><option value="">All orders</option>{ORDER_STATUS.map((status) => <option key={status}>{status}</option>)}</select>
        <select value={deliveryFilter} onChange={(event) => { setPage(1); setDeliveryFilter(event.target.value); }} className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-500"><option value="">All delivery</option>{DELIVERY_STATUS.map((status) => <option key={status}>{status}</option>)}</select>
        <select value={datePreset} onChange={(event) => { const value = event.target.value; const range = getDateRange(value); setPage(1); setDatePreset(value); setDateFrom(range.from); setDateTo(range.to); }} className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-500"><option value="">All dates</option>{DATE_PRESETS.map((preset) => <option key={preset}>{preset}</option>)}</select>
        <label className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-500"><CalendarDays className="h-4 w-4" /><input type="date" value={dateFrom} onChange={(event) => { setPage(1); setDateFrom(event.target.value); }} aria-label="Orders from date" /></label>
        <label className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-500"><span>to</span><input type="date" value={dateTo} onChange={(event) => { setPage(1); setDateTo(event.target.value); }} aria-label="Orders to date" /></label>
        </div>
      </header>

      {loading ? (
        <LoadingSpinner label="Loading orders..." />
      ) : loadError ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-6 py-12 text-center">
          <p className="font-semibold text-rose-800">Unable to load orders</p>
          <p className="mt-2 text-sm text-rose-700">{loadError}</p>
          <button type="button" onClick={() => window.location.reload()} className="mt-5 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700">Retry</button>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Order</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Date & time</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Product</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Price</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Payment</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Courier status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((o) => {
                  const products = o.items?.length ? o.items : [{ name: 'No product details', quantity: 0 }];
                  const itemTotal = products.reduce((sum, product) => sum + (Number(product.price) || 0) * (Number(product.quantity) || 0), 0);
                  return (
                  <tr key={o._id} className="align-top hover:bg-slate-50">
                    <td className="px-4 py-3 font-semibold text-slate-800">{o.orderId || String(o._id).slice(-8).toUpperCase()}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{o.customerInfo?.name || '—'}</p>
                      <p className="text-xs text-slate-500">{o.customerInfo?.email || '—'}</p>
                      <p className="text-xs text-slate-500">{o.customerInfo?.phone || '—'}</p>
                      <p className="mt-2 max-w-48 text-xs text-slate-500">{[o.shippingAddress?.address, o.shippingAddress?.upazila, o.shippingAddress?.district].filter(Boolean).join(', ') || 'No shipping address'}</p>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-600">{o.createdAt ? new Date(o.createdAt).toLocaleString() : '—'}</td>
                    <td className="max-w-55 px-4 py-3"><div className="max-h-28 space-y-2 overflow-y-auto pr-1">{products.map((product, index) => <div key={`${o._id}-${product.productId || index}`}><p className="text-sm font-semibold text-slate-800">{product.name || '—'}</p><p className="mt-1 text-xs text-slate-500">{product.quantity || 0} × {fmt(product.price)} = {fmt((Number(product.price) || 0) * (Number(product.quantity) || 0))}</p></div>)}</div></td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-600"><p>Items: {fmt(itemTotal)}</p><p className="font-semibold text-slate-900">Total: {fmt(o.pricing?.total || itemTotal)}</p>{o.coupon?.code && <p className="text-emerald-600">Voucher: {o.coupon.code}</p>}</td>
                    <td className="px-4 py-3"><p className="font-semibold text-slate-700">{o.paymentMethod || 'Cash on Delivery'}</p><span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${o.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>{o.paymentMethod === 'Cash on Delivery' ? 'Cash on delivery' : (o.paymentStatus || 'Pending')}</span>{o.paymentDetails && <><p className="mt-1 text-xs text-slate-500">{o.paymentDetails.mobileNumber || '—'}</p><p className="text-xs text-slate-500">TXN: {o.paymentDetails.transactionId || '—'}</p></>}</td>
                    <td className="px-4 py-3"><p className="font-semibold text-slate-700">{o.courier?.status || o.deliveryStatus || 'Awaiting courier'}</p>{o.courier?.providerOrderId && <p className="mt-1 text-xs text-slate-500">Tracking: {o.courier.providerOrderId}</p>}<p className="mt-1 text-[11px] text-slate-500">Order: {o.orderStatus || 'Pending'}</p></td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        <button onClick={() => setOpen(o)} aria-label="View order" className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-slate-200 hover:bg-slate-50 text-slate-700"><Eye className="w-3.5 h-3.5" /></button>
                        {o.paymentStatus !== 'Paid' && o.orderStatus !== 'Cancelled' && <button onClick={() => updateOrder(o._id, { paymentStatus: 'Paid' })} className="h-8 px-2 inline-flex items-center gap-1 rounded-md border border-emerald-200 hover:bg-emerald-50 text-emerald-700 text-xs font-medium"><CheckCircle2 className="h-3.5 w-3.5" /> Verify</button>}
                        {!o.courier?.providerOrderId && o.orderStatus !== 'Cancelled' && <button disabled={!canSendToCourier(o)} onClick={() => sendToCourier(o)} className="h-8 px-2 inline-flex items-center gap-1 rounded-md border border-blue-200 text-xs font-medium text-blue-700 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-40"><Send className="h-3.5 w-3.5" /> Send courier</button>}
                        {o.courier?.providerOrderId && <span className="h-8 inline-flex items-center rounded-md border border-emerald-200 px-2 text-xs font-medium text-emerald-700">Received courier</span>}
                        {o.orderStatus !== 'Cancelled' && <button onClick={() => updateOrder(o._id, { orderStatus: 'Cancelled', deliveryStatus: 'Cancelled' })} aria-label="Cancel order" className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-rose-200 hover:bg-rose-50 text-rose-600" title="Cancel"><XCircle className="w-4 h-4" /></button>}
                        <button onClick={() => setDeleteTarget(o)} aria-label="Delete order" className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-slate-200 hover:bg-slate-50 text-slate-500" title="Delete"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                  );
                })}
                {!orders.length && (
                  <tr><td colSpan={8} className="px-4 py-16 text-center text-slate-400">No orders found.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 text-sm">
              <span>Page {page} / {totalPages}</span>
              <div className="flex items-center gap-2">
                <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="px-3 py-1.5 rounded-md border border-slate-200 hover:bg-slate-50 disabled:opacity-40">Prev</button>
                <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="px-3 py-1.5 rounded-md border border-slate-200 hover:bg-slate-50 disabled:opacity-40">Next</button>
              </div>
            </div>
          )}
        </div>
      )}

      {open && <OrderDetail order={open} onClose={() => setOpen(null)} onSaved={(o) => { setOrders((prev) => prev.map((x) => x._id === o._id ? o : x)); setOpen(o); push('Payment status updated', 'success'); }} />}
      {deleteTarget && <Modal isOpen={true} onClose={() => setDeleteTarget(null)} size="sm" title="Delete order">
        <p className="text-sm text-slate-600">Are you sure you want to permanently delete {deleteTarget.orderId || 'this order'}?</p>
        <div className="mt-5 flex justify-end gap-2"><button type="button" onClick={() => setDeleteTarget(null)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm hover:bg-slate-50">Cancel</button><button type="button" disabled={deleting} onClick={deleteOrder} className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-60">{deleting ? 'Deleting...' : 'Delete'}</button></div>
      </Modal>}
    </div>
  );
}

function OrderDetail({ order, onClose, onSaved }) {
  const save = useAdminFetch({
    fn: (payload) => adminApi.orders.setStatus(order._id, payload),
    onSuccess: (d) => onSaved(d),
  });

  const [paymentStatus, setPaymentStatus] = useState(order.paymentStatus);

  return (
    <Modal isOpen={true} onClose={onClose} size="xl" title={`Order ${order.orderId || String(order._id).slice(-8).toUpperCase()}`}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/50">
            <p className="text-xs uppercase tracking-wider font-semibold text-slate-500 mb-2">Customer</p>
            <p className="font-semibold">{order.customerInfo?.name || '—'}</p>
            <p className="text-sm text-slate-600">{order.customerInfo?.email || ''}</p>
            <p className="text-sm text-slate-600">{order.customerInfo?.phone || ''}</p>
            {order.shippingAddress && (
              <p className="text-sm text-slate-600 mt-2">{order.shippingAddress.address || JSON.stringify(order.shippingAddress)}</p>
            )}
          </div>
          <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/50">
            <p className="text-xs uppercase tracking-wider font-semibold text-slate-500 mb-2">Payment details</p>
            <p className="text-sm text-slate-700">Method: {order.paymentMethod || 'Cash on Delivery'}</p>
            {order.paymentDetails ? <><p className="text-sm text-slate-700">Mobile: {order.paymentDetails.mobileNumber || '—'}</p><p className="text-sm text-slate-700">Transaction ID: {order.paymentDetails.transactionId || '—'}</p></> : <p className="text-sm text-slate-500">No online payment details.</p>}
          </div>
          <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/50">
            <p className="text-xs uppercase tracking-wider font-semibold text-slate-500 mb-2">RedX courier response</p>
            <p className="text-sm text-slate-700">Provider: {order.courier?.provider || 'Not sent'}</p>
            <p className="text-sm text-slate-700">Tracking: {order.courier?.providerOrderId || '—'}</p>
            <p className="text-sm text-slate-700">Status: {order.courier?.status || order.deliveryStatus || '—'}</p>
            {order.courier?.response && <pre className="mt-2 max-h-32 overflow-auto rounded bg-white p-2 text-[10px] text-slate-500">{JSON.stringify(order.courier.response, null, 2)}</pre>}
          </div>
          <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/50">
            <p className="text-xs uppercase tracking-wider font-semibold text-slate-500 mb-2">Pricing</p>
            <div className="text-sm space-y-1 text-slate-700">
              <div className="flex justify-between"><span>Subtotal</span><span className="tabular-nums">{fmt(order.pricing?.subtotal)}</span></div>
              <div className="flex justify-between"><span>Shipping</span><span className="tabular-nums">{fmt(order.pricing?.shipping)}</span></div>
              <div className="flex justify-between"><span>Tax</span><span className="tabular-nums">{fmt(order.pricing?.tax)}</span></div>
              <div className="flex justify-between"><span>Discount</span><span className="tabular-nums">-{fmt(order.pricing?.discount)}</span></div>
              <div className="flex justify-between pt-2 border-t border-slate-200 font-semibold"><span>Total</span><span className="tabular-nums">{fmt(order.pricing?.total)}</span></div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 overflow-hidden">
          <p className="text-xs uppercase tracking-wider font-semibold text-slate-500 px-4 py-3 border-b bg-slate-50">Items ({order.items?.length || 0})</p>
          <div className="divide-y divide-slate-100">
            {(order.items || []).map((it, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                <div className="h-11 w-11 rounded-md bg-slate-100 grid place-items-center overflow-hidden shrink-0">
                  {it.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={it.image} alt="" className="h-full w-full object-cover" />
                  ) : <span className="text-xs text-slate-400">No img</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{it.name}</p>
                  <p className="text-xs text-slate-500">SKU: {it.sku || '—'}</p>
                </div>
                <div className="text-sm text-slate-600 tabular-nums">{it.quantity} × {fmt(it.price)}</div>
                <div className="w-25 text-right text-sm font-semibold tabular-nums">{fmt((it.quantity || 1) * (it.price || 0))}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="space-y-1 text-sm text-slate-600">
            <span className="font-medium">Payment Status</span>
            <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)} className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3">
              {PAYMENT_STATUS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </label>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600"><span className="font-medium text-slate-800">Courier tracking</span><p className="mt-1">{order.courier?.providerOrderId || 'Not sent to courier yet'}</p><p>{order.courier?.status || order.deliveryStatus || 'Awaiting courier'}</p></div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-slate-200 text-sm hover:bg-slate-50">Close</button>
          <button
            disabled={save.loading}
            onClick={() => save.fire({ paymentStatus })}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-60 inline-flex items-center gap-1.5"
          >
            {save.loading ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </Modal>
  );
}