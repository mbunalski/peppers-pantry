import { NextRequest, NextResponse } from 'next/server';
import { getAllRecipes, searchRecipes } from '../../../lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Get query parameters
    const search = searchParams.get('search') || '';
    const tags = searchParams.get('tags')?.split(',').filter(Boolean) || [];
    const maxTime = searchParams.get('maxTime') ? parseInt(searchParams.get('maxTime')!) : undefined;
    const minTime = searchParams.get('minTime') ? parseInt(searchParams.get('minTime')!) : undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 100;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0;

    let recipes;

    if (search || tags.length > 0 || maxTime || minTime) {
      // Use search function if any filters are applied
      recipes = await searchRecipes(search, {
        tags: tags.length > 0 ? tags : undefined,
        maxTime,
        minTime,
        limit,
        offset
      });
    } else {
      // Get all recipes if no filters
      recipes = await getAllRecipes(limit, offset);
    }

    // Map database fields to match frontend expectations
    const formattedRecipes = recipes.map(recipe => ({
      id: parseInt(recipe.id),
      title: recipe.title,
      time: recipe.total_time_minutes || 0,
      servings: recipe.servings || '4',
      difficulty: getDifficultyFromTags(recipe.tags),
      cuisine: getCuisineFromTags(recipe.tags),
      dietary: getDietaryFromTags(recipe.tags),
      summary: recipe.summary || '',
      ingredients: getIngredientsFromTags(recipe.tags),
      source: recipe.source_domain || 'Unknown',
      url: recipe.source_url || '#',
      calories: recipe.calories,
      macros: recipe.macros,
      image: recipe.image_url,
      author: recipe.author
    }));

    return NextResponse.json({
      success: true,
      recipes: formattedRecipes,
      total: formattedRecipes.length
    });

  } catch (error) {
    console.error('Get recipes error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper functions to extract information from tags
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

function getIngredientsFromTags(tags: string[]): string[] {
  if (!tags || !Array.isArray(tags)) return [];

  // Filter out tags that are likely ingredients
  const ingredientTags = tags.filter(tag => {
    const tagLower = tag.toLowerCase();

    // Skip cuisine, difficulty, and other non-ingredient tags
    const skipTags = [
      'easy', 'medium', 'hard', 'quick', 'dinner', 'lunch', 'breakfast',
      'italian', 'asian', 'mexican', 'american', 'thai', 'mediterranean',
      'vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'keto', 'paleo',
      'main course', 'appetizer', 'dessert', 'snack', 'budget', 'healthy'
    ];

    return !skipTags.includes(tagLower) && tagLower.length > 2;
  });

  return ingredientTags.slice(0, 8); // Limit to first 8 ingredient-like tags
}