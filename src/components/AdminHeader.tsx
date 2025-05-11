'use client';

import Link from 'next/link';
import { signOut } from 'next-auth/react';

export const AdminHeader = () => {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <Link href="/admin/dashboard" className="flex items-center">
            <span className="text-2xl font-bold text-blue-600">Andaja</span>
            <span className="ml-2 text-sm text-gray-500">Admin</span>
          </Link>

          <nav className="flex items-center space-x-6">
            <button
              onClick={() => signOut()}
              className="text-gray-700 hover:text-blue-600"
            >
              Logout
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}; 