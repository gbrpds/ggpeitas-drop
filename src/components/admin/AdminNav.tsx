"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Package, ShoppingBag, Users, Shield } from "lucide-react";

const tabs = [
  { href: "/admin", label: "Produtos", Icon: Package },
  { href: "/admin/pedidos", label: "Pedidos", Icon: ShoppingBag },
  { href: "/admin/contas", label: "Contas", Icon: Users },
  { href: "/admin/times", label: "Times", Icon: Shield },
];

export function AdminNav() {
  const path = usePathname();
  return (
    <div className="adm-nav">
      {tabs.map((t) => {
        const active = t.href === "/admin" ? path === "/admin" || path.startsWith("/admin/produto") || path.startsWith("/admin/novo") : path.startsWith(t.href);
        return (
          <Link key={t.href} href={t.href} className={`adm-tab${active ? " on" : ""}`}>
            <t.Icon size={16} /> {t.label}
          </Link>
        );
      })}
    </div>
  );
}
