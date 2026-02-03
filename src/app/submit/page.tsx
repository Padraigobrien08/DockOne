/**
 * Submit an app (authenticated).
 * Will show login prompt if not signed in.
 */
export default function SubmitAppPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">Submit an app</h1>
      <p className="text-zinc-600 dark:text-zinc-400 mt-2">
        Auth-gated form; new submissions start as pending.
      </p>
    </div>
  );
}
