"use client";

import { useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import gsap from "gsap";
import { Vector3 } from "three";
import type { VehicleAsset } from "@/lib/vehicles/types";
import { clampDistance, fitFactor, ORBIT_LIMITS, resolveCamera, scalePreset } from "@/lib/showroom/cameras";
import { useShowroom } from "@/stores/showroom";

/**
 * Orbit controls plus animated moves between named views.
 * Drag rotates, scroll or pinch zooms. Limits keep the camera above the floor
 * and outside the subject, which is what stops it clipping through geometry.
 */
export function CameraRig({ asset }: { asset: VehicleAsset }) {
  const controls = useRef<OrbitControlsImpl>(null);
  const camera = useThree((s) => s.camera);
  const invalidate = useThree((s) => s.invalidate);
  const aspect = useThree((s) => s.size.width / Math.max(1, s.size.height));
  const framed = useRef(false);
  const command = useShowroom((s) => s.command);
  const setActiveView = useShowroom((s) => s.setActiveView);
  const handled = useRef(0);

  useEffect(() => {
    if (!command || command.id === handled.current || !controls.current) return;
    handled.current = command.id;
    const ctl = controls.current;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const duration = reduced ? 0 : 1.1;

    const flyTo = (position: [number, number, number], target: [number, number, number]) => {
      gsap.killTweensOf([camera.position, ctl.target]);
      const tick = () => {
        ctl.update();
        invalidate();
      };
      gsap.to(camera.position, { x: position[0], y: position[1], z: position[2], duration, ease: "power3.inOut", onUpdate: tick });
      gsap.to(ctl.target, { x: target[0], y: target[1], z: target[2], duration, ease: "power3.inOut", onUpdate: tick, onComplete: tick });
    };

    if (command.type === "view" || command.type === "reset") {
      const view = command.type === "reset" ? "threeQuarter" : command.view;
      const preset = resolveCamera(asset, view);
      if (!preset) return;
      setActiveView(view);
      const fitted = view === "interior" ? preset : scalePreset(preset, fitFactor(aspect));
      flyTo(fitted.position, fitted.target);
    } else {
      const offset = new Vector3().subVectors(camera.position, ctl.target);
      const next = offset.setLength(clampDistance(offset.length() * command.factor)).add(ctl.target);
      flyTo([next.x, next.y, next.z], [ctl.target.x, ctl.target.y, ctl.target.z]);
    }
  }, [command, asset, camera, invalidate, setActiveView, aspect]);

  // First frame: place the camera for this viewport's shape, with no animation.
  useEffect(() => {
    if (framed.current || !controls.current) return;
    const preset = resolveCamera(asset, "threeQuarter");
    if (!preset) return;
    framed.current = true;
    const fitted = scalePreset(preset, fitFactor(aspect));
    camera.position.set(...fitted.position);
    controls.current.target.set(...fitted.target);
    controls.current.update();
    invalidate();
  }, [asset, aspect, camera, invalidate]);

  useEffect(() => () => void gsap.killTweensOf(camera.position), [camera]);

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enablePan={false}
      enableDamping
      dampingFactor={0.08}
      rotateSpeed={0.7}
      target={[0, 0.6, 0]}
      onStart={() => setActiveView(null)}
      {...ORBIT_LIMITS}
    />
  );
}
