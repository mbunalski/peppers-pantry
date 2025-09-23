"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  UserIcon, 
  CalendarIcon, 
  HeartIcon,
  BookmarkIcon,
  UsersIcon,
  UserPlusIcon,
  UserMinusIcon,
  MessageCircleIcon,
  ChefHatIcon,
  ShoppingCartIcon
} from "lucide-react";
import Layout from "../../../components/Layout";
import { useAuth } from "../../../contexts/AuthContext";

interface UserProfile {
  user: {
    id: string;
    name: string;
    email: string | null;
    avatar: string;
    joinedAt: string;
  };
  stats: {
    followersCount: number;
    followingCount: number;
    lovedRecipesCount: number;
    savedRecipesCount: number | null;
  };
  relationship: {
    isCurrentUserFollowing: boolean;
    canFollow: boolean;
  };
  recentActivity: any[];
  savedRecipes: any[];
  lovedRecipes: any[];
}

export default function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { user, token } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowActionLoading, setIsFollowActionLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params;
      setUserId(resolvedParams.id);
    };
    resolveParams();
  }, [params]);

  useEffect(() => {
    if (userId && user) {
      // If user is viewing their own profile, redirect to dashboard
      if (userId === user.id) {
        router.push('/dashboard');
        return;
      }
      loadProfile();
    } else if (userId) {
      loadProfile();
    }
  }, [userId, token, user, router]);

  const loadProfile = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/user/${userId}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      } else if (response.status === 404) {
        router.push('/404');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!user || !token || !profile || !userId) return;

    setIsFollowActionLoading(true);
    try {
      const method = profile.relationship.isCurrentUserFollowing ? 'DELETE' : 'POST';
      const response = await fetch(`/api/user/${userId}/follow`, {
        method,
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        // Refresh profile to get updated following status and counts
        loadProfile();
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    } finally {
      setIsFollowActionLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  const formatTimeAgo = (dateString: string) => {
    // Handle SQLite CURRENT_TIMESTAMP format: "2025-01-10 17:24:08"
    // Convert to ISO format for better parsing
    let parsedDate;
    
    if (dateString.includes(' ') && !dateString.includes('T')) {
      // Convert SQLite format to ISO
      parsedDate = new Date(dateString.replace(' ', 'T') + 'Z');
    } else {
      parsedDate = new Date(dateString);
    }
    
    const now = new Date();
    
    // Check if date is valid
    if (isNaN(parsedDate.getTime())) {
      return 'unknown';
    }
    
    const diffMs = now.getTime() - parsedDate.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    // Handle very recent items
    if (diffMs < 30000) return 'just now'; // Less than 30 seconds
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return parsedDate.toLocaleDateString();
  };

  const getActivityText = (activity: any) => {
    switch (activity.activity_type) {
      case 'reaction':
        const reactionEmoji = activity.metadata?.reaction_type === 'love' ? '❤️' : 
                             activity.metadata?.reaction_type === 'like' ? '👍' : '🤮';
        return `${reactionEmoji} reacted to a recipe`;
      case 'comment':
        return '💬 commented on a recipe';
      case 'recipe_added':
        return '👨‍🍳 added a new recipe';
      default:
        return 'was active';
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading profile...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <UserIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">User not found</h2>
            <p className="text-gray-600 mb-4">The user you're looking for doesn't exist.</p>
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Go Home
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center">
                <span className="text-white text-3xl font-bold">
                  {profile.user.avatar}
                </span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {profile.user.name}
                </h1>
                {profile.user.email && (
                  <p className="text-gray-600 mt-1">{profile.user.email}</p>
                )}
                <div className="flex items-center space-x-6 mt-3">
                  <button className="flex items-center space-x-1 text-gray-500 hover:text-red-600 transition-colors">
                    <UsersIcon className="h-4 w-4" />
                    <span className="text-sm">
                      <span className="font-medium text-gray-900">{profile.stats.followersCount}</span> followers
                    </span>
                  </button>
                  <button className="flex items-center space-x-1 text-gray-500 hover:text-red-600 transition-colors">
                    <span className="text-sm">
                      <span className="font-medium text-gray-900">{profile.stats.followingCount}</span> following
                    </span>
                  </button>
                  <Link href="/recipes?filter=loved" className="flex items-center space-x-1 text-gray-500 hover:text-red-600 transition-colors">
                    <HeartIcon className="h-4 w-4" />
                    <span className="text-sm">
                      <span className="font-medium text-gray-900">{profile.stats.lovedRecipesCount}</span> loved
                    </span>
                  </Link>
                  {profile.stats.savedRecipesCount !== null && (
                    <Link href="/recipes?filter=saved" className="flex items-center space-x-1 text-gray-500 hover:text-red-600 transition-colors">
                      <BookmarkIcon className="h-4 w-4" />
                      <span className="text-sm">
                        <span className="font-medium text-gray-900">{profile.stats.savedRecipesCount}</span> saved
                      </span>
                    </Link>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  <CalendarIcon className="h-4 w-4 inline mr-1" />
                  Joined {formatDate(profile.user.joinedAt)}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col items-end space-y-3">
              {profile.relationship.canFollow && (
                <button
                  onClick={handleFollowToggle}
                  disabled={isFollowActionLoading}
                  className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                    profile.relationship.isCurrentUserFollowing
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      : 'bg-red-600 text-white hover:bg-red-700'
                  } ${isFollowActionLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isFollowActionLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                  ) : (
                    <>
                      {profile.relationship.isCurrentUserFollowing ? (
                        <UserMinusIcon className="h-4 w-4 mr-2" />
                      ) : (
                        <UserPlusIcon className="h-4 w-4 mr-2" />
                      )}
                    </>
                  )}
                  {profile.relationship.isCurrentUserFollowing ? 'Unfollow' : 'Follow'}
                </button>
              )}
              
              {user?.id === profile.user.id && (
                <div className="flex flex-wrap gap-2 max-w-xs">
                  <Link
                    href="/dashboard"
                    className="flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/meal-plan"
                    className="flex items-center px-3 py-1.5 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 text-sm"
                  >
                    <CalendarIcon className="h-3.5 w-3.5 mr-1.5" />
                    Meal Plans
                  </Link>
                  <Link
                    href="/shopping-list"
                    className="flex items-center px-3 py-1.5 bg-green-100 text-green-700 rounded-md hover:bg-green-200 text-sm"
                  >
                    <ShoppingCartIcon className="h-3.5 w-3.5 mr-1.5" />
                    Shopping
                  </Link>
                  <Link
                    href="/preferences"
                    className="flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm"
                  >
                    Settings
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity - Full Width */}
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
          
          {profile.recentActivity.length === 0 ? (
            <div className="text-center py-8">
              <ChefHatIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No activity yet</h3>
              <p className="text-gray-600">
                {user?.id === profile.user.id 
                  ? "Start interacting with recipes to build your activity!" 
                  : `${profile.user.name} hasn't been active yet.`
                }
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {profile.recentActivity.slice(0, 9).map((activity, index) => (
                <div key={index} className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-bold">
                      {profile.user.avatar}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-900 text-sm">
                      <span className="font-medium">{profile.user.name}</span>{' '}
                      {getActivityText(activity)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatTimeAgo(activity.created_at)}
                    </p>
                    {activity.recipe_id && (
                      <Link
                        href={`/recipe/${activity.recipe_id}`}
                        className="text-red-600 hover:text-red-700 text-xs font-medium mt-1 inline-block"
                      >
                        View Recipe →
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {profile.recentActivity.length > 9 && (
            <p className="text-center text-gray-500 text-sm mt-6">
              +{profile.recentActivity.length - 9} more activities
            </p>
          )}
        </div>
      </div>
    </Layout>
  );
}