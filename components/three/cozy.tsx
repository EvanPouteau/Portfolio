'use client';

/* L'ambiance « cocon » : plantes, guirlande lumineuse, bougie et tapis.
   ---------------------------------------------------------------------------
   Comme le reste du mobilier, tout est généré par du code. Les feuilles
   répétées (pothos, figuier, ampoules) passent par des InstancedMesh : une
   seule commande de dessin par type de feuille, quel que soit leur nombre. */

import { useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { roundedRect } from './materials';

/* Verts doux, pas fluo : la scène doit rester apaisée. */
const LEAF = '#5c8a57';
const LEAF_DARK = '#46714a';
const LEAF_LIGHT = '#7aa36a';
const TERRACOTTA = '#c47c58';

/* Hasard déterministe : la même plante d'un chargement à l'autre. */
function rng(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

/** Courbe une géométrie plate : creuse la feuille (z ∝ x²) et la fait
 *  retomber vers la pointe (z ∝ y²), comme une vraie feuille. */
function bendLeaf(g: THREE.BufferGeometry, cup: number, droop: number, len: number) {
  const pos = g.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i);
    const u = Math.max(0, y / len);
    pos.setZ(i, cup * x * x + droop * u * u * len);
  }
  pos.needsUpdate = true;
  g.computeVertexNormals();
  return g;
}

/* ================================================================ pots */

function Pot({ radius, height, color = TERRACOTTA, rim = true }: { radius: number; height: number; color?: string; rim?: boolean }) {
  const geo = useMemo(() => {
    const r = radius, h = height;
    const pts = [
      [0, 0], [r * 0.78, 0], [r * 0.82, h * 0.04], [r * 0.95, h * 0.82],
      ...(rim ? [[r, h * 0.84], [r * 1.04, h * 0.86], [r * 1.04, h], [r * 0.96, h]] : [[r, h]]),
      [r * 0.9, h * 0.94], [0, h * 0.9],
    ].map(([x, y]) => new THREE.Vector2(x, y));
    return new THREE.LatheGeometry(pts, 28);
  }, [radius, height, rim]);
  return (
    <group>
      <mesh geometry={geo} castShadow receiveShadow>
        <meshStandardMaterial color={color} roughness={0.85} />
      </mesh>
      {/* terreau */}
      <mesh position={[0, height * 0.9, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[radius * 0.9, 28]} />
        <meshStandardMaterial color="#3b2a1e" roughness={1} />
      </mesh>
    </group>
  );
}

/* ============================================================== monstera */

/** Feuille de monstera : contour en cœur avec échancrures en V, et quelques
 *  trous le long de la nervure. */
function monsteraLeaf(len: number, seed: number) {
  const rand = rng(seed);
  const W = len * 0.5;
  const shape = new THREE.Shape();
  const N = 28;
  const side = (s: 1 | -1) => {
    const pts: [number, number][] = [];
    for (let i = 0; i <= N; i++) {
      const u = i / N;
      let w = W * Math.pow(Math.sin(Math.PI * Math.min(u * 1.05, 1)), 0.7) * (1 - 0.2 * u);
      /* échancrures : le contour plonge vers la nervure par endroits */
      const notch = Math.sin(u * Math.PI * 6 + 0.6);
      if (u > 0.18 && u < 0.88 && notch > 0.55) w *= 0.38 + rand() * 0.12;
      const y = u * len - (u < 0.1 ? (0.1 - u) * len * 1.2 : 0);
      pts.push([s * w, y]);
    }
    return pts;
  };
  const r = side(1), l = side(-1).reverse();
  shape.moveTo(0, 0);
  r.forEach(([x, y]) => shape.lineTo(x, y));
  l.forEach(([x, y]) => shape.lineTo(x, y));
  shape.closePath();
  /* trous près de la nervure */
  for (const u of [0.32, 0.55]) {
    for (const s of [1, -1]) {
      const h = new THREE.Path();
      h.absellipse(s * W * 0.18, u * len, len * 0.025, len * 0.045, 0, Math.PI * 2, false, 0);
      shape.holes.push(h);
    }
  }
  return bendLeaf(new THREE.ShapeGeometry(shape, 6), 0.9, -0.18, len);
}

function stem(from: THREE.Vector3, to: THREE.Vector3, bend: THREE.Vector3, r = 0.006) {
  const mid = from.clone().lerp(to, 0.5).add(bend);
  return new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(from, mid, to), 12, r, 6, false);
}

