'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface Booking {
  id: string;
  start_date: string;
  end_date: string;
  status: string;
  total_price: number;
  removed_reason?: string;
  user: {
    name: string;
    email: string;
  };
  garage: {
    title: string;
    location: string;
  };
}

interface Garage {
  id: string;
  title: string;
  location: string;
  is_available: boolean;
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [garages, setGarages] = useState<Garage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.isAdmin) {
      fetchBookings();
      fetchGarages();
    }
  }, [session]);

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          user:users(name, email),
          garage:garages(title, location)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (err) {
      setError('Failed to fetch bookings');
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchGarages = async () => {
    try {
      const { data, error } = await supabase
        .from('garages')
        .select('*')
        .order('title');

      if (error) throw error;
      setGarages(data || []);
    } catch (err) {
      setError('Failed to fetch garages');
      console.error('Error fetching garages:', err);
    }
  };

  const updateBookingStatus = async (bookingId: string, status: string, removedReason?: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({
          status,
          removed_reason: removedReason,
        })
        .eq('id', bookingId);

      if (error) throw error;
      fetchBookings();
    } catch (err) {
      setError('Failed to update booking status');
      console.error('Error updating booking:', err);
    }
  };

  const toggleGarageAvailability = async (garageId: string, isAvailable: boolean) => {
    try {
      const { error } = await supabase
        .from('garages')
        .update({ isAvailable: isAvailable })
        .eq('id', garageId);

      if (error) throw error;
      fetchGarages();
    } catch (err) {
      setError('Failed to update garage availability');
      console.error('Error updating garage:', err);
    }
  };

  if (status === 'loading' || loading) {
    return <div>Loading...</div>;
  }

  if (!session?.user?.isAdmin) {
    return <div>Access denied</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Bookings Section */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Bookings</h2>
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking.id} className="border p-4 rounded">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">{booking.garage.title}</p>
                    <p className="text-sm text-gray-600">{booking.garage.location}</p>
                    <p className="text-sm">
                      {new Date(booking.start_date).toLocaleDateString()} -{' '}
                      {new Date(booking.end_date).toLocaleDateString()}
                    </p>
                    <p className="text-sm">User: {booking.user.name}</p>
                    <p className="text-sm">Email: {booking.user.email}</p>
                    <p className="text-sm">Total: ${booking.total_price}</p>
                    <p className="text-sm">Status: {booking.status}</p>
                    {booking.removed_reason && (
                      <p className="text-sm text-red-600">
                        Reason: {booking.removed_reason}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    {booking.status === 'pending' && (
                      <>
                        <button
                          onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                          className="bg-green-500 text-white px-3 py-1 rounded text-sm"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => {
                            const reason = prompt('Please provide a reason for removal:');
                            if (reason) {
                              updateBookingStatus(booking.id, 'removed', reason);
                            }
                          }}
                          className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                        >
                          Remove
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Garages Section */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Garages</h2>
          <div className="space-y-4">
            {garages.map((garage) => (
              <div key={garage.id} className="border p-4 rounded">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{garage.title}</p>
                    <p className="text-sm text-gray-600">{garage.location}</p>
                  </div>
                  <button
                    onClick={() => toggleGarageAvailability(garage.id, !garage.is_available)}
                    className={`px-3 py-1 rounded text-sm ${
                      garage.is_available
                        ? 'bg-red-500 text-white'
                        : 'bg-green-500 text-white'
                    }`}
                  >
                    {garage.is_available ? 'Disable' : 'Enable'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 