"use client";
import Image from 'next/image';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { useEffect, useState } from 'react';

export default function Home() {
  const [garages, setGarages] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/garages')
      .then(res => res.json())
      .then(data => setGarages(data));
  }, []);

  // Helper to get garage by location
  const getGarageImage = (location: string, fallback: string) => {
    const garage = garages.find(g => g.location && g.location.toLowerCase().includes(location));
    return garage && Array.isArray(garage.images) && garage.images.length > 0 ? garage.images[0] : fallback;
  };

  return (
    <div>
      <Header />
      <main>
        {/* Hero Section */}
        <section className="relative bg-blue-600 text-white overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-800"></div>
          <div className="absolute inset-0 opacity-20">
            <Image
              src="/images/garage-pattern.svg"
              alt="Background pattern"
              fill
              className="object-cover"
            />
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Premium Garage Storage in Bali
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-blue-100">
                Secure garage spaces in Kuta, Seminyak and Ubud with 24/7 security at a single affordable price
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/book"
                  className="bg-white text-blue-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  Book Your Space
                </Link>
                <Link
                  href="/slots"
                  className="bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-800 transition-colors"
                >
                  Check Availability
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Locations Section */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-black mb-8">Our Locations</h2>
            <p className="text-xl text-center text-gray-600 mb-16 max-w-3xl mx-auto">
              Choose from our three convenient locations across Bali, all at the same price of $50/day
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="h-48 relative">
                  <Image
                    src={getGarageImage('kuta', '/images/garages/kuta-garage.jpg')}
                    alt="Kuta location"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2 text-black">Kuta</h3>
                  <p className="text-gray-600 mb-4">
                    Located near the beach and shopping centers, our Kuta garage offers convenient access to Bali's most popular tourist area.
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-600 font-bold">$50/day</span>
                    <Link href="/book" className="text-blue-600 hover:text-blue-800">
                      Book Now →
                    </Link>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="h-48 relative">
                  <Image
                    src={getGarageImage('seminyak', '/images/garages/seminyak-garage.jpg')}
                    alt="Seminyak location"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2 text-black">Seminyak</h3>
                  <p className="text-gray-600 mb-4">
                    In the heart of Seminyak's trendy district, close to restaurants and nightlife, perfect for short-term storage.
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-600 font-bold">$50/day</span>
                    <Link href="/book" className="text-blue-600 hover:text-blue-800">
                      Book Now →
                    </Link>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="h-48 relative">
                  <Image
                    src={getGarageImage('ubud', '/images/garages/ubud-garage.jpg')}
                    alt="Ubud location"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2 text-black">Ubud</h3>
                  <p className="text-gray-600 mb-4">
                    A peaceful setting in Bali's cultural heart, ideal for long-term storage with easy access to Ubud's attractions.
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-600 font-bold">$50/day</span>
                    <Link href="/book" className="text-blue-600 hover:text-blue-800">
                      Book Now →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-black mb-16">Why Choose Our Garage?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-4 text-black">State-of-the-Art Security</h3>
                <p className="text-gray-600">24/7 security personnel, CCTV surveillance, and secure access control for your peace of mind</p>
              </div>
              <div className="text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-4 text-black">Modern Facilities</h3>
                <p className="text-gray-600">Climate-controlled spaces with electricity, water access, and proper ventilation</p>
              </div>
              <div className="text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-4 text-black">Premium Support</h3>
                <p className="text-gray-600">Dedicated customer service and maintenance team available to assist you</p>
              </div>
            </div>
          </div>
        </section>

        {/* Location Section */}
        <section className="py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6 text-black">Multiple Locations Across Bali</h2>
                <p className="text-gray-600 mb-8">
                  Our garages are strategically located in three of Bali's most popular areas: Kuta, Seminyak, and Ubud. 
                  Each location offers the same high-quality services and amenities, making it easy to choose the one that's most convenient for you.
                </p>
                <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2 text-black">GarageBali Main Office</h3>
                    <p className="text-gray-600 mb-2">Jl. Raya Kuta No. 123</p>
                    <p className="text-gray-600 mb-4">Kuta, Bali 80361</p>
                  <div className="flex items-center text-blue-600">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span>+62 812-3456-7890</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative h-[400px] rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                <iframe
                  title="GarageBali Main Office Map"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3944.1234567890123!2d115.169857315334!3d-8.723123456789012!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dd247f123456789%3A0x123456789abcdef!2sJl.%20Raya%20Kuta%20No.123%2C%20Kuta%2C%20Bali%2080361%2C%20Indonesia!5e0!3m2!1sen!2sid!4v1680000000000!5m2!1sen!2sid"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={true}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-6 text-black">Ready to Secure Your Space?</h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Join our satisfied customers and experience the best garage storage solution in Denpasar
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Contact Us
              </Link>
              <Link
                href="/book"
                className="bg-gray-800 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-900 transition-colors"
              >
                Book a Tour
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
