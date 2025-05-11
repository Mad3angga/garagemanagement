'use client';

import { AdminHeader } from '@/components/AdminHeader';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Booking {
  id: string;
  garage_id: string;
  status: 'pending' | 'approved' | 'rejected' | 'removed';
}

interface Garage {
  id: string;
  title: string;
}

export default function GarageAnalytics() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [garages, setGarages] = useState<Garage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'day' | 'month' | 'year'>('month');
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    return {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate(),
    };
  });
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated' && !session?.user?.isAdmin) {
      router.push('/dashboard');
    }
  }, [status, session, router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch bookings
        const bookingsResponse = await fetch('/api/bookings');
        if (!bookingsResponse.ok) {
          throw new Error('Failed to fetch bookings');
        }
        const bookingsData = await bookingsResponse.json();
        setBookings(bookingsData);

        // Fetch garages
        const garagesResponse = await fetch('/api/garages');
        if (!garagesResponse.ok) {
          throw new Error('Failed to fetch garages');
        }
        const garagesData = await garagesResponse.json();
        setGarages(garagesData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user?.isAdmin) {
      fetchData();
    }
  }, [session]);

  // Filter bookings by selected filter
  const filteredBookings = bookings.filter(booking => {
    const startDate = (booking as any).start_date;
    if (filter === 'year') {
      return new Date(startDate).getFullYear() === selectedDate.year;
    } else if (filter === 'month') {
      const d = new Date(startDate);
      return d.getFullYear() === selectedDate.year && (d.getMonth() + 1) === selectedDate.month;
    } else if (filter === 'day') {
      const d = new Date(startDate);
      return d.getFullYear() === selectedDate.year && (d.getMonth() + 1) === selectedDate.month && d.getDate() === selectedDate.day;
    }
    return true;
  });

  // Calculate rental counts per garage for filtered bookings
  const rentalCounts = garages.map(garage => {
    const count = filteredBookings.filter(booking => booking.garage_id === garage.id && booking.status === 'approved').length;
    return { name: garage.title, count };
  });

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session?.user?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
          <p className="mt-2 text-gray-600">You don't have permission to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-10 transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar overlay"
        />
      )}
      {/* Sidebar */}
      <aside className={`w-64 h-screen bg-gradient-to-b from-blue-50 to-white border-r flex flex-col fixed top-0 left-0 z-20 shadow-md transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        aria-label="Sidebar"
      >
        <div className="p-6 border-b flex items-center gap-3 relative">
          <span className="inline-block bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-2xl">A</span>
          <span className="text-2xl font-bold text-blue-700 tracking-tight">Andaja Admin</span>
          {/* Close button */}
          <button
            className="absolute right-2 top-2 p-1 rounded-full hover:bg-blue-100 focus:outline-none"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <svg className="w-5 h-5 text-blue-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="flex-1 p-6 space-y-2">
          <div className="text-xs font-semibold text-gray-400 uppercase mb-2">Main</div>
          <a href="/admin/dashboard" className={`block rounded-lg px-4 py-2 text-lg font-medium transition-colors ${typeof window !== 'undefined' && window.location.pathname === '/admin/dashboard' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'}`}>Dashboard</a>
          <a href="/admin/garage-management" className={`block rounded-lg px-4 py-2 text-lg font-medium transition-colors ${typeof window !== 'undefined' && window.location.pathname === '/admin/garage-management' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'}`}>Garage Management</a>
          <a href="/admin/garage-analytics" className={`block rounded-lg px-4 py-2 text-lg font-medium transition-colors ${typeof window !== 'undefined' && window.location.pathname === '/admin/garage-analytics' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'}`}>Garage Analytics</a>
          <a href="/admin/revenue-analytics" className={`block rounded-lg px-4 py-2 text-lg font-medium transition-colors ${typeof window !== 'undefined' && window.location.pathname === '/admin/revenue-analytics' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'}`}>Revenue Analytics</a>
        </nav>
        <div className="p-6 border-t text-xs text-gray-400">&copy; {new Date().getFullYear()} Andaja. All rights reserved.</div>
      </aside>
      {/* Sidebar Toggle Button */}
      {!sidebarOpen && (
        <button
          className="fixed top-4 left-4 z-30 bg-white border border-gray-200 rounded-full shadow-lg p-2 focus:outline-none hover:bg-blue-50 transition-colors group"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open sidebar"
        >
          <span className="sr-only">Open sidebar</span>
          <svg className="w-7 h-7 text-blue-700 group-hover:text-blue-900 transition-colors" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <rect x="4" y="6" width="16" height="2" rx="1" fill="currentColor" />
            <rect x="4" y="11" width="16" height="2" rx="1" fill="currentColor" />
            <rect x="4" y="16" width="16" height="2" rx="1" fill="currentColor" />
          </svg>
        </button>
      )}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <AdminHeader />
        <main className="min-h-[calc(100vh-80px)] bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Garage Analytics</h1>
                <p className="mt-2 text-gray-600">Rental counts per garage</p>
              </div>
              <div className="flex gap-2 items-center">
                <select value={filter} onChange={e => setFilter(e.target.value as any)} className="border rounded px-2 py-1">
                  <option value="day">Day</option>
                  <option value="month">Month</option>
                  <option value="year">Year</option>
                </select>
                {filter === 'year' && (
                  <input type="number" min="2000" max="2100" value={selectedDate.year} onChange={e => setSelectedDate(d => ({ ...d, year: Number(e.target.value) }))} className="border rounded px-2 py-1 w-20" />
                )}
                {filter === 'month' && (
                  <>
                    <input type="number" min="2000" max="2100" value={selectedDate.year} onChange={e => setSelectedDate(d => ({ ...d, year: Number(e.target.value) }))} className="border rounded px-2 py-1 w-20" />
                    <input type="number" min="1" max="12" value={selectedDate.month} onChange={e => setSelectedDate(d => ({ ...d, month: Number(e.target.value) }))} className="border rounded px-2 py-1 w-14" />
                  </>
                )}
                {filter === 'day' && (
                  <>
                    <input type="number" min="2000" max="2100" value={selectedDate.year} onChange={e => setSelectedDate(d => ({ ...d, year: Number(e.target.value) }))} className="border rounded px-2 py-1 w-20" />
                    <input type="number" min="1" max="12" value={selectedDate.month} onChange={e => setSelectedDate(d => ({ ...d, month: Number(e.target.value) }))} className="border rounded px-2 py-1 w-14" />
                    <input type="number" min="1" max="31" value={selectedDate.day} onChange={e => setSelectedDate(d => ({ ...d, day: Number(e.target.value) }))} className="border rounded px-2 py-1 w-14" />
                  </>
                )}
              </div>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Rental Counts by Garage</h2>
              <p className="text-gray-500 mb-4 text-sm">
                This chart shows how many times each garage has been rented (approved bookings only).
              </p>
              {rentalCounts.length === 0 ? (
                <div className="text-center text-gray-400 py-12">No rental data available.</div>
              ) : (
                <div className="w-full" style={{ minHeight: 320 }}>
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={rentalCounts}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 