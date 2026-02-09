"use client";

import { useState } from "react";
import { Mail, Lock, Shield, User } from "lucide-react";
import { signInWithEmailAndPassword, signInWithPopup, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirebaseAuth, googleProvider } from "../lib/firebase";
import { api } from "../lib/api";

type Mode = "login" | "signup";

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
        body: JSON.stringify({ firebaseUid: credential.user.uid }),
      });

      if (!res.success || !res.data) {
        setError(res.error || "Login failed. Please try again.");
        return;
      }

      if (res.data.user.role !== "SUPER_ADMIN" && res.data.user.role !== "ADMIN") {
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

  async function handleSignup(e: React.FormEvent) {
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
      const credential = await createUserWithEmailAndPassword(getFirebaseAuth(), email, password);

      const res = await api<{
        user: { id: string; role: string };
        token: string;
        refreshToken: string;
      }>("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name,
          email,
          phone: "",
          firebaseUid: credential.user.uid,
          role: "SUPER_ADMIN",
        }),
      });

      if (!res.success || !res.data) {
        setError(res.error || "Registration failed. A Super Admin may already exist.");
        return;
      }

      localStorage.setItem("homeal_token", res.data.token);
      localStorage.setItem("homeal_refresh_token", res.data.refreshToken);
      setSuccess("Super Admin account created! Redirecting...");
      setTimeout(() => { window.location.href = "/"; }, 1500);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Registration failed";
      if (message.includes("email-already-in-use")) {
        setError("This email is already registered. Please log in instead.");
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
        body: JSON.stringify({ firebaseUid: user.uid }),
      });

      if (loginRes.success && loginRes.data) {
        if (loginRes.data.user.role !== "SUPER_ADMIN" && loginRes.data.user.role !== "ADMIN") {
          setError("Access denied. This portal is for Super Admins only.");
          return;
        }
        localStorage.setItem("homeal_token", loginRes.data.token);
        localStorage.setItem("homeal_refresh_token", loginRes.data.refreshToken);
        window.location.href = "/";
        return;
      }

      // Not found — try to register as Super Admin (first-time setup)
      const regRes = await api<{
        user: { id: string; role: string };
        token: string;
        refreshToken: string;
      }>("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name: user.displayName || "Super Admin",
          email: user.email,
          phone: user.phoneNumber || "",
          firebaseUid: user.uid,
          role: "SUPER_ADMIN",
        }),
      });

      if (!regRes.success) {
        setError(regRes.error || "Registration failed. A Super Admin may already exist.");
        return;
      }

      localStorage.setItem("homeal_token", regRes.data!.token);
      localStorage.setItem("homeal_refresh_token", regRes.data!.refreshToken);
      setSuccess("Super Admin account created! Redirecting...");
      setTimeout(() => { window.location.href = "/"; }, 1500);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Google sign-in failed";
      if (!message.includes("popup-closed-by-user")) {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
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
              onClick={() => { setMode("login"); setError(""); setSuccess(""); }}
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
              onClick={() => { setMode("signup"); setError(""); setSuccess(""); }}
              className="flex-1 py-2 rounded-lg text-xs font-semibold transition"
              style={{
                background: mode === "signup" ? "var(--card)" : "transparent",
                color: mode === "signup" ? "var(--text)" : "var(--text-muted)",
                boxShadow: mode === "signup" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
              }}
            >
              First-time Setup
            </button>
          </div>

          <form onSubmit={mode === "login" ? handleLogin : handleSignup} className="space-y-4">
            {mode === "signup" && (
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
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                placeholder={mode === "signup" ? "Password (min 6 characters)" : "Password"}
                className="w-full pl-11 pr-4 py-3 rounded-xl outline-none transition text-sm"
                style={{ background: "var(--input)", border: "1px solid var(--border)", color: "var(--text)" }}
              />
            </div>

            {error && (
              <p className="text-sm px-4 py-2 rounded-xl" style={{ color: "var(--alert)", background: "rgba(255,45,85,0.05)", border: "1px solid rgba(255,45,85,0.2)" }}>
                {error}
              </p>
            )}

            {success && (
              <p className="text-sm px-4 py-2 rounded-xl" style={{ color: "#10B981", background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.2)" }}>
                {success}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full font-semibold py-3 rounded-xl text-white transition disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #8B5CF6, #6D28D9)" }}
            >
              {loading ? (mode === "login" ? "Logging in..." : "Creating account...") : (mode === "login" ? "Log in as Super Admin" : "Create Super Admin Account")}
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

          {mode === "signup" && (
            <p className="text-center text-[10px] mt-3 px-4" style={{ color: "var(--text-muted)" }}>
              First-time setup creates the initial Super Admin account. Only one Super Admin can be created this way.
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
