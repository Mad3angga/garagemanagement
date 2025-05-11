import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function seed() {
  try {
    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const { data: admin, error: adminError } = await supabase
      .from('users')
      .insert({
        email: 'admin@example.com',
        name: 'Admin User',
        password: adminPassword,
        role: 'admin',
      })
      .select()
      .single();

    if (adminError) throw adminError;
    console.log('Admin user created:', admin);

    // Create regular user
    const userPassword = await bcrypt.hash('user123', 10);
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        email: 'user@example.com',
        name: 'Regular User',
        password: userPassword,
        role: 'user',
      })
      .select()
      .single();

    if (userError) throw userError;
    console.log('Regular user created:', user);

    // Create sample garages
    const garages = await Promise.all([
      supabase
        .from('garages')
        .insert({
          title: 'Kuta Garage Space',
          location: 'Kuta, Bali',
          description: 'A modern and spacious garage in Kuta area, perfect for storing your vehicle. Conveniently located near the beach and shopping centers.',
          price_per_day: 50,
          images: ['/images/garages/kuta-garage.jpg'],
          is_available: true,
        })
        .select()
        .single(),
      supabase
        .from('garages')
        .insert({
          title: 'Seminyak Garage Space',
          location: 'Seminyak, Bali',
          description: 'A secure garage space in the popular Seminyak area with 24/7 surveillance. Close to restaurants and nightlife.',
          price_per_day: 50,
          images: ['/images/garages/seminyak-garage.jpg'],
          is_available: true,
        })
        .select()
        .single(),
      supabase
        .from('garages')
        .insert({
          title: 'Ubud Garage Space',
          location: 'Ubud, Bali',
          description: 'A peaceful garage space in the cultural heart of Bali. Ideal for long-term storage with easy access to Ubud\'s attractions.',
          price_per_day: 50,
          images: ['/images/garages/ubud-garage.jpg'],
          is_available: true,
        })
        .select()
        .single(),
    ]);

    console.log('Sample garages created:', garages);
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

seed(); 