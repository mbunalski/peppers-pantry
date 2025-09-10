"use client";

import { useState } from "react";
import Link from "next/link";
import { ChefHatIcon, ClockIcon, UsersIcon, ExternalLinkIcon, SearchIcon, FilterIcon, XIcon, LockIcon } from "lucide-react";
import Header from "../../components/Header";
import { useAuth } from "../../contexts/AuthContext";

// Sample recipes data - expanded for better filtering
const sampleRecipes = [
  {
    id: 245,
    title: "Tofu stir-fry",
    time: 30,
    servings: 4,
    difficulty: "Easy",
    cuisine: "Asian",
    dietary: ["vegetarian", "vegan"],
    summary: "Quick and healthy vegetarian stir-fry with tofu and fresh vegetables",
    ingredients: ["tofu", "soy sauce", "honey", "broccoli", "carrots", "ginger"],
    source: "BBC Good Food",
    url: "https://www.bbcgoodfood.com/recipes/tofu-stir-fry"
  },
  {
    id: 194,
    title: "Bolognese Sauce",
    time: 120,
    servings: 6,
    difficulty: "Medium",
    cuisine: "Italian",
    dietary: [],
    summary: "Classic Italian meat sauce perfect for pasta dishes",
    ingredients: ["ground beef", "tomatoes", "onion", "garlic", "red wine", "herbs"],
    source: "Serious Eats",
    url: "https://www.seriouseats.com/best-slow-cooked-bolognese-sauce"
  },
  {
    id: 43,
    title: "Chicken Alfredo",
    time: 25,
    servings: 4,
    difficulty: "Easy",
    cuisine: "Italian",
    dietary: [],
    summary: "Creamy pasta dish with tender chicken and rich alfredo sauce",
    ingredients: ["chicken breast", "pasta", "cream", "parmesan", "garlic", "butter"],
    source: "AllRecipes",
    url: "#"
  },
  {
    id: 129,
    title: "World's Best Lasagna",
    time: 90,
    servings: 8,
    difficulty: "Hard",
    cuisine: "Italian",
    dietary: [],
    summary: "Layered pasta dish with meat sauce, cheese, and bechamel",
    ingredients: ["ground beef", "lasagna noodles", "ricotta", "mozzarella", "tomato sauce"],
    source: "AllRecipes",
    url: "#"
  },
  {
    id: 76,
    title: "Thai Green Curry",
    time: 45,
    servings: 4,
    difficulty: "Medium",
    cuisine: "Thai",
    dietary: ["vegetarian"],
    summary: "Aromatic curry with coconut milk and fresh vegetables",
    ingredients: ["curry paste", "coconut milk", "vegetables", "thai basil", "lime"],
    source: "Thai Kitchen",
    url: "#"
  },
  {
    id: 88,
    title: "Greek Salad Bowl",
    time: 15,
    servings: 2,
    difficulty: "Easy",
    cuisine: "Mediterranean",
    dietary: ["vegetarian"],
    summary: "Fresh Mediterranean salad with feta and olives",
    ingredients: ["cucumber", "tomatoes", "feta", "olives", "red onion", "olive oil"],
    source: "Mediterranean Diet",
    url: "#"
  },
  {
    id: 102,
    title: "Beef Tacos",
    time: 35,
    servings: 4,
    difficulty: "Easy",
    cuisine: "Mexican",
    dietary: [],
    summary: "Seasoned ground beef tacos with fresh toppings",
    ingredients: ["ground beef", "taco seasoning", "tortillas", "lettuce", "cheese", "tomatoes"],
    source: "Mexican Cooking",
    url: "#"
  },
  {
    id: 156,
    title: "Quinoa Buddha Bowl",
    time: 40,
    servings: 2,
    difficulty: "Medium",
    cuisine: "American",
    dietary: ["vegetarian", "vegan"],
    summary: "Nutritious bowl with quinoa, roasted vegetables, and tahini dressing",
    ingredients: ["quinoa", "sweet potato", "chickpeas", "spinach", "tahini", "lemon"],
    source: "Healthy Eats",
    url: "#"
  }
];

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

