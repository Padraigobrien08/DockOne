"use client";

import { useState } from "react";
import { submitContactMessage } from "@/app/contact/actions";

interface ContactSectionProps {
  twitterUrl?: string;
  productHuntUrl?: string;
  githubUrl?: string;
}

export function ContactSection({
  twitterUrl,
  productHuntUrl,
  githubUrl,
}: ContactSectionProps) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [company, setCompany] = useState(""); // honeypot
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasLinks = twitterUrl || productHuntUrl || githubUrl;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Honeypot check
    if (company.trim()) {
      setError("Invalid submission.");
      return;
    }

    const messageTrimmed = message.trim();
    if (!messageTrimmed) {
      setError("Message is required.");
      return;
    }

    setLoading(true);
    const result = await submitContactMessage({
      email: email.trim() || null,
      message: messageTrimmed,
    });
    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setSuccess(true);
    setEmail("");
    setMessage("");
  }

  if (success) {
    return (
      <section
        aria-labelledby="contact-heading"
        className="border-t border-zinc-800/50 bg-zinc-900/20"
      >
        <div className="mx-auto max-w-6xl px-6 py-12 md:px-8 md:py-16">
          <div
            role="status"
            aria-live="polite"
            className="mx-auto max-w-2xl rounded-lg border border-emerald-800/60 bg-emerald-950/30 px-5 py-4 text-sm text-emerald-200"
          >
            <p className="font-medium">Message sent.</p>
            <p className="mt-1 text-emerald-300/90">
              Thanks for reaching out. We&apos;ll get back to you soon.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      aria-labelledby="contact-heading"
      className="border-t border-zinc-800/50 bg-zinc-900/20"
    >
      <div className="mx-auto max-w-6xl px-6 py-12 md:px-8 md:py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12 lg:gap-16">
          {/* Left column */}
          <div>
            <h2
              id="contact-heading"
              className="text-2xl font-semibold tracking-tight text-white md:text-3xl"
            >
              Contact
            </h2>
            <p className="mt-3 text-base leading-relaxed text-zinc-400 md:text-lg">
              Questions, feedback, or a project you think should be here — send a note.
            </p>
            {hasLinks && (
              <div className="mt-6 flex flex-wrap items-center gap-4">
                {twitterUrl && (
                  <a
                    href={twitterUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-zinc-500 hover:text-zinc-400 transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-zinc-950 rounded"
                  >
                    X/Twitter
                  </a>
                )}
                {productHuntUrl && (
                  <a
                    href={productHuntUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-zinc-500 hover:text-zinc-400 transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-zinc-950 rounded"
                  >
                    Product Hunt
                  </a>
                )}
                {githubUrl && (
                  <a
                    href={githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-zinc-500 hover:text-zinc-400 transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-zinc-950 rounded"
                  >
                    GitHub
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Right column: form */}
          <div>
            <form
              onSubmit={handleSubmit}
              className="space-y-4"
              aria-label="Contact form"
              noValidate
            >
              {/* Honeypot */}
              <label htmlFor="company" className="sr-only">
                Company
              </label>
              <input
                id="company"
                name="company"
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email (optional)"
                  disabled={loading}
                  className="w-full rounded-lg border border-zinc-700/70 bg-zinc-800/40 px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-zinc-950 disabled:opacity-60"
                />
              </div>

              {/* Message (required) */}
              <div>
                <label htmlFor="contact-message" className="sr-only">
                  Message
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Message"
                  disabled={loading}
                  aria-describedby={error ? "contact-error" : "contact-helper"}
                  aria-invalid={!!error}
                  className="w-full rounded-lg border border-zinc-700/70 bg-zinc-800/40 px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-zinc-950 disabled:opacity-60 resize-y min-h-[120px]"
                />
                <p id="contact-helper" className="mt-1.5 text-xs text-zinc-500">
                  No marketing. Just replies.
                </p>
                {error && (
                  <p
                    id="contact-error"
                    role="alert"
                    className="mt-1.5 text-sm text-red-400"
                    aria-live="assertive"
                  >
                    {error}
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-violet-500/25 transition-colors hover:bg-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-zinc-950 disabled:opacity-60 disabled:pointer-events-none"
              >
                {loading ? "Sending…" : "Send"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
