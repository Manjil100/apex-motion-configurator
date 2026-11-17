import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getVehicle, vehicleName, vehicles } from "@/lib/vehicles/data";
import type { Vehicle } from "@/lib/vehicles/types";
import { Configurator } from "@/components/configurator/Configurator";

type Search = Promise<{ c?: string; build?: string }>;
type Props = { params: Promise<{ slug: string }>; searchParams: Search };

export function generateStaticParams() {
  return vehicles.map((v) => ({ slug: v.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const vehicle = getVehicle((await params).slug);
  return { title: vehicle ? `Configure ${vehicleName(vehicle)}` : "Car not found" };
}

/** Reads the share string or saved-build id from the query, so it streams inside Suspense. */
async function ConfiguratorFromQuery({ vehicle, searchParams }: { vehicle: Vehicle; searchParams: Search }) {
  const { c, build } = await searchParams;
  return <Configurator key={`${vehicle.slug}-${build ?? c ?? "new"}`} vehicle={vehicle} initial={c} buildId={build} />;
}

export default async function ConfigurePage({ params, searchParams }: Props) {
  const vehicle = getVehicle((await params).slug);
  if (!vehicle) notFound();
  return (
    <Suspense fallback={<p className="shell py-16 text-steel">Opening the studio…</p>}>
      <ConfiguratorFromQuery vehicle={vehicle} searchParams={searchParams} />
    </Suspense>
  );
}
