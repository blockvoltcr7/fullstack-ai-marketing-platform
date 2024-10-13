import { relations } from "drizzle-orm";
import {
  text,
  pgTable,
  uuid,
  timestamp,
  varchar,
  bigint,
  integer,
} from "drizzle-orm/pg-core";

/**
 * The projectsTable represents the projects created by users.
 * Each project has a unique identifier, a title, timestamps for creation and updates,
 * and a reference to the user who owns the project.
 */
export const projectsTable = pgTable("projects", {
  id: uuid("id").defaultRandom().primaryKey(), // Unique identifier for the project
  title: text("title").notNull(), // Title of the project
  createdAt: timestamp("created_at").notNull().defaultNow(), // Timestamp when the project was created
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()), // Timestamp when the project was last updated
  userId: varchar("user_id", { length: 50 }).notNull(), // Reference to the user who created the project
});

/**
 * Relations for the projectsTable.
 * This defines the relationships between projects and other tables such as assets, prompts, and generated content.
 */
export const projectsRelations = relations(projectsTable, ({ many }) => ({
  assets: many(assetTable), // A project can have many assets
  prompts: many(promptsTable), // A project can have many prompts
  generatedContent: many(generatedContentTable), // A project can have many generated content entries
}));

/**
 * The assetTable represents the assets associated with projects.
 * Each asset has a unique identifier, a reference to the project it belongs to,
 * and metadata about the asset such as title, file information, and timestamps.
 */
export const assetTable = pgTable("assets", {
  id: uuid("id").defaultRandom().primaryKey(), // Unique identifier for the asset
  projectId: uuid("project_id")
    .notNull()
    .references(() => projectsTable.id, {
      onDelete: "cascade", // If the project is deleted, the associated assets will also be deleted
    }),
  title: text("title").notNull(), // Title of the asset
  fileName: text("file_name").notNull(), // Name of the file associated with the asset
  fileUrl: text("file_url").notNull(), // URL to access the asset file
  fileType: varchar("file_type", { length: 50 }).notNull(), // Type of the file (e.g., image, video)
  mimeType: varchar("mime_type", { length: 100 }).notNull(), // MIME type of the file
  size: bigint("size", { mode: "number" }).notNull(), // Size of the asset file in bytes
  content: text("content").default(""), // Content of the asset, if applicable
  tokenCount: integer("token_count").default(0), // Number of tokens associated with the asset
  createdAt: timestamp("created_at").notNull().defaultNow(), // Timestamp when the asset was created
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()), // Timestamp when the asset was last updated
});

/**
 * Relations for the assetTable.
 * This defines the relationship between assets and their associated project.
 */
export const assetRelations = relations(assetTable, ({ one }) => ({
  project: one(projectsTable, {
    fields: [assetTable.projectId], // Field in the asset table that references the project
    references: [projectsTable.id], // Field in the projects table that is referenced
  }),
}));

/**
 * The assetProcessingJobTable represents jobs related to processing assets.
 * Each job has a unique identifier, references to the asset and project,
 * status information, and timestamps.
 */
export const assetProcessingJobTable = pgTable("asset_processing_jobs", {
  id: uuid("id").defaultRandom().primaryKey(), // Unique identifier for the processing job
  assetId: uuid("asset_id")
    .notNull()
    .unique()
    .references(() => assetTable.id, { onDelete: "cascade" }), // Reference to the asset being processed
  projectId: uuid("project_id")
    .notNull()
    .references(() => projectsTable.id, { onDelete: "cascade" }), // Reference to the project associated with the job
  status: text("status").notNull(), // Current status of the processing job
  errorMessage: text("error_message"), // Error message if the job fails
  attempts: integer("attempts").notNull().default(0), // Number of attempts made to process the asset
  lastHeartBeat: timestamp("last_heart_beat").notNull().defaultNow(), // Timestamp of the last heartbeat from the job
  createdAt: timestamp("created_at").notNull().defaultNow(), // Timestamp when the job was created
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()), // Timestamp when the job was last updated
});

/**
 * Relations for the assetProcessingJobTable.
 * This defines the relationships between processing jobs and their associated asset and project.
 */
