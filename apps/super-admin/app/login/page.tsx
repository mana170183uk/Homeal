"use client";

import { useState } from "react";
import { Mail, Lock, Shield, User, Clock, CheckCircle, XCircle, Eye, EyeOff } from "lucide-react";
import { signInWithEmailAndPassword, signInWithPopup, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirebaseAuth, googleProvider } from "../lib/firebase";
import { api } from "../lib/api";

type Mode = "login" | "request";

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [requestStatus, setRequestStatus] = useState<"" | "PENDING" | "APPROVED" | "REJECTED">("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const credential = await signInWithEmailAndPassword(getFirebaseAuth(), email, password);

      const res = await api<{
        user: { id: string; role: string };
        token: string;
        refreshToken: string;
      }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ firebaseUid: credential.user.uid, emailVerified: credential.user.emailVerified }),
      });

      if (!res.success || !res.data) {
        setError(res.error || "Login failed. Please try again.");
        return;
      }

      if (res.data.user.role !== "SUPER_ADMIN") {
        setError("Access denied. This portal is for Super Admins only.");
        return;
      }

      localStorage.setItem("homeal_token", res.data.token);
      localStorage.setItem("homeal_refresh_token", res.data.refreshToken);
      window.location.href = "/";
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Login failed";
      if (message.includes("wrong-password") || message.includes("invalid-credential")) {
        setError("Incorrect email or password.");
      } else if (message.includes("user-not-found")) {
        setError("No account found with this email.");
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleRequestAccess(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Create Firebase account first
      const credential = await createUserWithEmailAndPassword(getFirebaseAuth(), email, password);

      // Submit access request (does NOT create the DB user)
      const res = await api<{
        status: string;
        message: string;
      }>("/auth/request-admin-access", {
        method: "POST",
        body: JSON.stringify({
          name,
          email,
          firebaseUid: credential.user.uid,
        }),
      });

      if (!res.success) {
        setError(res.error || "Failed to submit request.");
        return;
      }

      setRequestStatus((res.data?.status as "PENDING" | "APPROVED") || "PENDING");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Request failed";
      if (message.includes("email-already-in-use")) {
        // Firebase account exists — try to sign in and check request status
        try {
          const credential = await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
          const checkRes = await api<{ status: string }>(`/auth/check-admin-request?firebaseUid=${credential.user.uid}`);
          if (checkRes.success && checkRes.data) {
            if (checkRes.data.status === "APPROVED") {
              setRequestStatus("APPROVED");
            } else if (checkRes.data.status === "REJECTED") {
              setRequestStatus("REJECTED");
            } else if (checkRes.data.status === "PENDING") {
              setRequestStatus("PENDING");
            } else {
              // No request found — submit one
              const reqRes = await api<{ status: string }>("/auth/request-admin-access", {
                method: "POST",
                body: JSON.stringify({ name, email, firebaseUid: credential.user.uid }),
              });
              setRequestStatus((reqRes.data?.status as "PENDING") || "PENDING");
            }
          }
        } catch {
          setError("This email is already registered. Try logging in instead, or check your password.");
        }
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleAuth() {
    setLoading(true);
    setError("");
    try {
      const credential = await signInWithPopup(getFirebaseAuth(), googleProvider);
      const user = credential.user;

      // Try login first
      const loginRes = await api<{
        user: { id: string; role: string };
        token: string;
        refreshToken: string;
      }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ firebaseUid: user.uid, emailVerified: user.emailVerified }),
      });

      if (loginRes.success && loginRes.data) {
        if (loginRes.data.user.role !== "SUPER_ADMIN") {
          setError("Access denied. This portal is for Super Admins only.");
          return;
        }
        localStorage.setItem("homeal_token", loginRes.data.token);
        localStorage.setItem("homeal_refresh_token", loginRes.data.refreshToken);
        window.location.href = "/";
        return;
      }

      // Not a registered user — check for existing request or submit new one
      const checkRes = await api<{ status: string }>(`/auth/check-admin-request?firebaseUid=${user.uid}`);
      if (checkRes.success && checkRes.data && checkRes.data.status !== "NONE") {
        setRequestStatus(checkRes.data.status as "PENDING" | "APPROVED" | "REJECTED");
        return;
      }

      // Submit access request
      if (mode === "request") {
        const reqRes = await api<{ status: string; message: string }>("/auth/request-admin-access", {
          method: "POST",
          body: JSON.stringify({
            name: user.displayName || "Unknown",
            email: user.email,
            firebaseUid: user.uid,
          }),
        });

        if (reqRes.success) {
          setRequestStatus("PENDING");
        } else {
          setError(reqRes.error || "Failed to submit request.");
        }
      } else {
        setError("No Super Admin account found for this Google account. Switch to 'Request Access' to apply.");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Google sign-in failed";
      if (!message.includes("popup-closed-by-user")) {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  }

  // Show status page after request submission
  if (requestStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--bg)" }}>
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style={{ background: "linear-gradient(135deg, #8B5CF6, #6D28D9)" }}>
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--text)", fontFamily: "var(--font-fredoka)" }}>
              Super Admin
            </h1>
          </div>

          <div className="rounded-2xl p-6 border text-center" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            {requestStatus === "PENDING" && (
              <>
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ background: "rgba(245,158,11,0.1)" }}>
                  <Clock className="w-8 h-8" style={{ color: "#F59E0B" }} />
                </div>
                <h2 className="text-lg font-bold mb-2" style={{ color: "var(--text)" }}>Request Submitted</h2>
                <p className="text-sm mb-4" style={{ color: "var(--text-soft)" }}>
                  Your Super Admin access request has been sent to the <strong>Homeal Admin</strong> team. You&apos;ll receive an email once it&apos;s approved.
                </p>
                <div className="rounded-xl p-3 text-xs" style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)", color: "#F59E0B" }}>
                  Status: Awaiting Approval
                </div>
              </>
            )}
            {requestStatus === "APPROVED" && (
              <>
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ background: "rgba(16,185,129,0.1)" }}>
                  <CheckCircle className="w-8 h-8" style={{ color: "#10B981" }} />
                </div>
                <h2 className="text-lg font-bold mb-2" style={{ color: "var(--text)" }}>Access Approved!</h2>
                <p className="text-sm mb-4" style={{ color: "var(--text-soft)" }}>
                  Your Super Admin access has been approved. You can now log in.
                </p>
                <button
                  onClick={() => { setRequestStatus(""); setMode("login"); setError(""); }}
                  className="w-full font-semibold py-3 rounded-xl text-white transition"
                  style={{ background: "linear-gradient(135deg, #8B5CF6, #6D28D9)" }}
                >
                  Go to Login
                </button>
              </>
            )}
            {requestStatus === "REJECTED" && (
              <>
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ background: "rgba(239,68,68,0.1)" }}>
                  <XCircle className="w-8 h-8" style={{ color: "#EF4444" }} />
                </div>
                <h2 className="text-lg font-bold mb-2" style={{ color: "var(--text)" }}>Request Rejected</h2>
                <p className="text-sm mb-4" style={{ color: "var(--text-soft)" }}>
                  Your access request was not approved. Please contact the <strong>Homeal Admin</strong> team for more information.
                </p>
              </>
            )}
          </div>

          <p className="text-center text-xs mt-6" style={{ color: "var(--text-muted)" }}>
            &copy; 2026 Homeal. Product owned &amp; designed by TotalCloudAI Limited
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--bg)" }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style={{ background: "linear-gradient(135deg, #8B5CF6, #6D28D9)" }}>
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text)", fontFamily: "var(--font-fredoka)" }}>
            Super Admin
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-soft)" }}>
            Homeal Platform Administration
          </p>
        </div>

        <div className="rounded-2xl p-6 border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          {/* Mode toggle */}
          <div className="flex rounded-xl p-1 mb-5" style={{ background: "var(--input)" }}>
            <button
              onClick={() => { setMode("login"); setError(""); }}
              className="flex-1 py-2 rounded-lg text-xs font-semibold transition"
              style={{
                background: mode === "login" ? "var(--card)" : "transparent",
                color: mode === "login" ? "var(--text)" : "var(--text-muted)",
                boxShadow: mode === "login" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
              }}
            >
              Log in
            </button>
            <button
              onClick={() => { setMode("request"); setError(""); }}
              className="flex-1 py-2 rounded-lg text-xs font-semibold transition"
              style={{
                background: mode === "request" ? "var(--card)" : "transparent",
                color: mode === "request" ? "var(--text)" : "var(--text-muted)",
                boxShadow: mode === "request" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
              }}
            >
              Request Access
            </button>
          </div>

          <form onSubmit={mode === "login" ? handleLogin : handleRequestAccess} className="space-y-4">
            {mode === "request" && (
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: "var(--text-muted)" }} />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setError(""); }}
                  placeholder="Full name"
                  className="w-full pl-11 pr-4 py-3 rounded-xl outline-none transition text-sm"
                  style={{ background: "var(--input)", border: "1px solid var(--border)", color: "var(--text)" }}
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: "var(--text-muted)" }} />
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                placeholder="Admin email address"
                className="w-full pl-11 pr-4 py-3 rounded-xl outline-none transition text-sm"
                style={{ background: "var(--input)", border: "1px solid var(--border)", color: "var(--text)" }}
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: "var(--text-muted)" }} />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                placeholder={mode === "request" ? "Password (min 6 characters)" : "Password"}
                className="w-full pl-11 pr-11 py-3 rounded-xl outline-none transition text-sm"
                style={{ background: "var(--input)", border: "1px solid var(--border)", color: "var(--text)" }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 transition"
                style={{ color: "var(--text-muted)" }}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {error && (
              <p className="text-sm px-4 py-2 rounded-xl" style={{ color: "var(--alert)", background: "rgba(255,45,85,0.05)", border: "1px solid rgba(255,45,85,0.2)" }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full font-semibold py-3 rounded-xl text-white transition disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #8B5CF6, #6D28D9)" }}
            >
              {loading
                ? (mode === "login" ? "Logging in..." : "Submitting request...")
                : (mode === "login" ? "Log in as Super Admin" : "Request Super Admin Access")
              }
            </button>
          </form>

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>or</span>
            <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
          </div>

          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl transition disabled:opacity-50"
            style={{ background: "var(--card)", border: "2px solid var(--border)" }}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span className="font-medium text-sm" style={{ color: "var(--text)" }}>Continue with Google</span>
          </button>

          {mode === "request" && (
            <p className="text-center text-[10px] mt-3 px-4" style={{ color: "var(--text-muted)" }}>
              Your request will be sent to the platform owner for approval. You&apos;ll receive an email once reviewed.
            </p>
          )}
        </div>

        <p className="text-center text-xs mt-6" style={{ color: "var(--text-muted)" }}>
          &copy; 2026 Homeal. Product owned &amp; designed by TotalCloudAI Limited
        </p>
      </div>
    </div>
  );
}
