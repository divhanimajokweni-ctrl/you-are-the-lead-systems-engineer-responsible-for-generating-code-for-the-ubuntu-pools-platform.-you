/**
 * Ubuntu Pools — Phase 1: Database Client
 *
 * Provides a singleton Drizzle ORM client connected to PostgreSQL.
 *
 * Configuration:
 *   DATABASE_URL environment variable (required in production).
 *   Falls back to a local development URL if not set.
 *
 * Security:
 *   - No secrets committed to source.
 *   - Connection string read from environment only.
 *   - SSL enforced in production (NODE_ENV=production).
 */

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// ---------------------------------------------------------------------------
// Connection string validation (lazy - only when db is actually used)
// ---------------------------------------------------------------------------

let sql: postgres.Sql<{}> | undefined;

function getSqlClient() {
  if (!sql) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error(
        "[Ubuntu Pools] DATABASE_URL environment variable is required. " +
          "Set it in .env.local for development or as a secret in production."
      );
    }
    sql = postgres(connectionString, {
      max: 10,
      idle_timeout: 20,
      connect_timeout: 10,
      ssl: process.env.NODE_ENV === "production" ? "require" : false,
      onnotice: () => {},
    });
  }
  return sql;
}

function getDb() {
  return drizzle(getSqlClient(), {
    schema,
    logger: process.env.NODE_ENV === "development",
  });
}

// ---------------------------------------------------------------------------
// Lazy-loaded database client
// ---------------------------------------------------------------------------

export const db = new Proxy(
  {} as ReturnType<typeof getDb>,
  {
    get(_target, prop) {
      const database = getDb();
      return (database as any)[prop];
    },
  }
);

export const pgClient = {
  get client() {
    return getSqlClient();
  },
};

export type Database = ReturnType<typeof getDb>;
