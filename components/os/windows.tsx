'use client';

/* Contenu des fenêtres de l'OS. */

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Icon, type IconName } from './icons';
import { PROJECTS, CATEGORIES, bySlug, featured, type Category, type Project } from '@/content/projects';
import { SITE, ROLE, AVAILABILITY, INTRO, SPECS, EDUCATION, EXPERIENCE } from '@/content/site';

export type Lang = 'fr' | 'en';
export type ViewerPayload = { kind: 'pdf' | 'image'; src: string; name: string };
type Ctx = { openWin: (id: string, payload?: unknown) => void; openViewer: (p: ViewerPayload) => void; lang: Lang };

/* ======================================================================= */
/*  Ce PC                                                                  */
/* ======================================================================= */

export function AboutWin({ openWin, lang }: Ctx) {
  const en = lang === 'en';
  return (
    <>
      <div className="about-hero">
        <img src="/assets/images/profil.webp" width={104} height={104} alt={en ? 'Portrait of Evan Pouteau' : 'Portrait d’Evan Pouteau'} className="about-avatar" />
        <div>
          <h2 className="h1">Evan Pouteau</h2>
          <p className="lede">{ROLE[lang]}</p>
          <p className="badge-avail"><span className="dot" />{AVAILABILITY[lang]}</p>
        </div>
      </div>
      {INTRO.map((p, i) => <p key={i}>{p[lang]}</p>)}

      <h3 className="h3">{en ? 'At a glance' : 'En bref'}</h3>
      <dl className="spec">
        {SPECS.map((s, i) => <div key={i} className="spec-row"><dt>{s.k[lang]}</dt><dd>{s.v[lang]}</dd></div>)}
      </dl>

      <h3 className="h3">{en ? 'Education' : 'Formation'}</h3>
      <Timeline items={EDUCATION} lang={lang} />

      <h3 className="h3">{en ? 'Work experience' : 'Expériences'}</h3>
      <Timeline items={EXPERIENCE} lang={lang} />

      <div className="row-actions">
        <a className="btn btn-primary" href={SITE.cv[lang]} download><Icon name="download" size={17} />{en ? 'Download CV' : 'Télécharger le CV'}</a>
        <a className="btn" href={SITE.cv[en ? 'fr' : 'en']} download><Icon name="globe" size={17} />{en ? 'Version française' : 'Version anglaise'}</a>
        <button className="btn" onClick={() => openWin('apps')}><Icon name="apps" size={17} />{en ? 'See my apps' : 'Voir mes applications'}</button>
        <button className="btn" onClick={() => openWin('contact')}><Icon name="mail" size={17} />{en ? 'Get in touch' : 'Me contacter'}</button>
      </div>
    </>
  );
}

function Timeline({ items, lang }: { items: { when: string; title: { fr: string; en: string }; sub: { fr: string; en: string } }[]; lang: Lang }) {
  return (
    <ol className="timeline">
      {items.map((it, i) => (
        <li key={i}>
          <span className="tl-when">{it.when}</span>
          <div><b>{it.title[lang]}</b><i>{it.sub[lang]}</i></div>
        </li>
      ))}
    </ol>
  );
}

/* ======================================================================= */
/*  Mes applications                                                       */
/* ======================================================================= */

