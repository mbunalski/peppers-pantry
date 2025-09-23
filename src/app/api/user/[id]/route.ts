import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '../../../../lib/auth';
import {
  getGlobalFeed,
  getFollowers,
  getFollowing,
  isFollowing,
  getUserById,
  getActivityFeed,
  getUserLovedRecipes,
  getUserSavedRecipes,
  getDb,
  getRecipeById
} from '../../../../lib/db';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const currentUser = getUserFromRequest(request);
    const resolvedParams = await params;
    const targetUserId = resolvedParams.id;

    // Get user from database
    const targetUser = await getUserById(targetUserId);
    
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get user's follower/following counts
    const followers = await getFollowers(targetUserId);
    const following = await getFollowing(targetUserId);

    // Check if current user is following this user
    let isCurrentUserFollowing = false;
    if (currentUser && currentUser.id !== targetUserId) {
      isCurrentUserFollowing = await isFollowing(currentUser.id, targetUserId);
    }

    // Get user's recent activity
    const userActivity = await getActivityFeed(targetUserId, 20, 0);

    // Get user's loved recipes count and data
    const lovedRecipesData = await getUserLovedRecipes(targetUserId);
    const lovedRecipesCount = lovedRecipesData.length;

    // Get user's saved recipes count and data (only if viewing own profile)
    let savedRecipesCount = 0;
    let savedRecipesData: any[] = [];
    
    if (currentUser?.id === targetUserId) {
      savedRecipesData = await getUserSavedRecipes(targetUserId);
      savedRecipesCount = savedRecipesData.length;
    }

    // Enrich saved recipes with recipe details from database
    const enrichedSavedRecipes = await Promise.all(
      savedRecipesData.map(async (saved) => {
        const recipeData = await getRecipeById(saved.recipe_id);
        return {
          ...saved,
          recipe: recipeData || {
            title: `Recipe ${saved.recipe_id}`,
            summary: '',
            time: 0,
            servings: 0,
            difficulty: 'Unknown',
            cuisine: 'Unknown',
            dietary: []
          }
        };
      })
    );

    // Enrich loved recipes with recipe details from database
    const enrichedLovedRecipes = await Promise.all(
      lovedRecipesData.map(async (loved) => {
        const recipeData = await getRecipeById(loved.recipe_id);
        return {
          recipe_id: loved.recipe_id,
          created_at: loved.created_at,
          recipe: recipeData || {
            title: `Recipe ${loved.recipe_id}`,
            summary: '',
            time: 0,
            servings: 0,
            difficulty: 'Unknown',
            cuisine: 'Unknown',
            dietary: []
          }
        };
      })
    );

    return NextResponse.json({
      user: {
        id: targetUser.id,
        name: targetUser.name,
        email: currentUser?.id === targetUserId ? targetUser.email : null, // Only show email to self
        avatar: targetUser.name.charAt(0).toUpperCase(),
        joinedAt: targetUser.created_at
      },
      stats: {
        followersCount: followers.length,
        followingCount: following.length,
        lovedRecipesCount: lovedRecipesCount,
        savedRecipesCount: currentUser?.id === targetUserId ? savedRecipesCount : null // Only show to self
      },
      relationship: {
        isCurrentUserFollowing,
        canFollow: currentUser && currentUser.id !== targetUserId
      },
      recentActivity: userActivity,
      savedRecipes: enrichedSavedRecipes,
      lovedRecipes: enrichedLovedRecipes
    });

  } catch (error) {
    console.error('Get user profile error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}