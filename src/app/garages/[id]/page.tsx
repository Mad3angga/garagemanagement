'use client';

import Image from 'next/image';
import { Header } from '@/components/Header';

// Mock data - replace with actual data from your backend
const getGarage = (id: string) => {
  return {
    id,
    title: 'Modern Garage in Canggu',
    location: 'Canggu, Bali',
    price: 150,
    imageUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iNDgiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5HYXJhZ2UgSW1hZ2U8L3RleHQ+PC9zdmc+',
    size: '20 x 30 ft',
    rating: 4.8,
    description: 'A modern, secure garage space perfect for storing your vehicle or using as a workshop. Located in the heart of Canggu, this garage offers easy access and 24/7 security.',
    amenities: [
      '24/7 Security',
      'CCTV Surveillance',
      'Electricity Available',
      'Water Access',
      'Wide Entrance',
      'Good Ventilation'
    ],
    owner: {
      name: 'John Doe',
      phone: '+62 812-3456-7890',
      email: 'john@example.com'
    }
  };
};

export default function GaragePage({ params }: { params: { id: string } }) {
  const garage = getGarage(params.id);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iNDgiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5HYXJhZ2UgSW1hZ2U8L3RleHQ+PC9zdmc+';
  };

  if (!garage) {
    return (
      <div>
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-2xl font-bold text-gray-900">Garage not found</h1>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Section */}
          <div className="relative h-96">
            <Image
              src={garage.imageUrl}
              alt={garage.title}
              fill
              className="object-cover rounded-lg"
              onError={handleImageError}
            />
          </div>

          {/* Details Section */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{garage.title}</h1>
            <p className="mt-2 text-lg text-gray-600">{garage.location}</p>
            
            <div className="mt-4 flex items-center">
              <span className="text-2xl font-bold text-blue-600">
                ${garage.price.toLocaleString()}/mo
              </span>
              <div className="ml-4 flex items-center">
                <svg
                  className="w-5 h-5 text-yellow-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="ml-1 text-gray-600">{garage.rating}</span>
              </div>
            </div>

            <div className="mt-6">
              <h2 className="text-lg font-semibold text-gray-900">Description</h2>
              <p className="mt-2 text-gray-600">{garage.description}</p>
            </div>

            <div className="mt-6">
              <h2 className="text-lg font-semibold text-gray-900">Size</h2>
              <p className="mt-2 text-gray-600">{garage.size}</p>
            </div>

            <div className="mt-6">
              <h2 className="text-lg font-semibold text-gray-900">Amenities</h2>
              <ul className="mt-2 grid grid-cols-2 gap-4">
                {garage.amenities.map((amenity) => (
                  <li key={amenity} className="flex items-center text-gray-600">
                    <svg
                      className="w-5 h-5 text-green-500 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {amenity}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8">
              <button className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors">
                Book Now
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 