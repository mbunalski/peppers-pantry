import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '../../../../../lib/auth';
import { followUser, unfollowUser, isFollowing } from '../../../../../lib/db';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const targetUserId = resolvedParams.id;
    if (user.id === targetUserId) {
      return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 });
    }

    // Follow the user
    followUser(user.id, targetUserId);

    return NextResponse.json({ 
      success: true, 
      following: true,
      message: 'Successfully followed user'
    });

  } catch (error) {
    console.error('Follow user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const targetUserId = resolvedParams.id;
    
    // Unfollow the user
    unfollowUser(user.id, targetUserId);

    return NextResponse.json({ 
      success: true, 
      following: false,
      message: 'Successfully unfollowed user'
    });

  } catch (error) {
    console.error('Unfollow user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const targetUserId = resolvedParams.id;
    const following = isFollowing(user.id, targetUserId);

    return NextResponse.json({ 
      following,
      userId: user.id,
      targetUserId
    });

  } catch (error) {
    console.error('Check follow status error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}