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
// Connection string validation
// ---------------------------------------------------------------------------

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "[Ubuntu Pools] DATABASE_URL environment variable is required. " +
      "Set it in .env.local for development or as a secret in production."
  );
}

// ---------------------------------------------------------------------------
// PostgreSQL connection pool
//
// max: 10 connections (suitable for serverless/edge environments)
// idle_timeout: 20s (release idle connections promptly)
// connect_timeout: 10s (fail fast on misconfiguration)
// ssl: required in production
// ---------------------------------------------------------------------------
const sql = postgres(connectionString, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
  ssl: process.env.NODE_ENV === "production" ? "require" : false,
  // Prevent accidental writes from read-only query paths
  // (enforced at application layer, not here)
  onnotice: () => {}, // suppress NOTICE messages in tests
});

// ---------------------------------------------------------------------------
// Drizzle ORM client with full schema
// ---------------------------------------------------------------------------
export const db = drizzle(sql, {
  schema,
  logger: process.env.NODE_ENV === "development",
});

// ---------------------------------------------------------------------------
// Export the raw sql client for migrations and raw queries
// ---------------------------------------------------------------------------
export { sql as pgClient };

// ---------------------------------------------------------------------------
// Type export for use in service layer
// ---------------------------------------------------------------------------
export type Database = typeof db;
