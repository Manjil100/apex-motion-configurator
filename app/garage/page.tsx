import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { GarageList } from "@/components/garage/GarageList";

export const metadata: Metadata = { title: "My garage" };

export default function GaragePage() {
  return (
    <>
      <PageHeader title="My garage" lead="Every build you have saved. Edit, rename, duplicate, share or delete." />
      <div className="shell py-10">
        <GarageList />
      </div>
    </>
  );
}
