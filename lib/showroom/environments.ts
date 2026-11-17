/**
 * Lighting rigs. Built from light panels in code, so no HDR files are
 * downloaded. A vehicle's manifest names its default rig.
 */
export type EnvironmentId = "studio" | "day" | "night";

export interface Panel {
  position: [number, number, number];
  scale: [number, number, number];
  rotation?: [number, number, number];
  color: string;
  intensity: number;
}

export interface EnvironmentRig {
  background: string;
  floor: string;
  ambient: number;
  key: { position: [number, number, number]; intensity: number; color: string };
  panels: Panel[];
}

const overhead = (intensity: number, color = "#ffffff"): Panel[] => [
  { position: [0, 5, 0], scale: [9, 1.2, 1], rotation: [Math.PI / 2, 0, 0], color, intensity },
  { position: [0, 5, -3.2], scale: [9, 0.6, 1], rotation: [Math.PI / 2, 0, 0], color, intensity: intensity * 0.6 },
  { position: [0, 5, 3.2], scale: [9, 0.6, 1], rotation: [Math.PI / 2, 0, 0], color, intensity: intensity * 0.6 },
];

export const ENVIRONMENTS: Record<EnvironmentId, EnvironmentRig> = {
  studio: {
    background: "#090a0c",
    floor: "#0b0c0e",
    ambient: 0.25,
    key: { position: [4, 7, 5], intensity: 2.2, color: "#ffffff" },
    panels: [
      ...overhead(5),
      { position: [-7, 2, 1], scale: [5, 3, 1], rotation: [0, Math.PI / 2, 0], color: "#dfe6f2", intensity: 1.6 },
      { position: [7, 2, -1], scale: [5, 3, 1], rotation: [0, -Math.PI / 2, 0], color: "#ffffff", intensity: 1.1 },
    ],
  },
  day: {
    background: "#aeb9c6",
    floor: "#7d858f",
    ambient: 0.9,
    key: { position: [6, 9, 3], intensity: 3.4, color: "#fff4e2" },
    panels: [
      { position: [0, 8, 0], scale: [30, 30, 1], rotation: [Math.PI / 2, 0, 0], color: "#cfe0f5", intensity: 2.2 },
      { position: [9, 6, 4], scale: [4, 4, 1], rotation: [0, -Math.PI / 3, 0], color: "#fff1d6", intensity: 9 },
      { position: [0, 1.5, -10], scale: [30, 4, 1], color: "#e9eef4", intensity: 1.2 },
    ],
  },
  night: {
    background: "#030407",
    floor: "#050609",
    ambient: 0.06,
    key: { position: [-3, 6, 4], intensity: 0.9, color: "#b9c8ff" },
    panels: [
      { position: [0, 5, 0], scale: [7, 0.35, 1], rotation: [Math.PI / 2, 0, 0], color: "#dfe6ff", intensity: 6 },
      { position: [-6, 1.2, -3], scale: [0.3, 3, 1], rotation: [0, Math.PI / 3, 0], color: "#8f6bff", intensity: 12 },
      { position: [6, 1.2, -3], scale: [0.3, 3, 1], rotation: [0, -Math.PI / 3, 0], color: "#5d7cff", intensity: 8 },
    ],
  },
};

export const isEnvironmentId = (v: string | undefined): v is EnvironmentId => v === "studio" || v === "day" || v === "night";
