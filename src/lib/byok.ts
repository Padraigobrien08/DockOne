/**
 * BYOK: API keys stored in localStorage only. Never sent to Supabase or any server.
 * Use getApiKey(provider) in client code (e.g. when embedding an app that needs LLM keys).
 */

const STORAGE_PREFIX = "dockone_byok_";

export type ByokProvider = "openai" | "anthropic";

const PROVIDER_KEYS: Record<ByokProvider, string> = {
  openai: `${STORAGE_PREFIX}openai`,
  anthropic: `${STORAGE_PREFIX}anthropic`,
};

/**
 * Get the user's API key for a provider from localStorage.
 * Call only in client code (browser). Returns null if not set or in SSR.
 */
export function getApiKey(provider: ByokProvider): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(PROVIDER_KEYS[provider]);
  } catch {
    return null;
  }
}

/**
 * Set the API key for a provider in localStorage. Client-only.
 */
export function setApiKey(provider: ByokProvider, value: string | null): void {
  if (typeof window === "undefined") return;
  try {
    if (value == null || value.trim() === "") {
      window.localStorage.removeItem(PROVIDER_KEYS[provider]);
    } else {
      window.localStorage.setItem(PROVIDER_KEYS[provider], value.trim());
    }
  } catch {
    // ignore
  }
}

export const BYOK_PROVIDERS: { id: ByokProvider; label: string }[] = [
  { id: "openai", label: "OpenAI" },
  { id: "anthropic", label: "Anthropic" },
];
