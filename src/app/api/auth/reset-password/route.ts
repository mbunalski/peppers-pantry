import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '../../../../lib/db';
import { hashPassword } from '../../../../lib/auth';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();
    
    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token and password are required' },
        { status: 400 }
      );
    }
    
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }
    
    // Verify token
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
      
      if (decoded.type !== 'password-reset') {
        throw new Error('Invalid token type');
      }
    } catch (jwtError) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }
    
    const db = getDb();
    
    // Check if token exists and hasn't been used
    const tokenRecord = db.prepare(`
      SELECT * FROM password_reset_tokens 
      WHERE token = ? AND user_id = ? AND used = FALSE AND expires_at > datetime('now')
    `).get(token, decoded.userId);
    
    if (!tokenRecord) {
      return NextResponse.json(
        { error: 'Invalid, expired, or already used reset token' },
        { status: 400 }
      );
    }
    
    // Hash new password
    const passwordHash = await hashPassword(password);
    
    // Update user password
    const updateUserStmt = db.prepare(`
      UPDATE users SET password_hash = ? WHERE id = ?
    `);
    updateUserStmt.run(passwordHash, decoded.userId);
    
    // Mark token as used
    const markUsedStmt = db.prepare(`
      UPDATE password_reset_tokens SET used = TRUE WHERE id = ?
    `);
    markUsedStmt.run(tokenRecord.id);
    
    return NextResponse.json({
      message: 'Password reset successfully. You can now log in with your new password.'
    });
    
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}