"use client";

import dynamic from "next/dynamic";
import { useCallback, useRef, useState, useSyncExternalStore } from "react";
import { clsx } from "clsx";
import type { Vehicle } from "@/lib/vehicles/types";
import { resolveCamera, type ViewId } from "@/lib/showroom/cameras";
import { isWebGLAvailable } from "@/lib/showroom/quality";
import { useShowroom } from "@/stores/showroom";
import { StudioBay } from "@/components/ui/StudioBay";
import { LogoMark } from "@/components/brand/Logo";
import type { ShowroomLook } from "./Showroom";

function StudioLoader({ label, percent }: { label: string; percent?: number | null }) {
  return (
    <div role="status" className="absolute inset-0 z-10 grid place-items-center bg-carbon">
      <div className="w-56 text-center">
        <LogoMark className="mx-auto h-10 w-10 text-chalk" />
        <p className="type-label mt-5">{label}</p>
        <div className="mt-4 h-px w-full overflow-hidden bg-line">
          <div
            className={clsx("h-full bg-chalk transition-[width] duration-300", percent == null && "w-1/3 animate-pulse")}
            style={percent != null ? { width: `${percent}%` } : undefined}
          />
        </div>
        {percent != null && <p className="mt-2 text-[0.8125rem] text-steel">{percent}%</p>}
      </div>
    </div>
  );
}

// The 3D bundle (three.js and friends) is fetched only when a configurator opens.
const Showroom = dynamic(() => import("./Showroom"), {
  ssr: false,
  loading: () => <StudioLoader label="Opening the studio" />,
});

const subscribe = () => () => {};
const useWebGL = () =>
  useSyncExternalStore<boolean | null>(
    subscribe,
    () => isWebGLAvailable(),
    () => null,
  );

const VIEWS: { id: ViewId; label: string }[] = [
  { id: "threeQuarter", label: "Three-quarter" },
  { id: "front", label: "Front" },
  { id: "side", label: "Side" },
  { id: "rear", label: "Rear" },
  { id: "interior", label: "Interior" },
];

const controlClass =
  "h-9 border border-line bg-carbon/75 px-3 text-[0.8125rem] text-silver backdrop-blur transition-colors hover:border-steel hover:text-chalk disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:border-line disabled:hover:text-silver";

export function ShowroomStage({
  vehicle,
  look,
  children,
}: {
  vehicle: Vehicle;
  look: ShowroomLook;
  children?: React.ReactNode;
}) {
  const webgl = useWebGL();
  const frame = useRef<HTMLDivElement>(null);
  const send = useShowroom((s) => s.send);
  const activeView = useShowroom((s) => s.activeView);
  const [percent, setPercent] = useState<number | null>(null);
  const [modelError, setModelError] = useState<string | null>(null);
  const onProgress = useCallback((p: number | null) => setPercent(p), []);
  const onModelError = useCallback((m: string) => setModelError(m), []);

  const fullscreen = () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void frame.current?.requestFullscreen?.();
  };

  if (webgl === false) {
    return (
      <StudioBay vehicle={vehicle} size="stage" showStatus={false} className="flex-1">
        {children}
        <div className="absolute inset-x-5 bottom-6 mx-auto max-w-md border border-line bg-carbon/85 p-4 backdrop-blur">
          <p className="font-medium text-chalk">This device cannot run the 3D studio</p>
          <p className="mt-1 text-[0.875rem] text-silver">
            Your browser did not provide WebGL, so the interactive view is off. You can still choose options, see the
            price and save your build. Try a current browser with hardware acceleration switched on.
          </p>
        </div>
      </StudioBay>
    );
  }

  return (
    <div ref={frame} className="relative flex-1 overflow-hidden bg-carbon">
      {webgl && (
        <div className="absolute inset-0 touch-none">
          <Showroom vehicle={vehicle} look={look} onProgress={onProgress} onModelError={onModelError} />
        </div>
      )}
      {(webgl === null || percent !== null) && (
        <StudioLoader label={percent !== null ? `Loading the ${vehicle.model}` : "Opening the studio"} percent={percent} />
      )}

      {/* keeps the title legible over bright environments */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-carbon/85 to-transparent" />
      {children}

      {modelError && (
        <div role="alert" className="absolute inset-x-5 top-24 mx-auto max-w-md border border-flag bg-carbon/90 p-4">
          <p className="font-medium text-chalk">The {vehicle.model} model did not load</p>
          <p className="mt-1 text-[0.875rem] text-silver">
            Check your connection and reload the page. If it keeps failing, the model file may be missing. Details:{" "}
            {modelError}
          </p>
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-center justify-center gap-1 p-3">
        {VIEWS.map((v) => {
          const available = resolveCamera(vehicle.asset, v.id) !== null;
          return (
            <button
              key={v.id}
              type="button"
              disabled={!available}
              aria-pressed={activeView === v.id}
              title={available ? undefined : "Interior view needs a vehicle model with a cabin"}
              onClick={() => send({ type: "view", view: v.id })}
              className={clsx(controlClass, activeView === v.id && "border-volt text-chalk")}
            >
              {v.label}
            </button>
          );
        })}
      </div>

      <div className="absolute right-3 top-1/2 flex -translate-y-1/2 flex-col gap-1">
        <button type="button" className={controlClass} aria-label="Zoom in" onClick={() => send({ type: "zoom", factor: 0.8 })}>
          +
        </button>
        <button type="button" className={controlClass} aria-label="Zoom out" onClick={() => send({ type: "zoom", factor: 1.25 })}>
          −
        </button>
        <button type="button" className={controlClass} aria-label="Reset camera" title="Reset camera" onClick={() => send({ type: "reset" })}>
          ⟲
        </button>
        <button type="button" className={controlClass} aria-label="Toggle full screen" title="Full screen" onClick={fullscreen}>
          ⛶
        </button>
      </div>
    </div>
  );
}
