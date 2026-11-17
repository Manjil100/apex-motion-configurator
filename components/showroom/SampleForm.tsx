"use client";

import { RoundedBox } from "@react-three/drei";
import type { PaintProps } from "@/lib/showroom/materials";

/**
 * DEVELOPMENT PLACEHOLDER. Not a vehicle and never presented as one.
 *
 * A material sample board that stands in the studio until a licensed,
 * verified car model exists: one large painted form and three smaller
 * samples. Its only job is to prove that lighting, cameras and material
 * changes work on real geometry. The interface labels it wherever it shows.
 */
export function SampleForm({
  paint,
  caliper,
  leather,
  stitching,
}: {
  paint: PaintProps;
  caliper: string;
  leather: string;
  stitching: string;
}) {
  return (
    <group>
      {/* plinth */}
      <mesh position={[0, 0.04, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[2.5, 2.55, 0.08, 96]} />
        <meshStandardMaterial color="#17191d" metalness={0.7} roughness={0.35} />
      </mesh>

      {/* paint sample: a long pebble with soft and tight curvature, so a finish shows both highlights and falloff */}
      <group position={[-0.35, 0.72, 0]} rotation={[0, 0.25, 0]}>
        <mesh scale={[1.55, 0.6, 0.8]} castShadow receiveShadow>
          <sphereGeometry args={[1, 96, 64]} />
          <meshPhysicalMaterial {...paint} envMapIntensity={1.15} />
        </mesh>
      </group>

      {/* caliper colour: gloss enamel sphere */}
      <mesh position={[1.75, 0.34, 0.75]} castShadow>
        <sphereGeometry args={[0.26, 48, 32]} />
        <meshPhysicalMaterial color={caliper} roughness={0.25} metalness={0.2} clearcoat={1} clearcoatRoughness={0.05} />
      </mesh>

      {/* leather: soft block with a stitched seam */}
      <group position={[1.6, 0.33, -0.55]} rotation={[0, -0.5, 0]}>
        <RoundedBox args={[0.7, 0.5, 0.7]} radius={0.12} smoothness={6} castShadow>
          <meshStandardMaterial color={leather} roughness={0.78} metalness={0} />
        </RoundedBox>
        <mesh position={[0, 0.252, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.5, 0.018]} />
          <meshStandardMaterial color={stitching} roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.252, 0.06]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.5, 0.018]} />
          <meshStandardMaterial color={stitching} roughness={0.9} />
        </mesh>
      </group>
    </group>
  );
}