export const assetProcessingJobRelations = relations(
  assetProcessingJobTable,
  ({ one }) => ({
    asset: one(assetTable, {
      fields: [assetProcessingJobTable.assetId], // Field in the job table that references the asset
      references: [assetTable.id], // Field in the asset table that is referenced
    }),
    project: one(projectsTable, {
      fields: [assetProcessingJobTable.projectId], // Field in the job table that references the project
      references: [projectsTable.id], // Field in the projects table that is referenced
    }),
  })
);

/**
 * The promptsTable represents prompts associated with projects.
 * Each prompt has a unique identifier, a reference to the project it belongs to,
 * and metadata about the prompt such as name, content, and timestamps.
 */
export const promptsTable = pgTable("prompts", {
  id: uuid("id").defaultRandom().primaryKey(), // Unique identifier for the prompt
  projectId: uuid("project_id")
    .notNull()
    .references(() => projectsTable.id, {
      onDelete: "cascade", // If the project is deleted, the associated prompts will also be deleted
    }),
  name: text("name").notNull(), // Name of the prompt
  prompt: text("prompt"), // Content of the prompt
  tokenCount: integer("token_count").default(0), // Number of tokens associated with the prompt
  order: integer("order").notNull(), // Order of the prompt for future reordering
  createdAt: timestamp("created_at").notNull().defaultNow(), // Timestamp when the prompt was created
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()), // Timestamp when the prompt was last updated
});

/**
 * Relations for the promptsTable.
 * This defines the relationship between prompts and their associated project.
 */
export const promptRelations = relations(promptsTable, ({ one }) => ({
  project: one(projectsTable, {
    fields: [promptsTable.projectId], // Field in the prompt table that references the project
    references: [projectsTable.id], // Field in the projects table that is referenced
  }),
}));

/**
 * The templatesTable represents templates created by users.
 * Each template has a unique identifier, a reference to the user who created it,
 * and metadata such as title and timestamps.
 */
export const templatesTable = pgTable("templates", {
  id: uuid("id").defaultRandom().primaryKey(), // Unique identifier for the template
  userId: varchar("user_id", { length: 50 }).notNull(), // Reference to the user who created the template
  title: text("title").notNull(), // Title of the template
  createdAt: timestamp("created_at").notNull().defaultNow(), // Timestamp when the template was created
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()), // Timestamp when the template was last updated
});

/**
 * Relations for the templatesTable.
 * This defines the relationships between templates and their associated template prompts.
 */
export const templatesRelations = relations(templatesTable, ({ many }) => ({
  templatePrompts: many(templatePromptsTable), // A template can have many prompts associated with it
}));

/**
 * The templatePromptsTable represents prompts associated with templates.
 * Each prompt has a unique identifier, a reference to the template it belongs to,
 * and metadata such as name, content, and timestamps.
 */
export const templatePromptsTable = pgTable("template_prompts", {
  id: uuid("id").defaultRandom().primaryKey(), // Unique identifier for the template prompt
  templateId: uuid("template_id")
    .notNull()
    .references(() => templatesTable.id, { onDelete: "cascade" }), // Reference to the template associated with the prompt
  name: text("name").notNull(), // Name of the template prompt
  prompt: text("prompt"), // Content of the template prompt
  tokenCount: integer("token_count").default(0), // Number of tokens associated with the template prompt
  order: integer("order").notNull(), // Order of the template prompt for future reordering
  createdAt: timestamp("created_at").notNull().defaultNow(), // Timestamp when the template prompt was created
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()), // Timestamp when the template prompt was last updated
});

/**
 * Relations for the templatePromptsTable.
 * This defines the relationship between template prompts and their associated template.
 */
export const templatePromptsRelations = relations(
  templatePromptsTable,
  ({ one }) => ({
    template: one(templatesTable, {
      fields: [templatePromptsTable.templateId], // Field in the template prompt table that references the template
      references: [templatesTable.id], // Field in the templates table that is referenced
    }),
  })
);

/**
 * The generatedContentTable represents content generated for projects.
 * Each entry has a unique identifier, a reference to the project it belongs to,
 * and metadata such as name, result, and timestamps.
 */
