import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '../../../lib/auth';
import { getUserMealPlan, createShoppingList, getUserShoppingList, getRecipeIngredients, updateShoppingListItem, deleteShoppingListItem, ShoppingItem } from '../../../lib/db';


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
          // Clean and normalize ingredient name
          const cleanName = cleanIngredientName(dbIngredient.name);

          // Skip salt, pepper, and vague items
          // if (shouldSkipIngredient(cleanName)) {
          //   return;
          // }

          const normalizedKey = normalizeIngredientKey(cleanName);

          // Clean amount (remove prices and extra text)
          const cleanAmountStr = cleanAmount(dbIngredient.raw, dbIngredient.qty, dbIngredient.unit);

          // Create shopping item from database ingredient
          const shoppingItem: ShoppingItem = {
            ingredient: cleanName,
            amount: cleanAmountStr,
            category: categorizeIngredient(cleanName)
          };

          if (ingredientMap.has(normalizedKey)) {
            // Ingredient already exists, combine amounts
            const existing = ingredientMap.get(normalizedKey)!;
            existing.amount = `${existing.amount} + ${cleanAmountStr}`;
          } else {
            ingredientMap.set(normalizedKey, shoppingItem);
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

export async function PUT(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { shoppingListId, itemIndex, updatedItem } = await request.json();

    if (!shoppingListId || itemIndex === undefined || !updatedItem) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await updateShoppingListItem(shoppingListId, itemIndex, updatedItem);

    return NextResponse.json({
      success: true,
      message: 'Shopping list item updated successfully!'
    });

  } catch (error) {
    console.error('Update shopping list item error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { shoppingListId, itemIndex } = await request.json();

    if (!shoppingListId || itemIndex === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await deleteShoppingListItem(shoppingListId, itemIndex);

    return NextResponse.json({
      success: true,
      message: 'Shopping list item deleted successfully!'
    });

  } catch (error) {
    console.error('Delete shopping list item error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper function to clean ingredient names
function cleanIngredientName(name: string): string {
  if (!name) return '';

  // Remove weird characters at the beginning (¼, /, etc.)
  let cleaned = name.replace(/^[^a-zA-Z]*/, '');

  // Capitalize first letter
  cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);

  return cleaned.trim();
}

// Helper function to skip ingredients we don't want on shopping lists
function shouldSkipIngredient(name: string): boolean {
  if (!name) return true;

  const lower = name.toLowerCase();

  // Skip salt, pepper, and vague cooking items
  if (lower.includes('salt') || lower.includes('pepper') ||
      lower === 'cooking oil' || lower === 'oil' ||
      lower.includes('water')) {
    return true;
  }

  return false;
}

// Helper function to normalize ingredient names for combining (conservative approach)
function normalizeIngredientKey(name: string): string {
  if (!name) return '';

  let normalized = name.toLowerCase().trim();

  // Only combine very similar items, keep important differences
  // Remove minor descriptors that don't affect shopping
  normalized = normalized
    .replace(/\b(fresh|dried)\b/g, '') // fresh vs dried doesn't matter for shopping
    .replace(/\b(chopped|diced|minced|sliced)\b/g, '') // prep method doesn't matter for shopping
    .replace(/\s+/g, ' ')
    .trim();

  return normalized;
}

// Helper function to clean amounts (remove prices and extra text)
function cleanAmount(raw: string | null, qty: number | null, unit: string | null): string {
  if (raw) {
    // Remove price information in parentheses
    let cleaned = raw.replace(/\([^)]*\$[^)]*\)/g, '');

    // Remove extra descriptive text after commas
    cleaned = cleaned.split(',')[0];

    // Extract just the quantity/measurement part (before the ingredient name)
    // Example: "2 tablespoons extra virgin olive oil" -> "2 tablespoons"
    const words = cleaned.trim().split(' ');
    const quantityParts = [];

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      // Stop when we hit what looks like an ingredient name (not a number, fraction, or unit)
      if (i > 0 && !isQuantityOrUnit(word)) {
        break;
      }
      quantityParts.push(word);
    }

    const result = quantityParts.join(' ').trim();
    if (result) return result;
  }

  // Fallback to qty + unit
  const qtyStr = qty ? qty.toString() : '';
  const unitStr = unit || '';
  return `${qtyStr} ${unitStr}`.trim();
}

// Helper function to check if a word is likely a quantity or unit
function isQuantityOrUnit(word: string): boolean {
  const lower = word.toLowerCase();

  // Numbers and fractions
  if (/^[\d\/½¼¾]+$/.test(word)) return true;

  // Common units
  const units = [
    'cup', 'cups', 'tsp', 'teaspoon', 'teaspoons', 'tbsp', 'tablespoon', 'tablespoons',
    'oz', 'ounce', 'ounces', 'lb', 'pound', 'pounds', 'gram', 'grams', 'kg', 'kilogram',
    'liter', 'liters', 'ml', 'milliliter', 'quart', 'quarts', 'pint', 'pints',
    'can', 'cans', 'jar', 'jars', 'bottle', 'bottles', 'package', 'packages',
    'clove', 'cloves', 'head', 'heads', 'bunch', 'bunches', 'piece', 'pieces',
    'slice', 'slices', 'strip', 'strips', 'inch', 'inches'
  ];

  return units.includes(lower);
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