"use client";

import { useState } from "react";
import Link from "next/link";
import { clsx } from "clsx";
import type { Sourced, Vehicle } from "@/lib/vehicles/types";
import { vehicleName } from "@/lib/vehicles/data";
import { categories } from "@/lib/customisation/options";

const MAX = 3;

function Cell({ data }: { data: Sourced<string | number> | null }) {
  if (!data) return <span className="text-steel">To be verified</span>;
  return (
    <span className="text-chalk">
      {data.value}
      {data.status !== "verified" && <sup className="ml-0.5 text-steel">†</sup>}
    </span>
  );
}

export function CompareTable({ vehicles, initial }: { vehicles: Vehicle[]; initial: string[] }) {
  const [selected, setSelected] = useState<string[]>(initial);
  const chosen = selected.map((s) => vehicles.find((v) => v.slug === s)).filter((v) => v !== undefined);

  const toggle = (slug: string) =>
    setSelected((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : prev.length < MAX ? [...prev, slug] : prev,
    );

  const rows: { label: string; get: (v: Vehicle) => Sourced<string | number> | null }[] = [
    { label: "Variant", get: (v) => ({ value: v.variant, status: "verified" }) },
    { label: "Generation", get: (v) => ({ value: v.generation, status: "unverified" }) },
    { label: "Model year", get: (v) => v.modelYear },
    { label: "Body style", get: (v) => ({ value: v.bodyStyle, status: "verified" }) },
    { label: "Engine", get: (v) => v.engine },
    { label: "Layout", get: (v) => v.layout },
    { label: "Driven wheels", get: (v) => v.drivetrain },
    ...vehicles[0].specs.map((spec, i) => ({
      label: spec.label,
      get: (v: Vehicle) => v.specs[i]?.detail ?? null,
    })),
    { label: "Base price", get: (v: Vehicle) => (v.basePrice ? { ...v.basePrice, value: String(v.basePrice.value) } : null) },
  ];

  const optionCount = categories.filter((c) => c.group !== "Scene").reduce((n, c) => n + c.options.length, 0);

  return (
    <div className="shell py-10">
      <fieldset>
        <legend className="type-label">
          Choose up to {MAX} cars ({selected.length} selected)
        </legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {vehicles.map((v) => {
            const active = selected.includes(v.slug);
            const full = !active && selected.length >= MAX;
            return (
              <button
                key={v.slug}
                type="button"
                aria-pressed={active}
                disabled={full}
                onClick={() => toggle(v.slug)}
                className={clsx(
                  "h-10 border px-4 text-[0.9375rem] transition-colors disabled:cursor-not-allowed disabled:opacity-40",
                  active ? "border-volt bg-volt/15 text-chalk" : "border-line text-silver hover:border-steel",
                )}
              >
                {vehicleName(v)}
              </button>
            );
          })}
        </div>
      </fieldset>

      {chosen.length < 2 ? (
        <div className="mt-10 border border-line px-6 py-16 text-center">
          <p className="type-heading">Pick at least two cars to compare</p>
          <p className="mt-2 text-steel">Their specifications will line up side by side here.</p>
        </div>
      ) : (
        <div className="mt-10 overflow-x-auto">
          <table className="w-full min-w-[40rem] border-collapse text-left text-[0.9375rem]">
            <thead>
              <tr>
                <th scope="col" className="w-44 border-b border-line py-4 pr-4 align-bottom font-normal text-steel">
                  Specification
                </th>
                {chosen.map((v) => (
                  <th key={v.slug} scope="col" className="border-b border-line px-4 py-4 align-bottom">
                    <span className="type-label block">{v.manufacturer}</span>
                    <span className="type-heading block">{v.model}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label}>
                  <th scope="row" className="border-b border-line py-3.5 pr-4 font-normal text-steel">
                    {row.label}
                  </th>
                  {chosen.map((v) => (
                    <td key={v.slug} className="border-b border-line px-4 py-3.5">
                      <Cell data={row.get(v)} />
                    </td>
                  ))}
                </tr>
              ))}
              <tr>
                <th scope="row" className="border-b border-line py-3.5 pr-4 font-normal text-steel">
                  Options available
                </th>
                {chosen.map((v) => (
                  <td key={v.slug} className="border-b border-line px-4 py-3.5 text-chalk">
                    {optionCount} across {categories.length - 1} categories
                  </td>
                ))}
              </tr>
              <tr>
                <th scope="row" className="py-4 pr-4 font-normal text-steel">
                  Next step
                </th>
                {chosen.map((v) => (
                  <td key={v.slug} className="px-4 py-4">
                    <Link
                      href={`/configure/${v.slug}`}
                      className="text-chalk underline decoration-volt underline-offset-[6px]"
                    >
                      Configure the {v.model}
                    </Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
          <p className="mt-5 max-w-3xl text-[0.8125rem] text-steel">
            † Widely published, not yet checked against a manufacturer source by APEX MOTION. Performance figures,
            dimensions and prices stay blank until they are verified.
          </p>
        </div>
      )}
    </div>
  );
}
