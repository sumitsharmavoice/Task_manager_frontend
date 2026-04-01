"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { CheckSquare, LogOut, LayoutDashboard } from "lucide-react";
import { isAuthenticated, clearTokens } from "@/lib/auth";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
    }
  }, [router]);

  const handleLogout = () => {
    clearTokens();
    toast.success("Signed out successfully");
    router.push("/login");
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Navbar */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 40,
          background: "rgba(15,15,19,0.85)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--border)",
          padding: "0 24px",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            height: "64px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Brand */}
          <Link
            href="/dashboard"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 12px rgba(99,102,241,0.3)",
              }}
            >
              <CheckSquare size={20} color="#fff" />
            </div>
            <span
              style={{ fontWeight: 700, fontSize: "1.1rem", letterSpacing: "-0.02em" }}
              className="gradient-text"
            >
              TaskFlow
            </span>
          </Link>

          {/* Nav links */}
          <nav style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Link
              href="/dashboard"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 14px",
                borderRadius: "8px",
                textDecoration: "none",
                fontSize: "0.875rem",
                fontWeight: 500,
                color: pathname === "/dashboard" ? "var(--accent)" : "var(--text-secondary)",
                background: pathname === "/dashboard" ? "var(--accent-glow)" : "transparent",
                transition: "all 0.2s",
              }}
            >
              <LayoutDashboard size={16} />
              Dashboard
            </Link>
          </nav>

          {/* User actions */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              onClick={handleLogout}
              className="btn btn-ghost btn-sm"
              style={{ display: "flex", alignItems: "center", gap: "6px" }}
            >
              <LogOut size={15} />
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Page content */}
      <main
        style={{
          flex: 1,
          maxWidth: "1200px",
          width: "100%",
          margin: "0 auto",
          padding: "32px 24px",
        }}
      >
        {children}
      </main>
    </div>
  );
}
