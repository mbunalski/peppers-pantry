import { NextRequest, NextResponse } from 'next/server';
import { createUser, getUserByEmail } from '../../../../lib/db';
import { hashPassword, createToken } from '../../../../lib/auth';
import { sendEmail, getWelcomeEmailTemplate } from '../../../../lib/email';

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
    
    // Send welcome email (don't block registration if email fails)
    try {
      const { subject, html, text } = getWelcomeEmailTemplate(name);
      await sendEmail({
        to: email,
        subject,
        htmlContent: html,
        textContent: text
      });
      console.log('Welcome email sent to:', email);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Don't fail registration if email fails
    }
    
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