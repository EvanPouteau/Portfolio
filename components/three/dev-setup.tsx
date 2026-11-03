'use client';

/* Le poste de dev : écran vertical plein de code, portable sur support avec
   un terminal ouvert, tour PC sous le bureau, casque, canard en plastique et
   bibliothèque. Aucune lumière décorative : seuls les écrans émettent, et
   uniquement par leur dalle (pas de lumière supplémentaire à calculer). */

import { useLayoutEffect, useMemo, useRef, type ReactNode } from 'react';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { roundedRect, walnut } from './materials';

/* Palette de l'éditeur, reprise des couleurs du site. */
const INK = '#15171c';
const TXT = '#e9dccd';
const KEYWORD = '#e8956b';
const STRING = '#9bb197';
const TAG = '#f2c14e';
const MUTED = '#7a6453';

/* --------------------------------------------------- textures d'écran */

type Run = [string, string];

/** Coloration minimale, ligne par ligne : commentaires, chaînes, balises JSX
 *  et mots-clés. Suffisant pour qu'on reconnaisse du code de loin. */
function highlight(line: string): Run[] {
  const comment = line.indexOf('//');
  if (comment >= 0) return [...highlight(line.slice(0, comment)), [line.slice(comment), MUTED]];
  const out: Run[] = [];
  const re = /('[^']*'|<\/?[A-Za-z.]+|\/?>|\b(?:export|default|function|const|return|import|from)\b)/g;
  let last = 0;
  for (const m of line.matchAll(re)) {
    if (m.index! > last) out.push([line.slice(last, m.index), TXT]);
    const t = m[0];
    out.push([t, t.startsWith("'") ? STRING : t.startsWith('<') || t.endsWith('>') ? TAG : KEYWORD]);
    last = m.index! + t.length;
  }
  if (last < line.length) out.push([line.slice(last), TXT]);
  return out;
}

/** Dessine des lignes colorées sur un fond d'éditeur. `gutter` ajoute les
 *  numéros de ligne. */
function screenTexture(w: number, h: number, lines: (string | Run[])[], { gutter = false, size = 15, header = '' } = {}) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const g = c.getContext('2d')!;
  g.fillStyle = INK; g.fillRect(0, 0, w, h);
  let y = 14;
  if (header) {
    g.fillStyle = '#1f1510'; g.fillRect(0, 0, w, 34);
    g.fillStyle = TXT; g.font = `600 ${size - 2}px ui-monospace, Consolas, monospace`;
    g.fillText(header, 14, 22);
    y = 50;
  }
  g.font = `${size}px ui-monospace, Consolas, monospace`;
  g.textBaseline = 'middle';
  const lh = size * 1.55;
  lines.forEach((line, i) => {
    let x = 14;
    if (gutter) {
      g.fillStyle = MUTED;
      g.fillText(String(i + 1).padStart(2, ' '), x, y + lh / 2);
      x += size * 2.2;
    }
    for (const [text, color] of typeof line === 'string' ? highlight(line) : line) {
      g.fillStyle = color;
      g.fillText(text, x, y + lh / 2);
      x += g.measureText(text).width;
    }
    y += lh;
  });
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

const CODE = [
  "import { Canvas } from '@react-three/fiber';",
  '',
  '// la pièce, puis l\'écran qu\'on traverse',
  'export default function DeskScene() {',
  '  const warm = useWarmup();',
  '  const [dpr, setDpr] = useState(1);',
  '',
  '  return (',
  '    <Canvas dpr={dpr} shadows>',
  '      <AdaptiveQuality',
  '        onChange={setDpr} />',
  '      <Suspense fallback={null}>',
  '        <Scene warm={warm} />',
  '      </Suspense>',
  '    </Canvas>',
  '  );',
  '}',
  '',
  'function Scene({ warm }) {',
  '  return (',
  '    <>',
  '      <Desk />',
  '      <Monitor />',
  '      <ProjectShelf />',
  '    </>',
  '  );',
  '}',
];

