import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const { Pool } = pg;

/**
 * Global Prisma reference to prevent multiple instances
 * during development hot reload.
 */
declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
}

/**
 * Postgres connection pool
 * Works with Supabase + Vercel serverless
 */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

/**
 * Prisma adapter for pg
 */
const adapter = new PrismaPg(pool);

/**
 * Prisma singleton
 */
export const prisma =
  globalThis.prismaGlobal ??
  new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.prismaGlobal = prisma;
}

/**
 * Transaction client type helper
 */
export type TransactionClient = Parameters<
  Parameters<typeof prisma.$transaction>[0]
>[0];