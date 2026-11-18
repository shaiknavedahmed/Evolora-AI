"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/Toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      showToast("success", "Welcome back.");
    } catch (err: unknown) {
      let message = "Invalid email or password.";
      if (err && typeof err === "object") {
        if ("detail" in err && (err as { detail: unknown }).detail) {
          message = String((err as { detail: unknown }).detail);
        } else if ("message" in err && (err as { message: unknown }).message) {
          message = String((err as { message: unknown }).message);
        }
      }
      showToast("error", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-5 bg-[var(--color-bg)]">
      <div className="w-full max-w-[360px]">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="text-[15px] font-semibold text-[var(--color-ink-primary)]">
            Evolora
          </Link>
          <h1 className="text-display mt-6">
            Sign in
          </h1>
          <p className="mt-2 text-body-sm">
            Pick up where you left off.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="login-email" className="text-label block mb-1.5">
                Email
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="input"
              />
            </div>

            <div>
              <label htmlFor="login-password" className="text-label block mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                  required
                  className="input pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-tertiary)] hover:text-[var(--color-ink-primary)] transition-colors"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center text-[14px] py-2.5"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </div>
        </form>

        <p className="text-center text-[13px] text-[var(--color-ink-secondary)] mt-6">
          No account yet?{" "}
          <Link href="/register" className="text-[var(--color-accent-text)] hover:underline font-medium">
            Create one
          </Link>
        </p>
      </div>
    </main>
  );
}
