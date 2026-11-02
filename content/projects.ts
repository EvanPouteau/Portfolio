/* Source unique de vérité pour les projets.
   ---------------------------------------------------------------------------
   Alimente trois rendus à la fois :
     - les pages indexables /projets/<slug>
     - l'explorateur de l'OS
     - les scènes 3D : cadres photo sur les étagères et carrousel de la galerie

   Ajouter un projet = ajouter un objet ici. Rien d'autre à toucher. */

export type L = { fr: string; en: string };

export type Category = 'app' | 'dev' | 'design' | 'ux' | 'game';

export type Block = { h: L; p: L };

export type Link = {
  label: L;
  href: string;
  /** 'pdf' | 'image' ouvrent la visionneuse interne, 'url' part en nouvel onglet. */
  kind: 'url' | 'pdf' | 'image';
};

export type Project = {
  slug: string;
  name: L;
  tagline: L;
  type: L;
  year: string;
  category: Category;
  featured?: boolean;
  /** Application réellement en ligne et visitable sans compte. */
  live?: string;
  /** Application en ligne mais derrière une authentification. */
  privateApp?: boolean;
  tags: string[];
  role: L;
  context: L;
  status?: L;
  cover?: string;
  shots?: { src: string; caption: L }[];
  stats?: { value: string; label: L }[];
  blocks: Block[];
  note?: L;
  links: Link[];
  /** Couleur d'accent du projet dans les scènes 3D (liseré, pastilles). */
  three: { color: string };
};

export const CATEGORIES: Record<Category | 'all', L> = {
  all: { fr: 'Tous les projets', en: 'All projects' },
  app: { fr: 'Applications web', en: 'Web apps' },
  dev: { fr: 'Développement', en: 'Development' },
  design: { fr: 'Design graphique', en: 'Graphic design' },
  ux: { fr: 'UX & recherche', en: 'UX & research' },
  game: { fr: 'Game design', en: 'Game design' },
};

