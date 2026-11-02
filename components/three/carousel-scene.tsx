'use client';

/* Carrousel 3D des projets.
   ---------------------------------------------------------------------------
   Les couvertures sont disposées sur un anneau. On le fait tourner en
   glissant, à la molette, au clavier ou en cliquant une carte latérale ;
   cliquer la carte de face ouvre le projet. L'anneau suit une cible
   continue (pas un index modulo), si bien que passer de la dernière carte à
   la première tourne d'un cran au lieu de faire le tour complet. */

import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { MeshReflectorMaterial, RoundedBox, Sparkles } from '@react-three/drei';
import { StudioEnv } from './studio-env';
import { Warmup, useWarmup } from './warmup';
import { AdaptiveQuality, startDpr } from './quality';
import * as THREE from 'three';
import { PROJECTS } from '@/content/projects';
import { roundedRect } from './materials';
import { preloadCovers, useCovers } from './use-covers';

const N = PROJECTS.length;
const STEP = (Math.PI * 2) / N;
const CARD_W = 1.6;
const CARD_H = 1.0;
const RADIUS = ((CARD_W + 0.55) * N) / (Math.PI * 2);
/* L'anneau flotte un peu au-dessus de l'axe de visée, pour laisser le bas du
   cadre au panneau d'informations HTML. */
const LIFT = 0.32;

type Props = {
  /** Position cible de l'anneau, en nombre de cartes (non bornée). */
  target: number;
  onTarget: (t: number) => void;
  onOpen: (slug: string) => void;
};

function Card({ index, texture, ring, onPick }: {
  index: number;
  texture: THREE.Texture;
  ring: React.MutableRefObject<number>;
  onPick: (index: number) => void;
}) {
  const group = useRef<THREE.Group>(null);
  const image = useRef<THREE.MeshBasicMaterial>(null);
  const rim = useRef<THREE.MeshBasicMaterial>(null);
  const color = PROJECTS[index].three.color;
  const geo = useMemo(() => roundedRect(CARD_W, CARD_H, 0.035), []);
  const rimGeo = useMemo(() => roundedRect(CARD_W + 0.05, CARD_H + 0.05, 0.05), []);
  const reduce = useMemo(() => typeof window !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches, []);

  useFrame((state) => {
    const g = group.current;
    if (!g) return;
    const a = (index - ring.current) * STEP;
    /* distance angulaire à la face avant, ramenée dans [-π, π] */
    const d = Math.atan2(Math.sin(a), Math.cos(a));
    const front = 1 - Math.min(1, Math.abs(d) / STEP);       // 1 de face, 0 au voisin
    const t = state.clock.elapsedTime;

    g.position.set(Math.sin(a) * RADIUS, LIFT + (reduce ? 0 : Math.sin(t * 0.9 + index) * 0.025) + front * 0.06, Math.cos(a) * RADIUS);
    g.rotation.set(0, a, 0);
    g.scale.setScalar(1 + front * 0.1);

    /* les cartes qui s'éloignent s'assombrissent ; celles de dos disparaissent presque */
    const light = THREE.MathUtils.clamp(0.28 + 0.72 * (Math.cos(d) * 0.5 + 0.5) ** 1.6, 0.2, 1);
    image.current?.color.setScalar(light);
    if (rim.current) rim.current.opacity = front * 0.9;
  });

  return (
    <group ref={group} onClick={(e) => { e.stopPropagation(); onPick(index); }}
      onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { document.body.style.cursor = ''; }}>
      {/* liseré lumineux à la couleur du projet, visible sur la carte de face */}
      <mesh geometry={rimGeo} position={[0, 0, -0.012]}>
        <meshBasicMaterial ref={rim} color={color} transparent opacity={0} toneMapped={false} />
      </mesh>
      {/* dos et tranche de la carte */}
      <RoundedBox args={[CARD_W + 0.02, CARD_H + 0.02, 0.02]} radius={0.03} smoothness={2} position={[0, 0, -0.011]} castShadow>
        <meshStandardMaterial color="#1c1410" roughness={0.3} metalness={0.6} />
      </RoundedBox>
      <mesh geometry={geo}>
        <meshBasicMaterial ref={image} map={texture} toneMapped={false} />
      </mesh>
    </group>
  );
}

