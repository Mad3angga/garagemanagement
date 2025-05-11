import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { signIn, signOut, useSession } from 'next-auth/react';

// POST /api/auth/admin/login
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    console.log('Login attempt for:', email);

    // Find admin user
    const { data: admin, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('role', 'admin')
      .single();

    if (error || !admin) {
      console.log('Admin not found:', email);
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    console.log('Admin found:', admin.email);

    // Verify password
    const isValidPassword = await bcrypt.compare(password, admin.password);

    if (!isValidPassword) {
      console.log('Invalid password for:', email);
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    console.log('Password verified for:', email);

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: admin.id,
        email: admin.email,
        role: 'admin'
      },
      process.env.NEXTAUTH_SECRET || 'your-secret-key',
      { expiresIn: '1d' }
    );

    console.log('Token generated for:', email);

    const response = {
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: 'admin'
      }
    };

    console.log('Sending response:', response);

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error during authentication:', error);
    return NextResponse.json(
      { error: 'Error during authentication' },
      { status: 500 }
    );
  }
}

// Sign in
await signIn('credentials', {
  email: 'admin@garagebali.com',
  password: 'admin123',
  redirect: false
});

// Sign out
await signOut();

// Get session
const { data: session } = useSession(); 