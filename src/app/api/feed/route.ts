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
    const { getDb } = await import('../../../lib/db');
    const db = getDb();

    // Get recipes that have recent activity, grouped by recipe
    let activityQuery = '';
    let params: any[] = [];

    if (feedType === 'friends' && user) {
      activityQuery = `
        SELECT 
          a.recipe_id,
          MAX(a.created_at) as latest_activity,
          GROUP_CONCAT(DISTINCT u.name || '|' || a.activity_type || '|' || COALESCE(a.metadata, '')) as activities
        FROM activity_feed a
        JOIN users u ON a.user_id = u.id
        JOIN user_follows f ON a.user_id = f.following_id
        WHERE f.follower_id = ?
        GROUP BY a.recipe_id
        ORDER BY latest_activity DESC
        LIMIT ? OFFSET ?
      `;
      params = [user.id, limit, offset];
    } else {
      activityQuery = `
        SELECT 
          a.recipe_id,
          MAX(a.created_at) as latest_activity,
          GROUP_CONCAT(DISTINCT u.name || '|' || a.activity_type || '|' || COALESCE(a.metadata, '')) as activities
        FROM activity_feed a
        JOIN users u ON a.user_id = u.id
        GROUP BY a.recipe_id
        ORDER BY latest_activity DESC
        LIMIT ? OFFSET ?
      `;
      params = [limit, offset];
    }

    const activityResults = db.prepare(activityQuery).all(...params);

    // Enhance with recipe data and detailed social info
    const enhancedFeedItems = await Promise.all(
      activityResults.map(async (item: any) => {
        const recipe = recipeData[item.recipe_id];
        if (!recipe) return null;

        // Get detailed social data for this recipe
        const reactions = getRecipeReactions(item.recipe_id);
        const comments = getRecipeComments(item.recipe_id);
        
        // Get user's reaction if authenticated
        let userReaction = null;
        if (user) {
          const { getUserReactionForRecipe } = await import('../../../lib/db');
          userReaction = getUserReactionForRecipe(user.id, item.recipe_id);
        }

        // Parse activities to get recent user actions
        const activitiesData = item.activities.split(',').map((activity: string) => {
          const [userName, activityType, metadata] = activity.split('|');
          return {
            userName,
            activityType,
            metadata: metadata ? JSON.parse(metadata) : null
          };
        });

        // Get recent reactions and comments
        const recentReactions = db.prepare(`
          SELECT u.name, rr.reaction_type, rr.created_at
          FROM recipe_reactions rr
          JOIN users u ON rr.user_id = u.id
          WHERE rr.recipe_id = ?
          ORDER BY rr.created_at DESC
          LIMIT 3
        `).all(item.recipe_id);

        const recentComments = db.prepare(`
          SELECT u.name, rc.content, rc.created_at
          FROM recipe_comments rc
          JOIN users u ON rc.user_id = u.id
          WHERE rc.recipe_id = ?
          ORDER BY rc.created_at DESC
          LIMIT 3
        `).all(item.recipe_id);

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
            recentReactions,
            recentComments,
            activities: activitiesData
          },
          latest_activity: item.latest_activity
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