"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChefHatIcon, CalendarIcon, ShoppingCartIcon, MessageSquareIcon, ClockIcon, DollarSignIcon, LockIcon, PlusIcon, RefreshCwIcon } from "lucide-react";
import Layout from "../../components/Layout";
import ProtectedRoute from "../../components/ProtectedRoute";
import FloatingNotification from "../../components/FloatingNotification";
import { useAuth } from "../../contexts/AuthContext";

// Sample meal plan data
const sampleMealPlan = [
  { day: "Monday", meal: "Grilled Chicken Breast with Rice" },
  { day: "Wednesday", meal: "Beef Stir Fry with Vegetables" },
  { day: "Friday", meal: "Baked Salmon with Quinoa" },
  { day: "Sunday", meal: "Turkey Meatloaf with Mashed Potatoes" }
];

const samplePreferences = {
  dietary: ["vegetarian"],
  budget: 15,
  time: 30,
  complexity: "medium",
  allergens: [],
  dislikes: []
};

export default function MealPlan() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [mealPlan, setMealPlan] = useState([]);
  const [userPreferences, setUserPreferences] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [isGeneratingShoppingList, setIsGeneratingShoppingList] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [removingItemId, setRemovingItemId] = useState<string | null>(null);
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error' | 'info', isVisible: boolean}>({message: '', type: 'success', isVisible: false});

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday", "TBD"];

  // Function to detect duplicate days (excluding TBD)
  const getDuplicateDays = () => {
    const dayCounts = {};
    const duplicates = new Set();

    mealPlan.forEach(meal => {
      const day = meal.day_of_week || meal.day;
      if (day && day !== 'TBD') {
        dayCounts[day] = (dayCounts[day] || 0) + 1;
        if (dayCounts[day] > 1) {
          duplicates.add(day);
        }
      }
    });

    return duplicates;
  };

  const duplicateDays = getDuplicateDays();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user && !token) {
      router.push('/login?redirect=/meal-plan');
    }
  }, [user, token, router]);

  // Load user preferences and existing meal plan
  useEffect(() => {
    if (user && token) {
      loadUserPreferences();
      loadMealPlan();
    }
  }, [user, token]);

  // Refresh meal plan when component gains focus (user returns from other pages)
  useEffect(() => {
    const handleFocus = () => {
      if (user && token) {
        loadMealPlan();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [user, token]);

  const loadUserPreferences = async () => {
    try {
      const response = await fetch('/api/user/preferences', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const prefs = await response.json();
        setUserPreferences(prefs);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const loadMealPlan = async () => {
    try {
      const response = await fetch('/api/meal-plan', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.items && data.items.length > 0) {
          setMealPlan(data.items);
          setHasGenerated(true);
          setLastSaved(new Date().toLocaleTimeString());
        }
      }
    } catch (error) {
      console.error('Error loading meal plan:', error);
    }
  };

  const generateMealPlan = async () => {
    if (!userPreferences) {
      router.push('/preferences');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/meal-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action: 'generate' })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.mealPlan) {
          setMealPlan(data.mealPlan.items);
          setHasGenerated(true);
          setLastSaved(new Date().toLocaleTimeString());
        }
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Error generating meal plan. Please try again.');
      }
    } catch (error) {
      console.error('Error generating meal plan:', error);
      alert('Error generating meal plan. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateShoppingList = async () => {
    setIsGeneratingShoppingList(true);
    try {
      const response = await fetch('/api/shopping-list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setNotification({message: `Shopping list generated with ${data.items.length} items!`, type: 'success', isVisible: true});
        }
      } else {
        const errorData = await response.json();
        setNotification({message: errorData.error || 'Error generating shopping list.', type: 'error', isVisible: true});
      }
    } catch (error) {
      console.error('Error generating shopping list:', error);
      setNotification({message: 'Error generating shopping list. Please try again.', type: 'error', isVisible: true});
    } finally {
      setIsGeneratingShoppingList(false);
    }
  };

  const removeMealPlanItem = async (itemId: string) => {
    setRemovingItemId(itemId);
    try {
      const response = await fetch('/api/meal-plan/remove-item', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ itemId })
      });

      if (response.ok) {
        // Remove item from local state immediately for instant UI update
        setMealPlan(prev => prev.filter(item => item.id !== itemId));
        setLastSaved(new Date().toLocaleTimeString());
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Error removing item from meal plan.');
      }
    } catch (error) {
      console.error('Error removing item from meal plan:', error);
      alert('Error removing item from meal plan. Please try again.');
    } finally {
      setRemovingItemId(null);
    }
  };

  const updateMealPlanItemDay = async (itemId: string, newDay: string) => {
    setUpdatingItemId(itemId);
    try {
      const response = await fetch('/api/meal-plan/update-item', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ itemId, day: newDay })
      });

      if (response.ok) {
        // Update item in local state immediately for instant UI update
        setMealPlan(prev => prev.map(item => 
          item.id === itemId ? { ...item, day_of_week: newDay } : item
        ));
        setLastSaved(new Date().toLocaleTimeString());
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Error updating meal plan item.');
      }
    } catch (error) {
      console.error('Error updating meal plan item:', error);
      alert('Error updating meal plan item. Please try again.');
    } finally {
      setUpdatingItemId(null);
    }
  };

  if (!user) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">Loading...</div>
    </div>;
  }

  return (
    <ProtectedRoute message="Sign up to create personalized meal plans and build your weekly menu!">
      <Layout>

      {/* Hero Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 sm:text-4xl lg:text-5xl">
              Your Meal Plan
            </h1>
            <p className="mt-4 text-base sm:text-xl text-gray-500 max-w-3xl mx-auto">
              Welcome back, {user.name}! Generate custom weekly meal plans.
            </p>
            <div className="mt-8">
              {!hasGenerated ? (
                <button
                  onClick={generateMealPlan}
                  disabled={isGenerating}
                  className="bg-red-600 text-white px-4 py-2 sm:px-8 sm:py-3 rounded-lg hover:bg-red-700 font-medium text-sm sm:text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <span className="flex items-center">
                      <RefreshCwIcon className="h-5 w-5 mr-2 animate-spin" />
                      Generating Your Plan...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <PlusIcon className="h-5 w-5 mr-2" />
                      Generate My First Meal Plan
                    </span>
                  )}
                </button>
              ) : (
                <button
                  onClick={generateMealPlan}
                  disabled={isGenerating}
                  className="bg-green-600 text-white px-4 py-2 sm:px-8 sm:py-3 rounded-lg hover:bg-green-700 font-medium text-sm sm:text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <span className="flex items-center">
                      <RefreshCwIcon className="h-5 w-5 mr-2 animate-spin" />
                      Generating New Plan...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <RefreshCwIcon className="h-5 w-5 mr-2" />
                      Generate New Meal Plan
                    </span>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>


      {/* Meal Plan */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Meal Plan */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {hasGenerated ? 'Your Weekly Meal Plan' : 'Sample Weekly Meal Plan'}
                  </h2>
                  {lastSaved && (
                    <p className="text-sm text-gray-500 mt-1">
                      {isSaving ? 'Saving...' : `Last saved: ${lastSaved}`}
                    </p>
                  )}
                </div>
                <CalendarIcon className="h-8 w-8 text-green-600" />
              </div>
              
              {mealPlan.length > 0 ? (
                <>
                  {duplicateDays.size > 0 && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-start">
                        <span className="text-red-600 mr-2">⚠️</span>
                        <div>
                          <h4 className="text-sm font-medium text-red-800">Duplicate Days Detected</h4>
                          <p className="text-sm text-red-700 mt-1">
                            You have multiple meals scheduled for: {Array.from(duplicateDays).join(', ')}.
                            Consider changing the day for some meals to avoid conflicts.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                <div className="space-y-4">
                  {mealPlan.map((meal, index) => {
                    const mealDay = meal.day_of_week || meal.day;
                    const isDuplicate = mealDay !== 'TBD' && duplicateDays.has(mealDay);

                    // Use S3 image if available, otherwise fall back to original image_url or placeholder
                    const imageUrl = meal.s3_medium_url || meal.image_url || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzliYTViZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';

                    return (
                    <div key={index} className={`grid grid-cols-12 gap-4 p-4 rounded-lg transition-all duration-200 items-center ${
                      isDuplicate
                        ? 'bg-red-50 border-2 border-red-200 shadow-md'
                        : 'bg-gray-50'
                    } ${(removingItemId === meal.id || updatingItemId === meal.id) ? 'opacity-50' : ''}`}>

                      {/* Day of Week Column */}
                      <div className="col-span-3">
                        <select
                          value={meal.day_of_week || meal.day}
                          onChange={(e) => updateMealPlanItemDay(meal.id, e.target.value)}
                          disabled={updatingItemId === meal.id}
                          className={`w-full text-xs sm:text-sm font-medium bg-white border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:border-red-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                            isDuplicate
                              ? 'text-red-700 border-red-300 focus:ring-red-500'
                              : 'text-gray-700 border-gray-300 focus:ring-red-500'
                          }`}
                        >
                          {daysOfWeek.map((day) => (
                            <option key={day} value={day}>{day}</option>
                          ))}
                        </select>
                        {isDuplicate && (
                          <p className="text-xs text-red-600 mt-1 font-medium">
                            ⚠️ Duplicate
                          </p>
                        )}
                      </div>

                      {/* Picture + Name Column */}
                      <div className="col-span-8">
                        <div className="flex items-center space-x-3">
                          {/* Recipe Image - Clickable */}
                          {(meal.recipe_id || meal.recipeId) ? (
                            <Link href={`/recipe/${meal.recipe_id || meal.recipeId}`} className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0">
                              <img
                                src={imageUrl}
                                alt={meal.recipe_title || meal.meal}
                                className="w-full h-full object-cover rounded-lg hover:opacity-80 transition-opacity cursor-pointer"
                                onError={(e) => {
                                  e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzliYTViZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
                                }}
                              />
                            </Link>
                          ) : (
                            <div className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0">
                              <img
                                src={imageUrl}
                                alt={meal.recipe_title || meal.meal}
                                className="w-full h-full object-cover rounded-lg"
                                onError={(e) => {
                                  e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzliYTViZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
                                }}
                              />
                            </div>
                          )}
                          {/* Recipe Name - No underline */}
                          <div className="flex-1">
                            {(meal.recipe_id || meal.recipeId) ? (
                              <Link
                                href={`/recipe/${meal.recipe_id || meal.recipeId}`}
                                className={`text-sm sm:text-base font-medium hover:text-red-600 transition-colors ${
                                  isDuplicate ? 'text-red-900' : 'text-gray-900'
                                }`}
                              >
                                {meal.recipe_title || meal.meal}
                              </Link>
                            ) : (
                              <h3 className={`text-sm sm:text-base font-medium ${
                                isDuplicate ? 'text-red-900' : 'text-gray-900'
                              }`}>
                                {meal.recipe_title || meal.meal}
                              </h3>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Delete Button Column */}
                      <div className="col-span-1 flex justify-center">
                        <button
                          onClick={() => removeMealPlanItem(meal.id)}
                          disabled={removingItemId === meal.id || updatingItemId === meal.id}
                          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete meal"
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    );
                  })}
                </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <CalendarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No meal plan yet</h3>
                  <p className="text-gray-600 mb-4">Generate your first personalized meal plan to get started!</p>
                  <button
                    onClick={generateMealPlan}
                    className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
                  >
                    Generate Meal Plan
                  </button>
                </div>
              )}

              {hasGenerated && (
                <div className="mt-6 p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <ShoppingCartIcon className="h-5 w-5 text-green-600 mr-2" />
                      <span className="text-sm font-medium text-green-800">
                        Ready to shop? Generate your shopping list!
                      </span>
                    </div>
                    <button 
                      onClick={generateShoppingList}
                      disabled={isGeneratingShoppingList}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isGeneratingShoppingList ? 'Generating...' : 'Generate Shopping List'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Preferences & Actions */}
          <div className="space-y-6">
            {/* Current Preferences */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Your Preferences</h3>
                <Link 
                  href="/preferences"
                  className="text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  Edit
                </Link>
              </div>
              {userPreferences ? (
                <div className="space-y-3">
                  {userPreferences.dietary_restrictions && userPreferences.dietary_restrictions.length > 0 && (
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-700 w-16">Diet:</span>
                      <div className="flex flex-wrap gap-1">
                        {userPreferences.dietary_restrictions.map((diet, index) => (
                          <span key={index} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                            {diet}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex items-center">
                    <DollarSignIcon className="h-4 w-4 text-gray-500 mr-1" />
                    <span className="text-sm text-gray-700">Budget: ${userPreferences.budget_per_meal || 15}/meal</span>
                  </div>
                  <div className="flex items-center">
                    <ClockIcon className="h-4 w-4 text-gray-500 mr-1" />
                    <span className="text-sm text-gray-700">Max time: {userPreferences.max_cooking_time || 30} minutes</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-700">Complexity: {userPreferences.complexity || 'medium'}</span>
                  </div>
                  {userPreferences.allergens && userPreferences.allergens.length > 0 && (
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-700 w-16">Avoid:</span>
                      <div className="flex flex-wrap gap-1">
                        {userPreferences.allergens.map((allergen, index) => (
                          <span key={index} className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                            {allergen}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-600 mb-4">Set your preferences to get personalized meal plans!</p>
                  <Link
                    href="/preferences"
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm"
                  >
                    Set Preferences
                  </Link>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      <FloatingNotification
        message={notification.message}
        type={notification.type}
        isVisible={notification.isVisible}
        onClose={() => setNotification({...notification, isVisible: false})}
        duration={5000}
      />
      </Layout>
    </ProtectedRoute>
  );
}