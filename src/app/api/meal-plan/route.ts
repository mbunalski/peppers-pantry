import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '../../../lib/auth';
import { getUserMealPlan, createMealPlan, clearMealPlan, addRecipeToMealPlan } from '../../../lib/db';

// Sample recipes data - in real app this would come from AWS Lambda
const sampleRecipes = [
  { id: 245, title: "Tofu Stir-fry", cuisine: "Asian", dietary: ["vegetarian", "vegan"] },
  { id: 194, title: "Bolognese Sauce", cuisine: "Italian", dietary: [] },
  { id: 43, title: "Chicken Alfredo", cuisine: "Italian", dietary: [] },
  { id: 129, title: "World's Best Lasagna", cuisine: "Italian", dietary: [] },
  { id: 76, title: "Thai Green Curry", cuisine: "Thai", dietary: ["vegetarian"] },
  { id: 88, title: "Greek Salad Bowl", cuisine: "Mediterranean", dietary: ["vegetarian"] },
  { id: 102, title: "Beef Tacos", cuisine: "Mexican", dietary: [] },
  { id: 156, title: "Quinoa Buddha Bowl", cuisine: "American", dietary: ["vegetarian", "vegan"] }
];

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const mealPlan = getUserMealPlan(user.id);
    
    if (!mealPlan) {
      return NextResponse.json({ items: [] });
    }
    
    return NextResponse.json({
      id: mealPlan.id,
      name: mealPlan.name,
      items: mealPlan.items.map(item => ({
        id: item.id,
        day: item.day_of_week,
        meal: item.recipe_title,
        recipeId: item.recipe_id
      }))
    });
    
  } catch (error) {
    console.error('Get meal plan error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { action, recipeId, dayOfWeek } = await request.json();
    
    if (action === 'generate') {
      // Get or create meal plan
      let mealPlan = getUserMealPlan(user.id);
      let mealPlanId: string;
      
      if (mealPlan) {
        // Clear existing meal plan
        clearMealPlan(mealPlan.id);
        mealPlanId = mealPlan.id;
      } else {
        // Create new meal plan
        mealPlanId = createMealPlan(user.id, 'Weekly Meal Plan');
      }
      
      // Generate a new meal plan with sample recipes
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      const shuffledRecipes = [...sampleRecipes].sort(() => Math.random() - 0.5);
      
      days.forEach((day, index) => {
        const recipe = shuffledRecipes[index % shuffledRecipes.length];
        addRecipeToMealPlan(mealPlanId, recipe.id, recipe.title, day);
      });
      
      // Return the new meal plan
      const newMealPlan = getUserMealPlan(user.id);
      return NextResponse.json({
        success: true,
        mealPlan: {
          id: newMealPlan!.id,
          name: newMealPlan!.name,
          items: newMealPlan!.items.map(item => ({
            id: item.id,
            day: item.day_of_week,
            meal: item.recipe_title,
            recipeId: item.recipe_id
          }))
        }
      });
      
    } else if (action === 'add' && recipeId && dayOfWeek) {
      // Add a specific recipe to meal plan
      let mealPlan = getUserMealPlan(user.id);
      let mealPlanId: string;
      
      if (!mealPlan) {
        mealPlanId = createMealPlan(user.id, 'My Meal Plan');
      } else {
        mealPlanId = mealPlan.id;
      }
      
      const recipe = sampleRecipes.find(r => r.id === recipeId);
      if (!recipe) {
        return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
      }
      
      addRecipeToMealPlan(mealPlanId, recipe.id, recipe.title, dayOfWeek);
      
      return NextResponse.json({ success: true, message: 'Recipe added to meal plan' });
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    
  } catch (error) {
    console.error('Meal plan error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}