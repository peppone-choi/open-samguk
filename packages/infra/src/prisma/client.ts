import { PrismaClient } from "@prisma/client";

export type PrismaClientType = PrismaClient;

let prismaClient: PrismaClient | null = null;

export function createPrismaClient(): PrismaClient {
  if (prismaClient) return prismaClient;

  prismaClient = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

  return prismaClient;
}