export const PROJECTS: Project[] = [
  {
    slug: 'arabe-egyptien',
    name: { fr: 'Arabe égyptien', en: 'Egyptian Arabic' },
    tagline: {
      fr: 'Apprendre le dialecte cairote, pas l’arabe des manuels.',
      en: 'Learn the Cairo dialect, not textbook Arabic.',
    },
    type: { fr: 'Application web', en: 'Web app' },
    year: '2026',
    category: 'app',
    featured: true,
    live: 'https://egyptian-arabic-app-phi.vercel.app',
    tags: ['Next.js 16', 'React 19', 'TypeScript', 'Tailwind 4', 'Supabase', 'PostgreSQL', 'Azure Speech', 'Gemini'],
    role: { fr: 'Conception, développement, contenu', en: 'Design, development, content' },
    context: { fr: 'Projet personnel', en: 'Personal project' },
    status: { fr: 'En production', en: 'In production' },
    cover: '/assets/covers/arabe-egyptien.webp',
    stats: [
      { value: '30', label: { fr: 'modules', en: 'modules' } },
      { value: '141', label: { fr: 'leçons', en: 'lessons' } },
      { value: '554', label: { fr: 'mots', en: 'words' } },
      { value: '524', label: { fr: 'prononciations', en: 'pronunciations' } },
      { value: 'A1→B2', label: { fr: 'niveaux', en: 'levels' } },
    ],
    shots: [
      { src: '/assets/shots/egy-modules.webp', caption: { fr: 'Les 30 modules, groupés par niveau', en: 'The 30 modules, grouped by level' } },
      { src: '/assets/shots/egy-glossaire.webp', caption: { fr: 'Le glossaire, recherchable', en: 'The glossary, searchable' } },
    ],
    blocks: [
      {
        h: { fr: 'Le problème', en: 'The problem' },
        p: {
          fr: 'Les manuels enseignent l’arabe littéraire — une langue que personne ne parle dans la rue. Quelqu’un qui débarque au Caire avec trois ans de cours ne comprend pas son chauffeur de taxi. Il n’existait pas de parcours structuré, en français, pour apprendre le dialecte cairote depuis zéro.',
          en: 'Textbooks teach Modern Standard Arabic — a language nobody speaks in the street. Someone landing in Cairo after three years of classes cannot understand their taxi driver. No structured French-language course existed for learning the Cairo dialect from scratch.',
        },
      },
      {
        h: { fr: 'Ce que j’ai construit', en: 'What I built' },
        p: {
          fr: 'Un parcours linéaire de 30 modules des niveaux A1 à B2, où chaque leçon débloque la suivante. Un quiz par module qui exige 70 % de réussite <em>et</em> la lecture de toutes les leçons. Une leçon du jour qui retire au hasard des mots parmi ceux déjà vus, et ne demande jamais ce qui n’a pas été appris. Un test de placement, un glossaire de 554 mots et une page dédiée à l’Arabizi avec les quatre sons arabes écoutables. Chaque quiz tire 10 questions dans une banque qui peut en compter jusqu’à 48 par module, un exercice d’écoute fait retrouver le sens d’un mot entendu, et Ostaz, un tuteur IA (Gemini), répond en arabe, en Arabizi et en français, dans la limite de 20 messages par jour. La progression est liée au compte, mais le contenu reste consultable sans inscription.',
          en: 'A linear course of 30 modules spanning levels A1 to B2, where each lesson unlocks the next. A quiz per module requiring 70% <em>and</em> every lesson read. A daily lesson that draws words at random from what you have already covered, and never asks for anything unseen. A placement test, a 554-word glossary and a page devoted to Arabizi with the four Arabic sounds playable. Each quiz draws 10 questions from a bank of up to 48 per module, a listening exercise asks you to find the meaning of a word you hear, and Ostaz, an AI tutor (Gemini), answers in Arabic, Arabizi and French, up to 20 messages a day. Progress is tied to an account, but the content itself stays readable without signing up.',
        },
      },
      {
        h: { fr: 'Le point technique', en: 'The technical bit' },
        p: {
          fr: 'Tout le contenu pédagogique venait de 15 fichiers JSON rédigés en amont, aux structures irrégulières : un fichier de conjugaisons ne suit pas du tout le schéma « module → jours → leçons » des autres. Le schéma PostgreSQL ayant été écrit avant que la forme exacte des données soit connue, j’ai préféré écrire un script d’import qui <em>documente</em> chaque correspondance non triviale plutôt que de tordre les données pour les faire entrer dans les tables.',
          en: 'All the teaching content came from 15 JSON files written beforehand, with irregular shapes: a conjugation file does not follow the “module → days → lessons” structure at all. Since the PostgreSQL schema had been written before the exact shape of the data was known, I chose to write an import script that <em>documents</em> every non-obvious mapping rather than bending the data to fit the tables.',
        },
      },
      {
        h: { fr: 'La prononciation', en: 'Pronunciation' },
        p: {
          fr: 'Chaque mot du vocabulaire s’écoute. La voix de synthèse égyptienne d’Azure se trompait sur environ un mot sur quatre : consonnes finales avalées, voyelles déformées, ق lu « q » alors que les Cairotes en font un coup de glotte. Ni ralentir la voix ni lui imposer la phonétique ne suffisait. J’ai donc écouté les 524 sons un par un dans un outil de tri fait pour l’occasion : 372 ont été gardés, et les 152 faux ont été réenregistrés par une locutrice native du Caire. Le site ne sert que des sons vérifiés.',
          en: 'Every vocabulary word can be played. Azure’s Egyptian synthetic voice got about one word in four wrong: swallowed final consonants, distorted vowels, ق read as “q” where Cairenes use a glottal stop. Slowing the voice down or forcing phonetics was not enough. So I listened to all 524 clips one by one in a sorting tool built for the purpose: 372 were kept, and the 152 wrong ones were re-recorded by a native Cairo speaker. The site only serves verified audio.',
        },
      },
      {
        h: { fr: 'Performances', en: 'Performance' },
        p: {
          fr: 'Le contenu était relu en base à chaque visite. Mis en cache côté serveur, il fait passer le chargement d’une page de 0,6–2,2 s à 0,25–0,30 s, mesuré en production. Contrepartie assumée : un contenu réimporté met jusqu’à une heure à apparaître.',
          en: 'The content was read from the database on every visit. Cached on the server, it brings page loads from 0.6–2.2 s down to 0.25–0.30 s, measured in production. Accepted trade-off: re-imported content takes up to an hour to show.',
        },
      },
      {
        h: { fr: 'Décisions assumées', en: 'Deliberate trade-offs' },
        p: {
          fr: 'Toutes les tables sont protégées par des politiques d’accès par ligne (RLS), et aucune clé capable de les contourner n’est déployée en production. La conséquence est acceptée : quelques opérations d’administration restent manuelles plutôt que d’exposer une clé privilégiée sur un serveur public.',
          en: 'Every table is protected by row-level security, and no key able to bypass it is deployed in production. The consequence is accepted: a few administrative operations stay manual rather than exposing a privileged key on a public server.',
        },
      },
    ],
    links: [
      { label: { fr: 'Ouvrir le site', en: 'Open the site' }, href: 'https://egyptian-arabic-app-phi.vercel.app', kind: 'url' },
    ],
    three: { color: '#d9a441' },
  },

  {
    slug: 'muscu',
    name: { fr: 'Muscu', en: 'Muscu' },
    tagline: {
      fr: 'Mon carnet d’entraînement, exactement mon programme et rien d’autre.',
      en: 'My training log — exactly my program and nothing else.',
    },
    type: { fr: 'Application web', en: 'Web app' },
    year: '2026',
    category: 'app',
    featured: true,
    privateApp: true,
    tags: ['Next.js 16', 'React 19', 'TypeScript', 'Tailwind 4', 'Supabase', 'Recharts'],
    role: { fr: 'Conception et développement', en: 'Design and development' },
    context: { fr: 'Projet personnel', en: 'Personal project' },
    status: { fr: 'En production, usage quotidien', en: 'In production, used daily' },
    cover: '/assets/covers/muscu.webp',
    stats: [
      { value: '4', label: { fr: 'séances', en: 'sessions' } },
      { value: '22', label: { fr: 'exercices', en: 'exercises' } },
      { value: '1', label: { fr: 'utilisateur', en: 'user' } },
      { value: '∞', label: { fr: 'courbes', en: 'charts' } },
    ],
    blocks: [
      {
        h: { fr: 'Le problème', en: 'The problem' },
        p: {
          fr: 'Les applications de musculation du marché sont des usines à gaz : abonnement, programmes génériques, publicités, fonctionnalités dont je ne me sers jamais. Je voulais un carnet qui contienne exactement mon programme et rien d’autre, utilisable entre deux séries sans réfléchir.',
          en: 'Commercial gym apps are bloated: subscriptions, generic programs, ads, features I never touch. I wanted a log holding exactly my program and nothing else, usable between two sets without thinking.',
        },
      },
      {
        h: { fr: 'Ce que j’ai construit', en: 'What I built' },
        p: {
          fr: 'Mon programme sur 4 séances (Haut A, Bas A, Bas B, Haut B) et 22 exercices, stocké en base de données et non codé en dur : le modifier ne demande aucun redéploiement. Validation série par série avec le poids et le nombre de répétitions, minuteur de repos qui démarre tout seul dès qu’une série est validée, photo de démonstration par exercice, et une page progression listant la charge actuelle de chaque exercice avec sa courbe dans le temps.',
          en: 'My four-session program (Upper A, Lower A, Lower B, Upper B) and 22 exercises, stored in the database rather than hard-coded: changing it needs no redeploy. Set-by-set logging with weight and reps, a rest timer that starts by itself as soon as a set is logged, a demonstration photo per exercise, and a progress page listing the current load for each exercise with its curve over time.',
        },
      },
      {
        h: { fr: 'Le point technique', en: 'The technical bit' },
        p: {
          fr: 'C’est une application volontairement mono-utilisateur : les inscriptions publiques sont désactivées, le compte unique a été créé à la main, et les politiques RLS filtrent chaque ligne par utilisateur. Ce n’est pas une limite, c’est la spécification — ça supprime tout un pan de complexité (gestion des rôles, partage, invitations) pour un besoin qui n’existe pas.',
          en: 'This is a deliberately single-user application: public sign-ups are disabled, the one account was created by hand, and row-level security filters every row by user. That is not a limitation, it is the specification — it removes a whole layer of complexity (roles, sharing, invitations) for a need that does not exist.',
        },
      },
    ],
    note: {
      fr: 'L’application étant privée, il n’y a pas de démonstration publique : le lien mène à l’écran de connexion. Je peux en faire la démonstration en entretien, ou détailler le code sur demande.',
      en: 'Because the app is private there is no public demo: the link leads to the sign-in screen. I am happy to demo it in an interview, or to walk through the code on request.',
    },
    links: [],
    three: { color: '#c8f751' },
  },

  {
    slug: 'lobby-urbex',
    name: { fr: 'Lobby de l’urbex', en: 'Urbex Lobby' },
    tagline: {
      fr: 'Plateforme dynamique de référencement de lieux d’exploration urbaine.',
      en: 'A dynamic platform cataloguing urban exploration sites.',
    },
    type: { fr: 'Site dynamique', en: 'Dynamic website' },
    year: '2026',
    category: 'dev',
    tags: ['PHP', 'MySQL', 'JavaScript', 'Docker', 'Render'],
    live: 'https://lobby-urbex.onrender.com/',
    role: { fr: 'Conception de la base, développement', en: 'Database design, development' },
    context: { fr: 'Projet individuel', en: 'Individual project' },
    cover: '/assets/covers/lobby-urbex.webp',
    shots: [
      { src: '/assets/shots/urbex-home.webp', caption: { fr: 'L’accueil et les derniers spots', en: 'The home page and latest spots' } },
      { src: '/assets/shots/urbex-lieu.webp', caption: { fr: 'Une fiche de lieu : danger, équipement, état', en: 'A location page: danger, gear, condition' } },
    ],
    blocks: [
      {
        h: { fr: 'Le projet', en: 'The project' },
        p: {
          fr: 'Une plateforme de référencement de lieux d’exploration urbaine : chaque lieu a sa fiche, les pages sont générées côté serveur et les contenus vivent dans une base de données relationnelle.',
          en: 'A platform cataloguing urban exploration sites: each location has its own page, rendered server-side, with content living in a relational database.',
        },
      },
      {
        h: { fr: 'Ce que j’y ai appris', en: 'What I learned' },
        p: {
          fr: 'C’est le projet où j’ai relié pour la première fois un formulaire, une requête SQL et une page rendue — la chaîne complète d’un site dynamique, sans framework pour la masquer. La base est modélisée en MCD avant d’écrire la moindre requête, et les accès passent par des requêtes préparées (PDO) pour fermer la porte aux injections SQL.',
          en: 'This is the project where I first wired a form, an SQL query and a rendered page together — the full chain of a dynamic site, with no framework hiding it. The database was modelled before a single query was written, and every access goes through prepared statements (PDO) to close the door on SQL injection.',
        },
      },
      {
        h: { fr: 'La mise en ligne', en: 'Going live' },
        p: {
          fr: 'Le site tournait sur un hébergement gratuit PHP qui a fini par lâcher. Je l’ai migré vers Render dans un conteneur Docker, avec une base TiDB compatible MySQL : aucune requête à réécrire, et les identifiants passent désormais par des variables d’environnement au lieu d’être écrits dans le code.',
          en: 'The site ran on a free PHP host that eventually gave out. I moved it to Render in a Docker container, with a MySQL-compatible TiDB database: no query to rewrite, and credentials now come from environment variables instead of being written in the code.',
        },
      },
    ],
    note: {
      fr: 'Hébergement gratuit : si le site n’a pas été visité depuis un moment, le serveur met jusqu’à une minute à se réveiller au premier chargement.',
      en: 'Free hosting: if the site has not been visited for a while, the server can take up to a minute to wake up on first load.',
    },
    links: [
      { label: { fr: 'Ouvrir le site', en: 'Open the site' }, href: 'https://lobby-urbex.onrender.com/', kind: 'url' },
    ],
    three: { color: '#f2b632' },
  },

  {
    slug: 'experience-gestuelle',
    name: { fr: 'Expérience gestuelle', en: 'Gestural experiment' },
    tagline: {
      fr: 'Manipulation d’une interface par le mouvement de la main, directement dans le navigateur.',
      en: 'Driving an interface with hand movement, straight from the browser.',
    },
    type: { fr: 'Expérimentation', en: 'Experiment' },
    year: '2026',
    category: 'dev',
    tags: ['MediaPipe', 'Canvas API', 'JavaScript'],
    role: { fr: 'Conception et développement', en: 'Design and development' },
    context: { fr: 'Expérimentation personnelle', en: 'Personal experiment' },
    cover: '/assets/covers/experience-gestuelle.webp',
    blocks: [
      {
        h: { fr: 'Le projet', en: 'The project' },
        p: {
          fr: 'Une page qui suit la main par la webcam avec MediaPipe et laisse manipuler des éléments dessinés au Canvas — sans capteur, sans installation, dans un onglet.',
          en: 'A page that tracks your hand through the webcam with MediaPipe and lets you manipulate elements drawn on a Canvas — no sensor, no install, in a tab.',
        },
      },
      {
        h: { fr: 'Pourquoi', en: 'Why' },
        p: {
          fr: 'Pour voir jusqu’où va une interface sans clic ni clavier, et ce que ça coûte en confort réel. La réponse courte : c’est impressionnant trente secondes et fatigant au bout de deux minutes — ce qui est en soi un résultat intéressant.',
          en: 'To see how far an interface can go with no click and no keyboard, and what it actually costs in comfort. The short answer: it is impressive for thirty seconds and tiring after two minutes — which is a finding in itself.',
        },
      },
    ],
    note: {
      fr: 'L’expérience demande l’accès à la webcam. Rien n’est enregistré ni envoyé : tout le traitement se fait dans le navigateur.',
      en: 'The experiment needs webcam access. Nothing is recorded or sent: everything runs in the browser.',
    },
    links: [
      { label: { fr: 'Lancer l’expérience', en: 'Launch the experiment' }, href: '/gestural-lab/index.html', kind: 'url' },
    ],
    three: { color: '#8b7fd4' },
  },

  {
    slug: 'evanos',
    name: { fr: 'EvanOS', en: 'EvanOS' },
    tagline: {
      fr: 'Le site que vous êtes en train de lire : un bureau complet, posé dans une scène 3D.',
      en: 'The site you are reading: a full desktop environment, sitting inside a 3D scene.',
    },
    type: { fr: 'Portfolio', en: 'Portfolio' },
    year: '2026',
    category: 'dev',
    tags: ['Next.js', 'React Three Fiber', 'Three.js', 'TypeScript', 'Accessibilité'],
    role: { fr: 'Conception et développement', en: 'Design and development' },
    context: { fr: 'Projet personnel', en: 'Personal project' },
    cover: '/assets/covers/evanos.webp',
    blocks: [
      {
        h: { fr: 'Le projet', en: 'The project' },
        p: {
          fr: 'Un gestionnaire de fenêtres écrit à la main — déplacement, redimensionnement, ancrage sur les bords, barre des tâches, menu Démarrer et terminal interactif — rendu à l’intérieur d’un écran modélisé en 3D. La caméra part d’un bureau vu de loin et plonge dans l’écran pour entrer dans le système.',
          en: 'A hand-written window manager — dragging, resizing, edge snapping, taskbar, Start menu and an interactive terminal — rendered inside a monitor modelled in 3D. The camera starts on a desk seen from afar and dives into the screen to enter the system.',
        },
      },
      {
        h: { fr: 'Le point technique', en: 'The technical bit' },
        p: {
          fr: 'La scène est construite en React Three Fiber, sans modèle importé : tout le mobilier est généré par du code, à partir de primitives. Ça pèse quelques kilo-octets au lieu de plusieurs mégaoctets de glTF, et chaque pièce reste modifiable par un paramètre plutôt que par un logiciel de modélisation.',
          en: 'The scene is built with React Three Fiber, with no imported model: every piece of furniture is generated from code, out of primitives. That costs a few kilobytes instead of several megabytes of glTF, and each piece stays adjustable through a parameter rather than through a modelling tool.',
        },
      },
      {
        h: { fr: 'Accessibilité', en: 'Accessibility' },
        p: {
          fr: 'La 3D ne doit jamais se mettre entre un visiteur et l’information qu’il cherche. L’intro se saute, se souvient d’avoir été vue, et disparaît complètement si le système demande moins d’animations. Chaque projet existe aussi comme page classique, indexable et lisible sans WebGL.',
          en: 'The 3D must never stand between a visitor and the information they came for. The intro can be skipped, remembers having been seen, and disappears entirely when the system asks for reduced motion. Every project also exists as a plain page, indexable and readable without WebGL.',
        },
      },
    ],
    links: [],
    three: { color: '#4cc2ff' },
  },

  {
    slug: 'musee-crozatier',
    name: { fr: 'La D’JAM · Musée Crozatier', en: 'La D’JAM · Crozatier Museum' },
    tagline: {
      fr: 'Identité visuelle des Jeunes Amis du Musée Crozatier : logo, déclinaisons, carte d’adhérent et affiche.',
      en: 'Visual identity for the Young Friends of the Crozatier Museum: logo, variants, membership card and poster.',
    },
    type: { fr: 'Identité visuelle', en: 'Visual identity' },
    year: '2025',
    category: 'design',
    tags: ['Illustrator', 'InDesign', 'Identité visuelle', 'Print'],
    role: { fr: 'Identité visuelle, en binôme', en: 'Visual identity, as a pair' },
    context: { fr: 'Projet MMI', en: 'MMI coursework' },
    cover: '/assets/covers/musee-crozatier.webp',
    blocks: [
      {
        h: { fr: 'Le projet', en: 'The project' },
        p: {
          fr: 'La D’JAM regroupe les 18-35 ans de la Société des Amis du Musée Crozatier, au Puy-en-Velay. Nous avons conçu son identité : un logo qui réunit la colonnade du musée, un cadre de tableau et une silhouette en mouvement, décliné en version « Atelier créatif » et en icônes de 16 et 32 pixels.',
          en: 'La D’JAM brings together the 18-to-35-year-olds of the Society of Friends of the Crozatier Museum, in Le Puy-en-Velay. We designed its identity: a logo combining the museum’s colonnade, a picture frame and a figure in motion, with an “Atelier créatif” variant and 16- and 32-pixel icons.',
        },
      },
      {
        h: { fr: 'Les supports', en: 'The deliverables' },
        p: {
          fr: 'Une carte d’adhérent recto verso pour la saison 2025-2026, et une affiche de recrutement qui dit l’essentiel en un coup d’œil : la tranche d’âge, le tarif annuel et un QR code vers le compte Instagram.',
          en: 'A double-sided membership card for the 2025-2026 season, and a recruitment poster that says what matters at a glance: the age range, the yearly fee and a QR code to the Instagram account.',
        },
      },
      {
        h: { fr: 'En binôme', en: 'As a pair' },
        p: {
          fr: 'Projet réalisé avec Luis Eyherachar, de la recherche du logo jusqu’à la mise en page des supports imprimés.',
          en: 'A project made with Luis Eyherachar, from the logo research through to the layout of the printed material.',
        },
      },
    ],
    links: [
      { label: { fr: 'Voir la planche complète', en: 'View the full board' }, href: '/assets/docs/crozatier-affiche-a3.webp', kind: 'image' },
    ],
    three: { color: '#e07a5f' },
  },

  {
    slug: 'filia',
    name: { fr: 'Filia', en: 'Filia' },
    tagline: {
      fr: 'Étude UX d’une application de soin de la peau assistée par IA, avec entretiens sur le terrain.',
      en: 'UX study of an AI-assisted skincare app, with field interviews.',
    },
    type: { fr: 'Étude UX', en: 'UX research' },
    year: '2026',
    category: 'ux',
    tags: ['UX', 'Entretiens', 'Recherche utilisateur'],
    role: { fr: 'Recherche utilisateur, en équipe de trois', en: 'User research, team of three' },
    context: { fr: 'Projet MMI', en: 'MMI coursework' },
    cover: '/assets/covers/filia.webp',
    blocks: [
      {
        h: { fr: 'Le projet', en: 'The project' },
        p: {
          fr: 'Évaluer une application de soin de la peau assistée par IA du point de vue de ses utilisatrices et utilisateurs, plutôt que de ses fonctionnalités.',
          en: 'Evaluating an AI-assisted skincare app from the point of view of the people using it, rather than of its feature list.',
        },
      },
      {
        h: { fr: 'La méthode', en: 'The method' },
        p: {
          fr: 'Entretiens qualitatifs menés sur le terrain, puis fiches personas pour identifier les points de douleur psychologiques et techniques, et synthèse dans un rapport écrit. Aller parler aux gens plutôt que supposer à leur place : c’est la partie du BUT MMI qui a le plus changé ma façon de concevoir une interface.',
          en: 'Qualitative interviews conducted in the field, then persona profiles to identify psychological and technical pain points, and a written synthesis. Going and talking to people rather than assuming on their behalf: it is the part of my degree that changed how I design an interface the most.',
        },
      },
    ],
    links: [
      { label: { fr: 'Lire le rapport', en: 'Read the report' }, href: '/assets/docs/projet-fillia-etude-ux.pdf', kind: 'pdf' },
    ],
    three: { color: '#e5a0b5' },
  },

  {
    slug: 'fracture',
    name: { fr: 'FRACTURE', en: 'FRACTURE' },
    tagline: {
      fr: 'Document de game design narratif — mécaniques et arborescence de choix.',
      en: 'A narrative game design document — mechanics and choice tree.',
    },
    type: { fr: 'Game design document', en: 'Game design document' },
    year: '2025',
    category: 'game',
    tags: ['Game design', 'Narration', 'Arborescence'],
    role: { fr: 'Game design et écriture, en équipe de six', en: 'Game design and writing, team of six' },
    context: { fr: 'Projet universitaire · cours de communication', en: 'University project · communication course' },
    cover: '/assets/covers/fracture.webp',
    blocks: [
      {
        h: { fr: 'Le projet', en: 'The project' },
        p: {
          fr: 'Un document de game design complet pour un jeu narratif à embranchements, inspiré de Detroit: Become Human : univers, mécaniques et arborescence des choix.',
          en: 'A complete game design document for a branching narrative game, inspired by Detroit: Become Human: setting, mechanics and choice tree.',
        },
      },
      {
        h: { fr: 'Ce qui était dur', en: 'The hard part' },
        p: {
          fr: 'Tenir une arborescence lisible. Chaque choix double le nombre de branches, et un document de game design ne sert à rien si l’équipe qui le lit s’y perd.',
          en: 'Keeping the tree readable. Every choice doubles the number of branches, and a design document is worthless if the team reading it gets lost in it.',
        },
      },
    ],
    links: [
      { label: { fr: 'Ouvrir le document', en: 'Open the document' }, href: '/assets/docs/fracture-gdd.pdf', kind: 'pdf' },
    ],
    three: { color: '#4a9d7f' },
  },
];

export const bySlug = (slug: string) => PROJECTS.find((p) => p.slug === slug);
export const featured = () => PROJECTS.filter((p) => p.featured);
