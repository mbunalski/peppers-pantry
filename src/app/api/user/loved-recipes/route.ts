import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '../../../../lib/auth';
import { getDb } from '../../../../lib/db';

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDb();
    
    // Get recipes the user has reacted to with 'love'
    const lovedRecipes = db.prepare(`
      SELECT recipe_id, created_at
      FROM recipe_reactions 
      WHERE user_id = ? AND reaction_type = 'love'
      ORDER BY created_at DESC
    `).all(user.id);
    
    return NextResponse.json({
      success: true,
      recipes: lovedRecipes
    });

  } catch (error) {
    console.error('Get loved recipes error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}