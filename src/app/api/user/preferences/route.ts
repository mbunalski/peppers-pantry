import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '../../../../lib/auth';
import { saveUserPreferences, getUserPreferences } from '../../../../lib/db';

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const preferences = getUserPreferences(user.id);
    
    if (!preferences) {
      // Return default preferences if none exist
      return NextResponse.json({
        dietary_restrictions: [],
        budget_per_meal: 15.0,
        max_cooking_time: 30,
        complexity: 'medium',
        allergens: [],
        favorite_cuisines: []
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
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const preferences = await request.json();
    
    // Validate preferences structure
    const validPreferences = {
      dietary_restrictions: Array.isArray(preferences.dietary_restrictions) ? preferences.dietary_restrictions : [],
      budget_per_meal: typeof preferences.budget_per_meal === 'number' ? preferences.budget_per_meal : 15.0,
      max_cooking_time: typeof preferences.max_cooking_time === 'number' ? preferences.max_cooking_time : 30,
      complexity: typeof preferences.complexity === 'string' ? preferences.complexity : 'medium',
      allergens: Array.isArray(preferences.allergens) ? preferences.allergens : [],
      favorite_cuisines: Array.isArray(preferences.favorite_cuisines) ? preferences.favorite_cuisines : []
    };
    
    saveUserPreferences(user.id, validPreferences);
    
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