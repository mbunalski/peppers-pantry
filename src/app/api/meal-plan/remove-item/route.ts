import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '../../../../lib/auth';
import { removeMealPlanItem } from '../../../../lib/db';

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { itemId } = await request.json();
    
    if (!itemId) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
    }
    
    // Remove the item from the meal plan
    removeMealPlanItem(itemId);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Item removed from meal plan' 
    });
    
  } catch (error) {
    console.error('Remove meal plan item error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}