'use client';

/* Les étagères des projets : chaque projet est une photo encadrée, posée
   contre le mur. Survoler un cadre le fait avancer vers la caméra ; cliquer
   ouvre le projet. */

import { useMemo, useRef, useState, type MutableRefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import type { Project } from '@/content/projects';
import { walnut } from './materials';
import { PhotoFrame, frameSize } from './photo-frame';
import { preloadCovers, useCovers } from './use-covers';

export const SHELF_Y = 1.6;
export const SHELF_Z = -1.17;
const SHELF_LEN = 1.5;
export const SHELF_X = 1.72;
/* Tailles légèrement différentes : un alignement trop parfait fait décor de magasin. */
const SIZES = [0.26, 0.21, 0.25, 0.22];

function ShelfFrame({
  project, texture, position, width, yaw, onOpen, onHover, hoverObj, disabled,
}: {
  project: Project;
  texture: THREE.Texture;
  position: [number, number, number];
  width: number;
  yaw: number;
  onOpen: (slug: string) => void;
  onHover: (slug: string | null) => void;
  hoverObj: MutableRefObject<THREE.Object3D | null>;
  disabled: boolean;
}) {
  const ref = useRef<THREE.Group>(null);
  const [hover, setHover] = useState(false);
  const lean = -0.15;

  useFrame((_, dt) => {
    const g = ref.current;
    if (!g) return;
    const k = 1 - Math.pow(0.0006, dt);
    /* au survol : le cadre se redresse, avance et grossit vers la caméra */
    g.position.z += ((hover ? 0.12 : 0) - g.position.z) * k;
    g.position.y += ((hover ? 0.05 : 0) - g.position.y) * k;
    g.rotation.x += ((hover ? 0.05 : lean) - g.rotation.x) * k;
    g.rotation.y += ((hover ? 0 : yaw) - g.rotation.y) * k;
    const s = hover ? 1.25 : 1;
    g.scale.setScalar(g.scale.x + (s - g.scale.x) * k);
  });

  const { h } = frameSize(width);

  return (
    <group position={position}>
      {/* pivot au pied du cadre, pour qu'il bascule comme un vrai cadre posé */}
      <group
        ref={ref}
        rotation={[lean, yaw, 0]}
        onPointerOver={(e) => {
          if (disabled) return;
          e.stopPropagation();
          setHover(true);
          hoverObj.current = ref.current;
          onHover(project.slug);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHover(false);
          if (hoverObj.current === ref.current) { hoverObj.current = null; onHover(null); }
          document.body.style.cursor = '';
        }}
        onClick={(e) => { if (disabled) return; e.stopPropagation(); onOpen(project.slug); }}
      >
        <group position={[0, h / 2, 0]}>
          <PhotoFrame texture={texture} width={width} />
        </group>
      </group>
    </group>
  );
}

export function ProjectShelf({
  projects, onOpen, onHover, hoverObj, disabled = false,
}: {
  projects: Project[];
  onOpen: (slug: string) => void;
  onHover: (slug: string | null) => void;
  hoverObj: MutableRefObject<THREE.Object3D | null>;
  disabled?: boolean;
}) {
  const covers = useCovers('shelf');
  const wood = useMemo(() => walnut(), []);
  const half = Math.ceil(projects.length / 2);
  const rows = [projects.slice(0, half), projects.slice(half)];

  return (
    <group>
      {[-SHELF_X, SHELF_X].map((cx, r) => {
        const items = rows[r];
        const widths = items.map((_, i) => frameSize(SIZES[(i + r) % SIZES.length]).w);
        const total = widths.reduce((a, b) => a + b, 0);
        const gap = (SHELF_LEN - 0.08 - total) / Math.max(1, items.length - 1);
        let x = cx - SHELF_LEN / 2 + 0.04;

        return (
          <group key={cx}>
            {/* planche */}
            <RoundedBox args={[SHELF_LEN, 0.03, 0.22]} radius={0.006} smoothness={2} position={[cx, SHELF_Y, SHELF_Z]} castShadow receiveShadow>
              <meshStandardMaterial map={wood?.map} roughnessMap={wood?.rough} roughness={0.6} />
            </RoundedBox>
            {/* équerres */}
            {[-0.5, 0.5].map((dx) => (
              <mesh key={dx} position={[cx + dx, SHELF_Y - 0.055, SHELF_Z - 0.07]} castShadow>
                <boxGeometry args={[0.015, 0.09, 0.09]} />
                <meshStandardMaterial color="#1c1f25" roughness={0.35} metalness={0.85} />
              </mesh>
            ))}
            {items.map((p, i) => {
              const w = widths[i];
              const px = x + w / 2;
              x += w + gap;
              const imgW = SIZES[(i + r) % SIZES.length];
              /* léger désordre : chaque cadre est un peu tourné vers le centre */
              const yaw = (cx < 0 ? 1 : -1) * (0.06 + (i % 2) * 0.05);
              return (
                <ShelfFrame
                  key={p.slug}
                  project={p}
                  texture={covers[p.slug]}
                  position={[px, SHELF_Y + 0.015, SHELF_Z - 0.04]}
                  width={imgW}
                  yaw={yaw}
                  onOpen={onOpen}
                  onHover={onHover}
                  hoverObj={hoverObj}
                  disabled={disabled}
                />
              );
            })}
          </group>
        );
      })}
    </group>
  );
}

preloadCovers('shelf');
