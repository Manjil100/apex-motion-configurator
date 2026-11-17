import { LinkButton } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="shell grid min-h-[70dvh] place-items-center py-20 text-center">
      <div>
        <h1 className="type-title">This page ran wide</h1>
        <p className="mx-auto mt-3 max-w-md text-silver">
          The address does not match a page or a car in the catalogue. Check the link, or head back to the cars.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <LinkButton href="/cars">Explore cars</LinkButton>
          <LinkButton href="/" variant="secondary">
            Go home
          </LinkButton>
        </div>
      </div>
    </div>
  );
}
