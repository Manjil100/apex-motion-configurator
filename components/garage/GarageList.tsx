"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useGarage, type SavedBuild } from "@/stores/garage";
import { getVehicle, vehicleName } from "@/lib/vehicles/data";
import { encodeSelection, findOption, formatPrice, optionsTotal } from "@/lib/customisation/options";
import { StudioBay } from "@/components/ui/StudioBay";
import { Button, buttonClass } from "@/components/ui/Button";

const subscribe = () => () => {};
/** False on the server and during hydration, true afterwards, so saved builds never cause a hydration mismatch. */
const useMounted = () =>
  useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

function BuildCard({ build }: { build: SavedBuild }) {
  const { rename, duplicate, remove } = useGarage();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(build.name);
  const [confirming, setConfirming] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const vehicle = getVehicle(build.vehicleSlug);
  if (!vehicle) return null;

  const paint = findOption("paint", build.selection.paint?.[0]);

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
    <article className="flex flex-col border border-line bg-graphite">
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
              rename(build.id, name);
              setEditing(false);
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
            <Button type="submit" variant="secondary">
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
          {paint?.name}, options {formatPrice(optionsTotal(build.selection))}{" "}
          <span className="text-steel">(illustrative)</span>
        </p>
        <p className="mt-1 text-[0.8125rem] text-steel">
          Updated {new Date(build.updatedAt).toLocaleDateString("en-NZ", { day: "numeric", month: "short", year: "numeric" })}
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
          <Link href={`/configure/${vehicle.slug}?build=${build.id}`} className={buttonClass("primary", "md")}>
            Edit build
          </Link>
          {!editing && (
            <Button variant="quiet" onClick={() => setEditing(true)}>
              Rename
            </Button>
          )}
          <Button variant="quiet" onClick={() => duplicate(build.id)}>
            Duplicate
          </Button>
          <Button variant="quiet" onClick={share}>
            Share
          </Button>
          {confirming ? (
            <span className="flex items-center gap-3 text-[0.9375rem]">
              <button type="button" className="text-flag underline underline-offset-4" onClick={() => remove(build.id)}>
                Delete build
              </button>
              <button type="button" className="text-steel underline underline-offset-4" onClick={() => setConfirming(false)}>
                Keep
              </button>
            </span>
          ) : (
            <Button variant="quiet" onClick={() => setConfirming(true)}>
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

export function GarageList() {
  const mounted = useMounted();
  const builds = useGarage((s) => s.builds);

  if (!mounted) {
    return <p className="text-steel">Loading your builds…</p>;
  }

  if (builds.length === 0) {
    return (
      <div className="border border-line px-6 py-20 text-center">
        <p className="type-heading">Your garage is empty</p>
        <p className="mx-auto mt-2 max-w-md text-steel">
          Configure a car and choose Save configuration. It will appear here, ready to edit, duplicate or share.
        </p>
        <Link href="/configure" className={buttonClass("primary", "lg", "mt-8")}>
          Start customising
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {builds.map((b) => (
        <BuildCard key={b.id} build={b} />
      ))}
    </div>
  );
}
