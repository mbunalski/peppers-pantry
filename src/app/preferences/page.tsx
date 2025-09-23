"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChefHatIcon, DollarSignIcon, ClockIcon, ChevronRightIcon } from "lucide-react";
import Layout from "../../components/Layout";
import { useAuth } from "../../contexts/AuthContext";

// Dietary options
const dietaryOptions = [
  { id: "omnivore", label: "Omnivore", description: "Eats everything" },
  { id: "vegetarian", label: "Vegetarian", description: "No meat, but includes dairy & eggs" },
  { id: "vegan", label: "Vegan", description: "Plant-based only" },
  { id: "keto", label: "Keto", description: "High fat, low carb" },
  { id: "paleo", label: "Paleo", description: "Whole foods, no processed foods" },
  { id: "mediterranean", label: "Mediterranean", description: "Fish, vegetables, olive oil focus" }
];

// Allergen options
const allergenOptions = [
  "Nuts", "Dairy", "Eggs", "Fish", "Shellfish", "Soy", "Wheat/Gluten", "Sesame"
];

// Cuisine preferences
const cuisineOptions = [
  "Italian", "Mexican", "Asian", "Indian", "Mediterranean", "American", "French", "Thai", "Greek", "Middle Eastern"
];

export default function Preferences() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [preferences, setPreferences] = useState({
    dietary_restrictions: [],
    budget_per_meal: 15,
    max_cooking_time: 30,
    complexity: 'intermediate',
    allergens: [],
    favorite_cuisines: [],
    meals_per_week: 7
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!user && !token) {
      router.push('/login');
    }
  }, [user, token, router]);

  // Load existing preferences
  useEffect(() => {
    if (user && token) {
      loadPreferences();
    }
  }, [user, token]);

  const loadPreferences = async () => {
    try {
      const response = await fetch('/api/user/preferences', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setPreferences(data);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const handleCheckboxChange = (category: string, value: string) => {
    setPreferences(prev => {
      const currentValues = prev[category] || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      return { ...prev, [category]: newValues };
    });
  };

  const handleRangeChange = (field: string, value: number) => {
    setPreferences(prev => ({ ...prev, [field]: value }));
  };

  const handleRadioChange = (field: string, value: string) => {
    setPreferences(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/user/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(preferences)
      });

      if (response.ok) {
        router.push('/meal-plan');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to save preferences');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Let's personalize your meal planning
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Tell us about your preferences so we can create the perfect meal plans for you
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          <form className="space-y-12" onSubmit={handleSubmit}>
            {/* Dietary Preferences */}
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Dietary Preferences</h2>
              <p className="text-gray-600 mb-6">Select all that apply to your diet</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dietaryOptions.map((option) => (
                  <label key={option.id} className="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-red-300 cursor-pointer">
                    <input
                      type="checkbox"
                      name="dietary"
                      value={option.id}
                      checked={preferences.dietary_restrictions.includes(option.id)}
                      onChange={(e) => handleCheckboxChange('dietary_restrictions', option.id)}
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                    />
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">{option.label}</div>
                      <div className="text-sm text-gray-500">{option.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Budget, Time & Meal Planning Constraints */}
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Budget per Meal</h2>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <DollarSignIcon className="h-5 w-5 text-gray-400 mr-2" />
                    <input
                      type="range"
                      min="5"
                      max="50"
                      value={preferences.budget_per_meal}
                      onChange={(e) => handleRangeChange('budget_per_meal', Number(e.target.value))}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <span className="ml-3 text-lg font-medium text-gray-900">${preferences.budget_per_meal}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>$5</span>
                    <span>$50+</span>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Cooking Time</h2>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <ClockIcon className="h-5 w-5 text-gray-400 mr-2" />
                    <input
                      type="range"
                      min="15"
                      max="120"
                      value={preferences.max_cooking_time}
                      onChange={(e) => handleRangeChange('max_cooking_time', Number(e.target.value))}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <span className="ml-3 text-lg font-medium text-gray-900">{preferences.max_cooking_time} min</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>15 min</span>
                    <span>2+ hours</span>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Meals per Week</h2>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <ChefHatIcon className="h-5 w-5 text-gray-400 mr-2" />
                    <input
                      type="range"
                      min="1"
                      max="14"
                      value={preferences.meals_per_week}
                      onChange={(e) => handleRangeChange('meals_per_week', Number(e.target.value))}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <span className="ml-3 text-lg font-medium text-gray-900">{preferences.meals_per_week} meals</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>1 meal</span>
                    <span>14 meals</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Cooking Complexity */}
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Cooking Complexity</h2>
              <p className="text-gray-600 mb-6">How complex do you want your recipes to be?</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {["Beginner", "Intermediate", "Advanced"].map((level) => (
                  <label key={level} className="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-red-300 cursor-pointer">
                    <input
                      type="radio"
                      name="complexity"
                      value={level.toLowerCase()}
                      checked={preferences.complexity === level.toLowerCase()}
                      onChange={(e) => handleRadioChange('complexity', level.toLowerCase())}
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                    />
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">{level}</div>
                      <div className="text-sm text-gray-500">
                        {level === "Beginner" && "Simple recipes, basic techniques"}
                        {level === "Intermediate" && "Moderate complexity, some skills required"}
                        {level === "Advanced" && "Complex recipes, advanced techniques"}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Allergies & Dislikes */}
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Allergies & Restrictions</h2>
              <p className="text-gray-600 mb-6">Select any foods you need to avoid</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {allergenOptions.map((allergen) => (
                  <label key={allergen} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      name="allergens"
                      value={allergen}
                      checked={preferences.allergens.includes(allergen)}
                      onChange={(e) => handleCheckboxChange('allergens', allergen)}
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">{allergen}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Cuisine Preferences */}
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Favorite Cuisines</h2>
              <p className="text-gray-600 mb-6">Choose cuisines you enjoy (select up to 5)</p>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {cuisineOptions.map((cuisine) => (
                  <label key={cuisine} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      name="cuisines"
                      value={cuisine}
                      checked={preferences.favorite_cuisines.includes(cuisine)}
                      onChange={(e) => handleCheckboxChange('favorite_cuisines', cuisine)}
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">{cuisine}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Additional Preferences */}
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Additional Preferences</h2>
              <div className="space-y-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-gray-700">I prefer recipes with common ingredients I can find easily</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-gray-700">I like trying new and exotic recipes</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-gray-700">I prefer one-pot or minimal cleanup recipes</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-gray-700">I want recipes that make good leftovers</span>
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <Link
                href="/dashboard"
                className="text-gray-600 hover:text-gray-700 font-medium"
              >
                ← Back to Dashboard
              </Link>
              <button
                type="submit"
                disabled={isLoading}
                className="bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700 font-medium flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Saving...' : 'Save Preferences & Create First Meal Plan'}
                <ChevronRightIcon className="h-5 w-5 ml-2" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}