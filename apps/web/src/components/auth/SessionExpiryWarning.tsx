"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

// Warning appears 5 minutes before expiry
const WARNING_THRESHOLD_MS = 5 * 60 * 1000;
// Check every 30 seconds
const CHECK_INTERVAL_MS = 30 * 1000;

interface SessionExpiryWarningProps {
  /** Override warning threshold in milliseconds (default: 5 minutes) */
  warningThresholdMs?: number;
}

/**
 * Session expiry warning modal component.
 * Monitors token expiration and shows warning before session expires.
 * Allows user to extend session or logout.
 */
export function SessionExpiryWarning({
  warningThresholdMs = WARNING_THRESHOLD_MS,
}: SessionExpiryWarningProps) {
  const router = useRouter();
  const auth = useAuth();
  const [showWarning, setShowWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Get time until token expires
   */
  const getTimeUntilExpiry = useCallback((): number => {
    if (typeof window === "undefined") return Infinity;

    const expiresAt = localStorage.getItem("sammo_token_expires");
    if (!expiresAt) return Infinity;

    const expiryTime = new Date(expiresAt).getTime();
    return expiryTime - Date.now();
  }, []);

  /**
   * Check if warning should be shown
   */
  const checkExpiry = useCallback(() => {
    if (!auth.isAuthenticated) {
      setShowWarning(false);
      return;
    }

    const remaining = getTimeUntilExpiry();

    // Session already expired
    if (remaining <= 0) {
      setShowWarning(false);
      auth.logout();
      router.push("/login");
      return;
    }

    // Show warning if within threshold
    if (remaining <= warningThresholdMs) {
      setShowWarning(true);
      setTimeRemaining(remaining);
    } else {
      setShowWarning(false);
    }
  }, [auth, getTimeUntilExpiry, warningThresholdMs, router]);

  /**
   * Extend session by refreshing token
   */
  const handleExtendSession = async () => {
    setIsRefreshing(true);
    try {
      const success = await auth.refreshAccessToken();
      if (success) {
        setShowWarning(false);
      } else {
        // Refresh failed, redirect to login
        auth.logout();
        router.push("/login");
      }
    } catch (error) {
      console.error("Failed to extend session:", error);
      auth.logout();
      router.push("/login");
    } finally {
      setIsRefreshing(false);
    }
  };

  /**
   * Logout and redirect to login page
   */
  const handleLogout = () => {
    auth.logout();
    setShowWarning(false);
    router.push("/login");
  };

  // Setup expiry check interval
  useEffect(() => {
    // Initial check
    checkExpiry();

    // Setup interval
    checkIntervalRef.current = setInterval(checkExpiry, CHECK_INTERVAL_MS);

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [checkExpiry]);

  // Countdown timer when warning is shown
  useEffect(() => {
    if (!showWarning) {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
      return;
    }

    // Update remaining time every second
    countdownIntervalRef.current = setInterval(() => {
      const remaining = getTimeUntilExpiry();
      if (remaining <= 0) {
        setShowWarning(false);
        auth.logout();
        router.push("/login");
      } else {
        setTimeRemaining(remaining);
      }
    }, 1000);

    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, [showWarning, getTimeUntilExpiry, auth, router]);

  /**
   * Format remaining time as MM:SS
   */
  const formatTimeRemaining = (ms: number): string => {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  if (!showWarning) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md mx-4 bg-zinc-800 border border-gray-600 rounded-lg shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-amber-700 px-4 py-3">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            세션 만료 경고
          </h2>
        </div>

        {/* Body */}
        <div className="p-6 text-center">
          <p className="text-gray-300 mb-4">세션이 곧 만료됩니다.</p>
          <div className="text-4xl font-mono font-bold text-amber-400 mb-4">
            {formatTimeRemaining(timeRemaining)}
          </div>
          <p className="text-gray-400 text-sm mb-6">
            계속하시려면 세션을 연장하세요. 그렇지 않으면 자동으로 로그아웃됩니다.
          </p>

          {/* Actions */}
          <div className="flex gap-3 justify-center">
            <button
              onClick={handleExtendSession}
              disabled={isRefreshing}
              className="px-6 py-2 bg-amber-600 hover:bg-amber-500 disabled:bg-amber-800 disabled:cursor-not-allowed text-white font-medium rounded transition-colors flex items-center gap-2"
            >
              {isRefreshing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  연장 중...
                </>
              ) : (
                "세션 연장"
              )}
            </button>
            <button
              onClick={handleLogout}
              disabled={isRefreshing}
              className="px-6 py-2 bg-zinc-700 hover:bg-zinc-600 disabled:bg-zinc-800 disabled:cursor-not-allowed text-white font-medium rounded transition-colors"
            >
              로그아웃
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
