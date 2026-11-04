'use client';

/* Terminal interactif : on tape vraiment des commandes, et elles pilotent le
   reste du bureau. */

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { PROJECTS } from '@/content/projects';
import { SITE, SKILLS } from '@/content/site';
import { setPrefs, usePrefs } from './prefs';

type Line = { id: number; node: ReactNode; cls?: string };
type Ctx = { openWin: (id: string) => void; lang: 'fr' | 'en' };

const Prompt = () => <span className="ps-prompt">PS <span className="ps-path">C:\Users\Evan&gt;</span></span>;
const K = ({ children }: { children: ReactNode }) => <span className="t-key">{children}</span>;
const D = ({ children }: { children: ReactNode }) => <span className="t-dim">{children}</span>;
const H = ({ children }: { children: ReactNode }) => <span className="t-head">{children}</span>;
const pad = (s: string, n: number) => s + '\u00a0'.repeat(Math.max(1, n - s.length));

export function TerminalWin({ openWin, lang }: Ctx) {
  const { prefs } = usePrefs();
  const [lines, setLines] = useState<Line[]>([]);
  const [value, setValue] = useState('');
  const hist = useRef<string[]>([]);
  const hIdx = useRef(-1);
  const id = useRef(0);
  const input = useRef<HTMLInputElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const en = lang === 'en';

  const push = (...nodes: (ReactNode | [ReactNode, string])[]) =>
    setLines((l) => [...l, ...nodes.map((n) => Array.isArray(n) && n.length === 2 && typeof n[1] === 'string'
      ? { id: id.current++, node: n[0], cls: n[1] }
      : { id: id.current++, node: n as ReactNode })]);

  const Link = ({ to, children }: { to: string; children: ReactNode }) =>
    <button className="t-a" onClick={() => openWin(to)}>{children}</button>;

  const CMDS: Record<string, { fr: string; en: string; run: (args: string[]) => void }> = {
    help: {
      fr: 'la liste des commandes', en: 'list the commands',
      run: () => {
        push(<H>{en ? 'AVAILABLE COMMANDS' : 'COMMANDES DISPONIBLES'}</H>);
        Object.entries(CMDS).filter(([k]) => !['ls', 'projects', 'sudo'].includes(k))
          .forEach(([k, c]) => push(<>{'  '}<K>{pad(k, 12)}</K><D>{en ? c.en : c.fr}</D></>));
        push('\u00a0', <D>{en ? 'Tab completes, ↑ ↓ browse history.' : 'Tab complète, ↑ ↓ parcourent l’historique.'}</D>);
      },
    },
    whoami: {
      fr: 'qui je suis, en trois lignes', en: 'who I am, in three lines',
      run: () => push(
        <K>Evan Pouteau</K>,
        en ? 'Second-year BUT MMI student (web development track), IUT Clermont Auvergne.'
           : 'Étudiant en 2ᵉ année de BUT MMI (parcours Développement), IUT Clermont Auvergne.',
        en ? 'Two Next.js + Supabase apps in production. Seeking a web development internship, starting in April.'
           : 'Deux applications Next.js + Supabase en production. Recherche un stage en développement web à partir d’avril.',
        '\u00a0',
        <Link to="about">{en ? 'Open the full profile →' : 'Ouvrir la fiche complète →'}</Link>,
      ),
    },
    skills: {
      fr: 'mes compétences techniques', en: 'my technical skills',
      run: () => SKILLS.forEach((g) => {
        push(<H>[{g.group[lang]}]</H>);
        g.rows.forEach((r) => push(<>{'  '}<K>{pad(r.k, 28)}</K><span className="t-val">=&gt; {r.v[lang]}</span></>));
        push('\u00a0');
      }),
    },
    projets: {
      fr: 'la liste de mes projets', en: 'list my projects',
      run: () => {
        push(<H>{en ? 'PROJECTS' : 'PROJETS'}</H>);
        PROJECTS.forEach((p) => push(<>{p.featured ? <span className="t-val">★ </span> : '  '}<K>{pad(p.slug, 22)}</K><D>{p.name[lang]} — {p.tagline[lang]}</D></>));
        push('\u00a0', <D>{en ? 'Type' : 'Tapez'} <K>open &lt;slug&gt;</K> {en ? 'to open one.' : 'pour en ouvrir un.'}</D>);
      },
    },
    open: {
      fr: 'ouvrir un projet : open muscu', en: 'open a project: open muscu',
      run: (args) => {
        const q = (args[0] || '').toLowerCase();
        /* On accepte un bout d'identifiant ou de nom, sans accents : « urbex »,
           « crozatier » ou « arabe » doivent suffire. */
        const norm = (t: string) => t.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
        const p = PROJECTS.find((x) => x.slug === q)
          ?? PROJECTS.find((x) => x.slug.startsWith(q))
          ?? PROJECTS.find((x) => x.slug.includes(q) || norm(x.name.fr).includes(norm(q)) || norm(x.name.en).includes(norm(q)));
        if (!q) return push([en ? 'Usage: open <slug>' : 'Usage : open <slug>', 't-err']);
        if (!p) return push([`${en ? 'Unknown project' : 'Projet inconnu'} : ${q}`, 't-err']);
        push(<D>{en ? 'Opening' : 'Ouverture de'} {p.name[lang]}…</D>);
        openWin(`project:${p.slug}`);
      },
    },
    galerie: {
      fr: 'ouvrir la galerie 3D', en: 'open the 3D gallery',
      run: () => { push(<D>{en ? 'Launching the 3D gallery…' : 'Lancement de la galerie 3D…'}</D>); openWin('gallery'); },
    },
    cv: {
      fr: 'télécharger mon CV', en: 'download my CV',
      run: () => {
        const href = SITE.cv[lang];
        push(<D>{en ? 'Downloading' : 'Téléchargement de'} {href.split('/').pop()}…</D>);
        const a = document.createElement('a'); a.href = href; a.download = ''; a.click();
      },
    },
    contact: {
      fr: 'comment me joindre', en: 'how to reach me',
      run: () => push(
        <>{'  '}<K>{pad('email', 10)}</K><span className="t-val">{SITE.email}</span></>,
        <>{'  '}<K>{pad('linkedin', 10)}</K><span className="t-val">in/evan-pouteau-06a9a7342</span></>,
        '\u00a0', <Link to="contact">{en ? 'Write a message →' : 'Écrire un message →'}</Link>,
      ),
    },
    theme: {
      fr: 'basculer clair / sombre', en: 'toggle light / dark',
      run: () => { setPrefs({ theme: prefs.theme === 'dark' ? 'light' : 'dark' }); push(<D>{en ? 'Theme switched.' : 'Thème basculé.'}</D>); },
    },
    lang: {
      fr: 'basculer français / anglais', en: 'toggle French / English',
      run: () => setPrefs({ lang: lang === 'fr' ? 'en' : 'fr' }),
    },
    clear: { fr: 'nettoyer l’écran', en: 'clear the screen', run: () => setLines([]) },
    sudo: {
      fr: '…', en: '…',
      run: () => push([en ? 'Evan is not in the sudoers file. This incident will be reported.' : 'Evan n’est pas dans le fichier sudoers. Cet incident sera signalé.', 't-err']),
    },
  };
  CMDS.ls = CMDS.projets;
  CMDS.projects = CMDS.projets;
  CMDS.gallery = CMDS.galerie;

  const run = (raw: string) => {
    const line = raw.trim();
    push(<><Prompt /> <span className="ps-cmd">{line}</span></>);
    if (!line) return;
    hist.current.unshift(line);
    hIdx.current = -1;
    const [name, ...args] = line.split(/\s+/);
    const cmd = CMDS[name.toLowerCase()];
    if (cmd) cmd.run(args);
    else push([`${name} : ${en ? 'command not found.' : 'commande introuvable.'}`, 't-err'], <D>{en ? 'Type' : 'Tapez'} <K>help</K>.</D>);
    push('\u00a0');
  };

  /* Message d'accueil, rejoué quand la langue change. */
  useEffect(() => {
    setLines([]);
    push(<D>Windows PowerShell — EvanOS build 2026.10</D>, '\u00a0', <><Prompt /> <span className="ps-cmd">.\whoami.ps1</span></>);
    CMDS.whoami.run([]);
    push('\u00a0', <D>{en ? 'Type' : 'Tapez'} <K>help</K> {en ? 'to see everything this terminal can do.' : 'pour voir tout ce que ce terminal sait faire.'}</D>, '\u00a0');
    input.current?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  useEffect(() => { body.current?.scrollTo({ top: body.current.scrollHeight }); }, [lines]);

  return (
    <div ref={body} className="term" onClick={() => { if (!getSelection()?.toString()) input.current?.focus(); }}>
      {lines.map((l) => <div key={l.id} className={`term-line ${l.cls ?? ''}`}>{l.node}</div>)}
      <label className="term-input-line">
        <Prompt />
        <input
          ref={input} className="term-input" value={value} autoComplete="off" spellCheck={false}
          aria-label={en ? 'Command prompt' : 'Invite de commande'}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            e.stopPropagation();
            if (e.key === 'Enter') { run(value); setValue(''); }
            else if (e.key === 'ArrowUp') { e.preventDefault(); if (hIdx.current < hist.current.length - 1) setValue(hist.current[++hIdx.current]); }
            else if (e.key === 'ArrowDown') { e.preventDefault(); if (hIdx.current > 0) setValue(hist.current[--hIdx.current]); else { hIdx.current = -1; setValue(''); } }
            else if (e.key === 'Tab') {
              e.preventDefault();
              const m = Object.keys(CMDS).filter((c) => c.startsWith(value.toLowerCase()));
              if (m.length === 1) setValue(m[0]);
              else if (m.length > 1) push(<D>{m.join('  ')}</D>);
            }
          }}
        />
      </label>
    </div>
  );
}
