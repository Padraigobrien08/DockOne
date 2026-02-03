"use client";

interface ReportModalProps {
  appName: string;
  onClose: () => void;
}

export function ReportModal({ appName, onClose }: ReportModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-zinc-900"
        onClick={(e) => e.stopPropagation()}
        role="document"
      >
        <h2 id="report-title" className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Report &quot;{appName}&quot;
        </h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Reporting is not implemented yet. This is a placeholder.
        </p>
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-zinc-200 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
