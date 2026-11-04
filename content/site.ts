import type { L } from './projects';

export const SITE = {
  name: 'Evan Pouteau',
  url: 'https://evanpouteau.vercel.app',
  email: 'pouteauevan@gmail.com',
  github: 'https://github.com/EvanPouteau',
  linkedin: 'https://www.linkedin.com/in/evan-pouteau-06a9a7342',
  city: 'Puy-en-Velay',
  cv: { fr: '/assets/docs/CV-Evan-Pouteau-FR.pdf?v=2', en: '/assets/docs/CV-Evan-Pouteau-EN.pdf?v=2' },
} as const;

export const ROLE: L = {
  fr: 'Étudiant en BUT MMI · Développeur web full-stack',
  en: 'BUT MMI student · Full-stack web developer',
};

export const AVAILABILITY: L = {
  fr: 'Recherche un stage en développement web · à partir d’avril',
  en: 'Seeking a web development internship · starting in April',
};

export const INTRO: L[] = [
  {
    fr: 'Je construis des interfaces web et des applications complètes, de la maquette à la mise en production. J’ai commencé par le HTML/CSS en autodidacte, le BUT MMI m’a apporté le design et l’UX, et mes projets personnels le reste : React, TypeScript, bases de données, déploiement.',
    en: 'I build web interfaces and complete applications, from the mockup to production. I started with HTML and CSS on my own, my degree added design and UX, and my personal projects brought the rest: React, TypeScript, databases, deployment.',
  },
  {
    fr: 'Ce que j’aime : les projets que je peux mener de bout en bout. Deux de mes applications tournent en production et je les utilise tous les jours — c’est la meilleure façon que j’ai trouvée d’apprendre pour de vrai.',
    en: 'What I enjoy: projects I can carry end to end. Two of my applications run in production and I use them every day — it is the best way I have found to actually learn.',
  },
];

export const SPECS: { k: L; v: L }[] = [
  {
    k: { fr: 'Formation', en: 'Degree' },
    v: {
      fr: 'BUT Métiers du Multimédia et de l’Internet, parcours Développement — 2ᵉ année',
      en: 'BUT in Multimedia and Internet Studies, Web Development track — 2nd year',
    },
  },
  {
    k: { fr: 'Établissement', en: 'Institution' },
    v: { fr: 'IUT Clermont Auvergne — Puy-en-Velay (43)', en: 'IUT Clermont Auvergne — Puy-en-Velay (43), France' },
  },
  {
    k: { fr: 'Recherche', en: 'Looking for' },
    v: {
      fr: 'Un stage en développement web, à partir d’avril',
      en: 'A web development internship, starting in April',
    },
  },
  {
    k: { fr: 'Langues', en: 'Languages' },
    v: {
      fr: 'Français (langue maternelle) · Anglais (B1) · Arabe égyptien (en cours)',
      en: 'French (native) · English (B1) · Egyptian Arabic (learning)',
    },
  },
  {
    k: { fr: 'En production', en: 'In production' },
    v: { fr: '2 applications Next.js + Supabase déployées sur Vercel', en: 'Two Next.js + Supabase apps deployed on Vercel' },
  },
];

export const EDUCATION: { when: string; title: L; sub: L }[] = [
  {
    when: '2025 – 2027',
    title: {
      fr: 'BUT Métiers du Multimédia et de l’Internet — parcours Développement',
      en: 'BUT in Multimedia and Internet Studies — Web Development track',
    },
    sub: {
      fr: 'IUT Clermont Auvergne, Puy-en-Velay (43) · 2ᵉ année en cours',
      en: 'IUT Clermont Auvergne, Puy-en-Velay (43), France · 2nd year, in progress',
    },
  },
  {
    when: '2024 – 2025',
    title: { fr: 'Bachelor Informatique Graphique', en: 'Bachelor’s Degree in Computer Graphics' },
    sub: { fr: 'IUT Clermont Auvergne, Puy-en-Velay (43)', en: 'IUT Clermont Auvergne, Puy-en-Velay (43), France' },
  },
  {
    when: '2024',
    title: { fr: 'Baccalauréat STI2D — mention bien', en: 'French Baccalaureate STI2D — with honours' },
    sub: { fr: 'Lycée Charles de Gaulle, Poissy (78)', en: 'Lycée Charles de Gaulle, Poissy (78), France' },
  },
];

export const EXPERIENCE: { when: string; title: L; sub: L }[] = [
  {
    when: '2025',
    title: { fr: 'Manutentionnaire — LISI Automotive Rapid', en: 'Material handler — LISI Automotive Rapid' },
    sub: {
      fr: 'Juillet à août 2025 · travail en environnement industriel, respect strict des consignes de sécurité',
      en: 'July to August 2025 · industrial environment, strict safety procedures',
    },
  },
  {
    when: '2023 · 2024',
    title: { fr: 'Employé polyvalent — Leclerc', en: 'Versatile worker — Leclerc' },
    sub: {
      fr: 'Juin à août, deux étés consécutifs · travail d’équipe et respect des consignes',
      en: 'June to August, two consecutive summers · teamwork and following instructions',
    },
  },
];

