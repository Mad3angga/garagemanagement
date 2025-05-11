import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/slots - Get available slots
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'Start date and end date are required' },
        { status: 400 }
      );
    }

    // Get all garages
    const { data: garages, error: garagesError } = await supabase
      .from('garages')
      .select('*');

    if (garagesError) {
      console.error('Garages error:', garagesError);
      return NextResponse.json(
        { error: 'Error fetching garages', details: garagesError.message },
        { status: 500 }
      );
    }

    // Get bookings for the date range
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('*')
      .or(`start_date.lte.${endDate},end_date.gte.${startDate}`)
      .eq('status', 'approved');

    if (bookingsError) {
      console.error('Bookings error:', bookingsError);
      return NextResponse.json(
        { error: 'Error fetching bookings', details: bookingsError.message },
        { status: 500 }
      );
    }

    // Map garages to include activeBookings count
    const garagesWithActiveBookings = garages?.map(garage => {
      const activeBookings = bookings?.filter(b => b.garage_id === garage.id).length || 0;
      return { ...garage, activeBookings };
    });

    return NextResponse.json(garagesWithActiveBookings);
  } catch (error) {
    console.error('Error fetching available slots:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 