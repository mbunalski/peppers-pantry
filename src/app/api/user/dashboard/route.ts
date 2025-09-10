import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '../../../../lib/auth';
import { 
  getUserMealPlan, 
  getUserShoppingList, 
  getUserSavedRecipes,
  getRecipeReactions
} from '../../../../lib/db';

// Sample recipe data to get titles - in real app this would come from recipe database
const recipeData: { [key: number]: { title: string; summary: string } } = {
  245: { title: "Tofu Stir-fry", summary: "Quick and healthy vegetarian stir-fry" },
  194: { title: "Bolognese Sauce", summary: "Classic Italian meat sauce" },
  43: { title: "Chicken Alfredo", summary: "Creamy pasta with chicken" },
  129: { title: "World's Best Lasagna", summary: "Layered pasta masterpiece" },
  76: { title: "Thai Green Curry", summary: "Aromatic curry with vegetables" },
  88: { title: "Greek Salad Bowl", summary: "Fresh Mediterranean salad" },
  102: { title: "Beef Tacos", summary: "Seasoned ground beef tacos" },
  156: { title: "Quinoa Buddha Bowl", summary: "Nutritious grain bowl" }
};

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's meal plan
    const mealPlan = getUserMealPlan(user.id);
    
    // Get user's shopping list
    const shoppingList = getUserShoppingList(user.id);
    
    // Get user's saved recipes
    const savedRecipes = getUserSavedRecipes(user.id, 'Want to Make');
    
    // Get user's loved recipes (recipes they reacted to with love)
    // We'll need to query this from the database
    const { getDb } = await import('../../../../lib/db');
    const db = getDb();
    
    const lovedRecipesStmt = db.prepare(`
      SELECT recipe_id FROM recipe_reactions 
      WHERE user_id = ? AND reaction_type = 'love'
      ORDER BY created_at DESC
    `);
    
    const lovedRecipeIds = lovedRecipesStmt.all(user.id);
    
    // Get reaction counts for loved recipes
    const lovedRecipes = await Promise.all(
      lovedRecipeIds.map(async (item: any) => {
        const reactions = getRecipeReactions(item.recipe_id);
        return {
          recipe_id: item.recipe_id,
          title: recipeData[item.recipe_id]?.title || `Recipe ${item.recipe_id}`,
          summary: recipeData[item.recipe_id]?.summary || '',
          reactions
        };
      })
    );

    // Get recipes with details for saved recipes
    const savedRecipesWithDetails = savedRecipes.map(saved => ({
      ...saved,
      title: recipeData[saved.recipe_id]?.title || `Recipe ${saved.recipe_id}`,
      summary: recipeData[saved.recipe_id]?.summary || ''
    }));

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