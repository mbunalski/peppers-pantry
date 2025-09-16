import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '../../../lib/auth';
import { getGlobalFeed, getFriendsFeed, getRecipeReactions, getRecipeComments } from '../../../lib/db';

// Sample recipe data to get titles and details - in real app this would come from recipe database
const recipeData: { [key: number]: any } = {
  245: {
    title: "Tofu Stir-fry",
    summary: "Quick and healthy vegetarian stir-fry with tofu and fresh vegetables",
    time: 30,
    servings: 4,
    difficulty: "Easy",
    cuisine: "Asian",
    dietary: ["vegetarian", "vegan"]
  },
  194: {
    title: "Bolognese Sauce",
    summary: "Classic Italian meat sauce perfect for pasta dishes",
    time: 120,
    servings: 6,
    difficulty: "Medium",
    cuisine: "Italian",
    dietary: []
  },
  43: {
    title: "Chicken Alfredo",
    summary: "Creamy pasta dish with tender chicken and rich alfredo sauce",
    time: 25,
    servings: 4,
    difficulty: "Easy",
    cuisine: "Italian",
    dietary: []
  },
  129: {
    title: "World's Best Lasagna",
    summary: "Layered pasta dish with meat sauce, cheese, and bechamel",
    time: 90,
    servings: 8,
    difficulty: "Hard",
    cuisine: "Italian",
    dietary: []
  },
  76: {
    title: "Thai Green Curry",
    summary: "Aromatic curry with coconut milk and fresh vegetables",
    time: 45,
    servings: 4,
    difficulty: "Medium",
    cuisine: "Thai",
    dietary: ["vegetarian"]
  },
  88: {
    title: "Greek Salad Bowl",
    summary: "Fresh Mediterranean salad with feta and olives",
    time: 15,
    servings: 2,
    difficulty: "Easy",
    cuisine: "Mediterranean",
    dietary: ["vegetarian"]
  },
  102: {
    title: "Beef Tacos",
    summary: "Seasoned ground beef tacos with fresh toppings",
    time: 35,
    servings: 4,
    difficulty: "Easy",
    cuisine: "Mexican",
    dietary: []
  },
  156: {
    title: "Quinoa Buddha Bowl",
    summary: "Nutritious bowl with quinoa, roasted vegetables, and tahini dressing",
    time: 40,
    servings: 2,
    difficulty: "Medium",
    cuisine: "American",
    dietary: ["vegetarian", "vegan"]
  }
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const feedType = searchParams.get('type') || 'global'; // global, friends, custom
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const user = getUserFromRequest(request);
    const { getActivityFeed, getUserReactionForRecipe, getRecentReactionsForRecipe } = await import('../../../lib/db');

    // Get aggregated activity feed 
    let activityResults;
    if (feedType === 'global') {
      activityResults = await getActivityFeed(undefined, limit, offset);
    } else {
      // For user-specific or friends feed (simplified for now)
      activityResults = await getActivityFeed(user?.id, limit, offset);
    }

    // Enhance with recipe data and detailed social info
    const enhancedFeedItems = await Promise.all(
      activityResults.map(async (item: any) => {
        const recipe = recipeData[item.recipe_id];
        if (!recipe) return null;

        // Get detailed social data for this recipe
        const reactions = await getRecipeReactions(item.recipe_id);
        const comments = await getRecipeComments(item.recipe_id);
        const recentReactions = await getRecentReactionsForRecipe(item.recipe_id, 5);
        
        // Get user's reaction if authenticated
        let userReaction = null;
        if (user) {
          userReaction = await getUserReactionForRecipe(user.id, item.recipe_id);
        }

        // Parse participating users from database array
        let participatingUsers = [];
        if (item.participating_users) {
          // Handle PostgreSQL array format
          participatingUsers = Array.isArray(item.participating_users) 
            ? item.participating_users 
            : item.participating_users.replace(/[{}]/g, '').split(',').filter(name => name.trim());
        }

        // Parse activity types
        let activityTypes = [];
        if (item.activity_types) {
          activityTypes = Array.isArray(item.activity_types) 
            ? item.activity_types 
            : item.activity_types.replace(/[{}]/g, '').split(',').filter(type => type.trim());
        }

        return {
          id: `recipe-${item.recipe_id}`,
          recipe: {
            id: item.recipe_id,
            title: recipe.title,
            summary: recipe.summary,
            time: recipe.time,
            servings: recipe.servings,
            difficulty: recipe.difficulty,
            cuisine: recipe.cuisine,
            dietary: recipe.dietary
          },
          social: {
            reactions,
            userReaction,
            commentCount: comments.length,
            totalEngagement: reactions.love + reactions.like + reactions.vomit + comments.length,
            recentReactions: recentReactions,
            recentComments: comments.slice(0, 3),
            activities: [{
              userName: item.user_name || 'Unknown',
              activityType: item.activity_type,
              metadata: typeof item.metadata === 'string' ? JSON.parse(item.metadata) : item.metadata
            }],
            // Additional aggregated data from the new query
            participatingUsers: participatingUsers,
            activityTypes: activityTypes,
            reactionCount: parseInt(item.reaction_count || 0),
            commentActivityCount: parseInt(item.comment_count || 0),
            totalActivities: parseInt(item.total_activities || 0)
          },
          latest_activity: item.created_at
        };
      })
    );

    // Filter out null items and sort by engagement for 'custom' feed
    let finalFeedItems = enhancedFeedItems.filter(item => item !== null);
    
    if (feedType === 'custom') {
      // Sort by engagement (reactions + comments) for custom feed
      finalFeedItems.sort((a, b) => b.social.totalEngagement - a.social.totalEngagement);
    }

    return NextResponse.json({
      success: true,
      feedType,
      items: finalFeedItems,
      hasMore: finalFeedItems.length === limit
    });

  } catch (error) {
    console.error('Get feed error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}