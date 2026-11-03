'use client';

/* La grande plante du coin de la pièce. Comme le reste du mobilier, elle est
   entièrement générée par du code : feuilles découpées puis courbées. */

import { useMemo } from 'react';
import * as THREE from 'three';

/* Verts doux, pas fluo : la scène doit rester apaisée. */
const LEAF = '#5c8a57';
const LEAF_DARK = '#46714a';
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
