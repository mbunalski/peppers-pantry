import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '../../../../lib/auth';
import { 
  getGlobalFeed, 
  getFollowers, 
  getFollowing,
  isFollowing
} from '../../../../lib/db';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const currentUser = getUserFromRequest(request);
    const resolvedParams = await params;
    const targetUserId = resolvedParams.id;

    // Get user from database (this is simplified - in real app you'd have a users table)
    const { getDb } = await import('../../../../lib/db');
    const db = getDb();
    
    const userStmt = db.prepare(`
      SELECT id, name, email, created_at FROM users WHERE id = ?
    `);
    const targetUser = userStmt.get(targetUserId);
    
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get user's follower/following counts
    const followers = getFollowers(targetUserId);
    const following = getFollowing(targetUserId);

    // Check if current user is following this user
    let isCurrentUserFollowing = false;
    if (currentUser && currentUser.id !== targetUserId) {
      isCurrentUserFollowing = isFollowing(currentUser.id, targetUserId);
    }

    // Get user's recent activity (their reactions, comments, etc.)
    const userActivityStmt = db.prepare(`
      SELECT * FROM activity_feed 
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 20
    `);
    const userActivity = userActivityStmt.all(targetUserId);

    // Get user's loved recipes count
    const lovedRecipesStmt = db.prepare(`
      SELECT COUNT(*) as count FROM recipe_reactions 
      WHERE user_id = ? AND reaction_type = 'love'
    `);
    const lovedRecipesCount = lovedRecipesStmt.get(targetUserId);

    // Get user's saved recipes count and data (only if viewing own profile)
    let savedRecipesCount: any = { count: 0 };
    let savedRecipesData: any[] = [];
    let lovedRecipesData: any[] = [];
    
    if (currentUser?.id === targetUserId) {
      const savedRecipesStmt = db.prepare(`
        SELECT COUNT(*) as count FROM saved_recipes 
        WHERE user_id = ?
      `);
      savedRecipesCount = savedRecipesStmt.get(targetUserId);

      // Get actual saved recipes data
      const savedRecipesDataStmt = db.prepare(`
        SELECT sr.*, sr.created_at as saved_at FROM saved_recipes sr
        WHERE sr.user_id = ?
        ORDER BY sr.created_at DESC
        LIMIT 20
      `);
      savedRecipesData = savedRecipesDataStmt.all(targetUserId);

      // Get actual loved recipes data
      const lovedRecipesDataStmt = db.prepare(`
        SELECT recipe_id, created_at FROM recipe_reactions 
        WHERE user_id = ? AND reaction_type = 'love'
        ORDER BY created_at DESC
        LIMIT 20
      `);
      lovedRecipesData = lovedRecipesDataStmt.all(targetUserId);
    } else {
      savedRecipesCount = { count: null }; // Don't show count to others
    }

    // Sample recipe data to get titles and details
    const recipeData: { [key: number]: any } = {
      245: { title: "Tofu Stir-fry", summary: "Quick and healthy vegetarian stir-fry with tofu and fresh vegetables", time: 30, servings: 4, difficulty: "Easy", cuisine: "Asian", dietary: ["vegetarian", "vegan"] },
      194: { title: "Bolognese Sauce", summary: "Classic Italian meat sauce perfect for pasta dishes", time: 120, servings: 6, difficulty: "Medium", cuisine: "Italian", dietary: [] },
      43: { title: "Chicken Alfredo", summary: "Creamy pasta dish with tender chicken and rich alfredo sauce", time: 25, servings: 4, difficulty: "Easy", cuisine: "Italian", dietary: [] },
      129: { title: "World's Best Lasagna", summary: "Layered pasta dish with meat sauce, cheese, and bechamel", time: 90, servings: 8, difficulty: "Hard", cuisine: "Italian", dietary: [] },
      76: { title: "Thai Green Curry", summary: "Aromatic curry with coconut milk and fresh vegetables", time: 45, servings: 4, difficulty: "Medium", cuisine: "Thai", dietary: ["vegetarian"] },
      88: { title: "Greek Salad Bowl", summary: "Fresh Mediterranean salad with feta and olives", time: 15, servings: 2, difficulty: "Easy", cuisine: "Mediterranean", dietary: ["vegetarian"] },
      102: { title: "Beef Tacos", summary: "Seasoned ground beef tacos with fresh toppings", time: 35, servings: 4, difficulty: "Easy", cuisine: "Mexican", dietary: [] },
      156: { title: "Quinoa Buddha Bowl", summary: "Nutritious bowl with quinoa, roasted vegetables, and tahini dressing", time: 40, servings: 2, difficulty: "Medium", cuisine: "American", dietary: ["vegetarian", "vegan"] }
    };

    // Enrich saved recipes with recipe details
    const enrichedSavedRecipes = savedRecipesData.map(saved => ({
      ...saved,
      recipe: recipeData[saved.recipe_id] || { title: `Recipe ${saved.recipe_id}`, summary: '', time: 0, servings: 0, difficulty: 'Unknown', cuisine: 'Unknown', dietary: [] }
    }));

    // Enrich loved recipes with recipe details
    const enrichedLovedRecipes = lovedRecipesData.map(loved => ({
      recipe_id: loved.recipe_id,
      created_at: loved.created_at,
      recipe: recipeData[loved.recipe_id] || { title: `Recipe ${loved.recipe_id}`, summary: '', time: 0, servings: 0, difficulty: 'Unknown', cuisine: 'Unknown', dietary: [] }
    }));

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
        lovedRecipesCount: lovedRecipesCount?.count || 0,
        savedRecipesCount: currentUser?.id === targetUserId ? (savedRecipesCount?.count || 0) : null // Only show to self
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