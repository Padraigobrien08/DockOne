/**
 * User settings: BYOK (API keys in localStorage only, never sent to server).
 */
export default function SettingsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">Settings</h1>
      <p className="text-zinc-600 dark:text-zinc-400 mt-2">
        BYOK: API keys stored only in browser localStorage.
      </p>
    </div>
  );
}
