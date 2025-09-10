"use client";

import Link from "next/link";
import { ChefHatIcon, MessageSquareIcon, CalendarIcon, ShoppingCartIcon, SparklesIcon, ClockIcon } from "lucide-react";
import Header from "../components/Header";
import { useAuth } from "../contexts/AuthContext";

export default function Home() {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <Header />

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-transparent sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block xl:inline">Smart meal planning</span>{' '}
                  <span className="block text-red-600 xl:inline">made simple</span>
                </h1>
                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Create personalized weekly meal plans, discover new recipes, and generate smart shopping lists. 
                  Take the stress out of deciding "what's for dinner" with AI-powered recommendations tailored to your preferences.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <Link
                      href={user ? "/meal-plan" : "/signup"}
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700 md:py-4 md:text-lg md:px-10"
                    >
                      {user ? "Create Meal Plan" : "Start Planning"}
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
              <CalendarIcon className="h-24 w-24 mx-auto mb-4 opacity-80" />
              <p className="text-xl font-semibold">Plan your week in minutes!</p>
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
              Powered by 121+ curated recipes from top food websites, with intelligent recommendations that learn your preferences and dietary needs.
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
                  Create personalized weekly meal plans that fit your lifestyle, dietary needs, and budget constraints.
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
                  Discover new recipes based on ingredients you have, dietary preferences, or cuisine types you love.
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
                  Access detailed recipes with ingredients, instructions, nutrition info, and cooking tips all in one place.
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
              Plan your week in minutes
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
                  Tell us about your dietary needs, budget, cooking time, and favorite cuisines. We'll personalize everything for you.
                </p>
                <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                  <p className="text-sm text-gray-700">
                    ✓ Vegetarian • $15/meal • 30min max
                  </p>
                </div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-red-500 text-white text-xl font-bold mx-auto">
                  2
                </div>
                <h3 className="mt-4 text-lg leading-6 font-medium text-gray-900">Generate Your Plan</h3>
                <p className="mt-2 text-base text-gray-500">
                  Our AI creates a personalized weekly meal plan based on your preferences. Review, customize, and swap recipes as needed.
                </p>
                <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                  <p className="text-sm text-gray-700">
                    📅 4 meals • 🛒 Shopping list • ⏱️ Prep guides
                  </p>
                </div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-red-500 text-white text-xl font-bold mx-auto">
                  3
                </div>
                <h3 className="mt-4 text-lg leading-6 font-medium text-gray-900">Cook & Share</h3>
                <p className="mt-2 text-base text-gray-500">
                  Access your recipes anywhere, check off shopping lists, and share your culinary successes with friends!
                </p>
                <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                  <p className="text-sm text-gray-700">
                    📱 Mobile access • ✅ Smart lists • 📸 Share photos
                  </p>
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
            <span className="block text-red-200">Create your first meal plan today.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Link
                href={user ? "/meal-plan" : "/signup"}
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-red-600 bg-white hover:bg-gray-50"
              >
                <CalendarIcon className="h-5 w-5 mr-2" />
                {user ? "Create Meal Plan" : "Get Started Free"}
              </Link>
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
