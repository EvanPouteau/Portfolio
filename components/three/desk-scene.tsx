'use client';

/* La scène d'accueil : un bureau vu de loin, une étagère de projets, et un écran
   que la caméra traverse pour entrer dans l'OS. */

import { Suspense, useEffect, useMemo, useRef, useState, type MutableRefObject } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, useProgress } from '@react-three/drei';
import { AdaptiveQuality, startDpr } from './quality';
import { StudioEnv } from './studio-env';
import { Warmup, useWarmup } from './warmup';
import * as THREE from 'three';
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js';
import { Desk, DeskMat, Keyboard, Mouse, Mug, Lamp, Plant, Notebook, Room } from './desk-parts';
import { Monstera } from './cozy';
import { CodeMonitor, Laptop, PcTower, RubberDuck, Headphones, Bookcase } from './dev-setup';
import { Monitor, SCREEN } from './monitor';
import { ProjectShelf, SHELF_X, SHELF_Y, SHELF_Z } from './project-shelf';
import { LabelProjector, useLabelRegistry, type Anchor } from './projected-labels';
import type { Project } from '@/content/projects';

/* Sans cette initialisation, les rectAreaLight n'éclairent rien. */
let rectInit = false;
function ensureRectLights() {
  if (!rectInit) { RectAreaLightUniformsLib.init(); rectInit = true; }
}

const START_POS = new THREE.Vector3(0, 1.72, 3.1);
const START_LOOK = new THREE.Vector3(0, 1.22, -0.3);
/* Point d'arrivée : juste devant la dalle, cadrée plein champ. */
const END_POS = new THREE.Vector3(SCREEN.center.x, SCREEN.center.y, SCREEN.center.z + 0.52);
const END_LOOK = SCREEN.center.clone();

export type SceneMode = 'idle' | 'enter' | 'exit';

/* Ombres figées. Rien ne bouge vraiment dans la pièce : recalculer les
   ombres à chaque image (dont six rendus pour la lampe, une lumière
   ponctuelle) coûtait la moitié du temps de rendu. Tout est chargé et posé
   avant la première image (voir warmup.tsx) : trois images suffisent, puis
   on fige. Seule conséquence : l'ombre d'un cadre survolé ne le suit pas. */
function StaticShadows() {
  const gl = useThree((s) => s.gl);
  const frames = useRef(0);
  useEffect(() => {
    gl.shadowMap.autoUpdate = false;
    gl.shadowMap.needsUpdate = true;
    return () => { gl.shadowMap.autoUpdate = true; };
  }, [gl]);
  useFrame(() => {
    if (frames.current < 3) { gl.shadowMap.needsUpdate = true; frames.current++; }
  });
  return null;
}

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function CameraRig({
  mode,
  onProgress,
  onDone,
}: {
  mode: SceneMode;
  onProgress: (t: number) => void;
  onDone: (mode: SceneMode) => void;
}) {
  const { camera } = useThree();
  const t = useRef(mode === 'exit' ? 1 : 0);
  const look = useRef(START_LOOK.clone());
  const doneFor = useRef<SceneMode | null>(null);

  useEffect(() => { doneFor.current = null; }, [mode]);

  useFrame((_, dt) => {
    const DURATION = 1.55;
    if (mode === 'enter') t.current = Math.min(1, t.current + dt / DURATION);
    else if (mode === 'exit') t.current = Math.max(0, t.current - dt / DURATION);

    const k = ease(t.current);

    /* Caméra fixe au repos : elle ne suit pas le pointeur. */
    camera.position.lerpVectors(START_POS, END_POS, k);
    look.current.lerpVectors(START_LOOK, END_LOOK, k);
    camera.lookAt(look.current);

    /* Au repos, on garde un champ HORIZONTAL constant (~63°) : sur un écran
       étroit la caméra s'ouvre verticalement au lieu de rogner les étagères. */
    const cam = camera as THREE.PerspectiveCamera;
    const H_FOV = 63 * THREE.MathUtils.DEG2RAD;
    const idleFov = THREE.MathUtils.clamp(
      2 * Math.atan(Math.tan(H_FOV / 2) / cam.aspect) * THREE.MathUtils.RAD2DEG, 38, 90);
    const fov = THREE.MathUtils.lerp(idleFov, 62, k);
    if (Math.abs(cam.fov - fov) > 0.01) { cam.fov = fov; cam.updateProjectionMatrix(); }

    onProgress(k);

    const finished = (mode === 'enter' && t.current >= 1) || (mode === 'exit' && t.current <= 0);
    if (finished && doneFor.current !== mode) {
      doneFor.current = mode;
      onDone(mode);
    }
  });

  return null;
}

