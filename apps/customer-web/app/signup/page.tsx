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
  Eye,
  EyeOff,
  UtensilsCrossed,
  Flame,
  Cherry,
  Sparkles,
  Cake,
  CookingPot,
} from "lucide-react";
import { createUserWithEmailAndPassword, signInWithPopup, updateProfile, deleteUser, signOut, sendEmailVerification } from "firebase/auth";
import { getFirebaseAuth, googleProvider } from "../lib/firebase";
import { api } from "../lib/api";
import ThemeToggle from "../components/ThemeToggle";

type Role = "CUSTOMER" | "CHEF";
type SellerType = "KITCHEN" | "CAKE" | "BAKERY" | "OTHER";

const SELLER_TYPE_OPTIONS: { value: SellerType; label: string; icon: typeof UtensilsCrossed; placeholder: string }[] = [
  { value: "KITCHEN", label: "Kitchen", icon: UtensilsCrossed, placeholder: "e.g. Priya's Kitchen" },
  { value: "CAKE", label: "Cake", icon: Cake, placeholder: "e.g. Sarah's Cake Studio" },
  { value: "BAKERY", label: "Bakery", icon: CookingPot, placeholder: "e.g. Fresh Bakes" },
  { value: "OTHER", label: "Other", icon: Store, placeholder: "e.g. Food by Maria" },
];

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [role, setRole] = useState<Role | null>(null);
  const [sellerType, setSellerType] = useState<SellerType>("KITCHEN");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    businessName: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [chefSubmitted, setChefSubmitted] = useState(false);
  const [emailVerificationPending, setEmailVerificationPending] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  const [pendingGoogleChef, setPendingGoogleChef] = useState<{
    firebaseUid: string;
    name: string;
    email: string;
    phone: string;
  } | null>(null);

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
    if (role === "CHEF" && !form.businessName) {
      setError("Please enter your business name.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const credential = await createUserWithEmailAndPassword(
        getFirebaseAuth(),
        form.email,
        form.password
      );

      // Set Firebase displayName so the Header can show initials
      await updateProfile(credential.user, { displayName: form.name });

      const res = await api<{ user: { id: string; role: string; name: string }; token: string; refreshToken: string }>(
        "/auth/register",
        {
          method: "POST",
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            phone: form.phone,
            firebaseUid: credential.user.uid,
            role,
            ...(role === "CHEF" ? { kitchenName: form.businessName, sellerType, businessName: form.businessName } : {}),
          }),
        }
      );

      if (!res.success) {
        // API registration failed — delete the Firebase user so they aren't left logged in
        try {
          await deleteUser(credential.user);
        } catch {
          await signOut(getFirebaseAuth());
        }
        setError(res.error || "Registration failed. Please try again.");
        return;
      }

      if (res.data?.token) {
        localStorage.setItem("homeal_token", res.data.token);
        localStorage.setItem("homeal_refresh_token", res.data.refreshToken);
        localStorage.setItem("homeal_user_name", res.data.user?.name || form.name);
        localStorage.setItem("homeal_user_role", res.data.user?.role || role);
      }

      // Send email verification for email/password signups
      try {
        await sendEmailVerification(credential.user);
      } catch (verifyErr) {
        console.error("Failed to send verification email:", verifyErr);
      }

      if (role === "CHEF") {
        setChefSubmitted(true);
      } else {
        // Show verification screen for customers
        setVerificationEmail(form.email);
        setEmailVerificationPending(true);
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
      const googleName = user.displayName || "Google User";

      // If signing up as a chef, collect seller type + business name first
      if (role === "CHEF") {
        setPendingGoogleChef({
          firebaseUid: user.uid,
          name: googleName,
          email: user.email || "",
          phone: user.phoneNumber || "",
        });
        setLoading(false);
        return;
      }

      const res = await api<{ user: { id: string; role: string; name: string }; token: string; refreshToken: string }>(
        "/auth/register",
        {
          method: "POST",
          body: JSON.stringify({
            name: googleName,
            email: user.email,
            phone: user.phoneNumber || "",
            firebaseUid: user.uid,
            role: role || "CUSTOMER",
          }),
        }
      );

      if (!res.success) {
        const loginRes = await api<{ user: { id: string; role: string; name: string }; token: string; refreshToken: string }>(
          "/auth/login",
          {
            method: "POST",
            body: JSON.stringify({ firebaseUid: user.uid }),
          }
        );
        if (loginRes.success && loginRes.data) {
          localStorage.setItem("homeal_token", loginRes.data.token);
          localStorage.setItem("homeal_refresh_token", loginRes.data.refreshToken);
          if (loginRes.data.user.name) localStorage.setItem("homeal_user_name", loginRes.data.user.name);
          localStorage.setItem("homeal_user_role", loginRes.data.user.role);
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
        localStorage.setItem("homeal_user_name", res.data.user?.name || googleName);
        localStorage.setItem("homeal_user_role", res.data.user?.role || role || "CUSTOMER");
      }

      if (res.data?.user.role === "CHEF") {
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

  async function handleGoogleChefComplete() {
    if (!pendingGoogleChef) return;
    if (!form.businessName) {
      setError("Please enter your business name.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await api<{ user: { id: string; role: string; name: string }; token: string; refreshToken: string }>(
        "/auth/register",
        {
          method: "POST",
          body: JSON.stringify({
            name: pendingGoogleChef.name,
            email: pendingGoogleChef.email,
            phone: pendingGoogleChef.phone,
            firebaseUid: pendingGoogleChef.firebaseUid,
            role: "CHEF",
            kitchenName: form.businessName,
            sellerType,
            businessName: form.businessName,
          }),
        }
      );

      if (!res.success) {
        setError(res.error || "Registration failed. Please try again.");
        return;
      }

      if (res.data?.token) {
        localStorage.setItem("homeal_token", res.data.token);
        localStorage.setItem("homeal_refresh_token", res.data.refreshToken);
        localStorage.setItem("homeal_user_name", res.data.user?.name || pendingGoogleChef.name);
        localStorage.setItem("homeal_user_role", res.data.user?.role || "CHEF");
      }

      setChefSubmitted(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Registration failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  // Google chef pending: collect seller type + business name
  if (pendingGoogleChef) {
    const selectedOption = SELLER_TYPE_OPTIONS.find((o) => o.value === sellerType)!;
    return (
      <div className="min-h-screen flex flex-col relative overflow-hidden">
        {/* Animated gradient background orbs */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-gradient-to-br from-[var(--badge-from)] to-[var(--badge-to)] opacity-[0.07] blur-3xl animate-glow-pulse" />
          <div className="absolute top-1/3 -left-32 w-80 h-80 rounded-full bg-gradient-to-br from-[var(--badge-to)] to-[var(--accent)] opacity-[0.05] blur-3xl animate-glow-pulse" style={{ animationDelay: "1.5s" }} />
          <div className="absolute -bottom-20 right-1/4 w-72 h-72 rounded-full bg-gradient-to-br from-[var(--badge-from)] to-[var(--primary)] opacity-[0.06] blur-3xl animate-glow-pulse" style={{ animationDelay: "3s" }} />
        </div>

        {/* Header */}
        <header className="relative z-10 px-4 sm:px-6 py-4 flex items-center gap-3">
          <button onClick={() => setPendingGoogleChef(null)} className="flex items-center text-[var(--text-soft)] hover:text-primary transition">
            <ArrowLeft className="w-5 h-5" />
          </button>
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

        <div className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 py-8">
          <div className="max-w-md w-full animate-slide-up" style={{ opacity: 0, animationFillMode: "forwards" }}>
            <div className="glass-card rounded-3xl p-6 sm:p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-accent/10 flex items-center justify-center">
                  <ChefHat className="w-8 h-8 text-accent" />
                </div>
                <h1 className="font-display text-2xl font-bold text-[var(--text)] mb-2">
                  Almost there, {pendingGoogleChef.name.split(" ")[0]}!
                </h1>
                <p className="text-[var(--text-soft)] text-sm">
                  Tell us about your business to complete your seller application.
                </p>
              </div>

              {/* Seller Type Picker */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-[var(--text-soft)] mb-3">
                  What type of seller are you?
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {SELLER_TYPE_OPTIONS.map((option) => {
                    const Icon = option.icon;
                    const isSelected = sellerType === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setSellerType(option.value)}
                        className={`flex flex-col items-center gap-2 p-3.5 rounded-xl border-2 transition-all duration-200 ${
                          isSelected
                            ? "border-primary bg-primary/10 shadow-sm"
                            : "border-[var(--border)] bg-[var(--card)] hover:border-[var(--text-muted)]"
                        }`}
                      >
                        <Icon className={`w-6 h-6 ${isSelected ? "text-primary" : "text-[var(--text-muted)]"}`} />
                        <span className={`text-sm font-medium ${isSelected ? "text-primary" : "text-[var(--text-soft)]"}`}>
                          {option.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Business Name */}
              <div className="relative group mb-4">
                <Store className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)] group-focus-within:text-accent transition-colors" />
                <input
                  type="text"
                  value={form.businessName}
                  onChange={(e) => updateField("businessName", e.target.value)}
                  placeholder={selectedOption.placeholder}
                  className="premium-input w-full pl-12 pr-4 py-3.5 rounded-xl outline-none text-[var(--text)] placeholder:text-[var(--text-muted)]"
                />
              </div>

              {/* Error */}
              {error && (
                <div className="animate-fade-in-up mb-4">
                  <p className="text-alert text-sm bg-alert/5 border border-alert/20 rounded-xl px-4 py-2.5">
                    {error}
                  </p>
                </div>
              )}

              {/* Submit button */}
              <button
                type="button"
                onClick={handleGoogleChefComplete}
                disabled={loading}
                className="btn-premium w-full font-semibold py-3.5 rounded-xl text-white disabled:opacity-50 disabled:transform-none"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Submitting...
                  </span>
                ) : (
                  "Submit Chef Application"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Email verification pending screen (for customers)
  if (emailVerificationPending) {
    return (
      <div className="min-h-screen flex flex-col relative overflow-hidden">
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-gradient-to-br from-[var(--badge-from)] to-[var(--badge-to)] opacity-[0.07] blur-3xl animate-glow-pulse" />
          <div className="absolute top-1/3 -left-32 w-80 h-80 rounded-full bg-gradient-to-br from-[var(--badge-to)] to-[var(--accent)] opacity-[0.05] blur-3xl animate-glow-pulse" style={{ animationDelay: "1.5s" }} />
          <div className="absolute -bottom-20 right-1/4 w-72 h-72 rounded-full bg-gradient-to-br from-[var(--badge-from)] to-[var(--primary)] opacity-[0.06] blur-3xl animate-glow-pulse" style={{ animationDelay: "3s" }} />
        </div>
        <div className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 py-8">
          <div className="max-w-md w-full animate-slide-up" style={{ opacity: 0, animationFillMode: "forwards" }}>
            <div className="glass-card rounded-3xl p-6 sm:p-8 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-accent/10 flex items-center justify-center">
                <Mail className="w-10 h-10 text-accent" />
              </div>
              <h1 className="font-display text-3xl font-bold text-[var(--text)] mb-3">
                Verify Your Email
              </h1>
              <p className="text-[var(--text-soft)] mb-6">
                We&apos;ve sent a verification link to{" "}
                <span className="font-semibold text-[var(--text)]">{verificationEmail}</span>.
                Please check your inbox and click the link to verify your account.
              </p>
              <div className="bg-accent/5 border border-accent/20 rounded-xl p-4 mb-6 text-left">
                <div className="flex items-center gap-2 text-accent font-medium mb-1">
                  <Clock className="w-4 h-4" />
                  Didn&apos;t receive the email?
                </div>
                <p className="text-sm text-[var(--text-soft)]">
                  Check your spam folder, or click below to resend.
                </p>
              </div>
              <button
                onClick={async () => {
                  try {
                    const auth = getFirebaseAuth();
                    if (auth.currentUser) {
                      await sendEmailVerification(auth.currentUser);
                      setError("");
                      alert("Verification email resent! Check your inbox.");
                    }
                  } catch {
                    alert("Please wait a moment before requesting another email.");
                  }
                }}
                className="btn-premium w-full font-semibold py-3.5 rounded-xl text-white mb-4"
              >
                Resend Verification Email
              </button>
              <a
                href="/login"
                className="inline-flex items-center gap-2 gradient-text font-semibold hover:opacity-80 transition"
              >
                <ArrowLeft className="w-4 h-4 text-[var(--badge-from)]" />
                Go to Login
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Chef application submitted success
  if (chefSubmitted) {
    return (
      <div className="min-h-screen flex flex-col relative overflow-hidden">
        {/* Animated gradient background orbs */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-gradient-to-br from-[var(--badge-from)] to-[var(--badge-to)] opacity-[0.07] blur-3xl animate-glow-pulse" />
          <div className="absolute top-1/3 -left-32 w-80 h-80 rounded-full bg-gradient-to-br from-[var(--badge-to)] to-[var(--accent)] opacity-[0.05] blur-3xl animate-glow-pulse" style={{ animationDelay: "1.5s" }} />
          <div className="absolute -bottom-20 right-1/4 w-72 h-72 rounded-full bg-gradient-to-br from-[var(--badge-from)] to-[var(--primary)] opacity-[0.06] blur-3xl animate-glow-pulse" style={{ animationDelay: "3s" }} />
        </div>

        <div className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 py-8">
          <div className="max-w-md w-full animate-slide-up" style={{ opacity: 0, animationFillMode: "forwards" }}>
            <div className="glass-card rounded-3xl p-6 sm:p-8 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-accent/10 flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-accent" />
              </div>
              <h1 className="font-display text-3xl font-bold text-[var(--text)] mb-3">
                Application Submitted!
              </h1>
              <p className="text-[var(--text-soft)] mb-6">
                Thank you for applying to join Homeal as a seller. Our team will
                review your application and get back to you soon.
              </p>
              <div className="bg-accent/5 border border-accent/20 rounded-xl p-4 mb-4 text-left">
                <div className="flex items-center gap-2 text-accent font-medium mb-1">
                  <Clock className="w-4 h-4" />
                  What happens next?
                </div>
                <p className="text-sm text-[var(--text-soft)]">
                  Once approved, you&apos;ll receive an email with access to your
                  seller dashboard at{" "}
                  <a
                    href="https://admin.homeal.uk"
                    className="gradient-text font-semibold hover:opacity-80 transition"
                  >
                    admin.homeal.uk
                  </a>
                  , where you can set up your store, list products, and start
                  receiving orders.
                </p>
              </div>
              <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 mb-8 text-left">
                <div className="flex items-center gap-2 text-blue-500 font-medium mb-1">
                  <Mail className="w-4 h-4" />
                  Verify your email
                </div>
                <p className="text-sm text-[var(--text-soft)]">
                  We&apos;ve sent a verification link to your email. Please verify it to log in later.
                </p>
              </div>
              <a
                href="/"
                className="inline-flex items-center gap-2 gradient-text font-semibold hover:opacity-80 transition"
              >
                <ArrowLeft className="w-4 h-4 text-[var(--badge-from)]" />
                Back to home
              </a>
            </div>
          </div>
        </div>
      </div>
    );
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
          {/* Glass card */}
          <div className="glass-card rounded-3xl p-6 sm:p-8">
            {/* Welcome header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl badge-gradient flex items-center justify-center shadow-lg">
                <img src="/favicon-final-2.png" alt="" className="w-10 h-10 rounded-xl" />
              </div>
              <h1 className="font-display text-3xl font-bold text-[var(--text)] mb-2">
                {role ? "Create your account" : "Join Homeal"}
              </h1>
              <p className="text-[var(--text-soft)] text-sm">
                {role
                  ? `Signing up as ${role === "CHEF" ? "a Home Maker" : "a Customer"}`
                  : "Choose how you'd like to get started"}
              </p>
            </div>

            {/* Role Selection */}
            {!role && (
              <div className="space-y-4">
                <button
                  onClick={() => setRole("CUSTOMER")}
                  className="w-full flex items-center gap-4 p-4 sm:p-5 glass-card rounded-2xl border-2 border-[var(--border)] hover:border-[var(--badge-to)] transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 text-left"
                >
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[var(--badge-from)] to-[var(--badge-to)] flex items-center justify-center shrink-0 shadow-lg">
                    <User className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[var(--text)] text-lg">
                      I want to order
                    </h3>
                    <p className="text-sm text-[var(--text-soft)]">
                      Browse local sellers and order homemade products
                    </p>
                  </div>
                </button>
                <button
                  onClick={() => setRole("CHEF")}
                  className="w-full flex items-center gap-4 p-4 sm:p-5 glass-card rounded-2xl border-2 border-transparent hover:border-accent transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 text-left"
                >
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-accent to-[var(--accent-light)] flex items-center justify-center shrink-0 shadow-lg">
                    <ChefHat className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[var(--text)] text-lg">
                      I want to make &amp; sell
                    </h3>
                    <p className="text-sm text-[var(--text-soft)]">
                      Sell homemade food, cakes, pickles, masalas &amp; more
                    </p>
                  </div>
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
                  onClick={handleGoogleSignup}
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

                {/* Login link */}
                <p className="text-center text-sm text-[var(--text-muted)] pt-2">
                  Already have an account?{" "}
                  <a href="/login" className="font-semibold gradient-text hover:opacity-80 transition">
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
                    className="text-[var(--text-muted)] hover:text-[var(--badge-to)] transition"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm font-medium text-[var(--text-soft)]">
                    <Sparkles className="w-3.5 h-3.5 inline mr-1 text-[var(--badge-to)]" />
                    Signing up as{" "}
                    <span className={role === "CHEF" ? "text-accent" : "gradient-text font-semibold"}>
                      {role === "CHEF" ? "Home Maker" : "Customer"}
                    </span>
                  </span>
                </div>

                {/* Name */}
                <div className="relative group">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)] group-focus-within:text-[var(--badge-to)] transition-colors" />
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    placeholder="Full name"
                    className="premium-input w-full pl-12 pr-4 py-3.5 rounded-xl outline-none text-[var(--text)] placeholder:text-[var(--text-muted)]"
                  />
                </div>

                {/* Email */}
                <div className="relative group">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)] group-focus-within:text-[var(--badge-to)] transition-colors" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    placeholder="Email address"
                    className="premium-input w-full pl-12 pr-4 py-3.5 rounded-xl outline-none text-[var(--text)] placeholder:text-[var(--text-muted)]"
                  />
                </div>

                {/* Phone */}
                <div className="relative group">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)] group-focus-within:text-[var(--badge-to)] transition-colors" />
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    placeholder="Phone number"
                    className="premium-input w-full pl-12 pr-4 py-3.5 rounded-xl outline-none text-[var(--text)] placeholder:text-[var(--text-muted)]"
                  />
                </div>

                {/* Password */}
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)] group-focus-within:text-[var(--badge-to)] transition-colors" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => updateField("password", e.target.value)}
                    placeholder="Password (min 6 characters)"
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

                {/* Seller Type Picker (Chef only) */}
                {role === "CHEF" && (
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-soft)] mb-2.5">
                      What type of seller are you?
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {SELLER_TYPE_OPTIONS.map((option) => {
                        const Icon = option.icon;
                        const isSelected = sellerType === option.value;
                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => setSellerType(option.value)}
                            className={`flex flex-col items-center gap-2 p-3.5 rounded-xl border-2 transition-all duration-200 ${
                              isSelected
                                ? "border-primary bg-primary/10 shadow-sm"
                                : "border-[var(--border)] bg-[var(--card)] hover:border-[var(--text-muted)]"
                            }`}
                          >
                            <Icon className={`w-6 h-6 ${isSelected ? "text-primary" : "text-[var(--text-muted)]"}`} />
                            <span className={`text-sm font-medium ${isSelected ? "text-primary" : "text-[var(--text-soft)]"}`}>
                              {option.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Business Name (Chef only) */}
                {role === "CHEF" && (
                  <div className="relative group">
                    <Store className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)] group-focus-within:text-accent transition-colors" />
                    <input
                      type="text"
                      value={form.businessName}
                      onChange={(e) => updateField("businessName", e.target.value)}
                      placeholder={SELLER_TYPE_OPTIONS.find((o) => o.value === sellerType)?.placeholder || "Business name"}
                      className="premium-input w-full pl-12 pr-4 py-3.5 rounded-xl outline-none text-[var(--text)] placeholder:text-[var(--text-muted)]"
                    />
                  </div>
                )}

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
                      Creating account...
                    </span>
                  ) : role === "CHEF"
                    ? "Submit Home Maker Application"
                    : "Create Account"}
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
                  onClick={handleGoogleSignup}
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

                {/* Login link — context-aware text per role */}
                <p className="text-center text-sm text-[var(--text-muted)] pt-2">
                  {role === "CHEF"
                    ? "Already have a Home Maker account? "
                    : "Already have a customer account? "}
                  <a href="/login" className="font-semibold gradient-text hover:opacity-80 transition">
                    Log in
                  </a>
                </p>
              </form>
            )}
          </div>
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