function Ring({ target, onTarget, onOpen }: Props) {
  const covers = useCovers('3d');
  const ring = useRef(target);
  const drag = useRef<{ x: number; start: number; moved: boolean } | null>(null);
  /* Le clic qui suit un glisser ne doit ni ouvrir ni faire tourner. */
  const justDragged = useRef(false);
  const { gl, camera } = useThree();
  const reduce = useMemo(() => typeof window !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches, []);

  /* Glisser pour tourner : on suit le doigt en direct, puis on s'aimante sur
     la carte la plus proche au relâchement. */
  useEffect(() => {
    const el = gl.domElement;
    let live = target;
    const down = (e: PointerEvent) => { justDragged.current = false; drag.current = { x: e.clientX, start: ring.current, moved: false }; live = ring.current; };
    const move = (e: PointerEvent) => {
      const d = drag.current;
      if (!d) return;
      const dx = e.clientX - d.x;
      if (Math.abs(dx) > 6) d.moved = true;
      if (d.moved) { live = d.start - dx / (el.clientWidth * 0.35); ring.current = live; }
    };
    const up = () => {
      const d = drag.current;
      drag.current = null;
      if (d?.moved) { justDragged.current = true; onTarget(Math.round(live)); }
    };
    /* molette : un cran à la fois, avec un court verrou pour ne pas filer */
    let lock = 0;
    const wheel = (e: WheelEvent) => {
      e.preventDefault();
      const now = performance.now();
      if (now < lock) return;
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (Math.abs(delta) < 4) return;
      lock = now + 380;
      onTarget(Math.round(ring.current) + Math.sign(delta));
    };
    el.addEventListener('pointerdown', down);
    addEventListener('pointermove', move);
    addEventListener('pointerup', up);
    el.addEventListener('wheel', wheel, { passive: false });
    return () => {
      el.removeEventListener('pointerdown', down);
      removeEventListener('pointermove', move);
      removeEventListener('pointerup', up);
      el.removeEventListener('wheel', wheel);
    };
  }, [gl, onTarget, target]);

  useFrame((_, dt) => {
    if (!drag.current?.moved) {
      ring.current = reduce ? target : ring.current + (target - ring.current) * (1 - Math.pow(0.002, dt));
    }
    /* Recul de la caméra selon le format : en portrait, on s'éloigne assez
       pour que la carte de face (et un peu de ses voisines) tienne en largeur. */
    const cam = camera as THREE.PerspectiveCamera;
    const halfTan = Math.tan(THREE.MathUtils.degToRad(cam.fov / 2));
    const dist = Math.max(3.1, (CARD_W * 1.1 * 1.3) / (2 * halfTan * cam.aspect));
    camera.position.z += (RADIUS + dist - camera.position.z) * 0.08;
    camera.position.x += (0 - camera.position.x) * 0.04;
    camera.position.y += (0.45 - camera.position.y) * 0.04;
    camera.lookAt(0, 0.05, RADIUS - 1);
  });

  const pick = (i: number) => {
    if (justDragged.current || drag.current?.moved) return;
    /* index le plus proche de la position actuelle, pour tourner au plus court */
    const cur = Math.round(ring.current);
    const off = ((i - cur) % N + N + N / 2) % N - N / 2;
    if (Math.abs(off) < 0.5) onOpen(PROJECTS[i].slug);
    else onTarget(cur + Math.round(off));
  };

  return (
    <group>
      {PROJECTS.map((p, i) => (
        <Card key={p.slug} index={i} texture={covers[p.slug]} ring={ring} onPick={pick} />
      ))}
    </group>
  );
}

export default function CarouselScene(props: Props) {
  const warm = useWarmup();
  const [dpr, setDpr] = useState(startDpr);
  return (
    <Canvas
      frameloop={warm.live ? 'always' : 'never'}
      style={{ opacity: warm.live ? 1 : 0, transition: 'opacity .5s ease' }}
      dpr={dpr}
      camera={{ position: [0, 0.45, RADIUS + 3.1], fov: 40 }}
      gl={{ antialias: true }}
      onCreated={({ gl }) => {
        gl.debug.checkShaderErrors = process.env.NODE_ENV !== 'production';
        gl.toneMapping = THREE.ACESFilmicToneMapping;
      }}
    >
      <color attach="background" args={['#140e0b']} />
      <fog attach="fog" args={['#140e0b', RADIUS + 2.5, RADIUS * 2 + 4]} />
      <StudioEnv {...warm.env} panels={[
        { color: '#ffffff', intensity: 1.2, position: [0, 3, 2], scale: [6, 2], target: [0, 0, 0] },
        { color: '#ffb98a', intensity: 0.6, position: [-4, 1, 1], scale: [2, 3], target: [0, 0, 0] },
      ]} />
      <ambientLight intensity={0.5} />

      <Ring {...props} />

      {/* sol miroir : il reflète les couvertures, flouté comme un sol laqué */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, LIFT - CARD_H / 2 - 0.16, 0]}>
        <planeGeometry args={[30, 30]} />
        <MeshReflectorMaterial
          resolution={256}
          blur={[400, 120]}
          mixBlur={1}
          mixStrength={6}
          depthScale={1}
          minDepthThreshold={0.85}
          color="#120c09"
          metalness={0.6}
          roughness={0.9}
          mirror={0.6}
        />
      </mesh>
      <Sparkles count={30} scale={[RADIUS * 3, 3, RADIUS * 3]} size={1.6} speed={0.25} opacity={0.35} color="#ffd2a0" />
      <AdaptiveQuality onChange={setDpr} />
      <Warmup {...warm.warmup} />
    </Canvas>
  );
}

preloadCovers('3d');
