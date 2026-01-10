"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { trpc } from "@/utils/trpc";
import { type GameStateResponse } from "@sammo/common";

export interface GameTime {
  year: number;
  month: number;
}

export interface Nation {
  nation: number;
  name: string;
  color: string;
  gold: number;
  rice: number;
  level: number;
  capital: number;
  type: string;
  cities?: City[];
}

export interface City {
  city: number;
  name: string;
  nation: number | null;
  level: number;
  pop: number;
  popMax: number;
  agri: number;
  agriMax: number;
  comm: number;
  commMax: number;
  secu: number;
  trust: number;
  def: number;
  wall: number;
  wallMax: number;
  region: number;
}

export interface GameState {
  year: number;
  month: number;
  nations: Nation[];
  cities: City[];
}

export interface GameConstContextValue {
  /** Current game time (year, month) */
  gameTime: GameTime | null;
  /** All nations in the game */
  nations: Nation[];
  /** All cities in the game */
  cities: City[];
  /** Whether game state is loading */
  isLoading: boolean;
  /** Error if any */
  error: Error | null;
  /** Refetch game state */
  refetch: () => void;
}

const GameConstContext = createContext<GameConstContextValue | null>(null);

interface GameConstProviderProps {
  children: ReactNode;
}

export function GameConstProvider({ children }: GameConstProviderProps) {
  const { data: gameState, isLoading, error, refetch } = trpc.getGameState.useQuery();

  const value = useMemo<GameConstContextValue>(
    () => ({
      gameTime: (gameState as GameStateResponse | undefined) ? {
        year: (gameState as GameStateResponse).year,
        month: (gameState as GameStateResponse).month
      } : null,
      nations: (gameState as GameStateResponse | undefined)?.nations ?? [],
      cities: (gameState as GameStateResponse | undefined)?.cities ?? [],
      isLoading,
      error: error as Error | null,
      refetch,
    }),
    [gameState, isLoading, error, refetch]
  );

  return <GameConstContext.Provider value={value}>{children}</GameConstContext.Provider>;
}

export function useGameConst(): GameConstContextValue {
  const context = useContext(GameConstContext);
  if (!context) {
    throw new Error("useGameConst must be used within GameConstProvider");
  }
  return context;
}

export function useGameTime(): GameTime | null {
  const { gameTime } = useGameConst();
  return gameTime;
}

export function useNations(): Nation[] {
  const { nations } = useGameConst();
  return nations;
}

export function useCities(): City[] {
  const { cities } = useGameConst();
  return cities;
}

export function useNation(nationId: number): Nation | undefined {
  const { nations } = useGameConst();
  return nations.find((n) => n.nation === nationId);
}

export function useCity(cityId: number): City | undefined {
  const { cities } = useGameConst();
  return cities.find((c) => c.city === cityId);
}

export function useNationCities(nationId: number): City[] {
  const { cities } = useGameConst();
  return cities.filter((c) => c.nation === nationId);
}
