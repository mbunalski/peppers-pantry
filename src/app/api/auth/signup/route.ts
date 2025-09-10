import { NextRequest, NextResponse } from 'next/server';
import { createUser, getUserByEmail } from '../../../../lib/db';
import { hashPassword, createToken } from '../../../../lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();
    
    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }
    
    // Check if user already exists
    const existingUser = getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }
    
    // Hash password and create user
    const passwordHash = await hashPassword(password);
    const user = createUser(email, name, passwordHash);
    
    // Create JWT token
    const token = createToken(user);
    
    return NextResponse.json({
      message: 'User created successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      token
    });
    
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}