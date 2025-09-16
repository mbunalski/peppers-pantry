"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChefHatIcon, ClockIcon, UsersIcon, ExternalLinkIcon, SearchIcon, FilterIcon, XIcon, LockIcon } from "lucide-react";
import Header from "../../components/Header";
import { useAuth } from "../../contexts/AuthContext";


// Filter options
const cuisineOptions = ["Italian", "Asian", "Thai", "Mediterranean", "Mexican", "American"];
const dietaryOptions = ["vegetarian", "vegan"];
const difficultyOptions = ["Easy", "Medium", "Hard"];
const timeRanges = [
  { label: "Under 30 min", max: 30 },
  { label: "30-60 min", min: 30, max: 60 },
  { label: "1-2 hours", min: 60, max: 120 },
  { label: "2+ hours", min: 120 }
];

function RecipesContent() {
  const { user, token } = useAuth();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    cuisine: [] as string[],
    dietary: [] as string[],
    difficulty: [] as string[],
    timeRange: null as any,
  });
  const [recipes, setRecipes] = useState<any[]>([]);
  const [isLoadingRecipes, setIsLoadingRecipes] = useState(true);
  const [userSavedRecipes, setUserSavedRecipes] = useState<number[]>([]);
  const [userLovedRecipes, setUserLovedRecipes] = useState<number[]>([]);
  const [isLoadingUserData, setIsLoadingUserData] = useState(false);
  
  // Get filter from URL params
  const filterParam = searchParams.get('filter');

  // Load recipes from API
  useEffect(() => {
    loadRecipes();
  }, [searchTerm, filters]);

  const loadRecipes = async () => {
    setIsLoadingRecipes(true);
    try {
      const params = new URLSearchParams();

      if (searchTerm) {
        params.set('search', searchTerm);
      }

      // Add tags based on filters
      const tags = [];
      if (filters.cuisine.length > 0) {
        tags.push(...filters.cuisine.map(c => c.toLowerCase()));
      }
      if (filters.dietary.length > 0) {
        tags.push(...filters.dietary);
      }
      if (filters.difficulty.length > 0) {
        tags.push(...filters.difficulty.map(d => d.toLowerCase()));
      }

      if (tags.length > 0) {
        params.set('tags', tags.join(','));
      }

      // Time range filters
      if (filters.timeRange) {
        if (filters.timeRange.min) {
          params.set('minTime', filters.timeRange.min.toString());
        }
        if (filters.timeRange.max) {
          params.set('maxTime', filters.timeRange.max.toString());
        }
      }

      const response = await fetch(`/api/recipes?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setRecipes(data.recipes || []);
      }
    } catch (error) {
      console.error('Error loading recipes:', error);
    } finally {
      setIsLoadingRecipes(false);
    }
  };

  // Filter recipes based on search and filters
  const filteredRecipes = recipes.filter(recipe => {
    // URL filter (saved/loved recipes) - API handles other filters
    let matchesUrlFilter = true;
    if (filterParam === 'saved' && user) {
      matchesUrlFilter = userSavedRecipes.includes(recipe.id);
    } else if (filterParam === 'loved' && user) {
      matchesUrlFilter = userLovedRecipes.includes(recipe.id);
    }

    return matchesUrlFilter;
  });

  // Load user's saved and loved recipes when user logs in or filter param changes
  useEffect(() => {
    if (user && token) {
      loadUserRecipeData();
    }
  }, [user, token, filterParam]);

  const loadUserRecipeData = async () => {
    if (!user || !token) return;
    
    setIsLoadingUserData(true);
    try {
      // Always load both saved and loved recipes so we can show counts and filter properly
      const [savedResponse, lovedResponse] = await Promise.all([
        fetch('/api/user/saved-recipes', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/user/loved-recipes', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (savedResponse.ok) {
        const savedData = await savedResponse.json();
        setUserSavedRecipes(savedData.recipes.map((r: any) => r.recipe_id));
      }
      
      if (lovedResponse.ok) {
        const lovedData = await lovedResponse.json();
        setUserLovedRecipes(lovedData.recipes.map((r: any) => r.recipe_id));
      }
    } catch (error) {
      console.error('Error loading user recipe data:', error);
    } finally {
      setIsLoadingUserData(false);
    }
  };

  const handleFilterChange = (filterType: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: prev[filterType as keyof typeof prev].includes(value)
        ? (prev[filterType as keyof typeof prev] as string[]).filter((item: string) => item !== value)
        : [...(prev[filterType as keyof typeof prev] as string[]), value]
    }));
  };

  const handleTimeRangeFilter = (range: any) => {
    setFilters(prev => ({
      ...prev,
      timeRange: prev.timeRange === range ? null : range
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      cuisine: [],
      dietary: [],
      difficulty: [],
      timeRange: null,
    });
    setSearchTerm("");
  };

  const activeFilterCount = filters.cuisine.length + filters.dietary.length + 
                            filters.difficulty.length + (filters.timeRange ? 1 : 0);

  const handleAddToPlan = async (recipeId: number) => {
    if (!user) {
      alert('Please sign up to add recipes to your meal plan!');
      window.location.href = '/signup';
      return;
    }

    try {
      const response = await fetch('/api/meal-plan/add-recipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({ recipeId })
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
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
              Recipe Collection
            </h1>
            <p className="mt-4 text-xl text-gray-500 max-w-3xl mx-auto">
              {filterParam === 'saved' ? 'Your saved recipes' : 
               filterParam === 'loved' ? 'Recipes you loved' :
               'Browse our curated collection of 121+ recipes from top food websites. Each recipe is available via SMS - just text the recipe ID to get full details!'}
            </p>
          </div>
        </div>
      </div>

      {/* Search & Filter Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* Recipe Filter Tabs */}
          {user && (
            <div className="mb-6">
              <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg max-w-md">
                <Link
                  href="/recipes"
                  className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors text-center ${
                    !filterParam 
                      ? 'bg-white text-red-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  All Recipes
                </Link>
                <Link
                  href="/recipes?filter=saved"
                  className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors text-center ${
                    filterParam === 'saved'
                      ? 'bg-white text-red-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Saved {!isLoadingUserData && userSavedRecipes.length > 0 && (
                    <span className="ml-1 text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full">
                      {userSavedRecipes.length}
                    </span>
                  )}
                </Link>
                <Link
                  href="/recipes?filter=loved"
                  className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors text-center ${
                    filterParam === 'loved'
                      ? 'bg-white text-red-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Loved {!isLoadingUserData && userLovedRecipes.length > 0 && (
                    <span className="ml-1 text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full">
                      {userLovedRecipes.length}
                    </span>
                  )}
                </Link>
              </div>
            </div>
          )}
          
          {/* Search Bar */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex-1 relative">
              <SearchIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search recipes by name, ingredient, or cuisine..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 text-lg"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center px-4 py-3 rounded-lg border transition-colors ${
                showFilters || activeFilterCount > 0 
                  ? 'bg-red-50 border-red-300 text-red-700' 
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <FilterIcon className="h-5 w-5 mr-2" />
              Filters
              {activeFilterCount > 0 && (
                <span className="ml-2 bg-red-600 text-white rounded-full px-2 py-1 text-xs">
                  {activeFilterCount}
                </span>
              )}
            </button>
            {activeFilterCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="border-t border-gray-200 pt-6">
              <div className="grid md:grid-cols-4 gap-6">
                {/* Cuisine Filter */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Cuisine</h3>
                  <div className="space-y-2">
                    {cuisineOptions.map(cuisine => (
                      <label key={cuisine} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.cuisine.includes(cuisine)}
                          onChange={() => handleFilterChange('cuisine', cuisine)}
                          className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">{cuisine}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Dietary Filter */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Dietary</h3>
                  <div className="space-y-2">
                    {dietaryOptions.map(diet => (
                      <label key={diet} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.dietary.includes(diet)}
                          onChange={() => handleFilterChange('dietary', diet)}
                          className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700 capitalize">{diet}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Difficulty Filter */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Difficulty</h3>
                  <div className="space-y-2">
                    {difficultyOptions.map(difficulty => (
                      <label key={difficulty} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.difficulty.includes(difficulty)}
                          onChange={() => handleFilterChange('difficulty', difficulty)}
                          className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">{difficulty}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Time Filter */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Cooking Time</h3>
                  <div className="space-y-2">
                    {timeRanges.map((range, index) => (
                      <label key={index} className="flex items-center">
                        <input
                          type="radio"
                          name="timeRange"
                          checked={filters.timeRange === range}
                          onChange={() => handleTimeRangeFilter(range)}
                          className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                        />
                        <span className="ml-2 text-sm text-gray-700">{range.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Results Summary */}
          <div className="mt-6 flex items-center justify-between text-sm text-gray-600">
            <span>
              {isLoadingRecipes ? 'Loading recipes...' : isLoadingUserData ? 'Loading...' : `Showing ${filteredRecipes.length} ${filterParam ? `${filterParam} ` : ''}recipes`}
            </span>
            {!filterParam && (
              <span>
                From our collection of 121+ curated recipes
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Recipe Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredRecipes.map((recipe) => (
            <div key={recipe.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              {/* Recipe Header */}
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {recipe.title}
                    </h3>
                    <p className="text-sm text-gray-500 mb-3">
                      {recipe.summary}
                    </p>
                  </div>
                  <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                    ID: {recipe.id}
                  </span>
                </div>

                {/* Recipe Meta */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <ClockIcon className="h-4 w-4 mr-1" />
                      <span>{recipe.time} min</span>
                    </div>
                    <div className="flex items-center">
                      <UsersIcon className="h-4 w-4 mr-1" />
                      <span>{recipe.servings} servings</span>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      recipe.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                      recipe.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {recipe.difficulty}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">🌍 {recipe.cuisine}</span>
                    {recipe.dietary.length > 0 && (
                      <div className="flex space-x-1">
                        {recipe.dietary.map((diet, index) => (
                          <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                            {diet}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Ingredients Preview */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Key Ingredients:</h4>
                  <div className="flex flex-wrap gap-1">
                    {recipe.ingredients.slice(0, 4).map((ingredient, index) => (
                      <span key={index} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                        {ingredient}
                      </span>
                    ))}
                    {recipe.ingredients.length > 4 && (
                      <span className="text-xs text-gray-500">
                        +{recipe.ingredients.length - 4} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    From {recipe.source}
                  </div>
                  <div className="flex space-x-2">
                    <Link 
                      href={`/recipe/${recipe.id}`}
                      className="bg-red-600 text-white text-sm px-3 py-2 rounded hover:bg-red-700"
                    >
                      View Recipe
                    </Link>
                    <button
                      onClick={() => handleAddToPlan(recipe.id)}
                      className={`text-sm px-3 py-2 rounded ${
                        user 
                          ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      + Add to Plan
                    </button>
                    {recipe.url !== "#" && (
                      <a 
                        href={recipe.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-500 hover:text-gray-700 p-2"
                      >
                        <ExternalLinkIcon className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
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
    </div>
  );
}

export default function Recipes() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RecipesContent />
    </Suspense>
  );
}