"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { clsx } from "clsx";
import type { Vehicle } from "@/lib/vehicles/types";
import { vehicleName } from "@/lib/vehicles/data";
import {
  categories,
  customPaintId,
  CUSTOM_PAINT_PRICE,
  isCustomPaint,
  decodeSelection,
  defaultSelection,
  encodeSelection,
  findOption,
  formatPrice,
  optionsTotal,
  type Category,
  type Selection,
} from "@/lib/customisation/options";
import { useBuilds } from "@/lib/garage/useBuilds";
import { ShowroomStage } from "@/components/showroom/ShowroomStage";
import { paintProps, trimProps } from "@/lib/showroom/materials";
import {
  categoryAvailability,
  optionAvailability,
  sanitiseSelection,
} from "@/lib/customisation/capabilities";
import { isEnvironmentId } from "@/lib/showroom/environments";
import { useShowroom } from "@/stores/showroom";
import { Button } from "@/components/ui/Button";

const groups = ["Exterior", "Wheels", "Interior", "Body", "Scene"] as const;

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
  const garage = useBuilds();
  const [saving, setSaving] = useState(false);
  const existing = buildId
    ? garage.builds.find(
        (b) => b.id === buildId && b.vehicleSlug === vehicle.slug,
      )
    : undefined;

  const removedNote = (removed: string[]) =>
    removed.length
      ? `Removed ${removed.join(", ")}: not available on this ${vehicle.model} model.`
      : null;
  const [initialState] = useState(() =>
    sanitiseSelection(vehicle.asset, decodeSelection(initial)),
  );
  const [selection, setSelection] = useState<Selection>(initialState.selection);
  const [loadedBuild, setLoadedBuild] = useState<string | null>(null);
  const [group, setGroup] = useState<(typeof groups)[number]>("Exterior");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(() =>
    removedNote(initialState.removed),
  );

  // A saved build is only readable after the garage store has hydrated from local storage.
  if (existing && loadedBuild !== existing.id) {
    const loaded = sanitiseSelection(vehicle.asset, structuredClone(existing.selection));
    setLoadedBuild(existing.id);
    setSelection(loaded.selection);
    const note = removedNote(loaded.removed);
    if (note) setMessage(note);
  }

  const total = useMemo(() => optionsTotal(selection), [selection]);
  const modelReady = vehicle.asset.status === "verified";
  const hasModel = vehicle.asset.modelUrl !== null;
  const paint = findOption("paint", selection.paint[0]);
  const canvas = useShowroom((s) => s.canvas);
  const look = useMemo(
    () => ({
      paint: paintProps(paint?.swatch ?? "#0b0b0d", paint?.finish),
      caliper:
        findOption("calipers", selection.calipers[0])?.swatch ?? "#111214",
      leather:
        findOption("interior", selection.interior[0])?.swatch ?? "#141416",
      stitching:
        findOption("stitching", selection.stitching[0])?.swatch ?? "#3a3b40",
      trim: trimProps(selection.trim[0]),
      wheels: selection.wheels[0] ?? "standard",
      body: selection.body,
      environment: isEnvironmentId(selection.lighting[0])
        ? selection.lighting[0]
        : ("studio" as const),
    }),
    [
      paint?.swatch,
      paint?.finish,
      selection.calipers,
      selection.interior,
      selection.stitching,
      selection.trim,
      selection.wheels,
      selection.body,
      selection.lighting,
    ],
  );

  const download = () => {
    if (!canvas) return;
    const link = document.createElement("a");
    const kind = modelReady
      ? "build"
      : hasModel
        ? "placeholder-model"
        : "material-sample";
    link.download = `apex-motion-${vehicle.slug}-${kind}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    setMessage(
      modelReady
        ? "Image downloaded."
        : hasModel
          ? "Image downloaded. It shows a development placeholder model, not the finished car."
          : "Image of the material sample downloaded. It does not show the car.",
    );
  };

  const choose = (category: Category, optionId: string) => {
    if (!optionAvailability(vehicle.asset, category, optionId).available)
      return;
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

  const save = async () => {
    setSaving(true);
    setMessage(null);
    const where = garage.where === "account" ? "your account" : "My garage on this device";
    if (existing) {
      const ok = await garage.update(existing.id, selection);
      setMessage(ok ? `Saved changes to “${existing.name}”.` : "Changes were not saved. Try again.");
    } else {
      const build = await garage.save({ name: `${vehicleName(vehicle)} build`, vehicleSlug: vehicle.slug, selection });
      if (build) {
        setLoadedBuild(build.id);
        router.replace(`/configure/${vehicle.slug}?build=${build.id}`, { scroll: false });
        setMessage(`Saved to ${where}.`);
      } else {
        setMessage("The build was not saved. Check your connection and try again.");
      }
    }
    setSaving(false);
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
            const chosen = selection[c.id]
              .map((id) => findOption(c.id, id))
              .filter((o) => o !== undefined);
            return (
              <div
                key={c.id}
                className="flex items-baseline justify-between gap-4"
              >
                <dt className="text-steel">{c.name}</dt>
                <dd className="text-right text-chalk">
                  {chosen.length
                    ? chosen.map((o) => o.name).join(", ")
                    : "None"}
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
          Option prices are illustrative and are not manufacturer prices. No
          total is shown until the base price is verified.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Button onClick={() => void save()} className="col-span-2" disabled={saving}>
          {saving ? "Saving…" : existing ? "Save changes" : "Save configuration"}
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
          onClick={download}
          disabled={!canvas}
        >
          Download image
        </Button>
        {!modelReady && (
          <p className="col-span-2 text-[0.8125rem] text-steel">
            {hasModel
              ? `The image shows a development placeholder, not the finished ${vehicle.model}.`
              : `Until the ${vehicle.model} model arrives, the image shows the material sample in the studio, not the car.`}
          </p>
        )}
      </div>
      <p aria-live="polite" className="min-h-5 text-[0.875rem] text-volt">
        {message}
      </p>
    </div>
  );

  const panel = (
    <div>
      <div
        role="tablist"
        aria-label="Customisation groups"
        className="flex gap-1 overflow-x-auto border-b border-line"
      >
        {groups.map((g) => (
          <button
            key={g}
            role="tab"
            type="button"
            aria-selected={group === g}
            onClick={() => setGroup(g)}
            className={clsx(
              "-mb-px shrink-0 border-b-2 px-2.5 py-3 text-[0.9375rem] transition-colors sm:px-3",
              group === g
                ? "border-volt text-chalk"
                : "border-transparent text-steel hover:text-chalk",
            )}
          >
            {g}
          </button>
        ))}
      </div>
      <div role="tabpanel" className="space-y-7 pt-6">
        {categories
          .filter((c) => c.group === group)
          .map((c) => {
            const cat = categoryAvailability(vehicle.asset, c);
            return (
              <fieldset key={c.id}>
                <legend className="flex w-full items-baseline justify-between">
                  <span className="font-medium text-chalk">{c.name}</span>
                  {c.multi && cat.available && (
                    <span className="text-[0.8125rem] text-steel">
                      Choose any
                    </span>
                  )}
                </legend>
                {cat.preview === "recorded" && (
                  <p className="mt-1 text-[0.8125rem] text-steel">
                    Saved and priced now. Shown in 3D once the {vehicle.model}{" "}
                    model arrives.
                  </p>
                )}
                {!cat.available && cat.reason && (
                  <p className="mt-1 text-[0.8125rem] text-steel">
                    Not available: {cat.reason}
                  </p>
                )}
                {c.options[0].swatch ? (
                  <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-7 lg:grid-cols-4">
                    {c.options.map((o) => {
                      const active = selection[c.id].includes(o.id);
                      const avail = optionAvailability(vehicle.asset, c, o.id);
                      return (
                        <button
                          key={o.id}
                          type="button"
                          aria-pressed={active}
                          onClick={() => choose(c, o.id)}
                          disabled={!avail.available}
                          title={avail.available ? undefined : avail.reason}
                          className={clsx(
                            "group/sw flex flex-col items-start gap-2 border p-2 text-left transition-colors",
                            active
                              ? "border-volt bg-volt/10"
                              : "border-line hover:border-steel",
                            !avail.available &&
                              "cursor-not-allowed opacity-40 hover:border-line",
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
                          <span className="text-[0.75rem] leading-tight text-silver">
                            {o.name}
                          </span>
                          <span className="text-[0.75rem] text-steel">
                            {o.price ? formatPrice(o.price) : "Included"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="mt-3 space-y-2">
                    {c.options.map((o) => {
                      const active = selection[c.id].includes(o.id);
                      const avail = optionAvailability(vehicle.asset, c, o.id);
                      return (
                        <button
                          key={o.id}
                          type="button"
                          aria-pressed={active}
                          onClick={() => choose(c, o.id)}
                          disabled={!avail.available}
                          title={avail.available ? undefined : avail.reason}
                          className={clsx(
                            "flex w-full items-center justify-between gap-4 border px-4 py-3 text-left transition-colors",
                            active
                              ? "border-volt bg-volt/10"
                              : "border-line hover:border-steel",
                            !avail.available &&
                              "cursor-not-allowed opacity-40 hover:border-line",
                          )}
                        >
                          <span>
                            <span className="block text-[0.9375rem] text-chalk">
                              {o.name}
                            </span>
                            {!avail.available && avail.reason ? (
                              <span className="block text-[0.8125rem] text-steel">
                                Not available: {avail.reason}
                              </span>
                            ) : (
                              o.note && (
                                <span className="block text-[0.8125rem] text-steel">
                                  {o.note}
                                </span>
                              )
                            )}
                          </span>
                          <span className="shrink-0 text-[0.875rem] text-silver">
                            {o.price
                              ? formatPrice(o.price)
                              : c.group === "Scene"
                                ? ""
                                : "Included"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
                {c.id === "paint" && (
                  <div
                    className={clsx(
                      "mt-3 flex items-center gap-3 border px-3 py-2.5",
                      isCustomPaint(selection.paint[0])
                        ? "border-volt bg-volt/10"
                        : "border-line",
                    )}
                  >
                    <input
                      id="custom-paint"
                      type="color"
                      value={
                        isCustomPaint(selection.paint[0])
                          ? (paint?.swatch ?? "#8f6bff")
                          : "#8f6bff"
                      }
                      onChange={(e) => {
                        setMessage(null);
                        setSelection((prev) => ({
                          ...prev,
                          paint: [customPaintId(e.target.value)],
                        }));
                      }}
                      disabled={!cat.available}
                      className="h-8 w-10 cursor-pointer bg-transparent disabled:cursor-not-allowed disabled:opacity-40"
                    />
                    <label
                      htmlFor="custom-paint"
                      className="text-[0.8125rem] text-silver"
                    >
                      Custom colour
                      <span className="block text-steel">
                        Mixed to order, {formatPrice(CUSTOM_PAINT_PRICE)}
                      </span>
                    </label>
                  </div>
                )}
              </fieldset>
            );
          })}
      </div>
    </div>
  );

  return (
    <div className="lg:grid lg:h-[calc(100dvh-4rem)] lg:grid-cols-[1fr_26rem]">
      {/* Viewport */}
      <section
        aria-label="Vehicle viewport"
        className="relative flex h-[58dvh] flex-col lg:h-auto"
      >
        <ShowroomStage vehicle={vehicle} look={look}>
          <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-4 p-5">
            <div>
              <p className="type-label">{vehicle.manufacturer}</p>
              <h1 className="type-heading">
                {vehicle.model}{" "}
                <span className="font-normal text-silver">
                  {vehicle.variant}
                </span>
              </h1>
            </div>
            <Link
              href={`/cars/${vehicle.slug}`}
              className="pointer-events-auto text-[0.875rem] text-steel underline-offset-4 hover:text-chalk hover:underline"
            >
              Vehicle details
            </Link>
          </div>

          {!modelReady && (
            <p className="pointer-events-none absolute left-5 top-[4.75rem] max-w-[17rem] border-l-2 border-volt bg-carbon/70 px-3 py-2 text-[0.8125rem] leading-snug text-silver backdrop-blur">
              {hasModel ? (
                <>
                  <span className="block font-medium text-chalk">
                    Development placeholder, not the {vehicle.model}
                  </span>
                  This model is a stand-in for testing the studio. It has not
                  been verified as accurate.
                </>
              ) : (
                <>
                  <span className="block font-medium text-chalk">
                    Material sample, not the {vehicle.model}
                  </span>
                  No licensed 3D model of this car has been sourced yet. Your
                  paint, caliper, leather and stitching choices are shown on
                  sample forms.
                </>
              )}
            </p>
          )}
        </ShowroomStage>
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
              <span className="block text-[0.75rem] text-steel">
                Options, illustrative
              </span>
              <span className="type-heading">{formatPrice(total)}</span>
            </span>
            <span className="text-[0.9375rem] text-chalk">
              {sheetOpen ? "Hide build" : "Review build"}
            </span>
          </button>
          {sheetOpen && (
            <div
              id="build-sheet"
              className="shell max-h-[62dvh] overflow-y-auto border-t border-line py-5"
            >
              {summary}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
