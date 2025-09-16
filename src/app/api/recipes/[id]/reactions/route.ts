import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '../../../../../lib/auth';
import { 
  addOrUpdateReaction, 
  removeReaction, 
  getRecipeReactions, 
  getUserReactionForRecipe,
  createNotification,
  getUserById
} from '../../../../../lib/db';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const recipeId = parseInt(params.id);
    if (isNaN(recipeId)) {
      return NextResponse.json({ error: 'Invalid recipe ID' }, { status: 400 });
    }

    const { reactionType } = await request.json();
    if (!reactionType || !['love', 'like', 'vomit'].includes(reactionType)) {
      return NextResponse.json({ error: 'Invalid reaction type' }, { status: 400 });
    }

    // Add or update the reaction
    await addOrUpdateReaction(user.id, recipeId, reactionType);

    // Get updated reaction counts
    const reactions = await getRecipeReactions(recipeId);
    const userReaction = await getUserReactionForRecipe(user.id, recipeId);

    // TODO: Create notification for recipe owner when we have recipe ownership
    // For now, skip notifications since recipes are platform-owned

    return NextResponse.json({
      success: true,
      reactions,
      userReaction,
      message: `Recipe ${reactionType}d successfully!`
    });

  } catch (error) {
    console.error('Add reaction error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const recipeId = parseInt(params.id);
    if (isNaN(recipeId)) {
      return NextResponse.json({ error: 'Invalid recipe ID' }, { status: 400 });
    }

    // Remove the reaction
    await removeReaction(user.id, recipeId);

    // Get updated reaction counts
    const reactions = await getRecipeReactions(recipeId);
    const userReaction = await getUserReactionForRecipe(user.id, recipeId);

    return NextResponse.json({
      success: true,
      reactions,
      userReaction: null,
      message: 'Reaction removed successfully!'
    });

  } catch (error) {
    console.error('Remove reaction error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const recipeId = parseInt(params.id);
    if (isNaN(recipeId)) {
      return NextResponse.json({ error: 'Invalid recipe ID' }, { status: 400 });
    }

    // Get reaction counts
    const reactions = await getRecipeReactions(recipeId);
    
    // Get user's reaction if authenticated
    let userReaction = null;
    const user = getUserFromRequest(request);
    if (user) {
      userReaction = await getUserReactionForRecipe(user.id, recipeId);
    }

    return NextResponse.json({
      reactions,
      userReaction
    });

  } catch (error) {
    console.error('Get reactions error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}