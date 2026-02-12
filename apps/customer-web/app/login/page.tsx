"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, ArrowLeft, Eye, EyeOff, UtensilsCrossed, Flame, Cherry } from "lucide-react";
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
        user: { id: string; role: string; name: string };
        token: string;
        refreshToken: string;
        hasChefProfile?: boolean;
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
      if (res.data.user.name) localStorage.setItem("homeal_user_name", res.data.user.name);
      localStorage.setItem("homeal_user_role", res.data.user.role);
      if (res.data.hasChefProfile) localStorage.setItem("homeal_has_chef_profile", "true");

      // SUPER_ADMIN/ADMIN still redirect to their portal
      if (res.data.user.role === "SUPER_ADMIN" || res.data.user.role === "ADMIN") {
        window.location.href = "https://superadmin.homeal.uk";
      } else {
        // All other users (including CHEFs) land on customer-web
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

      const res = await api<{ user: { id: string; role: string; name: string }; token: string; refreshToken: string; hasChefProfile?: boolean }>(
        "/auth/login",
        {
          method: "POST",
          body: JSON.stringify({ firebaseUid: user.uid }),
        }
      );

      if (res.success && res.data) {
        localStorage.setItem("homeal_token", res.data.token);
        localStorage.setItem("homeal_refresh_token", res.data.refreshToken);
        if (res.data.user.name) localStorage.setItem("homeal_user_name", res.data.user.name);
        localStorage.setItem("homeal_user_role", res.data.user.role);
        if (res.data.hasChefProfile) localStorage.setItem("homeal_has_chef_profile", "true");
        if (res.data.user.role === "SUPER_ADMIN" || res.data.user.role === "ADMIN") {
          window.location.href = "https://superadmin.homeal.uk";
        } else {
          router.push("/search");
        }
        return;
      }

      const googleName = user.displayName || "Google User";
      const regRes = await api<{ user: { id: string; role: string; name: string }; token: string; refreshToken: string }>(
        "/auth/register",
        {
          method: "POST",
          body: JSON.stringify({
            name: googleName,
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
        localStorage.setItem("homeal_user_name", regRes.data.user?.name || googleName);
        localStorage.setItem("homeal_user_role", regRes.data.user?.role || "CUSTOMER");
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
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Animated gradient background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-gradient-to-br from-[var(--badge-from)] to-[var(--badge-to)] opacity-[0.07] blur-3xl animate-glow-pulse" />
        <div className="absolute top-1/3 -left-32 w-80 h-80 rounded-full bg-gradient-to-br from-[var(--badge-to)] to-[var(--accent)] opacity-[0.05] blur-3xl animate-glow-pulse" style={{ animationDelay: "1.5s" }} />
        <div className="absolute -bottom-20 right-1/4 w-72 h-72 rounded-full bg-gradient-to-br from-[var(--badge-from)] to-[var(--primary)] opacity-[0.06] blur-3xl animate-glow-pulse" style={{ animationDelay: "3s" }} />
      </div>

      {/* Floating food icons (dark mode only, subtle) */}
      <div className="fixed inset-0 pointer-events-none hidden dark:block">
        <UtensilsCrossed className="absolute top-[15%] right-[12%] w-6 h-6 text-[var(--badge-to)] opacity-[0.08] animate-float-slow" />
        <Flame className="absolute top-[60%] left-[8%] w-5 h-5 text-[var(--badge-from)] opacity-[0.06] animate-float-slow" style={{ animationDelay: "2s" }} />
        <Cherry className="absolute bottom-[20%] right-[15%] w-5 h-5 text-[var(--accent)] opacity-[0.06] animate-float-slow" style={{ animationDelay: "4s" }} />
      </div>

      {/* Header */}
      <header className="relative z-10 px-4 sm:px-6 py-4 flex items-center gap-3">
        <a href="/" className="flex items-center text-[var(--text-soft)] hover:text-primary transition">
          <ArrowLeft className="w-5 h-5" />
        </a>
        <a href="/" className="flex items-center gap-2" aria-label="Homeal - Home">
          <div className="w-9 h-9 lg:w-11 lg:h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: "var(--logo-bg)" }}>
            <img src="/favicon-final-2.png" alt="" className="w-7 h-7 lg:w-8 lg:h-8 rounded-lg" />
          </div>
          <img src="/logo-full.png" alt="Homeal - Homemade products, from home" className="hidden lg:block h-10 w-auto shrink-0" />
        </a>
        <div className="flex-1" />
        <ThemeToggle />
      </header>

      {/* Main content */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 py-8">
        <div className="max-w-md w-full animate-slide-up" style={{ opacity: 0, animationFillMode: "forwards" }}>
          {/* Glass card */}
          <div className="glass-card rounded-3xl p-6 sm:p-8">
            {/* Welcome header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl badge-gradient flex items-center justify-center shadow-lg">
                <img src="/favicon-final-2.png" alt="" className="w-10 h-10 rounded-xl" />
              </div>
              <h1 className="font-display text-3xl font-bold text-[var(--text)] mb-2">
                Customer Portal
              </h1>
              <p className="text-[var(--text-soft)] text-sm">
                Log in to order homemade goodness from local sellers
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email */}
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)] group-focus-within:text-[var(--badge-to)] transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  placeholder="Email address"
                  className="premium-input w-full pl-12 pr-4 py-3.5 rounded-xl outline-none text-[var(--text)] placeholder:text-[var(--text-muted)]"
                />
              </div>

              {/* Password */}
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)] group-focus-within:text-[var(--badge-to)] transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  placeholder="Password"
                  className="premium-input w-full pl-12 pr-12 py-3.5 rounded-xl outline-none text-[var(--text)] placeholder:text-[var(--text-muted)]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-soft)] transition"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Error */}
              {error && (
                <div className="animate-fade-in-up">
                  <p className="text-alert text-sm bg-alert/5 border border-alert/20 rounded-xl px-4 py-2.5">
                    {error}
                  </p>
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="btn-premium w-full font-semibold py-3.5 rounded-xl text-white disabled:opacity-50 disabled:transform-none"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : "Log in as Customer"}
              </button>

              {/* Divider */}
              <div className="relative flex items-center my-3">
                <div className="flex-1 border-t border-[var(--border)]" />
                <span className="px-4 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">or</span>
                <div className="flex-1 border-t border-[var(--border)]" />
              </div>

              {/* Google button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 p-3.5 rounded-xl border-2 border-[var(--border)] bg-[var(--card)] hover:border-[var(--text-muted)] transition-all duration-200 disabled:opacity-50 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span className="font-medium text-[var(--text)]">Continue with Google</span>
              </button>

              {/* Sign up link */}
              <p className="text-center text-sm text-[var(--text-muted)] pt-2">
                Don&apos;t have an account?{" "}
                <a href="/signup?role=customer" className="font-semibold gradient-text hover:opacity-80 transition">
                  Sign up as Customer
                </a>
              </p>
              <p className="text-center text-xs text-[var(--text-muted)] pt-1">
                Are you a Home Maker?{" "}
                <a href="/signup?role=chef" className="font-medium text-accent hover:opacity-80 transition">
                  Sign up to sell
                </a>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
