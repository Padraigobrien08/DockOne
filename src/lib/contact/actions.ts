"use server";

import { headers } from "next/headers";
import { createHash } from "crypto";
import { createClient, getUser } from "@/lib/supabase/server";

export interface SubmitContactMessageResult {
  ok: boolean;
  error?: string;
}

const MESSAGE_MIN_LENGTH = 10;
const MESSAGE_MAX_LENGTH = 2000;
const RATE_LIMIT_COUNT = 5;
const RATE_LIMIT_HOURS = 1;

/**
 * Hash a string for rate limiting (best-effort, not cryptographically secure).
 */
function hashString(input: string): string {
  return createHash("sha256").update(input).digest("hex").slice(0, 16);
}

/**
 * Validate email format (basic check).
 */
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/**
 * Get IP address from headers (best-effort).
 * Checks x-forwarded-for, x-real-ip, and falls back to null.
 */
function getIpAddress(headersList: Headers): string | null {
  const forwardedFor = headersList.get("x-forwarded-for");
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs; take the first one
    const firstIp = forwardedFor.split(",")[0]?.trim();
    if (firstIp) return firstIp;
  }
  const realIp = headersList.get("x-real-ip");
  if (realIp) return realIp.trim();
  return null;
}

/**
 * Get IP hash for rate limiting (hashed for privacy).
 */
function getIpHash(headersList: Headers): string | null {
  const ipAddress = getIpAddress(headersList);
  if (!ipAddress) return null;
  return hashString(ipAddress);
}

/**
 * Get user agent for rate limiting fallback.
 */
function getUserAgent(headersList: Headers): string | null {
  return headersList.get("user-agent");
}

/**
 * Check rate limit: max RATE_LIMIT_COUNT submissions per RATE_LIMIT_HOURS.
 * Returns true if rate limit exceeded, false if allowed.
 * Checks by user_id first (if logged in), then ip_hash, then user_agent.
 */
async function checkRateLimit(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string | null,
  ipHash: string | null,
  userAgent: string | null
): Promise<boolean> {
  const oneHourAgo = new Date(Date.now() - RATE_LIMIT_HOURS * 60 * 60 * 1000).toISOString();

  // Check by user_id first (if logged in)
  if (userId) {
    const { count, error } = await supabase
      .from("contact_messages")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", oneHourAgo);
    if (!error && count !== null && count >= RATE_LIMIT_COUNT) {
      return true;
    }
  }

  // Try IP hash
  if (ipHash) {
    const { count, error } = await supabase
      .from("contact_messages")
      .select("*", { count: "exact", head: true })
      .eq("ip_hash", ipHash)
      .gte("created_at", oneHourAgo);
    if (!error && count !== null && count >= RATE_LIMIT_COUNT) {
      return true;
    }
  }

  // Fallback to user agent
  if (userAgent) {
    const { count, error } = await supabase
      .from("contact_messages")
      .select("*", { count: "exact", head: true })
      .eq("user_agent", userAgent)
      .gte("created_at", oneHourAgo);
    if (!error && count !== null && count >= RATE_LIMIT_COUNT) {
      return true;
    }
  }

  return false;
}

/**
 * Submit a contact message. Includes honeypot check, validation, and rate limiting.
 * Accepts FormData from form action.
 */
export async function submitContactMessage(
  _prevState: SubmitContactMessageResult | null,
  formData: FormData
): Promise<SubmitContactMessageResult> {
  const email = (formData.get("email") as string)?.trim() || null;
  const message = (formData.get("message") as string)?.trim() || "";
  const company = (formData.get("company") as string)?.trim() || "";

  // Honeypot: if company is non-empty, silently return success
  if (company) {
    return { ok: true };
  }

  // Validate message length
  if (message.length < MESSAGE_MIN_LENGTH) {
    return {
      ok: false,
      error: `Message must be at least ${MESSAGE_MIN_LENGTH} characters.`,
    };
  }
  if (message.length > MESSAGE_MAX_LENGTH) {
    return {
      ok: false,
      error: `Message must be at most ${MESSAGE_MAX_LENGTH} characters.`,
    };
  }

  // Validate email format if provided
  if (email) {
    if (!isValidEmail(email)) {
      return {
        ok: false,
        error: "Invalid email format.",
      };
    }
  }

  // Get user (if logged in) and headers for rate limiting
  const user = await getUser();
  const headersList = await headers();
  const ipHash = getIpHash(headersList);
  const userAgent = getUserAgent(headersList);

  // Check rate limit
  const supabase = await createClient();
  const rateLimited = await checkRateLimit(supabase, user?.id ?? null, ipHash, userAgent);
  if (rateLimited) {
    return {
      ok: false,
      error: `Too many submissions. Please wait ${RATE_LIMIT_HOURS} hour${RATE_LIMIT_HOURS > 1 ? "s" : ""} before sending another message.`,
    };
  }

  // Insert message
  const { error } = await supabase.from("contact_messages").insert({
    email: email || null,
    message: message,
    user_id: user?.id ?? null,
    ip_hash: ipHash,
    user_agent: userAgent,
  });

  if (error) {
    console.error("[contact] insert failed:", error);
    return {
      ok: false,
      error: "Failed to send message. Please try again.",
    };
  }

  return { ok: true };
}
