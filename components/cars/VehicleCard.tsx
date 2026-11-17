import Link from "next/link";
import type { Vehicle } from "@/lib/vehicles/types";
import { vehicleName } from "@/lib/vehicles/data";
import { StudioBay } from "@/components/ui/StudioBay";
import { buttonClass } from "@/components/ui/Button";

export function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  return (
    <article className="group flex flex-col border border-line bg-graphite transition-colors hover:border-steel">
      <Link href={`/cars/${vehicle.slug}`} aria-label={`${vehicleName(vehicle)} details`} tabIndex={-1}>
        <StudioBay vehicle={vehicle} />
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <p className="type-label">{vehicle.manufacturer}</p>
        <h3 className="type-heading mt-1">
          {vehicle.model} <span className="font-normal text-silver">{vehicle.variant}</span>
        </h3>
        <dl className="mt-4 grid grid-cols-3 gap-3 border-t border-line pt-4 text-[0.8125rem]">
          <div>
            <dt className="text-steel">Engine</dt>
            <dd className="mt-0.5 text-silver">{vehicle.engine.value}</dd>
          </div>
          <div>
            <dt className="text-steel">Layout</dt>
            <dd className="mt-0.5 text-silver">{vehicle.layout.value}</dd>
          </div>
          <div>
            <dt className="text-steel">Drive</dt>
            <dd className="mt-0.5 text-silver">{vehicle.drivetrain.value}</dd>
          </div>
        </dl>
        <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-3 pt-6">
          <Link href={`/configure/${vehicle.slug}`} className={buttonClass("primary", "md")}>
            Start customising
          </Link>
          <Link href={`/cars/${vehicle.slug}`} className={buttonClass("quiet")}>
            View details
          </Link>
        </div>
      </div>
    </article>
  );
}
