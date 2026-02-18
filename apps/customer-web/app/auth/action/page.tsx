"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle, XCircle, Loader2, ArrowRight, Mail, KeyRound } from "lucide-react";
import { applyActionCode, verifyPasswordResetCode, confirmPasswordReset } from "firebase/auth";
import { getFirebaseAuth } from "../../lib/firebase";
import ThemeToggle from "../../components/ThemeToggle";

type ActionState = "loading" | "success" | "error" | "reset-password";

function ActionContent() {
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");
  const oobCode = searchParams.get("oobCode");

  const [state, setState] = useState<ActionState>("loading");
  const [errorMessage, setErrorMessage] = useState("");

  // Password reset state
  const [resetEmail, setResetEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetDone, setResetDone] = useState(false);
  const [resetError, setResetError] = useState("");

  useEffect(() => {
    if (!oobCode) {
      setState("error");
      setErrorMessage("Invalid or missing verification code.");
      return;
    }

    if (mode === "verifyEmail") {
      handleVerifyEmail(oobCode);
    } else if (mode === "resetPassword") {
      handleResetPasswordVerify(oobCode);
    } else {
      setState("error");
      setErrorMessage("Unsupported action type.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, oobCode]);

  async function handleVerifyEmail(code: string) {
    try {
      const auth = getFirebaseAuth();
      await applyActionCode(auth, code);
      setState("success");
    } catch (err: unknown) {
      setState("error");
      const msg = err instanceof Error ? err.message : "Verification failed";
      if (msg.includes("invalid-action-code") || msg.includes("expired-action-code")) {
        setErrorMessage("This verification link has expired or already been used. Please request a new one from the login page.");
      } else {
        setErrorMessage("Something went wrong verifying your email. Please try again.");
      }
    }
  }

  async function handleResetPasswordVerify(code: string) {
    try {
      const auth = getFirebaseAuth();
      const email = await verifyPasswordResetCode(auth, code);
      setResetEmail(email);
      setState("reset-password");
    } catch (err: unknown) {
      setState("error");
      const msg = err instanceof Error ? err.message : "Reset failed";
      if (msg.includes("invalid-action-code") || msg.includes("expired-action-code")) {
        setErrorMessage("This password reset link has expired or already been used. Please request a new one.");
      } else {
        setErrorMessage("Something went wrong. Please try again.");
      }
    }
  }

  async function handleResetPasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!oobCode) return;
    if (newPassword.length < 6) {
      setResetError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPwd) {
      setResetError("Passwords do not match.");
      return;
    }
    setResetLoading(true);
    setResetError("");
    try {
      const auth = getFirebaseAuth();
      await confirmPasswordReset(auth, oobCode, newPassword);
      setResetDone(true);
    } catch {
      setResetError("Failed to reset password. The link may have expired.");
    } finally {
      setResetLoading(false);
    }
  }

  // ----- Loading state -----
  if (state === "loading") {
    return (
      <div className="glass-card rounded-3xl p-6 sm:p-8 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </div>
        <h1 className="font-display text-2xl font-bold text-[var(--text)] mb-2">
          Verifying...
        </h1>
        <p className="text-[var(--text-soft)] text-sm">
          Please wait while we verify your email.
        </p>
      </div>
    );
  }

  // ----- Email verified success -----
  if (state === "success") {
    return (
      <div className="glass-card rounded-3xl p-6 sm:p-8 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-accent/10 flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-accent" />
        </div>
        <h1 className="font-display text-3xl font-bold text-[var(--text)] mb-3">
          Email Verified!
        </h1>
        <p className="text-[var(--text-soft)] mb-2">
          Welcome to <span className="font-[family-name:var(--font-fredoka)] font-bold">
            <span className="text-[#278848] dark:text-[#2EA855]">Ho</span>
            <span className="text-[#FF8800]">me</span>
            <span className="text-[#278848] dark:text-[#2EA855]">al</span>
          </span>
        </p>
        <p className="text-[var(--text-soft)] text-sm mb-8">
          Your email has been successfully verified. You can now log in and start exploring homemade goodness from local sellers near you.
        </p>
        <a
          href="/login"
          className="btn-premium inline-flex items-center justify-center gap-2 font-semibold py-3.5 px-8 rounded-xl text-white"
        >
          Go to Login
          <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    );
  }

  // ----- Password reset form -----
  if (state === "reset-password") {
    if (resetDone) {
      return (
        <div className="glass-card rounded-3xl p-6 sm:p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-accent/10 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-accent" />
          </div>
          <h1 className="font-display text-3xl font-bold text-[var(--text)] mb-3">
            Password Reset!
          </h1>
          <p className="text-[var(--text-soft)] text-sm mb-8">
            Your password has been updated. You can now log in with your new password.
          </p>
          <a
            href="/login"
            className="btn-premium inline-flex items-center justify-center gap-2 font-semibold py-3.5 px-8 rounded-xl text-white"
          >
            Go to Login
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      );
    }

    return (
      <div className="glass-card rounded-3xl p-6 sm:p-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
            <KeyRound className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-display text-2xl font-bold text-[var(--text)] mb-2">
            Reset Your Password
          </h1>
          <p className="text-[var(--text-soft)] text-sm">
            Enter a new password for <span className="font-semibold text-[var(--text)]">{resetEmail}</span>
          </p>
        </div>
        <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
          <div className="relative group">
            <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)] group-focus-within:text-primary transition-colors" />
            <input
              type="password"
              value={newPassword}
              onChange={(e) => { setNewPassword(e.target.value); setResetError(""); }}
              placeholder="New password (min 6 characters)"
              className="premium-input w-full pl-12 pr-4 py-3.5 rounded-xl outline-none text-[var(--text)] placeholder:text-[var(--text-muted)]"
            />
          </div>
          <div className="relative group">
            <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)] group-focus-within:text-primary transition-colors" />
            <input
              type="password"
              value={confirmPwd}
              onChange={(e) => { setConfirmPwd(e.target.value); setResetError(""); }}
              placeholder="Confirm new password"
              className="premium-input w-full pl-12 pr-4 py-3.5 rounded-xl outline-none text-[var(--text)] placeholder:text-[var(--text-muted)]"
            />
          </div>
          {resetError && (
            <p className="text-alert text-sm bg-alert/5 border border-alert/20 rounded-xl px-4 py-2.5">
              {resetError}
            </p>
          )}
          <button
            type="submit"
            disabled={resetLoading}
            className="btn-premium w-full font-semibold py-3.5 rounded-xl text-white disabled:opacity-50"
          >
            {resetLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Resetting...
              </span>
            ) : "Reset Password"}
          </button>
        </form>
      </div>
    );
  }

  // ----- Error state -----
  return (
    <div className="glass-card rounded-3xl p-6 sm:p-8 text-center">
      <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-alert/10 flex items-center justify-center">
        <XCircle className="w-10 h-10 text-alert" />
      </div>
      <h1 className="font-display text-2xl font-bold text-[var(--text)] mb-3">
        Verification Failed
      </h1>
      <p className="text-[var(--text-soft)] text-sm mb-8">
        {errorMessage}
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <a
          href="/login"
          className="btn-premium inline-flex items-center justify-center gap-2 font-semibold py-3 px-6 rounded-xl text-white"
        >
          <Mail className="w-4 h-4" />
          Go to Login
        </a>
        <a
          href="/signup"
          className="inline-flex items-center justify-center gap-2 font-semibold py-3 px-6 rounded-xl border-2 border-[var(--border)] text-[var(--text)] hover:border-primary transition"
        >
          Sign Up
        </a>
      </div>
    </div>
  );
}

