"use client";

import { useEffect } from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/store/ui";

export function ThemeToggle() {
  const theme = useTheme((s) => s.theme);
  const toggle = useTheme((s) => s.toggle);
  const init = useTheme((s) => s.init);

  useEffect(() => {
    init();
  }, [init]);

  return (
    <button
      className="themebtn"
      onClick={toggle}
      aria-label="Alternar tema claro/escuro"
      title="Alternar tema"
    >
      {theme === "dark" ? <Sun strokeWidth={1.8} /> : <Moon strokeWidth={1.8} />}
    </button>
  );
}
