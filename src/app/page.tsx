import Link from "next/link";
import { ChefHatIcon, MessageSquareIcon, CalendarIcon, ShoppingCartIcon, SparklesIcon, ClockIcon } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur-sm shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <ChefHatIcon className="h-8 w-8 text-red-600" />
              <span className="ml-2 text-2xl font-bold text-gray-900">Pepper's Pantry</span>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link href="/" className="text-gray-900 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium">Home</Link>
                <Link href="/recipes" className="text-gray-500 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium">Recipes</Link>
                <Link href="/meal-plan" className="text-gray-500 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium">Meal Plans</Link>
                <Link href="/privacy" className="text-gray-500 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium">Privacy</Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-transparent sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block xl:inline">Smart meal planning</span>{' '}
                  <span className="block text-red-600 xl:inline">via text message</span>
                </h1>
                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Get personalized meal plans, recipe suggestions, and shopping lists delivered directly to your phone. 
                  No app downloads, no complicated interfaces - just text and cook!
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <Link
                      href="#how-it-works"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700 md:py-4 md:text-lg md:px-10"
                    >
                      Get Started
                    </Link>
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <Link
                      href="/recipes"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 md:py-4 md:text-lg md:px-10"
                    >
                      Browse Recipes
                    </Link>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          <div className="h-56 w-full bg-gradient-to-r from-orange-400 to-red-500 sm:h-72 md:h-96 lg:w-full lg:h-full flex items-center justify-center">
            <div className="text-white text-center">
              <MessageSquareIcon className="h-24 w-24 mx-auto mb-4 opacity-80" />
              <p className="text-xl font-semibold">Text "plan" to get started!</p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-red-600 font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need for meal planning
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Powered by 121+ curated recipes from top food websites, with smart recommendations based on your preferences.
            </p>
          </div>

          <div className="mt-10">
            <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              <div className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-red-500 text-white">
                    <CalendarIcon className="h-6 w-6" />
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Weekly Meal Plans</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">
                  Get personalized 4-meal weekly plans based on your dietary preferences, budget, and time constraints.
                </dd>
              </div>

              <div className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-red-500 text-white">
                    <SparklesIcon className="h-6 w-6" />
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Smart Recipe Suggestions</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">
                  Text ingredients you have on hand and get instant recipe recommendations from our curated database.
                </dd>
              </div>

              <div className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-red-500 text-white">
                    <ShoppingCartIcon className="h-6 w-6" />
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Automated Shopping Lists</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">
                  Generate complete shopping lists for your meal plans with all ingredients and quantities.
                </dd>
              </div>

              <div className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-red-500 text-white">
                    <ClockIcon className="h-6 w-6" />
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Full Recipe Details</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">
                  Get complete ingredients lists and step-by-step instructions delivered directly to your phone.
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div id="how-it-works" className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-red-600 font-semibold tracking-wide uppercase">How It Works</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Simple as 1-2-3
            </p>
          </div>

          <div className="mt-10">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-10">
              <div className="text-center">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-red-500 text-white text-xl font-bold mx-auto">
                  1
                </div>
                <h3 className="mt-4 text-lg leading-6 font-medium text-gray-900">Set Your Preferences</h3>
                <p className="mt-2 text-base text-gray-500">
                  Text your dietary preferences, budget, and time constraints. We'll remember them for future recommendations.
                </p>
                <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                  <code className="text-sm text-gray-700">
                    "prefs vegetarian, budget 15, time 30"
                  </code>
                </div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-red-500 text-white text-xl font-bold mx-auto">
                  2
                </div>
                <h3 className="mt-4 text-lg leading-6 font-medium text-gray-900">Get Your Plan</h3>
                <p className="mt-2 text-base text-gray-500">
                  Text "plan" to receive a personalized weekly meal plan, or "suggest chicken, rice" for specific recipes.
                </p>
                <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                  <code className="text-sm text-gray-700">
                    "plan" or "suggest pasta, cheese"
                  </code>
                </div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-red-500 text-white text-xl font-bold mx-auto">
                  3
                </div>
                <h3 className="mt-4 text-lg leading-6 font-medium text-gray-900">Cook & Enjoy</h3>
                <p className="mt-2 text-base text-gray-500">
                  Get shopping lists, full recipes, and cooking instructions. Everything you need to create delicious meals!
                </p>
                <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                  <code className="text-sm text-gray-700">
                    "shopping" or "recipe 245"
                  </code>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-red-600">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">Ready to simplify meal planning?</span>
            <span className="block text-red-200">Start texting recipes today.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <div className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-red-600 bg-white hover:bg-gray-50">
                <MessageSquareIcon className="h-5 w-5 mr-2" />
                Text: Coming Soon!
              </div>
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
