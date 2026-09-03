import { NextResponse } from "next/server";
import { getAllActive } from "@/lib/catalog";

export const runtime = "nodejs";

const norm = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

/** Produtos ativos filtrados por time (?team=) ou categoria (?category=). */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const team = searchParams.get("team");
  const category = searchParams.get("category");

  let items = await getAllActive();
  if (team) {
    const t = norm(team);
    items = items.filter((p) => p.team && norm(p.team) === t);
  }
  if (category) items = items.filter((p) => p.category === category);

  return NextResponse.json(items.slice(0, 24));
}