export function Monstera({ position = [0, 0, 0] as [number, number, number], scale = 1 }) {
  const leaves = useMemo(() => {
    const rand = rng(11);
    return Array.from({ length: 9 }, (_, i) => {
      const a = (i / 9) * Math.PI * 2 + rand() * 0.5;
      const h = 0.45 + rand() * 0.6;
      const out = 0.18 + rand() * 0.32;
      const len = 0.26 + rand() * 0.14;
      const tip = new THREE.Vector3(Math.cos(a) * out, h, Math.sin(a) * out);
      return {
        len,
        tip,
        geo: monsteraLeaf(len, 100 + i),
        stem: stem(new THREE.Vector3(0, 0.3, 0), tip, new THREE.Vector3(Math.cos(a) * 0.04, 0.12, Math.sin(a) * 0.04)),
        yaw: -a + Math.PI / 2,
        /* inclinaison positive : la pointe part vers l'extérieur du pot */
        tilt: 0.7 + rand() * 0.6,
        color: i % 3 === 0 ? LEAF_DARK : LEAF,
      };
    });
  }, []);

  return (
    <group position={position} scale={scale}>
      <Pot radius={0.2} height={0.34} />
      {leaves.map((l, i) => (
        <group key={i}>
          <mesh geometry={l.stem} castShadow>
            <meshStandardMaterial color="#557a46" roughness={0.7} />
          </mesh>
          {/* la feuille s'attache au bout de sa tige et s'ouvre vers l'extérieur */}
          <group position={l.tip} rotation={[0, l.yaw, 0]}>
            <mesh geometry={l.geo} rotation={[l.tilt, 0, 0]} castShadow>
              <meshStandardMaterial color={l.color} roughness={0.5} side={THREE.DoubleSide} />
            </mesh>
          </group>
        </group>
      ))}
    </group>
  );
}

/* ============================================================ figuier lyre */

export function FiddleFig({ position = [0, 0, 0] as [number, number, number], scale = 1 }) {
  const leaves = useRef<THREE.InstancedMesh>(null);
  const COUNT = 26;

  /* Feuille large et ovale, au bord légèrement ondulé. */
  const leafGeo = useMemo(() => {
    const len = 0.24, W = 0.1;
    const s = new THREE.Shape();
    const N = 24;
    const pts: [number, number][] = [];
    for (let i = 0; i <= N; i++) {
      const u = i / N;
      const w = W * Math.pow(Math.sin(Math.PI * u), 0.8) * (0.75 + 0.35 * u) * (1 + 0.04 * Math.sin(u * 22));
      pts.push([w, u * len]);
    }
    s.moveTo(0, 0);
    pts.forEach(([x, y]) => s.lineTo(x, y));
    [...pts].reverse().forEach(([x, y]) => s.lineTo(-x, y));
    s.closePath();
    return bendLeaf(new THREE.ShapeGeometry(s, 4), 2.2, -0.1, len);
  }, []);

  /* Le tronc : une courbe légèrement penchée, sur laquelle on accroche les feuilles. */
  const trunkCurve = useMemo(() => new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.3, 0), new THREE.Vector3(0.03, 0.8, 0.02),
    new THREE.Vector3(-0.02, 1.25, 0), new THREE.Vector3(0.04, 1.62, -0.02),
  ]), []);
  const trunk = useMemo(() => new THREE.TubeGeometry(trunkCurve, 24, 0.018, 8, false), [trunkCurve]);

  useLayoutEffect(() => {
    const m = leaves.current;
    if (!m) return;
    const rand = rng(23);
    const o = new THREE.Object3D();
    const c = new THREE.Color();
    for (let i = 0; i < COUNT; i++) {
      const t = 0.42 + (i / COUNT) * 0.58;
      const p = trunkCurve.getPoint(t);
      const a = i * 2.39996; // angle d'or : répartition naturelle autour du tronc
      o.position.copy(p);
      o.rotation.set(0, -a, 0);
      o.rotateX(-0.9 - rand() * 0.6 + t * 0.3);
      o.scale.setScalar(0.85 + rand() * 0.45);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
      m.setColorAt(i, c.set(rand() > 0.5 ? LEAF : LEAF_DARK).offsetHSL(0, 0, (rand() - 0.5) * 0.06));
    }
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [trunkCurve]);

  return (
    <group position={position} scale={scale}>
      {/* panier tressé : un pot sans rebord, couleur osier */}
      <Pot radius={0.21} height={0.36} color="#b8935f" rim={false} />
      <mesh geometry={trunk} castShadow>
        <meshStandardMaterial color="#6b5040" roughness={0.9} />
      </mesh>
      <instancedMesh ref={leaves} args={[leafGeo, undefined, COUNT]} castShadow>
        <meshStandardMaterial roughness={0.45} side={THREE.DoubleSide} />
      </instancedMesh>
    </group>
  );
}