export const SKILLS: { group: L; rows: { k: string; v: L }[] }[] = [
  {
    group: { fr: 'DÉVELOPPEMENT WEB', en: 'WEB DEVELOPMENT' },
    rows: [
      { k: 'HTML / CSS', v: { fr: 'Avancé', en: 'Advanced' } },
      { k: 'JavaScript', v: { fr: 'Avancé', en: 'Advanced' } },
      { k: 'React / Next.js', v: { fr: 'Intermédiaire', en: 'Intermediate' } },
      { k: 'TypeScript', v: { fr: 'Intermédiaire', en: 'Intermediate' } },
      { k: 'Tailwind CSS', v: { fr: 'Intermédiaire', en: 'Intermediate' } },
      { k: 'PHP', v: { fr: 'Notions', en: 'Basics' } },
      { k: 'Python', v: { fr: 'Intermédiaire', en: 'Intermediate' } },
      { k: 'C++', v: { fr: 'Notions', en: 'Basics' } },
    ],
  },
  {
    group: { fr: 'DONNÉES & OUTILS', en: 'DATA & TOOLING' },
    rows: [
      { k: 'PostgreSQL / SQL', v: { fr: 'Intermédiaire', en: 'Intermediate' } },
      { k: 'Supabase (Auth, RLS)', v: { fr: 'Intermédiaire', en: 'Intermediate' } },
      { k: 'Git', v: { fr: 'Intermédiaire', en: 'Intermediate' } },
      { k: 'Vercel', v: { fr: 'Intermédiaire', en: 'Intermediate' } },
      { k: 'Three.js / WebGL', v: { fr: 'Notions', en: 'Basics' } },
    ],
  },
  {
    group: { fr: 'DESIGN', en: 'DESIGN' },
    rows: [
      { k: 'Adobe Photoshop', v: { fr: 'Intermédiaire', en: 'Intermediate' } },
      { k: 'Adobe Illustrator', v: { fr: 'Intermédiaire', en: 'Intermediate' } },
      { k: 'Adobe InDesign', v: { fr: 'Intermédiaire', en: 'Intermediate' } },
      { k: 'UX / recherche utilisateur', v: { fr: 'Intermédiaire', en: 'Intermediate' } },
    ],
  },
  {
    group: { fr: 'LANGUES', en: 'LANGUAGES' },
    rows: [
      { k: 'Français', v: { fr: 'Langue maternelle (C2)', en: 'Native (C2)' } },
      { k: 'Anglais', v: { fr: 'B1', en: 'B1' } },
      { k: 'Arabe égyptien', v: { fr: 'En cours d’apprentissage', en: 'Currently learning' } },
    ],
  },
];

/* ------------------------------------------------------------------------
   Textes personnels du bureau (widgets et post-it). À modifier librement :
   ce sont eux qui donnent la voix du site.
   ------------------------------------------------------------------------ */

export const GREETING: L = {
  fr: 'Salut, moi c’est Evan.',
  en: 'Hi, I’m Evan.',
};

export const PITCH: L = {
  fr: 'Je suis étudiant en BUT MMI à Puy-en-Velay et je cherche un stage en développement web à partir d’avril.',
  en: 'I’m a BUT MMI student in Puy-en-Velay, looking for a web development internship starting in April.',
};

export const NOW: { icon: 'school' | 'tool' | 'heart'; text: L }[] = [
  {
    icon: 'school',
    text: {
      fr: '2ᵉ année de BUT MMI, parcours Développement, à l’IUT de Puy-en-Velay.',
      en: '2nd year of a BUT MMI, Web Development track, at the IUT in Puy-en-Velay.',
    },
  },
  {
    icon: 'tool',
    text: {
      fr: 'Je construis mes propres outils : une app pour apprendre l’arabe égyptien, une autre pour suivre mes séances de sport.',
      en: 'I build my own tools: an app to learn Egyptian Arabic, another to log my workouts.',
    },
  },
  {
    icon: 'heart',
    text: { fr: 'Ce qui me plaît : la technologie et le sport.', en: 'What I enjoy: technology and sport.' },
  },
];

export const STICKY_NOTE: L = {
  fr: 'Merci de passer par ici ! Si vous n’avez qu’une minute : ouvrez « Mes projets en 3D », puis mon CV.',
  en: 'Thanks for stopping by! If you only have a minute: open “My projects in 3D”, then my CV.',
};
