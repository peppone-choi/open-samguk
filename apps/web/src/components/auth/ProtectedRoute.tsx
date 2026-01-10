"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  /**
   * URL to redirect to when not authenticated
   * @default "/login"
   */
  redirectTo?: string;
  /**
   * Show loading state while checking auth
   * @default true
   */
  showLoading?: boolean;
}

/**
 * Component that protects routes from unauthenticated access.
 * Wraps children and redirects to login if user is not authenticated.
 */
export function ProtectedRoute({
  children,
  redirectTo = "/auth/login",
  showLoading = true,
}: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading, refreshAccessToken, isTokenExpired } = useAuth();

  useEffect(() => {
    // Wait for initial auth state to load
    if (isLoading) return;

    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      router.replace(redirectTo);
      return;
    }

    // Check if token is expired and try to refresh
    if (isTokenExpired()) {
      refreshAccessToken().then((success) => {
        if (!success) {
          router.replace(redirectTo);
        }
      });
    }
  }, [isAuthenticated, isLoading, isTokenExpired, refreshAccessToken, router, redirectTo]);

  // Show loading while checking auth
  if (isLoading) {
    if (!showLoading) return null;

    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-400">로딩 중...</p>
        </div>
      </div>
    );
  }

  // Don't render children if not authenticated
  if (!isAuthenticated) {
    // Return loading indicator while redirect happens
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-400">로그인 페이지로 이동 중...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
