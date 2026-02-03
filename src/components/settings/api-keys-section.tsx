"use client";

import { useState, useEffect } from "react";
import { getApiKey, setApiKey, BYOK_PROVIDERS, type ByokProvider } from "@/lib/byok";

export function ApiKeysSection() {
  const [openai, setOpenai] = useState("");
  const [anthropic, setAnthropic] = useState("");
  const [mounted, setMounted] = useState(false);

  // Hydrate from localStorage after mount to avoid SSR mismatch (keys never sent to server).
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- intentional: hydrate from localStorage after mount */
    setMounted(true);
    setOpenai(getApiKey("openai") ?? "");
    setAnthropic(getApiKey("anthropic") ?? "");
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  function handleChange(provider: ByokProvider, value: string) {
    if (provider === "openai") setOpenai(value);
    else setAnthropic(value);
    setApiKey(provider, value || null);
  }

  if (!mounted) {
    return (
      <div className="animate-pulse rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="h-5 w-32 rounded bg-zinc-200 dark:bg-zinc-700" />
        <div className="mt-3 h-10 w-full rounded bg-zinc-200 dark:bg-zinc-700" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
        Keys stay in your browser. We never send them to our server. Clearing site data or storage
        removes them.
      </div>
      {BYOK_PROVIDERS.map(({ id, label }) => (
        <div key={id}>
          <label
            htmlFor={`byok-${id}`}
            className="block text-sm font-medium text-zinc-900 dark:text-zinc-50"
          >
            {label} API key
          </label>
          <input
            id={`byok-${id}`}
            type="password"
            autoComplete="off"
            value={id === "openai" ? openai : anthropic}
            onChange={(e) => handleChange(id, e.target.value)}
            placeholder={`sk-... (optional)`}
            className="mt-1.5 w-full max-w-md rounded-lg border border-zinc-300 bg-white px-3 py-2 font-mono text-sm text-zinc-900 placeholder-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-400"
          />
        </div>
      ))}
    </div>
  );
}
