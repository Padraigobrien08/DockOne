import { Suspense } from "react";
import { SignInForm } from "./sign-in-form";
import { Container } from "@/components/ui/container";

function SignInFallback() {
  return (
    <div className="py-12 sm:py-16">
      <Container>
        <div className="mx-auto max-w-sm">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Sign in</h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            We’ll send you a magic link — no password.
          </p>
          <div className="mt-6 h-24 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800" />
        </div>
      </Container>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<SignInFallback />}>
      <SignInForm />
    </Suspense>
  );
}
