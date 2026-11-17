"use client";

import { useEffect, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { Color, type Material, type MeshPhysicalMaterial } from "three";
import type { VehicleAsset } from "@/lib/vehicles/types";
import { applyToSlot, disposeObject } from "@/lib/vehicles/slots";
import type { PaintProps } from "@/lib/showroom/materials";

const hasColor = (m: Material): m is Material & { color: Color } => (m as { color?: Color }).color instanceof Color;

/**
 * Loads a vehicle GLB and drives its materials through the manifest's slot
 * mapping. Mounted only when `asset.modelUrl` is set, so no model is fetched
 * until its car is opened. On unmount the scene is disposed and dropped from
 * the loader cache, which is what prevents leaks when switching cars.
 *
 * Not yet exercised with a real asset: no licensed model exists. The slot
 * logic it relies on is unit-tested in tests/slots.test.ts.
 */
export function VehicleModel({
  asset,
  paint,
  caliper,
  leather,
  stitching,
}: {
  asset: VehicleAsset & { modelUrl: string };
  paint: PaintProps;
  caliper: string;
  leather: string;
  stitching: string;
}) {
  const gltf = useGLTF(asset.modelUrl);
  // Clone so edits never leak into the cached original.
  const scene = useMemo(() => {
    const copy = gltf.scene.clone(true);
    copy.traverse((node) => {
      const mesh = node as { isMesh?: boolean; material?: Material | Material[]; castShadow?: boolean; receiveShadow?: boolean };
      if (!mesh.isMesh || !mesh.material) return;
      mesh.material = Array.isArray(mesh.material) ? mesh.material.map((m) => m.clone()) : mesh.material.clone();
      mesh.castShadow = true;
      mesh.receiveShadow = true;
    });
    return copy;
  }, [gltf.scene]);

  useEffect(() => {
    applyToSlot(scene, asset.slots.car_body, (m) => {
      if (!hasColor(m)) return;
      m.color.set(paint.color);
      const p = m as Partial<MeshPhysicalMaterial>;
      if ("metalness" in m) p.metalness = paint.metalness;
      if ("roughness" in m) p.roughness = paint.roughness;
      if ("clearcoat" in m) {
        p.clearcoat = paint.clearcoat;
        p.clearcoatRoughness = paint.clearcoatRoughness;
      }
    });
  }, [scene, asset.slots.car_body, paint]);

  useEffect(() => {
    const tint = (colour: string) => (m: Material) => {
      if (hasColor(m)) m.color.set(colour);
    };
    applyToSlot(scene, asset.slots.brake_calipers, tint(caliper));
    applyToSlot(scene, asset.slots.seats, tint(leather));
    applyToSlot(scene, asset.slots.stitching, tint(stitching));
  }, [scene, asset.slots, caliper, leather, stitching]);

  useEffect(() => {
    const url = asset.modelUrl;
    return () => {
      disposeObject(scene);
      useGLTF.clear(url);
    };
  }, [scene, asset.modelUrl]);

  return <primitive object={scene} />;
}
