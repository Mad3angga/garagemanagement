import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import dayjs from 'dayjs';

// GET /api/bookings - Get all bookings
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: bookings, error } = await supabase
      .from('bookings')
      .select(`
        *,
        user:users(id, name, email, phone),
        garage:garages(id, title, location)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

// POST /api/bookings - Create a new booking
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    let { userId, garageId, startDate, endDate, status } = body;
    const isAdmin = session.user.isAdmin;
    if (!isAdmin) {
      userId = session.user.id; // force to current user
    }

    // Validate required fields
    if (!userId || !garageId || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get garage price
    const { data: garage, error: garageError } = await supabase
      .from('garages')
      .select('price_per_month')
      .eq('id', garageId)
      .single();

    if (garageError) {
      console.error('Error fetching garage:', garageError);
      throw garageError;
    }

    if (!garage || garage.price_per_month == null) {
      console.error('Garage not found or missing price:', { garageId, garage });
      return NextResponse.json(
        { error: 'Garage does not have a price_per_month set.' },
        { status: 400 }
      );
    }

    // Calculate total price
    const months = dayjs(endDate).diff(dayjs(startDate), 'month', true);
    const totalPrice = Math.ceil(months) * (garage.price_per_month || 0);

    // Determine booking status
    let bookingStatus = status;
    if (!bookingStatus) {
      bookingStatus = isAdmin ? 'approved' : 'pending';
    }

    // Log the payload being sent to Supabase
    console.log('Booking insert payload:', {
      user_id: userId,
      garage_id: garageId,
      start_date: startDate,
      end_date: endDate,
      status: bookingStatus,
      total_price: totalPrice
    });

    // Create booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        user_id: userId,
        garage_id: garageId,
        start_date: startDate,
        end_date: endDate,
        status: bookingStatus,
        total_price: totalPrice
      })
      .select(`
        *,
        user:users(id, name, email, phone),
        garage:garages(id, title, location)
      `)
      .single();

    if (bookingError) {
      console.error('Error creating booking:', bookingError);
      throw bookingError;
    }

    return NextResponse.json(booking);
  } catch (error) {
    console.error('Full error in POST /api/bookings:', error);
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
} 