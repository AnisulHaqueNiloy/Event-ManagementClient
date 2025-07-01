"use client";

import { useAuth } from "@/context/AuthContext";
import type React from "react";

import { Navigate } from "react-router-dom";

interface PrivateRouteProps {
  children: React.ReactNode;
}

export function PrivateRoute({ children }: PrivateRouteProps) {
  const { user, loading } = useAuth();

  // Loading state দেখানোর জন্য
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // User না থাকলে login page এ redirect করবে
  return user ? <>{children}</> : <Navigate to="/login" replace />;
}