/* ================================================================ pothos */

/** Une liane de pothos qui retombe d'une étagère. */
export function Pothos({ position, length = 0.8, sway = 0.12, seed = 1 }: {
  position: [number, number, number];
  length?: number;
  sway?: number;
  seed?: number;
}) {
  const leaves = useRef<THREE.InstancedMesh>(null);
  const COUNT = 18;

  const curve = useMemo(() => {
    const rand = rng(seed);
    const pts = [];
    for (let i = 0; i <= 6; i++) {
      const u = i / 6;
      pts.push(new THREE.Vector3(Math.sin(u * 3 + seed) * sway * u, -u * length, 0.04 + rand() * 0.04 * u));
    }
    return new THREE.CatmullRomCurve3(pts);
  }, [length, sway, seed]);

  const vine = useMemo(() => new THREE.TubeGeometry(curve, 30, 0.0035, 5, false), [curve]);

  /* petite feuille en cœur */
  const leafGeo = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, 0);
    s.bezierCurveTo(0.03, 0.005, 0.045, 0.04, 0, 0.075);
    s.bezierCurveTo(-0.045, 0.04, -0.03, 0.005, 0, 0);
    return bendLeaf(new THREE.ShapeGeometry(s, 6), 4, 0, 0.075);
  }, []);

  useLayoutEffect(() => {
    const m = leaves.current;
    if (!m) return;
    const rand = rng(seed * 7);
    const o = new THREE.Object3D();
    const c = new THREE.Color();
    for (let i = 0; i < COUNT; i++) {
      const t = (i + 0.5) / COUNT;
      o.position.copy(curve.getPoint(t));
      const sideA = i % 2 ? 1 : -1;
      o.rotation.set(0.4 + rand() * 0.5, sideA * (0.6 + rand() * 0.6), Math.PI + sideA * 0.6);
      o.scale.setScalar(0.75 + rand() * 0.5 - t * 0.2);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
      m.setColorAt(i, c.set(rand() > 0.4 ? LEAF_LIGHT : LEAF).offsetHSL(0, 0, (rand() - 0.5) * 0.05));
    }
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [curve, seed]);

  return (
    <group position={position}>
      <mesh geometry={vine}>
        <meshStandardMaterial color="#5f7d45" roughness={0.8} />
      </mesh>
      <instancedMesh ref={leaves} args={[leafGeo, undefined, COUNT]} castShadow>
        <meshStandardMaterial roughness={0.5} side={THREE.DoubleSide} />
      </instancedMesh>
    </group>
  );
}

