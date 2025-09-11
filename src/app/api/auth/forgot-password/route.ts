import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail, getDb } from '../../../../lib/db';
import { sendEmail, getPasswordResetEmailTemplate } from '../../../../lib/email';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }
    
    // Check if user exists
    const user = getUserByEmail(email);
    if (!user) {
      // Don't reveal whether user exists or not for security
      return NextResponse.json({
        message: 'If an account with that email exists, we have sent a password reset link.'
      });
    }
    
    // Create reset token (expires in 1 hour)
    const resetToken = jwt.sign(
      { userId: user.id, email: user.email, type: 'password-reset' },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    // Store reset token in database
    const db = getDb();
    try {
      db.exec(`
        CREATE TABLE IF NOT EXISTS password_reset_tokens (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          token TEXT NOT NULL,
          expires_at DATETIME NOT NULL,
          used BOOLEAN DEFAULT FALSE,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id)
        )
      `);
      
      const stmt = db.prepare(`
        INSERT INTO password_reset_tokens (id, user_id, token, expires_at)
        VALUES (?, ?, ?, datetime('now', '+1 hour'))
      `);
      stmt.run(crypto.randomUUID(), user.id, resetToken);
    } catch (dbError) {
      console.error('Database error storing reset token:', dbError);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
    
    // Send password reset email
    try {
      const { subject, html, text } = getPasswordResetEmailTemplate(user.name, resetToken);
      await sendEmail({
        to: email,
        subject,
        htmlContent: html,
        textContent: text
      });
      console.log('Password reset email sent to:', email);
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      return NextResponse.json(
        { error: 'Failed to send password reset email' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      message: 'If an account with that email exists, we have sent a password reset link.'
    });
    
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}