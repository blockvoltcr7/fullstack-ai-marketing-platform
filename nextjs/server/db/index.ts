/**
 * Database Configuration Module
 *
 * This module sets up the database connection using Drizzle ORM with PostgreSQL.
 * It imports necessary modules and initializes the database connection with the defined schema.
 *
 * Dependencies:
 * - dotenv: Used to load environment variables from a .env file.
 * - drizzle-orm: A TypeScript ORM for PostgreSQL that provides a type-safe way to interact with the database.
 * - @vercel/postgres: A package that provides a SQL interface for connecting to PostgreSQL databases on Vercel.
 * - schema: The database schema defined in the schema.ts file, which outlines the structure of the database tables.
 */
import { drizzle } from "drizzle-orm/vercel-postgres"; // Importing drizzle for ORM functionality
import { sql } from "@vercel/postgres"; // Importing sql for executing SQL queries
import * as schema from "./schema"; // Importing the database schema

// Initialize the database connection using drizzle ORM
// The drizzle function takes the SQL client and the schema as arguments
// This creates a database instance that can be used to perform queries and transactions
export const db = drizzle(sql, { schema });
