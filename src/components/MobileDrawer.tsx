"use client";

import { useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { navItems } from "@/data/nav";
import { useUI } from "@/store/ui";

function Chevron() {
  return (
    <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M2 4l4 4 4-4" />
    </svg>
  );
}

export function MobileDrawer() {
  const open = useUI((s) => s.drawerOpen);
  const close = useUI((s) => s.closeDrawer);
  const [expanded, setExpanded] = useState<string | null>(null);

  const toggle = (label: string) =>
    setExpanded((cur) => (cur === label ? null : label));

  return (
    <>
      <div className={`scrim${open ? " open" : ""}`} onClick={close} />
      <aside className={`drawer${open ? " open" : ""}`} aria-label="Menu" aria-hidden={!open}>
        <div className="dhead">
          <b>GG PEITAS</b>
          <button className="x" aria-label="Fechar" onClick={close}>
            <X strokeWidth={2} />
          </button>
        </div>

        {navItems.map((item) => {
          const hasSub = !!item.groups;
          const isOpen = expanded === item.label;
          return (
            <div className={`macc${isOpen ? " open" : ""}`} key={item.label}>
              {hasSub ? (
                <>
                  <button onClick={() => toggle(item.label)}>
                    <span>
                      {item.emoji ? `${item.emoji} ` : ""}
                      {item.label}
                    </span>
                    <Chevron />
                  </button>
                  <div className="sub">
                    {item.groups!.flatMap((g) =>
                      g.links.map((l) => (
                        <Link key={l.href} href={l.href} onClick={close}>
                          {l.name}
                        </Link>
                      )),
                    )}
                  </div>
                </>
              ) : (
                <button onClick={close}>
                  <Link href={item.href ?? "#"} style={{ flex: 1, textAlign: "left" }}>
                    {item.emoji ? `${item.emoji} ` : ""}
                    {item.label}
                  </Link>
                </button>
              )}
            </div>
          );
        })}
      </aside>
    </>
  );
}
