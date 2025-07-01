"use client";

import { useAuth } from "@/context/EnhancedAuthContext";
import type React from "react";

import { Navigate, useLocation } from "react-router-dom";

interface AdvancedPrivateRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  redirectTo?: string;
}

export function AdvancedPrivateRoute({
  children,
  requiredRole,
  redirectTo = "/login",
}: AdvancedPrivateRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();
  console.log(user);
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // User না থাকলে login page এ redirect
  if (!user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Role check করার জন্য (যদি প্রয়োজন হয়)
  if (requiredRole && user.role !== requiredRole) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600">
            You don't have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
