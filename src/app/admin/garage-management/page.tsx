'use client';

import { AdminHeader } from '@/components/AdminHeader';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import dayjs from 'dayjs';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

interface Garage {
  id: string;
  title: string;
  location: string;
  pricePerMonth: number;
  description: string;
  images: string[];
  isAvailable: boolean;
  slot: number;
  amenities: any[];
  updated_at: string;
}

function Carousel({ images, alt }: { images: string[]; alt: string }) {
  const [idx, setIdx] = useState(0);
  if (!images.length) return null;
  return (
    <div className="relative w-full h-full">
      <Image src={images[idx]} alt={alt} fill className="object-cover rounded-lg" />
      {images.length > 1 && (
        <>
          <button
            type="button"
            className="absolute left-1 top-1/2 -translate-y-1/2 bg-white bg-opacity-70 rounded-full p-1 text-gray-700 hover:bg-opacity-100"
            onClick={e => { e.stopPropagation(); setIdx((idx - 1 + images.length) % images.length); }}
            aria-label="Previous image"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button
            type="button"
            className="absolute right-1 top-1/2 -translate-y-1/2 bg-white bg-opacity-70 rounded-full p-1 text-gray-700 hover:bg-opacity-100"
            onClick={e => { e.stopPropagation(); setIdx((idx + 1) % images.length); }}
            aria-label="Next image"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          </button>
        </>
      )}
      {/* Dots */}
      {images.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
          {images.map((_, i) => (
            <span key={i} className={`inline-block w-2 h-2 rounded-full ${i === idx ? 'bg-blue-600' : 'bg-gray-300'}`}></span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function GarageManagement() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [garages, setGarages] = useState<Garage[]>([]);
  const [selectedGarage, setSelectedGarage] = useState<Garage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [amenities, setAmenities] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loadingSkeleton, setLoadingSkeleton] = useState(true);

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

  const fetchGarages = async () => {
    try {
      const response = await fetch('/api/garages');
      if (!response.ok) {
        throw new Error('Failed to fetch garages');
      }
      const data = await response.json();
      setGarages(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.isAdmin) {
      fetchGarages();
    }
  }, [session]);

  useEffect(() => {
    fetch('/api/amenities')
      .then(res => res.json())
      .then(data => setAmenities(data));
  }, []);

  useEffect(() => {
    if (!isLoading) {
      setLoadingSkeleton(true);
      const t = setTimeout(() => setLoadingSkeleton(false), 800);
      return () => clearTimeout(t);
    }
  }, [isLoading]);

  const filteredGarages = useMemo(() => {
    return garages.filter(g =>
      g.title.toLowerCase().includes(search.toLowerCase()) ||
      g.location.toLowerCase().includes(search.toLowerCase())
    );
  }, [garages, search]);

  const handleEdit = (garage: Garage) => {
    setSelectedGarage(garage);
    setIsEditing(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGarage) return;

    try {
      const response = await fetch(`/api/garages/${selectedGarage.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(selectedGarage),
      });

      if (!response.ok) {
        throw new Error('Failed to update garage');
      }

      await fetchGarages();
      setIsEditing(false);
      setSelectedGarage(null);
      setSuccessMessage('Garage updated successfully!');
      setTimeout(() => setSuccessMessage(null), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while updating garage');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !selectedGarage) return;
    setUploading(true);
    setUploadError(null);
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${selectedGarage.id}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { data, error } = await supabase.storage.from('garage-images').upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

    if (error) {
      setUploadError(error.message);
      setUploading(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage.from('garage-images').getPublicUrl(filePath);
    const publicUrl = publicUrlData?.publicUrl;
    if (publicUrl) {
      setSelectedGarage({
        ...selectedGarage,
        images: [...selectedGarage.images, publicUrl],
      });
    }
    setUploading(false);
  };

  const handleRemoveImage = (url: string) => {
    if (!selectedGarage) return;
    setSelectedGarage({
      ...selectedGarage,
      images: selectedGarage.images.filter(img => img !== url),
    });
  };

  const handleDelete = async (garage: any) => {
    if (!window.confirm(`Are you sure you want to delete "${garage.title}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/garages/${garage.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete garage');
      await fetchGarages();
      setSuccessMessage('Garage deleted successfully!');
      setTimeout(() => setSuccessMessage(null), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while deleting garage');
    }
  };

  // Drag and drop handler for images
  const handleImageDragEnd = (result: any) => {
    if (!result.destination || !selectedGarage) return;
    const newImages = Array.from(selectedGarage.images);
    const [removed] = newImages.splice(result.source.index, 1);
    newImages.splice(result.destination.index, 0, removed);
    setSelectedGarage({ ...selectedGarage, images: newImages });
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
      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-10 transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar overlay"
        />
      )}
      {/* Sidebar */}
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
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <AdminHeader />
        <main className="min-h-[calc(100vh-80px)] bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Garage Management</h1>
              <p className="mt-2 text-gray-600">Edit and manage your garage listings</p>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-lg">
                {successMessage}
              </div>
            )}

            {/* Search Bar */}
            <div className="mb-6 flex items-center gap-3">
              <input
                type="text"
                placeholder="Search by name or location..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full max-w-xs px-4 py-2 border rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Garage List */}
            {loadingSkeleton ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="rounded-xl bg-gray-100 animate-pulse h-64" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredGarages.map((garage) => (
                  <div key={garage.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300">
                    <div className="relative h-48">
                      <Carousel images={garage.images} alt={garage.title} />
                    </div>
                    <div className="p-5">
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{garage.title}</h3>
                        <p className="text-sm text-gray-500">{garage.location}</p>
                      </div>

                      <button
                        onClick={() => handleEdit(garage)}
                        className="w-full py-2 px-4 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 11l6 6M3 21h6v-6l9-9a2.121 2.121 0 10-3-3l-9 9z" />
                        </svg>
                        Edit Garage
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Edit Form Modal */}
            {isEditing && selectedGarage && (
              <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                  <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">Edit Garage</h2>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setSelectedGarage(null);
                      }}
                      className="text-gray-400 hover:text-gray-500 focus:outline-none"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                          Title
                        </label>
                        <input
                          type="text"
                          id="title"
                          value={selectedGarage.title}
                          onChange={(e) => setSelectedGarage({ ...selectedGarage, title: e.target.value })}
                          className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                          Location
                        </label>
                        <input
                          type="text"
                          id="location"
                          value={selectedGarage.location}
                          onChange={(e) => setSelectedGarage({ ...selectedGarage, location: e.target.value })}
                          className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                          Price per Month
                        </label>
                        <input
                          type="number"
                          id="price"
                          value={selectedGarage.pricePerMonth}
                          onChange={(e) => setSelectedGarage({ ...selectedGarage, pricePerMonth: Number(e.target.value) })}
                          className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label htmlFor="slot" className="block text-sm font-medium text-gray-700 mb-1">
                          Number of Slots
                        </label>
                        <input
                          type="number"
                          id="slot"
                          value={selectedGarage.slot}
                          onChange={(e) => setSelectedGarage({ ...selectedGarage, slot: Number(e.target.value) })}
                          className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        id="description"
                        value={selectedGarage.description}
                        onChange={(e) => setSelectedGarage({ ...selectedGarage, description: e.target.value })}
                        rows={4}
                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Images</label>
                      <DragDropContext onDragEnd={handleImageDragEnd}>
                        <Droppable droppableId="garage-images-droppable" direction="horizontal">
                          {(provided: any) => (
                            <div
                              className="grid grid-cols-4 gap-4 mb-4"
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                            >
                              {selectedGarage.images.map((img, idx) => (
                                <Draggable key={img} draggableId={img} index={idx}>
                                  {(provided: any, snapshot: any) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      className={`relative aspect-square ${snapshot.isDragging ? 'ring-2 ring-blue-500' : ''}`}
                                    >
                                      <Image src={img} alt={`Garage image ${idx + 1}`} fill className="object-cover rounded-lg" />
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveImage(img)}
                                        className="absolute top-2 right-2 bg-white bg-opacity-80 rounded-full p-1 text-red-600 hover:bg-opacity-100 shadow-sm"
                                        title="Remove image"
                                      >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                      </button>
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      </DragDropContext>
                      <div className="flex items-center gap-4">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={uploading}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        {uploading && <span className="text-blue-600 text-sm">Uploading...</span>}
                      </div>
                      {uploadError && <p className="text-red-600 text-sm mt-2">{uploadError}</p>}
                    </div>

                    <div className="flex justify-end gap-4 pt-4 border-t">
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(false);
                          setSelectedGarage(null);
                        }}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
} 