import Link from "next/link";
import type { Metadata } from "next";
import { Announce } from "@/components/Announce";
import { Header } from "@/components/Header";
import { MainNav } from "@/components/MainNav";
import { MobileDrawer } from "@/components/MobileDrawer";
import { SiteFooter } from "@/components/SiteFooter";
import { blogPosts } from "@/data/blog";

export const metadata: Metadata = {
  title: "Blog — Camisas de Futebol Importadas",
  description:
    "Guias e dicas sobre camisas de futebol importadas: qualidade tailandesa 1:1, retrôs, tamanhos e como comprar com segurança.",
  alternates: { canonical: "/blog" },
};

const fmt = (iso: string) => new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

export default function BlogIndex() {
  const posts = [...blogPosts].sort((a, b) => +new Date(b.date) - +new Date(a.date));
  return (
    <>
      <Announce />
      <Header />
      <MainNav />
      <main>
        <div className="wrap blog-page">
          <h1 className="search-title">Blog GG Peitas</h1>
          <p className="auth-lead" style={{ marginTop: -6 }}>
            Guias e dicas sobre camisas de futebol importadas — qualidade, retrôs, tamanhos e muito mais.
          </p>
          <div className="blog-grid">
            {posts.map((p) => (
              <Link key={p.slug} href={`/blog/${p.slug}`} className="blog-card">
                <span className="blog-tag">{p.tag}</span>
                <h2>{p.title}</h2>
                <p>{p.description}</p>
                <span className="blog-meta">{fmt(p.date)} · {p.readMin} min de leitura</span>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
      <MobileDrawer />
    </>
  );
}