export default function Recipes() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    cuisine: [] as string[],
    dietary: [] as string[],
    difficulty: [] as string[],
    timeRange: null as any,
  });

  // Filter recipes based on search and filters
  const filteredRecipes = sampleRecipes.filter(recipe => {
    // Search term filter
    const matchesSearch = searchTerm === "" || 
      recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipe.ingredients.some(ing => ing.toLowerCase().includes(searchTerm.toLowerCase())) ||
      recipe.cuisine.toLowerCase().includes(searchTerm.toLowerCase());

    // Cuisine filter
    const matchesCuisine = filters.cuisine.length === 0 || filters.cuisine.includes(recipe.cuisine);

    // Dietary filter
    const matchesDietary = filters.dietary.length === 0 || 
      filters.dietary.some(diet => recipe.dietary.includes(diet));

    // Difficulty filter
    const matchesDifficulty = filters.difficulty.length === 0 || filters.difficulty.includes(recipe.difficulty);

    // Time range filter
    const matchesTime = !filters.timeRange || 
      ((!filters.timeRange.min || recipe.time >= filters.timeRange.min) && 
       (!filters.timeRange.max || recipe.time <= filters.timeRange.max));

    return matchesSearch && matchesCuisine && matchesDietary && matchesDifficulty && matchesTime;
  });

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
              Browse our curated collection of 121+ recipes from top food websites. 
              Each recipe is available via SMS - just text the recipe ID to get full details!
            </p>
          </div>
        </div>
      </div>

      {/* Search & Filter Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
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
              Showing {filteredRecipes.length} of {sampleRecipes.length} recipes
            </span>
            <span>
              From our collection of 121+ curated recipes
            </span>
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

      {/* Sign Up Nudge or Meal Planning CTA */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-8 border-2 border-red-200">
          <div className="text-center">
            {user ? (
              <>
                <ChefHatIcon className="h-12 w-12 text-red-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Ready to create your meal plan?
                </h2>
                <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                  You've found some great recipes! Now create a personalized meal plan and generate your shopping list.
                </p>
                <div className="flex items-center justify-center space-x-4">
                  <Link
                    href="/meal-plan"
                    className="bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700 font-medium text-lg"
                  >
                    Create Meal Plan
                  </Link>
                  <Link
                    href="/preferences"
                    className="text-gray-600 hover:text-gray-700 font-medium"
                  >
                    Update preferences
                  </Link>
                </div>
              </>
            ) : (
              <>
                <LockIcon className="h-12 w-12 text-red-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Ready to start meal planning?
                </h2>
                <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                  Create your free account to build personalized meal plans, generate smart shopping lists, 
                  and save your favorite recipes. Join thousands who've simplified their meal planning!
                </p>
                <div className="flex items-center justify-center space-x-4">
                  <Link
                    href="/signup"
                    className="bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700 font-medium text-lg"
                  >
                    Sign Up Free - Start Planning
                  </Link>
                  <Link
                    href="/login"
                    className="text-gray-600 hover:text-gray-700 font-medium"
                  >
                    Already have an account?
                  </Link>
                </div>
                <div className="mt-4 text-sm text-gray-500">
                  ✓ Free forever ✓ No credit card required ✓ Set up in 2 minutes
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* SMS Instructions */}
      <div className="bg-red-600 text-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold mb-4">
              Ready to cook?
            </h2>
            <p className="text-xl text-red-200 mb-6">
              Text any recipe ID to get the full recipe with ingredients and instructions!
            </p>
            <div className="bg-red-700 rounded-lg p-4 max-w-md mx-auto">
              <code className="text-red-100">
                Text "recipe 245" to get the Tofu Stir-fry recipe
              </code>
            </div>
            <p className="text-sm text-red-200 mt-4">
              SMS service coming soon! 📱
            </p>
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
    </div>
  );
}