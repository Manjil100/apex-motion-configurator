import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { loaderFixture } from "@/lib/vehicles/fixture";
import { Configurator } from "@/components/configurator/Configurator";

export const metadata: Metadata = { title: "Loader test", robots: { index: false, follow: false } };

/** Development only: the configurator running against the generated test model. Not available in production. */
export default function LoaderTestPage() {
  if (process.env.VERCEL_ENV === "production") notFound();
  return <Configurator vehicle={loaderFixture} />;
}
