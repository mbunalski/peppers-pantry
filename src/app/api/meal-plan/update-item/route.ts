import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '../../../../lib/auth';
import { updateMealPlanItemDay, getMealPlanItemsByDay } from '../../../../lib/db';

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { itemId, day } = await request.json();
    const newDay = day;
    
    if (!itemId || !newDay) {
      return NextResponse.json({ error: 'Item ID and new day are required' }, { status: 400 });
    }
    
    await updateMealPlanItemDay(itemId, newDay);
    
    return NextResponse.json({ 
      success: true, 
      message: `Meal moved to ${newDay}!` 
    });
    
  } catch (error) {
    console.error('Update meal plan item error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}