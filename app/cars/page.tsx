import type { Metadata } from "next";
import { bodyStyles, manufacturers, vehicles } from "@/lib/vehicles/data";
import { Catalogue } from "@/components/cars/Catalogue";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = { title: "Discover cars" };

export default function CarsPage() {
  return (
    <>
      <PageHeader
        title="Discover cars"
        lead="Nine cars from nine makers. Search, narrow the field, then open one in the configurator."
      />
      <Catalogue vehicles={vehicles} manufacturers={manufacturers} bodyStyles={bodyStyles} />
    </>
  );
}
