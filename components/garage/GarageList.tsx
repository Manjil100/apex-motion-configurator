"use client";

import { useState } from "react";
import Link from "next/link";
import { useGarage, type SavedBuild } from "@/stores/garage";
import { useBuilds, type Builds } from "@/lib/garage/useBuilds";
import { getVehicle, vehicleName } from "@/lib/vehicles/data";
import { encodeSelection, findOption, formatPrice, optionsTotal } from "@/lib/customisation/options";
import { StudioBay } from "@/components/ui/StudioBay";
import { Notice } from "@/components/ui/PageHeader";
import { Button, buttonClass } from "@/components/ui/Button";

function BuildCard({ build, api }: { build: SavedBuild; api: Builds }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(build.name);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const vehicle = getVehicle(build.vehicleSlug);
  if (!vehicle) return null;

  const paint = findOption("paint", build.selection.paint?.[0]);
  const act = async (fn: () => Promise<boolean>) => {
    setBusy(true);
    await fn();
    setBusy(false);
  };

  const share = async () => {
    const url = `${window.location.origin}/configure/${vehicle.slug}?c=${encodeURIComponent(encodeSelection(build.selection))}`;
    try {
      await navigator.clipboard.writeText(url);
      setNote("Share link copied.");
    } catch {
      setNote(url);
    }
  };

  return (
    <article className="flex flex-col border border-line bg-graphite" aria-busy={busy}>
      <StudioBay vehicle={vehicle}>
        <span
          className="absolute right-4 top-4 h-7 w-12 border border-white/15"
          style={{ background: paint?.swatch }}
          title={`Paint: ${paint?.name}`}
        />
      </StudioBay>
      <div className="flex flex-1 flex-col p-5">
        {editing ? (
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              void act(() => api.rename(build.id, name)).then(() => setEditing(false));
            }}
          >
            <label htmlFor={`name-${build.id}`} className="sr-only">
              Build name
            </label>
            <input
              id={`name-${build.id}`}
              className="field"
              value={name}
              maxLength={60}
              autoFocus
              onChange={(e) => setName(e.target.value)}
            />
            <Button type="submit" variant="secondary" disabled={busy || !name.trim()}>
              Save name
            </Button>
          </form>
        ) : (
          <h3 className="type-heading">{build.name}</h3>
        )}
        <p className="mt-1 text-[0.9375rem] text-steel">
          {vehicleName(vehicle)} {vehicle.variant}
        </p>
        <p className="mt-4 text-[0.9375rem] text-silver">
          {paint?.name}, options {formatPrice(optionsTotal(build.selection))} <span className="text-steel">(illustrative)</span>
        </p>
        <p className="mt-1 text-[0.8125rem] text-steel">
          Updated {new Date(build.updatedAt).toLocaleDateString("en-NZ", { day: "numeric", month: "short", year: "numeric" })}
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
          <Link href={`/configure/${vehicle.slug}?build=${build.id}`} className={buttonClass("primary", "md")}>
            Edit build
          </Link>
          {!editing && (
            <Button variant="quiet" onClick={() => setEditing(true)} disabled={busy}>
              Rename
            </Button>
          )}
          <Button variant="quiet" onClick={() => void act(() => api.duplicate(build.id))} disabled={busy}>
            Duplicate
          </Button>
          <Button variant="quiet" onClick={share}>
            Share
          </Button>
          {confirming ? (
            <span className="flex items-center gap-3 text-[0.9375rem]">
              <button
                type="button"
                className="text-flag underline underline-offset-4"
                disabled={busy}
                onClick={() => void act(() => api.remove(build.id))}
              >
                Delete build
              </button>
              <button type="button" className="text-steel underline underline-offset-4" onClick={() => setConfirming(false)}>
                Keep
              </button>
            </span>
          ) : (
            <Button variant="quiet" onClick={() => setConfirming(true)} disabled={busy}>
              Delete
            </Button>
          )}
        </div>
        <p aria-live="polite" className="mt-3 min-h-5 break-all text-[0.8125rem] text-volt">
          {note}
        </p>
      </div>
    </article>
  );
}

/** Offers to move builds saved in this browser into the signed-in account. */
function ImportLocal({ api }: { api: Builds }) {
  const local = useGarage();
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  if (api.where !== "account" || !local.builds.length) return done ? <Notice title="Builds moved">{done}</Notice> : null;

  const move = async () => {
    setBusy(true);
    let moved = 0;
    for (const b of [...local.builds].reverse()) {
      const saved = await api.save({ name: b.name, vehicleSlug: b.vehicleSlug, selection: b.selection });
      if (!saved) break;
      local.remove(b.id);
      moved++;
    }
    setBusy(false);
    setDone(`${moved} build${moved === 1 ? "" : "s"} moved from this browser to your account.`);
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-l-2 border-volt bg-slate px-5 py-4">
      <p className="text-[0.9375rem] text-silver">
        <span className="block font-medium text-chalk">
          {local.builds.length} build{local.builds.length === 1 ? " is" : "s are"} saved only in this browser
        </span>
        Move {local.builds.length === 1 ? "it" : "them"} to your account to open {local.builds.length === 1 ? "it" : "them"} on any device.
      </p>
      <Button onClick={() => void move()} disabled={busy}>
        {busy ? "Moving…" : "Move to my account"}
      </Button>
    </div>
  );
}

export function GarageList() {
  const api = useBuilds();

  if (!api.ready) return <p className="text-steel">Loading your builds…</p>;

  return (
    <div className="space-y-8">
      <Notice title={api.where === "account" ? "Builds are saved to your account" : "Builds are saved in this browser"}>
        {api.where === "account" ? (
          "Open them on any device where you sign in."
        ) : (
          <>
            Clearing site data removes them.{" "}
            <Link href="/auth/login?next=/garage" className="text-chalk underline decoration-volt underline-offset-4">
              Sign in
            </Link>{" "}
            to keep them in your account.
          </>
        )}
      </Notice>
      <ImportLocal api={api} />
      {api.error && (
        <p role="alert" className="border-l-2 border-flag bg-slate px-4 py-3 text-[0.9375rem] text-chalk">
          {api.error}
        </p>
      )}
      {api.builds.length === 0 ? (
        <div className="border border-line px-6 py-20 text-center">
          <p className="type-heading">Your garage is empty</p>
          <p className="mx-auto mt-2 max-w-md text-steel">
            Configure a car and choose Save configuration. It will appear here, ready to edit, duplicate or share.
          </p>
          <Link href="/configure" className={buttonClass("primary", "lg", "mt-8")}>
            Start customising
          </Link>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {api.builds.map((b) => (
            <BuildCard key={b.id} build={b} api={api} />
          ))}
        </div>
      )}
    </div>
  );
}
