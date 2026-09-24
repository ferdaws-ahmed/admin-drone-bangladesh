'use client';
import { DollarSign, ShoppingBag, Users, AlertTriangle } from 'lucide-react';

export default function StatCards({ stats }) {
  const cards = [
    { title: 'Total Revenue', value: `৳${stats?.revenue || '0.00'}`, icon: DollarSign, color: 'bg-emerald-50 text-emerald-600' },
    { title: 'Total Orders', value: stats?.orders || '0', icon: ShoppingBag, color: 'bg-blue-50 text-blue-600' },
    { title: 'Active Customers', value: stats?.customers || '0', icon: Users, color: 'bg-indigo-50 text-indigo-600' },
    { title: 'Pending Maintenance', value: stats?.maintenance || '0', icon: AlertTriangle, color: 'bg-amber-50 text-amber-600' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((c, i) => {
        const IconComponent = c.icon;
        return (
          <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">{c.title}</p>
              <h3 className="text-2xl font-bold text-slate-800">{c.value}</h3>
            </div>
            <div className={`p-3 rounded-lg ${c.color}`}>
              {IconComponent && <IconComponent className="w-5 h-5" />}
            </div>
          </div>
        );
      })}
    </div>
  );
}