import "server-only";
import fs from "node:fs";
import path from "node:path";
import type { Database } from "@/lib/types";
import { buildSeedDatabase } from "@/lib/seed";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "store.json");

let memoryCache: Database | null = null;

function ensureFile(): Database {
  if (memoryCache) return memoryCache;

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DATA_FILE)) {
    const seeded = buildSeedDatabase();
    fs.writeFileSync(DATA_FILE, JSON.stringify(seeded, null, 2));
    memoryCache = seeded;
    return seeded;
  }

  const raw = fs.readFileSync(DATA_FILE, "utf-8");
  memoryCache = JSON.parse(raw) as Database;
  return memoryCache;
}

function persist(db: Database) {
  memoryCache = db;
  fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2));
}

export function readDb(): Database {
  return ensureFile();
}

export function writeDb(mutator: (db: Database) => void): Database {
  const db = ensureFile();
  mutator(db);
  persist(db);
  return db;
}
