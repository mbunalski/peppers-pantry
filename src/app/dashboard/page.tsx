import Link from "next/link";
import { ChefHatIcon, CalendarIcon, ShoppingCartIcon, UserIcon, SettingsIcon, LogOutIcon, PlusIcon, EditIcon } from "lucide-react";
import Header from "../../components/Header";

// Mock user data - in real app this would come from authentication
const mockUser = {
  name: "Sarah Johnson",
  email: "sarah@example.com",
  preferences: {
    dietary: ["vegetarian"],
    budget: 15,
    time: 30,
    complexity: "medium"
  }
};

// Mock current meal plan
const mockMealPlan = [
  { day: "Monday", meal: "Vegetarian Stir Fry", completed: true },
  { day: "Tuesday", meal: "Pasta Primavera", completed: false },
  { day: "Wednesday", meal: "Buddha Bowl", completed: false },
  { day: "Thursday", meal: "Veggie Burgers", completed: false }
];

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {mockUser.name.split(' ')[0]}!
              </h1>
              <p className="text-gray-600 mt-1">Here's your meal planning dashboard</p>
            </div>
            <div className="flex space-x-3">
              <Link
                href="/meal-plan/new"
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                New Meal Plan
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Meal Plan */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">This Week's Meal Plan</h2>
                <button className="text-red-600 hover:text-red-700 flex items-center text-sm">
                  <EditIcon className="h-4 w-4 mr-1" />
                  Edit Plan
                </button>
              </div>
              
              <div className="space-y-3">
                {mockMealPlan.map((meal, index) => (
                  <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <input 
                      type="checkbox" 
                      checked={meal.completed}
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded mr-3"
                    />
                    <div className="flex-1">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-700 w-20">{meal.day}</span>
                        <span className={`text-sm ${meal.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                          {meal.meal}
                        </span>
                      </div>
                    </div>
                    <button className="text-red-600 hover:text-red-700 text-sm">
                      View Recipe
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3 bg-red-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-red-800">Need your shopping list?</span>
                  <Link href="/shopping-list" className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700">
                    Generate List
                  </Link>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Link href="/recipes/search" className="p-4 border border-gray-200 rounded-lg hover:border-red-300 hover:bg-red-50">
                  <div className="text-center">
                    <ChefHatIcon className="h-8 w-8 text-red-600 mx-auto mb-2" />
                    <h4 className="font-medium text-gray-900">Browse Recipes</h4>
                    <p className="text-sm text-gray-500">121+ curated recipes</p>
                  </div>
                </Link>
                <Link href="/meal-plan/new" className="p-4 border border-gray-200 rounded-lg hover:border-red-300 hover:bg-red-50">
                  <div className="text-center">
                    <CalendarIcon className="h-8 w-8 text-red-600 mx-auto mb-2" />
                    <h4 className="font-medium text-gray-900">New Meal Plan</h4>
                    <p className="text-sm text-gray-500">Plan next week</p>
                  </div>
                </Link>
                <Link href="/shopping-list" className="p-4 border border-gray-200 rounded-lg hover:border-red-300 hover:bg-red-50">
                  <div className="text-center">
                    <ShoppingCartIcon className="h-8 w-8 text-red-600 mx-auto mb-2" />
                    <h4 className="font-medium text-gray-900">Shopping List</h4>
                    <p className="text-sm text-gray-500">Current week's list</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* User Profile */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center mb-4">
                <div className="bg-red-100 rounded-full p-3">
                  <UserIcon className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-gray-900">{mockUser.name}</h3>
                  <p className="text-sm text-gray-500">{mockUser.email}</p>
                </div>
              </div>
              <Link href="/preferences" className="block text-center bg-gray-50 hover:bg-gray-100 px-4 py-2 rounded-lg text-sm text-gray-700">
                Edit Profile & Preferences
              </Link>
            </div>

            {/* Current Preferences */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Preferences</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-700">Diet:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {mockUser.preferences.dietary.map((diet, index) => (
                      <span key={index} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                        {diet}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-700">Budget per meal:</span>
                  <span className="text-sm font-medium text-gray-900">${mockUser.preferences.budget}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-700">Max cooking time:</span>
                  <span className="text-sm font-medium text-gray-900">{mockUser.preferences.time} min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-700">Complexity:</span>
                  <span className="text-sm font-medium text-gray-900">{mockUser.preferences.complexity}</span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-700">Meals planned:</span>
                  <span className="text-sm font-medium text-gray-900">24</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-700">Recipes tried:</span>
                  <span className="text-sm font-medium text-gray-900">12</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-700">Money saved:</span>
                  <span className="text-sm font-medium text-green-600">$127</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}