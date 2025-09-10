import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '../../../lib/auth';
import { getUserMealPlan, createShoppingList, getUserShoppingList, ShoppingItem } from '../../../lib/db';

// Sample ingredient data for recipes - in real app this would come from recipe database
const recipeIngredients: { [key: number]: ShoppingItem[] } = {
  245: [ // Tofu Stir-fry
    { ingredient: "Extra firm tofu", amount: "1 block (14 oz)", category: "Protein" },
    { ingredient: "Soy sauce", amount: "3 tablespoons", category: "Condiments" },
    { ingredient: "Honey", amount: "2 tablespoons", category: "Pantry" },
    { ingredient: "Fresh broccoli", amount: "2 cups", category: "Vegetables" },
    { ingredient: "Carrots", amount: "2 medium", category: "Vegetables" },
    { ingredient: "Fresh ginger", amount: "1 inch piece", category: "Produce" },
    { ingredient: "Garlic", amount: "3 cloves", category: "Produce" },
    { ingredient: "Vegetable oil", amount: "2 tablespoons", category: "Pantry" },
    { ingredient: "Sesame oil", amount: "1 teaspoon", category: "Pantry" },
    { ingredient: "Green onions", amount: "2 stalks", category: "Produce" },
    { ingredient: "Sesame seeds", amount: "1 tablespoon", category: "Pantry" }
  ],
  194: [ // Bolognese Sauce
    { ingredient: "Ground beef", amount: "1 lb", category: "Meat" },
    { ingredient: "Crushed tomatoes", amount: "28 oz can", category: "Pantry" },
    { ingredient: "Yellow onion", amount: "1 large", category: "Produce" },
    { ingredient: "Garlic", amount: "4 cloves", category: "Produce" },
    { ingredient: "Red wine", amount: "1/2 cup", category: "Beverages" },
    { ingredient: "Fresh herbs", amount: "2 tbsp", category: "Produce" }
  ],
  43: [ // Chicken Alfredo
    { ingredient: "Chicken breast", amount: "1 lb", category: "Meat" },
    { ingredient: "Fettuccine pasta", amount: "12 oz", category: "Pantry" },
    { ingredient: "Heavy cream", amount: "1 cup", category: "Dairy" },
    { ingredient: "Parmesan cheese", amount: "1 cup", category: "Dairy" },
    { ingredient: "Garlic", amount: "3 cloves", category: "Produce" },
    { ingredient: "Butter", amount: "4 tbsp", category: "Dairy" }
  ],
  76: [ // Thai Green Curry
    { ingredient: "Green curry paste", amount: "3 tbsp", category: "Pantry" },
    { ingredient: "Coconut milk", amount: "14 oz can", category: "Pantry" },
    { ingredient: "Mixed vegetables", amount: "3 cups", category: "Vegetables" },
    { ingredient: "Thai basil", amount: "1/4 cup", category: "Produce" },
    { ingredient: "Lime juice", amount: "2 tbsp", category: "Produce" }
  ],
  88: [ // Greek Salad Bowl
    { ingredient: "Cucumber", amount: "1 large", category: "Produce" },
    { ingredient: "Cherry tomatoes", amount: "2 cups", category: "Produce" },
    { ingredient: "Feta cheese", amount: "4 oz", category: "Dairy" },
    { ingredient: "Kalamata olives", amount: "1/2 cup", category: "Pantry" },
    { ingredient: "Red onion", amount: "1/4 cup", category: "Produce" },
    { ingredient: "Olive oil", amount: "3 tbsp", category: "Pantry" }
  ],
  156: [ // Quinoa Buddha Bowl
    { ingredient: "Quinoa", amount: "1 cup", category: "Pantry" },
    { ingredient: "Sweet potato", amount: "1 large", category: "Produce" },
    { ingredient: "Chickpeas", amount: "1 can", category: "Pantry" },
    { ingredient: "Baby spinach", amount: "2 cups", category: "Produce" },
    { ingredient: "Tahini", amount: "3 tbsp", category: "Pantry" },
    { ingredient: "Lemon juice", amount: "2 tbsp", category: "Produce" }
  ]
};

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const shoppingList = getUserShoppingList(user.id);
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
    const mealPlan = getUserMealPlan(user.id);
    
    if (!mealPlan || mealPlan.items.length === 0) {
      return NextResponse.json({ 
        error: 'No meal plan found. Create a meal plan first to generate a shopping list.' 
      }, { status: 400 });
    }
    
    // Combine all ingredients from meal plan recipes
    const allIngredients: ShoppingItem[] = [];
    const ingredientMap = new Map<string, ShoppingItem>();
    
    mealPlan.items.forEach(item => {
      const ingredients = recipeIngredients[item.recipe_id] || [];
      ingredients.forEach(ingredient => {
        const key = ingredient.ingredient.toLowerCase();
        if (ingredientMap.has(key)) {
          // Ingredient already exists, could combine quantities here
          const existing = ingredientMap.get(key)!;
          existing.amount = `${existing.amount}, ${ingredient.amount}`;
        } else {
          ingredientMap.set(key, { ...ingredient });
        }
      });
    });
    
    const consolidatedIngredients = Array.from(ingredientMap.values());
    
    // Create shopping list
    const shoppingListId = createShoppingList(
      user.id,
      mealPlan.id,
      consolidatedIngredients,
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