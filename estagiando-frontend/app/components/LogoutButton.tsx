"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-red-50 hover:border-red-300 hover:text-red-600 shadow-sm disabled:opacity-50"
    >
      {loading ? "Saindo..." : "Sair"}
    </button>
  );
}