export default function AuthActionPage() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-gradient-to-br from-[var(--badge-from)] to-[var(--badge-to)] opacity-[0.07] blur-3xl animate-glow-pulse" />
        <div className="absolute top-1/3 -left-32 w-80 h-80 rounded-full bg-gradient-to-br from-[var(--badge-to)] to-[var(--accent)] opacity-[0.05] blur-3xl animate-glow-pulse" style={{ animationDelay: "1.5s" }} />
        <div className="absolute -bottom-20 right-1/4 w-72 h-72 rounded-full bg-gradient-to-br from-[var(--badge-from)] to-[var(--primary)] opacity-[0.06] blur-3xl animate-glow-pulse" style={{ animationDelay: "3s" }} />
      </div>

      {/* Header */}
      <header className="relative z-10 px-4 sm:px-6 py-4 flex items-center gap-3">
        <a href="/" className="flex items-center gap-1.5" aria-label="Homeal - Home">
          <img src="/chef-icon.png" alt="" className="h-10 lg:h-12 w-auto shrink-0" />
          <div className="flex flex-col leading-none">
            <span className="text-xl lg:text-2xl font-bold tracking-tight font-[family-name:var(--font-fredoka)]">
              <span className="text-[#278848] dark:text-[#2EA855]">Ho</span>
              <span className="text-[#FF8800]">me</span>
              <span className="text-[#278848] dark:text-[#2EA855]">al</span>
            </span>
            <span className="text-[10px] lg:text-[11px] text-[var(--text-soft)] tracking-wide whitespace-nowrap">Where Every Meal Feels Like Home</span>
          </div>
        </a>
        <div className="flex-1" />
        <ThemeToggle />
      </header>

      {/* Main content */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 py-8">
        <div className="max-w-md w-full animate-slide-up" style={{ opacity: 0, animationFillMode: "forwards" }}>
          <Suspense
            fallback={
              <div className="glass-card rounded-3xl p-6 sm:p-8 text-center">
                <div className="w-10 h-10 mx-auto border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
            }
          >
            <ActionContent />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
