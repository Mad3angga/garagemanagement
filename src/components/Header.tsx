'use client';

import Link from 'next/link';
import Search from './Search';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';

export const Header = () => {
  const { data: session } = useSession();
  const pathname = usePathname();

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-blue-600">Andaja</span>
            <span className="ml-2 text-sm text-gray-500">Garage</span>
          </Link>
          
          <div className="hidden sm:block flex-1 max-w-2xl mx-8">
            <Search />
          </div>

          <nav className="flex items-center space-x-6">
            <Link href="/garages" className="text-gray-700 hover:text-blue-600">
              Our Garages
            </Link>
            <Link href="/slots" className="text-gray-700 hover:text-blue-600">
              Availability
            </Link>
            <div className="h-4 w-px bg-gray-300"></div>
            
            {session ? (
              <>
                {session.user.isAdmin && (
                  <Link href="/admin/dashboard" className="text-gray-700 hover:text-blue-600">
                    Admin Dashboard
                  </Link>
                )}
                {pathname !== '/dashboard' && (
                  <Link href="/dashboard" className="text-gray-700 hover:text-blue-600">
                    My Bookings
                  </Link>
                )}
                <button
                  onClick={() => signOut()}
                  className="text-gray-700 hover:text-blue-600"
                >
                  Logout
                </button>
                {pathname !== '/dashboard' && (
                  <Link 
                    href="/book" 
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Book Now
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link href="/login" className="text-gray-700 hover:text-blue-600">
                  Login
                </Link>
                {pathname !== '/dashboard' && (
                  <Link 
                    href="/book" 
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Book Now
                  </Link>
                )}
              </>
            )}
          </nav>
        </div>
        
        <div className="sm:hidden mt-4">
          <Search />
        </div>
      </div>
    </header>
  );
}; 