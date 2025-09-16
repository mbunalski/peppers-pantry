import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '../../../../../lib/auth';
import { addComment, getRecipeComments } from '../../../../../lib/db';

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

    const { content, imageUrl, parentCommentId } = await request.json();
    
    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'Comment content is required' }, { status: 400 });
    }

    if (content.length > 1000) {
      return NextResponse.json({ error: 'Comment is too long (max 1000 characters)' }, { status: 400 });
    }

    // Add the comment
    const commentId = await addComment(user.id, recipeId, content.trim(), imageUrl, parentCommentId);

    // Get updated comments
    const comments = await getRecipeComments(recipeId);

    // TODO: Create notification for recipe owner and parent comment author
    // For now, skip notifications since recipes are platform-owned

    return NextResponse.json({
      success: true,
      commentId,
      comments,
      message: 'Comment added successfully!'
    });

  } catch (error) {
    console.error('Add comment error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const recipeId = parseInt(params.id);
    if (isNaN(recipeId)) {
      return NextResponse.json({ error: 'Invalid recipe ID' }, { status: 400 });
    }

    // Get comments for this recipe
    const comments = await getRecipeComments(recipeId);

    return NextResponse.json({
      comments
    });

  } catch (error) {
    console.error('Get comments error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}