export function AppsWin({ openWin, lang }: Ctx) {
  const en = lang === 'en';
  return (
    <>
      <p className="section-intro">
        {en
          ? 'Two applications I designed, built and shipped on my own. Both run in production on Vercel, with a PostgreSQL database, authentication and per-user access policies.'
          : 'Deux applications que j’ai conçues, développées et déployées seul. Elles tournent en production sur Vercel, avec une base PostgreSQL, une authentification et des politiques d’accès par utilisateur.'}
      </p>
      {featured().map((p) => (
        <article key={p.slug} className="app-feature">
          <button className={`app-shot${p.privateApp ? ' app-shot-private' : ''}`} onClick={() => openWin(`project:${p.slug}`)}
            aria-label={en ? `Open the ${p.name.en} case study` : `Ouvrir l’étude de cas ${p.name.fr}`}>
            {p.cover && <img src={p.cover} width={1200} height={750} alt="" loading="lazy" />}
          </button>
          <div className="app-meta">
            {p.live
              ? <span className="pill pill-live"><span className="dot" />{en ? 'Live' : 'En ligne'}</span>
              : <span className="pill pill-private"><Icon name="lock" size={13} />{en ? 'Private app' : 'Application privée'}</span>}
            <h2 className="h2">{p.name[lang]}</h2>
            <p className="app-tag">{p.tagline[lang]}</p>
            {p.stats && (
              <ul className="stat-row">
                {p.stats.map((s) => <li key={s.value + s.label.fr}><b>{s.value}</b><span>{s.label[lang]}</span></li>)}
              </ul>
            )}
            <div className="tags">{p.tags.map((t) => <span key={t}>{t}</span>)}</div>
            <div className="row-actions">
              <button className="btn btn-primary" onClick={() => openWin(`project:${p.slug}`)}>{en ? 'Read the case study' : 'Lire l’étude de cas'}</button>
              {p.live && <a className="btn" href={p.live} target="_blank" rel="noopener"><Icon name="external" size={17} />{en ? 'Open the site' : 'Ouvrir le site'}</a>}
            </div>
          </div>
        </article>
      ))}
    </>
  );
}

/* ======================================================================= */
/*  Fiche projet                                                           */
/* ======================================================================= */

export function ProjectWin({ slug, openWin, openViewer, lang }: Ctx & { slug: string }) {
  const p = bySlug(slug);
  if (!p) return <p>{lang === 'en' ? 'Project not found.' : 'Projet introuvable.'}</p>;
  return <ProjectBody p={p} lang={lang} openWin={openWin} openViewer={openViewer} />;
}

export function ProjectBody({ p, lang, openWin, openViewer }: { p: Project; lang: Lang; openWin?: Ctx['openWin']; openViewer?: Ctx['openViewer'] }) {
  const en = lang === 'en';
  return (
    <>
      {p.cover && <img className="case-hero" src={p.cover} width={1200} height={750} alt="" loading="lazy" />}
      <p className="lede">{p.tagline[lang]}</p>
      <div className="tags">{p.tags.map((t) => <span key={t}>{t}</span>)}</div>
      <dl className="case-meta">
        <div><dt>{en ? 'Year' : 'Année'}</dt><dd>{p.year}</dd></div>
        <div><dt>{en ? 'Role' : 'Rôle'}</dt><dd>{p.role[lang]}</dd></div>
        <div><dt>{en ? 'Context' : 'Contexte'}</dt><dd>{p.context[lang]}</dd></div>
        <div><dt>{en ? 'Status' : 'État'}</dt><dd>{p.status?.[lang] ?? p.type[lang]}</dd></div>
      </dl>
      {p.stats && (
        <ul className="stat-row">
          {p.stats.map((s) => <li key={s.value + s.label.fr}><b>{s.value}</b><span>{s.label[lang]}</span></li>)}
        </ul>
      )}
      {p.blocks.map((b, i) => (
        <section key={i}>
          <h3 className="h3">{b.h[lang]}</h3>
          <p dangerouslySetInnerHTML={{ __html: b.p[lang] }} />
        </section>
      ))}
      {p.shots && (
        <div className="shot-grid">
          {p.shots.map((s) => (
            <figure key={s.src}><img src={s.src} width={1200} height={750} alt={s.caption[lang]} loading="lazy" /><figcaption>{s.caption[lang]}</figcaption></figure>
          ))}
        </div>
      )}
      {p.note && <p className="note">{p.note[lang]}</p>}
      <div className="row-actions">
        {p.links.map((l) => {
          if ((l.kind === 'pdf' || l.kind === 'image') && openViewer) {
            return <button key={l.href} className="btn btn-primary" onClick={() => openViewer({ kind: l.kind as 'pdf' | 'image', src: l.href, name: l.label[lang] })}>{l.label[lang]}</button>;
          }
          return <a key={l.href} className="btn btn-primary" href={l.href} target="_blank" rel="noopener"><Icon name="external" size={17} />{l.label[lang]}</a>;
        })}
        <Link className="btn" href={`/projets/${p.slug}`}>{en ? 'Permalink' : 'Lien permanent'}</Link>
        {openWin && <button className="btn" onClick={() => openWin('projects')}>{en ? 'All projects' : 'Tous les projets'}</button>}
      </div>
    </>
  );
}

