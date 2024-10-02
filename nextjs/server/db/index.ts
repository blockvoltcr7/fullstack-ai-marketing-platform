import { config } from "dotenv";
import { drizzle } from "drizzle-orm/neon-http";
import { sql } from "@vercel/postgres";
config({ path: ".env" }); // or .env.local

const sql = neon(process.env.DATABASE_URL!);

export const db = drizzle(sql);
