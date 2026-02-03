"use client";

import { useState } from "react";
import { ReportModal } from "./report-modal";

interface ReportButtonProps {
  appName: string;
}

export function ReportButton({ appName }: ReportButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-sm text-zinc-500 underline hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
      >
        Report
      </button>
      {open && (
        <ReportModal appName={appName} onClose={() => setOpen(false)} />
      )}
    </>
  );
}