function Scene({
  mode,
  accent,
  projects,
  onEnterRequest,
  onOpenProject,
  onProgress,
  onDone,
  onHover,
  hoverObj,
  anchors,
  registry,
  warm,
}: Props & {
  warm: ReturnType<typeof useWarmup>;
  onHover: (slug: string | null) => void;
  hoverObj: MutableRefObject<THREE.Object3D | null>;
  anchors: MutableRefObject<Anchor[]>;
  registry: MutableRefObject<Map<string, HTMLElement>>;
}) {
  const [screenHover, setScreenHover] = useState(false);
  ensureRectLights();

  return (
    <>
      <color attach="background" args={['#17100c']} />
      <fog attach="fog" args={['#17100c', 5, 10]} />

      {/* Reflets : uniquement des sources chaudes, comme une pièce éclairée
          à la lampe en fin de journée. */}
      <StudioEnv background="#120c09" {...warm.env} panels={[
        { color: '#ffcf9e', intensity: 1.3, position: [-3, 2.5, 2], scale: [2.5, 1.2], target: [0, 1, 0] },
        { color: '#ffd8b8', intensity: 0.7, position: [3, 2.2, 1.5], scale: [2, 1], target: [0, 1, 0] },
        { color: '#fff1e2', intensity: 0.4, position: [0, 4, 0], scale: [4, 4], target: [0, 0, 0] },
        { color: accent, intensity: 1.4, position: [0, 1.3, -1], scale: [1.2, 1.2], target: [0, 1.3, 2], circle: true },
      ]} />

      {/* Lumière tamisée, sans source froide. Pas de lumière décorative :
          le plafonnier, la lampe de bureau, et les écrans. */}
      <hemisphereLight args={['#ffd9b5', '#2b1a10', 0.26]} />
      <ambientLight intensity={0.06} />
      <pointLight position={[0, 2.6, -0.65]} intensity={1.35} distance={3.8} decay={1.8} color="#ffcf9a" />
      <pointLight position={[-0.89, 1.12, -0.24]} intensity={2.3} distance={2.8} decay={2} color="#ffb06a" castShadow shadow-mapSize={[1024, 1024]} shadow-bias={-0.0004} />
      <directionalLight position={[2.2, 3, 2]} intensity={0.32} color="#ffe0c2" castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-0.0003}
        shadow-camera-left={-3} shadow-camera-right={3} shadow-camera-top={3} shadow-camera-bottom={-1} />

      <Monstera position={[1.78, 0, -0.62]} scale={1.15} />
      <Bookcase position={[-1.98, 0, -1.18]}>
        <Plant position={[0.18, 0, 0]} />
      </Bookcase>
      <PcTower position={[-1.5, 0, -0.2]} yaw={0.2} />

      <Room accent={accent} />
      <Desk />
      <DeskMat />
      <Monitor
        accent={accent}
        hovered={screenHover && mode === 'idle'}
        pulse={mode === 'idle'}
        onHover={setScreenHover}
        onClick={() => mode === 'idle' && onEnterRequest()}
      />
      <Keyboard />
      <Mouse />
      <Mug accent={accent} />
      <Lamp />
      <CodeMonitor position={[0.92, 0.765, -0.24]} yaw={-0.5} />
      <Laptop position={[-0.74, 0.765, -0.14]} yaw={0.45} />
      <RubberDuck position={[-0.5, 0.765, 0.22]} yaw={0.5} />
      <Headphones position={[1.08, 0.765, 0.3]} yaw={-0.35} />
      <Notebook accent={accent} />
      <ProjectShelf projects={projects} onOpen={onOpenProject} onHover={onHover} hoverObj={hoverObj} disabled={mode !== 'idle'} />
      <LabelProjector anchors={anchors} registry={registry} />

      {/* Ombres de contact calculées sur deux images puis figées : chacune
          redessinait toute la pièce à chaque image, pour une pièce immobile. */}
      <ContactShadows frames={2} position={[0, 0.012, 0]} opacity={0.55} scale={7} blur={2.4} far={1.4} />
      <ContactShadows frames={2} position={[0, 0.7716, 0]} opacity={0.5} scale={[2.6, 1.2]} blur={1.6} far={0.3} resolution={512} />

      <StaticShadows />
      <CameraRig mode={mode} onProgress={onProgress} onDone={onDone} />
      {/* en dernier : tous les objets sont posés quand il compile */}
      <Warmup {...warm.warmup} />
    </>
  );
}

