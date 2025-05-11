import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// GET /api/garages/[id] - Get a single garage
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { data: garage, error } = await supabase
      .from('garages')
      .select(`
        *,
        amenities:garage_amenities(amenity:amenities(*))
      `)
      .eq('id', params.id)
      .single();

    if (error) throw error;
    if (!garage) {
      return NextResponse.json(
        { error: 'Garage not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(garage);
  } catch (error) {
    console.error('Error fetching garage:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// PATCH /api/garages/[id] - Update a garage
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, description, location, price, images, amenities } = body;

    // Update garage
    const { data: garage, error: garageError } = await supabase
      .from('garages')
      .update({
        title,
        description,
        location,
        price,
        images,
      })
      .eq('id', params.id)
      .select()
      .single();

    if (garageError) throw garageError;

    // Update amenities if provided
    if (amenities) {
      // First, delete existing amenities
      const { error: deleteError } = await supabase
        .from('garage_amenities')
        .delete()
        .eq('garage_id', params.id);

      if (deleteError) throw deleteError;

      // Then, insert new amenities
      const amenityRecords = amenities.map((amenityId: string) => ({
        garage_id: params.id,
        amenity_id: amenityId,
      }));

      const { error: insertError } = await supabase
        .from('garage_amenities')
        .insert(amenityRecords);

      if (insertError) throw insertError;
    }

    // Fetch updated garage with amenities
    const { data: updatedGarage, error: fetchError } = await supabase
      .from('garages')
      .select(`
        *,
        amenities:garage_amenities(amenity:amenities(*))
      `)
      .eq('id', params.id)
      .single();

    if (fetchError) throw fetchError;

    return NextResponse.json(updatedGarage);
  } catch (error) {
    console.error('Error updating garage:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// DELETE /api/garages/[id] - Delete a garage
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Delete garage amenities first
    const { error: amenitiesError } = await supabase
      .from('garage_amenities')
      .delete()
      .eq('garage_id', params.id);

    if (amenitiesError) throw amenitiesError;

    // Delete garage
    const { error: garageError } = await supabase
      .from('garages')
      .delete()
      .eq('id', params.id);

    if (garageError) throw garageError;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting garage:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 