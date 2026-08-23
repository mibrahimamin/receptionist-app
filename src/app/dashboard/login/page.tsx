"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    

    const { error } = await supabase.auth.signInWithPassword({

    email,

    password,

    });

    if (error) {

    setError("Incorrect email or password. Please try again.");

    setSubmitting(false);

    return;

    }

    if (rememberMe) {
      localStorage.setItem("dashboard-email", email);
    } else {
      localStorage.removeItem("dashboard-email");
    }

    router.push(searchParams.get("from") || "/dashboard");
    router.refresh();
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="ledger-card p-8 w-full max-w-sm">
        <span className="ledger-tab">Front Desk</span>

        <h1 className="font-inter font-medium text-2xl text-ink mb-1">
          Sign in
        </h1>

        <p className="text-sm text-inkLight mb-6">
          Sign in to manage bookings, contacts, FAQs, and settings.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            autoFocus
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            autoComplete="email"
            required
            className="w-full rounded-md border border-ink/20 bg-white/80 px-3 py-2 text-sm focus:border-brass"
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoComplete="current-password"
            required
            className="w-full rounded-md border border-ink/20 bg-white/80 px-3 py-2 text-sm focus:border-brass"
          />

          <label className="flex items-center gap-2 text-sm text-inkLight">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            Remember my email
          </label>

          {error && (
            <p className="text-sm text-clay">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full stamp-btn stamp-btn-selected disabled:opacity-50"
          >
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <p className="text-sm text-center text-inkLight mt-5">

          New business?{" "}

          <Link

            href="/dashboard/signup"

            className="text-brass underline hover:no-underline"

          >

            Create an account

          </Link>

        </p>
      </div>
    </main>
  );
}