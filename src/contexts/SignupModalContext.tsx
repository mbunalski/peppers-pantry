"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface SignupModalContextType {
  showSignupModal: (message?: string) => void;
}

const SignupModalContext = createContext<SignupModalContextType | undefined>(undefined);

export function SignupModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");

  const showSignupModal = (customMessage?: string) => {
    setMessage(customMessage || "Sign up to access this feature and connect with fellow food lovers!");
    setIsOpen(true);
  };

  return (
    <SignupModalContext.Provider value={{ showSignupModal }}>
      {children}
      {/* The actual modal will be rendered in the Layout component */}
    </SignupModalContext.Provider>
  );
}

export function useSignupModal() {
  const context = useContext(SignupModalContext);
  if (context === undefined) {
    throw new Error("useSignupModal must be used within a SignupModalProvider");
  }
  return context;
}