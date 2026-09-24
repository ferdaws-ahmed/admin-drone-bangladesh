'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Logo from '@/components/common/Logo';
import {
  LayoutDashboard,
  Package,
  FileText,
  Wrench,
  Images,
  Phone,
  UserCircle,
  ShoppingCart,
  Users,
  ShieldCheck,
  TicketPercent,
  Mail,
  LayoutTemplate,
} from 'lucide-react';
import adminApi from '@/lib/adminApi';
import { ORDER_SEEN_KEY, MESSAGE_SEEN_KEY, getSeenAt, markSeen } from '@/lib/notificationState';

const routes = [
  { name: 'Dashboard',    path: '/dashboard',              icon: LayoutDashboard },
  { name: 'Home Page',    path: '/homepage',               icon: LayoutTemplate },
  { name: 'Products',     path: '/products',               icon: Package, exact: true },
  { name: 'Add Drones',   path: '/products/add-drones',    icon: ShieldCheck },
  { name: 'Add Handhelds',path: '/products/add-handhelds', icon: Package },
  { name: 'Orders',       path: '/orders',                 icon: ShoppingCart },
  { name: 'Customers',    path: '/customers',              icon: Users },
  { name: 'Coupon Code',  path: '/coupons',                icon: TicketPercent },
  { name: 'Articles & CMS', path: '/articles',            icon: FileText },
  { name: 'Maintenance',  path: '/maintenance',            icon: Wrench },
  { name: 'Banners',      path: '/banners',                icon: Images },
  { name: 'Messages',     path: '/contact',                icon: Mail },
  { name: 'Profile',      path: '/profile',                icon: UserCircle },
];

export default function Sidebar() {
  const pathname = usePathname() || '';
  const [pendingOrders, setPendingOrders] = useState(0);
  const [pendingMessages, setPendingMessages] = useState(0);

  useEffect(() => {
    if (pathname === '/orders') markSeen(ORDER_SEEN_KEY);
    if (pathname === '/contact') markSeen(MESSAGE_SEEN_KEY);

    const loadPendingOrders = async () => {
      try {
        const seenAt = getSeenAt(ORDER_SEEN_KEY);
        const response = await adminApi.orders.list({ limit: 1, createdAfter: new Date(seenAt).toISOString() });
        if (response?.success) {
          setPendingOrders(response.data?.pagination?.total || 0);
        }
      } catch (error) {
        console.error('Failed to load pending order count', error);
      }
    };

    const loadPendingMessages = async () => {
      try {
        const response = await adminApi.contact.stats();
        if (response?.success) {
          setPendingMessages(response.data?.byStatus?.New || 0);
        }
      } catch (error) {
        console.error('Failed to load pending message count', error);
      }
    };

    loadPendingOrders();
    loadPendingMessages();

    const timer = window.setInterval(() => {
      loadPendingOrders();
      loadPendingMessages();
    }, 30000);

    const syncSeenState = (event) => {
      if (event.detail?.key === ORDER_SEEN_KEY) {
        setPendingOrders(0);
      }
      if (event.detail?.key === MESSAGE_SEEN_KEY) {
        setPendingMessages(0);
      }
    };

    window.addEventListener('admin-seen-state-updated', syncSeenState);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('admin-seen-state-updated', syncSeenState);
    };
  }, [pathname]);

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0 hidden md:flex shrink-0">
      <div className="h-16 flex items-center px-6 border-b border-slate-100">
        <Logo />
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {routes.map((r) => {
          const isActive = r.exact
            ? pathname === r.path
            : pathname === r.path || pathname.startsWith(`${r.path}/`);

          const IconComponent = r.icon;
          return (
            <Link
              key={r.path}
              href={r.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <IconComponent className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
              <span className="flex-1">{r.name}</span>
              {r.name === 'Orders' && pendingOrders > 0 && (
                <span className="min-w-5 rounded-full bg-rose-100 px-1.5 py-0.5 text-center text-[10px] font-bold text-rose-700">
                  {pendingOrders > 99 ? '99+' : pendingOrders}
                </span>
              )}
              {r.name === 'Messages' && pendingMessages > 0 && (
                <span className="min-w-5 rounded-full bg-rose-100 px-1.5 py-0.5 text-center text-[10px] font-bold text-rose-700">
                  {pendingMessages > 99 ? '99+' : pendingMessages}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}