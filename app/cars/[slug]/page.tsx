import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getVehicle, vehicleName, vehicles } from "@/lib/vehicles/data";
import { categories } from "@/lib/customisation/options";
import { StudioBay } from "@/components/ui/StudioBay";
import { LinkButton, buttonClass } from "@/components/ui/Button";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return vehicles.map((v) => ({ slug: v.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const vehicle = getVehicle((await params).slug);
  return { title: vehicle ? vehicleName(vehicle) : "Car not found" };
}

const galleryViews = ["Front three-quarter", "Profile", "Rear three-quarter", "Cabin"];

export default async function VehiclePage({ params }: Props) {
  const vehicle = getVehicle((await params).slug);
  if (!vehicle) notFound();

  const identity = [
    { label: "Generation", value: vehicle.generation, flagged: true },
    { label: "Model year", value: String(vehicle.modelYear.value), flagged: vehicle.modelYear.status !== "verified" },
    { label: "Body style", value: vehicle.bodyStyle, flagged: false },
    { label: "Engine", value: vehicle.engine.value, flagged: vehicle.engine.status !== "verified" },
    { label: "Layout", value: vehicle.layout.value, flagged: vehicle.layout.status !== "verified" },
    { label: "Driven wheels", value: vehicle.drivetrain.value, flagged: vehicle.drivetrain.status !== "verified" },
  ];

  return (
    <>
      <section className="border-b border-line">
        <div className="grid lg:grid-cols-[1.4fr_1fr]">
          <StudioBay vehicle={vehicle} size="stage" className="min-h-[22rem] lg:min-h-[36rem]" />
          <div className="flex flex-col justify-center px-[clamp(1.25rem,4vw,4rem)] py-12">
            <Link href="/cars" className="text-[0.875rem] text-steel underline-offset-4 hover:text-chalk hover:underline">
              All cars
            </Link>
            <p className="type-label mt-8">{vehicle.manufacturer}</p>
            <h1 className="type-title mt-1">
              {vehicle.model} <span className="font-normal text-silver">{vehicle.variant}</span>
            </h1>
            <p className="mt-5 max-w-md text-silver">{vehicle.summary}</p>
            <div className="mt-8 border-t border-line pt-6">
              <p className="text-steel">Estimated base price</p>
              <p className="type-heading mt-1">To be verified</p>
              <p className="mt-1 max-w-sm text-[0.8125rem] text-steel">
                APEX MOTION does not publish a price until it has been checked against a manufacturer source.
              </p>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-5">
              <LinkButton href={`/configure/${vehicle.slug}`} size="lg">
                Launch configurator
              </LinkButton>
              <Link href={`/compare?cars=${vehicle.slug}`} className={buttonClass("quiet")}>
                Compare this car
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="shell grid gap-16 py-20 lg:grid-cols-2">
        <section aria-labelledby="specs">
          <h2 id="specs" className="type-heading">Technical specifications</h2>
          <dl className="mt-6">
            {identity.map((row) => (
              <div key={row.label} className="flex items-baseline justify-between gap-6 border-b border-line py-3.5">
                <dt className="text-steel">{row.label}</dt>
                <dd className="text-right text-chalk">
                  {row.value}
                  {row.flagged && <sup className="ml-0.5 text-steel">†</sup>}
                </dd>
              </div>
            ))}
            {vehicle.specs.map((spec) => (
              <div key={spec.label} className="flex items-baseline justify-between gap-6 border-b border-line py-3.5">
                <dt className="text-steel">{spec.label}</dt>
                <dd className={spec.detail ? "text-chalk" : "text-steel"}>{spec.detail?.value ?? "To be verified"}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 text-[0.8125rem] text-steel">
            † Widely published, not yet checked against a manufacturer source by APEX MOTION.
          </p>
        </section>

        <section aria-labelledby="options">
          <h2 id="options" className="type-heading">What you can change</h2>
          <ul className="mt-6">
            {categories
              .filter((c) => c.group !== "Scene")
              .map((c) => (
                <li key={c.id} className="flex items-baseline justify-between gap-6 border-b border-line py-3.5">
                  <span className="text-chalk">{c.name}</span>
                  <span className="text-right text-[0.9375rem] text-steel">
                    {c.options.map((o) => o.name).join(", ")}
                  </span>
                </li>
              ))}
          </ul>
          <p className="mt-4 text-[0.8125rem] text-steel">
            Options that the final 3D model cannot support will be switched off for this car, with the reason shown.
          </p>
        </section>
      </div>

      <section aria-labelledby="gallery" className="shell pb-8">
        <h2 id="gallery" className="type-heading">Gallery</h2>
        <p className="mt-2 max-w-2xl text-silver">
          Four studio views are reserved for this car. They will be rendered from the verified 3D model, so what you see
          here always matches what you configure.
        </p>
        <ul className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {galleryViews.map((view) => (
            <li key={view} className="border border-dashed border-line p-4">
              <div className="aspect-[4/3] bg-graphite" />
              <p className="mt-3 text-[0.9375rem] text-chalk">{view}</p>
              <p className="text-[0.8125rem] text-steel">Render pending</p>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
