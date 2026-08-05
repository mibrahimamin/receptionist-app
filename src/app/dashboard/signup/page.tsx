"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);
    setMessage(null);

    const trimmedBusinessName = businessName.trim();
    const trimmedEmail = email.trim();

    if (!trimmedBusinessName) {
      setError("Please enter your business name.");
      return;
    }

    if (password.length < 8) {
      setError("Your password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    setSubmitting(true);

    try {
      const supabase = createClient();

      const { data, error: signupError } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          data: {
            business_name: trimmedBusinessName,
          },
          emailRedirectTo: `${window.location.origin}/dashboard/login`,
        },
      });

      if (signupError) {
        setError(signupError.message);
        return;
      }

      if (!data.user) {
        setError("The account could not be created.");
        return;
      }

      setMessage(
        "Account created. Check your email and click the confirmation link before signing in."
      );

      setBusinessName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch {
      setError("Something went wrong while creating your account.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="ledger-card p-8 w-full max-w-md">
        <span className="ledger-tab">Front Desk</span>

        <h1 className="font-display text-2xl text-ink mb-1">
          Create an account
        </h1>

        <p className="text-sm text-inkLight mb-6">
          Create your business dashboard and receptionist account.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            autoFocus
            type="text"
            value={businessName}
            onChange={(event) => setBusinessName(event.target.value)}
            placeholder="Business name"
            autoComplete="organization"
            required
            className="w-full rounded-md border border-ink/20 bg-white/80 px-3 py-2 text-sm focus:border-brass"
          />

          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email"
            autoComplete="email"
            required
            className="w-full rounded-md border border-ink/20 bg-white/80 px-3 py-2 text-sm focus:border-brass"
          />

          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password"
            autoComplete="new-password"
            minLength={8}
            required
            className="w-full rounded-md border border-ink/20 bg-white/80 px-3 py-2 text-sm focus:border-brass"
          />

          <input
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Confirm password"
            autoComplete="new-password"
            minLength={8}
            required
            className="w-full rounded-md border border-ink/20 bg-white/80 px-3 py-2 text-sm focus:border-brass"
          />

          {error && <p className="text-sm text-clay">{error}</p>}

          {message && <p className="text-sm text-sage">{message}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full stamp-btn stamp-btn-selected disabled:opacity-50"
          >
            {submitting ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="text-sm text-center text-inkLight mt-5">
          Already have an account?{" "}
          <Link
            href="/dashboard/login"
            className="text-brass underline hover:no-underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}