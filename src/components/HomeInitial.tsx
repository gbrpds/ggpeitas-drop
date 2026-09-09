"use client";

import { useEffect } from "react";
import { useTeam } from "@/store/team";
import { ProductCarousel } from "@/components/ProductCarousel";
import { HomeTeamSection } from "@/components/HomeTeamSection";
import type { ProductSection } from "@/data/products";

/**
 * Bloco logo abaixo do banner:
 * - sem time escolhido → primeira seção de produtos (chama a atenção);
 * - com time do coração → essa seção é trocada pelas camisas do time.
 */
export function HomeInitial({ firstSection }: { firstSection: ProductSection | null }) {
  const team = useTeam((s) => s.team);
  const hydrated = useTeam((s) => s.hydrated);
  const hydrate = useTeam((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const fallback = firstSection ? <ProductCarousel section={firstSection} /> : null;

  // antes de hidratar (e no SSR) mostra a seção padrão — evita "pulo" na tela
  if (!hydrated) return fallback;
  return team ? <HomeTeamSection /> : fallback;
}
