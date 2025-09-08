import Link from "next/link";
import { ChefHatIcon, ClockIcon, UsersIcon, ExternalLinkIcon } from "lucide-react";

// Sample recipes data - in a real app, this would come from your API
const sampleRecipes = [
  {
    id: 245,
    title: "Tofu stir-fry",
    time: 30,
    servings: 4,
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
    summary: "Layered pasta dish with meat sauce, cheese, and bechamel",
    ingredients: ["ground beef", "lasagna noodles", "ricotta", "mozzarella", "tomato sauce"],
    source: "AllRecipes",
    url: "#"
  }
];

export default function Recipes() {
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
                <Link href="/recipes" className="text-gray-900 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium">Recipes</Link>
                <Link href="/meal-plan" className="text-gray-500 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium">Meal Plans</Link>
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
              Recipe Collection
            </h1>
            <p className="mt-4 text-xl text-gray-500 max-w-3xl mx-auto">
              Browse our curated collection of 121+ recipes from top food websites. 
              Each recipe is available via SMS - just text the recipe ID to get full details!
            </p>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Find Recipes</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-red-50 p-4 rounded-lg">
              <h3 className="font-semibold text-red-900 mb-2">By Ingredients</h3>
              <p className="text-sm text-red-700 mb-3">Text ingredients you have on hand</p>
              <div className="bg-white p-2 rounded border">
                <code className="text-sm text-gray-700">"suggest chicken, rice"</code>
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">By Recipe Name</h3>
              <p className="text-sm text-green-700 mb-3">Search for a specific recipe</p>
              <div className="bg-white p-2 rounded border">
                <code className="text-sm text-gray-700">"show pasta bake"</code>
              </div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">By Recipe ID</h3>
              <p className="text-sm text-blue-700 mb-3">Get full recipe details</p>
              <div className="bg-white p-2 rounded border">
                <code className="text-sm text-gray-700">"recipe 245"</code>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recipe Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sampleRecipes.map((recipe) => (
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
                <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                  <div className="flex items-center">
                    <ClockIcon className="h-4 w-4 mr-1" />
                    <span>{recipe.time} min</span>
                  </div>
                  <div className="flex items-center">
                    <UsersIcon className="h-4 w-4 mr-1" />
                    <span>{recipe.servings} servings</span>
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
                    <button className="bg-red-600 text-white text-sm px-3 py-2 rounded hover:bg-red-700">
                      Text recipe {recipe.id}
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