/** Pot suspendu au plafond par trois cordes, d'où retombent plusieurs lianes. */
/* `short` : lianes courtes, qui s'arrêtent au-dessus des cadres au lieu de les masquer. */
export function HangingPothos({ position, short = false }: { position: [number, number, number]; short?: boolean }) {
  const k = short ? 0.55 : 1;
  const cords = useMemo(() => [0, 1, 2].map((i) => {
    const a = (i / 3) * Math.PI * 2;
    const from = new THREE.Vector3(Math.cos(a) * 0.07, 0.1, Math.sin(a) * 0.07);
    const to = new THREE.Vector3(0, 1.2, 0);
    return new THREE.TubeGeometry(new THREE.LineCurve3(from, to), 1, 0.0025, 4, false);
  }), []);
  return (
    <group position={position}>
      {cords.map((g, i) => (
        <mesh key={i} geometry={g}><meshStandardMaterial color="#e8dcc8" roughness={1} /></mesh>
      ))}
      <Pot radius={0.08} height={0.11} color="#e3d6c4" />
      <Pothos position={[0.05, 0.09, 0.03]} length={0.75 * k} seed={3} />
      <Pothos position={[-0.05, 0.09, 0.03]} length={1.0 * k} sway={0.08} seed={7} />
      <Pothos position={[0.0, 0.09, -0.04]} length={0.55 * k} sway={0.15} seed={11} />
    </group>
  );
}

/* ====================================================== guirlande lumineuse */

/** Texture de halo doux, partagée par toutes les ampoules. */
function glowTexture() {
  const S = 64;
  const c = document.createElement('canvas');
  c.width = c.height = S;
  const g = c.getContext('2d')!;
  const grad = g.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
  grad.addColorStop(0, 'rgba(255,220,160,1)');
  grad.addColorStop(0.25, 'rgba(255,190,110,.55)');
  grad.addColorStop(1, 'rgba(255,160,80,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, S, S);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function StringLights({ from, to, sag = 0.18, count = 22 }: {
  from: [number, number, number];
  to: [number, number, number];
  sag?: number;
  count?: number;
}) {
  const bulbs = useRef<THREE.InstancedMesh>(null);
  const halo = useRef<THREE.Points>(null);
  const reduce = useMemo(() => typeof window !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches, []);

  /* chaînette : le fil pend sous son propre poids */
  const points = useMemo(() => {
    const a = new THREE.Vector3(...from), b = new THREE.Vector3(...to);
    const out: THREE.Vector3[] = [];
    for (let i = 0; i <= 40; i++) {
      const u = i / 40;
      const p = a.clone().lerp(b, u);
      p.y -= sag * 4 * u * (1 - u);
      out.push(p);
    }
    return out;
  }, [from, to, sag]);
  const curve = useMemo(() => new THREE.CatmullRomCurve3(points), [points]);
  const wire = useMemo(() => new THREE.TubeGeometry(curve, 60, 0.0025, 4, false), [curve]);
  const bulbPos = useMemo(() => Array.from({ length: count }, (_, i) => curve.getPoint((i + 0.5) / count).add(new THREE.Vector3(0, -0.02, 0.01))), [curve, count]);
  const haloGeo = useMemo(() => new THREE.BufferGeometry().setFromPoints(bulbPos), [bulbPos]);
  const tex = useMemo(() => glowTexture(), []);

  useLayoutEffect(() => {
    const m = bulbs.current;
    if (!m) return;
    const o = new THREE.Object3D();
    bulbPos.forEach((p, i) => { o.position.copy(p); o.updateMatrix(); m.setMatrixAt(i, o.matrix); });
    m.instanceMatrix.needsUpdate = true;
  }, [bulbPos]);

  /* très léger scintillement, comme de vraies petites ampoules */
  useFrame((state) => {
    if (reduce || !halo.current) return;
    const mat = halo.current.material as THREE.PointsMaterial;
    mat.opacity = 0.85 + Math.sin(state.clock.elapsedTime * 1.7) * 0.06;
  });

  return (
    <group>
      <mesh geometry={wire}>
        <meshStandardMaterial color="#2a2018" roughness={0.6} />
      </mesh>
      <instancedMesh ref={bulbs} args={[undefined, undefined, count]}>
        <sphereGeometry args={[0.012, 6, 4]} />
        <meshBasicMaterial color="#ffd59a" toneMapped={false} />
      </instancedMesh>
      <points ref={halo} geometry={haloGeo}>
        <pointsMaterial map={tex} size={0.16} sizeAttenuation transparent opacity={0.85} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </points>
      {/* une seule vraie lumière, au milieu, réchauffe le mur : chaque lumière
          ponctuelle se paie sur chaque pixel, et trois coûtaient cher aux
          petites cartes graphiques pour une différence à peine visible */}
      {(() => {
        const p = curve.getPoint(0.5);
        return <pointLight position={[p.x, p.y - 0.05, p.z + 0.2]} intensity={1.2} distance={2.8} decay={1.8} color="#ffc27a" />;
      })()}
    </group>
  );
}

