'use client';

import { AdminHeader } from '@/components/AdminHeader';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import dayjs from 'dayjs';

interface Booking {
  id: string;
  slotNumber?: number;
  startDate?: string;
  endDate?: string;
  start_date?: string;
  end_date?: string;
  status: 'pending' | 'approved' | 'rejected' | 'removed';
  totalPrice: number;
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  garage: {
    title: string;
    location: string;
  };
  removedReason?: string;
  garage_id: string;
}

interface Garage {
  id: string;
  title: string;
  location: string;
  pricePerMonth: number;
  slot: number;
  description: string;
  images: string[];
  isAvailable: boolean;
}

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

function Sidebar({ sidebarOpen, setSidebarOpen }: { sidebarOpen: boolean; setSidebarOpen: (open: boolean) => void }) {
  return (
    <>
      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-10 transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar overlay"
        />
      )}
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
    </>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [garages, setGarages] = useState<Garage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const [isUpdatingAvailability, setIsUpdatingAvailability] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [newOrder, setNewOrder] = useState({
    userName: '',
    userEmail: '',
    garageId: '',
    startMonth: '', // format YYYY-MM
    months: 1,
    status: 'approved' as const
  });

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
        const mappedGarages = garagesData.map((garage: any) => ({
          ...garage,
          pricePerMonth: garage.price_per_month ?? (garage.price_per_day ? garage.price_per_day * 30 : null),
        }));
        setGarages(mappedGarages);

        // Fetch users
        const usersResponse = await fetch('/api/users');
        if (!usersResponse.ok) {
          throw new Error('Failed to fetch users');
        }
        const usersData = await usersResponse.json();
        setUsers(usersData);

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

  const handleStatusChange = async (bookingId: string, newStatus: 'approved' | 'rejected') => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update booking status');
      }

      const updatedBooking = await response.json();
      setBookings(prev => 
        prev.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status: updatedBooking.status }
            : booking
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleDeleteBooking = async (bookingId: string) => {
    // Prompt for reason
    const reason = prompt('Please provide a reason for removing this booking:');
    
    // If user cancels the prompt or doesn't provide a reason
    if (!reason) {
      alert('A reason is required to remove a booking.');
      return;
    }
    
    if (!confirm('Are you sure you want to remove this booking? The user will see it as removed in their history.')) {
      return;
    }
    
    setIsRemoving(true);
    
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'removed',
          removedReason: reason
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to remove booking');
      }

      // Update booking status in state
      setBookings(prev => 
        prev.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status: 'removed', removedReason: reason }
            : booking
        )
      );
      
      // Show success message
      alert('Booking has been removed successfully.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while removing the booking');
    } finally {
      setIsRemoving(false);
    }
  };

  const handleAvailabilityToggle = async (garageId: string, newAvailability: boolean) => {
    setIsUpdatingAvailability(true);
    
    try {
      const response = await fetch(`/api/garages/${garageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isAvailable: newAvailability }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update garage availability');
      }

      const updatedGarage = await response.json();
      
      // Update the garage in state
      setGarages(prev => 
        prev.map(garage => 
          garage.id === garageId 
            ? { ...garage, isAvailable: updatedGarage.isAvailable }
            : garage
        )
      );
      
      // Show success message
      alert(`Garage ${newAvailability ? 'enabled' : 'disabled'} successfully.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while updating availability');
    } finally {
      setIsUpdatingAvailability(false);
    }
  };

  // Calculate real-time slots left for each garage for the current month
  const currentMonthStart = dayjs().startOf('month');
  const currentMonthEnd = dayjs().endOf('month');
  const getSlotsLeft = (garageId: string) => {
    const activeBookings = bookings.filter(
      b => b.garage_id === garageId &&
        (b.status === 'pending' || b.status === 'approved') &&
        dayjs(b.start_date ?? b.startDate ?? '').isBefore(currentMonthEnd.add(1, 'day')) &&
        dayjs(b.end_date ?? b.endDate ?? '').isAfter(currentMonthStart.subtract(1, 'day'))
    );
    const garage = garages.find(g => g.id === garageId);
    return garage ? Math.max(garage.slot - activeBookings.length, 0) : 0;
  };

  // Helper to get rental duration in months
  function getRentalDuration(start: string, end: string) {
    const startDate = dayjs(start);
    const endDate = dayjs(end);
    let months = endDate.diff(startDate, 'month');
    // If there are extra days, count as an additional month
    if (endDate.date() >= startDate.date()) {
      months += 1;
    }
    return `${months} month${months > 1 ? 's' : ''}`;
  }

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    // Find the selected garage
    const selectedGarage = garages.find(g => g.id === newOrder.garageId);
    if (!selectedGarage || !selectedGarage.pricePerMonth) {
      setError('Selected garage does not have a price per month set. Please choose another garage or set a price.');
      return;
    }
    try {
      // 1. Create user (or get existing user by email)
      const userResponse = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newOrder.userName, email: newOrder.userEmail, category: 'non-login' }),
      });
      const userData = await userResponse.json();
      if (!userResponse.ok || !userData.id) {
        throw new Error(userData.error || 'Failed to create or fetch user');
      }
      const userId = userData.id;

      // 2. Prepare booking payload
      const start = dayjs(newOrder.startMonth + '-01');
      const end = start.add(newOrder.months, 'month').subtract(1, 'day');
      const payload = {
        userId,
        garageId: newOrder.garageId,
        startDate: start.format('YYYY-MM-DD'),
        endDate: end.format('YYYY-MM-DD'),
        status: newOrder.status,
      };
      // 3. Create booking
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create booking');
      }
      const createdBooking = await response.json();
      setBookings(prev => [createdBooking, ...prev]);
      setShowOrderModal(false);
      setNewOrder({
        userName: '',
        userEmail: '',
        garageId: '',
        startMonth: '',
        months: 1,
        status: 'approved'
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while creating booking');
    }
  };

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
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <AdminHeader />
        <main className="min-h-[calc(100vh-80px)] bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="mt-2 text-gray-600">Manage garage bookings and customer requests</p>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            {/* Create Booking Button */}
            <div className="mb-8 flex justify-end">
              <button
                onClick={() => setShowOrderModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Create New Booking
              </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900">Total Bookings</h3>
                <p className="text-3xl font-bold text-blue-600 mt-2">{bookings.length}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900">Pending Requests</h3>
                <p className="text-3xl font-bold text-yellow-600 mt-2">
                  {bookings.filter(b => b.status === 'pending').length}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900">Active Bookings</h3>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {bookings.filter(b => b.status === 'approved').length}
                </p>
              </div>
            </div>

            {/* Create Booking Modal */}
            {showOrderModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl">
                  <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">Create New Booking</h2>
                    <button
                      onClick={() => setShowOrderModal(false)}
                      className="text-gray-400 hover:text-gray-500 focus:outline-none"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <form onSubmit={handleCreateOrder} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="userName" className="block text-sm font-medium text-gray-700 mb-1">
                          User Name
                        </label>
                        <input
                          type="text"
                          id="userName"
                          value={newOrder.userName}
                          onChange={e => setNewOrder({ ...newOrder, userName: e.target.value })}
                          className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="userEmail" className="block text-sm font-medium text-gray-700 mb-1">
                          User Email
                        </label>
                        <input
                          type="email"
                          id="userEmail"
                          value={newOrder.userEmail}
                          onChange={e => setNewOrder({ ...newOrder, userEmail: e.target.value })}
                          className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="garage" className="block text-sm font-medium text-gray-700 mb-1">
                          Select Garage
                        </label>
                        <select
                          id="garage"
                          value={newOrder.garageId}
                          onChange={e => setNewOrder({ ...newOrder, garageId: e.target.value })}
                          className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          required
                        >
                          <option value="">Select a garage</option>
                          {garages.map((garage) => (
                            <option key={garage.id} value={garage.id}>
                              {garage.title} - {garage.location}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label htmlFor="startMonth" className="block text-sm font-medium text-gray-700 mb-1">
                          Start Month
                        </label>
                        <input
                          type="month"
                          id="startMonth"
                          value={newOrder.startMonth}
                          onChange={e => setNewOrder({ ...newOrder, startMonth: e.target.value })}
                          className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="months" className="block text-sm font-medium text-gray-700 mb-1">
                          Number of Months
                        </label>
                        <input
                          type="number"
                          id="months"
                          min={1}
                          value={newOrder.months}
                          onChange={e => setNewOrder({ ...newOrder, months: parseInt(e.target.value) || 1 })}
                          className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          required
                        />
                      </div>
                    </div>

                    {/* Booking Summary */}
                    {(() => {
                      const selectedGarage = garages.find(g => g.id === newOrder.garageId);
                      const allFilled = newOrder.userName && newOrder.userEmail && selectedGarage && newOrder.startMonth && newOrder.months;
                      if (!allFilled) return null;
                      const start = dayjs(newOrder.startMonth + '-01');
                      const end = start.add(newOrder.months, 'month').subtract(1, 'day');
                      const totalPrice = selectedGarage.pricePerMonth * newOrder.months;
                      return (
                        <div className="bg-gray-50 p-6 rounded-lg mt-4">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Summary</h3>
                          <div className="space-y-2">
                            <p className="text-gray-600">
                              <span className="font-medium">Garage:</span> {selectedGarage.title}
                            </p>
                            <p className="text-gray-600">
                              <span className="font-medium">Location:</span> {selectedGarage.location}
                            </p>
                            <p className="text-gray-600">
                              <span className="font-medium">Price per month:</span> ${selectedGarage.pricePerMonth}
                            </p>
                            <p className="text-gray-600">
                              <span className="font-medium">Start month:</span> {start.format('MMMM YYYY')}
                            </p>
                            <p className="text-gray-600">
                              <span className="font-medium">Duration:</span> {newOrder.months} month{newOrder.months > 1 ? 's' : ''}
                            </p>
                            <p className="text-gray-600">
                              <span className="font-medium">End date:</span> {end.format('MMMM D, YYYY')}
                            </p>
                            <p className="text-gray-600">
                              <span className="font-medium">Total price:</span> ${totalPrice}
                            </p>
                          </div>
                        </div>
                      );
                    })()}

                    <div className="flex justify-end gap-4 pt-4 border-t">
                      <button
                        type="button"
                        onClick={() => setShowOrderModal(false)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Create Booking
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Garage Availability Management */}
            <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Garage Availability</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Garage
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price/Month
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Slots
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {garages.map((garage) => (
                      <tr key={garage.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {garage.title}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {garage.location}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-blue-600">
                            {garage.pricePerMonth ? `$${garage.pricePerMonth}` : 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {getSlotsLeft(garage.id)} / {garage.slot}
                            {getSlotsLeft(garage.id) === 0 && (
                              <span className="ml-2 text-xs text-red-600 font-semibold">Full</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              getSlotsLeft(garage.id) > 0
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {getSlotsLeft(garage.id) > 0 ? 'Available' : 'Unavailable'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bookings Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Recent Bookings</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Garage
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Dates
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {bookings.map((booking) => (
                      <tr key={booking.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900">
                            {booking.garage.title}
                          </span>
                          <div className="text-sm text-gray-500">
                            {booking.garage.location}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{booking.user?.name || 'Unknown'}</div>
                          <div className="text-sm text-gray-500">{booking.user?.email || 'No email'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {getRentalDuration((booking.start_date ?? booking.startDate ?? '') + '', (booking.end_date ?? booking.endDate ?? '') + '')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {booking.status === 'pending' ? (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleStatusChange(booking.id, 'approved')}
                                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleStatusChange(booking.id, 'rejected')}
                                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs"
                              >
                                Reject
                              </button>
                              <button
                                onClick={() => handleDeleteBooking(booking.id)}
                                className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 text-xs"
                              >
                                Remove
                              </button>
                            </div>
                          ) : booking.status !== 'removed' ? (
                            <div className="flex gap-2">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                booking.status === 'approved' 
                                  ? 'bg-green-100 text-green-800'
                                  : booking.status === 'rejected'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                              </span>
                              <button
                                onClick={() => handleDeleteBooking(booking.id)}
                                className="px-2 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 text-xs"
                              >
                                Remove
                              </button>
                            </div>
                          ) : (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-200 text-gray-600">
                              Removed
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 