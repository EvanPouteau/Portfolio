'use client';

/* Résolution de rendu adaptée à la machine, partagée par les deux scènes.
   On part bas sur les petites configurations (peu de cœurs ou de mémoire),
   puis on ajuste selon la fluidité réellement mesurée : en dessous d'environ
   45 images/s la scène repasse en résolution 1 ; redevenue fluide, elle
   remonte (jamais au-delà de 1,5, invisible à l'œil et très coûteux). */

import { PerformanceMonitor } from '@react-three/drei';

const MAX_DPR = 1.5;

export function startDpr() {
  if (typeof window === 'undefined') return 1;
  const nav = navigator as Navigator & { deviceMemory?: number };
  const small = (nav.hardwareConcurrency ?? 8) <= 4 || (nav.deviceMemory ?? 8) <= 4;
  return small ? 1 : Math.min(window.devicePixelRatio || 1, MAX_DPR);
}

/** À placer dans le <Canvas> ; `onChange` reçoit la résolution à appliquer. */
export function AdaptiveQuality({ onChange }: { onChange: (dpr: number) => void }) {
  const max = Math.min(typeof window === 'undefined' ? 1 : window.devicePixelRatio || 1, MAX_DPR);
  return (
    <PerformanceMonitor
      bounds={() => [45, 58]}
      flipflops={3}
      onDecline={() => onChange(1)}
      onIncline={() => onChange(max)}
      onFallback={() => onChange(1)}
    />
  );
}
