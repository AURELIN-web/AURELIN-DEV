"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import AurelinLogo from "@/components/storefront/AurelinLogo";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/account";

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone: phone || null,
        },
      },
    });

    if (error) {
      toast.error(error.message || "Failed to create account");
      setLoading(false);
      return;
    }

    if (data.user) {
      // Upsert profile
      await supabase.from("profiles").upsert({
        id: data.user.id,
        email: email,
        full_name: fullName,
        phone: phone || null,
        role: "customer",
      });
    }

    toast.success("Account created successfully");
    router.push(next);
    router.refresh();
  };

  const inputStyle = {
    fontFamily: "var(--font-inter)",
    fontSize: "0.9375rem",
    color: "#242424",
    borderColor: "#D8C8AF",
  };

  const labelStyle = {
    fontFamily: "var(--font-inter)",
    fontSize: "0.5625rem",
    letterSpacing: "0.16em",
    textTransform: "uppercase" as const,
    color: "#172744",
    opacity: 0.6,
  };

  return (
    <div className="container-luxury py-16 md:py-24 flex justify-center">
      <div className="w-full max-w-md p-8 md:p-10 border border-beige/40 bg-ivory">
        <div className="text-center mb-8">
          <AurelinLogo className="h-12 mx-auto mb-6" />
          <h1
            style={{
              fontFamily: "var(--font-cormorant)",
              fontSize: "1.75rem",
              fontWeight: 400,
              color: "#172744",
            }}
          >
            Create Account
          </h1>
          <p
            className="mt-1 opacity-60"
            style={{ fontFamily: "var(--font-inter)", fontSize: "0.8125rem" }}
          >
            Join the AURELIN community for tailored services
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="block mb-1.5" style={labelStyle}>
              Full Name *
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full px-4 py-3 border outline-none bg-transparent"
              style={inputStyle}
            />
          </div>

          <div>
            <label className="block mb-1.5" style={labelStyle}>
              Email Address *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border outline-none bg-transparent"
              style={inputStyle}
            />
          </div>

          <div>
            <label className="block mb-1.5" style={labelStyle}>
              Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 border outline-none bg-transparent"
              style={inputStyle}
            />
          </div>

          <div>
            <label className="block mb-1.5" style={labelStyle}>
              Password *
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 pr-11 border outline-none bg-transparent"
                style={inputStyle}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-80"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 transition-opacity hover:opacity-90 disabled:opacity-50"
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
            {loading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}
          </button>
        </form>

        <div className="mt-8 text-center border-t pt-6" style={{ borderColor: "#D8C8AF30" }}>
          <p
            className="opacity-70"
            style={{ fontFamily: "var(--font-inter)", fontSize: "0.8125rem" }}
          >
            Already have an account?{" "}
            <Link
              href={`/login?next=${encodeURIComponent(next)}`}
              className="text-navy font-medium underline underline-offset-4"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
