import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '../../../lib/auth';
import { getUserMealPlan, createShoppingList, getUserShoppingList, getRecipeIngredients, ShoppingItem } from '../../../lib/db';


export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const shoppingList = await getUserShoppingList(user.id);
    return NextResponse.json({ shoppingList });
    
  } catch (error) {
    console.error('Get shopping list error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's current meal plan
    const mealPlan = await getUserMealPlan(user.id);

    if (!mealPlan || mealPlan.items.length === 0) {
      return NextResponse.json({
        error: 'No meal plan found. Create a meal plan first to generate a shopping list.'
      }, { status: 400 });
    }

    // Combine all ingredients from meal plan recipes using database
    const ingredientMap = new Map<string, ShoppingItem>();

    // Process each recipe in the meal plan
    for (const item of mealPlan.items) {
      try {
        const recipeIngredients = await getRecipeIngredients(item.recipe_id);

        recipeIngredients.forEach(dbIngredient => {
          const key = dbIngredient.name.toLowerCase();

          // Create shopping item from database ingredient
          const shoppingItem: ShoppingItem = {
            ingredient: dbIngredient.name,
            amount: dbIngredient.raw || `${dbIngredient.qty || ''} ${dbIngredient.unit || ''}`.trim(),
            category: categorizeIngredient(dbIngredient.name)
          };

          if (ingredientMap.has(key)) {
            // Ingredient already exists, combine amounts
            const existing = ingredientMap.get(key)!;
            existing.amount = `${existing.amount}, ${shoppingItem.amount}`;
          } else {
            ingredientMap.set(key, shoppingItem);
          }
        });
      } catch (error) {
        console.error(`Error getting ingredients for recipe ${item.recipe_id}:`, error);
        // Continue with other recipes even if one fails
      }
    }

    const consolidatedIngredients = Array.from(ingredientMap.values());

    // Create shopping list
    const shoppingListId = await createShoppingList(
      user.id,
      consolidatedIngredients,
      mealPlan.id,
      `Shopping List - ${new Date().toLocaleDateString()}`
    );

    return NextResponse.json({
      success: true,
      shoppingListId,
      items: consolidatedIngredients,
      message: 'Shopping list generated successfully!'
    });

  } catch (error) {
    console.error('Generate shopping list error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper function to categorize ingredients
function categorizeIngredient(ingredientName: string): string {
  const name = ingredientName.toLowerCase();

  // Produce
  if (name.includes('onion') || name.includes('garlic') || name.includes('tomato') ||
      name.includes('pepper') || name.includes('lettuce') || name.includes('spinach') ||
      name.includes('carrot') || name.includes('celery') || name.includes('potato') ||
      name.includes('broccoli') || name.includes('mushroom') || name.includes('herb')) {
    return 'Produce';
  }

  // Meat & Protein
  if (name.includes('chicken') || name.includes('beef') || name.includes('pork') ||
      name.includes('fish') || name.includes('tofu') || name.includes('egg') ||
      name.includes('turkey') || name.includes('salmon') || name.includes('shrimp')) {
    return 'Meat & Protein';
  }

  // Dairy
  if (name.includes('milk') || name.includes('cheese') || name.includes('butter') ||
      name.includes('cream') || name.includes('yogurt') || name.includes('sour cream')) {
    return 'Dairy';
  }

  // Pantry
  if (name.includes('oil') || name.includes('vinegar') || name.includes('sauce') ||
      name.includes('flour') || name.includes('sugar') || name.includes('rice') ||
      name.includes('pasta') || name.includes('bread') || name.includes('cereal') ||
      name.includes('beans') || name.includes('lentils') || name.includes('quinoa')) {
    return 'Pantry';
  }

  // Default
  return 'Pantry';
}