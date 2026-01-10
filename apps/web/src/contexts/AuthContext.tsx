"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react";

// Storage keys
const ACCESS_TOKEN_KEY = "sammo_access_token";
const REFRESH_TOKEN_KEY = "sammo_refresh_token";
const TOKEN_EXPIRES_KEY = "sammo_token_expires";
const USER_KEY = "sammo_user";

// Refresh buffer: refresh 60 seconds before expiry
const REFRESH_BUFFER_MS = 60 * 1000;

/**
 * User info from auth response
 */
export interface AuthUser {
  id: number;
  username: string;
  name: string;
  grade: number;
}

/**
 * Auth tokens
 */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

/**
 * Auth context value
 */
export interface AuthContextValue {
  // State
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  login: (tokens: AuthTokens, user: AuthUser) => void;
  logout: () => void;
  getAccessToken: () => string | null;
  getRefreshToken: () => string | null;
  setTokens: (tokens: AuthTokens, user?: AuthUser) => void;
  refreshAccessToken: () => Promise<boolean>;
  isTokenExpired: () => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Hook to use auth context
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

/**
 * Check if code is running on client
 */
function isClient(): boolean {
  return typeof window !== "undefined";
}

/**
 * Get item from localStorage (safe for SSR)
 */
function getStorageItem(key: string): string | null {
  if (!isClient()) return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

/**
 * Set item in localStorage (safe for SSR)
 */
function setStorageItem(key: string, value: string): void {
  if (!isClient()) return;
  try {
    localStorage.setItem(key, value);
  } catch {
    // Ignore storage errors
  }
}

/**
 * Remove item from localStorage (safe for SSR)
 */
function removeStorageItem(key: string): void {
  if (!isClient()) return;
  try {
    localStorage.removeItem(key);
  } catch {
    // Ignore storage errors
  }
}

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Auth provider component
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Track if refresh is in progress to prevent duplicate requests
  const refreshInProgressRef = useRef(false);
  const refreshPromiseRef = useRef<Promise<boolean> | null>(null);

  // Load auth state from localStorage on mount
  useEffect(() => {
    const storedAccessToken = getStorageItem(ACCESS_TOKEN_KEY);
    const storedUser = getStorageItem(USER_KEY);

    if (storedAccessToken && storedUser) {
      try {
        setAccessToken(storedAccessToken);
        setUser(JSON.parse(storedUser));
      } catch {
        // Invalid stored data, clear it
        removeStorageItem(ACCESS_TOKEN_KEY);
        removeStorageItem(REFRESH_TOKEN_KEY);
        removeStorageItem(TOKEN_EXPIRES_KEY);
        removeStorageItem(USER_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  /**
   * Check if token is expired (or will expire soon)
   */
  const isTokenExpired = useCallback((): boolean => {
    const expiresAt = getStorageItem(TOKEN_EXPIRES_KEY);
    if (!expiresAt) return true;

    const expiryTime = new Date(expiresAt).getTime();
    const now = Date.now();

    // Consider expired if within the buffer time
    return now >= expiryTime - REFRESH_BUFFER_MS;
  }, []);

  /**
   * Refresh access token using refresh token
   * Returns true if refresh was successful, false otherwise
   */
  const refreshAccessToken = useCallback(async (): Promise<boolean> => {
    // If refresh is already in progress, return the existing promise
    if (refreshInProgressRef.current && refreshPromiseRef.current) {
      return refreshPromiseRef.current;
    }

    const refreshToken = getStorageItem(REFRESH_TOKEN_KEY);
    if (!refreshToken) {
      return false;
    }

    refreshInProgressRef.current = true;

    const refreshPromise = (async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "/api/trpc";

        // Call auth.refresh endpoint directly via fetch
        const response = await fetch(`${apiUrl}/auth.refresh`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            refreshToken,
          }),
        });

        if (!response.ok) {
          throw new Error("Refresh failed");
        }

        const data = await response.json();

        // tRPC response format: { result: { data: { ... } } }
        const result = data.result?.data;

        if (!result || !result.accessToken) {
          throw new Error("Invalid refresh response");
        }

        // Update tokens in state and storage
        setAccessToken(result.accessToken);
        setStorageItem(ACCESS_TOKEN_KEY, result.accessToken);
        setStorageItem(REFRESH_TOKEN_KEY, result.refreshToken);
        setStorageItem(TOKEN_EXPIRES_KEY, result.expiresAt);

        // Update user if provided
        if (result.user) {
          setUser(result.user);
          setStorageItem(USER_KEY, JSON.stringify(result.user));
        }

        return true;
      } catch (error) {
        console.error("Token refresh failed:", error);
        // Clear auth state on refresh failure
        setAccessToken(null);
        setUser(null);
        removeStorageItem(ACCESS_TOKEN_KEY);
        removeStorageItem(REFRESH_TOKEN_KEY);
        removeStorageItem(TOKEN_EXPIRES_KEY);
        removeStorageItem(USER_KEY);
        return false;
      } finally {
        refreshInProgressRef.current = false;
        refreshPromiseRef.current = null;
      }
    })();

    refreshPromiseRef.current = refreshPromise;
    return refreshPromise;
  }, []);

  /**
   * Login - store tokens and user
   */
  const login = useCallback((tokens: AuthTokens, authUser: AuthUser) => {
    setAccessToken(tokens.accessToken);
    setUser(authUser);

    setStorageItem(ACCESS_TOKEN_KEY, tokens.accessToken);
    setStorageItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
    setStorageItem(TOKEN_EXPIRES_KEY, tokens.expiresAt);
    setStorageItem(USER_KEY, JSON.stringify(authUser));
  }, []);

  /**
   * Logout - clear tokens and user
   */
  const logout = useCallback(() => {
    setAccessToken(null);
    setUser(null);

    removeStorageItem(ACCESS_TOKEN_KEY);
    removeStorageItem(REFRESH_TOKEN_KEY);
    removeStorageItem(TOKEN_EXPIRES_KEY);
    removeStorageItem(USER_KEY);
  }, []);

  /**
   * Get current access token
   */
  const getAccessToken = useCallback((): string | null => {
    return accessToken || getStorageItem(ACCESS_TOKEN_KEY);
  }, [accessToken]);

  /**
   * Get current refresh token
   */
  const getRefreshToken = useCallback((): string | null => {
    return getStorageItem(REFRESH_TOKEN_KEY);
  }, []);

  /**
   * Set new tokens (for refresh) with optional user update
   */
  const setTokens = useCallback((tokens: AuthTokens, newUser?: AuthUser) => {
    setAccessToken(tokens.accessToken);
    setStorageItem(ACCESS_TOKEN_KEY, tokens.accessToken);
    setStorageItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
    setStorageItem(TOKEN_EXPIRES_KEY, tokens.expiresAt);

    if (newUser) {
      setUser(newUser);
      setStorageItem(USER_KEY, JSON.stringify(newUser));
    }
  }, []);

  const value: AuthContextValue = {
    user,
    accessToken,
    isAuthenticated: !!accessToken && !!user,
    isLoading,
    login,
    logout,
    getAccessToken,
    getRefreshToken,
    setTokens,
    refreshAccessToken,
    isTokenExpired,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
