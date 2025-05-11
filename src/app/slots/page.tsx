'use client';

import { Header } from '@/components/Header';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import Image from 'next/image';
const placeholderImg = '/images/garages/default.jpg';

interface GarageSlot {
  id: string;
  title: string;
  location: string;
  pricePerDay: number;
  pricePerMonth?: number;
  description: string;
  image: string | null;
  status: 'available' | 'booked';
  slot: number;
  activeBookings?: number;
}

export default function SlotsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [slots, setSlots] = useState<GarageSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const today = dayjs().format('YYYY-MM-DD');
        const tomorrow = dayjs().add(1, 'day').format('YYYY-MM-DD');
        const response = await fetch(`/api/slots?startDate=${today}&endDate=${tomorrow}&all=true`);
        if (!response.ok) {
          throw new Error('Failed to fetch garage availability');
        }
        const data = await response.json();
        setSlots(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    if (session) {
      fetchSlots();
    }
  }, [session]);

  if (status === 'loading' || isLoading) {
    return (
      <div>
        <Header />
        <main className="min-h-[calc(100vh-80px)] bg-gradient-to-b from-white to-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="text-center">Loading...</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-100">
      <Header />
      <main className="min-h-[calc(100vh-80px)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="bg-white shadow-2xl rounded-2xl p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Garage Availability</h1>
            {error && (
              <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg text-center">
                {error}
              </div>
            )}
            {slots.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">No garages available at the moment.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {slots.map((slot, idx) => {
                  const slotsLeft = slot.slot - (slot.activeBookings || 0);
                  const isFull = slotsLeft <= 0;
                  let displayTitle = slot.title;
                  if (slot.location.toLowerCase().includes('seminyak')) displayTitle = 'Seminyak Garage Place';
                  else if (slot.location.toLowerCase().includes('ubud')) displayTitle = 'Ubud Garage Place';
                  else if (slot.location.toLowerCase().includes('kuta')) displayTitle = 'Kuta Garage Place';
                  const imageSrc = slot.image?.startsWith('http') ? slot.image : slot.image || placeholderImg;
                  return (
                    <div
                      key={slot.id}
                      className="border border-gray-200 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow bg-white flex flex-col animate-fadeIn"
                      style={{ animationDelay: `${idx * 60}ms` }}
                    >
                      <div className="relative h-48">
                        <Image
                          src={imageSrc}
                          alt={displayTitle}
                          fill
                          className="object-cover rounded-t-xl shadow-sm"
                        />
                      </div>
                      <div className="p-6 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-center mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{displayTitle}</h3>
                          <span
                              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                              isFull
                                  ? 'bg-red-100 text-red-700 border border-red-200'
                                  : 'bg-green-100 text-green-700 border border-green-200'
                            }`}
                          >
                              {isFull ? (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                              ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                              )}
                            {isFull ? 'Unavailable' : 'Available'}
                          </span>
                          </div>
                          <p className="text-gray-500 text-sm mb-1">{slot.location}</p>
                          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{slot.description}</p>
                        </div>
                        <div className="flex justify-between items-center mb-4 mt-2">
                          <span className="text-sm font-semibold text-gray-900">
                            {slotsLeft} / {slot.slot} {isFull && <span className="ml-2 text-xs text-red-600 font-semibold">Full</span>}
                          </span>
                          <span className="text-blue-600 font-bold">$50/month</span>
                        </div>
                        {!isFull && (
                          <a
                            href="/book"
                            className="w-full block text-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold shadow"
                          >
                            Book Now
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 