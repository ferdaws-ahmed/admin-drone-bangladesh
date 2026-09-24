'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Mail, AlertCircle, Loader2, Store } from 'lucide-react';
import adminApi from '@/lib/adminApi';

const setAdminCookie = (token, days = 7) => {
  const max = days * 24 * 60 * 60;
  document.cookie = `admin_token=${token}; Path=/; Max-Age=${max}; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}`;
};

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr('');

    if (!email || !password) {
      setErr('Email and password are required.');
      return;
    }

    setLoading(true);

    try {
      const res = await adminApi.auth.login(email, password);

      if (!res.success) {
        setErr(res.message || 'Login failed.');
        return;
      }

      const token = res.token || res.data?.token;
      const user = res.user || res.data?.user;

      if (!token || !user) {
        setErr('Invalid response structure received from server.');
        return;
      }

      if (user.role !== 'admin') {
        setErr('Access denied. Admin account required.');
        adminApi.auth.clearAuth();
        return;
      }

      adminApi.auth.setAuth({ token, user });
      setAdminCookie(token);

      const target = next.startsWith('/') ? next : '/dashboard';
      router.replace(target);
    } catch (catchErr) {
      setErr('An unexpected connection error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 shadow-lg mb-4">
            <Store className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Drone Bangladesh</h1>
          <p className="text-sm text-slate-400 mt-1">Admin Console Sign In</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-2xl p-7 space-y-5">
          {err && (
            <div className="flex gap-2 rounded-lg bg-rose-50 text-rose-700 border border-rose-100 p-3 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{err}</span>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Email</label>
            <div className="mt-1 relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-11 pl-10 pr-3 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 text-slate-900 placeholder:text-slate-400"
                placeholder="admin@dronebangladesh.com"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Password</label>
            <div className="mt-1 relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-11 pl-10 pr-3 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 text-slate-900 placeholder:text-slate-400"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 transition shadow-sm cursor-pointer"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? 'Signing in…' : 'Sign in to Admin'}
          </button>

          <p className="text-[11px] text-slate-400 text-center pt-1">
            Only authorized admin accounts may access this panel.
          </p>
        </form>
      </div>
    </div>
  );
}

export default function AdminLogin() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">Loading Admin Console...</div>}>
      <AdminLoginForm />
    </Suspense>
  );
}