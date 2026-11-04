'use client';

/* Fenêtre « Bienvenue » et widgets personnels du bureau.
   ---------------------------------------------------------------------------
   Pensés pour quelqu'un qui n'a jamais vu de portfolio en forme
   d'ordinateur : dire en deux phrases qui je suis, proposer quatre portes
   d'entrée évidentes, et expliquer les trois gestes à connaître. */

import { Icon, type IconName } from './icons';
import { SITE, GREETING, PITCH, NOW, STICKY_NOTE, AVAILABILITY } from '@/content/site';

type Lang = 'fr' | 'en';
type Go = (id: string) => void;

/** Les quatre portes d'entrée, réutilisées par la fenêtre et par le menu. */
export const DOORS: { id: string; icon: IconName; title: { fr: string; en: string }; sub: { fr: string; en: string } }[] = [
  { id: 'gallery', icon: 'cube', title: { fr: 'Voir mes projets', en: 'See my projects' }, sub: { fr: 'Feuilletez-les en 3D', en: 'Browse them in 3D' } },
  { id: 'about', icon: 'user', title: { fr: 'Qui je suis', en: 'Who I am' }, sub: { fr: 'Mon parcours, mes expériences', en: 'My background and experience' } },
  { id: 'cv', icon: 'file', title: { fr: 'Mon CV', en: 'My CV' }, sub: { fr: 'À lire ou à télécharger', en: 'To read or download' } },
  { id: 'contact', icon: 'mail', title: { fr: 'Me contacter', en: 'Contact me' }, sub: { fr: 'Je réponds sous 48 h', en: 'I reply within 48 hours' } },
];

export function WelcomeWin({ openWin, lang }: { openWin: Go; lang: Lang }) {
  const en = lang === 'en';
  /* Deux versions : sur téléphone, pas d'icônes « à gauche » ni de barre
     des tâches. La bonne s'affiche selon l'écran (classes .on-desk / .on-phone). */
  const steps: { icon: IconName; desk: string; phone: string }[] = [
    {
      icon: 'apps',
      desk: en ? 'Click an icon on the left to open a window.' : 'Cliquez sur une icône à gauche pour ouvrir une fenêtre.',
      phone: en ? 'Tap an icon to open a window.' : 'Touchez une icône pour ouvrir une fenêtre.',
    },
    {
      icon: 'reset',
      desk: en ? 'Close it with the cross ✕ in its top-right corner.' : 'Fermez-la avec la croix ✕ en haut à droite.',
      phone: en ? 'Close it with the cross ✕ in its top-right corner.' : 'Fermez-la avec la croix ✕ en haut à droite.',
    },
    {
      icon: 'layers',
      desk: en ? 'Find your open windows again in the bar at the bottom of the screen.' : 'Retrouvez vos fenêtres ouvertes dans la barre en bas de l’écran.',
      phone: en ? 'Tap the line at the bottom of the screen to close everything.' : 'Touchez le trait en bas de l’écran pour tout refermer.',
    },
  ];

  return (
    <div className="welcome">
      <header className="welcome-hero">
        <img src="/assets/images/profil.webp?v=2" width={84} height={84} alt="" className="welcome-avatar" />
        <div>
          <h2 className="welcome-hi"><Icon name="hand" size={26} />{GREETING[lang]}</h2>
          <p className="welcome-pitch">{PITCH[lang]}</p>
        </div>
      </header>

      <p className="welcome-how">
        {en
          ? 'This portfolio works like a computer. No need to know how to code: just click whatever interests you.'
          : 'Ce portfolio fonctionne comme un ordinateur. Pas besoin de savoir coder : cliquez simplement sur ce qui vous intéresse.'}
      </p>

      <h3 className="h3">{en ? 'Where to start?' : 'Par où commencer ?'}</h3>
      <div className="doors">
        {DOORS.map((d) => (
          <button key={d.id} className="door" onClick={() => openWin(d.id)}>
            <span className="door-ic"><Icon name={d.icon} size={22} /></span>
            <span className="door-txt"><b>{d.title[lang]}</b><i>{d.sub[lang]}</i></span>
            <Icon name="arrow" size={18} className="door-arrow" />
          </button>
        ))}
      </div>

      <h3 className="h3">{en ? 'How it works' : 'Comment ça marche'}</h3>
      <ol className="steps">
        {steps.map((s, i) => (
          <li key={i}><span className="step-n">{i + 1}</span><Icon name={s.icon} size={18} /><span className="on-desk">{s.desk}</span><span className="on-phone">{s.phone}</span></li>
        ))}
      </ol>

      <p className="welcome-foot">
        <Icon name="help" size={15} />
        {en
          ? 'You can reopen this guide at any time with the “Welcome” icon or the ? button at the bottom.'
          : 'Vous pouvez rouvrir ce guide à tout moment avec l’icône « Bienvenue » ou le bouton ? en bas.'}
      </p>
    </div>
  );
}

/* ---------------------------------------------------------------- widgets */

export function Widgets({ openWin, lang }: { openWin: Go; lang: Lang }) {
  const en = lang === 'en';
  return (
    <aside className="widgets" aria-label={en ? 'About me, at a glance' : 'En un coup d’œil'}>
      <section className="widget w-profile">
        <img src="/assets/images/profil.webp?v=2" width={64} height={64} alt={en ? 'Portrait of Evan Pouteau' : 'Portrait d’Evan Pouteau'} />
        <div>
          <b>Evan Pouteau</b>
          <span>{en ? 'BUT MMI student · Puy-en-Velay' : 'Étudiant en BUT MMI · Puy-en-Velay'}</span>
        </div>
        <p className="w-avail"><span className="dot" />{AVAILABILITY[lang]}</p>
        <div className="w-actions">
          <button className="btn btn-primary btn-xs" onClick={() => openWin('cv')}><Icon name="file" size={15} />{en ? 'My CV' : 'Mon CV'}</button>
          <button className="btn btn-xs" onClick={() => openWin('contact')}><Icon name="mail" size={15} />{en ? 'Contact' : 'Contact'}</button>
        </div>
      </section>

      <section className="widget w-now">
        <h3>{en ? 'Right now' : 'En ce moment'}</h3>
        <ul>
          {NOW.map((n, i) => <li key={i}><Icon name={n.icon} size={17} /><span>{n.text[lang]}</span></li>)}
        </ul>
      </section>

      <button className="sticky" onClick={() => openWin('welcome')} aria-label={en ? 'Note from Evan — open the welcome guide' : 'Mot d’Evan — ouvrir le guide de bienvenue'}>
        <span className="sticky-pin" aria-hidden="true" />
        <span className="sticky-text">{STICKY_NOTE[lang]}</span>
        <span className="sticky-sign">— Evan</span>
      </button>
    </aside>
  );
}

/** Le CV dans la bonne langue, pour la visionneuse. */
export const cvPayload = (lang: Lang) => ({
  kind: 'pdf' as const,
  src: SITE.cv[lang],
  name: lang === 'en' ? 'My CV' : 'Mon CV',
});
