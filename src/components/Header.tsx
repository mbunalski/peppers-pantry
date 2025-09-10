"use client";

import Link from "next/link";
import { ChefHatIcon, UserIcon } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function Header() {
  const { user, logout } = useAuth();
  return (
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
              <Link href="/privacy" className="text-gray-500 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium">Privacy</Link>
              
              {user ? (
                <div className="flex items-center space-x-3">
                  <Link href={`/user/${user.id}`} className="flex items-center text-gray-700 hover:text-red-600 transition-colors">
                    <UserIcon className="h-5 w-5 mr-1" />
                    <span className="text-sm font-medium">{user.name}</span>
                  </Link>
                  <button
                    onClick={logout}
                    className="text-gray-500 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <>
                  <Link href="/login" className="text-gray-500 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium">Login</Link>
                  <Link href="/signup" className="bg-red-600 text-white hover:bg-red-700 px-4 py-2 rounded-md text-sm font-medium">Sign Up</Link>
                </>
              )}
            </div>
          </div>
          {/* Mobile menu */}
          <div className="md:hidden">
            {user ? (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700">{user.name}</span>
                <button
                  onClick={logout}
                  className="text-gray-500 hover:text-red-600 px-2 py-1 rounded-md text-sm font-medium"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link href="/signup" className="bg-red-600 text-white hover:bg-red-700 px-3 py-2 rounded-md text-sm font-medium">Sign Up</Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}