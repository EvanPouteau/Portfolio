'use client';
import './os.css';

/* Le bureau : icônes, couche de fenêtres en relief, barre des tâches,
   menu Démarrer, paramètres rapides et notifications. */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Icon, type IconName } from './icons';
import { WindowManager, Window, useWM, useIsMobile, TASKBAR } from './wm';
import { ACCENTS, resetPrefs, usePrefs } from './prefs';
import { PROJECTS, bySlug, type L } from '@/content/projects';
import { SITE } from '@/content/site';
import { AboutWin, AppsWin, ContactWin, LegalWin, ProjectsWin, ProjectWin, ViewerWin, type ViewerPayload } from './windows';
import { TerminalWin } from './terminal';
import { GalleryWin } from './gallery-win';
import { sfx } from './sfx';
import { WelcomeWin, Widgets, cvPayload } from './welcome';

/* -------------------------------------------------------- registre des fenêtres */

type Def = { title: L; icon: IconName; size: { w: number; h: number }; body?: string };

const DEFS: Record<string, Def> = {
  welcome: { title: { fr: 'Bienvenue', en: 'Welcome' }, icon: 'hand', size: { w: 720, h: 640 } },
  about: { title: { fr: 'À propos de moi', en: 'About me' }, icon: 'user', size: { w: 760, h: 620 } },
  apps: { title: { fr: 'Mes applications', en: 'My apps' }, icon: 'apps', size: { w: 1000, h: 680 } },
  projects: { title: { fr: 'Tous mes projets', en: 'All my projects' }, icon: 'folder', size: { w: 1000, h: 640 }, body: 'p-0' },
  gallery: { title: { fr: 'Mes projets en 3D', en: 'My projects in 3D' }, icon: 'cube', size: { w: 1080, h: 700 }, body: 'p-0' },
  terminal: { title: { fr: 'Terminal', en: 'Terminal' }, icon: 'terminal', size: { w: 700, h: 520 }, body: 'term-body' },
  contact: { title: { fr: 'Me contacter', en: 'Contact me' }, icon: 'mail', size: { w: 640, h: 600 } },
  legal: { title: { fr: 'Mentions légales', en: 'Legal notice' }, icon: 'scale', size: { w: 780, h: 620 }, body: 'p-0' },
  viewer: { title: { fr: 'Visionneuse', en: 'Viewer' }, icon: 'file', size: { w: 900, h: 680 }, body: 'p-0' },
};

/* Icônes du bureau, dans l'ordre où un visiteur en a besoin. Chaque icône a
   une phrase d'explication, affichée au survol. */
type Desk = { id: string; icon: IconName; label: L; hint: L; accent?: boolean };
const DESKTOP: Desk[] = [
  { id: 'welcome', icon: 'hand', label: { fr: 'Bienvenue', en: 'Welcome' }, hint: { fr: 'Le mode d’emploi du site', en: 'How this site works' } },
  { id: 'gallery', icon: 'cube', label: { fr: 'Mes projets en 3D', en: 'My projects in 3D' }, hint: { fr: 'Feuilleter mes projets un par un', en: 'Browse my projects one by one' }, accent: true },
  { id: 'about', icon: 'user', label: { fr: 'À propos de moi', en: 'About me' }, hint: { fr: 'Mon parcours, mes études, mes expériences', en: 'My background, studies and experience' } },
  { id: 'cv', icon: 'file', label: { fr: 'Mon CV', en: 'My CV' }, hint: { fr: 'Lire ou télécharger mon CV', en: 'Read or download my CV' } },
  { id: 'apps', icon: 'apps', label: { fr: 'Mes applications', en: 'My apps' }, hint: { fr: 'Les deux applications que j’ai mises en ligne', en: 'The two apps I have shipped' } },
  { id: 'projects', icon: 'folder', label: { fr: 'Tous mes projets', en: 'All my projects' }, hint: { fr: 'La liste complète, avec une recherche', en: 'The full list, searchable' } },
  { id: 'contact', icon: 'mail', label: { fr: 'Me contacter', en: 'Contact me' }, hint: { fr: 'M’écrire un message', en: 'Write me a message' } },
];
/* Le terminal est un clin d'œil pour les développeurs : on le range à part. */
const DEV_CORNER: Desk = { id: 'terminal', icon: 'terminal', label: { fr: 'Terminal (pour les devs)', en: 'Terminal (for devs)' }, hint: { fr: 'Des commandes à taper, pour les curieux', en: 'Commands to type, for the curious' } };

