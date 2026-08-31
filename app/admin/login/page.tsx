"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import AurelinLogo from "@/components/storefront/AurelinLogo";
import { toast } from "sonner";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Invalid admin credentials");
        setLoading(false);
        return;
      }

      toast.success("Welcome to Admin Dashboard");
      router.push("/admin/dashboard");
      router.refresh();
    } catch {
      setError("Failed to sign in. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ backgroundColor: "#F8F6F0" }}
    >
      <div className="mb-12">
        <AurelinLogo className="h-16 mx-auto" />
      </div>

      <div
        className="w-full max-w-sm p-8"
        style={{ backgroundColor: "#FFFFFF", border: "1px solid #D8C8AF40" }}
      >
        <h1
          className="mb-1 text-center"
          style={{
            fontFamily: "var(--font-cormorant)",
            fontSize: "1.5rem",
            fontWeight: 400,
            color: "#172744",
            letterSpacing: "0.04em",
          }}
        >
          Admin Access
        </h1>
        <p
          className="mb-8 text-center opacity-40"
          style={{ fontFamily: "var(--font-inter)", fontSize: "0.8125rem" }}
        >
          Sign in to manage your store
        </p>

        {error && (
          <div
            className="mb-5 px-4 py-3 text-sm"
            style={{
              backgroundColor: "#17274415",
              color: "#172744",
              fontFamily: "var(--font-inter)",
              fontSize: "0.8125rem",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="block mb-1.5"
              style={{
                fontFamily: "var(--font-inter)",
                fontSize: "0.625rem",
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "#172744",
                opacity: 0.6,
              }}
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border outline-none bg-transparent transition-colors"
              style={{
                borderColor: "#D8C8AF",
                fontFamily: "var(--font-inter)",
                fontSize: "0.9375rem",
                color: "#242424",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#172744")}
              onBlur={(e) => (e.target.style.borderColor = "#D8C8AF")}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block mb-1.5"
              style={{
                fontFamily: "var(--font-inter)",
                fontSize: "0.625rem",
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "#172744",
                opacity: 0.6,
              }}
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 pr-12 border outline-none bg-transparent transition-colors"
                style={{
                  borderColor: "#D8C8AF",
                  fontFamily: "var(--font-inter)",
                  fontSize: "0.9375rem",
                  color: "#242424",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#172744")}
                onBlur={(e) => (e.target.style.borderColor = "#D8C8AF")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-charcoal opacity-40 hover:opacity-70 transition-opacity"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 mt-2 transition-all duration-200 hover:opacity-90 disabled:opacity-50"
            style={{
              backgroundColor: "#172744",
              color: "#F8F6F0",
              fontFamily: "var(--font-inter)",
              fontSize: "0.6875rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              fontWeight: 500,
            }}
          >
            {loading ? "SIGNING IN..." : "SIGN IN"}
          </button>
        </form>
      </div>

      <p
        className="mt-6 opacity-30"
        style={{ fontFamily: "var(--font-inter)", fontSize: "0.6875rem" }}
      >
        © {new Date().getFullYear()} AURELIN & CO.
      </p>
    </div>
  );
}
