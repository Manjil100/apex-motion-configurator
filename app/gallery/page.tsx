import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { LinkButton } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Gallery" };

export default function GalleryPage() {
  return (
    <>
      <PageHeader title="Gallery" lead="Builds published by APEX MOTION drivers, with the full specification behind each one." />
      <div className="shell py-10">
        <div className="border border-line px-6 py-20 text-center">
          <p className="type-heading">Nothing has been published yet</p>
          <p className="mx-auto mt-2 max-w-lg text-silver">
            Publishing, likes and favourites open when accounts go live. This page will only ever show real builds made
            by real people, so for now it is empty.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <LinkButton href="/configure" size="lg">
              Start customising
            </LinkButton>
            <LinkButton href="/garage" variant="secondary" size="lg">
              Open my garage
            </LinkButton>
          </div>
        </div>
      </div>
    </>
  );
}
