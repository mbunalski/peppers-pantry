import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail } from '../../../../lib/db';
import { verifyPassword, createToken } from '../../../../lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    console.log('Login attempt for email:', email);
    
    // Validate input
    if (!email || !password) {
      console.log('Missing email or password');
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    // Get user from database
    const user = getUserByEmail(email);
    console.log('User found:', user ? 'Yes' : 'No');
    if (!user) {
      console.log('User not found in database');
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }
    
    console.log('User details:', { id: user.id, email: user.email, name: user.name });
    console.log('Password hash exists:', !!user.password_hash);
    
    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password_hash);
    console.log('Password valid:', isPasswordValid);
    if (!isPasswordValid) {
      console.log('Password verification failed');
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }
    
    // Create JWT token
    const token = createToken({
      id: user.id,
      email: user.email,
      name: user.name,
      created_at: user.created_at
    });
    
    return NextResponse.json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      token
    });
    
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}