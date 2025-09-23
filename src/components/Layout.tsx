"use client";

import Header from "./Header";
import Sidebar from "./Sidebar";
import { useAuth } from "../contexts/AuthContext";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      {user && <Sidebar />}
      <main className="pt-4">
        {children}
      </main>
    </div>
  );
}