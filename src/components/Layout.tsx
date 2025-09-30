"use client";

import Header from "./Header";
import Sidebar from "./Sidebar";
import { useAuth } from "../contexts/AuthContext";
import Link from "next/link";
import {
  CalendarIcon,
  ShoppingCartIcon,
  ChefHatIcon,
  SparklesIcon,
  HomeIcon
} from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      {user && <Sidebar />}
      <main className="pt-4 pb-20 lg:pb-4">
        {children}
      </main>

      {/* Mobile bottom navigation */}
      {user && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-40">
          <div className="flex justify-around">
            <Link
              href="/"
              className="flex flex-col items-center p-2 text-gray-500 hover:text-red-600 transition-colors"
            >
              <HomeIcon className="h-5 w-5" />
              <span className="text-xs mt-1">Home</span>
            </Link>
            <Link
              href="/recipes"
              className="flex flex-col items-center p-2 text-gray-500 hover:text-blue-600 transition-colors"
            >
              <ChefHatIcon className="h-5 w-5" />
              <span className="text-xs mt-1">Recipes</span>
            </Link>
            <Link
              href="/meal-plan"
              className="flex flex-col items-center p-2 text-gray-500 hover:text-red-600 transition-colors"
            >
              <CalendarIcon className="h-5 w-5" />
              <span className="text-xs mt-1">My Meals</span>
            </Link>
            <Link
              href="/shopping-list"
              className="flex flex-col items-center p-2 text-gray-500 hover:text-green-600 transition-colors"
            >
              <ShoppingCartIcon className="h-5 w-5" />
              <span className="text-xs mt-1">Cart</span>
            </Link>
            <Link
              href="/dashboard"
              className="flex flex-col items-center p-2 text-gray-500 hover:text-purple-600 transition-colors"
            >
              <SparklesIcon className="h-5 w-5" />
              <span className="text-xs mt-1">Profile</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}