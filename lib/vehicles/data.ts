import type { Sourced, Vehicle, VehicleAsset, VehicleSpec } from "./types";

/**
 * Phase 1 catalogue. This file is the seed for the `vehicles` table that
 * arrives with Supabase in Phase 6; the shape matches lib/vehicles/types.ts.
 *
 * Identity facts (generation, layout, engine type) are marked "unverified":
 * they are widely published but have not been checked against a manufacturer
 * source by this project. Performance figures, dimensions and prices are
 * deliberately absent until they are verified.
 */

const u = <T,>(value: T): Sourced<T> => ({ value, status: "unverified" });

const pendingAsset: VehicleAsset = {
  status: "pending",
  modelUrl: null,
  licence: null,
  slots: {},
  cameras: {},
  lighting: { defaultEnvironment: "studio" },
};

const pendingSpecs: VehicleSpec[] = [
  { label: "Power", detail: null },
  { label: "Torque", detail: null },
  { label: "0–100 km/h", detail: null },
  { label: "Top speed", detail: null },
  { label: "Kerb weight", detail: null },
  { label: "Length", detail: null },
  { label: "Width", detail: null },
  { label: "Height", detail: null },
  { label: "Wheelbase", detail: null },
];

type Seed = Omit<Vehicle, "basePrice" | "specs" | "asset">;

const seeds: Seed[] = [
  {
    slug: "porsche-911",
    manufacturer: "Porsche",
    model: "911",
    variant: "Carrera T",
    generation: "992.2",
    modelYear: u(2026),
    bodyStyle: "Coupé",
    drivetrain: u("RWD"),
    layout: u("Rear-engine"),
    engine: u("3.0 L twin-turbo flat-six"),
    summary:
      "The driver-focused take on the current 911: lighter trim, a manual gearbox and the engine where it has always been.",
  },
  {
    slug: "bmw-m4",
    manufacturer: "BMW",
    model: "M4",
    variant: "Competition",
    generation: "G82",
    modelYear: u(2021),
    bodyStyle: "Coupé",
    drivetrain: u("RWD"),
    layout: u("Front-engine"),
    engine: u("3.0 L twin-turbo inline-six"),
    summary:
      "A long-bonnet coupé built around a straight-six, with a stance that splits opinion and a chassis that settles it.",
  },
  {
    slug: "nissan-gt-r",
    manufacturer: "Nissan",
    model: "GT-R",
    variant: "NISMO",
    generation: "R35",
    modelYear: u(2024),
    bodyStyle: "Coupé",
    drivetrain: u("AWD"),
    layout: u("Front-engine"),
    engine: u("3.8 L twin-turbo V6"),
    summary:
      "The final evolution of a car that spent seventeen years embarrassing more expensive machinery with grip and a hand-built V6.",
  },
  {
    slug: "ferrari-488",
    manufacturer: "Ferrari",
    model: "488",
    variant: "GTB",
    generation: "F142M",
    modelYear: u(2016),
    bodyStyle: "Supercar",
    drivetrain: u("RWD"),
    layout: u("Mid-engine"),
    engine: u("3.9 L twin-turbo V8"),
    summary:
      "The berlinetta that brought turbocharging back to Maranello's mid-engined V8 line, shaped as much by airflow as by eye.",
  },
  {
    slug: "audi-rs7",
    manufacturer: "Audi",
    model: "RS7",
    variant: "Sportback",
    generation: "C8",
    modelYear: u(2020),
    bodyStyle: "Sportback",
    drivetrain: u("AWD"),
    layout: u("Front-engine"),
    engine: u("4.0 L twin-turbo V8"),
    summary:
      "Five doors, four seats and a twin-turbo V8 under a fastback roofline. The practical one, on paper.",
  },
  {
    slug: "toyota-supra",
    manufacturer: "Toyota",
    model: "GR Supra",
    variant: "3.0",
    generation: "A90",
    modelYear: u(2020),
    bodyStyle: "Coupé",
    drivetrain: u("RWD"),
    layout: u("Front-engine"),
    engine: u("3.0 L turbo inline-six"),
    summary:
      "A short wheelbase, a double-bubble roof and a straight-six: the return of a name that tuners never let go of.",
  },
  {
    slug: "mercedes-amg-gt",
    manufacturer: "Mercedes-AMG",
    model: "GT",
    variant: "63 4MATIC+ Coupé",
    generation: "C192",
    modelYear: u(2024),
    bodyStyle: "Coupé",
    drivetrain: u("AWD"),
    layout: u("Front-engine"),
    engine: u("4.0 L twin-turbo V8"),
    summary:
      "The second-generation AMG GT trades the old car's rawness for all-wheel drive, rear seats and long-distance pace.",
  },
  {
    slug: "mclaren-720s",
    manufacturer: "McLaren",
    model: "720S",
    variant: "Coupé",
    generation: "P14",
    modelYear: u(2017),
    bodyStyle: "Supercar",
    drivetrain: u("RWD"),
    layout: u("Mid-engine"),
    engine: u("4.0 L twin-turbo V8"),
    summary:
      "A carbon tub, dihedral doors and bodywork with no visible side intakes. Air goes through the car, not around it.",
  },
  {
    slug: "lamborghini-huracan",
    manufacturer: "Lamborghini",
    model: "Huracán",
    variant: "EVO RWD",
    generation: "LB724",
    modelYear: u(2021),
    bodyStyle: "Supercar",
    drivetrain: u("RWD"),
    layout: u("Mid-engine"),
    engine: u("5.2 L naturally aspirated V10"),
    summary:
      "A naturally aspirated V10 driving the rear wheels only. The Huracán with the fewest systems between you and it.",
  },
];

export const vehicles: Vehicle[] = seeds.map((seed) => ({
  ...seed,
  basePrice: null,
  specs: pendingSpecs,
  asset: pendingAsset,
}));

export const manufacturers = [...new Set(vehicles.map((v) => v.manufacturer))].sort();
export const bodyStyles = [...new Set(vehicles.map((v) => v.bodyStyle))];

export function getVehicle(slug: string): Vehicle | undefined {
  return vehicles.find((v) => v.slug === slug);
}

export function vehicleName(v: Vehicle): string {
  return `${v.manufacturer} ${v.model}`;
}
