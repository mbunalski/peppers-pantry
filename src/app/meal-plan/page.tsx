import Link from "next/link";
import { ChefHatIcon, CalendarIcon, ShoppingCartIcon, MessageSquareIcon, ClockIcon, DollarSignIcon } from "lucide-react";

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
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <ChefHatIcon className="h-8 w-8 text-red-600" />
                <span className="ml-2 text-2xl font-bold text-gray-900">Pepper's Pantry</span>
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link href="/" className="text-gray-500 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium">Home</Link>
                <Link href="/recipes" className="text-gray-500 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium">Recipes</Link>
                <Link href="/meal-plan" className="text-gray-900 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium">Meal Plans</Link>
                <Link href="/privacy" className="text-gray-500 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium">Privacy</Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
              Smart Meal Planning
            </h1>
            <p className="mt-4 text-xl text-gray-500 max-w-3xl mx-auto">
              Get personalized weekly meal plans delivered via SMS. Set your preferences once and receive custom meal plans that fit your lifestyle.
            </p>
          </div>
        </div>
      </div>

      {/* How Meal Planning Works */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-red-600 font-bold text-xl">1</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Set Your Preferences</h3>
              <p className="text-gray-600 text-sm mb-3">Tell us your dietary needs, budget, and time constraints</p>
              <div className="bg-gray-50 p-3 rounded">
                <code className="text-xs text-gray-700">"prefs vegetarian, budget 15, time 30"</code>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 font-bold text-xl">2</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Request Your Plan</h3>
              <p className="text-gray-600 text-sm mb-3">Text "plan" to get your personalized weekly meal schedule</p>
              <div className="bg-gray-50 p-3 rounded">
                <code className="text-xs text-gray-700">"plan"</code>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 font-bold text-xl">3</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Get Shopping List</h3>
              <p className="text-gray-600 text-sm mb-3">Generate a complete shopping list for your meal plan</p>
              <div className="bg-gray-50 p-3 rounded">
                <code className="text-xs text-gray-700">"shopping"</code>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sample Meal Plan */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Meal Plan */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Sample Weekly Meal Plan</h2>
                <CalendarIcon className="h-8 w-8 text-red-600" />
              </div>
              
              <div className="space-y-4">
                {sampleMealPlan.map((meal, index) => (
                  <div key={index} className="flex items-center p-4 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0 w-20">
                      <span className="text-sm font-medium text-gray-700">{meal.day}</span>
                    </div>
                    <div className="flex-1 ml-4">
                      <h3 className="text-base font-medium text-gray-900">{meal.meal}</h3>
                    </div>
                    <div className="flex-shrink-0">
                      <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                        Get Recipe
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-red-50 rounded-lg">
                <div className="flex items-center">
                  <MessageSquareIcon className="h-5 w-5 text-red-600 mr-2" />
                  <span className="text-sm font-medium text-red-800">
                    Text "plan" to get your personalized meal plan!
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Preferences & Actions */}
          <div className="space-y-6">
            {/* Current Preferences */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Sample Preferences</h3>
              <div className="space-y-3">
                {samplePreferences.dietary.length > 0 && (
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-700 w-16">Diet:</span>
                    <div className="flex flex-wrap gap-1">
                      {samplePreferences.dietary.map((diet, index) => (
                        <span key={index} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                          {diet}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex items-center">
                  <DollarSignIcon className="h-4 w-4 text-gray-500 mr-1" />
                  <span className="text-sm text-gray-700">Budget: ${samplePreferences.budget}/meal</span>
                </div>
                <div className="flex items-center">
                  <ClockIcon className="h-4 w-4 text-gray-500 mr-1" />
                  <span className="text-sm text-gray-700">Max time: {samplePreferences.time} minutes</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-gray-700">Complexity: {samplePreferences.complexity}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center justify-center">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  Text "plan"
                </button>
                <button className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center">
                  <ShoppingCartIcon className="h-4 w-4 mr-2" />
                  Text "shopping"
                </button>
                <button className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center justify-center">
                  <MessageSquareIcon className="h-4 w-4 mr-2" />
                  Text "prefs show"
                </button>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">💡 Pro Tips</h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li>• Update preferences anytime: "prefs keto, budget 20"</li>
                <li>• Get recipe details: "recipe 245"</li>
                <li>• Search by name: "show chicken alfredo"</li>
                <li>• Find by ingredients: "suggest pasta, cheese"</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Why Choose SMS Meal Planning?
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-red-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <MessageSquareIcon className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">No App Required</h3>
              <p className="text-sm text-gray-600">Works with any phone that can text</p>
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

      {/* CTA */}
      <div className="bg-red-600 text-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold mb-4">
              Start Planning Your Meals Today
            </h2>
            <p className="text-xl text-red-200 mb-6">
              Join thousands of home cooks who have simplified their meal planning with SMS!
            </p>
            <div className="bg-red-700 rounded-lg p-4 max-w-lg mx-auto">
              <p className="text-red-100 mb-2">Coming Soon:</p>
              <code className="text-red-100 text-lg">
                Text (555) MEAL-PLAN
              </code>
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
    </div>
  );
}