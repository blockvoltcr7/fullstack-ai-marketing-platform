/**
 * Explanation:
 *
 * 1. dotenv Configuration:
 * - The code imports the config function from the dotenv package, which is used to load environment variables from a .env file into process.env.
 * - The config({ path: ".env" }) call initializes dotenv to read environment variables from a file named .env.
 *   - This allows sensitive configuration details like the database URL to be securely stored and accessed.
 *
 * 2. drizzle-kit:
 * - The defineConfig function is imported from the drizzle-kit package. drizzle-kit is a tool used to manage database schema migrations and configurations in a project.
 *
 * 3. Database Configuration:
 * - The configuration passed to defineConfig defines various properties for database interaction:
 *   - schema: Specifies the path to the TypeScript file (./src/db/schema.ts) that defines the database schema. This file contains the structure of the database tables and fields.
 *   - out: Specifies the directory (./migrations) where migration files are stored. Migrations are used to make incremental changes to the database schema over time.
 *   - dialect: Indicates the database type, in this case, "postgresql", meaning the code is meant to work with a PostgreSQL database.
 *   - dbCredentials: This section contains the credentials needed to connect to the database.
 *   - Specifically, it pulls the DATABASE_URL from environment variables using process.env.DATABASE_URL.
 *   - The exclamation mark (!) is a TypeScript feature that tells the compiler that DATABASE_URL will always be defined (non-null).
 *
 * Purpose:
 * This code configures how the application interacts with a PostgreSQL database.
 * It uses environment variables to keep the database credentials secure and external to the source code.
 * The drizzle-kit setup is responsible for managing the database schema and migrations,
 *  and it will automatically generate migration files based on changes to the schema defined in schema.ts.
 */

import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

const POSTGRES_URL = process.env.DATABASE_URL;

if (!POSTGRES_URL) {
  throw new Error("DATABASE_URL is not set");

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: POSTGRES_URL!,
  },
});
