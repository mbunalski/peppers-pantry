"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChefHatIcon, CalendarIcon, ShoppingCartIcon, MessageSquareIcon, ClockIcon, DollarSignIcon, LockIcon, PlusIcon, RefreshCwIcon } from "lucide-react";
import Layout from "../../components/Layout";
import ProtectedRoute from "../../components/ProtectedRoute";
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
          if (confirm(`Shopping list generated with ${data.items.length} items! Would you like to view it now?`)) {
            router.push('/shopping-list');
          }
        }
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Error generating shopping list.');
      }
    } catch (error) {
      console.error('Error generating shopping list:', error);
      alert('Error generating shopping list. Please try again.');
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

                    return (
                    <div key={index} className={`p-3 sm:p-4 rounded-lg transition-all duration-200 ${
                      isDuplicate
                        ? 'bg-red-50 border-2 border-red-200 shadow-md'
                        : 'bg-gray-50'
                    } ${(removingItemId === meal.id || updatingItemId === meal.id) ? 'opacity-50' : ''}`}>
                      <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0">
                        <div className="flex-shrink-0 w-full sm:w-28">
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
                        </div>
                        <div className="flex-1 sm:ml-4">
                          <h3 className={`text-sm sm:text-base font-medium ${
                            isDuplicate ? 'text-red-900' : 'text-gray-900'
                          }`}>
                            {(meal.recipe_id || meal.recipeId) ? (
                              <Link
                                href={`/recipe/${meal.recipe_id || meal.recipeId}`}
                                className="text-blue-600 hover:text-blue-700 underline"
                              >
                                {meal.recipe_title || meal.meal}
                              </Link>
                            ) : (
                              meal.recipe_title || meal.meal
                            )}
                          </h3>
                          {isDuplicate && (
                            <p className="text-xs text-red-600 mt-1 font-medium">
                              ⚠️ Duplicate day - multiple meals scheduled
                            </p>
                          )}
                        </div>
                        <div className="flex-shrink-0 flex justify-end">
                          <button
                            onClick={() => removeMealPlanItem(meal.id)}
                            disabled={removingItemId === meal.id || updatingItemId === meal.id}
                            className="text-red-600 hover:text-red-700 text-xs sm:text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {removingItemId === meal.id ? 'Removing...' : 'Remove'}
                          </button>
                        </div>
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

            {/* Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button 
                  onClick={generateMealPlan}
                  disabled={isGenerating}
                  className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  {isGenerating ? 'Generating...' : 'New Meal Plan'}
                </button>
                <button 
                  onClick={generateShoppingList}
                  disabled={isGeneratingShoppingList || !hasGenerated}
                  className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingCartIcon className="h-4 w-4 mr-2" />
                  {isGeneratingShoppingList ? 'Generating...' : 'Shopping List'}
                </button>
                <Link 
                  href="/recipes"
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center"
                >
                  <ChefHatIcon className="h-4 w-4 mr-2" />
                  Browse Recipes
                </Link>
                <Link 
                  href="/shopping-list"
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center"
                >
                  <ShoppingCartIcon className="h-4 w-4 mr-2" />
                  View Shopping Lists
                </Link>
                <Link
                  href="/preferences"
                  className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center justify-center"
                >
                  <MessageSquareIcon className="h-4 w-4 mr-2" />
                  Edit Preferences
                </Link>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">💡 Pro Tips</h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li>• Update your preferences anytime to get new meal suggestions</li>
                <li>• Click on recipe names to view detailed cooking instructions</li>
                <li>• Generate shopping lists from your meal plans</li>
                <li>• Browse our recipe collection to add favorites to plans</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Why Choose Smart Meal Planning?
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-red-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <ChefHatIcon className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">AI-Powered Plans</h3>
              <p className="text-sm text-gray-600">Intelligent meal suggestions based on your preferences</p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <CalendarIcon className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Personalized Plans</h3>
              <p className="text-sm text-gray-600">Tailored to your dietary needs and budget</p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <ShoppingCartIcon className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Smart Shopping</h3>
              <p className="text-sm text-gray-600">Auto-generated shopping lists</p>
            </div>
            
            <div className="text-center">
              <div className="bg-yellow-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <ClockIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Time Saving</h3>
              <p className="text-sm text-gray-600">No more meal planning stress</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 md:flex md:items-center md:justify-between lg:px-8">
          <div className="flex justify-center space-x-6 md:order-2">
            <Link href="/privacy" className="text-gray-400 hover:text-gray-500">
              Privacy Policy
            </Link>
          </div>
          <div className="mt-8 md:mt-0 md:order-1">
            <p className="text-center text-base text-gray-400">
              &copy; 2024 Pepper's Pantry. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
      </Layout>
    </ProtectedRoute>
  );
}