const TERMINAL: Run[][] = [
  [['evan@portfolio', STRING], [':~$ ', TXT], ['npm run dev', TXT]],
  [['> next dev -p 3022', MUTED]],
  [['  ▲ Next.js 16', TXT]],
  [['  - Local: ', MUTED], ['http://localhost:3022', KEYWORD]],
  [[' ✓ ', STRING], ['Ready in 1.4s', TXT]],
  [[' ✓ ', STRING], ['Compiled / in 2.1s', TXT]],
  [],
  [['evan@portfolio', STRING], [':~$ ', TXT], ['git push', TXT]],
  [['To github.com:ZabisFR/Portfolio', MUTED]],
  [['   2379662..master', MUTED]],
  [['evan@portfolio', STRING], [':~$ ', TXT], ['▍', KEYWORD]],
];

/* ------------------------------------------------- l'écran vertical */

export function CodeMonitor({ position, yaw }: { position: [number, number, number]; yaw: number }) {
  const W = 0.34, H = 0.6;
  const tex = useMemo(() => screenTexture(400, 706, CODE, { gutter: true, size: 15, header: 'desk-scene.tsx' }), []);
  const panel = useMemo(() => roundedRect(W, H, 0.006), []);
  const alu = <meshStandardMaterial color="#c3c7ce" roughness={0.25} metalness={0.9} />;
  return (
    <group position={position} rotation={[0, yaw, 0]}>
      <RoundedBox args={[0.2, 0.01, 0.16]} radius={0.004} smoothness={2} position={[0, 0.005, -0.02]} castShadow receiveShadow>{alu}</RoundedBox>
      <RoundedBox args={[0.045, 0.2, 0.02]} radius={0.006} smoothness={2} position={[0, 0.1, -0.07]} castShadow>{alu}</RoundedBox>
      <group position={[0, 0.16 + H / 2, -0.04]}>
        <RoundedBox args={[W + 0.022, H + 0.022, 0.026]} radius={0.01} smoothness={2} position={[0, 0, -0.015]} castShadow>
          <meshStandardMaterial color="#0f1116" roughness={0.35} metalness={0.4} />
        </RoundedBox>
        <mesh geometry={panel}>
          <meshBasicMaterial map={tex} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}

/* --------------------------------------------- le portable sur support */

export function Laptop({ position, yaw }: { position: [number, number, number]; yaw: number }) {
  const W = 0.31, D = 0.21;
  const tex = useMemo(() => screenTexture(512, 330, TERMINAL, { size: 17 }), []);
  const panel = useMemo(() => roundedRect(W - 0.02, D - 0.03, 0.004), []);
  const alu = <meshStandardMaterial color="#9aa0aa" roughness={0.3} metalness={0.85} />;
  /* support incliné : le portable monte à hauteur d'yeux */
  const tilt = 0.32;
  return (
    <group position={position} rotation={[0, yaw, 0]}>
      {[-0.11, 0.11].map((x) => (
        <mesh key={x} position={[x, 0.045, 0]} rotation={[tilt, 0, 0]} castShadow>
          <boxGeometry args={[0.012, 0.012, 0.2]} />
          <meshStandardMaterial color="#2a2e36" roughness={0.4} metalness={0.8} />
        </mesh>
      ))}
      <group position={[0, 0.06, 0]} rotation={[tilt, 0, 0]}>
        {/* base, clavier à peine visible */}
        <RoundedBox args={[W, 0.012, D]} radius={0.005} smoothness={2} castShadow receiveShadow>{alu}</RoundedBox>
        <mesh position={[0, 0.0065, 0.01]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[W - 0.04, D - 0.09]} />
          <meshStandardMaterial color="#23262d" roughness={0.7} />
        </mesh>
        {/* écran, ouvert à 105° */}
        <group position={[0, 0.006, -D / 2]} rotation={[-1.83 + Math.PI / 2, 0, 0]}>
          <RoundedBox args={[W, D, 0.008]} radius={0.004} smoothness={2} position={[0, D / 2, -0.004]} castShadow>{alu}</RoundedBox>
          <mesh geometry={panel} position={[0, D / 2, 0.0005]}>
            <meshBasicMaterial map={tex} toneMapped={false} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

/* ------------------------------------------------------- la tour PC */

function meshPanel() {
  const S = 128;
  const c = document.createElement('canvas');
  c.width = c.height = S;
  const g = c.getContext('2d')!;
  g.fillStyle = '#1b1e24'; g.fillRect(0, 0, S, S);
  g.fillStyle = '#0b0c0f';
  for (let y = 4; y < S; y += 8) for (let x = (y / 8) % 2 ? 8 : 4; x < S; x += 8) {
    g.beginPath(); g.arc(x, y, 2.2, 0, Math.PI * 2); g.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(3, 6);
  return t;
}

/** Boîtier alu clair, façade grillagée, sans éclairage RGB. Un boîtier noir
 *  disparaissait dans la pénombre au pied du bureau. */
export function PcTower({ position, yaw = 0 }: { position: [number, number, number]; yaw?: number }) {
  const grill = useMemo(() => meshPanel(), []);
  const W = 0.2, H = 0.44, D = 0.42;
  return (
    <group position={position} rotation={[0, yaw, 0]}>
      <RoundedBox args={[W, H, D]} radius={0.01} smoothness={2} position={[0, H / 2 + 0.015, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#b9bdc4" roughness={0.3} metalness={0.8} />
      </RoundedBox>
      <mesh position={[0, H / 2 + 0.015, D / 2 + 0.001]}>
        <planeGeometry args={[W - 0.03, H - 0.05]} />
        <meshStandardMaterial map={grill} roughness={0.8} metalness={0.3} />
      </mesh>
      {/* bouton d'allumage */}
      <mesh position={[0, H + 0.016, D / 2 - 0.05]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.009, 16]} />
        <meshStandardMaterial color="#8a919c" roughness={0.3} metalness={0.9} />
      </mesh>
      {/* pieds */}
      {[-1, 1].map((sx) => [-1, 1].map((sz) => (
        <mesh key={`${sx}${sz}`} position={[sx * (W / 2 - 0.025), 0.0075, sz * (D / 2 - 0.04)]}>
          <cylinderGeometry args={[0.012, 0.012, 0.015, 10]} />
          <meshStandardMaterial color="#0b0c0f" roughness={0.9} />
        </mesh>
      )))}
    </group>
  );
}

/* --------------------------------------------- le canard en plastique */

/** Le canard du « rubber duck debugging » : on lui explique le bug, et en
 *  l'expliquant on le trouve. */
export function RubberDuck({ position, yaw = 0 }: { position: [number, number, number]; yaw?: number }) {
  const yellow = <meshStandardMaterial color="#f2c14e" roughness={0.35} />;
  return (
    <group position={position} rotation={[0, yaw, 0]}>
      <mesh position={[0, 0.024, 0]} scale={[1, 0.75, 1.25]} castShadow>
        <sphereGeometry args={[0.032, 16, 12]} />{yellow}
      </mesh>
      <mesh position={[0, 0.026, -0.04]} rotation={[-0.6, 0, 0]} scale={[0.6, 0.6, 1]}>
        <coneGeometry args={[0.02, 0.03, 10]} />{yellow}
      </mesh>
      <mesh position={[0, 0.062, 0.022]} castShadow>
        <sphereGeometry args={[0.021, 14, 10]} />{yellow}
      </mesh>
      <mesh position={[0, 0.058, 0.045]} rotation={[Math.PI / 2, 0, 0]} scale={[1.3, 1, 0.5]}>
        <coneGeometry args={[0.009, 0.02, 10]} />
        <meshStandardMaterial color="#e8956b" roughness={0.4} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.0125, 0.068, 0.037]}>
          <sphereGeometry args={[0.0032, 8, 6]} />
          <meshStandardMaterial color="#1b1e24" roughness={0.2} />
        </mesh>
      ))}
    </group>
  );
}

