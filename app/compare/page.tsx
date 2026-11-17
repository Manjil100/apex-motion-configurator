import type { Metadata } from "next";
import { Suspense } from "react";
import { vehicles } from "@/lib/vehicles/data";
import { PageHeader } from "@/components/ui/PageHeader";
import { CompareTable } from "@/components/compare/CompareTable";

export const metadata: Metadata = { title: "Compare cars" };

type Search = Promise<{ cars?: string }>;

/** Reads the query string, so it streams inside Suspense while the page shell is prerendered. */
async function CompareFromQuery({ searchParams }: { searchParams: Search }) {
  const { cars } = await searchParams;
  const initial = (cars ?? "")
    .split(",")
    .filter((slug) => vehicles.some((v) => v.slug === slug))
    .slice(0, 3);
  return <CompareTable key={initial.join(",")} vehicles={vehicles} initial={initial} />;
}

export default function ComparePage({ searchParams }: { searchParams: Search }) {
  return (
    <>
      <PageHeader title="Compare" lead="Put up to three cars side by side." />
      <Suspense fallback={<p className="shell py-10 text-steel">Loading comparison…</p>}>
        <CompareFromQuery searchParams={searchParams} />
      </Suspense>
    </>
  );
}
