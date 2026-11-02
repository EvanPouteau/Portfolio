'use client';

/* Un cadre photo : baguette de bois, passe-partout clair et la couverture du
   projet derrière une vitre qui accroche les reflets. */

import { useMemo } from 'react';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { roundedRect } from './materials';

export function PhotoFrame({
  texture,
  width = 0.32,
  frame = '#2b2119',
  mat = '#f2eee6',
  glass = true,
}: {
  texture: THREE.Texture;
  /** Largeur de l'image, en mètres. Le cadre suit le format 16:10 des couvertures. */
  width?: number;
  frame?: string;
  mat?: string;
  glass?: boolean;
}) {
  const h = width / 1.6;
  const border = width * 0.11;
  const moulding = width * 0.045;
  const outerW = width + border * 2 + moulding * 2;
  const outerH = h + border * 2 + moulding * 2;
  const image = useMemo(() => roundedRect(width, h, width * 0.012), [width, h]);

  return (
    <group>
      {/* baguette */}
      <RoundedBox args={[outerW, outerH, 0.022]} radius={0.006} smoothness={1} castShadow receiveShadow>
        <meshStandardMaterial color={frame} roughness={0.55} metalness={0.05} />
      </RoundedBox>
      {/* passe-partout */}
      <mesh position={[0, 0, 0.0112]}>
        <planeGeometry args={[width + border * 2, h + border * 2]} />
        <meshStandardMaterial color={mat} roughness={0.95} />
      </mesh>
      {/* image */}
      <mesh geometry={image} position={[0, 0, 0.0116]}>
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
      {/* vitre : quasi invisible, ne fait qu'attraper les reflets de l'environnement */}
      {glass && (
        <mesh position={[0, 0, 0.0122]}>
          <planeGeometry args={[width + border * 2, h + border * 2]} />
          <meshStandardMaterial transparent opacity={0.08} roughness={0.05} metalness={0} envMapIntensity={1.4} depthWrite={false} />
        </mesh>
      )}
    </group>
  );
}

/** Dimensions extérieures d'un cadre, utiles pour le poser sur une étagère. */
export function frameSize(width: number) {
  const h = width / 1.6;
  const border = width * 0.11;
  const moulding = width * 0.045;
  return { w: width + border * 2 + moulding * 2, h: h + border * 2 + moulding * 2 };
}