type Props = {
  mode: SceneMode;
  accent: string;
  projects: Project[];
  lang: 'fr' | 'en';
  onEnterRequest: () => void;
  onOpenProject: (slug: string) => void;
  onProgress: (t: number) => void;
  onDone: (mode: SceneMode) => void;
  /** Avancement du chargement, de 0 à 1 (1 = la pièce est visible). */
  onLoad?: (p: number) => void;
};

/* Flèche dessinée à la main, pointée vers le bas. */
function HandArrow({ flip = false }: { flip?: boolean }) {
  return (
    <svg className="note-arrow" width="34" height="44" viewBox="0 0 34 44" aria-hidden="true" style={flip ? { transform: 'scaleX(-1)' } : undefined}>
      <path d="M8 3c9 6 14 15 13 34" />
      <path d="M13 31l8 8 6-10" />
    </svg>
  );
}

const NOTE_STYLE = { position: 'absolute', left: 0, top: 0, visibility: 'hidden' } as const;

export default function DeskScene(props: Props) {
  const [hoverSlug, setHoverSlug] = useState<string | null>(null);
  const hoverObj = useRef<THREE.Object3D | null>(null);
  const registry = useLabelRegistry();
  const tmp = useMemo(() => new THREE.Vector3(), []);
  /* Pendant la plongée, l'étiquette disparaît : le pointeur n'a pas bougé,
     mais l'objet survolé, lui, sort du cadre. */
  const modeRef = useRef(props.mode);
  modeRef.current = props.mode;

  /* L'étiquette du cadre survolé, et les annotations manuscrites qui disent
     quoi faire : « cliquez sur l'écran », « mes projets ». Elles s'effacent
     dès que la caméra plonge. */
  const idle = (p: THREE.Vector3) => (modeRef.current === 'idle' ? p : null);
  /* Écran en portrait, ou trop bas (téléphone en paysage) : le titre occupe
     le haut, l'annotation de l'écran passe dessous. */
  const portrait = (cam: THREE.Camera) => (cam as THREE.PerspectiveCamera).aspect < 0.8 || innerHeight < 520;
  const anchors = useRef<Anchor[]>([
    {
      id: 'shelf',
      point: () => {
        const o = hoverObj.current;
        if (!o || modeRef.current !== 'idle') return null;
        o.getWorldPosition(tmp);
        return tmp.setY(tmp.y + 0.36);
      },
    },
    /* Au-dessus de l'écran ; sur téléphone, en dessous : au-dessus, elle
       chevauchait les cadres des étagères ou le titre. */
    { id: 'note-screen', point: (cam) => (portrait(cam) ? null : idle(new THREE.Vector3(SCREEN.center.x, SCREEN.center.y + SCREEN.height / 2 + 0.035, SCREEN.center.z))) },
    { id: 'note-screen-below', align: 'below', point: (cam) => (portrait(cam) ? idle(new THREE.Vector3(SCREEN.center.x, SCREEN.center.y - SCREEN.height / 2 - 0.02, SCREEN.center.z)) : null) },
    { id: 'note-shelf-l', point: () => idle(new THREE.Vector3(-SHELF_X, SHELF_Y + 0.36, SHELF_Z)) },
    { id: 'note-shelf-r', point: () => idle(new THREE.Vector3(SHELF_X, SHELF_Y + 0.36, SHELF_Z)) },
  ]);
  const reg = (id: string) => (el: HTMLElement | null) => {
    if (el) registry.current.set(id, el); else registry.current.delete(id);
  };
  const en = props.lang === 'en';

  const hovered = props.projects.find((p) => p.slug === hoverSlug);

  /* Tant que les shaders compilent, rien n'est dessiné : la pièce apparaît
     en fondu une fois prête. Un clic sur « Entrer » pendant ce temps entre
     directement, sans attendre la plongée de la caméra. (Le retour depuis
     l'OS, lui, attend : l'OS reste visible jusqu'à ce que la pièce soit prête.) */
  const warm = useWarmup();
  const { live } = warm;
  const [dpr, setDpr] = useState(startDpr);
  const { mode, onDone, onLoad } = props;

  /* Pour l'écran de chargement : images (jusqu'à 80 %), puis compilation. */
  const { progress } = useProgress();
  useEffect(() => {
    onLoad?.(live ? 1 : warm.mounted ? 0.85 : 0.35 + 0.45 * (progress / 100));
  }, [live, warm.mounted, progress, onLoad]);
  useEffect(() => {
    if (!live && mode === 'enter') onDone('enter');
  }, [live, mode, onDone]);

  return (
    <>
      <Canvas
        shadows="percentage"
        frameloop={live ? 'always' : 'never'}
        style={{ opacity: live ? 1 : 0, transition: 'opacity .7s ease' }}
        dpr={dpr}
        camera={{ position: START_POS.toArray(), fov: 38, near: 0.05, far: 30 }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        onCreated={({ gl, scene }) => {
          /* ?debug3d expose la scène dans la console, pour mesurer son poids */
          if (location.search.includes('debug3d')) (window as unknown as { __scene: unknown }).__scene = scene;
          /* En production, ne pas relire le journal de chaque shader : cette
             lecture attend la fin de la compilation et bloque la page. */
          gl.debug.checkShaderErrors = process.env.NODE_ENV !== 'production';
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.05;
        }}
      >
        <AdaptiveQuality onChange={setDpr} />
        <Suspense fallback={null}>
          <Scene {...props} warm={warm} onHover={setHoverSlug} hoverObj={hoverObj} anchors={anchors} registry={registry} />
        </Suspense>
      </Canvas>
      <div
        ref={(el) => { if (el) registry.current.set('shelf', el); else registry.current.delete('shelf'); }}
        className={`shelf-label${hovered ? ' is-on' : ''}`}
        aria-hidden="true"
        style={{ position: 'absolute', left: 0, top: 0, visibility: 'hidden' }}
      >
        {hovered && (
          <>
            <b>{hovered.name[props.lang]}</b>
            <span>{hovered.type[props.lang]} · {hovered.year}</span>
          </>
        )}
      </div>

      <div ref={reg('note-screen')} className="scene-note note-screen" aria-hidden="true" style={NOTE_STYLE}>
        <span className="note-text">
          <span className="hint-fine">{en ? 'Click the screen to enter' : 'Cliquez sur l’écran pour entrer'}</span>
          <span className="hint-touch">{en ? 'Tap the screen to enter' : 'Touchez l’écran pour entrer'}</span>
        </span>
        <HandArrow />
      </div>
      <div ref={reg('note-screen-below')} className="scene-note note-screen is-below" aria-hidden="true" style={NOTE_STYLE}>
        <HandArrow />
        <span className="note-text">
          <span className="hint-fine">{en ? 'Click the screen to enter' : 'Cliquez sur l’écran pour entrer'}</span>
          <span className="hint-touch">{en ? 'Tap the screen to enter' : 'Touchez l’écran pour entrer'}</span>
        </span>
      </div>
      {(['l', 'r'] as const).map((side) => (
        <div key={side} ref={reg(`note-shelf-${side}`)} className={`scene-note note-shelf${hovered ? ' is-dim' : ''}`} aria-hidden="true" style={NOTE_STYLE}>
          <span className="note-title">{en ? 'My projects' : 'Mes projets'}</span>
          <span className="note-sub">
            {side === 'l'
              ? (en ? 'hover a frame to preview it' : 'survolez un cadre pour le découvrir')
              : (en ? 'click it to open the project' : 'cliquez pour ouvrir le projet')}
          </span>
          <HandArrow flip={side === 'r'} />
        </div>
      ))}
    </>
  );
}
