"use client";

import { useEffect, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { Color, MeshPhysicalMaterial, MeshStandardMaterial, type Material } from "three";
import type { VehicleAsset } from "@/lib/vehicles/types";
import { applyToSlot, applyVisibility, disposeObject, materialsForSlot } from "@/lib/vehicles/slots";
import type { PaintProps, TrimProps } from "@/lib/showroom/materials";

const hasColor = (m: Material): m is Material & { color: Color } => (m as { color?: Color }).color instanceof Color;

/** glTF paint usually arrives as a standard material. Paint needs clearcoat, so body materials are upgraded. */
function toPhysical(m: MeshStandardMaterial): MeshPhysicalMaterial {
  const p = new MeshPhysicalMaterial();
  MeshStandardMaterial.prototype.copy.call(p, m);
  p.defines = { STANDARD: "", PHYSICAL: "" };
  p.name = m.name;
  return p;
}

export interface ModelLook {
  paint: PaintProps;
  caliper: string;
  leather: string;
  stitching: string;
  trim: TrimProps;
  wheels: string;
  body: string[];
}

/**
 * Loads a vehicle GLB and drives it through the manifest: colours and finishes
 * by slot, wheels and body parts by node visibility. Mounted only when
 * `asset.modelUrl` is set, so nothing is fetched until a car is opened. On
 * unmount the scene is disposed and dropped from the loader cache.
 */
export function VehicleModel({ asset, look }: { asset: VehicleAsset & { modelUrl: string }; look: ModelLook }) {
  const gltf = useGLTF(asset.modelUrl);

  // Clone so edits never leak into the cached original.
  const scene = useMemo(() => {
    const copy = gltf.scene.clone(true);
    const body = new Set(materialsForSlot(gltf.scene, asset.slots.car_body));
    copy.traverse((node) => {
      const mesh = node as { isMesh?: boolean; material?: Material | Material[]; castShadow?: boolean; receiveShadow?: boolean };
      if (!mesh.isMesh || !mesh.material) return;
      const convert = (m: Material) =>
        body.has(m) && m instanceof MeshStandardMaterial && !(m instanceof MeshPhysicalMaterial) ? toPhysical(m) : m.clone();
      mesh.material = Array.isArray(mesh.material) ? mesh.material.map(convert) : convert(mesh.material);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
    });
    return copy;
  }, [gltf.scene, asset.slots.car_body]);

  const { paint, caliper, leather, stitching, trim, wheels, body } = look;

  useEffect(() => {
    applyToSlot(scene, asset.slots.car_body, (m) => {
      if (!hasColor(m)) return;
      m.color.set(paint.color);
      if (m instanceof MeshStandardMaterial) {
        m.metalness = paint.metalness;
        m.roughness = paint.roughness;
      }
      if (m instanceof MeshPhysicalMaterial) {
        m.clearcoat = paint.clearcoat;
        m.clearcoatRoughness = paint.clearcoatRoughness;
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
    applyToSlot(scene, asset.slots.interior_trim, (m) => {
      if (!(m instanceof MeshStandardMaterial)) return;
      m.color.set(trim.color);
      m.metalness = trim.metalness;
      m.roughness = trim.roughness;
    });
  }, [scene, asset.slots, caliper, leather, stitching, trim]);

  useEffect(() => {
    applyVisibility(scene, asset.visibility?.wheels, [wheels]);
    applyVisibility(scene, asset.visibility?.body, body);
  }, [scene, asset.visibility, wheels, body]);

  useEffect(() => {
    const url = asset.modelUrl;
    return () => {
      disposeObject(scene);
      useGLTF.clear(url);
    };
  }, [scene, asset.modelUrl]);

  return <primitive object={scene} />;
}
