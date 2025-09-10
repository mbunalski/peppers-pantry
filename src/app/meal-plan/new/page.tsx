"use client";

import { useState } from "react";
import Link from "next/link";
import { ChefHatIcon, CalendarIcon, RefreshCwIcon, ShoppingCartIcon, SaveIcon, XIcon, SearchIcon, LockIcon } from "lucide-react";
import Header from "../../../components/Header";

// Mock recipe suggestions
const mockRecipeSuggestions = [
  { id: 245, name: "Tofu Stir-fry", time: 30, difficulty: "Easy", cuisine: "Asian" },
  { id: 194, name: "Bolognese Sauce", time: 120, difficulty: "Medium", cuisine: "Italian" },
  { id: 43, name: "Chicken Alfredo", time: 25, difficulty: "Easy", cuisine: "Italian" },
  { id: 129, name: "World's Best Lasagna", time: 90, difficulty: "Medium", cuisine: "Italian" },
  { id: 76, name: "Thai Curry", time: 45, difficulty: "Medium", cuisine: "Thai" },
  { id: 88, name: "Greek Salad Bowl", time: 15, difficulty: "Easy", cuisine: "Mediterranean" }
];

// Days of the week
const daysOfWeek = [
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
];

interface Recipe {
  id: number;
  name: string;
  time: number;
  difficulty: string;
  cuisine: string;
}

interface MealPlan {
  [key: string]: Recipe | null;
}

export default function NewMealPlan() {
  const [mealPlan, setMealPlan] = useState<MealPlan>(
    daysOfWeek.reduce((acc, day) => ({ ...acc, [day]: null }), {})
  );
  const [editingDay, setEditingDay] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const addRecipeToDay = (day: string, recipe: Recipe) => {
    setMealPlan(prev => ({ ...prev, [day]: recipe }));
    setEditingDay(null);
  };

  const removeRecipeFromDay = (day: string) => {
    setMealPlan(prev => ({ ...prev, [day]: null }));
  };

  const generateRandomMealPlan = () => {
    const shuffled = [...mockRecipeSuggestions].sort(() => 0.5 - Math.random());
    const newPlan: MealPlan = {};
    daysOfWeek.forEach((day, index) => {
      newPlan[day] = shuffled[index % shuffled.length];
    });
    setMealPlan(newPlan);
  };

  const filteredRecipes = mockRecipeSuggestions.filter(recipe =>
    recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recipe.cuisine.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const plannedMealsCount = Object.values(mealPlan).filter(meal => meal !== null).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      {/* Auth Gate */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between bg-red-50 rounded-lg p-4">
            <div className="flex items-center">
              <LockIcon className="h-5 w-5 text-red-600 mr-2" />
              <span className="text-red-800 font-medium">Sign up required to create meal plans</span>
            </div>
            <div className="flex space-x-3">
              <Link href="/signup" className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-sm">
                Sign Up Free
              </Link>
              <Link href="/login" className="text-red-600 hover:text-red-700 text-sm">
                Login
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <CalendarIcon className="h-8 w-8 text-red-600 mr-3" />
                Create New Meal Plan
              </h1>
              <p className="text-gray-600 mt-1">Plan your meals for the week ahead</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={generateRandomMealPlan}
                className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <RefreshCwIcon className="h-4 w-4 mr-2" />
                Auto-Generate
              </button>
              <button className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                <SaveIcon className="h-4 w-4 mr-2" />
                Save Plan
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Meal Planning Grid */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Weekly Meal Plan</h2>
              
              <div className="space-y-4">
                {daysOfWeek.map((day) => (
                  <div key={day} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900">{day}</h3>
                      {mealPlan[day] ? (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setEditingDay(day)}
                            className="text-red-600 hover:text-red-700 text-sm"
                          >
                            Change
                          </button>
                          <button
                            onClick={() => removeRecipeFromDay(day)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <XIcon className="h-4 w-4" />
                          </button>
                        </div>
                      ) : null}
                    </div>
                    
                    {mealPlan[day] ? (
                      <div className="mt-3 p-3 bg-red-50 rounded-lg">
                        <h4 className="font-medium text-gray-900">{mealPlan[day]?.name}</h4>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                          <span>⏱️ {mealPlan[day]?.time} min</span>
                          <span>📊 {mealPlan[day]?.difficulty}</span>
                          <span>🌍 {mealPlan[day]?.cuisine}</span>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setEditingDay(day)}
                        className="mt-3 w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-red-300 hover:text-red-600 transition-colors"
                      >
                        + Add meal for {day}
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Generate Shopping List */}
              {plannedMealsCount > 0 && (
                <div className="mt-6 p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-green-900">Ready to shop?</h3>
                      <p className="text-sm text-green-700">
                        You have {plannedMealsCount} meals planned. Generate your shopping list!
                      </p>
                    </div>
                    <Link
                      href="/shopping-list"
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
                    >
                      <ShoppingCartIcon className="h-4 w-4 mr-2" />
                      Shopping List
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Recipe Selection Sidebar */}
          <div className="space-y-6">
            {editingDay && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Choose meal for {editingDay}
                  </h3>
                  <button
                    onClick={() => setEditingDay(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XIcon className="h-5 w-5" />
                  </button>
                </div>

                {/* Search */}
                <div className="mb-4">
                  <div className="relative">
                    <SearchIcon className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search recipes..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                </div>

                {/* Recipe List */}
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredRecipes.map((recipe) => (
                    <button
                      key={recipe.id}
                      onClick={() => addRecipeToDay(editingDay, recipe)}
                      className="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-red-300 hover:bg-red-50"
                    >
                      <h4 className="font-medium text-gray-900">{recipe.name}</h4>
                      <div className="flex items-center space-x-3 mt-1 text-sm text-gray-600">
                        <span>⏱️ {recipe.time}m</span>
                        <span>📊 {recipe.difficulty}</span>
                        <span>🌍 {recipe.cuisine}</span>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <Link
                    href="/recipes"
                    className="block text-center text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    Browse all 121+ recipes →
                  </Link>
                </div>
              </div>
            )}

            {/* Planning Tips */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 Planning Tips</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Plan 4-5 meals per week for flexibility</li>
                <li>• Mix easy weeknight meals with weekend projects</li>
                <li>• Consider prep time on busy days</li>
                <li>• Choose recipes that share ingredients</li>
                <li>• Plan for leftovers on lighter days</li>
              </ul>
            </div>

            {/* Preferences Reminder */}
            <div className="bg-red-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-red-900 mb-2">Your Preferences</h3>
              <div className="space-y-1 text-sm text-red-700">
                <p>• Vegetarian meals</p>
                <p>• Budget: $15 per meal</p>
                <p>• Max time: 30 minutes</p>
              </div>
              <Link
                href="/preferences"
                className="inline-block mt-3 text-red-600 hover:text-red-700 text-sm font-medium"
              >
                Update preferences →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}