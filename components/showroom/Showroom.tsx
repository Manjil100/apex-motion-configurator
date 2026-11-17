"use client";

import { Component, Suspense, useEffect, type ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import { PerformanceMonitor, useProgress } from "@react-three/drei";
import { ACESFilmicToneMapping } from "three";
import type { Vehicle } from "@/lib/vehicles/types";
import type { EnvironmentId } from "@/lib/showroom/environments";
import type { PaintProps } from "@/lib/showroom/materials";
import { detectTier, lowerTier, QUALITY } from "@/lib/showroom/quality";
import { DEFAULT_CAMERAS } from "@/lib/showroom/cameras";
import { useShowroom } from "@/stores/showroom";
import { Studio } from "./Studio";
import { CameraRig } from "./CameraRig";
import { SampleForm } from "./SampleForm";
import { VehicleModel } from "./VehicleModel";

export interface ShowroomLook {
  paint: PaintProps;
  caliper: string;
  leather: string;
  stitching: string;
  environment: EnvironmentId;
}

class ModelBoundary extends Component<{ children: ReactNode; onError: (message: string) => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: Error) {
    this.props.onError(error.message);
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/** Reports real download progress for a vehicle model to the DOM overlay. */
function ProgressReporter({ onProgress }: { onProgress: (percent: number | null) => void }) {
  const { active, progress } = useProgress();
  useEffect(() => {
    onProgress(active ? Math.round(progress) : null);
  }, [active, progress, onProgress]);
  return null;
}

export default function Showroom({
  vehicle,
  look,
  onProgress,
  onModelError,
}: {
  vehicle: Vehicle;
  look: ShowroomLook;
  onProgress: (percent: number | null) => void;
  onModelError: (message: string) => void;
}) {
  const tier = useShowroom((s) => s.tier);
  const setTier = useShowroom((s) => s.setTier);
  const setCanvas = useShowroom((s) => s.setCanvas);
  const q = QUALITY[tier];
  const start = vehicle.asset.cameras.threeQuarter ?? DEFAULT_CAMERAS.threeQuarter;
  const { asset } = vehicle;

  useEffect(() => {
    setTier(detectTier());
    return () => setCanvas(null);
  }, [setTier, setCanvas]);

  return (
    <Canvas
      shadows={q.shadows}
      dpr={q.dpr}
      camera={{ position: start.position, fov: start.fov ?? 34, near: 0.1, far: 120 }}
      // preserveDrawingBuffer lets Download image read back the frame that is on screen.
      gl={{ antialias: tier !== "low", preserveDrawingBuffer: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.toneMapping = ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
        setCanvas(gl.domElement);
      }}
      aria-label={`Interactive 3D studio for the ${vehicle.manufacturer} ${vehicle.model}. Drag to rotate, scroll to zoom.`}
      role="img"
    >
      <PerformanceMonitor onDecline={() => setTier(lowerTier(useShowroom.getState().tier))} flipflops={2} />
      <Studio environment={look.environment} tier={tier} />
      <CameraRig asset={asset} />
      <ProgressReporter onProgress={onProgress} />

      {asset.modelUrl ? (
        <ModelBoundary key={asset.modelUrl} onError={onModelError}>
          <Suspense fallback={null}>
            <VehicleModel
              asset={{ ...asset, modelUrl: asset.modelUrl }}
              paint={look.paint}
              caliper={look.caliper}
              leather={look.leather}
              stitching={look.stitching}
            />
          </Suspense>
        </ModelBoundary>
      ) : (
        <SampleForm paint={look.paint} caliper={look.caliper} leather={look.leather} stitching={look.stitching} />
      )}
    </Canvas>
  );
}
