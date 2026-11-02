'use client';

/* Le mobilier du bureau, entièrement généré par du code.
   Aucun modèle importé : pas de glTF à télécharger, et chaque pièce reste
   réglable par un paramètre plutôt que par un logiciel de modélisation. */

import { useLayoutEffect, useMemo, useRef } from 'react';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { walnut, felt } from './materials';

export const WOOD = '#6b4a32';
export const PLASTIC = '#16191f';
export const PLASTIC_LIGHT = '#2a2f39';
export const METAL = '#8a919c';

/* ---------------------------------------------------------------- le bureau */

export function Desk() {
  const wood = useMemo(() => walnut(), []);
  return (
    <group>
      <RoundedBox args={[2.5, 0.05, 1.05]} radius={0.02} smoothness={2} position={[0, 0.74, 0]} castShadow receiveShadow>
        <meshStandardMaterial map={wood?.map} roughnessMap={wood?.rough} roughness={0.78} metalness={0} envMapIntensity={0.45} />
      </RoundedBox>
      {/* piètement en U, plus élégant que quatre pieds droits */}
      {[-1.08, 1.08].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          {[-0.4, 0.4].map((z) => (
            <mesh key={z} position={[0, 0.36, z]} castShadow>
              <boxGeometry args={[0.04, 0.72, 0.04]} />
              <meshStandardMaterial color="#1c1f25" roughness={0.35} metalness={0.85} />
            </mesh>
          ))}
          <mesh position={[0, 0.02, 0]} castShadow>
            <boxGeometry args={[0.04, 0.04, 0.84]} />
            <meshStandardMaterial color="#1c1f25" roughness={0.35} metalness={0.85} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* --------------------------------------------------------- le tapis de bureau */

export function DeskMat() {
  const tex = useMemo(() => felt('#1b1e25'), []);
  return (
    <RoundedBox args={[1.05, 0.006, 0.42]} radius={0.003} smoothness={2} position={[0.08, 0.768, 0.3]} receiveShadow>
      <meshStandardMaterial map={tex} roughness={1} />
    </RoundedBox>
  );
}

/* --------------------------------------------------------------- le clavier */

/* un seul segment d’arrondi : à cette distance, les coins ronds plus fins ne se
   voient pas, et 51 touches × 300 triangles pesaient 15 000 triangles */
const KEY_GEO = new RoundedBoxGeometry(1, 1, 1, 1, 0.18);

export function Keyboard() {
  const keys = useRef<THREE.InstancedMesh>(null);

  /* Une grille de touches décalée par rangée, comme un vrai clavier, en une
     seule instance : 58 touches pour un seul appel de dessin. */
  const layout = useMemo(() => {
    const out: { x: number; z: number; w: number }[] = [];
    const rows = [
      { count: 14, offset: 0 }, { count: 13, offset: 0.014 },
      { count: 12, offset: 0.022 }, { count: 11, offset: 0.03 },
    ];
    rows.forEach((row, r) => {
      for (let i = 0; i < row.count; i++) out.push({ x: -0.188 + row.offset + i * 0.029, z: -0.05 + r * 0.03, w: 0.025 });
    });
    out.push({ x: 0.0, z: 0.072, w: 0.13 });
    return out;
  }, []);

  useLayoutEffect(() => {
    const m = keys.current;
    if (!m) return;
    const o = new THREE.Object3D();
    layout.forEach((k, i) => {
      o.position.set(k.x, 0.012, k.z);
      o.scale.set(k.w, 0.008, 0.024);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  }, [layout]);

  return (
    <group position={[-0.06, 0.778, 0.3]} rotation={[0, 0.03, 0]}>
      <RoundedBox args={[0.45, 0.014, 0.16]} radius={0.006} smoothness={2} castShadow receiveShadow>
        <meshStandardMaterial color="#c9ccd2" roughness={0.35} metalness={0.6} />
      </RoundedBox>
      <instancedMesh ref={keys} args={[KEY_GEO, undefined, layout.length]} castShadow>
        <meshStandardMaterial color="#e9ebef" roughness={0.6} />
      </instancedMesh>
    </group>
  );
}

/* ----------------------------------------------------------------- la souris */

export function Mouse() {
  return (
    <group position={[0.36, 0.786, 0.31]} rotation={[0, -0.12, 0]}>
      <mesh castShadow scale={[0.9, 0.42, 1.45]}>
        <sphereGeometry args={[0.032, 18, 12]} />
        <meshStandardMaterial color="#e9ebef" roughness={0.38} />
      </mesh>
      <mesh position={[0, 0.0135, -0.012]} scale={[0.1, 0.1, 0.25]}>
        <sphereGeometry args={[0.03, 12, 8]} />
        <meshStandardMaterial color="#9aa0aa" roughness={0.5} />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------- la tasse */

export function Mug({ accent = '#4cc2ff' }: { accent?: string }) {
  /* Profil tourné, comme une vraie tasse en céramique : base resserrée,
     panse légèrement bombée, lèvre arrondie. */
  const body = useMemo(() => {
    const pts = [
      [0.0, 0.0], [0.033, 0.0], [0.036, 0.004], [0.038, 0.02],
      [0.0405, 0.06], [0.041, 0.088], [0.0395, 0.092], [0.0365, 0.09],
      [0.035, 0.06], [0.033, 0.012], [0.0, 0.01],
    ].map(([x, y]) => new THREE.Vector2(x, y));
    return new THREE.LatheGeometry(pts, 32);
  }, []);

  return (
    <group position={[0.76, 0.768, 0.14]} rotation={[0, -0.7, 0]}>
      <mesh geometry={body} castShadow receiveShadow>
        <meshStandardMaterial color={accent} roughness={0.16} />
      </mesh>
      {/* le café */}
      <mesh position={[0, 0.078, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.035, 32]} />
        <meshStandardMaterial color="#2b1a0f" roughness={0.15} metalness={0.1} />
      </mesh>
      {/* l'anse : demi-anneau vertical, ouvert côté tasse */}
      <mesh position={[0.04, 0.047, 0]} rotation={[0, 0, -Math.PI / 2]} castShadow>
        <torusGeometry args={[0.024, 0.0065, 8, 16, Math.PI]} />
        <meshStandardMaterial color={accent} roughness={0.16} />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ la lampe */

export function Lamp() {
  const joint = <meshStandardMaterial color="#2a2e36" roughness={0.3} metalness={0.9} />;
  const arm = <meshStandardMaterial color="#d8dbe0" roughness={0.25} metalness={0.85} />;
  return (
    <group position={[-0.95, 0.765, -0.22]} rotation={[0, 0.5, 0]}>
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.075, 0.085, 0.018, 28]} />
        <meshStandardMaterial color="#2a2e36" roughness={0.3} metalness={0.9} />
      </mesh>
      {/* bras inférieur */}
      <group position={[0, 0.012, 0]} rotation={[0, 0, 0.32]}>
        <mesh position={[0, 0.16, 0]} castShadow><cylinderGeometry args={[0.007, 0.007, 0.32, 14]} />{arm}</mesh>
        <mesh position={[0, 0.32, 0]}><sphereGeometry args={[0.014, 10, 8]} />{joint}</mesh>
        {/* bras supérieur */}
        <group position={[0, 0.32, 0]} rotation={[0, 0, -1.25]}>
          <mesh position={[0, 0.13, 0]} castShadow><cylinderGeometry args={[0.006, 0.006, 0.26, 14]} />{arm}</mesh>
          {/* tête */}
          <group position={[0, 0.27, 0]} rotation={[0, 0, -0.55]}>
            <mesh castShadow>
              <coneGeometry args={[0.07, 0.11, 24, 1, true]} />
              <meshStandardMaterial color="#20252e" roughness={0.4} metalness={0.7} side={THREE.FrontSide} />
            </mesh>
            <mesh>
              <coneGeometry args={[0.068, 0.108, 24, 1, true]} />
              <meshBasicMaterial color="#6a5236" side={THREE.BackSide} />
            </mesh>
            <mesh position={[0, -0.03, 0]}>
              <sphereGeometry args={[0.022, 12, 8]} />
              <meshBasicMaterial color="#fff1d6" toneMapped={false} />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
}

/* ------------------------------------------------------------------ la plante */

export function Plant() {
  /* Sansevieria : feuilles longues et effilées, chacune légèrement tordue. */
  const leaves = useMemo(() => {
    const rand = (i: number) => Math.abs(Math.sin(i * 91.7) * 43758.5) % 1;
    return Array.from({ length: 9 }, (_, i) => ({
      a: (i / 9) * Math.PI * 2 + rand(i) * 0.6,
      tilt: 0.12 + rand(i + 3) * 0.22,
      h: 0.2 + rand(i + 7) * 0.16,
      w: 0.022 + rand(i + 11) * 0.01,
      shade: rand(i + 5),
    }));
  }, []);

  const pot = useMemo(() => {
    const pts = [[0, 0], [0.05, 0], [0.056, 0.01], [0.062, 0.1], [0.066, 0.104], [0.066, 0.11], [0.058, 0.11], [0.054, 0.1], [0, 0.098]]
      .map(([x, y]) => new THREE.Vector2(x, y));
    return new THREE.LatheGeometry(pts, 28);
  }, []);

  return (
    <group position={[1.0, 0.765, -0.3]}>
      <mesh geometry={pot} castShadow receiveShadow>
        <meshStandardMaterial color="#e8e2d8" roughness={0.65} />
      </mesh>
      <mesh position={[0, 0.098, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.055, 24]} />
        <meshStandardMaterial color="#3a2a1d" roughness={1} />
      </mesh>
      {leaves.map((l, i) => (
        <group key={i} position={[0, 0.1, 0]} rotation={[0, l.a, 0]}>
          <mesh position={[0.012, l.h / 2, 0]} rotation={[0, 0, -l.tilt]} scale={[1, 1, 0.22]} castShadow>
            <coneGeometry args={[l.w, l.h, 4, 1]} />
            <meshStandardMaterial color={l.shade > 0.5 ? '#3f7d4e' : '#2f6440'} roughness={0.55} flatShading />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* ------------------------------------------------------- carnet et crayon */

export function Notebook({ accent = '#4cc2ff' }: { accent?: string }) {
  return (
    <group position={[0.68, 0.768, 0.37]} rotation={[0, 0.35, 0]}>
      <RoundedBox args={[0.15, 0.012, 0.21]} radius={0.004} smoothness={2} position={[0, 0.006, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#23262d" roughness={0.8} />
      </RoundedBox>
      <mesh position={[0.071, 0.0125, 0]}>
        <boxGeometry args={[0.006, 0.0015, 0.212]} />
        <meshStandardMaterial color={accent} roughness={0.5} />
      </mesh>
      {/* crayon posé en travers */}
      <group position={[-0.01, 0.017, 0.02]} rotation={[0, 0.9, Math.PI / 2]}>
        <mesh castShadow><cylinderGeometry args={[0.0035, 0.0035, 0.15, 6]} /><meshStandardMaterial color="#f2c14e" roughness={0.6} /></mesh>
        <mesh position={[0, 0.081, 0]}><coneGeometry args={[0.0035, 0.012, 6]} /><meshStandardMaterial color="#e7cfa8" roughness={0.8} /></mesh>
      </group>
    </group>
  );
}

/* ---------------------------------------------------------- le mur et le sol */

export function Room({ accent = '#e8956b' }: { accent?: string }) {
  /* Mur couleur argile, lattes en chêne miel, parquet chaud : des teintes
     moyennes, pour que la lumière tamisée révèle les couleurs au lieu de
     tout noyer dans le noir. */
  const slats = useMemo(() => Array.from({ length: 34 }, (_, i) => -1.65 + i * 0.1), []);
  return (
    <group>
      <mesh position={[0, 1.6, -1.36]} receiveShadow>
        <planeGeometry args={[10, 5]} />
        <meshStandardMaterial color="#a8897a" roughness={1} />
      </mesh>
      <group position={[0, 1.25, -1.34]}>
        <mesh receiveShadow>
          <planeGeometry args={[3.45, 2.5]} />
          <meshStandardMaterial color="#3b2b22" roughness={1} />
        </mesh>
        {slats.map((x) => (
          <mesh key={x} position={[x, 0, 0.012]} receiveShadow castShadow>
            <boxGeometry args={[0.055, 2.5, 0.024]} />
            <meshStandardMaterial color="#b0875c" roughness={0.75} />
          </mesh>
        ))}
      </group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[10, 8]} />
        <meshStandardMaterial color="#5a4031" roughness={0.9} />
      </mesh>
      {/* plafond : en portrait, la caméra s'ouvre assez pour voir au-dessus du
          mur ; sans lui, une bande noire apparaîtrait en haut de l'écran */}
      <mesh position={[0, 3.3, 1.2]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[10, 5.2]} />
        <meshStandardMaterial color="#4a362b" roughness={1} />
      </mesh>
      {/* halo chaud derrière l'écran */}
      <mesh position={[0, 1.3, -1.31]}>
        <circleGeometry args={[1.25, 48]} />
        <meshBasicMaterial color={accent} transparent opacity={0.05} toneMapped={false} depthWrite={false} />
      </mesh>
    </group>
  );
}
