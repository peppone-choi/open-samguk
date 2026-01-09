"use client";

import React, { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { trpc } from "@/utils/trpc";

interface GeneralContextValue {
  selectedGeneralId: number | null;
  selectedGeneral: any;
  setSelectedGeneralId: (id: number | null) => void;
  isLoading: boolean;
}

const GeneralContext = createContext<GeneralContextValue | null>(null);

export function GeneralProvider({ children }: { children: ReactNode }) {
  const [selectedGeneralId, setSelectedGeneralId] = useState<number | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("selectedGeneralId");
    if (saved) {
      setSelectedGeneralId(parseInt(saved, 10));
    } else {
      // Default to 1 for now if nothing saved
      setSelectedGeneralId(1);
    }
  }, []);

  // Save to localStorage when changed
  useEffect(() => {
    if (selectedGeneralId !== null) {
      localStorage.setItem("selectedGeneralId", selectedGeneralId.toString());
    }
  }, [selectedGeneralId]);

  const { data: selectedGeneral, isLoading } = trpc.getGeneralDetail.useQuery(
    { generalId: selectedGeneralId ?? 0 },
    { enabled: !!selectedGeneralId }
  );

  return (
    <GeneralContext.Provider
      value={{
        selectedGeneralId,
        selectedGeneral,
        setSelectedGeneralId,
        isLoading,
      }}
    >
      {children}
    </GeneralContext.Provider>
  );
}

export function useGeneral() {
  const context = useContext(GeneralContext);
  if (!context) {
    throw new Error("useGeneral must be used within a GeneralProvider");
  }
  return context;
}
