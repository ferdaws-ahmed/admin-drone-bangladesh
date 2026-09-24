'use client';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function Shell({ children }) {
  return (
    <div className="flex min-h-screen bg-slate-100 font-sans text-slate-800">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
      
        <main className="flex-1 p-3 sm:p-5">
         
          <div className="w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}