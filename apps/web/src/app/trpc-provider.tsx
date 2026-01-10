"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import React, { useState } from "react";
import { trpc } from "@/utils/trpc";
import { GeneralProvider } from "@/contexts/GeneralContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { SessionExpiryWarning } from "@/components/auth";

// Storage key for access token (must match AuthContext)
const ACCESS_TOKEN_KEY = "sammo_access_token";

/**
 * Get access token from localStorage
 * Used by tRPC client for Authorization header
 */
function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: process.env.NEXT_PUBLIC_API_URL || "/api/trpc",
          headers: () => {
            const token = getAccessToken();
            return token
              ? {
                Authorization: `Bearer ${token}`,
              }
              : {};
          },
        }),
      ],
    })
  );

  return (
    <AuthProvider>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <GeneralProvider>
            {children}
            <SessionExpiryWarning />
          </GeneralProvider>
        </QueryClientProvider>
      </trpc.Provider>
    </AuthProvider>
  );
}
