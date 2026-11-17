"use client";

import { useMemo, useState } from "react";
import { clsx } from "clsx";
import type { Vehicle } from "@/lib/vehicles/types";
import { VehicleCard } from "./VehicleCard";
import { Button } from "@/components/ui/Button";

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={clsx(
        "h-9 shrink-0 border px-3.5 text-[0.875rem] transition-colors",
        active ? "border-volt bg-volt/15 text-chalk" : "border-line text-silver hover:border-steel hover:text-chalk",
      )}
    >
      {children}
    </button>
  );
}

export function Catalogue({
  vehicles,
  manufacturers,
  bodyStyles,
}: {
  vehicles: Vehicle[];
  manufacturers: string[];
  bodyStyles: string[];
}) {
  const [query, setQuery] = useState("");
  const [maker, setMaker] = useState<string | null>(null);
  const [body, setBody] = useState<string | null>(null);
  const [drive, setDrive] = useState<string | null>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return vehicles.filter((v) => {
      const haystack = `${v.manufacturer} ${v.model} ${v.variant} ${v.generation} ${v.engine.value}`.toLowerCase();
      return (
        (!q || haystack.includes(q)) &&
        (!maker || v.manufacturer === maker) &&
        (!body || v.bodyStyle === body) &&
        (!drive || v.drivetrain.value === drive)
      );
    });
  }, [vehicles, query, maker, body, drive]);

  const filtered = Boolean(query || maker || body || drive);
  const clear = () => {
    setQuery("");
    setMaker(null);
    setBody(null);
    setDrive(null);
  };

  return (
    <div className="shell py-10">
      <div className="grid gap-6 lg:grid-cols-[18rem_1fr] lg:gap-10">
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div>
            <label htmlFor="car-search" className="type-label">
              Search
            </label>
            <input
              id="car-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Model, maker or engine"
              className="field mt-2"
            />
          </div>
          <fieldset>
            <legend className="type-label">Manufacturer</legend>
            <div className="-mx-5 mt-2 flex gap-2 overflow-x-auto px-5 pb-1 lg:mx-0 lg:flex-wrap lg:px-0">
              {manufacturers.map((m) => (
                <Chip key={m} active={maker === m} onClick={() => setMaker(maker === m ? null : m)}>
                  {m}
                </Chip>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="type-label">Body style</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {bodyStyles.map((b) => (
                <Chip key={b} active={body === b} onClick={() => setBody(body === b ? null : b)}>
                  {b}
                </Chip>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="type-label">Driven wheels</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {["RWD", "AWD"].map((d) => (
                <Chip key={d} active={drive === d} onClick={() => setDrive(drive === d ? null : d)}>
                  {d === "RWD" ? "Rear-wheel drive" : "All-wheel drive"}
                </Chip>
              ))}
            </div>
          </fieldset>
        </aside>

        <section aria-live="polite">
          <div className="mb-5 flex items-center justify-between">
            <p className="text-[0.9375rem] text-steel">
              {results.length} of {vehicles.length} cars
            </p>
            {filtered && (
              <Button variant="quiet" onClick={clear}>
                Clear filters
              </Button>
            )}
          </div>
          {results.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {results.map((v) => (
                <VehicleCard key={v.slug} vehicle={v} />
              ))}
            </div>
          ) : (
            <div className="border border-line px-6 py-16 text-center">
              <p className="type-heading">No cars match those filters</p>
              <p className="mt-2 text-steel">Remove a filter or change your search to see more.</p>
              <Button variant="secondary" className="mt-6" onClick={clear}>
                Clear filters
              </Button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
