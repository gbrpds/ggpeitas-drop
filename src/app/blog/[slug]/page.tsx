import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Announce } from "@/components/Announce";
import { Header } from "@/components/Header";
import { MainNav } from "@/components/MainNav";
import { MobileDrawer } from "@/components/MobileDrawer";
import { SiteFooter } from "@/components/SiteFooter";
import { JsonLd } from "@/components/JsonLd";
import { baseUrl } from "@/lib/site-url";
import { blogPosts, getPost } from "@/data/blog";

export function generateStaticParams() {
  return blogPosts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: "Artigo não encontrado" };
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: { type: "article", title: post.title, description: post.description, url: `${baseUrl()}/blog/${slug}` },
    twitter: { card: "summary_large_image", title: post.title, description: post.description },
  };
}

const fmt = (iso: string) => new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();
  const url = `${baseUrl()}/blog/${slug}`;

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    author: { "@type": "Organization", name: "GG Peitas" },
    publisher: { "@type": "Organization", name: "GG Peitas", logo: { "@type": "ImageObject", url: `${baseUrl()}/logo.png` } },
    mainEntityOfPage: url,
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Início", item: baseUrl() },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${baseUrl()}/blog` },
      { "@type": "ListItem", position: 3, name: post.title, item: url },
    ],
  };

  return (
    <>
      <JsonLd data={articleJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <Announce />
      <Header />
      <MainNav />
      <main>
        <article className="wrap blog-article">
          <nav className="crumbs" aria-label="Caminho">
            <Link href="/">Início</Link>
            <span className="sep">/</span>
            <Link href="/blog">Blog</Link>
            <span className="sep">/</span>
            <span>{post.title}</span>
          </nav>
          <span className="blog-tag">{post.tag}</span>
          <h1>{post.title}</h1>
          <p className="blog-meta">{fmt(post.date)} · {post.readMin} min de leitura</p>
          {/* conteúdo autoral (HTML confiável) */}
          <div className="blog-body" dangerouslySetInnerHTML={{ __html: post.body }} />
          <div className="blog-cta">
            <p>Vista a sua paixão com a GG Peitas — camisas importadas premium, frete grátis acima de R$299.</p>
            <Link className="btn btn-g" href="/">Ver a loja</Link>
          </div>
        </article>
      </main>
      <SiteFooter />
      <MobileDrawer />
    </>
  );
}
