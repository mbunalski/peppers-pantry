import { NextRequest, NextResponse } from 'next/server';
import { getRecipeById, getRecipeIngredients, getRecipeSteps } from '../../../../lib/db';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const recipeId = parseInt(resolvedParams.id);

    if (isNaN(recipeId)) {
      return NextResponse.json({ error: 'Invalid recipe ID' }, { status: 400 });
    }

    const recipe = await getRecipeById(recipeId);

    if (!recipe) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }

    // Get ingredients and steps from database
    const [dbIngredients, dbSteps] = await Promise.all([
      getRecipeIngredients(recipeId),
      getRecipeSteps(recipeId)
    ]);

    // Format recipe data for the frontend
    const formattedRecipe = {
      id: parseInt(recipe.id),
      title: recipe.title,
      time: recipe.total_time_minutes || 0,
      servings: recipe.servings || '4',
      difficulty: getDifficultyFromTags(recipe.tags),
      cuisine: getCuisineFromTags(recipe.tags),
      dietary: getDietaryFromTags(recipe.tags),
      summary: recipe.summary || '',
      description: recipe.summary || '', // Use summary as description for now
      source: recipe.source_domain || 'Unknown',
      url: recipe.source_url || '#',
      calories: recipe.calories,
      macros: recipe.macros,
      image: recipe.image_url,
      author: recipe.author,

      // Create structured data from tags
      nutrition: {
        calories: recipe.calories || 0,
        protein: recipe.macros?.protein || 0,
        carbs: recipe.macros?.carbs || 0,
        fat: recipe.macros?.fat || 0,
        fiber: 0 // Not available in database
      },

      // Use database ingredients
      ingredients: dbIngredients.map(ingredient => ({
        item: ingredient.name,
        amount: ingredient.raw || `${ingredient.qty || ''} ${ingredient.unit || ''}`.trim(),
        notes: ingredient.notes || ''
      })),

      // Use database steps, with fallback
      instructions: dbSteps.length > 0
        ? dbSteps.map(step => step.text)
        : [
            'Prepare all ingredients according to the ingredient list.',
            'Follow cooking method appropriate for this cuisine type.',
            'Cook according to the specified time and servings.',
            'Serve and enjoy!'
          ],

      tips: [
        'Check the original recipe source for detailed instructions.',
        'Adjust seasoning to your taste.',
        'Store leftovers properly in the refrigerator.'
      ]
    };

    return NextResponse.json({
      success: true,
      recipe: formattedRecipe
    });

  } catch (error) {
    console.error('Get recipe by ID error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper functions (same as in main recipes route)
function getDifficultyFromTags(tags: string[]): string {
  if (!tags || !Array.isArray(tags)) return 'Medium';

  const tagsLower = tags.map(t => t.toLowerCase());

  if (tagsLower.some(t => ['easy', 'quick', 'simple', 'beginner'].includes(t))) {
    return 'Easy';
  } else if (tagsLower.some(t => ['hard', 'difficult', 'complex', 'advanced'].includes(t))) {
    return 'Hard';
  }
  return 'Medium';
}

function getCuisineFromTags(tags: string[]): string {
  if (!tags || !Array.isArray(tags)) return 'American';

  const tagsLower = tags.map(t => t.toLowerCase());

  const cuisineMap: { [key: string]: string } = {
    'italian': 'Italian',
    'asian': 'Asian',
    'chinese': 'Asian',
    'japanese': 'Asian',
    'thai': 'Thai',
    'mexican': 'Mexican',
    'mediterranean': 'Mediterranean',
    'greek': 'Mediterranean',
    'indian': 'Indian',
    'french': 'French',
    'spanish': 'Spanish'
  };

  for (const tag of tagsLower) {
    if (cuisineMap[tag]) {
      return cuisineMap[tag];
    }
  }

  return 'American';
}

function getDietaryFromTags(tags: string[]): string[] {
  if (!tags || !Array.isArray(tags)) return [];

  const tagsLower = tags.map(t => t.toLowerCase());
  const dietary: string[] = [];

  if (tagsLower.includes('vegetarian') || tagsLower.includes('veggie')) {
    dietary.push('vegetarian');
  }
  if (tagsLower.includes('vegan')) {
    dietary.push('vegan');
  }
  if (tagsLower.includes('gluten-free') || tagsLower.includes('gluten free')) {
    dietary.push('gluten-free');
  }
  if (tagsLower.includes('dairy-free') || tagsLower.includes('dairy free')) {
    dietary.push('dairy-free');
  }
  if (tagsLower.includes('keto') || tagsLower.includes('ketogenic')) {
    dietary.push('keto');
  }
  if (tagsLower.includes('paleo')) {
    dietary.push('paleo');
  }

  return dietary;
}