/* -------------------------------------------------------- le casque */

/** Casque accroché à son support : posé à plat, il ne se reconnaissait pas. */
export function Headphones({ position, yaw = 0 }: { position: [number, number, number]; yaw?: number }) {
  const dark = <meshStandardMaterial color="#2f343d" roughness={0.5} metalness={0.3} />;
  const alu = <meshStandardMaterial color="#c3c7ce" roughness={0.25} metalness={0.9} />;
  const TOP = 0.27;
  return (
    <group position={position} rotation={[0, yaw, 0]}>
      <mesh position={[0, 0.005, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.05, 0.055, 0.01, 24]} />{alu}
      </mesh>
      <mesh position={[0, TOP / 2, 0]} castShadow>
        <cylinderGeometry args={[0.006, 0.006, TOP, 10]} />{alu}
      </mesh>
      {/* arceau posé sur le support, oreillettes de part et d'autre */}
      <mesh position={[0, TOP - 0.065, 0]} castShadow>
        <torusGeometry args={[0.075, 0.008, 8, 24, Math.PI]} />{dark}
      </mesh>
      {[-1, 1].map((s) => (
        <group key={s} position={[s * 0.075, TOP - 0.1, 0]}>
          <mesh rotation={[0, 0, Math.PI / 2]} scale={[1, 1, 1.25]} castShadow>
            <cylinderGeometry args={[0.038, 0.038, 0.028, 20]} />{dark}
          </mesh>
          <mesh position={[-s * 0.015, 0, 0]} rotation={[0, 0, Math.PI / 2]} scale={[1, 1, 1.25]}>
            <cylinderGeometry args={[0.031, 0.031, 0.006, 20]} />
            <meshStandardMaterial color="#c47c58" roughness={0.9} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* ------------------------------------------------- la bibliothèque */

/* Dos de livres dans la palette du site, sans couleur criarde. */
const SPINES = ['#e8956b', '#9bb197', '#e9dccd', '#c47c58', '#7a6453', '#b0875c', '#23262d', '#c79a8a'];

export function Bookcase({ position, children }: { position: [number, number, number]; children?: ReactNode }) {
  const wood = useMemo(() => walnut(), []);
  const books = useRef<THREE.InstancedMesh>(null);
  const W = 0.72, H = 0.8, D = 0.3, T = 0.022;
  const shelves = [T / 2, 0.39, H - T / 2];

  /* deux rangées de livres de hauteurs et d'épaisseurs variées */
  const layout = useMemo(() => {
    const out: { x: number; y: number; w: number; h: number; d: number; lean: number; c: string }[] = [];
    let s = 7;
    const rand = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
    [shelves[0], shelves[1]].forEach((base, row) => {
      let x = -W / 2 + T + 0.01;
      const end = W / 2 - T - (row ? 0.16 : 0.05);
      while (x < end) {
        const w = 0.022 + rand() * 0.022;
        if (x + w > end) break;
        out.push({ x: x + w / 2, y: base + T / 2, w, h: 0.2 + rand() * 0.11, d: 0.17 + rand() * 0.05, lean: 0, c: SPINES[Math.floor(rand() * SPINES.length)] });
        x += w + 0.002;
      }
      /* le dernier livre penche contre les autres */
      if (row) out.push({ x: end + 0.05, y: base + T / 2, w: 0.03, h: 0.24, d: 0.19, lean: -0.32, c: SPINES[0] });
    });
    return out;
  }, []);

  useLayoutEffect(() => {
    const m = books.current;
    if (!m) return;
    const o = new THREE.Object3D();
    const col = new THREE.Color();
    layout.forEach((b, i) => {
      o.position.set(b.x, b.y + (b.h / 2) * Math.cos(b.lean), 0);
      o.rotation.set(0, 0, b.lean);
      o.scale.set(b.w, b.h, b.d);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
      m.setColorAt(i, col.set(b.c));
    });
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [layout]);

  const woodMat = <meshStandardMaterial map={wood?.map} roughnessMap={wood?.rough} roughness={0.7} />;
  return (
    <group position={position}>
      {[-1, 1].map((sx) => (
        <mesh key={sx} position={[sx * (W / 2 - T / 2), H / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[T, H, D]} />{woodMat}
        </mesh>
      ))}
      {shelves.map((y) => (
        <mesh key={y} position={[0, y, 0]} castShadow receiveShadow>
          <boxGeometry args={[W, T, D]} />{woodMat}
        </mesh>
      ))}
      <mesh position={[0, H / 2, -D / 2 + 0.004]} receiveShadow>
        <boxGeometry args={[W - T, H, 0.008]} />
        <meshStandardMaterial color="#3b2b22" roughness={1} />
      </mesh>
      <instancedMesh ref={books} args={[undefined, undefined, layout.length]} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial roughness={0.8} />
      </instancedMesh>
      <group position={[0, H, 0]}>{children}</group>
    </group>
  );
}
