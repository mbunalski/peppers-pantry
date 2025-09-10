import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '../../../../lib/auth';
import { getUserMealPlan, createMealPlan, addRecipeToMealPlan } from '../../../../lib/db';

const sampleRecipes = [
  { id: 245, title: "Tofu Stir-fry" },
  { id: 194, title: "Bolognese Sauce" },
  { id: 43, title: "Chicken Alfredo" },
  { id: 129, title: "World's Best Lasagna" },
  { id: 76, title: "Thai Green Curry" },
  { id: 88, title: "Greek Salad Bowl" },
  { id: 102, title: "Beef Tacos" },
  { id: 156, title: "Quinoa Buddha Bowl" }
];

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
    
    // Find the recipe
    const recipe = sampleRecipes.find(r => r.id === recipeId);
    if (!recipe) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }
    
    // Get or create meal plan
    let mealPlan = getUserMealPlan(user.id);
    let mealPlanId: string;
    
    if (!mealPlan) {
      mealPlanId = createMealPlan(user.id, 'My Meal Plan');
    } else {
      mealPlanId = mealPlan.id;
    }
    
    // Use provided day or default to next available day
    const defaultDay = dayOfWeek || 'Monday';
    
    addRecipeToMealPlan(mealPlanId, recipe.id, recipe.title, defaultDay);
    
    return NextResponse.json({ 
      success: true, 
      message: `${recipe.title} added to your meal plan for ${defaultDay}!` 
    });
    
  } catch (error) {
    console.error('Add recipe to meal plan error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}