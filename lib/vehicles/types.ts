/**
 * Vehicle data model.
 *
 * Rule that runs through the whole project: nothing is presented as fact
 * unless it has been checked. Every value that could be mistaken for a
 * manufacturer figure carries a `Sourced<T>` wrapper saying where it stands.
 */

export type SourceStatus =
  /** Checked against a manufacturer source; `source` says which. */
  | "verified"
  /** Widely published and believed correct, not yet checked by us. */
  | "unverified"
  /** Made up for layout and testing. Must be labelled in the interface. */
  | "illustrative";

export interface Sourced<T> {
  value: T;
  status: SourceStatus;
  source?: string;
}

export type BodyStyle = "Coupé" | "Sportback" | "Supercar";
export type Drivetrain = "RWD" | "AWD";

export interface VehicleSpec {
  label: string;
  /** null means we have no figure yet and show "To be verified". */
  detail: Sourced<string> | null;
}

/** Generic slots the configurator understands. A model maps its real mesh and material names onto these. */
export type MeshSlot =
  | "car_body"
  | "front_bumper"
  | "rear_bumper"
  | "wheels"
  | "brake_calipers"
  | "brake_discs"
  | "glass"
  | "headlights"
  | "taillights"
  | "seats"
  | "stitching"
  | "dashboard"
  | "steering_wheel"
  | "centre_console"
  | "interior_trim";

export type SlotMapping =
  | { supported: true; nodes: string[]; materials: string[] }
  | { supported: false; reason: string };

export interface CameraPreset {
  position: [number, number, number];
  target: [number, number, number];
  fov?: number;
}

export type AssetStatus =
  /** No model chosen or licensed yet. Configurator shows the empty studio. */
  | "pending"
  /** Development stand-in. Must be labelled as a placeholder wherever shown. */
  | "placeholder"
  /** Purchased, inspected and signed off in docs/asset-reports. */
  | "verified";

export interface VehicleAsset {
  status: AssetStatus;
  /** Path or URL of the GLB once one exists. */
  modelUrl: string | null;
  licence: { vendor: string; listing: string; terms: string; commercialUse: boolean } | null;
  slots: Partial<Record<MeshSlot, SlotMapping>>;
  cameras: Partial<Record<"front" | "rear" | "side" | "threeQuarter" | "interior", CameraPreset>>;
  lighting: { defaultEnvironment: "studio" | "day" | "night" };
}

export interface Vehicle {
  slug: string;
  manufacturer: string;
  model: string;
  /** Variant targeted for the 3D asset, e.g. "992.2 Carrera T". */
  variant: string;
  generation: string;
  modelYear: Sourced<number>;
  bodyStyle: BodyStyle;
  drivetrain: Sourced<Drivetrain>;
  layout: Sourced<string>;
  engine: Sourced<string>;
  summary: string;
  /** null until a price has been checked. Never display an invented price as real. */
  basePrice: Sourced<number> | null;
  specs: VehicleSpec[];
  asset: VehicleAsset;
}
