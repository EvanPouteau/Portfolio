/* Page indexable d'un projet.
   C'est elle que Google référence et que l'on partage sur LinkedIn : elle se
   lit sans WebGL ni fenêtre, et propose d'ouvrir le même projet dans l'OS. */

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PROJECTS, bySlug } from '@/content/projects';
import { SITE } from '@/content/site';
import { ProjectBody } from '@/components/os/windows';
import '@/components/os/os.css';
import '@/components/page-shell.css';

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return PROJECTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const p = bySlug(slug);
  if (!p) return {};
  const title = `${p.name.fr} — ${p.type.fr}`;
  return {
    title,
    description: p.tagline.fr,
    alternates: { canonical: `/projets/${p.slug}` },
    openGraph: {
      title,
      description: p.tagline.fr,
      url: `${SITE.url}/projets/${p.slug}`,
      images: p.cover ? [{ url: p.cover, width: 1200, height: 750 }] : ['/assets/og.png?v=2'],
    },
  };
}

export default async function ProjectPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const p = bySlug(slug);
  if (!p) notFound();

  const i = PROJECTS.indexOf(p);
  const prev = PROJECTS[(i - 1 + PROJECTS.length) % PROJECTS.length];
  const next = PROJECTS[(i + 1) % PROJECTS.length];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: p.name.fr,
    description: p.tagline.fr,
    dateCreated: p.year,
    keywords: p.tags.join(', '),
    author: { '@type': 'Person', name: 'Evan Pouteau', url: SITE.url },
    ...(p.live ? { url: p.live } : {}),
  };

  return (
    <div className="page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav className="page-top">
        <Link href="/" className="page-brand"><span className="winlogo"><i /><i /><i /><i /></span>Evan Pouteau</Link>
        <Link href={`/?open=project:${p.slug}`} className="btn">Ouvrir dans EvanOS</Link>
      </nav>
      <article className="page-article">
        <header>
          <span className="page-kicker">{p.type.fr} · {p.year}</span>
          <h1>{p.name.fr}</h1>
        </header>
        <div className="win-body page-body">
          <ProjectBody p={p} lang="fr" />
        </div>
      </article>
      <nav className="page-nav" aria-label="Autres projets">
        <Link href={`/projets/${prev.slug}`}><span>← Précédent</span><b>{prev.name.fr}</b></Link>
        <Link href={`/projets/${next.slug}`}><span>Suivant →</span><b>{next.name.fr}</b></Link>
      </nav>
    </div>
  );
}
