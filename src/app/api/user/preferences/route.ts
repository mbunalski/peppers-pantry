import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '../../../../lib/auth';
import { saveUserPreferences, getUserPreferences } from '../../../../lib/db';

export async function GET(request: NextRequest) {
  try {
    console.log('GET preferences called');
    const user = getUserFromRequest(request);
    if (!user) {
      console.log('Unauthorized request - no user');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    console.log('Getting preferences for user:', user.id);
    const preferences = await getUserPreferences(user.id);
    console.log('Retrieved preferences:', preferences);
    
    if (!preferences) {
      // Return default preferences if none exist
      return NextResponse.json({
        dietary_restrictions: [],
        budget_per_meal: 15.0,
        max_cooking_time: 30,
        complexity: 'medium',
        allergens: [],
        favorite_cuisines: [],
        meals_per_week: 7
      });
    }
    
    return NextResponse.json(preferences);
    
  } catch (error) {
    console.error('Get preferences error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('POST preferences called');
    const user = getUserFromRequest(request);
    if (!user) {
      console.log('Unauthorized request - no user');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const preferences = await request.json();
    console.log('Received preferences:', preferences);
    
    // Validate preferences structure
    const validPreferences = {
      dietary_restrictions: Array.isArray(preferences.dietary_restrictions) ? preferences.dietary_restrictions : [],
      budget_per_meal: typeof preferences.budget_per_meal === 'number' ? preferences.budget_per_meal : 15.0,
      max_cooking_time: typeof preferences.max_cooking_time === 'number' ? preferences.max_cooking_time : 30,
      complexity: typeof preferences.complexity === 'string' ? preferences.complexity : 'medium',
      allergens: Array.isArray(preferences.allergens) ? preferences.allergens : [],
      favorite_cuisines: Array.isArray(preferences.favorite_cuisines) ? preferences.favorite_cuisines : [],
      meals_per_week: typeof preferences.meals_per_week === 'number' ? preferences.meals_per_week : 7
    };
    
    console.log('Saving preferences for user:', user.id, validPreferences);
    await saveUserPreferences(user.id, validPreferences);
    console.log('Preferences saved successfully');
    
    return NextResponse.json({
      message: 'Preferences saved successfully',
      preferences: validPreferences
    });
    
  } catch (error) {
    console.error('Save preferences error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}