// Import required types and functions from drizzle-orm/pg-core
import { integer, text, boolean, pgTable } from "drizzle-orm/pg-core";

/**
 * Define a PostgreSQL table for a simple to-do application.
 * This table contains three columns:
 * - id: A unique identifier for each task (primary key)
 * - text: The content or description of the task (not null)
 * - done: A boolean flag indicating whether the task is completed (defaults to false)
 */
export const todo = pgTable("todo", {
  // Define the 'id' column as an integer with a primary key
  id: integer("id").primaryKey(),

  // Define the 'text' column as text (string) that cannot be null
  text: text("text").notNull(),

  // Define the 'done' column as a boolean, with a default value of false, and it cannot be null
  done: boolean("done").default(false).notNull(),
});
