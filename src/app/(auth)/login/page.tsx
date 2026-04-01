"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2, Mail, Lock, CheckSquare, Eye, EyeOff } from "lucide-react";
import { authApi } from "@/lib/authApi";
import { setTokens } from "@/lib/auth";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const [showPw, setShowPw] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      const res = await authApi.login(data);
      setTokens(res.data.accessToken, res.data.refreshToken);
      toast.success("Welcome back! 🎉");
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Login failed. Please try again.");
    }
  };

  return (
    <div className="glass-card animate-fadeIn" style={{ padding: "40px 36px" }}>
      {/* Logo */}
      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "56px",
            height: "56px",
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            borderRadius: "16px",
            marginBottom: "16px",
            boxShadow: "0 8px 24px rgba(99,102,241,0.3)",
          }}
        >
          <CheckSquare size={28} color="#fff" />
        </div>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.2 }}>
          Welcome back
        </h1>
        <p style={{ color: "var(--text-secondary)", marginTop: "6px", fontSize: "0.9rem" }}>
          Sign in to your TaskFlow account
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* Email */}
        <div style={{ marginBottom: "18px" }}>
          <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 500, color: "var(--text-secondary)", marginBottom: "6px" }}>
            Email address
          </label>
          <div style={{ position: "relative" }}>
            <Mail
              size={16}
              style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}
            />
            <input
              {...register("email")}
              type="email"
              placeholder="you@example.com"
              className="input-base"
              style={{ paddingLeft: "40px" }}
              autoComplete="email"
            />
          </div>
          {errors.email && <p className="error-text">{errors.email.message}</p>}
        </div>

        {/* Password */}
        <div style={{ marginBottom: "24px" }}>
          <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 500, color: "var(--text-secondary)", marginBottom: "6px" }}>
            Password
          </label>
          <div style={{ position: "relative" }}>
            <Lock
              size={16}
              style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}
            />
            <input
              {...register("password")}
              type={showPw ? "text" : "password"}
              placeholder="••••••••"
              className="input-base"
              style={{ paddingLeft: "40px", paddingRight: "44px" }}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              style={{
                position: "absolute",
                right: "14px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--text-muted)",
                display: "flex",
              }}
            >
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && <p className="error-text">{errors.password.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-primary"
          style={{ width: "100%", padding: "12px", fontSize: "0.95rem" }}
        >
          {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : null}
          {isSubmitting ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <div className="divider" />

      <p style={{ textAlign: "center", fontSize: "0.875rem", color: "var(--text-secondary)" }}>
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          style={{ color: "var(--accent)", fontWeight: 500, textDecoration: "none" }}
        >
          Create one →
        </Link>
      </p>
    </div>
  );
}