/* ======================================================================= */
/*  Explorateur de projets                                                 */
/* ======================================================================= */

const CAT_ICON: Record<Category | 'all', IconName> = {
  all: 'home', app: 'apps', dev: 'terminal', design: 'grid', ux: 'user', game: 'play',
};

export function ProjectsWin({ openWin, lang }: Ctx) {
  const en = lang === 'en';
  const [cat, setCat] = useState<Category | 'all'>('all');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [q, setQ] = useState('');

  const list = useMemo(() => PROJECTS.filter((p) => {
    if (cat !== 'all' && p.category !== cat) return false;
    if (!q) return true;
    const hay = `${p.name.fr} ${p.name.en} ${p.tagline[lang]} ${p.type[lang]} ${p.tags.join(' ')}`.toLowerCase();
    return hay.includes(q.toLowerCase());
  }), [cat, q, lang]);

  return (
    <div className="explorer">
      <div className="explorer-bar">
        <div className="crumb"><Icon name="folder" size={15} />{en ? 'This PC' : 'Ce PC'}<i>›</i><b>{CATEGORIES[cat][lang]}</b></div>
        <div className="explorer-tools">
          <label className="search"><Icon name="search" size={15} />
            <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={en ? 'Search' : 'Rechercher'} aria-label={en ? 'Search projects' : 'Rechercher un projet'} />
          </label>
          <div className="viewtoggle" role="group" aria-label={en ? 'View' : 'Affichage'}>
            <button className={`vt${view === 'grid' ? ' is-on' : ''}`} aria-pressed={view === 'grid'} onClick={() => setView('grid')} title={en ? 'Grid' : 'Grille'}><Icon name="grid" size={17} /></button>
            <button className={`vt${view === 'list' ? ' is-on' : ''}`} aria-pressed={view === 'list'} onClick={() => setView('list')} title={en ? 'List' : 'Liste'}><Icon name="list" size={17} /></button>
          </div>
        </div>
      </div>
      <div className="explorer-body">
        <nav className="explorer-side" aria-label={en ? 'Categories' : 'Catégories'}>
          {(Object.keys(CATEGORIES) as (Category | 'all')[]).map((c) => (
            <button key={c} className={`cat${c === cat ? ' is-on' : ''}`} onClick={() => setCat(c)}>
              <Icon name={CAT_ICON[c]} size={16} /><span>{CATEGORIES[c][lang]}</span>
              <i className="count">{PROJECTS.filter((p) => c === 'all' || p.category === c).length}</i>
            </button>
          ))}
        </nav>
        <div className="explorer-main">
          {list.length === 0 && <p className="empty">{en ? 'No project matches that search.' : 'Aucun projet ne correspond à cette recherche.'}</p>}
          {view === 'grid' ? (
            <div className="proj-grid">
              {list.map((p) => (
                <button key={p.slug} className={`proj-card${p.featured ? ' is-star' : ''}`} onClick={() => openWin(`project:${p.slug}`)}>
                  <span className="pc-icon" style={{ color: p.three.color }}><Icon name={CAT_ICON[p.category]} size={18} /></span>
                  <h4>{p.name[lang]}</h4>
                  <p>{p.tagline[lang]}</p>
                  <span className="pc-foot">{p.year} · {p.type[lang]}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="proj-list">
              {list.map((p) => (
                <button key={p.slug} className="proj-row" onClick={() => openWin(`project:${p.slug}`)}>
                  <Icon name={CAT_ICON[p.category]} size={17} />
                  <span className="r-name">{p.featured ? '★ ' : ''}{p.name[lang]}</span>
                  <span className="r-type">{p.type[lang]}</span>
                  <span className="r-year">{p.year}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <footer className="explorer-status">{list.length} {en ? (list.length > 1 ? 'items' : 'item') : (list.length > 1 ? 'éléments' : 'élément')}</footer>
    </div>
  );
}

/* ======================================================================= */
/*  Contact                                                                */
/* ======================================================================= */

export function ContactWin({ lang }: Ctx) {
  const en = lang === 'en';
  const [copied, setCopied] = useState(false);
  return (
    <>
      <p className="section-intro">
        {en
          ? 'Write to me here: the button opens your own mail client with the message pre-filled. No data passes through this site.'
          : 'Écrivez-moi ici : le bouton ouvre votre logiciel de messagerie avec le message pré-rempli. Aucune donnée ne transite par ce site.'}
      </p>
      <form className="mail" onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        const body = `${f.get('body')}\n\n— ${f.get('name')}`;
        location.href = `mailto:${SITE.email}?subject=${encodeURIComponent(String(f.get('subject')))}&body=${encodeURIComponent(body)}`;
      }}>
        <div className="field"><label htmlFor="m-to">{en ? 'To' : 'À'}</label><input id="m-to" value={SITE.email} readOnly /></div>
        <div className="field"><label htmlFor="m-name">{en ? 'Your name' : 'Votre nom'}</label><input id="m-name" name="name" autoComplete="name" required /></div>
        <div className="field"><label htmlFor="m-subject">{en ? 'Subject' : 'Objet'}</label><input id="m-subject" name="subject" required /></div>
        <div className="field"><label htmlFor="m-body">Message</label><textarea id="m-body" name="body" rows={6} required /></div>
        <div className="row-actions">
          <button className="btn btn-primary" type="submit"><Icon name="mail" size={17} />{en ? 'Open in my mail client' : 'Ouvrir dans ma messagerie'}</button>
          <button className="btn" type="button" onClick={async () => {
            try { await navigator.clipboard.writeText(SITE.email); setCopied(true); setTimeout(() => setCopied(false), 2200); } catch { /* refusé */ }
          }}>{copied ? (en ? 'Copied ✓' : 'Copiée ✓') : (en ? 'Copy address' : 'Copier l’adresse')}</button>
        </div>
      </form>
      <h3 className="h3">{en ? 'Elsewhere' : 'Ailleurs'}</h3>
      <div className="links">
        <a className="link-card" href={SITE.linkedin} target="_blank" rel="noopener">
          <Icon name="linkedin" /><span><b>LinkedIn</b><i>{en ? 'Background, experience and network' : 'Parcours, expériences et réseau'}</i></span><Icon name="external" size={15} className="ic-end" />
        </a>
        <a className="link-card" href={SITE.github} target="_blank" rel="noopener">
          <Icon name="github" /><span><b>GitHub</b><i>{en ? 'The code of my projects' : 'Le code de mes projets'}</i></span><Icon name="external" size={15} className="ic-end" />
        </a>
        <a className="link-card" href={`mailto:${SITE.email}`}>
          <Icon name="mail" /><span><b>{SITE.email}</b><i>{en ? 'Usually a reply within 48 hours' : 'Réponse sous 48 h en général'}</i></span>
        </a>
      </div>
    </>
  );
}

/* ======================================================================= */
/*  Mentions légales                                                       */
/* ======================================================================= */

export function LegalWin({ lang }: Ctx) {
  const [tab, setTab] = useState<'legal' | 'privacy' | 'credits'>('legal');
  const en = lang === 'en';
  const tabs = [
    ['legal', en ? 'Legal notice' : 'Mentions légales'],
    ['privacy', en ? 'Privacy' : 'Confidentialité'],
    ['credits', en ? 'Credits' : 'Crédits'],
  ] as const;

  return (
    <>
      <div className="tabbar" role="tablist">
        {tabs.map(([k, label]) => (
          <button key={k} role="tab" aria-selected={tab === k} className={`tab${tab === k ? ' is-on' : ''}`} onClick={() => setTab(k)}>{label}</button>
        ))}
      </div>
      <div className="legal" role="tabpanel">
        <LegalContent tab={tab} lang={lang} />
      </div>
    </>
  );
}

export function LegalContent({ tab, lang }: { tab: 'legal' | 'privacy' | 'credits'; lang: Lang }) {
  const en = lang === 'en';
  const mail = <a href={`mailto:${SITE.email}`}>{SITE.email}</a>;

  if (tab === 'legal') return (
    <>
      <h3 className="h3">{en ? 'Publisher' : 'Éditeur du site'}</h3>
      <p>{en
        ? <>This site is published in a personal, non-commercial capacity by <b>Evan Pouteau</b>, student, reachable at {mail}. Publication director: Evan Pouteau.</>
        : <>Ce site est édité à titre personnel et non commercial par <b>Evan Pouteau</b>, étudiant, joignable à l’adresse {mail}. Directeur de la publication : Evan Pouteau.</>}</p>
      <p className="note">{en
        ? 'Under article 6 III-2 of French law no. 2004-575 of 21 June 2004, a natural person publishing in a non-professional capacity is not required to display a postal address: it is held by the host, who may disclose it to the judicial authority.'
        : 'Conformément à l’article 6 III-2 de la loi n° 2004-575 du 21 juin 2004 pour la confiance dans l’économie numérique, l’éditeur, personne physique éditant à titre non professionnel, ne publie pas son adresse postale : celle-ci est détenue par l’hébergeur, qui peut la communiquer à l’autorité judiciaire.'}</p>
      <h3 className="h3">{en ? 'Host' : 'Hébergeur'}</h3>
      <p><b>Vercel Inc.</b> — 440 N Barranca Ave #4133, Covina, CA 91723, {en ? 'United States' : 'États-Unis'}. <a href="https://vercel.com" target="_blank" rel="noopener">vercel.com</a></p>
      <h3 className="h3">{en ? 'Intellectual property' : 'Propriété intellectuelle'}</h3>
      <p>{en
        ? 'The code, text and visuals on this site are the work of Evan Pouteau unless stated otherwise in the Credits tab. Projects produced as coursework are shown for educational purposes; team projects are labelled as such. Reproduction without permission is prohibited.'
        : 'Le code, les textes et les visuels de ce site sont l’œuvre d’Evan Pouteau, sauf mention contraire dans l’onglet Crédits. Les projets réalisés dans le cadre universitaire sont présentés à titre pédagogique ; les travaux d’équipe sont signalés comme tels. Toute reproduction sans autorisation est interdite.'}</p>
      <h3 className="h3">{en ? 'Liability' : 'Responsabilité'}</h3>
      <p>{en
        ? 'Outbound links point to sites whose content I do not control and for which I cannot be held responsible.'
        : 'Les liens sortants pointent vers des sites dont je ne maîtrise pas le contenu et dont je ne saurais être tenu responsable.'}</p>
    </>
  );

  if (tab === 'privacy') return (
    <>
      <h3 className="h3">{en ? 'No data collected' : 'Aucune donnée collectée'}</h3>
      <p>{en
        ? <>This site sets <b>no cookies</b>, uses <b>no analytics</b> and contains <b>no form that sends data to a server</b>. The contact form simply opens your own mail client with a pre-filled message.</>
        : <>Ce site ne dépose <b>aucun cookie</b>, n’utilise <b>aucun outil de mesure d’audience</b> et ne comporte <b>aucun formulaire transmettant des données à un serveur</b>. Le formulaire de contact se contente d’ouvrir votre propre logiciel de messagerie avec un message pré-rempli.</>}</p>
      <h3 className="h3">{en ? 'Local storage' : 'Stockage local'}</h3>
      <p>{en
        ? <>Your display preferences (theme, language, sounds, accent colour, 3D windows, window positions) are saved in your browser’s <code>localStorage</code>. Whether you have already seen the 3D intro is kept in <code>sessionStorage</code> and forgotten when the tab closes. None of this ever leaves your device.</>
        : <>Vos préférences d’affichage (thème, langue, sons, couleur d’accent, fenêtres 3D, position des fenêtres) sont enregistrées dans le <code>localStorage</code> de votre navigateur. Le fait d’avoir déjà vu l’intro 3D est conservé dans le <code>sessionStorage</code> et oublié à la fermeture de l’onglet. Rien de tout cela ne quitte votre appareil.</>}</p>
      <h3 className="h3">{en ? 'Third parties' : 'Services tiers'}</h3>
      <p>{en
        ? 'Fonts are bundled with the site at build time: browsing the portfolio makes no request to Google or to any font service. One exception: the standalone “Gestural experiment” page loads its hand-tracking library and its fonts from jsDelivr, unpkg and Google Fonts, which therefore receive your IP address when you open it. Hosting is provided by Vercel, which keeps technical connection logs.'
        : 'Les polices sont intégrées au site lors de sa construction : parcourir le portfolio n’envoie aucune requête à Google ni à un service de polices. Une exception : la page autonome « Expérience gestuelle » charge sa bibliothèque de suivi de la main et ses polices depuis jsDelivr, unpkg et Google Fonts, qui reçoivent donc votre adresse IP lorsque vous l’ouvrez. L’hébergement est assuré par Vercel, qui conserve des journaux techniques de connexion.'}</p>
      <h3 className="h3">{en ? 'Your rights' : 'Vos droits'}</h3>
      <p>{en
        ? <>As no personal data is collected, there is no processing to access, rectify or erase. For any question, write to {mail}.</>
        : <>Aucune donnée personnelle n’étant collectée, il n’y a pas de traitement à consulter, rectifier ou supprimer. Pour toute question, écrivez à {mail}.</>}</p>
    </>
  );

  return (
    <>
      <h3 className="h3">{en ? 'Design and development' : 'Conception et développement'}</h3>
      <p>{en
        ? 'Interface, 3D scene, code and content: Evan Pouteau. Built with Next.js and React Three Fiber; every piece of furniture in the 3D scene is generated from code, with no imported model.'
        : 'Interface, scène 3D, code et contenus : Evan Pouteau. Construit avec Next.js et React Three Fiber ; tout le mobilier de la scène 3D est généré par du code, sans modèle importé.'}</p>
      <h3 className="h3">{en ? 'Open-source software' : 'Logiciels libres'}</h3>
      <ul className="ul">
        <li><b>Next.js</b>, <b>React</b>, <b>Three.js</b>, <b>React Three Fiber</b> {en ? 'and' : 'et'} <b>drei</b> — {en ? 'MIT licence' : 'licence MIT'}.</li>
        <li>{en ? 'Typefaces' : 'Polices'} <b>Inter</b> {en ? 'and' : 'et'} <b>Cascadia Code</b> — SIL Open Font License.</li>
        <li>{en ? 'The “Gestural experiment” project uses' : 'Le projet « Expérience gestuelle » utilise'} <b>MediaPipe</b> (Google, Apache 2.0).</li>
        <li>{en
          ? 'Icons drawn for this site, inspired by Microsoft’s Fluent visual language. This portfolio is neither affiliated with nor endorsed by Microsoft; the desktop metaphor is a homage.'
          : 'Icônes dessinées pour ce site, inspirées du langage visuel Fluent de Microsoft. Ce portfolio n’est ni affilié à Microsoft ni approuvé par elle ; la métaphore du bureau est un hommage.'}</li>
      </ul>
      <h3 className="h3">{en ? 'Accessibility' : 'Accessibilité'}</h3>
      <p>{en
        ? <>Full keyboard navigation, visible focus, labelled dialogs, and respect for <code>prefers-reduced-motion</code>: the 3D intro is not even loaded when your system asks for less motion. Every project also exists as a plain page, readable without WebGL.</>
        : <>Navigation clavier complète, focus visible, dialogues étiquetés et respect de <code>prefers-reduced-motion</code> : l’intro 3D n’est même pas chargée si votre système demande moins d’animations. Chaque projet existe aussi comme page classique, lisible sans WebGL.</>}</p>
    </>
  );
}

/* ======================================================================= */
/*  Visionneuse                                                            */
/* ======================================================================= */

export function ViewerWin({ payload, lang = 'fr' }: { payload?: ViewerPayload; lang?: Lang }) {
  if (!payload) return null;
  const en = lang === 'en';
  return (
    <div className="viewer">
      <div className="viewer-bar">
        <span>{payload.name}</span>
        <div>
          <a className="btn btn-xs" href={payload.src} target="_blank" rel="noopener"><Icon name="external" size={15} />{en ? 'Open in a tab' : 'Ouvrir dans un onglet'}</a>
          <a className="btn btn-primary btn-xs" href={payload.src} download><Icon name="download" size={15} />{en ? 'Download' : 'Télécharger'}</a>
        </div>
      </div>
      {payload.kind === 'image'
        ? <img src={payload.src} alt={payload.name} />
        : <iframe src={payload.src} title={payload.name} />}
    </div>
  );
}
