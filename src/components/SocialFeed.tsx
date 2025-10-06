"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  MessageCircleIcon,
  BookmarkIcon,
  ShareIcon,
  ClockIcon,
  UsersIcon,
  ChefHatIcon
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import SignupModal from "./SignupModal";

interface FeedItem {
  id: string;
  recipe: {
    id: number;
    title: string;
    summary: string;
    time: number;
    servings: number;
    difficulty: string;
    cuisine: string;
    dietary: string[];
    s3_medium_url?: string;
    image_url?: string;
  };
  social: {
    reactions: {
      love: number;
      like: number;
      vomit: number;
    };
    userReaction: string | null;
    commentCount: number;
    totalEngagement: number;
    recentReactions: Array<{
      name: string;
      reaction_type: string;
      created_at: string;
    }>;
    recentComments: Array<{
      name: string;
      content: string;
      created_at: string;
    }>;
    activities: Array<{
      userName: string;
      activityType: string;
      metadata: any;
    }>;
  };
  latest_activity: string;
}

interface SocialFeedProps {
  feedType?: 'global' | 'friends' | 'custom';
}

export default function SocialFeed({ feedType = 'global' }: SocialFeedProps) {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState<'global' | 'friends' | 'custom'>(user ? feedType : 'global');
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [comments, setComments] = useState<{ [key: string]: any[] }>({});
  const [loadingComments, setLoadingComments] = useState<Set<string>>(new Set());
  const [newComment, setNewComment] = useState<{ [key: string]: string }>({});
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [signupModalMessage, setSignupModalMessage] = useState("");

  useEffect(() => {
    loadFeed();
  }, [activeTab, token]);

  const promptSignup = (action: string) => {
    setSignupModalMessage(`Sign up to ${action} and connect with fellow food lovers!`);
    setShowSignupModal(true);
  };

  const loadFeed = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/feed?type=${activeTab}&limit=20&offset=0`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });

      if (response.ok) {
        const data = await response.json();
        setFeedItems(data.items || []);
        setHasMore(data.hasMore || false);
      }
    } catch (error) {
      console.error('Error loading feed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReaction = async (recipeId: number, reactionType: 'love' | 'like' | 'vomit') => {
    if (!user || !token) {
      promptSignup(`${reactionType} recipes`);
      return;
    }

    try {
      const response = await fetch(`/api/recipes/${recipeId}/reactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reactionType })
      });

      if (response.ok) {
        // Refresh the feed to show updated reactions
        loadFeed();
      }
    } catch (error) {
      console.error('Error reacting to recipe:', error);
    }
  };

  const handleSaveRecipe = async (recipeId: number) => {
    if (!user || !token) {
      promptSignup('save recipes');
      return;
    }

    try {
      const response = await fetch(`/api/recipes/${recipeId}/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Could show a toast notification here
        console.log('Recipe saved!');
      }
    } catch (error) {
      console.error('Error saving recipe:', error);
    }
  };

  const toggleComments = async (recipeId: number) => {
    if (!user) {
      promptSignup('view and add comments');
      return;
    }

    const recipeKey = recipeId.toString();
    const isExpanded = expandedComments.has(recipeKey);

    if (isExpanded) {
      // Collapse comments
      const newExpanded = new Set(expandedComments);
      newExpanded.delete(recipeKey);
      setExpandedComments(newExpanded);
    } else {
      // Expand comments - fetch if not already loaded
      const newExpanded = new Set(expandedComments);
      newExpanded.add(recipeKey);
      setExpandedComments(newExpanded);

      if (!comments[recipeKey]) {
        await loadComments(recipeId);
      }
    }
  };

  const loadComments = async (recipeId: number) => {
    const recipeKey = recipeId.toString();
    setLoadingComments(prev => new Set(prev).add(recipeKey));

    try {
      const response = await fetch(`/api/recipes/${recipeId}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(prev => ({ ...prev, [recipeKey]: data.comments || [] }));
      }
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoadingComments(prev => {
        const newSet = new Set(prev);
        newSet.delete(recipeKey);
        return newSet;
      });
    }
  };

  const handleAddComment = async (recipeId: number) => {
    if (!user || !token) return;

    const recipeKey = recipeId.toString();
    const comment = newComment[recipeKey]?.trim();
    if (!comment) return;

    try {
      const response = await fetch(`/api/recipes/${recipeId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: comment })
      });

      if (response.ok) {
        // Clear the input
        setNewComment(prev => ({ ...prev, [recipeKey]: '' }));
        // Reload comments to show the new one
        await loadComments(recipeId);
        // Refresh the feed to update comment count
        loadFeed();
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const generateActivitySummary = (item: FeedItem) => {
    const { recentReactions, recentComments, reactions, commentCount } = item.social as any;
    
    const totalReactions = reactions.love + reactions.like + reactions.vomit;
    const hasReactions = totalReactions > 0;
    const hasComments = commentCount > 0;
    
    let summaryParts = [];
    
    if (hasReactions && recentReactions.length > 0) {
      // Reactions summary
      const reactionUsers = recentReactions.slice(0, 3).map((r: any) => r.name);
      const remainingCount = Math.max(0, totalReactions - 3);
      
      if (reactionUsers.length === 1) {
        summaryParts.push(`${reactionUsers[0]} reacted`);
      } else if (reactionUsers.length === 2) {
        summaryParts.push(`${reactionUsers[0]} and ${reactionUsers[1]} reacted`);
      } else {
        const others = remainingCount > 0 ? ` and ${remainingCount} others` : '';
        summaryParts.push(`${reactionUsers.slice(0, 2).join(', ')}${others} reacted`);
      }
    }
    
    if (hasComments) {
      // Comments summary - get unique users who commented
      const allCommentUsers = recentComments.map((c: any) => c.user_name).filter((name: string) => name);
      const uniqueCommentUsers = [...new Set(allCommentUsers)]; // Remove duplicates
      
      if (uniqueCommentUsers.length === 1) {
        summaryParts.push(`${uniqueCommentUsers[0]} commented`);
      } else if (uniqueCommentUsers.length === 2) {
        summaryParts.push(`${uniqueCommentUsers[0]} and ${uniqueCommentUsers[1]} commented`);
      } else if (uniqueCommentUsers.length > 2) {
        const remainingUsers = uniqueCommentUsers.length - 2;
        summaryParts.push(`${uniqueCommentUsers.slice(0, 2).join(', ')} and ${remainingUsers} others commented`);
      } else {
        // Fallback if no comment user names are available
        summaryParts.push(`${commentCount} comment${commentCount > 1 ? 's' : ''}`);
      }
    }

    return summaryParts.join('. ') || 'New recipe activity';
  };

  const getReactionVerb = (reactionType: string) => {
    switch (reactionType) {
      case 'love': return 'loved';
      case 'like': return 'liked';
      case 'vomit': return 'didn\'t like';
      default: return 'reacted to';
    }
  };

  const getReactionEmojis = (reactions: { love: number; like: number; vomit: number }) => {
    const emojis = [];
    if (reactions.love > 0) emojis.push('❤️');
    if (reactions.like > 0) emojis.push('👍');
    if (reactions.vomit > 0) emojis.push('🤮');
    return emojis;
  };

  const formatEngagementSummary = (item: FeedItem) => {
    const { reactions, recentReactions, commentCount } = item.social;
    const totalReactions = reactions.love + reactions.like + reactions.vomit;

    if (totalReactions === 0 && commentCount === 0) return null;

    const emojis = getReactionEmojis(reactions);
    const parts = [];

    if (emojis.length > 0) {
      parts.push(emojis.join(''));
    }

    // Get unique users who reacted (limit to 2)
    const reactionUsers = recentReactions?.slice(0, 2).map((r: any) => r.name) || [];
    const remainingReactions = Math.max(0, totalReactions - 2);

    if (reactionUsers.length > 0) {
      const userText = reactionUsers.join(', ');
      if (remainingReactions > 0) {
        const formattedCount = remainingReactions >= 1000
          ? `${(remainingReactions / 1000).toFixed(1)}k`
          : remainingReactions.toString();
        parts.push(`${userText} and ${formattedCount} others`);
      } else {
        parts.push(userText);
      }
    } else if (totalReactions > 0) {
      const formattedCount = totalReactions >= 1000
        ? `${(totalReactions / 1000).toFixed(1)}k`
        : totalReactions.toString();
      parts.push(`${formattedCount} reactions`);
    }

    return parts.join(' ');
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

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-32 bg-gray-200 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Feed Tabs */}
      <div className="bg-white rounded-xl shadow-sm p-1 mb-6">
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveTab('global')}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'global'
                ? 'bg-red-600 text-white'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            🌍 Global
          </button>
          {user && (
            <button
              onClick={() => setActiveTab('friends')}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'friends'
                  ? 'bg-red-600 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              👥 Friends
            </button>
          )}
          <button
            onClick={() => setActiveTab('custom')}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'custom'
                ? 'bg-red-600 text-white'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            🔥 Popular
          </button>
        </div>
      </div>

      {/* Feed Items */}
      <div className="space-y-6">
        {feedItems.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <ChefHatIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No activity yet</h3>
            <p className="text-gray-600 mb-4">
              {activeTab === 'friends' 
                ? "Follow some friends to see their cooking activity!" 
                : "Be the first to interact with recipes!"
              }
            </p>
            <Link
              href="/recipes"
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <ChefHatIcon className="h-4 w-4 mr-2" />
              Browse Recipes
            </Link>
          </div>
        ) : (
          feedItems.map((item) => (
            <div key={item.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">

              {/* Recipe Card */}
              <div className="px-6 pt-6 pb-4">
                <Link href={`/recipe/${item.recipe.id}`} className="block group">
                  <div className="rounded-lg overflow-hidden transition-transform group-hover:scale-[1.02]">
                    {/* Recipe Image */}
                    {(item.recipe.s3_medium_url || item.recipe.image_url) && (
                      <div className="relative h-48 w-full overflow-hidden">
                        <img
                          src={item.recipe.s3_medium_url || item.recipe.image_url}
                          alt={item.recipe.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      </div>
                    )}

                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-red-600 transition-colors">
                        {item.recipe.title}
                      </h3>
                    </div>
                  </div>
                </Link>
              </div>

              {/* Social Actions */}
              <div className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    {/* Reactions */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleReaction(item.recipe.id, 'love')}
                        className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                          item.social.userReaction === 'love'
                            ? 'bg-red-100 text-red-700'
                            : 'text-gray-600 hover:bg-red-50 hover:text-red-600'
                        }`}
                      >
                        <span className="text-base">❤️</span>
                        <span>{item.social.reactions.love}</span>
                      </button>
                      <button
                        onClick={() => handleReaction(item.recipe.id, 'like')}
                        className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                          item.social.userReaction === 'like'
                            ? 'bg-blue-100 text-blue-700'
                            : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                        }`}
                      >
                        <span className="text-base">👍</span>
                        <span>{item.social.reactions.like}</span>
                      </button>
                      <button
                        onClick={() => handleReaction(item.recipe.id, 'vomit')}
                        className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                          item.social.userReaction === 'vomit'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'text-gray-600 hover:bg-yellow-50 hover:text-yellow-600'
                        }`}
                      >
                        <span className="text-base">🤮</span>
                        <span>{item.social.reactions.vomit}</span>
                      </button>
                    </div>

                    {/* Comments */}
                    <button
                      onClick={() => toggleComments(item.recipe.id)}
                      className="flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                      <MessageCircleIcon className="h-4 w-4" />
                      <span>{item.social.commentCount}</span>
                    </button>
                  </div>

                  <div className="flex items-center space-x-3">
                    {/* Save Recipe */}
                    <button
                      onClick={() => handleSaveRecipe(item.recipe.id)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                      disabled={!user}
                      title="Save recipe"
                    >
                      <BookmarkIcon className="h-4 w-4" />
                    </button>

                    {/* Share Recipe */}
                    <button
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                      title="Share recipe"
                    >
                      <ShareIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Engagement Summary */}
                {formatEngagementSummary(item) && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-sm text-gray-700">
                      {formatEngagementSummary(item)}
                    </p>
                  </div>
                )}

                {/* Comments Section */}
                {expandedComments.has(item.recipe.id.toString()) && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    {/* Comments List */}
                    {loadingComments.has(item.recipe.id.toString()) ? (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600 mx-auto"></div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {comments[item.recipe.id.toString()]?.map((comment) => (
                          <div key={comment.id} className="flex space-x-3">
                            <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-white text-xs font-bold">
                                {comment.user_name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="bg-gray-50 rounded-lg p-3">
                                <p className="text-sm font-medium text-gray-900">{comment.user_name}</p>
                                <p className="text-sm text-gray-700 mt-1">{comment.content}</p>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">{formatTimeAgo(comment.created_at)}</p>
                            </div>
                          </div>
                        ))}
                        
                        {/* Add Comment Form */}
                        {user && (
                          <div className="flex space-x-3 mt-4">
                            <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-white text-xs font-bold">
                                {user.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="flex-1">
                              <div className="flex space-x-2">
                                <input
                                  type="text"
                                  value={newComment[item.recipe.id.toString()] || ''}
                                  onChange={(e) => setNewComment(prev => ({ 
                                    ...prev, 
                                    [item.recipe.id.toString()]: e.target.value 
                                  }))}
                                  placeholder="Add a comment..."
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                  onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                      handleAddComment(item.recipe.id);
                                    }
                                  }}
                                />
                                <button
                                  onClick={() => handleAddComment(item.recipe.id)}
                                  className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                                >
                                  Post
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* No comments message */}
                        {comments[item.recipe.id.toString()]?.length === 0 && (
                          <p className="text-gray-500 text-sm text-center py-4">No comments yet. Be the first to comment!</p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {/* Load More */}
        {hasMore && (
          <div className="text-center">
            <button
              onClick={loadFeed}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Load More
            </button>
          </div>
        )}
      </div>

      {/* Signup Modal */}
      <SignupModal
        isOpen={showSignupModal}
        onClose={() => setShowSignupModal(false)}
        message={signupModalMessage}
      />
    </div>
  );
}