export const generatedContentTable = pgTable("generated_content", {
  id: uuid("id").defaultRandom().primaryKey(), // Unique identifier for the generated content
  projectId: uuid("project_id")
    .notNull()
    .references(() => projectsTable.id, {
      onDelete: "cascade", // If the project is deleted, the associated generated content will also be deleted
    }),
  name: text("name").notNull(), // Name of the generated content
  result: text("result").notNull(), // Result of the generated content
  order: integer("order").notNull(), // Order of the generated content for future reordering
  createdAt: timestamp("created_at").notNull().defaultNow(), // Timestamp when the generated content was created
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()), // Timestamp when the generated content was last updated
});

/**
 * Relations for the generatedContentTable.
 * This defines the relationship between generated content and their associated project.
 */
export const GeneratedContentRelations = relations(
  generatedContentTable,
  ({ one }) => ({
    project: one(projectsTable, {
      fields: [generatedContentTable.projectId], // Field in the generated content table that references the project
      references: [projectsTable.id], // Field in the projects table that is referenced
    }),
  })
);

/**
 * The stripeCustomersTable represents customers in Stripe.
 * Each entry has a unique identifier, a reference to the user who owns the customer,
 * and the Stripe customer ID.
 */
export const stripeCustomersTable = pgTable("stripe_customers", {
  id: uuid("id").defaultRandom().primaryKey(), // Unique identifier for the Stripe customer
  userId: varchar("user_id", { length: 50 }).notNull().unique(), // Reference to the user who owns the Stripe customer
  stripeCustomerId: varchar("stripe_customer_id", { length: 100 })
    .notNull()
    .unique(), // Unique identifier for the customer in Stripe
  createdAt: timestamp("created_at").notNull().defaultNow(), // Timestamp when the Stripe customer was created
});

/**
 * The subscriptionsTable represents subscriptions associated with users.
 * Each entry has a unique identifier, a reference to the user who owns the subscription,
 * and the Stripe subscription ID.
 */
export const subscriptionsTable = pgTable("subscriptions", {
  id: uuid("id").defaultRandom().primaryKey(), // Unique identifier for the subscription
  userId: varchar("user_id", { length: 50 }).notNull(), // Reference to the user who owns the subscription
  stripeSubscriptionId: varchar("stripe_subscription_id", { length: 100 })
    .notNull()
    .unique(), // Unique identifier for the subscription in Stripe
  createdAt: timestamp("created_at").notNull().defaultNow(), // Timestamp when the subscription was created
});

/**
 * Types
 *
 * The following types are inferred from the database tables defined in the schema.
 * These types provide type safety and clarity when interacting with the database,
 * ensuring that the data structures used for inserting and selecting records
 * conform to the expected formats.
 */
export type InsertProject = typeof projectsTable.$inferInsert; // Type for inserting a new project
export type Project = typeof projectsTable.$inferSelect; // Type for selecting a project
export type Asset = typeof assetTable.$inferSelect; // Type for selecting an asset
export type InsertAsset = typeof assetTable.$inferInsert; // Type for inserting a new asset
export type AssetProcessingJob = typeof assetProcessingJobTable.$inferSelect; // Type for selecting a processing job
export type InsertAssetProcessingJob =
  typeof assetProcessingJobTable.$inferInsert; // Type for inserting a new processing job
export type Prompt = typeof promptsTable.$inferSelect; // Type for selecting a prompt
export type InsertPrompt = typeof promptsTable.$inferInsert; // Type for inserting a new prompt
export type Template = typeof templatesTable.$inferSelect; // Type for selecting a template
export type InsertTemplate = typeof templatesTable.$inferInsert; // Type for inserting a new template
export type TemplatePrompt = typeof templatePromptsTable.$inferSelect; // Type for selecting a template prompt
export type InsertTemplatePrompt = typeof templatePromptsTable.$inferInsert; // Type for inserting a new template prompt
export type GeneratedContent = typeof generatedContentTable.$inferSelect; // Type for selecting generated content
export type InsertGeneratedContent = typeof generatedContentTable.$inferInsert; // Type for inserting new generated content
export type StripeCustomer = typeof stripeCustomersTable.$inferSelect; // Type for selecting a Stripe customer
export type InsertStripeCustomer = typeof stripeCustomersTable.$inferInsert; // Type for inserting a new Stripe customer
export type Subscription = typeof subscriptionsTable.$inferSelect; // Type for selecting a subscription
export type InsertSubscription = typeof subscriptionsTable.$inferInsert; // Type for inserting a new subscription
