"use client";

import { useActionState, useRef, useEffect } from "react";
import { submitContactMessage, type SubmitContactMessageResult } from "@/lib/contact/actions";

const initialState: SubmitContactMessageResult = { ok: false };

export function ContactForm() {
  const [state, formAction, isPending] = useActionState(submitContactMessage, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const messageTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Clear form on success
  useEffect(() => {
    if (state.ok && formRef.current) {
      formRef.current.reset();
      messageTextareaRef.current?.focus();
    }
  }, [state.ok]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="space-y-4"
      aria-label="Contact form"
      noValidate
    >
      {/* Success message (inline) */}
      {state.ok && (
        <div
          role="status"
          aria-live="polite"
          className="rounded-lg border border-emerald-800/60 bg-emerald-950/30 px-4 py-3 text-sm text-emerald-200 transition-opacity"
        >
          <p className="font-medium">Message sent — thanks.</p>
        </div>
      )}

      {/* Honeypot */}
      <label htmlFor="company" className="sr-only">
        Company
      </label>
      <input
        id="company"
        name="company"
        type="text"
        tabIndex={-1}
        autoComplete="off"
        className="sr-only"
        aria-hidden="true"
      />

      {/* Email (optional) */}
      <div>
        <label htmlFor="contact-email" className="sr-only">
          Email (optional)
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="Email (optional)"
          disabled={isPending}
          className="w-full rounded-lg border border-zinc-700/70 bg-zinc-800/40 px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-zinc-950 disabled:opacity-60"
        />
      </div>

      {/* Message (required) */}
      <div>
        <label htmlFor="contact-message" className="sr-only">
          Message
        </label>
        <textarea
          ref={messageTextareaRef}
          id="contact-message"
          name="message"
          required
          rows={5}
          placeholder="Message"
          disabled={isPending}
          aria-describedby={
            state.error
              ? "contact-error"
              : state.ok
                ? "contact-success"
                : "contact-helper"
          }
          aria-invalid={!!state.error}
          className="w-full rounded-lg border border-zinc-700/70 bg-zinc-800/40 px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-zinc-950 disabled:opacity-60 resize-y min-h-[120px]"
        />
        {!state.ok && (
          <p id="contact-helper" className="mt-1.5 text-xs text-zinc-500">
            No spam, no marketing. Just real replies.
          </p>
        )}
        {state.error && (
          <p
            id="contact-error"
            role="alert"
            className="mt-1.5 text-sm text-red-400 transition-opacity"
            aria-live="assertive"
          >
            {state.error}
          </p>
        )}
      </div>

      {/* Buttons: LinkedIn (left) and Send (right) */}
      <div className="flex gap-3">
        <a
          href="https://www.linkedin.com/in/padraigmobrien/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 rounded-lg bg-[#0077b5] px-5 py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-[#006399] focus:outline-none focus:ring-2 focus:ring-[#0077b5] focus:ring-offset-2 focus:ring-offset-zinc-950"
        >
          Message me on LinkedIn
        </a>
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-violet-500/25 transition-colors hover:bg-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-zinc-950 disabled:opacity-60 disabled:pointer-events-none"
        >
          {isPending ? "Sending…" : "Send"}
        </button>
      </div>
    </form>
  );
}
