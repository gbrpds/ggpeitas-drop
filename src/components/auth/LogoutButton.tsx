"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { LogOut, Loader2 } from "lucide-react";

/** Logout client-side: limpa a sessão e recarrega no "/" (estado 100% limpo). */
export function LogoutButton({ className, label = "Sair da conta" }: { className?: string; label?: string }) {
  const [loading, setLoading] = useState(false);
  async function sair() {
    setLoading(true);
    try {
      await signOut({ redirect: false });
    } finally {
      window.location.assign("/"); // navegação dura → sem menu "bugado" com estado antigo
    }
  }
  return (
    <button className={className} onClick={sair} disabled={loading}>
      {loading ? <><Loader2 size={17} className="spin" /> Saindo…</> : <><LogOut size={17} /> {label}</>}
    </button>
  );
}
