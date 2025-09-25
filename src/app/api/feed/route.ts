import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '../../../lib/auth';
import { getGlobalFeed, getFriendsFeed, getRecipeReactions, getRecipeComments, getRecipeById } from '../../../lib/db';

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
        // Get real recipe data from database
        const recipeFromDb = await getRecipeById(item.recipe_id);

        const recipe = recipeFromDb || {
          title: `Recipe ${item.recipe_id}`,
          summary: "Delicious recipe from the community",
          time: 30,
          servings: 4,
          difficulty: "Medium",
          cuisine: "Various",
          dietary: []
        };

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
            title: recipe.title || recipe.name || `Recipe ${item.recipe_id}`,
            summary: recipe.summary || recipe.description || "Delicious recipe from the community",
            time: recipe.time || recipe.cook_time || recipe.prep_time || 30,
            servings: recipe.servings || recipe.yield || 4,
            difficulty: recipe.difficulty || "Medium",
            cuisine: recipe.cuisine || "Various",
            dietary: recipe.dietary || recipe.diet_restrictions || [],
            s3_medium_url: recipe.s3_medium_url,
            image_url: recipe.image_url
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