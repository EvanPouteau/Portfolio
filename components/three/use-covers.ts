'use client';

/* Charge les couvertures de tous les projets en textures, une seule fois. */

import { useMemo } from 'react';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { PROJECTS } from '@/content/projects';

/* Deux tailles réservées à la 3D, jamais la couverture 1600 px :
   - `shelf` (512 px) : les cadres de l'étagère, qui occupent une centaine de
     pixels à l'écran — quatre fois moins à télécharger et à envoyer au GPU ;
   - `3d` (1024 px) : les cartes du carrousel, vues de près. */
export type CoverSize = 'shelf' | '3d';

const urls = (size: CoverSize) =>
  PROJECTS.map((p) => (p.cover ? p.cover.replace('/assets/covers/', `/assets/covers/${size}/`) : '/assets/og.png?v=2'));

export function useCovers(size: CoverSize): Record<string, THREE.Texture> {
  const list = useMemo(() => urls(size), [size]);
  const textures = useTexture(list) as THREE.Texture[];
  return useMemo(() => {
    const out: Record<string, THREE.Texture> = {};
    textures.forEach((t, i) => {
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 8;
      out[PROJECTS[i].slug] = t;
    });
    return out;
  }, [textures]);
}

/** À appeler au chargement du module de la scène : les images partent
 *  avant même le montage. */
export function preloadCovers(size: CoverSize) {
  urls(size).forEach((u) => useTexture.preload(u));
}
