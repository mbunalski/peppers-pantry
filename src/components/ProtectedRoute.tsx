"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import SignupModal from "./SignupModal";

interface ProtectedRouteProps {
  children: React.ReactNode;
  message?: string;
}

export default function ProtectedRoute({ children, message }: ProtectedRouteProps) {
  const { user } = useAuth();
  const [showSignupModal, setShowSignupModal] = useState(false);

  useEffect(() => {
    if (!user) {
      setShowSignupModal(true);
    }
  }, [user]);

  if (!user) {
    return (
      <>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl">🔒</span>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Sign up required
            </h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {message || "This feature requires an account. Join thousands of home cooks sharing their culinary journey!"}
            </p>
          </div>
        </div>

        <SignupModal
          isOpen={showSignupModal}
          onClose={() => setShowSignupModal(false)}
          message={message}
        />
      </>
    );
  }

  return <>{children}</>;
}