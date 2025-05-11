import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/reviews - Get all reviews
export async function GET() {
  try {
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select(`
        *,
        user:users(id, name),
        garage:garages(id, title)
      `);

    if (error) throw error;
    return NextResponse.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

// POST /api/reviews - Create a new review
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { garageId, rating, comment } = body;

    // Validate required fields
    if (!garageId || !rating) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if garage exists
    const { data: garage, error: garageError } = await supabase
      .from('garages')
      .select('*')
      .eq('id', garageId)
      .single();

    if (garageError || !garage) {
      return NextResponse.json(
        { error: 'Garage not found' },
        { status: 404 }
      );
    }

    // Create the review
    const { data: review, error: reviewError } = await supabase
      .from('reviews')
      .insert({
        user_id: session.user.id,
        garage_id: garageId,
        rating,
        comment,
      })
      .select(`
        *,
        user:users(id, name),
        garage:garages(id, title)
      `)
      .single();

    if (reviewError) throw reviewError;

    return NextResponse.json(review);
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 