/**
 * Lightweight moderation: pending submissions, approve/reject toggle.
 * Admin-only.
 */
export default function AdminPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">Admin</h1>
      <p className="text-zinc-600 dark:text-zinc-400 mt-2">
        Pending apps and approval toggles will go here.
      </p>
    </div>
  );
}
