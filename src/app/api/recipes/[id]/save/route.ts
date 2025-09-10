import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '../../../../../lib/auth';
import { saveRecipe, unsaveRecipe, isRecipeSaved } from '../../../../../lib/db';

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

    const { listName = 'Want to Make' } = await request.json();

    // Save the recipe
    saveRecipe(user.id, recipeId, listName);

    return NextResponse.json({
      success: true,
      message: `Recipe saved to ${listName} list!`
    });

  } catch (error) {
    console.error('Save recipe error:', error);
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

    const { listName = 'Want to Make' } = await request.json();

    // Remove from saved recipes
    unsaveRecipe(user.id, recipeId, listName);

    return NextResponse.json({
      success: true,
      message: `Recipe removed from ${listName} list!`
    });

  } catch (error) {
    console.error('Unsave recipe error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const recipeId = parseInt(params.id);
    if (isNaN(recipeId)) {
      return NextResponse.json({ error: 'Invalid recipe ID' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const listName = searchParams.get('listName') || 'Want to Make';

    // Check if recipe is saved
    const isSaved = isRecipeSaved(user.id, recipeId, listName);

    return NextResponse.json({
      isSaved
    });

  } catch (error) {
    console.error('Check saved recipe error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}