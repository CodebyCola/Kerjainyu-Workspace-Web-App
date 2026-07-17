import { Kysely, PostgresDialect } from "kysely";
import { Pool, types } from "pg";
import { Database } from "./types";

types.setTypeParser(types.builtins.TIMESTAMP, (value) =>
  value === null ? null : new Date(`${value.replace(" ", "T")}Z`),
);

const dialect = new PostgresDialect({
  pool: new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
  }),
});

export const db = new Kysely<Database>({
  dialect,
});
