"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { getFirebaseAuth, googleProvider } from "../lib/firebase";
import { api } from "../lib/api";
import ThemeToggle from "../components/ThemeToggle";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

      localStorage.setItem("homeal_token", res.data.token);
      localStorage.setItem("homeal_refresh_token", res.data.refreshToken);

      // Route based on role
      if (res.data.user.role === "CHEF") {
        window.location.href = "https://admin.homeal.uk";
      } else if (res.data.user.role === "SUPER_ADMIN" || res.data.user.role === "ADMIN") {
        window.location.href = "https://superadmin.homeal.uk";
      } else {
        router.push("/search");
      }
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

  async function handleGoogleLogin() {
    setLoading(true);
    setError("");
    try {
      const credential = await signInWithPopup(getFirebaseAuth(), googleProvider);
      const user = credential.user;

      // Try login first
      const res = await api<{ user: { id: string; role: string }; token: string; refreshToken: string }>(
        "/auth/login",
        {
          method: "POST",
          body: JSON.stringify({ firebaseUid: user.uid }),
        }
      );

      if (res.success && res.data) {
        localStorage.setItem("homeal_token", res.data.token);
        localStorage.setItem("homeal_refresh_token", res.data.refreshToken);
        if (res.data.user.role === "CHEF") {
          window.location.href = "https://admin.homeal.uk";
        } else if (res.data.user.role === "SUPER_ADMIN" || res.data.user.role === "ADMIN") {
          window.location.href = "https://superadmin.homeal.uk";
        } else {
          router.push("/search");
        }
        return;
      }

      // If no account, auto-register as customer
      const regRes = await api<{ user: { id: string; role: string }; token: string; refreshToken: string }>(
        "/auth/register",
        {
          method: "POST",
          body: JSON.stringify({
            name: user.displayName || "Google User",
            email: user.email,
            phone: user.phoneNumber || "",
            firebaseUid: user.uid,
            role: "CUSTOMER",
          }),
        }
      );

      if (!regRes.success) {
        setError(regRes.error || "Login failed. Please try again.");
        return;
      }

      if (regRes.data?.token) {
        localStorage.setItem("homeal_token", regRes.data.token);
        localStorage.setItem("homeal_refresh_token", regRes.data.refreshToken);
      }
      router.push("/search");
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
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="px-4 sm:px-6 py-4 flex items-center gap-3">
        <a
          href="/"
          className="flex items-center text-[var(--text-soft)] hover:text-primary transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </a>
        <a href="/" className="flex items-center gap-2" aria-label="Homeal - Home">
          <div className="w-9 h-9 lg:w-11 lg:h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: "var(--logo-bg)" }}>
            <img src="/favicon-final-2.png" alt="" className="w-7 h-7 lg:w-8 lg:h-8 rounded-lg" />
          </div>
          <img src="/logo-full.png" alt="Homeal - Healthy food, from home" className="hidden lg:block h-10 w-auto shrink-0" />
        </a>
        <div className="flex-1" />
        <ThemeToggle />
      </header>

      <div className="flex-1 flex items-center justify-center px-6 py-10">
        <div className="max-w-md w-full">
          <h1 className="font-display text-3xl font-bold text-[var(--text)] text-center mb-2">
            Welcome back
          </h1>
          <p className="text-center text-[var(--text-soft)] mb-8">
            Log in to your Homeal account
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                placeholder="Email address"
                className="w-full pl-11 pr-4 py-3 bg-[var(--input)] border border-[var(--border)] rounded-xl outline-none focus:border-primary transition text-[var(--text)]"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                placeholder="Password"
                className="w-full pl-11 pr-11 py-3 bg-[var(--input)] border border-[var(--border)] rounded-xl outline-none focus:border-primary transition text-[var(--text)]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-soft)] transition"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {error && (
              <p className="text-alert text-sm bg-alert/5 border border-alert/20 rounded-xl px-4 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full font-semibold py-3.5 rounded-xl bg-primary hover:bg-primary-light text-white transition disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Log in"}
            </button>

            <div className="relative flex items-center my-2">
              <div className="flex-1 border-t border-[var(--border)]" />
              <span className="px-4 text-sm text-[var(--text-muted)]">or</span>
              <div className="flex-1 border-t border-[var(--border)]" />
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 p-3.5 bg-[var(--card)] border-2 border-[var(--border)] rounded-xl hover:border-[var(--text-muted)] hover:shadow-md transition disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span className="font-medium text-[var(--text)]">Continue with Google</span>
            </button>

            <p className="text-center text-sm text-[var(--text-muted)]">
              Don&apos;t have an account?{" "}
              <a
                href="/signup"
                className="text-primary font-medium hover:underline"
              >
                Sign up
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
