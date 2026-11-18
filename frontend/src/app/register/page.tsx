"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/Toast";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      showToast("error", "Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    try {
      await register(name, email, password);
      showToast("success", "Account created. You're in.");
    } catch (err: unknown) {
      let message = "Registration failed. Try again.";
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
            Create your account
          </h1>
          <p className="mt-2 text-body-sm">
            You&apos;ll be practicing in under a minute.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="register-name" className="text-label block mb-1.5">
                Name
              </label>
              <input
                id="register-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
                minLength={2}
                className="input"
              />
            </div>

            <div>
              <label htmlFor="register-email" className="text-label block mb-1.5">
                Email
              </label>
              <input
                id="register-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="input"
              />
            </div>

            <div>
              <label htmlFor="register-password" className="text-label block mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="register-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  required
                  minLength={8}
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
              id="register-submit"
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center text-[14px] py-2.5"
            >
              {loading ? "Creating account…" : "Create account"}
            </button>
          </div>
        </form>

        <p className="text-center text-[13px] text-[var(--color-ink-secondary)] mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-[var(--color-accent-text)] hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
