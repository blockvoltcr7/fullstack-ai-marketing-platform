// Import required types and functions from drizzle-orm/pg-core
import {
  integer,
  text,
  boolean,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

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

/**
 * Defines the schema for the 'projects' table using pgTable from Drizzle ORM.
 * This table stores information about projects, including their ID, title,
 * creation and update timestamps, and associated user ID.
 */
export const projectsTable = pgTable("projects", {
  // Unique identifier for each project
  id: uuid("id").defaultRandom().primaryKey(),

  // Project title, cannot be null
  title: text("title").notNull(),

  // Timestamp for when the project was created, defaults to current time
  createdAt: timestamp("created_at").notNull().defaultNow(),

  // Timestamp for when the project was last updated
  // Automatically updates to current time on each update
  updatedAt: timestamp("updated_at")
    .notNull()
    .$onUpdate(() => new Date()),

  // Foreign key reference to the user who owns the project
  userId: varchar("user_id", { length: 50 }).notNull(),
});
