"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle, XCircle, Loader2, ArrowRight, Mail, KeyRound } from "lucide-react";
import { applyActionCode, verifyPasswordResetCode, confirmPasswordReset } from "firebase/auth";
import { getFirebaseAuth } from "../../lib/firebase";

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

  // ----- Loading -----
  if (state === "loading") {
    return (
      <div className="rounded-2xl p-8 border text-center" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ background: "rgba(var(--primary-rgb), 0.1)" }}>
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--primary)" }} />
        </div>
        <h1 className="text-xl font-bold mb-2" style={{ color: "var(--text)", fontFamily: "var(--font-fredoka)" }}>
          Verifying...
        </h1>
        <p className="text-sm" style={{ color: "var(--text-soft)" }}>
          Please wait while we verify your email.
        </p>
      </div>
    );
  }

  // ----- Email verified success -----
  if (state === "success") {
    return (
      <div className="rounded-2xl p-8 border text-center" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ background: "rgba(0, 179, 65, 0.1)" }}>
          <CheckCircle className="w-8 h-8" style={{ color: "var(--accent)" }} />
        </div>
        <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--text)", fontFamily: "var(--font-fredoka)" }}>
          Email Verified!
        </h1>
        <p className="mb-1" style={{ color: "var(--text-soft)" }}>
          Welcome to{" "}
          <span style={{ fontFamily: "var(--font-fredoka)", fontWeight: 700 }}>
            <span style={{ color: "#2D8B3D" }}>Ho</span>
            <span style={{ color: "#FF8534" }}>me</span>
            <span style={{ color: "#2D8B3D" }}>al</span>
          </span>
        </p>
        <p className="text-sm mb-8" style={{ color: "var(--text-soft)" }}>
          Your email has been successfully verified. You can now log in to the Home Maker Portal.
        </p>
        <a
          href="/login"
          className="inline-flex items-center justify-center gap-2 font-semibold py-3 px-8 rounded-xl text-white transition"
          style={{ background: "var(--primary)" }}
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
        <div className="rounded-2xl p-8 border text-center" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ background: "rgba(0, 179, 65, 0.1)" }}>
            <CheckCircle className="w-8 h-8" style={{ color: "var(--accent)" }} />
          </div>
          <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--text)", fontFamily: "var(--font-fredoka)" }}>
            Password Reset!
          </h1>
          <p className="text-sm mb-8" style={{ color: "var(--text-soft)" }}>
            Your password has been updated. You can now log in with your new password.
          </p>
          <a
            href="/login"
            className="inline-flex items-center justify-center gap-2 font-semibold py-3 px-8 rounded-xl text-white transition"
            style={{ background: "var(--primary)" }}
          >
            Go to Login
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      );
    }

    return (
      <div className="rounded-2xl p-6 border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl flex items-center justify-center" style={{ background: "rgba(var(--primary-rgb), 0.1)" }}>
            <KeyRound className="w-7 h-7" style={{ color: "var(--primary)" }} />
          </div>
          <h1 className="text-xl font-bold mb-1" style={{ color: "var(--text)", fontFamily: "var(--font-fredoka)" }}>
            Reset Your Password
          </h1>
          <p className="text-sm" style={{ color: "var(--text-soft)" }}>
            Enter a new password for <span style={{ fontWeight: 600, color: "var(--text)" }}>{resetEmail}</span>
          </p>
        </div>
        <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
          <div className="relative">
            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: "var(--text-muted)" }} />
            <input
              type="password"
              value={newPassword}
              onChange={(e) => { setNewPassword(e.target.value); setResetError(""); }}
              placeholder="New password (min 6 characters)"
              className="w-full pl-11 pr-4 py-3 rounded-xl outline-none transition text-sm"
              style={{ background: "var(--input)", border: "1px solid var(--border)", color: "var(--text)" }}
            />
          </div>
          <div className="relative">
            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: "var(--text-muted)" }} />
            <input
              type="password"
              value={confirmPwd}
              onChange={(e) => { setConfirmPwd(e.target.value); setResetError(""); }}
              placeholder="Confirm new password"
              className="w-full pl-11 pr-4 py-3 rounded-xl outline-none transition text-sm"
              style={{ background: "var(--input)", border: "1px solid var(--border)", color: "var(--text)" }}
            />
          </div>
          {resetError && (
            <p className="text-sm px-4 py-2 rounded-xl" style={{ color: "var(--alert)", background: "rgba(255,45,85,0.05)", border: "1px solid rgba(255,45,85,0.2)" }}>
              {resetError}
            </p>
          )}
          <button
            type="submit"
            disabled={resetLoading}
            className="w-full font-semibold py-3 rounded-xl text-white transition disabled:opacity-50"
            style={{ background: "var(--primary)" }}
          >
            {resetLoading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    );
  }

  // ----- Error state -----
  return (
    <div className="rounded-2xl p-8 border text-center" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ background: "rgba(255,45,85,0.1)" }}>
        <XCircle className="w-8 h-8" style={{ color: "var(--alert)" }} />
      </div>
      <h1 className="text-xl font-bold mb-2" style={{ color: "var(--text)", fontFamily: "var(--font-fredoka)" }}>
        Verification Failed
      </h1>
      <p className="text-sm mb-8" style={{ color: "var(--text-soft)" }}>
        {errorMessage}
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <a
          href="/login"
          className="inline-flex items-center justify-center gap-2 font-semibold py-3 px-6 rounded-xl text-white transition"
          style={{ background: "var(--primary)" }}
        >
          <Mail className="w-4 h-4" />
          Go to Login
        </a>
        <a
          href="https://homeal.uk/signup?role=chef"
          className="inline-flex items-center justify-center gap-2 font-semibold py-3 px-6 rounded-xl transition"
          style={{ border: "2px solid var(--border)", color: "var(--text)" }}
        >
          Sign Up
        </a>
      </div>
    </div>
  );
}

export default function AuthActionPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--bg)" }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <span className="text-2xl font-bold" style={{ fontFamily: "var(--font-fredoka)" }}>
            <span style={{ color: "#2D8B3D" }}>Ho</span>
            <span style={{ color: "#FF8534" }}>me</span>
            <span style={{ color: "#2D8B3D" }}>al</span>
          </span>
        </div>
        <Suspense
          fallback={
            <div className="rounded-2xl p-8 border text-center" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
              <div className="w-8 h-8 mx-auto border-2 rounded-full animate-spin" style={{ borderColor: "var(--border)", borderTopColor: "var(--primary)" }} />
            </div>
          }
        >
          <ActionContent />
        </Suspense>
        <p className="text-center text-xs mt-6" style={{ color: "var(--text-muted)" }}>
          &copy; 2026 Homeal. Product owned &amp; designed by TotalCloudAI Limited
        </p>
      </div>
    </div>
  );
}
