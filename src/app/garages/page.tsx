'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GarageCard } from '@/components/GarageCard';
import Image from 'next/image';
import Link from 'next/link';

// Company's available garage spaces
const availableSpaces = [
  {
    id: '1',
    title: 'Standard Garage Space',
    location: 'Canggu, Bali',
    price: 150,
    imageUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iNDgiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5HYXJhZ2UgSW1hZ2U8L3RleHQ+PC9zdmc+',
    size: '20 x 30 ft',
    rating: 4.8,
    description: 'Perfect for storing one vehicle or small workshop space',
    amenities: ['24/7 Security', 'CCTV', 'Basic Electricity']
  },
  {
    id: '2',
    title: 'Premium Garage Space',
    location: 'Seminyak, Bali',
    price: 250,
    imageUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iNDgiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5HYXJhZ2UgSW1hZ2U8L3RleHQ+PC9zdmc+',
    size: '25 x 35 ft',
    rating: 4.9,
    description: 'Spacious garage with additional storage area and premium amenities',
    amenities: ['24/7 Security', 'CCTV', 'Premium Electricity', 'Water Access', 'Air Conditioning']
  },
  {
    id: '3',
    title: 'Workshop Space',
    location: 'Ubud, Bali',
    price: 300,
    imageUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iNDgiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5HYXJhZ2UgSW1hZ2U8L3RleHQ+PC9zdmc+',
    size: '30 x 40 ft',
    rating: 4.9,
    description: 'Large workshop space with industrial-grade facilities',
    amenities: ['24/7 Security', 'CCTV', 'Industrial Power', 'Water Access', 'Air Conditioning', 'Loading Dock']
  }
];

export default function GaragesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/');
    }, 1000);
    return () => clearTimeout(timer);
  }, [router]);
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-gray-100">
      <main className="flex-1 flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Coming Soon</h1>
        <p className="text-lg text-gray-600 mb-2">Our garage listings are under maintenance.</p>
        <p className="text-gray-400">Please check back later.</p>
        {loading && (
          <div className="mt-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}
      </main>
    </div>
  );
} 