/* ------------------------------------------------------------------ racine */

export function OS(props: { initialWindow?: string; onBackTo3D?: () => void }) {
  return (
    <WindowManager>
      <Desktop {...props} />
    </WindowManager>
  );
}

function Desktop({ initialWindow, onBackTo3D }: { initialWindow?: string; onBackTo3D?: () => void }) {
  const wm = useWM();
  const { prefs, setPrefs } = usePrefs();
  const lang = prefs.lang;
  const mobile = useIsMobile();
  const [panel, setPanel] = useState<'start' | 'quick' | null>(null);
  const layer = useRef<HTMLDivElement>(null);

  /* Ouvrir une fenêtre de premier niveau, une fiche projet ou la visionneuse. */
  const openWin = useCallback((id: string, payload?: unknown) => {
    if (id === 'cv') {
      /* Les navigateurs mobiles affichent mal un PDF dans une fenêtre : on
         l'ouvre directement, ils savent le présenter. */
      if (mobile) { window.open(SITE.cv[lang], '_blank', 'noopener'); return; }
      id = 'viewer';
      payload = cvPayload(lang);
    }
    const proj = id.startsWith('project:') ? bySlug(id.slice(8)) : null;
    const def = DEFS[id];
    wm.open(id, { size: proj ? { w: 820, h: 620 } : def?.size, payload });
    setPanel(null);
  }, [wm, mobile, lang]);

  const openViewer = useCallback((p: ViewerPayload) => openWin('viewer', p), [openWin]);

  /* Fenêtre demandée (projet cliqué sur l'étagère, galerie, lien profond) ;
     sinon, à chaque entrée dans l'écran, le guide de bienvenue. */
  useEffect(() => {
    if (initialWindow) { openWin(initialWindow); return; }
    const t = setTimeout(() => {
      sfx.toast();
      openWin('welcome');
    }, 450);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Inclinaison de toute la couche de fenêtres selon le pointeur. */
  useEffect(() => {
    if (!prefs.depth || mobile) {
      layer.current?.style.setProperty('--rx', '0deg');
      layer.current?.style.setProperty('--ry', '0deg');
      return;
    }
    let raf = 0, tx = 0, ty = 0, x = 0, y = 0;
    const onMove = (e: PointerEvent) => {
      tx = (e.clientX / innerWidth - 0.5) * 2;
      ty = (e.clientY / innerHeight - 0.5) * 2;
    };
    const loop = () => {
      x += (tx - x) * 0.06; y += (ty - y) * 0.06;
      layer.current?.style.setProperty('--ry', `${(x * 2.2).toFixed(3)}deg`);
      layer.current?.style.setProperty('--rx', `${(-y * 1.6).toFixed(3)}deg`);
      raf = requestAnimationFrame(loop);
    };
    addEventListener('pointermove', onMove, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => { removeEventListener('pointermove', onMove); cancelAnimationFrame(raf); };
  }, [prefs.depth, mobile]);

  /* Fermer les panneaux au clic extérieur ; touche Windows ou « ? » pour le menu. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = /^(INPUT|TEXTAREA)$/.test((document.activeElement as HTMLElement)?.tagName);
      if (e.key === 'Meta' || (e.key === '?' && !typing)) { e.preventDefault(); setPanel((p) => (p === 'start' ? null : 'start')); }
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, []);

  const ranks = useMemo(() => {
    const r: Record<string, number> = {};
    [...wm.order].reverse().forEach((id, i) => { r[id] = i; });
    return r;
  }, [wm.order]);

  const titleOf = (id: string) => {
    if (id.startsWith('project:')) return bySlug(id.slice(8))?.name[lang] ?? id;
    if (id === 'viewer') return (wm.wins.viewer?.payload as ViewerPayload | undefined)?.name ?? DEFS.viewer.title[lang];
    return DEFS[id]?.title[lang] ?? id;
  };
  const iconOf = (id: string): IconName => (id.startsWith('project:') ? 'folder' : DEFS[id]?.icon ?? 'folder');

  const render = (id: string) => {
    const ctx = { openWin, openViewer, lang };
    if (id.startsWith('project:')) return <ProjectWin slug={id.slice(8)} {...ctx} />;
    switch (id) {
      case 'welcome': return <WelcomeWin {...ctx} />;
      case 'about': return <AboutWin {...ctx} />;
      case 'apps': return <AppsWin {...ctx} />;
      case 'projects': return <ProjectsWin {...ctx} />;
      case 'gallery': return <GalleryWin {...ctx} />;
      case 'terminal': return <TerminalWin {...ctx} />;
      case 'contact': return <ContactWin {...ctx} />;
      case 'legal': return <LegalWin {...ctx} />;
      case 'viewer': return <ViewerWin payload={wm.wins.viewer?.payload as ViewerPayload} lang={lang} />;
      default: return null;
    }
  };

  const tasks = Object.values(wm.wins).sort((a, b) => a.id.localeCompare(b.id));

  return (
    <div className="os" onClick={() => setPanel(null)}>
      {/* barre d'état façon téléphone, sur mobile */}
      <div className="statusbar" aria-hidden="true">
        <Clock />
        <span className="sb-right"><Icon name="wifi" size={15} /><span className="sb-batt" /></span>
      </div>

      <main className="desktop" aria-label={lang === 'en' ? 'Desktop' : 'Bureau'}>
        <h1 className="sr-only">Evan Pouteau — portfolio</h1>
        {/* sur mobile, pas de barre des tâches : le retour est en tête du bureau */}
        {onBackTo3D && (
          <button className="m-back" onClick={onBackTo3D}>
            <Icon name="back" size={18} />{lang === 'en' ? 'Back to the 3D room' : 'Retour à la pièce 3D'}
          </button>
        )}
        <ul className="desktop-icons">
          {DESKTOP.map((d) => (
            <li key={d.id}>
              <DeskIcon d={d} lang={lang} onOpen={openWin} />
            </li>
          ))}
        </ul>
        <div className="dev-corner"><DeskIcon d={DEV_CORNER} lang={lang} onOpen={openWin} small /></div>
        <Widgets openWin={openWin} lang={lang} />
        <p className="desktop-hint">
          <Icon name="help" size={15} />
          {lang === 'en'
            ? 'Click an icon to open it. Your open windows wait in the bar at the bottom.'
            : 'Cliquez sur une icône pour l’ouvrir. Vos fenêtres ouvertes vous attendent dans la barre du bas.'}
        </p>
      </main>

      {/* couche de fenêtres, en perspective */}
      <div ref={layer} className={`win-layer${prefs.depth && !mobile ? ' is-3d' : ''}`} onClick={(e) => e.stopPropagation()}>
        {Object.keys(wm.wins).map((id) => (
          <Window
            key={id}
            id={id}
            title={titleOf(id)}
            icon={iconOf(id)}
            rank={ranks[id] ?? 0}
            depth={prefs.depth}
            bodyClass={id.startsWith('project:') ? 'case' : DEFS[id]?.body ?? ''}
          >
            {render(id)}
          </Window>
        ))}
      </div>

      {/* ---------------------------------------------------- menu Démarrer */}
      {panel === 'start' && (
        <div className="panel start-menu" role="dialog" aria-label={lang === 'en' ? 'Start menu' : 'Menu Démarrer'} onClick={(e) => e.stopPropagation()}>
          <StartMenu lang={lang} openWin={openWin} onBackTo3D={onBackTo3D} onShutdown={() => { wm.closeAll(); setPanel(null); onBackTo3D?.(); }} />
        </div>
      )}

      {/* ----------------------------------------------- paramètres rapides */}
      {panel === 'quick' && (
        <div className="panel quick" role="dialog" aria-label={lang === 'en' ? 'Quick settings' : 'Paramètres rapides'} onClick={(e) => e.stopPropagation()}>
          <div className="quick-row">
            <button className="quick-tile" aria-pressed={prefs.theme === 'dark'} onClick={() => setPrefs({ theme: prefs.theme === 'dark' ? 'light' : 'dark' })}>
              <Icon name={prefs.theme === 'dark' ? 'moon' : 'sun'} size={18} />
              <span>{prefs.theme === 'dark' ? (lang === 'en' ? 'Dark theme' : 'Thème sombre') : (lang === 'en' ? 'Light theme' : 'Thème clair')}</span>
            </button>
            <button className="quick-tile" aria-pressed={prefs.depth} onClick={() => setPrefs({ depth: !prefs.depth })}>
              <Icon name="layers" size={18} /><span>{lang === 'en' ? '3D windows' : 'Fenêtres 3D'}</span>
            </button>
            <button className="quick-tile" onClick={() => setPrefs({ lang: lang === 'fr' ? 'en' : 'fr' })}>
              <Icon name="globe" size={18} /><span>{lang === 'fr' ? 'English' : 'Français'}</span>
            </button>
            <button className="quick-tile" aria-pressed={prefs.sound} onClick={() => { const on = !prefs.sound; setPrefs({ sound: on }); if (on) sfx.test(); }}>
              <Icon name={prefs.sound ? 'volume' : 'mute'} size={18} /><span>{lang === 'en' ? 'Sounds' : 'Sons'}</span>
            </button>
          </div>
          <p className="panel-label">{lang === 'en' ? 'Accent colour' : 'Couleur d’accentuation'}</p>
          <div className="swatches" role="group">
            {ACCENTS.map(([hex, name]) => (
              <button key={hex} className="swatch" style={{ background: hex }} aria-label={name[lang]} title={name[lang]}
                aria-pressed={hex === prefs.accent} onClick={() => setPrefs({ accent: hex })} />
            ))}
          </div>
          <button className="quick-reset" onClick={() => { resetPrefs(); location.reload(); }}>
            <Icon name="reset" size={15} />{lang === 'en' ? 'Reset preferences' : 'Réinitialiser les préférences'}
          </button>
        </div>
      )}

      {/* ------------------------------------------------- barre des tâches */}
      <footer className="taskbar" style={{ height: TASKBAR }} onClick={(e) => e.stopPropagation()}>
        {onBackTo3D && (
          <div className="tb-left">
            <button className="tb-back" onClick={onBackTo3D} title={lang === 'en' ? 'Back to the 3D room' : 'Retour à la pièce 3D'}
              aria-label={lang === 'en' ? 'Back to the 3D room' : 'Retour à la pièce 3D'}>
              <Icon name="back" size={18} />
              <span className="tb-back-long">{lang === 'en' ? 'Back to the 3D room' : 'Retour à la pièce 3D'}</span>
              <span className="tb-back-short">{lang === 'en' ? '3D room' : 'Pièce 3D'}</span>
            </button>
          </div>
        )}
        <div className="tb-center">
          <button className="tb-start" aria-label={lang === 'en' ? 'Start menu' : 'Menu Démarrer'} aria-expanded={panel === 'start'}
            onClick={() => { sfx.click(); setPanel((p) => (p === 'start' ? null : 'start')); }}>
            <span className="winlogo"><i /><i /><i /><i /></span>
          </button>
          <button className="tb-help" onClick={() => openWin('welcome')} title={lang === 'en' ? 'Help: how this site works' : 'Aide : comment fonctionne ce site'}
            aria-label={lang === 'en' ? 'Help' : 'Aide'}>
            <Icon name="help" size={19} /><span>{lang === 'en' ? 'Help' : 'Aide'}</span>
          </button>
          <div className="tb-tasks">
            {tasks.map((w) => (
              <button key={w.id} className={`tb-task${wm.top === w.id && !w.min ? ' is-focus' : ''}`}
                title={titleOf(w.id)} onClick={() => wm.toggleTask(w.id)}>
                <Icon name={iconOf(w.id)} size={17} /><span>{titleOf(w.id)}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="tb-right">
          <button className="tb-tray" aria-label={lang === 'en' ? 'Quick settings' : 'Paramètres rapides'} aria-expanded={panel === 'quick'}
            onClick={() => setPanel((p) => (p === 'quick' ? null : 'quick'))}>
            <Icon name="wifi" size={17} /><Icon name={prefs.sound ? 'volume' : 'mute'} size={17} /><Icon name="settings" size={17} />
          </button>
          <button className="tb-clock" onClick={() => openWin('legal')} aria-label={lang === 'en' ? 'Legal notice' : 'Mentions légales'}>
            <Clock /><DateLabel lang={lang} />
          </button>
        </div>
      </footer>

      {/* barre d'accueil, sur mobile */}
      <div className="home-bar" aria-hidden="true"><button onClick={() => wm.closeAll()} /></div>
    </div>
  );
}

/* ------------------------------------------------------------ icône du bureau */

function DeskIcon({ d, lang, onOpen, small }: { d: Desk; lang: 'fr' | 'en'; onOpen: (id: string) => void; small?: boolean }) {
  return (
    <button
      className={`desktop-icon${small ? ' is-small' : ''}`}
      title={d.hint[lang]}
      aria-description={d.hint[lang]}
      onClick={(e) => { e.stopPropagation(); onOpen(d.id); }}
    >
      <span className={`ic-tile${d.accent ? ' accent' : ''}`}><Icon name={d.icon} size={small ? 20 : 25} /></span>
      <span className="ic-label">{d.label[lang]}</span>
    </button>
  );
}

/* ----------------------------------------------------------- menu Démarrer */

function StartMenu({ lang, openWin, onBackTo3D, onShutdown }: {
  lang: 'fr' | 'en';
  openWin: (id: string) => void;
  onBackTo3D?: () => void;
  onShutdown: () => void;
}) {
  const [q, setQ] = useState('');
  const apps: { id: string; icon: IconName; label: L }[] = [
    ...DESKTOP,
    DEV_CORNER,
    { id: 'legal', icon: 'scale', label: { fr: 'Mentions légales', en: 'Legal notice' } },
  ];
  const projects = PROJECTS.filter((p) => !q || p.name[lang].toLowerCase().includes(q.toLowerCase()));
  const shown = apps.filter((a) => !q || a.label[lang].toLowerCase().includes(q.toLowerCase()));

  return (
    <>
      <label className="search search-lg">
        <Icon name="search" size={15} />
        <input autoFocus type="search" value={q} onChange={(e) => setQ(e.target.value)}
          placeholder={lang === 'en' ? 'Search apps and projects' : 'Rechercher une application ou un projet'} />
      </label>
      <p className="panel-label">{lang === 'en' ? 'Pinned' : 'Épinglé'}</p>
      <div className="start-grid">
        {shown.map((a) => (
          <button key={a.id} className="start-app" onClick={() => openWin(a.id)}>
            <Icon name={a.icon} size={24} /><span>{a.label[lang]}</span>
          </button>
        ))}
      </div>
      {q && projects.length > 0 && (
        <>
          <p className="panel-label">{lang === 'en' ? 'Projects' : 'Projets'}</p>
          <div className="start-list">
            {projects.map((p) => (
              <button key={p.slug} onClick={() => openWin(`project:${p.slug}`)}>
                <span className="sl-dot" style={{ background: p.three.color }} />{p.name[lang]}<i>{p.type[lang]}</i>
              </button>
            ))}
          </div>
        </>
      )}
      <div className="start-foot">
        <div className="start-user"><img src="/assets/images/profil.webp?v=2" width={32} height={32} alt="" /><span>Evan Pouteau</span></div>
        <div className="start-foot-btns">
          {onBackTo3D && (
            <button className="iconbtn" onClick={onBackTo3D} title={lang === 'en' ? 'Back to the 3D desk' : 'Retour au bureau 3D'}
              aria-label={lang === 'en' ? 'Back to the 3D desk' : 'Retour au bureau 3D'}>
              <Icon name="cube" size={18} />
            </button>
          )}
          <a className="iconbtn" href={SITE.cv[lang]} download title={lang === 'en' ? 'Download CV' : 'Télécharger le CV'}
            aria-label={lang === 'en' ? 'Download CV' : 'Télécharger le CV'}>
            <Icon name="download" size={18} />
          </a>
          <button className="iconbtn" onClick={onShutdown} title={lang === 'en' ? 'Shut down' : 'Arrêter'}
            aria-label={lang === 'en' ? 'Shut down' : 'Arrêter'}>
            <Icon name="power" size={18} />
          </button>
        </div>
      </div>
    </>
  );
}

/* ------------------------------------------------------------- horloge */

function Clock() {
  const [t, setT] = useState('');
  useEffect(() => {
    const tick = () => setT(new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }));
    tick();
    const iv = setInterval(tick, 10000);
    return () => clearInterval(iv);
  }, []);
  return <span suppressHydrationWarning>{t}</span>;
}

function DateLabel({ lang }: { lang: 'fr' | 'en' }) {
  const [d, setD] = useState('');
  useEffect(() => { setD(new Date().toLocaleDateString(lang === 'en' ? 'en-GB' : 'fr-FR')); }, [lang]);
  return <span className="tb-date" suppressHydrationWarning>{d}</span>;
}
