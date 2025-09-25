"use client";

import Link from "next/link";
import { ChefHatIcon, CalendarIcon, ShoppingCartIcon, SparklesIcon } from "lucide-react";
import Layout from "../components/Layout";
import Header from "../components/Header";
import SocialFeed from "../components/SocialFeed";
import { useAuth } from "../contexts/AuthContext";

export default function Home() {
  const { user } = useAuth();

  // Show social feed as homepage for everyone (authenticated and non-authenticated)
  return (
    <Layout>
      {/* Social Feed */}
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <SocialFeed />
      </div>
    </Layout>
  );
}
