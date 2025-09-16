import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '../../../../lib/auth';
import { getUserMealPlan, createMealPlan, addRecipeToMealPlan, getRecipeById } from '../../../../lib/db';

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { recipeId, dayOfWeek } = await request.json();
    
    if (!recipeId) {
      return NextResponse.json({ error: 'Recipe ID is required' }, { status: 400 });
    }
    
    // Find the recipe in database
    const recipe = await getRecipeById(recipeId);
    if (!recipe) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }
    
    // Get or create meal plan
    let mealPlan = await getUserMealPlan(user.id);
    let mealPlanId: string;
    
    if (!mealPlan) {
      mealPlanId = await createMealPlan(user.id, 'My Meal Plan');
    } else {
      mealPlanId = mealPlan.id;
    }
    
    // Use provided day or default to TBD
    const defaultDay = dayOfWeek || 'TBD';
    
    await addRecipeToMealPlan(mealPlanId, parseInt(recipe.id), recipe.title, defaultDay);

    return NextResponse.json({
      success: true,
      message: `${recipe.title} added to your meal plan for ${defaultDay}!`
    });
    
  } catch (error) {
    console.error('Add recipe to meal plan error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}