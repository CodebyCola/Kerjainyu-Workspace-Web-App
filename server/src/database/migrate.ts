import dotenv from "dotenv";

dotenv.config();

import * as path from "node:path";
import { promises as fs } from "node:fs";
import { Kysely, PostgresDialect } from "kysely";
import {
  FileMigrationProvider,
  Migrator,
  type MigrationResultSet,
} from "kysely/migration";
import { Pool } from "pg";
import { pathToFileURL } from "node:url";

/**
 * Standalone Kysely connection for running migrations. Deliberately
 * separate from `src/database/index.ts` (the app's runtime `db`
 * instance) — this script runs standalone via `tsx`, outside the
 * Express app, before the server has anything to query yet.
 */

const db = new Kysely<any>({
  dialect: new PostgresDialect({
    pool: new Pool({
      connectionString: process.env.DATABASE_URL,
    }),
  }),
});

const migrator = new Migrator({
  db,
  provider: new FileMigrationProvider({
    fs,
    path,
    migrationFolder: path.join(__dirname, "migrations"),

    import: async (filePath) => {
      return await import(pathToFileURL(filePath).href);
    },
  }),
});

async function migrateToLatest() {
  const { error, results }: MigrationResultSet =
    await migrator.migrateToLatest();

  results?.forEach((it) => {
    if (it.status === "Success") {
      console.log(`✓ migration "${it.migrationName}" applied successfully`);
    } else if (it.status === "Error") {
      console.error(`✗ migration "${it.migrationName}" failed`);
    }
  });

  if (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }

  await db.destroy();
}

migrateToLatest();
