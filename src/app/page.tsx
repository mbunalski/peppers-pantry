"use client";

import Link from "next/link";
import { ChefHatIcon, CalendarIcon, ShoppingCartIcon, SparklesIcon } from "lucide-react";
import Header from "../components/Header";
import SocialFeed from "../components/SocialFeed";
import { useAuth } from "../contexts/AuthContext";

export default function Home() {
  const { user } = useAuth();

  // If user is logged in, show the social feed as homepage
  if (user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        {/* Welcome Banner for logged in users */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-2">Welcome back, {user.name}!</h1>
              <p className="text-red-100">See what the cooking community is up to</p>
            </div>
          </div>
        </div>

        {/* Social Feed */}
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Quick Actions Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm p-6 sticky top-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Link
                    href="/meal-plan"
                    className="w-full flex items-center p-3 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <CalendarIcon className="h-5 w-5 mr-3" />
                    <span className="font-medium">Meal Plan</span>
                  </Link>
                  <Link
                    href="/shopping-list"
                    className="w-full flex items-center p-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    <ShoppingCartIcon className="h-5 w-5 mr-3" />
                    <span className="font-medium">Shopping List</span>
                  </Link>
                  <Link
                    href="/recipes"
                    className="w-full flex items-center p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <ChefHatIcon className="h-5 w-5 mr-3" />
                    <span className="font-medium">Browse Recipes</span>
                  </Link>
                  <Link
                    href="/dashboard"
                    className="w-full flex items-center p-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
                  >
                    <SparklesIcon className="h-5 w-5 mr-3" />
                    <span className="font-medium">My Profile</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Main Feed */}
            <div className="lg:col-span-3">
              <SocialFeed />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // For non-logged in users, show marketing homepage
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
                  <span className="block xl:inline">Social cooking</span>{' '}
                  <span className="block text-red-600 xl:inline">community</span>
                </h1>
                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Discover recipes loved by the community, share your cooking successes, and get personalized meal plans. 
                  Join thousands of home cooks sharing their culinary journey!
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <Link
                      href="/signup"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700 md:py-4 md:text-lg md:px-10"
                    >
                      Join the Community
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
              <ChefHatIcon className="h-24 w-24 mx-auto mb-4 opacity-80" />
              <p className="text-xl font-semibold">Cook • Share • Discover</p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-red-600 font-semibold tracking-wide uppercase">Social Cooking Platform</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              More than just meal planning
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Join a community of home cooks sharing recipes, reactions, and meal planning inspiration. 121+ curated recipes with social engagement.
            </p>
          </div>

          <div className="mt-10">
            <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              <div className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-red-500 text-white">
                    <span className="text-lg">❤️</span>
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Social Recipe Discovery</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">
                  Love, like, or save recipes from the community. See what's trending and discover new favorites through social engagement.
                </dd>
              </div>

              <div className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-red-500 text-white">
                    <span className="text-lg">💬</span>
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Recipe Comments & Tips</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">
                  Share cooking tips, ask questions, and learn from other home cooks. Build connections through shared culinary experiences.
                </dd>
              </div>

              <div className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-red-500 text-white">
                    <CalendarIcon className="h-6 w-6" />
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Personal Meal Planning</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">
                  Create private meal plans and shopping lists. Your personal planning stays private while you engage with the community.
                </dd>
              </div>

              <div className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-red-500 text-white">
                    <span className="text-lg">🔥</span>
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Trending & Popular</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">
                  See what's popular globally, follow friends' activity, or explore trending recipes based on community engagement.
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-red-600">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">Ready to join the community?</span>
            <span className="block text-red-200">Start cooking and sharing today!</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-red-600 bg-white hover:bg-gray-50"
              >
                <ChefHatIcon className="h-5 w-5 mr-2" />
                Get Started Free
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
