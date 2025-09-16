"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { 
  ChefHatIcon, 
  ClockIcon, 
  UsersIcon, 
  PrinterIcon, 
  ShareIcon, 
  HeartIcon, 
  BookmarkIcon,
  CalendarPlusIcon,
  ShoppingCartIcon,
  ExternalLinkIcon,
  LockIcon
} from "lucide-react";
import Header from "../../../components/Header";
import { useAuth } from "../../../contexts/AuthContext";

export default function RecipePage() {
  const { user, token } = useAuth();
  const params = useParams();
  const recipeId = params.id as string;
  const [recipe, setRecipe] = useState<any>(null);
  const [isLoadingRecipe, setIsLoadingRecipe] = useState(true);
  const [reactions, setReactions] = useState({ love: 0, like: 0, vomit: 0 });
  const [userReaction, setUserReaction] = useState<'love' | 'like' | 'vomit' | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isLoadingReactions, setIsLoadingReactions] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Load recipe data
  useEffect(() => {
    loadRecipe();
  }, [recipeId]);

  // Load reactions and comments when recipe is loaded
  useEffect(() => {
    if (recipe) {
      loadReactions();
      loadComments();
      if (user) {
        checkIfSaved();
      }
    }
  }, [recipe, user]);

  const loadRecipe = async () => {
    setIsLoadingRecipe(true);
    try {
      const response = await fetch(`/api/recipes/${recipeId}`);
      if (response.ok) {
        const data = await response.json();
        setRecipe(data.recipe);
      } else {
        setRecipe(null);
      }
    } catch (error) {
      console.error('Error loading recipe:', error);
      setRecipe(null);
    } finally {
      setIsLoadingRecipe(false);
    }
  };



  const loadReactions = async () => {
    try {
      const response = await fetch(`/api/recipes/${recipeId}/reactions`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (response.ok) {
        const data = await response.json();
        setReactions(data.reactions);
        setUserReaction(data.userReaction);
      }
    } catch (error) {
      console.error('Error loading reactions:', error);
    }
  };

  const checkIfSaved = async () => {
    try {
      const response = await fetch(`/api/recipes/${recipeId}/save`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setIsSaved(data.isSaved);
      }
    } catch (error) {
      console.error('Error checking saved status:', error);
    }
  };

  const handleReaction = async (reactionType: 'love' | 'like' | 'vomit') => {
    if (!user) {
      alert('Sign up to react to recipes!');
      window.location.href = '/signup';
      return;
    }

    if (isLoadingReactions) return;

    setIsLoadingReactions(true);
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
        const data = await response.json();
        setReactions(data.reactions);
        setUserReaction(data.userReaction);
      }
    } catch (error) {
      console.error('Error adding reaction:', error);
    } finally {
      setIsLoadingReactions(false);
    }
  };

  const handleRemoveReaction = async () => {
    if (!user || isLoadingReactions) return;

    setIsLoadingReactions(true);
    try {
      const response = await fetch(`/api/recipes/${recipeId}/reactions`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setReactions(data.reactions);
        setUserReaction(null);
      }
    } catch (error) {
      console.error('Error removing reaction:', error);
    } finally {
      setIsLoadingReactions(false);
    }
  };

  const handleSaveRecipe = async () => {
    if (!user) {
      alert('Sign up to save recipes!');
      window.location.href = '/signup';
      return;
    }

    try {
      if (isSaved) {
        // Unsave recipe
        const response = await fetch(`/api/recipes/${recipeId}/save`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ listName: 'Want to Make' })
        });

        if (response.ok) {
          setIsSaved(false);
          alert('Recipe removed from Want to Make list!');
        }
      } else {
        // Save recipe
        const response = await fetch(`/api/recipes/${recipeId}/save`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ listName: 'Want to Make' })
        });

        if (response.ok) {
          setIsSaved(true);
          alert('Recipe saved to Want to Make list!');
        }
      }
    } catch (error) {
      console.error('Error saving/unsaving recipe:', error);
    }
  };

  const loadComments = async () => {
    try {
      const response = await fetch(`/api/recipes/${recipeId}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments);
      }
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const handleSubmitComment = async (parentCommentId?: string) => {
    if (!user) {
      alert('Sign up to leave comments!');
      window.location.href = '/signup';
      return;
    }

    if (!newComment.trim()) return;

    setIsSubmittingComment(true);
    try {
      const response = await fetch(`/api/recipes/${recipeId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          content: newComment.trim(),
          parentCommentId: parentCommentId || replyTo
        })
      });

      if (response.ok) {
        const data = await response.json();
        setComments(data.comments);
        setNewComment('');
        setReplyTo(null);
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  // Loading state
  if (isLoadingRecipe) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center pt-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading recipe...</p>
          </div>
        </div>
      </div>
    );
  }

  // If recipe not found, show error
  if (!recipe) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Recipe Not Found</h1>
          <p className="text-gray-600 mb-6">We couldn't find the recipe you're looking for.</p>
          <Link href="/recipes" className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700">
            Browse All Recipes
          </Link>
        </div>
      </div>
    );
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: recipe.title,
        text: recipe.summary,
        url: window.location.href,
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href);
      alert('Recipe URL copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Recipe Header */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <Link href="/recipes" className="text-red-600 hover:text-red-700 text-sm font-medium">
                  ← Back to Recipes
                </Link>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{recipe.title}</h1>
              <p className="text-xl text-gray-600 mb-4">{recipe.summary}</p>
              <p className="text-gray-700 leading-relaxed">{recipe.description}</p>
            </div>
          </div>

          {/* Recipe Meta Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6 p-6 bg-gray-50 rounded-lg">
            <div className="text-center">
              <ClockIcon className="h-6 w-6 text-red-600 mx-auto mb-2" />
              <div className="text-sm text-gray-600">Total Time</div>
              <div className="text-lg font-semibold text-gray-900">{recipe.time} min</div>
            </div>
            <div className="text-center">
              <UsersIcon className="h-6 w-6 text-red-600 mx-auto mb-2" />
              <div className="text-sm text-gray-600">Servings</div>
              <div className="text-lg font-semibold text-gray-900">{recipe.servings}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600">Difficulty</div>
              <span className={`inline-block px-3 py-1 text-sm rounded-full ${
                recipe.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                recipe.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {recipe.difficulty}
              </span>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600">Cuisine</div>
              <div className="text-lg font-semibold text-gray-900">{recipe.cuisine}</div>
            </div>
          </div>

          {/* Dietary Tags & Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {recipe.dietary.length > 0 && (
                <div className="flex space-x-2">
                  {recipe.dietary.map((diet: string, index: number) => (
                    <span key={index} className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded">
                      {diet}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center space-x-6">
              {/* Reaction Buttons */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => userReaction === 'love' ? handleRemoveReaction() : handleReaction('love')}
                  disabled={isLoadingReactions}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                    userReaction === 'love' 
                      ? 'bg-red-100 text-red-700 border-red-200' 
                      : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600'
                  } ${isLoadingReactions ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span className="text-lg">❤️</span>
                  <span className="font-medium">{reactions.love}</span>
                </button>
                <button
                  onClick={() => userReaction === 'like' ? handleRemoveReaction() : handleReaction('like')}
                  disabled={isLoadingReactions}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                    userReaction === 'like' 
                      ? 'bg-blue-100 text-blue-700 border-blue-200' 
                      : 'bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                  } ${isLoadingReactions ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span className="text-lg">👍</span>
                  <span className="font-medium">{reactions.like}</span>
                </button>
                <button
                  onClick={() => userReaction === 'vomit' ? handleRemoveReaction() : handleReaction('vomit')}
                  disabled={isLoadingReactions}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                    userReaction === 'vomit' 
                      ? 'bg-yellow-100 text-yellow-700 border-yellow-200' 
                      : 'bg-gray-100 text-gray-600 hover:bg-yellow-50 hover:text-yellow-600'
                  } ${isLoadingReactions ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span className="text-lg">🤮</span>
                  <span className="font-medium">{reactions.vomit}</span>
                </button>
              </div>

              {/* Save Button */}
              <button
                onClick={handleSaveRecipe}
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                  isSaved 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-600 hover:bg-green-50 hover:text-green-600'
                }`}
              >
                <BookmarkIcon className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
                <span className="text-sm font-medium">
                  {isSaved ? 'Saved' : 'Save'}
                </span>
              </button>

              {/* Share & Print */}
              <div className="flex space-x-2">
                <button
                  onClick={handleShare}
                  className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200"
                >
                  <ShareIcon className="h-5 w-5" />
                </button>
                <button className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200">
                  <PrinterIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Ingredients */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold text-gray-900">Ingredients</h2>
                <button 
                  onClick={() => {
                    if (!user) {
                      alert('Sign up to add ingredients to your shopping list!');
                      window.location.href = '/signup';
                    } else {
                      alert('Ingredients added to your shopping list!');
                    }
                  }}
                  className={`flex items-center text-sm ${
                    user ? 'text-green-600 hover:text-green-700' : 'text-red-600 hover:text-red-700'
                  }`}
                >
                  <ShoppingCartIcon className="h-4 w-4 mr-1" />
                  {user ? 'Add to List' : 'Sign up to Add'}
                </button>
              </div>
              <ul className="space-y-3">
                {recipe.ingredients.map((ingredient: any, index: number) => (
                  <li key={index} className="flex items-start">
                    <input 
                      type="checkbox" 
                      className="mt-1 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                    />
                    <div className="ml-3 flex-1">
                      <span className="font-medium text-gray-900">{ingredient.amount}</span>
                      <span className="text-gray-700"> {ingredient.item}</span>
                      {ingredient.notes && (
                        <div className="text-sm text-gray-500 italic">({ingredient.notes})</div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Nutrition Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Nutrition per serving</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Calories</span>
                  <span className="font-medium">{recipe.nutrition.calories}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Protein</span>
                  <span className="font-medium">{recipe.nutrition.protein}g</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Carbs</span>
                  <span className="font-medium">{recipe.nutrition.carbs}g</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Fat</span>
                  <span className="font-medium">{recipe.nutrition.fat}g</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Fiber</span>
                  <span className="font-medium">{recipe.nutrition.fiber}g</span>
                </div>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">Instructions</h2>
                <button
                  onClick={async () => {
                    if (!user) {
                      alert('Sign up to add recipes to your meal plan!');
                      window.location.href = '/signup';
                    } else {
                      try {
                        const response = await fetch('/api/meal-plan/add-recipe', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                          },
                          body: JSON.stringify({ recipeId: recipe.id })
                        });

                        if (response.ok) {
                          const data = await response.json();
                          if (data.success) {
                            alert(data.message + ' Changes are automatically saved.');
                          }
                        } else {
                          const errorData = await response.json();
                          alert(errorData.error || 'Error adding recipe to meal plan.');
                        }
                      } catch (error) {
                        console.error('Error adding recipe to meal plan:', error);
                        alert('Error adding recipe to meal plan. Please try again.');
                      }
                    }
                  }}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm ${
                    user 
                      ? 'bg-green-600 text-white hover:bg-green-700' 
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                >
                  <CalendarPlusIcon className="h-4 w-4 mr-2" />
                  {user ? 'Add to Meal Plan' : 'Sign up to Plan'}
                </button>
              </div>
              <ol className="space-y-6">
                {recipe.instructions.map((step: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <div className="flex-shrink-0 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <p className="ml-4 text-gray-700 leading-relaxed">{step}</p>
                  </li>
                ))}
              </ol>

              {/* Cooking Tips */}
              <div className="mt-8 p-4 bg-yellow-50 rounded-lg">
                <h3 className="text-lg font-semibold text-yellow-900 mb-3">💡 Chef's Tips</h3>
                <ul className="space-y-1 text-sm text-yellow-800">
                  {recipe.tips.map((tip: string, index: number) => (
                    <li key={index}>• {tip}</li>
                  ))}
                </ul>
              </div>

              {/* Source */}
              <div className="mt-6 pt-6 border-t border-gray-200 flex items-center justify-between">
                <span className="text-sm text-gray-500">Recipe from {recipe.source}</span>
                {recipe.url !== "#" && (
                  <a
                    href={recipe.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-red-600 hover:text-red-700 text-sm"
                  >
                    <ExternalLinkIcon className="h-4 w-4 mr-1" />
                    Original Recipe
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="mt-12 bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-2xl font-semibold text-gray-900 mb-6">
            Comments ({comments.length})
          </h3>

          {/* Add Comment Form */}
          <div className="mb-8">
            <div className="flex space-x-3">
              <div className="flex-shrink-0">
                {user ? (
                  <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                ) : (
                  <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                )}
              </div>
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={user ? "Share your thoughts about this recipe..." : "Sign up to leave a comment"}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                  rows={3}
                  maxLength={1000}
                  disabled={!user}
                />
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    {newComment.length}/1000 characters
                  </span>
                  <div className="flex space-x-2">
                    {replyTo && (
                      <button
                        onClick={() => {
                          setReplyTo(null);
                          setNewComment('');
                        }}
                        className="text-gray-500 hover:text-gray-700 text-sm"
                      >
                        Cancel Reply
                      </button>
                    )}
                    <button
                      onClick={() => handleSubmitComment()}
                      disabled={!user || !newComment.trim() || isSubmittingComment}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      {isSubmittingComment ? 'Posting...' : replyTo ? 'Reply' : 'Post Comment'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Comments List */}
          <div className="space-y-6">
            {comments.map((comment) => (
              <div key={comment.id} className="flex space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {comment.user_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">
                        {comment.user_name}
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatTimeAgo(comment.created_at)}
                      </span>
                    </div>
                    <p className="text-gray-700">{comment.content}</p>
                    {comment.image_url && (
                      <img
                        src={comment.image_url}
                        alt="Comment image"
                        className="mt-3 rounded-lg max-w-sm"
                      />
                    )}
                  </div>

                  <div className="mt-2 flex items-center space-x-4">
                    <button
                      onClick={() => {
                        if (!user) {
                          alert('Sign up to reply to comments!');
                          window.location.href = '/signup';
                          return;
                        }
                        setReplyTo(comment.id);
                        setNewComment(`@${comment.user_name} `);
                      }}
                      className="text-sm text-gray-500 hover:text-red-600"
                    >
                      Reply
                    </button>
                  </div>

                  {/* Replies */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-4 ml-4 space-y-4">
                      {comment.replies.map((reply: any) => (
                        <div key={reply.id} className="flex space-x-3">
                          <div className="flex-shrink-0">
                            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-medium">
                                {reply.user_name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="bg-blue-50 rounded-lg p-3">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-medium text-gray-900 text-sm">
                                  {reply.user_name}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {formatTimeAgo(reply.created_at)}
                                </span>
                              </div>
                              <p className="text-gray-700 text-sm">{reply.content}</p>
                              {reply.image_url && (
                                <img
                                  src={reply.image_url}
                                  alt="Reply image"
                                  className="mt-2 rounded-lg max-w-xs"
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {comments.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No comments yet. Be the first to share your thoughts!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}