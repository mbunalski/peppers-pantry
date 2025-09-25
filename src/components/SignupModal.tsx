"use client";

import { useState } from "react";
import Link from "next/link";
import { X, ChefHatIcon } from "lucide-react";

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
}

export default function SignupModal({ isOpen, onClose, message }: SignupModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="text-center">
          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <ChefHatIcon className="h-8 w-8 text-white" />
          </div>

          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Join the Community
          </h3>

          <p className="text-gray-600 mb-6">
            {message || "Sign up to interact with recipes, create meal plans, and connect with fellow food lovers!"}
          </p>

          <div className="space-y-3">
            <Link
              href="/signup"
              className="w-full flex items-center justify-center px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              onClick={onClose}
            >
              Create Account
            </Link>

            <Link
              href="/login"
              className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              onClick={onClose}
            >
              Already have an account? Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}