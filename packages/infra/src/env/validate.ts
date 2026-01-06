export interface EnvConfig {
  databaseUrl: string;
  redisUrl: string;
  nodeEnv: "development" | "production" | "test";
  port: number;
}

export function validateEnv(): EnvConfig {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL 환경 변수가 필요합니다");
  }

  const redisUrl = process.env.REDIS_URL ?? "redis://localhost:6379";

  const nodeEnv = (process.env.NODE_ENV ?? "development") as EnvConfig["nodeEnv"];
  if (!["development", "production", "test"].includes(nodeEnv)) {
    throw new Error(`잘못된 NODE_ENV: ${nodeEnv}`);
  }

  const port = parseInt(process.env.PORT ?? "3000", 10);
  if (isNaN(port)) {
    throw new Error(`잘못된 PORT: ${process.env.PORT}`);
  }

  return { databaseUrl, redisUrl, nodeEnv, port };
}
