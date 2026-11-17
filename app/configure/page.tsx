import type { Metadata } from "next";
import Link from "next/link";
import { vehicleName, vehicles } from "@/lib/vehicles/data";
import { PageHeader } from "@/components/ui/PageHeader";
import { StudioBay } from "@/components/ui/StudioBay";

export const metadata: Metadata = { title: "Choose a car to configure" };

export default function ConfigureIndex() {
  return (
    <>
      <PageHeader title="Choose a car" lead="Pick the car you want to build. You can switch at any time." />
      <ul className="shell grid gap-5 py-10 sm:grid-cols-2 lg:grid-cols-3">
        {vehicles.map((v) => (
          <li key={v.slug}>
            <Link
              href={`/configure/${v.slug}`}
              className="group block border border-line bg-graphite transition-colors hover:border-volt"
            >
              <StudioBay vehicle={v} showStatus={false} />
              <span className="flex items-baseline justify-between gap-4 p-5">
                <span className="type-heading">{vehicleName(v)}</span>
                <span className="text-[0.875rem] text-steel group-hover:text-chalk">Configure</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
