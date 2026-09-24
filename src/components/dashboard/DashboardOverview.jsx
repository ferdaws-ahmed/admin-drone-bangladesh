'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  ArrowUpRight,
  Package,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Users,
  Wrench,
  RefreshCw,
  PlusCircle,
  BarChart3,
  Layers,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Activity,
} from 'lucide-react';
import adminApi from '@/lib/adminApi';

function SkeletonCard() {
  return (
    <div className="h-28 w-full animate-pulse rounded-xl border border-slate-100 bg-slate-100/80 p-4" />
  );
}

export default function DashboardOverview() {
  const [loading, setLoading] = useState(true);
  
  // 🟢 Dynamic States
  const [stats, setStats] = useState({
    revenue: '৳0',
    revenueGrowth: '+0%',
    orders: '0',
    ordersGrowth: '+0%',
    customers: '0',
    customersGrowth: '+0%',
    maintenance: '0',
  });

  const [summary, setSummary] = useState({
    productCount: 0,
    orderCount: 0,
    maintenanceCount: 0,
    bannerCount: 0,
  });

  const [topProducts, setTopProducts] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [salesTrend, setSalesTrend] = useState([]); // Array of 7 days sales data e.g. [30, 50, 80, ...]

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // 🟢 Parallel Dynamic API Calls
      const [
        statsResult,
        settingsResult,
        topProductsResult,
        activitiesResult
      ] = await Promise.allSettled([
        adminApi.dashboard.stats(),
        adminApi.settings.summary(),
        adminApi.dashboard.topProducts ? adminApi.dashboard.topProducts() : Promise.resolve(null),
        adminApi.dashboard.recentActivities ? adminApi.dashboard.recentActivities() : Promise.resolve(null),
      ]);

      // 1. Core Stats Data
      if (statsResult.status === 'fulfilled' && statsResult.value?.success && statsResult.value?.data) {
        const data = statsResult.value.data;
        setStats({
          revenue: data.totalRevenue ? `৳${Number(data.totalRevenue).toLocaleString()}` : '৳0',
          revenueGrowth: data.revenueGrowth ? `${data.revenueGrowth > 0 ? '+' : ''}${data.revenueGrowth}%` : '+0%',
          orders: data.totalOrders ? String(data.totalOrders) : '0',
          ordersGrowth: data.ordersGrowth ? `${data.ordersGrowth > 0 ? '+' : ''}${data.ordersGrowth}%` : '+0%',
          customers: data.totalCustomers ? String(data.totalCustomers) : '0',
          customersGrowth: data.customersGrowth ? `${data.customersGrowth > 0 ? '+' : ''}${data.customersGrowth}%` : '+0%',
          maintenance: data.maintenancePending ? String(data.maintenancePending) : '0',
        });

        if (Array.isArray(data.salesTrend)) {
          setSalesTrend(data.salesTrend);
        }
      }

      // 2. Summary Counts — GET /api/v1/admin/settings/summary
      if (settingsResult.status === 'fulfilled' && settingsResult.value?.success && settingsResult.value?.data) {
        setSummary(settingsResult.value.data);
      }

      // 3. Dynamic Top Products
      if (topProductsResult.status === 'fulfilled' && topProductsResult.value?.success && Array.isArray(topProductsResult.value?.data)) {
        setTopProducts(topProductsResult.value.data);
      }

      // 4. Dynamic Recent Activities
      if (activitiesResult.status === 'fulfilled' && activitiesResult.value?.success && Array.isArray(activitiesResult.value?.data)) {
        setRecentActivities(activitiesResult.value.data);
      }

    } catch (error) {
      console.error('Failed to load dynamic dashboard data', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Chart high value calculator for dynamic scale
  const maxSales = salesTrend.length > 0 ? Math.max(...salesTrend, 1) : 1;

  return (
    <div className="w-full space-y-4 p-2 sm:p-4 animate-in fade-in duration-300">
      
      {/* 🟢 Header Section */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">Enterprise Dashboard</h1>
          <p className="mt-0.5 text-xs text-slate-500">Real-time store metrics, live sales analytics & system activities.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            disabled={loading}
            type="button"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Sync
          </span>
        </div>
      </div>

      {/* 🟢 Dynamic Key Metrics Grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Revenue</span>
                <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
                  <DollarSign className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900">{stats.revenue}</h3>
                <span className="flex items-center text-xs font-semibold text-emerald-600">
                  <TrendingUp className="mr-0.5 h-3.5 w-3.5" /> {stats.revenueGrowth}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-slate-400">vs last month</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Orders</span>
                <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                  <ShoppingBag className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900">{stats.orders}</h3>
                <span className="flex items-center text-xs font-semibold text-blue-600">
                  <TrendingUp className="mr-0.5 h-3.5 w-3.5" /> {stats.ordersGrowth}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-slate-400">Total processed orders</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Customers</span>
                <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
                  <Users className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900">{stats.customers}</h3>
                <span className="flex items-center text-xs font-semibold text-indigo-600">
                  <TrendingUp className="mr-0.5 h-3.5 w-3.5" /> {stats.customersGrowth}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-slate-400">Active registered users</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Pending Repairs</span>
                <div className="rounded-lg bg-amber-50 p-2 text-amber-600">
                  <Wrench className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900">{stats.maintenance}</h3>
                <span className="flex items-center text-xs font-semibold text-amber-600">
                  <AlertCircle className="mr-0.5 h-3.5 w-3.5" /> Action Req.
                </span>
              </div>
              <p className="mt-1 text-[11px] text-slate-400">Drone service queue</p>
            </div>
          </>
        )}
      </div>

      {/* 🟢 Quick Shortcuts */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-4">
          <Link href="/products/new" className="flex items-center justify-center sm:justify-start gap-2 rounded-lg border border-slate-100 bg-slate-50 p-2.5 text-xs font-medium text-slate-700 transition hover:bg-blue-50 hover:text-blue-600">
            <PlusCircle className="h-4 w-4 text-blue-600 shrink-0" /> <span className="truncate">Add Product</span>
          </Link>
          <Link href="/orders" className="flex items-center justify-center sm:justify-start gap-2 rounded-lg border border-slate-100 bg-slate-50 p-2.5 text-xs font-medium text-slate-700 transition hover:bg-blue-50 hover:text-blue-600">
            <ShoppingBag className="h-4 w-4 text-emerald-600 shrink-0" /> <span className="truncate">View Orders</span>
          </Link>
          <Link href="/maintenance" className="flex items-center justify-center sm:justify-start gap-2 rounded-lg border border-slate-100 bg-slate-50 p-2.5 text-xs font-medium text-slate-700 transition hover:bg-blue-50 hover:text-blue-600">
            <Wrench className="h-4 w-4 text-amber-600 shrink-0" /> <span className="truncate">Repair Desk</span>
          </Link>
          <Link href="/banners" className="flex items-center justify-center sm:justify-start gap-2 rounded-lg border border-slate-100 bg-slate-50 p-2.5 text-xs font-medium text-slate-700 transition hover:bg-blue-50 hover:text-blue-600">
            <Layers className="h-4 w-4 text-indigo-600 shrink-0" /> <span className="truncate">Manage Banners</span>
          </Link>
        </div>
      </div>

      {/* 🟢 Main Dashboard Content Grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        
        {/* Left 2 Columns */}
        <div className="space-y-4 lg:col-span-2">
          
          {/* Operations Summary */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
            <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-800">Store Catalog & Operations Summary</h2>
                <p className="text-xs text-slate-500">Live breakdown of active inventory and store assets</p>
              </div>
              <span className="self-start sm:self-auto flex items-center gap-1 rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600">
                <BarChart3 className="h-3.5 w-3.5" /> Performance Peak
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5 sm:gap-3 sm:grid-cols-4">
              <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3">
                <p className="text-[11px] font-medium uppercase text-slate-500">Total Products</p>
                <p className="mt-1 text-xl font-bold text-slate-900">{summary.productCount ?? 0}</p>
                <span className="mt-0.5 inline-block text-[10px] text-emerald-600 font-medium">In Catalog</span>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3">
                <p className="text-[11px] font-medium uppercase text-slate-500">Total Orders</p>
                <p className="mt-1 text-xl font-bold text-slate-900">{summary.orderCount ?? 0}</p>
                <span className="mt-0.5 inline-block text-[10px] text-blue-600 font-medium">Recorded</span>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3">
                <p className="text-[11px] font-medium uppercase text-slate-500">Banners Active</p>
                <p className="mt-1 text-xl font-bold text-slate-900">{summary.bannerCount ?? 0}</p>
                <span className="mt-0.5 inline-block text-[10px] text-indigo-600 font-medium">Storefront</span>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3">
                <p className="text-[11px] font-medium uppercase text-slate-500">Repairs Pending</p>
                <p className="mt-1 text-xl font-bold text-slate-900">{summary.maintenanceCount ?? 0}</p>
                <span className="mt-0.5 inline-block text-[10px] text-amber-600 font-medium">Service Desk</span>
              </div>
            </div>

            {/* 🟢 Dynamic Dynamic Sales Trend Chart */}
            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between text-xs font-semibold text-slate-600">
                <span>Revenue Performance Trend</span>
                <span>Last 7 Days</span>
              </div>
              {salesTrend.length > 0 ? (
                <div className="flex h-36 items-end gap-1.5 rounded-xl border border-slate-100 bg-slate-50/50 p-3">
                  {salesTrend.map((amount, idx) => {
                    const heightPercent = Math.max(Math.round((amount / maxSales) * 100), 8);
                    const isLast = idx === salesTrend.length - 1;
                    return (
                      <div
                        key={idx}
                        className={`w-full rounded-t transition-all cursor-pointer ${
                          isLast ? 'bg-blue-600' : 'bg-blue-200 hover:bg-blue-500'
                        }`}
                        style={{ height: `${heightPercent}%` }}
                        title={`Day ${idx + 1}: ৳${amount}`}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="flex h-28 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 text-xs text-slate-400">
                  No sales trend data available
                </div>
              )}
            </div>
          </div>

          {/* 🟢 Dynamic Top Selling Products */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-800">Top Selling Products</h2>
                <p className="text-[11px] text-slate-500">Most popular items in your inventory</p>
              </div>
              <Link href="/products" className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-0.5">
                View All <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
            
            <div className="divide-y divide-slate-100">
              {topProducts.length > 0 ? (
                topProducts.map((item, index) => (
                  <div key={item.id || index} className="py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                        0{index + 1}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-800">{item.name || item.title}</p>
                        <p className="text-[10px] text-slate-400">{item.categoryName || 'General'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-slate-800">{item.salesCount ?? 0} Sales</p>
                      <p className={`text-[10px] font-medium ${item.stock > 5 ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {item.stock > 5 ? 'In Stock' : `Low Stock (${item.stock ?? 0})`}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-xs text-slate-400">
                  No sales data found for top products.
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right 1 Column */}
        <div className="space-y-4">
          
          {/* Operational Alerts */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
            <h2 className="text-base font-bold text-slate-800">Operational Alerts</h2>
            <p className="mb-3 text-xs text-slate-500">High priority tasks needing attention</p>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-2 rounded-lg border border-amber-200 bg-amber-50/70 p-3">
                <div className="flex items-center gap-2.5">
                  <Wrench className="h-5 w-5 shrink-0 text-amber-600" />
                  <div>
                    <p className="text-xs font-semibold text-slate-800">Drone Maintenance</p>
                    <p className="text-[11px] text-slate-500">{stats?.maintenance || 0} repairs waiting</p>
                  </div>
                </div>
                <Link href="/maintenance" className="shrink-0 rounded bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-200">
                  Manage
                </Link>
              </div>

              <div className="flex items-center justify-between gap-2 rounded-lg border border-blue-200 bg-blue-50/70 p-3">
                <div className="flex items-center gap-2.5">
                  <Package className="h-5 w-5 shrink-0 text-blue-600" />
                  <div>
                    <p className="text-xs font-semibold text-slate-800">Orders Queue</p>
                    <p className="text-[11px] text-slate-500">{summary.orderCount ?? 0} total active orders</p>
                  </div>
                </div>
                <Link href="/orders" className="shrink-0 rounded bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-200">
                  Process
                </Link>
              </div>
            </div>

            <div className="mt-4 border-t border-slate-100 pt-3">
              <Link href="/orders" className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700">
                Go to Order Management <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* 🟢 Dynamic Recent Activity Timeline */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Recent Activity</h3>
            {recentActivities.length > 0 ? (
              <div className="relative pl-4 border-l border-slate-200 space-y-3.5">
                {recentActivities.map((act, index) => (
                  <div key={act.id || index} className="relative">
                    <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-blue-500 ring-4 ring-white" />
                    <p className="text-xs font-medium text-slate-800">{act.message || act.title}</p>
                    <span className="text-[10px] text-slate-400">{act.timeAgo || act.createdAt}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-4 text-center text-xs text-slate-400">
                No recent activity logged.
              </div>
            )}
          </div>

          {/* System Status */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">System Status</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Database Status</span>
                <span className="font-semibold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Connected
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">API Health</span>
                <span className="font-semibold text-emerald-600 flex items-center gap-1">
                  <Activity className="h-3.5 w-3.5" /> Operational
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">SSL Security</span>
                <span className="font-semibold text-emerald-600 flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" /> Active
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Store Front</span>
                <span className="font-semibold text-emerald-600">Online</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}