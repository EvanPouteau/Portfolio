import type { Metadata, Viewport } from 'next';
import { Inter, Cascadia_Code, Caveat } from 'next/font/google';
import './globals.css';
import { SITE } from '@/content/site';

/* Les polices sont auto-hébergées par next/font au build : plus aucune requête
   vers Google au chargement de la page (la mention dans la politique de
   confidentialité est mise à jour en conséquence). */
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
/* Polices secondaires non préchargées : la chasse fixe ne sert qu'au terminal
   et aux étiquettes techniques, la manuscrite qu'au post-it. Elles ne sont
   téléchargées que si un texte les utilise réellement. */
const cascadia = Cascadia_Code({ subsets: ['latin'], variable: '--font-cascadia', display: 'swap', preload: false });
/* écriture manuscrite du post-it posé sur le bureau */
const caveat = Caveat({ subsets: ['latin'], variable: '--font-caveat', display: 'swap', weight: ['500', '700'], preload: false });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: 'Evan Pouteau — Développeur web & étudiant MMI',
    template: '%s — Evan Pouteau',
  },
  description:
    "Portfolio interactif d'Evan Pouteau, étudiant en BUT MMI à l'IUT Clermont Auvergne et développeur web. Applications Next.js et Supabase, projets design et UX. Recherche un stage en développement web à partir d'avril.",
  authors: [{ name: 'Evan Pouteau' }],
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    siteName: 'Evan Pouteau',
    images: [{ url: '/assets/og.png?v=2', width: 1200, height: 630, alt: "EvanOS — le portfolio d'Evan Pouteau" }],
  },
  twitter: { card: 'summary_large_image', images: ['/assets/og.png?v=2'] },
  icons: { icon: '/favicon.svg', apple: '/assets/icon-180.png' },
};

export const viewport: Viewport = {
  themeColor: '#15100e',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" data-theme="dark" className={`${inter.variable} ${cascadia.variable} ${caveat.variable}`} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
