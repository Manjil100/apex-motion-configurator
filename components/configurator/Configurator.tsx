"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { clsx } from "clsx";
import type { Vehicle } from "@/lib/vehicles/types";
import { vehicleName } from "@/lib/vehicles/data";
import {
  categories,
  decodeSelection,
  defaultSelection,
  encodeSelection,
  findOption,
  formatPrice,
  optionsTotal,
  type Category,
  type Selection,
} from "@/lib/customisation/options";
import { useGarage } from "@/stores/garage";
import { StudioBay } from "@/components/ui/StudioBay";
import { Button } from "@/components/ui/Button";

const groups = ["Exterior", "Wheels", "Interior", "Body", "Scene"] as const;
const views = ["Front", "Side", "Rear", "Interior"] as const;

export function Configurator({
  vehicle,
  initial,
  buildId,
}: {
  vehicle: Vehicle;
  initial?: string;
  buildId?: string;
}) {
  const router = useRouter();
  const garage = useGarage();
  const existing = buildId ? garage.builds.find((b) => b.id === buildId && b.vehicleSlug === vehicle.slug) : undefined;

  const [selection, setSelection] = useState<Selection>(() => decodeSelection(initial));
  const [loadedBuild, setLoadedBuild] = useState<string | null>(null);
  const [group, setGroup] = useState<(typeof groups)[number]>("Exterior");
  const [customPaint, setCustomPaint] = useState("#8f6bff");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // A saved build is only readable after the garage store has hydrated from local storage.
  if (existing && loadedBuild !== existing.id) {
    setLoadedBuild(existing.id);
    setSelection(structuredClone(existing.selection));
  }

  const total = useMemo(() => optionsTotal(selection), [selection]);
  const modelReady = vehicle.asset.status === "verified";
  const paint = findOption("paint", selection.paint[0]);

  const choose = (category: Category, optionId: string) => {
    setMessage(null);
    setSelection((prev) => {
      const current = prev[category.id];
      const next = category.multi
        ? current.includes(optionId)
          ? current.filter((id) => id !== optionId)
          : [...current, optionId]
        : [optionId];
      return { ...prev, [category.id]: next };
    });
  };

  const save = () => {
    if (existing) {
      garage.update(existing.id, selection);
      setMessage(`Saved changes to “${existing.name}”.`);
    } else {
      const build = garage.save({ name: `${vehicleName(vehicle)} build`, vehicleSlug: vehicle.slug, selection });
      router.replace(`/configure/${vehicle.slug}?build=${build.id}`, { scroll: false });
      setMessage("Saved to My garage on this device.");
    }
  };

  const reset = () => {
    setSelection(defaultSelection());
    setMessage("Build reset to the standard specification.");
  };

  const share = async () => {
    const url = `${window.location.origin}/configure/${vehicle.slug}?c=${encodeURIComponent(encodeSelection(selection))}`;
    try {
      await navigator.clipboard.writeText(url);
      setMessage("Share link copied.");
    } catch {
      setMessage(`Copy this link to share: ${url}`);
    }
  };

  const summary = (
    <div className="space-y-5">
      <dl className="space-y-2.5 text-[0.9375rem]">
        {categories
          .filter((c) => c.group !== "Scene")
          .map((c) => {
            const chosen = selection[c.id].map((id) => findOption(c.id, id)).filter((o) => o !== undefined);
            return (
              <div key={c.id} className="flex items-baseline justify-between gap-4">
                <dt className="text-steel">{c.name}</dt>
                <dd className="text-right text-chalk">
                  {chosen.length ? chosen.map((o) => o.name).join(", ") : "None"}
                </dd>
              </div>
            );
          })}
      </dl>
      <div className="border-t border-line pt-4">
        <div className="flex items-baseline justify-between">
          <span className="text-steel">Vehicle base price</span>
          <span className="text-silver">To be verified</span>
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-steel">Options</span>
          <span className="type-heading">{formatPrice(total)}</span>
        </div>
        <p className="mt-3 text-[0.8125rem] leading-relaxed text-steel">
          Option prices are illustrative and are not manufacturer prices. No total is shown until the base price is
          verified.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Button onClick={save} className="col-span-2">
          {existing ? "Save changes" : "Save configuration"}
        </Button>
        <Button variant="secondary" onClick={share}>
          Copy share link
        </Button>
        <Button variant="secondary" onClick={reset}>
          Reset configuration
        </Button>
        <Button
          variant="secondary"
          className="col-span-2"
          disabled
          title="Needs the 3D viewport, which arrives in Phase 2"
        >
          Download image
        </Button>
        <p className="col-span-2 text-[0.8125rem] text-steel">
          Download image unlocks when the 3D viewport is live. There is nothing real to capture yet.
        </p>
      </div>
      <p aria-live="polite" className="min-h-5 text-[0.875rem] text-volt">
        {message}
      </p>
    </div>
  );

  const panel = (
    <div>
      <div role="tablist" aria-label="Customisation groups" className="flex gap-1 overflow-x-auto border-b border-line">
        {groups.map((g) => (
          <button
            key={g}
            role="tab"
            type="button"
            aria-selected={group === g}
            onClick={() => setGroup(g)}
            className={clsx(
              "-mb-px shrink-0 border-b-2 px-2.5 py-3 text-[0.9375rem] transition-colors sm:px-3",
              group === g ? "border-volt text-chalk" : "border-transparent text-steel hover:text-chalk",
            )}
          >
            {g}
          </button>
        ))}
      </div>
      <div role="tabpanel" className="space-y-7 pt-6">
        {categories
          .filter((c) => c.group === group)
          .map((c) => (
            <fieldset key={c.id}>
              <legend className="flex w-full items-baseline justify-between">
                <span className="font-medium text-chalk">{c.name}</span>
                {c.multi && <span className="text-[0.8125rem] text-steel">Choose any</span>}
              </legend>
              {c.options[0].swatch ? (
                <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-7 lg:grid-cols-4">
                  {c.options.map((o) => {
                    const active = selection[c.id].includes(o.id);
                    return (
                      <button
                        key={o.id}
                        type="button"
                        aria-pressed={active}
                        onClick={() => choose(c, o.id)}
                        className={clsx(
                          "group/sw flex flex-col items-start gap-2 border p-2 text-left transition-colors",
                          active ? "border-volt bg-volt/10" : "border-line hover:border-steel",
                        )}
                      >
                        <span
                          className="h-9 w-full border border-white/10"
                          style={{
                            background:
                              o.finish === "matte"
                                ? o.swatch
                                : `linear-gradient(135deg, ${o.swatch} 35%, color-mix(in srgb, ${o.swatch} 62%, white) 50%, ${o.swatch} 65%)`,
                          }}
                        />
                        <span className="text-[0.75rem] leading-tight text-silver">{o.name}</span>
                        <span className="text-[0.75rem] text-steel">{o.price ? formatPrice(o.price) : "Included"}</span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="mt-3 space-y-2">
                  {c.options.map((o) => {
                    const active = selection[c.id].includes(o.id);
                    return (
                      <button
                        key={o.id}
                        type="button"
                        aria-pressed={active}
                        onClick={() => choose(c, o.id)}
                        className={clsx(
                          "flex w-full items-center justify-between gap-4 border px-4 py-3 text-left transition-colors",
                          active ? "border-volt bg-volt/10" : "border-line hover:border-steel",
                        )}
                      >
                        <span>
                          <span className="block text-[0.9375rem] text-chalk">{o.name}</span>
                          {o.note && <span className="block text-[0.8125rem] text-steel">{o.note}</span>}
                        </span>
                        <span className="shrink-0 text-[0.875rem] text-silver">
                          {o.price ? formatPrice(o.price) : c.group === "Scene" ? "" : "Included"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
              {c.id === "paint" && (
                <div className="mt-3 flex items-center gap-3 border border-line px-3 py-2.5">
                  <input
                    id="custom-paint"
                    type="color"
                    value={customPaint}
                    onChange={(e) => setCustomPaint(e.target.value)}
                    disabled
                    className="h-8 w-10 cursor-not-allowed bg-transparent opacity-50"
                  />
                  <label htmlFor="custom-paint" className="text-[0.8125rem] text-steel">
                    Custom colour unlocks with the 3D model, where you can see the result on the car.
                  </label>
                </div>
              )}
            </fieldset>
          ))}
      </div>
    </div>
  );

  return (
    <div className="lg:grid lg:h-[calc(100dvh-4rem)] lg:grid-cols-[1fr_26rem]">
      {/* Viewport */}
      <section aria-label="Vehicle viewport" className="relative flex h-[58dvh] flex-col lg:h-auto">
        <StudioBay vehicle={vehicle} size="stage" showStatus={false} className="flex-1">
          <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-4 p-5">
            <div>
              <p className="type-label">{vehicle.manufacturer}</p>
              <h1 className="type-heading">
                {vehicle.model} <span className="font-normal text-silver">{vehicle.variant}</span>
              </h1>
            </div>
            <Link href={`/cars/${vehicle.slug}`} className="text-[0.875rem] text-steel underline-offset-4 hover:text-chalk hover:underline">
              Vehicle details
            </Link>
          </div>

          {!modelReady && (
            <div className="absolute inset-x-5 bottom-20 mx-auto max-w-md border border-line bg-carbon/80 p-4 backdrop-blur lg:bottom-24">
              <p className="font-medium text-chalk">The studio is ready. The car is not here yet.</p>
              <p className="mt-1 text-[0.875rem] text-silver">
                A licensed, verified 3D model of this {vehicle.model} has not been sourced. Your choices are saved and
                priced now, and will apply to the model when it arrives.
              </p>
              <div className="mt-3 flex items-center gap-3 text-[0.8125rem] text-steel">
                <span
                  className="h-6 w-10 border border-white/15"
                  style={{ background: paint?.swatch }}
                  aria-hidden="true"
                />
                Selected paint: {paint?.name}
              </div>
            </div>
          )}

          <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 p-4">
            {views.map((v) => (
              <button
                key={v}
                type="button"
                disabled={!modelReady}
                title={modelReady ? undefined : "Camera views need the 3D model"}
                className="h-9 border border-line bg-carbon/70 px-3.5 text-[0.8125rem] text-silver backdrop-blur disabled:cursor-not-allowed disabled:opacity-50"
              >
                {v}
              </button>
            ))}
          </div>
        </StudioBay>
      </section>

      {/* Desktop side panel */}
      <aside className="hidden overflow-y-auto border-l border-line bg-graphite lg:block">
        <div className="p-6">{panel}</div>
        <div className="border-t border-line p-6">
          <h2 className="type-heading mb-4">Your build</h2>
          {summary}
        </div>
      </aside>

      {/* Mobile and tablet: options inline, summary in a bottom sheet */}
      <div className="lg:hidden">
        <div className="shell pb-32 pt-4">{panel}</div>
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-graphite">
          <button
            type="button"
            aria-expanded={sheetOpen}
            aria-controls="build-sheet"
            onClick={() => setSheetOpen((v) => !v)}
            className="shell flex h-16 w-full items-center justify-between"
          >
            <span className="text-left">
              <span className="block text-[0.75rem] text-steel">Options, illustrative</span>
              <span className="type-heading">{formatPrice(total)}</span>
            </span>
            <span className="text-[0.9375rem] text-chalk">{sheetOpen ? "Hide build" : "Review build"}</span>
          </button>
          {sheetOpen && (
            <div id="build-sheet" className="shell max-h-[62dvh] overflow-y-auto border-t border-line py-5">
              {summary}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
