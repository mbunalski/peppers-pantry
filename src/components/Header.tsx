"use client";

import Link from "next/link";
import { ChefHatIcon, UserIcon, SunIcon, MoonIcon, MonitorIcon } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";

export default function Header() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  
  const ThemeIcon = theme === 'dark' ? SunIcon : theme === 'light' ? MoonIcon : MonitorIcon;
  return (
    <nav className="bg-white dark:bg-gray-900 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <ChefHatIcon className="h-8 w-8 text-red-600" />
              <span className="ml-2 text-2xl font-bold text-gray-900 dark:text-white hidden sm:block">Pepper's Pantry</span>
              <span className="ml-1 text-lg font-bold text-gray-900 dark:text-white sm:hidden">PP</span>
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link href="/" className="text-gray-500 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-400 px-3 py-2 rounded-md text-sm font-medium">Home</Link>
              <Link href="/recipes" className="text-gray-500 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-400 px-3 py-2 rounded-md text-sm font-medium">Recipes</Link>
              <Link href="/privacy" className="text-gray-500 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-400 px-3 py-2 rounded-md text-sm font-medium">Privacy</Link>
              
              <button
                onClick={() => setTheme(theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light')}
                className="text-gray-500 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                title={`Current theme: ${theme}`}
              >
                <ThemeIcon className="h-5 w-5" />
              </button>

              {user ? (
                <div className="flex items-center space-x-3">
                  <Link href="/dashboard" className="flex items-center text-gray-700 hover:text-red-600 dark:text-gray-200 dark:hover:text-red-400 transition-colors">
                    <UserIcon className="h-5 w-5 mr-1" />
                    <span className="text-sm font-medium">{user.name}</span>
                  </Link>
                  <button
                    onClick={logout}
                    className="text-gray-500 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-400 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <>
                  <Link href="/login" className="text-gray-500 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-400 px-3 py-2 rounded-md text-sm font-medium">Login</Link>
                  <Link href="/signup" className="bg-red-600 text-white hover:bg-red-700 px-4 py-2 rounded-md text-sm font-medium">Sign Up</Link>
                </>
              )}
            </div>
          </div>
          {/* Mobile menu */}
          <div className="md:hidden">
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setTheme(theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light')}
                className="text-gray-500 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-400 p-1 rounded-md transition-colors"
                title={`Current theme: ${theme}`}
              >
                <ThemeIcon className="h-5 w-5" />
              </button>

              {user ? (
                <>
                  <Link href="/dashboard" className="text-gray-500 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-400 p-1 rounded-md transition-colors">
                    <UserIcon className="h-5 w-5" />
                  </Link>
                  <button
                    onClick={logout}
                    className="text-gray-500 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-400 px-2 py-1 rounded-md text-xs font-medium"
                  >
                    Out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-gray-500 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-400 px-2 py-1 rounded-md text-xs font-medium">In</Link>
                  <Link href="/signup" className="bg-red-600 text-white hover:bg-red-700 px-2 py-1 rounded-md text-xs font-medium">Up</Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}