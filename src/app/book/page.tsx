'use client';

import { Header } from '@/components/Header';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import Image from 'next/image';

interface Garage {
  id: string;
  title: string;
  location: string;
  pricePerMonth: number;
  description: string;
  images: string[];
}

export default function BookPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [garages, setGarages] = useState<Garage[]>([]);
  const [selectedGarage, setSelectedGarage] = useState<Garage | null>(null);
  const [startMonth, setStartMonth] = useState(dayjs().format('YYYY-MM'));
  const [numMonths, setNumMonths] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dateError, setDateError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    const fetchGarages = async () => {
      try {
        const response = await fetch('/api/garages');
        if (!response.ok) {
          throw new Error('Failed to fetch garages');
        }
        const data = await response.json();
        const mappedGarages = data.map((garage: any) => ({
          ...garage,
          pricePerMonth: garage.price_per_month || garage.pricePerDay || garage.price_per_day,
        }));
        setGarages(mappedGarages);
      } catch (error) {
        console.error('Error fetching garages:', error);
        setError('Failed to load garages. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    if (session) {
      fetchGarages();
    }
  }, [session]);

  useEffect(() => {
    // Validate that end date is after start date
    if (startMonth && numMonths) {
      if (numMonths < 1) {
        setDateError('Number of months must be at least 1');
      } else {
        setDateError('');
      }
    } else {
      setDateError('');
    }
  }, [startMonth, numMonths]);

  const calculateTotalPrice = () => {
    if (!selectedGarage || !startMonth || !numMonths) return 0;
    return numMonths * selectedGarage.pricePerMonth;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (!selectedGarage || !startMonth || !numMonths) {
      setError('Please select a garage, start month, and duration');
      return;
    }
    if (numMonths < 1) {
      setError('Number of months must be at least 1');
      return;
    }
    const startDate = dayjs(startMonth + '-01');
    const endDate = startDate.add(numMonths, 'month').subtract(1, 'day');
    if (calculateTotalPrice() <= 0) {
      setError('Total price must be greater than 0');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      console.log('Selected garage:', selectedGarage);
      const payload = {
        garageId: selectedGarage.id,
        startDate: startDate.format('YYYY-MM-DD'),
        endDate: endDate.format('YYYY-MM-DD'),
      };
      console.log('Booking payload:', payload);
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Server error:', data);
        throw new Error(data.error || `Failed to create booking: ${response.status}`);
      }

      router.push('/dashboard');
    } catch (error) {
      console.error('Full error:', error);
      setError(error instanceof Error ? error.message : 'Failed to create booking');
    } finally {
      setIsSubmitting(false);
    }
  };

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
    <div>
      <Header />
      <main className="min-h-[calc(100vh-80px)] bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="bg-white shadow-xl rounded-2xl p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Book a Garage</h1>

            {error && (
              <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select a Garage
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {garages.map((garage) => (
                    <div
                      key={garage.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        selectedGarage?.id === garage.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                      onClick={() => setSelectedGarage(garage)}
                    >
                      <div className="relative h-48">
                        <Image
                          src={garage.images[0]}
                          alt={garage.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <h3 className="font-semibold text-gray-900">{garage.title}</h3>
                      <p className="text-gray-600 text-sm">{garage.location}</p>
                      <p className="text-blue-600 font-medium mt-2">
                        ${garage.pricePerMonth}/month
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="startMonth" className="block text-sm font-medium text-gray-700">
                    Start Month
                  </label>
                  <input
                    type="month"
                    id="startMonth"
                    value={startMonth}
                    onChange={(e) => setStartMonth(e.target.value)}
                    min={dayjs().format('YYYY-MM')}
                    className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="numMonths" className="block text-sm font-medium text-gray-700">
                    Number of Months
                  </label>
                  <input
                    type="number"
                    id="numMonths"
                    value={numMonths}
                    onChange={(e) => setNumMonths(Number(e.target.value))}
                    min={1}
                    className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    required
                  />
                </div>
              </div>

              {dateError && (
                <div className="text-red-600 text-sm mb-2">{dateError}</div>
              )}

              {selectedGarage && startMonth && numMonths && (
                <div className="bg-gray-50 p-6 rounded-lg">
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
                      <span className="font-medium">Start month:</span> {dayjs(startMonth + '-01').format('MMMM YYYY')}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Duration:</span> {numMonths} month{numMonths > 1 ? 's' : ''}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">End date:</span> {dayjs(startMonth + '-01').add(numMonths, 'month').subtract(1, 'day').format('MMMM D, YYYY')}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Total price:</span> ${calculateTotalPrice()}
                    </p>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={
                  isSubmitting ||
                  !selectedGarage ||
                  !startMonth ||
                  !numMonths ||
                  numMonths < 1 ||
                  calculateTotalPrice() <= 0
                }
                className={`w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors ${
                  isSubmitting ||
                  !selectedGarage ||
                  !startMonth ||
                  !numMonths ||
                  numMonths < 1 ||
                  calculateTotalPrice() <= 0
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                }`}
              >
                {isSubmitting ? 'Creating Booking...' : 'Create Booking'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
} 