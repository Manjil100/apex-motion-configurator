"use client";

import { ContactShadows, Environment, Lightformer, MeshReflectorMaterial } from "@react-three/drei";
import { ENVIRONMENTS, type EnvironmentId } from "@/lib/showroom/environments";
import { QUALITY, type QualityTier } from "@/lib/showroom/quality";

/** The room: background, generated environment map, key light, reflective floor and contact shadow. */
export function Studio({ environment, tier }: { environment: EnvironmentId; tier: QualityTier }) {
  const rig = ENVIRONMENTS[environment];
  const q = QUALITY[tier];

  return (
    <>
      <color attach="background" args={[rig.background]} />
      <fog attach="fog" args={[rig.background, 14, 34]} />
      <ambientLight intensity={rig.ambient} />
      <directionalLight
        position={rig.key.position}
        intensity={rig.key.intensity}
        color={rig.key.color}
        castShadow={q.shadows}
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0004}
      />

      {/* key forces a rebuild of the environment map when the rig or quality changes */}
      <Environment key={`${environment}-${tier}`} resolution={q.environmentResolution} frames={1}>
        <color attach="background" args={[rig.background]} />
        {rig.panels.map((p, i) => (
          <Lightformer key={i} form="rect" position={p.position} scale={p.scale} rotation={p.rotation} color={p.color} intensity={p.intensity} />
        ))}
      </Environment>

      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[40, 64]} />
        {q.reflectorResolution > 0 ? (
          <MeshReflectorMaterial
            key={`${environment}-${q.reflectorResolution}`}
            color={rig.floor}
            resolution={q.reflectorResolution}
            blur={[q.reflectorBlur, q.reflectorBlur / 4]}
            mixBlur={1}
            mixStrength={environment === "day" ? 6 : 14}
            roughness={0.75}
            metalness={0.5}
            depthScale={1}
            minDepthThreshold={0.4}
            maxDepthThreshold={1.2}
            mirror={0}
          />
        ) : (
          <meshStandardMaterial color={rig.floor} roughness={0.55} metalness={0.4} />
        )}
      </mesh>

      <ContactShadows
        position={[0, 0.005, 0]}
        scale={12}
        far={3}
        blur={2.4}
        opacity={environment === "day" ? 0.5 : 0.75}
        resolution={q.contactShadowResolution}
        frames={1}
      />
    </>
  );
}
