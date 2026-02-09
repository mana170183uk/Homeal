"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ChefHat,
  User,
  Mail,
  Phone,
  Lock,
  Store,
  ArrowLeft,
  CheckCircle,
  Clock,
} from "lucide-react";
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { getFirebaseAuth, googleProvider } from "../lib/firebase";
import { api } from "../lib/api";
import ThemeToggle from "../components/ThemeToggle";

type Role = "CUSTOMER" | "CHEF";

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [role, setRole] = useState<Role | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    kitchenName: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [chefSubmitted, setChefSubmitted] = useState(false);

  useEffect(() => {
    const roleParam = searchParams.get("role");
    if (roleParam === "chef") setRole("CHEF");
    else if (roleParam === "customer") setRole("CUSTOMER");
  }, [searchParams]);

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!role) return;

    if (!form.name || !form.email || !form.phone || !form.password) {
      setError("Please fill in all required fields.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (role === "CHEF" && !form.kitchenName) {
      setError("Please enter your kitchen name.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Create Firebase user
      const credential = await createUserWithEmailAndPassword(
        getFirebaseAuth(),
        form.email,
        form.password
      );

      // Register with our API
      const res = await api<{ user: { id: string; role: string }; token: string; refreshToken: string }>(
        "/auth/register",
        {
          method: "POST",
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            phone: form.phone,
            firebaseUid: credential.user.uid,
            role,
            ...(role === "CHEF" ? { kitchenName: form.kitchenName } : {}),
          }),
        }
      );

      if (!res.success) {
        setError(res.error || "Registration failed. Please try again.");
        return;
      }

      // Store token
      if (res.data?.token) {
        localStorage.setItem("homeal_token", res.data.token);
        localStorage.setItem("homeal_refresh_token", res.data.refreshToken);
      }

      if (role === "CHEF") {
        setChefSubmitted(true);
      } else {
        router.push("/search");
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Registration failed";
      if (message.includes("email-already-in-use")) {
        setError("An account with this email already exists. Please log in.");
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignup() {
    setLoading(true);
    setError("");
    try {
      const credential = await signInWithPopup(getFirebaseAuth(), googleProvider);
      const user = credential.user;

      // Register with our API as customer (Google signup defaults to customer)
      const res = await api<{ user: { id: string; role: string }; token: string; refreshToken: string }>(
        "/auth/register",
        {
          method: "POST",
          body: JSON.stringify({
            name: user.displayName || "Google User",
            email: user.email,
            phone: user.phoneNumber || "",
            firebaseUid: user.uid,
            role: role || "CUSTOMER",
          }),
        }
      );

      if (!res.success) {
        // If already registered, try login instead
        const loginRes = await api<{ user: { id: string; role: string }; token: string; refreshToken: string }>(
          "/auth/login",
          {
            method: "POST",
            body: JSON.stringify({ firebaseUid: user.uid }),
          }
        );
        if (loginRes.success && loginRes.data) {
          localStorage.setItem("homeal_token", loginRes.data.token);
          localStorage.setItem("homeal_refresh_token", loginRes.data.refreshToken);
          if (loginRes.data.user.role === "CHEF") {
            window.location.href = "https://admin.homeal.uk";
          } else {
            router.push("/search");
          }
          return;
        }
        setError(res.error || "Registration failed. Please try again.");
        return;
      }

      if (res.data?.token) {
        localStorage.setItem("homeal_token", res.data.token);
        localStorage.setItem("homeal_refresh_token", res.data.refreshToken);
      }

      // Route based on role
      if (role === "CHEF" || res.data?.user.role === "CHEF") {
        setChefSubmitted(true);
      } else {
        router.push("/search");
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

  // Chef application submitted success
  if (chefSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-accent" />
          </div>
          <h1 className="font-display text-3xl font-bold text-[var(--text)] mb-3">
            Application Submitted!
          </h1>
          <p className="text-[var(--text-soft)] mb-6">
            Thank you for applying to join Homeal as a chef. Our team will
            review your application and get back to you soon.
          </p>
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-8">
            <div className="flex items-center gap-2 text-primary font-medium mb-1">
              <Clock className="w-4 h-4" />
              What happens next?
            </div>
            <p className="text-sm text-[var(--text-soft)]">
              Once approved, you&apos;ll receive an email with access to your
              chef dashboard at{" "}
              <a
                href="https://admin.homeal.uk"
                className="text-primary underline"
              >
                admin.homeal.uk
              </a>
              , where you can set up your kitchen, create menus, and start
              receiving orders.
            </p>
          </div>
          <a
            href="/"
            className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </a>
        </div>
      </div>
    );
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
            Create your account
          </h1>
          <p className="text-center text-[var(--text-soft)] mb-8">
            Join Homeal as a customer or chef
          </p>

          {/* Role Selection */}
          {!role && (
            <div className="space-y-4">
              <button
                onClick={() => setRole("CUSTOMER")}
                className="w-full flex items-center gap-4 p-5 bg-[var(--card)] border-2 border-[var(--border)] rounded-2xl hover:border-primary hover:shadow-md transition text-left"
              >
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                  <User className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-[var(--text)] text-lg">
                    I want to order food
                  </h3>
                  <p className="text-sm text-[var(--text-soft)]">
                    Browse local chefs and order homemade meals
                  </p>
                </div>
              </button>
              <button
                onClick={() => setRole("CHEF")}
                className="w-full flex items-center gap-4 p-5 bg-[var(--card)] border-2 border-[var(--border)] rounded-2xl hover:border-accent hover:shadow-md transition text-left"
              >
                <div className="w-14 h-14 bg-accent/10 rounded-xl flex items-center justify-center shrink-0">
                  <ChefHat className="w-7 h-7 text-accent" />
                </div>
                <div>
                  <h3 className="font-bold text-[var(--text)] text-lg">
                    I want to cook &amp; sell
                  </h3>
                  <p className="text-sm text-[var(--text-soft)]">
                    Register your kitchen and start serving customers
                  </p>
                </div>
              </button>
              <div className="relative flex items-center my-6">
                <div className="flex-1 border-t border-[var(--border)]" />
                <span className="px-4 text-sm text-[var(--text-muted)]">or</span>
                <div className="flex-1 border-t border-[var(--border)]" />
              </div>

              <button
                type="button"
                onClick={handleGoogleSignup}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 p-4 bg-[var(--card)] border-2 border-[var(--border)] rounded-2xl hover:border-[var(--text-muted)] hover:shadow-md transition disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span className="font-medium text-[var(--text)]">Continue with Google</span>
              </button>

              <p className="text-center text-sm text-[var(--text-muted)] mt-6">
                Already have an account?{" "}
                <a href="/login" className="text-primary font-medium hover:underline">
                  Log in
                </a>
              </p>
            </div>
          )}

          {/* Registration Form */}
          {role && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => setRole(null)}
                  className="text-[var(--text-muted)] hover:text-primary transition"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <span className="text-sm font-medium text-[var(--text-soft)]">
                  Signing up as{" "}
                  <span
                    className={
                      role === "CHEF" ? "text-accent" : "text-primary"
                    }
                  >
                    {role === "CHEF" ? "Chef" : "Customer"}
                  </span>
                </span>
              </div>

              {/* Name */}
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="Full name"
                  className="w-full pl-11 pr-4 py-3 bg-[var(--input)] border border-[var(--border)] rounded-xl outline-none focus:border-primary transition text-[var(--text)]"
                />
              </div>

              {/* Email */}
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  placeholder="Email address"
                  className="w-full pl-11 pr-4 py-3 bg-[var(--input)] border border-[var(--border)] rounded-xl outline-none focus:border-primary transition text-[var(--text)]"
                />
              </div>

              {/* Phone */}
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  placeholder="Phone number"
                  className="w-full pl-11 pr-4 py-3 bg-[var(--input)] border border-[var(--border)] rounded-xl outline-none focus:border-primary transition text-[var(--text)]"
                />
              </div>

              {/* Password */}
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  placeholder="Password (min 6 characters)"
                  className="w-full pl-11 pr-4 py-3 bg-[var(--input)] border border-[var(--border)] rounded-xl outline-none focus:border-primary transition text-[var(--text)]"
                />
              </div>

              {/* Kitchen Name (Chef only) */}
              {role === "CHEF" && (
                <div className="relative">
                  <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                  <input
                    type="text"
                    value={form.kitchenName}
                    onChange={(e) =>
                      updateField("kitchenName", e.target.value)
                    }
                    placeholder="Kitchen name (e.g. Priya's Home Kitchen)"
                    className="w-full pl-11 pr-4 py-3 bg-[var(--input)] border border-[var(--border)] rounded-xl outline-none focus:border-primary transition text-[var(--text)]"
                  />
                </div>
              )}

              {error && (
                <p className="text-alert text-sm bg-alert/5 border border-alert/20 rounded-xl px-4 py-2">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full font-semibold py-3.5 rounded-xl text-white transition disabled:opacity-50 ${
                  role === "CHEF"
                    ? "bg-accent hover:bg-accent-light"
                    : "bg-primary hover:bg-primary-light"
                }`}
              >
                {loading
                  ? "Creating account..."
                  : role === "CHEF"
                    ? "Submit Chef Application"
                    : "Create Account"}
              </button>

              <div className="relative flex items-center my-2">
                <div className="flex-1 border-t border-[var(--border)]" />
                <span className="px-4 text-sm text-[var(--text-muted)]">or</span>
                <div className="flex-1 border-t border-[var(--border)]" />
              </div>

              <button
                type="button"
                onClick={handleGoogleSignup}
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
                Already have an account?{" "}
                <a
                  href="/login"
                  className="text-primary font-medium hover:underline"
                >
                  Log in
                </a>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-10 h-10 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      }
    >
      <SignupContent />
    </Suspense>
  );
}
