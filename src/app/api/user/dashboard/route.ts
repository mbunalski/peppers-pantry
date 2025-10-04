import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '../../../../lib/auth';
import {
  getUserMealPlan,
  getUserShoppingList,
  getUserSavedRecipes,
  getRecipeReactions,
  getRecipeById
} from '../../../../lib/db';

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's meal plan
    const mealPlan = await getUserMealPlan(user.id);

    // Get user's shopping list
    const shoppingList = await getUserShoppingList(user.id);

    // Get user's saved recipes
    const savedRecipes = await getUserSavedRecipes(user.id, 'Want to Make');
    
    // Get user's loved recipes (recipes they reacted to with love)
    const { getDb } = await import('../../../../lib/db');
    const db = await getDb();

    const lovedRecipeIds = await db.query(`
      SELECT recipe_id FROM recipe_reactions
      WHERE user_id = $1 AND reaction_type = 'love'
      ORDER BY created_at DESC
    `, [user.id]);
    
    // Get reaction counts for loved recipes
    const lovedRecipes = await Promise.all(
      lovedRecipeIds.rows.map(async (item: any) => {
        const reactions = await getRecipeReactions(item.recipe_id);
        const recipeData = await getRecipeById(item.recipe_id);
        return {
          recipe_id: item.recipe_id,
          title: recipeData?.title || recipeData?.name || `Recipe ${item.recipe_id}`,
          summary: recipeData?.summary || recipeData?.description || '',
          image_url: recipeData?.image_url,
          s3_thumbnail_url: recipeData?.s3_thumbnail_url,
          s3_medium_url: recipeData?.s3_medium_url,
          reactions
        };
      })
    );

    // Get recipes with details for saved recipes
    const savedRecipesWithDetails = await Promise.all(
      savedRecipes.map(async (saved) => {
        const recipeData = await getRecipeById(saved.recipe_id);
        return {
          ...saved,
          title: recipeData?.title || recipeData?.name || `Recipe ${saved.recipe_id}`,
          summary: recipeData?.summary || recipeData?.description || '',
          image_url: recipeData?.image_url,
          s3_thumbnail_url: recipeData?.s3_thumbnail_url,
          s3_medium_url: recipeData?.s3_medium_url
        };
      })
    );

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      mealPlan,
      shoppingList,
      savedRecipes: savedRecipesWithDetails,
      lovedRecipes,
      stats: {
        totalSavedRecipes: savedRecipes.length,
        totalLovedRecipes: lovedRecipes.length,
        hasMealPlan: !!mealPlan,
        hasShoppingList: !!shoppingList
      }
    });

  } catch (error) {
    console.error('Get user dashboard error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}