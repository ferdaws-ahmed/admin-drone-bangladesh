// src/app/add-drones/page.jsx

import AddDronesMain from '@/components/addDrones';

export const metadata = {
  title: 'Add New Drone | Admin Dashboard',
  description: 'Enterprise Drone Inventory & Specification Management',
};

export default function AddDronePage() {
  return (
    <main className="min-h-screen bg-slate-50 py-6">
      <AddDronesMain />
    </main>
  );
}