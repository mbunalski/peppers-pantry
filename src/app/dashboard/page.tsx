"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChefHatIcon,
  CalendarIcon,
  ShoppingCartIcon,
  UserIcon,
  SettingsIcon,
  HeartIcon,
  BookmarkIcon,
  PlusIcon,
  ClockIcon,
  DollarSignIcon,
  TrendingUpIcon
} from "lucide-react";
import Layout from "../../components/Layout";
import { useAuth } from "../../contexts/AuthContext";

interface DashboardData {
  user: {
    id: string;
    name: string;
    email: string;
  };
  mealPlan: any;
  shoppingList: any;
  savedRecipes: any[];
  lovedRecipes: any[];
  stats: {
    totalSavedRecipes: number;
    totalLovedRecipes: number;
    hasMealPlan: boolean;
    hasShoppingList: boolean;
  };
}

export default function Dashboard() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user && !token) {
      router.push('/login?redirect=/dashboard');
    }
  }, [user, token, router]);

  // Load dashboard data
  useEffect(() => {
    if (user && token) {
      loadDashboardData();
    }
  }, [user, token]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/user/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-600 rounded-full flex items-center justify-center">
                <span className="text-white text-lg sm:text-2xl font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h1 className="text-xl sm:text-3xl font-bold text-gray-900">
                  {user.name}
                </h1>
                <p className="text-sm sm:text-base text-gray-600">{user.email}</p>
                <div className="flex items-center space-x-3 sm:space-x-4 mt-1 sm:mt-2">
                  <span className="text-xs sm:text-sm text-gray-500">
                    ❤️ {dashboardData?.stats.totalLovedRecipes || 0} loved
                  </span>
                  <span className="text-xs sm:text-sm text-gray-500">
                    📌 {dashboardData?.stats.totalSavedRecipes || 0} saved
                  </span>
                </div>
              </div>
            </div>
            <div className="flex">
              <Link
                href="/preferences"
                className="flex items-center px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                <SettingsIcon className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Settings</span>
                <span className="sm:hidden">Settings</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-3 sm:p-6">
            <div className="flex items-center">
              <CalendarIcon className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              <div className="ml-2 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-500">Meal Plan</p>
                <p className="text-sm sm:text-2xl font-semibold text-gray-900">
                  {dashboardData?.stats.hasMealPlan ? 'Active' : 'None'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-3 sm:p-6">
            <div className="flex items-center">
              <ShoppingCartIcon className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
              <div className="ml-2 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-500">Shopping List</p>
                <p className="text-sm sm:text-2xl font-semibold text-gray-900">
                  {dashboardData?.shoppingList?.items.length || 0} items
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-3 sm:p-6">
            <div className="flex items-center">
              <HeartIcon className="h-6 w-6 sm:h-8 sm:w-8 text-red-600" />
              <div className="ml-2 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-500">Loved Recipes</p>
                <p className="text-sm sm:text-2xl font-semibold text-gray-900">
                  {dashboardData?.stats.totalLovedRecipes || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-3 sm:p-6">
            <div className="flex items-center">
              <BookmarkIcon className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600" />
              <div className="ml-2 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-500">Saved Recipes</p>
                <p className="text-sm sm:text-2xl font-semibold text-gray-900">
                  {dashboardData?.stats.totalSavedRecipes || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Current Meal Plan */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-2xl font-semibold text-gray-900">This Week's Meal Plan</h2>
              <Link
                href="/meal-plan"
                className="text-red-600 hover:text-red-700 text-xs sm:text-sm font-medium"
              >
                View Full Plan →
              </Link>
            </div>
            
            {dashboardData?.mealPlan?.items && dashboardData.mealPlan.items.length > 0 ? (
              <div className="space-y-3">
                {dashboardData.mealPlan.items.slice(0, 5).map((meal: any, index: number) => {
                  const imageUrl = meal.s3_medium_url || meal.image_url || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzliYTViZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
                  return meal.recipe_id ? (
                      <Link
                        key={index}
                        href={`/recipe/${meal.recipe_id}`}
                        className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                      >
                        <img
                          src={imageUrl}
                          alt={meal.recipe_title}
                          className="w-10 h-10 object-cover rounded-lg flex-shrink-0"
                          onError={(e) => {
                            e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzliYTViZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
                          }}
                        />
                        <div>
                          <span className="font-medium text-gray-900">{meal.day_of_week}</span>
                          <p className="text-sm text-gray-600">{meal.recipe_title}</p>
                        </div>
                      </Link>
                    ) : (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <img
                          src={imageUrl}
                          alt={meal.recipe_title}
                          className="w-10 h-10 object-cover rounded-lg flex-shrink-0"
                          onError={(e) => {
                            e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzliYTViZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
                          }}
                        />
                        <div>
                          <span className="font-medium text-gray-900">{meal.day_of_week}</span>
                          <p className="text-sm text-gray-600">{meal.recipe_title}</p>
                        </div>
                      </div>
                    );
                })}
                {dashboardData.mealPlan.items.length > 5 && (
                  <p className="text-center text-gray-500 text-sm">
                    +{dashboardData.mealPlan.items.length - 5} more meals
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <CalendarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No meal plan yet</h3>
                <p className="text-gray-600 mb-4">Create your first meal plan to get started!</p>
                <Link
                  href="/meal-plan"
                  className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
                >
                  Create Meal Plan
                </Link>
              </div>
            )}
          </div>

          {/* Quick Actions & Lists */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Quick Actions</h3>
              <div className="space-y-2 sm:space-y-3">
                <Link
                  href="/meal-plan"
                  className="w-full flex items-center justify-between p-2 sm:p-3 bg-red-50 text-red-700 rounded-lg hover:bg-red-100"
                >
                  <div className="flex items-center">
                    <CalendarIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3" />
                    <span className="text-sm sm:text-base">Manage Meal Plan</span>
                  </div>
                </Link>
                <Link
                  href="/shopping-list"
                  className="w-full flex items-center justify-between p-2 sm:p-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100"
                >
                  <div className="flex items-center">
                    <ShoppingCartIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3" />
                    <span className="text-sm sm:text-base">Shopping List</span>
                  </div>
                  {dashboardData?.shoppingList?.items.length && (
                    <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full">
                      {dashboardData.shoppingList.items.length}
                    </span>
                  )}
                </Link>
                <Link
                  href="/recipes"
                  className="w-full flex items-center justify-between p-2 sm:p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100"
                >
                  <div className="flex items-center">
                    <ChefHatIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3" />
                    <span className="text-sm sm:text-base">Browse Recipes</span>
                  </div>
                </Link>
              </div>
            </div>

            {/* Saved Recipes */}
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Want to Make</h3>
                <BookmarkIcon className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600" />
              </div>
              {dashboardData?.savedRecipes && dashboardData.savedRecipes.length > 0 ? (
                <div className="space-y-3">
                  {dashboardData.savedRecipes.slice(0, 3).map((recipe) => {
                    const imageUrl = recipe.s3_medium_url || recipe.image_url || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzliYTViZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
                    return (
                      <Link
                        key={recipe.id}
                        href={`/recipe/${recipe.recipe_id}`}
                        className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                      >
                        <img
                          src={imageUrl}
                          alt={recipe.title}
                          className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                          onError={(e) => {
                            e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzliYTViZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
                          }}
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{recipe.title}</h4>
                          <p className="text-sm text-gray-600">{recipe.summary}</p>
                        </div>
                      </Link>
                    );
                  })}
                  {dashboardData.savedRecipes.length > 3 && (
                    <p className="text-center text-gray-500 text-sm">
                      +{dashboardData.savedRecipes.length - 3} more saved
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No saved recipes yet</p>
              )}
            </div>

            {/* Loved Recipes */}
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Loved Recipes</h3>
                <HeartIcon className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 fill-current" />
              </div>
              {dashboardData?.lovedRecipes && dashboardData.lovedRecipes.length > 0 ? (
                <div className="space-y-3">
                  {dashboardData.lovedRecipes.slice(0, 3).map((recipe) => {
                    const imageUrl = recipe.s3_medium_url || recipe.image_url || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzliYTViZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
                    return (
                      <Link
                        key={recipe.recipe_id}
                        href={`/recipe/${recipe.recipe_id}`}
                        className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                      >
                        <img
                          src={imageUrl}
                          alt={recipe.title}
                          className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                          onError={(e) => {
                            e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzliYTViZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
                          }}
                        />
                        <div className="flex items-center justify-between flex-1">
                          <div>
                            <h4 className="font-medium text-gray-900">{recipe.title}</h4>
                            <p className="text-sm text-gray-600">{recipe.summary}</p>
                          </div>
                          <div className="flex items-center space-x-1 text-xs text-gray-500">
                            <span>❤️ {recipe.reactions.love}</span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                  {dashboardData.lovedRecipes.length > 3 && (
                    <p className="text-center text-gray-500 text-sm">
                      +{dashboardData.lovedRecipes.length - 3} more loved
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No loved recipes yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}