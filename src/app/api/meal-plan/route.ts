import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '../../../lib/auth';
import { getUserMealPlan, createMealPlan, clearMealPlan, addRecipeToMealPlan, getAllRecipes, getRecipeById, getUserPreferences } from '../../../lib/db';

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const mealPlan = await getUserMealPlan(user.id);
    
    if (!mealPlan) {
      return NextResponse.json({ items: [] });
    }
    
    return NextResponse.json({
      id: mealPlan.id,
      name: mealPlan.name,
      items: (mealPlan.items || []).map(item => ({
        id: item.id,
        day_of_week: item.day_of_week,
        recipe_title: item.recipe_title,
        recipe_id: item.recipe_id,
        image_url: item.image_url,
        s3_medium_url: item.s3_medium_url
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
      // Get user preferences to determine how many meals to generate
      const userPrefs = await getUserPreferences(user.id);
      const mealsPerWeek = userPrefs?.meals_per_week || 7;
      
      // Get or create meal plan
      let mealPlan = await getUserMealPlan(user.id);
      let mealPlanId: string;
      
      if (mealPlan) {
        // Clear existing meal plan
        await clearMealPlan(mealPlan.id);
        mealPlanId = mealPlan.id;
      } else {
        // Create new meal plan
        mealPlanId = await createMealPlan(user.id, 'Weekly Meal Plan');
      }
      
      // Get random recipes from database for meal plan generation
      const allRecipes = await getAllRecipes();

      if (allRecipes.length === 0) {
        return NextResponse.json({ error: 'No recipes available for meal planning' }, { status: 400 });
      }

      // Filter recipes based on user preferences if available
      let availableRecipes = allRecipes;
      if (userPrefs) {
        availableRecipes = allRecipes.filter(recipe => {
          // Filter by dietary restrictions
          if (userPrefs.dietary_restrictions && userPrefs.dietary_restrictions.length > 0) {
            const recipeTags = recipe.tags || [];
            const recipeTagsLower = recipeTags.map(t => t.toLowerCase());

            // Check if recipe matches dietary restrictions
            const matchesDietary = userPrefs.dietary_restrictions.some(diet => {
              if (diet === 'vegetarian') {
                return recipeTagsLower.includes('vegetarian') || recipeTagsLower.includes('veggie');
              }
              if (diet === 'vegan') {
                return recipeTagsLower.includes('vegan');
              }
              if (diet === 'gluten-free') {
                return recipeTagsLower.includes('gluten-free') || recipeTagsLower.includes('gluten free');
              }
              return recipeTagsLower.includes(diet.toLowerCase());
            });

            // For omnivore, include everything
            if (userPrefs.dietary_restrictions.includes('omnivore')) {
              return true;
            }

            return matchesDietary;
          }

          // Filter by cooking time if specified
          if (userPrefs.max_cooking_time && recipe.total_time_minutes) {
            return recipe.total_time_minutes <= userPrefs.max_cooking_time;
          }

          return true;
        });
      }

      // If filtering resulted in too few recipes, use all recipes
      if (availableRecipes.length < mealsPerWeek) {
        availableRecipes = allRecipes;
      }

      // Shuffle and select recipes
      const shuffledRecipes = [...availableRecipes].sort(() => Math.random() - 0.5);
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

      // Add recipes to specific days based on user preference
      const mealsToGenerate = Math.min(mealsPerWeek, days.length);

      for (let i = 0; i < mealsToGenerate; i++) {
        const day = days[i]; // Always use specific days for generation
        const recipe = shuffledRecipes[i % shuffledRecipes.length];
        await addRecipeToMealPlan(mealPlanId, parseInt(recipe.id), recipe.title, day);
      }
      
      // Return the new meal plan
      const newMealPlan = await getUserMealPlan(user.id);
      return NextResponse.json({
        success: true,
        mealPlan: {
          id: newMealPlan!.id,
          name: newMealPlan!.name,
          items: (newMealPlan!.items || []).map(item => ({
            id: item.id,
            day_of_week: item.day_of_week,
            recipe_title: item.recipe_title,
            recipe_id: item.recipe_id,
            image_url: item.image_url,
            s3_medium_url: item.s3_medium_url
          }))
        }
      });
      
    } else if (action === 'add' && recipeId && dayOfWeek) {
      // Add a specific recipe to meal plan
      let mealPlan = await getUserMealPlan(user.id);
      let mealPlanId: string;
      
      if (!mealPlan) {
        mealPlanId = await createMealPlan(user.id, 'My Meal Plan');
      } else {
        mealPlanId = mealPlan.id;
      }
      
      const recipe = await getRecipeById(recipeId);
      if (!recipe) {
        return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
      }

      await addRecipeToMealPlan(mealPlanId, parseInt(recipe.id), recipe.title, dayOfWeek);
      
      return NextResponse.json({ success: true, message: 'Recipe added to meal plan' });
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    
  } catch (error) {
    console.error('Meal plan error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}