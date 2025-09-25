"use client";

import Link from "next/link";
import { useAuth } from "../contexts/AuthContext";
import {
  CalendarIcon,
  ShoppingCartIcon,
  ChefHatIcon,
  SparklesIcon
} from "lucide-react";

export default function Sidebar() {
  const { user } = useAuth();

  // Only show sidebar for authenticated users
  if (!user) {
    return null;
  }

  return (
    <div className="hidden lg:block fixed left-6 top-24 z-30 space-y-3">
      <Link
        href="/meal-plan"
        className="flex items-center p-3 bg-red-500/80 backdrop-blur-sm text-white rounded-xl hover:bg-red-500/90 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
      >
        <CalendarIcon className="h-5 w-5" />
        <span className="ml-3 font-medium whitespace-nowrap">
          Meal Plan
        </span>
      </Link>

      <Link
        href="/shopping-list"
        className="flex items-center p-3 bg-green-500/80 backdrop-blur-sm text-white rounded-xl hover:bg-green-500/90 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
      >
        <ShoppingCartIcon className="h-5 w-5" />
        <span className="ml-3 font-medium whitespace-nowrap">
          Shopping List
        </span>
      </Link>

      <Link
        href="/recipes"
        className="flex items-center p-3 bg-blue-500/80 backdrop-blur-sm text-white rounded-xl hover:bg-blue-500/90 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
      >
        <ChefHatIcon className="h-5 w-5" />
        <span className="ml-3 font-medium whitespace-nowrap">
          Browse Recipes
        </span>
      </Link>

      <Link
        href="/dashboard"
        className="flex items-center p-3 bg-purple-500/80 backdrop-blur-sm text-white rounded-xl hover:bg-purple-500/90 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
      >
        <SparklesIcon className="h-5 w-5" />
        <span className="ml-3 font-medium whitespace-nowrap">
          My Profile
        </span>
      </Link>
    </div>
  );
}