import * as path from "node:path";
import { promises as fs } from "node:fs";
import { Kysely, PostgresDialect } from "kysely";
import {
  FileMigrationProvider,
  Migrator,
  type MigrationResultSet,
} from "kysely/migration";
import { Pool } from "pg";

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
  }),
});

/** Rolls back exactly one migration step — the most recently applied one. */
async function migrateDown() {
  const { error, results }: MigrationResultSet = await migrator.migrateDown();

  results?.forEach((it) => {
    if (it.status === "Success") {
      console.log(`✓ migration "${it.migrationName}" reverted successfully`);
    } else if (it.status === "Error") {
      console.error(`✗ migration "${it.migrationName}" failed to revert`);
    }
  });

  if (error) {
    console.error("Rollback failed:", error);
    process.exit(1);
  }

  await db.destroy();
}

migrateDown();
