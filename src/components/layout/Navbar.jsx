'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, ChevronDown, LogOut, Mail, Search, User } from 'lucide-react';
import { useToast } from '@/components/common/ToastProvider';
import adminApi from '@/lib/adminApi';
import {
  MESSAGE_SEEN_KEY,
  NOTIFICATION_SEEN_KEY,
  getSeenAt,
  markSeen,
} from '@/lib/notificationState';

export default function Navbar() {
  const router = useRouter();
  const { push } = useToast();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [messagesOpen, setMessagesOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [notificationSeenAt, setNotificationSeenAt] = useState(0);
  const [messages, setMessages] = useState([]);
  const [messageSeenAt, setMessageSeenAt] = useState(0);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const readUser = () => {
      try {
        const stored = localStorage.getItem('admin_user');
        setUser(stored ? JSON.parse(stored) : null);
      } catch (error) {
        console.error('Failed to read admin user', error);
      }
    };

    readUser();
    setNotificationSeenAt(getSeenAt(NOTIFICATION_SEEN_KEY));
    setMessageSeenAt(getSeenAt(MESSAGE_SEEN_KEY));

    const loadNotifications = async () => {
      try {
        const seenAt = getSeenAt(NOTIFICATION_SEEN_KEY);
        const response = await adminApi.orders.list({ limit: 8, createdAfter: new Date(seenAt).toISOString() });
        if (response?.success) {
          setNotificationSeenAt(seenAt);
          setNotifications(response.data?.items || []);
        }
      } catch (error) {
        console.error('Failed to load order notifications', error);
      }
    };

    const loadMessages = async () => {
      try {
        const seenAt = getSeenAt(MESSAGE_SEEN_KEY);
        const response = await adminApi.contact.list({ status: 'New', limit: 6 });
        if (response?.success) {
          setMessageSeenAt(seenAt);
          setMessages(response.data?.submissions || []);
        }
      } catch (error) {
        console.error('Failed to load message notifications', error);
      }
    };

    loadNotifications();
    loadMessages();

    const notificationTimer = window.setInterval(loadNotifications, 30000);
    const messageTimer = window.setInterval(loadMessages, 30000);
    const syncUser = () => readUser();
    const syncSeenState = (event) => {
      if (event.detail?.key === NOTIFICATION_SEEN_KEY) {
        setNotificationSeenAt(event.detail.timestamp);
        setNotifications([]);
      }

      if (event.detail?.key === MESSAGE_SEEN_KEY) {
        setMessageSeenAt(event.detail.timestamp);
        setMessages([]);
      }
    };

    window.addEventListener('admin-user-updated', syncUser);
    window.addEventListener('admin-seen-state-updated', syncSeenState);

    const handleClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClick);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      window.removeEventListener('admin-user-updated', syncUser);
      window.removeEventListener('admin-seen-state-updated', syncSeenState);
      window.clearInterval(notificationTimer);
      window.clearInterval(messageTimer);
    };
  }, []);

  const checkNotifications = () => {
    const timestamp = Date.now();
    markSeen(NOTIFICATION_SEEN_KEY, timestamp);
    setNotificationSeenAt(timestamp);
    setNotificationsOpen((value) => !value);
  };

  const toggleMessages = () => {
    const timestamp = Date.now();
    markSeen(MESSAGE_SEEN_KEY, timestamp);
    setMessageSeenAt(timestamp);
    setMessagesOpen((value) => !value);
  };

  const handleSearch = (event) => {
    if (event.key === 'Enter') {
      const trimmed = query.trim();
      if (trimmed) {
        push(`Searching for “${trimmed}” in the admin dashboard`, 'info', 1800);
      } else {
        push('Search input cleared', 'warning', 1500);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_user');
    localStorage.removeItem('admin_token');
    document.cookie = 'admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    push('You have been signed out', 'success');
    router.replace('/login');
  };

  return (
    <header className="sticky top-0 z-40 h-16 border-b border-slate-200 bg-white shadow-sm">
      <div className="flex h-full items-center justify-between gap-4 px-6">
        <div className="max-w-xl flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={handleSearch}
              placeholder="Search orders, products, or customers..."
              className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              type="button"
              aria-label="Messages"
              onClick={toggleMessages}
              className="relative rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
            >
              <Mail className="h-5 w-5" />
              {messages.some((item) => new Date(item.createdAt).getTime() > messageSeenAt) && (
                <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white ring-2 ring-white">
                  {messages.filter((item) => new Date(item.createdAt).getTime() > messageSeenAt).length > 9
                    ? '9+'
                    : messages.filter((item) => new Date(item.createdAt).getTime() > messageSeenAt).length}
                </span>
              )}
            </button>

            {messagesOpen && (
              <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
                <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Messages</p>
                {messages.map((item) => (
                  <Link
                    key={item._id}
                    href="/contact"
                    onClick={() => setMessagesOpen(false)}
                    className="block rounded-lg px-2 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <p className="font-medium text-slate-800">{item.name}</p>
                    <p className="text-xs text-slate-500">{item.subject || 'General Inquiry'}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-slate-600">{item.message}</p>
                  </Link>
                ))}
                {!messages.length && <p className="px-2 py-3 text-sm text-slate-500">No new customer messages.</p>}
              </div>
            )}
          </div>

          <div className="relative">
            <button
              type="button"
              aria-label="Notifications"
              onClick={checkNotifications}
              className="relative rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
            >
              <Bell className="h-5 w-5" />
              {notifications.some((item) => new Date(item.createdAt).getTime() > notificationSeenAt) && (
                <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white" />
              )}
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
                <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Notifications</p>
                {notifications.map((item) => (
                  <Link key={item._id} href="/orders" onClick={() => setNotificationsOpen(false)} className="block rounded-lg px-2 py-2 text-sm text-slate-700 hover:bg-slate-50">
                    <p className="font-medium">New order {item.orderId}</p>
                    <p className="text-xs text-slate-500">{item.customerInfo?.name || 'Customer'} · Payment pending</p>
                  </Link>
                ))}
                {!notifications.length && <p className="px-2 py-3 text-sm text-slate-500">No pending payment notifications.</p>}
              </div>
            )}
          </div>

          <div className="mx-2 h-6 w-px bg-slate-200" />

          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setProfileOpen((value) => !value)}
              className="flex items-center gap-2 rounded-full p-1 pr-2 transition hover:bg-slate-50"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-bold uppercase text-blue-700">
                {user?.name?.charAt(0) || 'A'}
              </div>
              <div className="hidden text-left md:block">
                <p className="text-sm font-semibold text-slate-700">{user?.name || 'Admin'}</p>
                <p className="text-[11px] capitalize text-slate-500">{user?.role || 'Super Admin'}</p>
              </div>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 z-50 mt-2 w-48 rounded-xl border border-slate-100 bg-white py-1 shadow-xl">
                <Link
                  href="/profile"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50"
                >
                  <User className="h-4 w-4" />
                  My Profile
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-rose-600 transition hover:bg-rose-50"
                >
                  <LogOut className="h-4 w-4" />
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}