/* ================================================================ bougie */

export function Candle({ position }: { position: [number, number, number] }) {
  const light = useRef<THREE.PointLight>(null);
  const flame = useRef<THREE.Mesh>(null);
  const reduce = useMemo(() => typeof window !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches, []);

  /* la flamme vacille : somme de deux sinus de fréquences différentes */
  useFrame((state) => {
    if (reduce) return;
    const t = state.clock.elapsedTime;
    const f = 1 + Math.sin(t * 9.3) * 0.08 + Math.sin(t * 23.1) * 0.05;
    if (light.current) light.current.intensity = 0.55 * f;
    if (flame.current) flame.current.scale.set(1, f, 1);
  });

  return (
    <group position={position}>
      {/* pot en verre ambré */}
      <mesh castShadow>
        <cylinderGeometry args={[0.036, 0.034, 0.075, 18, 1, true]} />
        <meshStandardMaterial color="#c98a4b" transparent opacity={0.55} roughness={0.15} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, -0.012, 0]}>
        <cylinderGeometry args={[0.033, 0.033, 0.05, 16]} />
        <meshStandardMaterial color="#f4e6cf" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.018, 0]}>
        <cylinderGeometry args={[0.0012, 0.0012, 0.012, 6]} />
        <meshBasicMaterial color="#222" />
      </mesh>
      <mesh ref={flame} position={[0, 0.032, 0]}>
        <coneGeometry args={[0.006, 0.022, 10]} />
        <meshBasicMaterial color="#ffcf7a" toneMapped={false} />
      </mesh>
      <pointLight ref={light} position={[0, 0.06, 0]} intensity={0.55} distance={1.1} decay={2} color="#ff9e52" />
    </group>
  );
}

/* ================================================================== tapis */

function rugTexture() {
  const W = 512, H = 352;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const g = c.getContext('2d')!;
  g.fillStyle = '#d9c6b0'; g.fillRect(0, 0, W, H);
  /* bordures : rose poudré et sauge, des teintes douces */
  const band = (inset: number, w: number, color: string) => {
    g.strokeStyle = color; g.lineWidth = w;
    g.strokeRect(inset, inset, W - inset * 2, H - inset * 2);
  };
  band(14, 10, '#c79a8a');
  band(32, 4, '#9bb197');
  band(44, 2, '#c79a8a');
  /* motif central discret : losanges */
  g.strokeStyle = 'rgba(160,120,100,.28)'; g.lineWidth = 2;
  for (let x = 80; x < W - 60; x += 48) {
    for (let y = 80; y < H - 60; y += 48) {
      g.beginPath(); g.moveTo(x, y - 14); g.lineTo(x + 14, y); g.lineTo(x, y + 14); g.lineTo(x - 14, y); g.closePath(); g.stroke();
    }
  }
  /* grain de laine */
  const img = g.getImageData(0, 0, W, H);
  const rand = rng(5);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = (rand() - 0.5) * 18;
    img.data[i] += n; img.data[i + 1] += n; img.data[i + 2] += n;
  }
  g.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

export function Rug() {
  const tex = useMemo(() => rugTexture(), []);
  const geo = useMemo(() => roundedRect(3.3, 2.25, 0.06), []);
  return (
    <mesh geometry={geo} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, 0.1]} receiveShadow>
      <meshStandardMaterial map={tex} roughness={1} />
    </mesh>
  );
}
