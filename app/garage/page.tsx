import type { Metadata } from "next";
import { PageHeader, Notice } from "@/components/ui/PageHeader";
import { GarageList } from "@/components/garage/GarageList";

export const metadata: Metadata = { title: "My garage" };

export default function GaragePage() {
  return (
    <>
      <PageHeader title="My garage" lead="Every build you have saved. Edit, rename, duplicate, share or delete." />
      <div className="shell space-y-8 py-10">
        <Notice title="Builds are stored in this browser for now">
          Until accounts open, your garage lives on this device. Clearing site data removes it. Share links work on any
          device.
        </Notice>
        <GarageList />
      </div>
    </>
  );
}
