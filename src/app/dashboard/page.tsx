'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import dayjs from 'dayjs';
import { Header } from '@/components/Header';
import Image from 'next/image';

interface Booking {
  id: string;
  start_date: string;
  end_date: string;
  status: string;
  total_price: number;
  removed_reason?: string;
  garage: {
    id: string;
    title: string;
    location: string;
    images: string[];
  };
  review?: {
    id: string;
    rating: number;
    comment: string;
  };
}

interface ReviewFormData {
  rating: number;
  comment: string;
}

// Helper to get rental duration in months
function getRentalDuration(start: string, end: string) {
  const startDate = dayjs(start);
  const endDate = dayjs(end);
  let months = endDate.diff(startDate, 'month');
  if (endDate.date() >= startDate.date()) {
    months += 1;
  }
  return `${months} month${months > 1 ? 's' : ''}`;
}

export default function UserDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewForm, setReviewForm] = useState<{ [key: string]: ReviewFormData }>({});
  const [submittingReview, setSubmittingReview] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchBookings();
    }
  }, [session]);

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          garage:garages(title, location, images)
        `)
        .eq('user_id', session?.user?.id)
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

  const handleReviewSubmit = async (bookingId: string, garageId: string) => {
    try {
      setSubmittingReview(bookingId);
      const reviewData = reviewForm[bookingId];

      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          garageId,
          rating: reviewData.rating,
          comment: reviewData.comment,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit review');
      }

      // Refresh bookings to show the new review
      await fetchBookings();
      // Clear the review form
      setReviewForm(prev => {
        const newForm = { ...prev };
        delete newForm[bookingId];
        return newForm;
      });
    } catch (err) {
      setError('Failed to submit review. Please try again.');
      console.error('Error submitting review:', err);
    } finally {
      setSubmittingReview(null);
    }
  };

  const handleReviewChange = (bookingId: string, field: keyof ReviewFormData, value: string | number) => {
    setReviewForm(prev => ({
      ...prev,
      [bookingId]: {
        ...prev[bookingId],
        [field]: value,
      },
    }));
  };

  if (status === 'loading' || loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-100">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
          <a
            href="/book"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors font-semibold text-lg"
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>
            Book Now
          </a>
        </div>

        {/* Pending booking notice */}
        {bookings.some(b => b.status === 'pending') && (
          <div className="mb-6 p-4 bg-yellow-100 border border-yellow-300 text-yellow-800 rounded-lg text-center">
            You have a pending booking. Please wait for admin approval before booking the same garage for overlapping dates.
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Active and Pending Bookings */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Active & Pending Bookings</h2>
          {bookings.filter(b => b.status === 'approved' || b.status === 'pending').length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {bookings
                .filter(b => b.status === 'approved' || b.status === 'pending')
                .map((booking) => (
              <div key={booking.id} className="bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden flex flex-col">
                {booking.garage.images[0] && (
                      <div className="relative h-48 w-full bg-gray-100">
                        <Image
                          src={
                            booking.garage.images[0]?.startsWith('http')
                              ? booking.garage.images[0]
                              : booking.garage.images[0] || '/images/garages/default.jpg'
                          }
                    alt={booking.garage.title}
                          fill
                          className="object-cover"
                  />
                      </div>
                )}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900 mb-1">{booking.garage.title}</h3>
                    <p className="text-gray-600 mb-2">{booking.garage.location}</p>
                    <p className="text-sm mb-2 text-gray-500">
                      {getRentalDuration(booking.start_date, booking.end_date)}
                    </p>
                    <p className="text-sm mb-2 text-gray-700 font-medium">Total: <span className="text-blue-600 font-bold">${booking.total_price}</span></p>
                    <p className="text-sm mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        booking.status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : booking.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </span>
                        </p>
                        {booking.status === 'approved' && dayjs(booking.end_date).isBefore(dayjs()) && !booking.review && (
                          <div className="mt-4">
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Leave a Review</h4>
                            <div className="space-y-3">
                              <div>
                                <label className="block text-sm text-gray-600 mb-1">Rating</label>
                                <div className="flex gap-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                      key={star}
                                      type="button"
                                      onClick={() => handleReviewChange(booking.id, 'rating', star)}
                                      className={`text-2xl ${
                                        (reviewForm[booking.id]?.rating || 0) >= star
                                          ? 'text-yellow-400'
                                          : 'text-gray-300'
                                      }`}
                                    >
                                      ★
                                    </button>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <label className="block text-sm text-gray-600 mb-1">Comment</label>
                                <textarea
                                  value={reviewForm[booking.id]?.comment || ''}
                                  onChange={(e) => handleReviewChange(booking.id, 'comment', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  rows={3}
                                  placeholder="Share your experience..."
                                />
                              </div>
                              <button
                                onClick={() => handleReviewSubmit(booking.id, booking.garage.id)}
                                disabled={!reviewForm[booking.id]?.rating || submittingReview === booking.id}
                                className={`w-full px-4 py-2 rounded-lg text-white font-medium ${
                                  !reviewForm[booking.id]?.rating || submittingReview === booking.id
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-700'
                                }`}
                              >
                                {submittingReview === booking.id ? 'Submitting...' : 'Submit Review'}
                              </button>
                            </div>
                          </div>
                        )}
                        {booking.review && (
                          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-1 mb-2">
                              {[...Array(5)].map((_, i) => (
                                <span
                                  key={i}
                                  className={`text-lg ${
                                    i < booking.review!.rating ? 'text-yellow-400' : 'text-gray-300'
                                  }`}
                                >
                                  ★
                                </span>
                              ))}
                            </div>
                            <p className="text-sm text-gray-600">{booking.review.comment}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              No active or pending bookings found.
            </div>
          )}
        </div>

        {/* Booking History */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Booking History</h2>
          {bookings.filter(b => b.status === 'rejected' || b.status === 'removed').length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {bookings
                .filter(b => b.status === 'rejected' || b.status === 'removed')
                .map((booking) => (
                  <div key={booking.id} className="bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden flex flex-col">
                    {booking.garage.images[0] && (
                      <div className="relative h-48 w-full bg-gray-100">
                        <Image
                          src={
                            booking.garage.images[0]?.startsWith('http')
                              ? booking.garage.images[0]
                              : booking.garage.images[0] || '/images/garages/default.jpg'
                          }
                          alt={booking.garage.title}
                          fill
                          className="object-cover opacity-75"
                        />
                      </div>
                    )}
                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900 mb-1">{booking.garage.title}</h3>
                        <p className="text-gray-600 mb-2">{booking.garage.location}</p>
                        <p className="text-sm mb-2 text-gray-500">
                          {getRentalDuration(booking.start_date, booking.end_date)}
                        </p>
                        <p className="text-sm mb-2 text-gray-700 font-medium">Total: <span className="text-blue-600 font-bold">${booking.total_price}</span></p>
                        <p className="text-sm mb-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            booking.status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </p>
                    {booking.removed_reason && (
                      <p className="text-xs text-red-600 mt-2">
                            Reason: {booking.removed_reason}
                      </p>
                    )}
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(booking.start_date).toLocaleDateString()} - {new Date(booking.end_date).toLocaleDateString()}
                        </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
            <div className="text-center text-gray-500 py-8">
              No booking history found.
            </div>
          )}
        </div>

        {bookings.length === 0 && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center text-gray-500">
            <svg width="96" height="96" fill="none" viewBox="0 0 24 24" className="mx-auto mb-6">
              <circle cx="12" cy="12" r="10" fill="#e5e7eb"/>
              <path d="M8 13h8M8 17h4" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round"/>
              <circle cx="9" cy="9" r="1" fill="#9ca3af"/>
              <circle cx="15" cy="9" r="1" fill="#9ca3af"/>
            </svg>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">No Bookings Yet</h2>
            <div className="mb-6 text-gray-500">You haven't made any bookings yet. Start by booking your first garage space!</div>
            <a
              href="/book"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors font-semibold text-lg"
            >
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>
              Book Now
            </a>
          </div>
        )}
      </div>
    </div>
  );
} 