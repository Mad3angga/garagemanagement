import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/amenities - Get all amenities
export async function GET() {
  try {
    const { data: amenities, error } = await supabase
      .from('amenities')
      .select('*')
      .order('name');

    if (error) throw error;
    return NextResponse.json(amenities);
  } catch (error) {
    console.error('Error fetching amenities:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

// POST /api/amenities - Create a new amenity
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    // Check if amenity already exists
    const { data: existingAmenity } = await supabase
      .from('amenities')
      .select('*')
      .eq('name', name)
      .single();

    if (existingAmenity) {
      return NextResponse.json(
        { error: 'Amenity with this name already exists' },
        { status: 400 }
      );
    }

    // Create the amenity
    const { data: amenity, error } = await supabase
      .from('amenities')
      .insert({
        name,
        description,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(amenity);
  } catch (error) {
    console.error('Error creating amenity:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 