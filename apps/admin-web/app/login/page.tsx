"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Mail, Lock, ChefHat, Eye, EyeOff } from "lucide-react";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { getFirebaseAuth, googleProvider } from "../lib/firebase";
import { api } from "../lib/api";

function LoginContent() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Handle cross-domain token login from customer-web
  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      localStorage.setItem("homeal_token", token);
      // Validate token via /auth/me
      api<{ user: { id: string; role: string }; hasChefProfile: boolean }>("/auth/me", { token })
        .then((res) => {
          if (res.success && res.data?.hasChefProfile) {
            window.location.href = "/";
          } else {
            localStorage.removeItem("homeal_token");
            setError("Unable to verify your Home Maker access. Please log in.");
          }
        })
        .catch(() => {
          localStorage.removeItem("homeal_token");
          setError("Token expired. Please log in again.");
        });
    }
  }, [searchParams]);

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
        hasChefProfile?: boolean;
        approvalStatus?: string;
      }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ firebaseUid: credential.user.uid }),
      });

      if (!res.success || !res.data) {
        setError(res.error || "Login failed. Please try again.");
        return;
      }

      if (!res.data.hasChefProfile && res.data.user.role !== "CHEF") {
        setError("This portal is for sellers only. Please register as a Home Maker at homeal.uk first.");
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
        setError("No account found. Please sign up at homeal.uk first.");
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

      const res = await api<{
        user: { id: string; role: string };
        token: string;
        refreshToken: string;
        hasChefProfile?: boolean;
        approvalStatus?: string;
      }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ firebaseUid: credential.user.uid }),
      });

      if (!res.success || !res.data) {
        setError("No account found. Please sign up as a Home Maker at homeal.uk first.");
        return;
      }

      if (!res.data.hasChefProfile && res.data.user.role !== "CHEF") {
        setError("This portal is for sellers only. Please register as a Home Maker at homeal.uk first.");
        return;
      }

      localStorage.setItem("homeal_token", res.data.token);
      localStorage.setItem("homeal_refresh_token", res.data.refreshToken);
      window.location.href = "/";
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
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style={{ background: "linear-gradient(135deg, var(--badge-from), var(--badge-to))" }}>
            <ChefHat className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text)", fontFamily: "var(--font-fredoka)" }}>
            Home Maker Portal
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-soft)" }}>
            Log in to manage your business on Homeal
          </p>
        </div>

        <div className="rounded-2xl p-6 border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: "var(--text-muted)" }} />
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                placeholder="Email address"
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
                placeholder="Password"
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
              style={{ background: "var(--primary)" }}
            >
              {loading ? "Logging in..." : "Log in as Home Maker"}
            </button>
          </form>

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>or</span>
            <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
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

          <p className="text-center text-xs mt-4" style={{ color: "var(--text-muted)" }}>
            Not a Home Maker yet?{" "}
            <a href="https://homeal.uk/signup?role=chef" className="font-medium" style={{ color: "var(--primary)" }}>
              Sign up at homeal.uk
            </a>
          </p>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: "var(--text-muted)" }}>
          &copy; 2026 Homeal. Product owned &amp; designed by TotalCloudAI Limited
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}>
        <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
