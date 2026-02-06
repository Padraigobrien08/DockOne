import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";

function getEnvPaths(): string[] {
  const cwd = process.cwd();
  const paths = [
    path.join(cwd, ".env"),
    path.join(cwd, "DockOne", ".env"),
  ];
  let dir = cwd;
  for (let i = 0; i < 10; i++) {
    const parent = path.dirname(dir);
    if (parent === dir) break;
    paths.push(path.join(dir, ".env"));
    dir = parent;
  }
  return paths;
}

/**
 * Load .env by reading and parsing the file (so we're not dependent on dotenv
 * finding it). Tries multiple paths; merges parsed vars into process.env.
 */
function loadEnv(): void {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return;
  for (const envPath of getEnvPaths()) {
    try {
      const content = fs.readFileSync(envPath, "utf8");
      const parsed = dotenv.parse(content);
      for (const [k, v] of Object.entries(parsed)) {
        if (v !== undefined && process.env[k] == null) process.env[k] = v;
      }
      return;
    } catch {
      continue;
    }
  }
}

/**
 * Returns Supabase URL and anon key for the client. Used when NEXT_PUBLIC_*
 * env vars are not available in the browser (e.g. dev cache). Anon key is public.
 */
export function GET() {
  loadEnv();
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  const url = rawUrl.trim().replace(/\r$/, "");
  const key = rawKey.trim().replace(/\r$/, "");
  return NextResponse.json({ url, key });
}
