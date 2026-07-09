import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";
import fs from "fs";
import path from "path";

// Try loading env from parent directory if DATABASE_URL is not set
if (!process.env.DATABASE_URL) {
  try {
    const rootEnvPath = path.resolve(process.cwd(), ".env");
    if (fs.existsSync(rootEnvPath)) {
      const content = fs.readFileSync(rootEnvPath, "utf-8");
      for (const line of content.split("\n")) {
        const match = line.match(/^\s*DATABASE_URL\s*=\s*(["']?)(.*?)\1\s*$/);
        if (match) {
          process.env.DATABASE_URL = match[2];
          break;
        }
      }
    }
  } catch (err) {
    console.warn("Failed to load .env file from workspace root:", err);
  }
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn(
    "⚠️ DATABASE_URL is not set. Database operations will fail when executed. Provision a database or define DATABASE_URL in a .env file to enable full persistent operations."
  );
}

export const pool = new pg.Pool({
  connectionString: connectionString || "postgresql://localhost:5432/vyapaar_mock",
});

export const db = drizzle(pool, { schema });

export * from "./schema";

