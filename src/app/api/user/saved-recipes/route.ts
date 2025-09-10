import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '../../../../lib/auth';
import { getUserSavedRecipes } from '../../../../lib/db';

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const savedRecipes = getUserSavedRecipes(user.id, 'Want to Make');
    
    return NextResponse.json({
      success: true,
      recipes: savedRecipes
    });

  } catch (error) {
    console.error('Get saved recipes error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}