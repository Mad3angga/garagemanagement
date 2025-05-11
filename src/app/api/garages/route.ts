import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/garages - Get all garages
export async function GET() {
  try {
    const { data: garages, error } = await supabase
      .from('garages')
      .select(`
        *,
        amenities:garage_amenities(
          amenity:amenities(*)
        )
      `);

    if (error) throw error;
    return NextResponse.json(garages);
  } catch (error) {
    console.error('Error fetching garages:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

// POST /api/garages - Create a new garage
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, pricePerDay, location, images, amenities } = body;

    const { data: garage, error } = await supabase
      .from('garages')
      .insert({
        title,
        description,
        price_per_day: pricePerDay,
        location,
        images: images || [],
        is_available: true,
      })
      .select()
      .single();

    if (error) throw error;

    // Add amenities if provided
    if (amenities?.length > 0) {
      const amenityLinks = amenities.map((amenityId: string) => ({
        garage_id: garage.id,
        amenity_id: amenityId,
      }));

      const { error: amenityError } = await supabase
        .from('garage_amenities')
        .insert(amenityLinks);

      if (amenityError) throw amenityError;
    }

    // Fetch the complete garage with amenities
    const { data: completeGarage, error: fetchError } = await supabase
      .from('garages')
      .select(`
        *,
        amenities:garage_amenities(
          amenity:amenities(*)
        )
      `)
      .eq('id', garage.id)
      .single();

    if (fetchError) throw fetchError;

    return NextResponse.json(completeGarage);
  } catch (error) {
    console.error('Error creating garage:', error);
    return NextResponse.json({ error: 'Error creating garage' }, { status: 500 });
  }
} 