import Link from "next/link";
import { vehicles } from "@/lib/vehicles/data";
import { VehicleCard } from "@/components/cars/VehicleCard";
import { LinkButton, buttonClass } from "@/components/ui/Button";
import { StudioBay } from "@/components/ui/StudioBay";

const featured = ["porsche-911", "mclaren-720s", "nissan-gt-r"].map((s) =>
  vehicles.find((v) => v.slug === s)!,
);
const showcase = vehicles.find((v) => v.slug === "lamborghini-huracan")!;

export default function Home() {
  return (
    <>
      {/* Hero: the racing line through a corner, drawn once. The dot is the apex. */}
      <section className="relative isolate flex min-h-[calc(100dvh-4rem)] flex-col justify-end overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-20"
          style={{
            background:
              "radial-gradient(90% 60% at 72% 18%, #23262d 0%, #0e1013 48%, #07080a 100%)",
          }}
        />
        <svg
          aria-hidden="true"
          viewBox="0 0 1440 900"
          preserveAspectRatio="xMidYMid slice"
          className="absolute inset-0 -z-10 h-full w-full"
        >
          <defs>
            <linearGradient id="line" x1="0" x2="1" y1="1" y2="0">
              <stop offset="0" stopColor="#c8ccd3" stopOpacity="0.08" />
              <stop offset="0.5" stopColor="#f3f4f6" />
              <stop offset="1" stopColor="#c8ccd3" stopOpacity="0.3" />
            </linearGradient>
          </defs>
          <g transform="translate(230 -40)">
            {/* track edges */}
            <path
              d="M-300 760 C 420 760, 640 620, 760 400 C 880 180, 1100 60, 1500 60"
              fill="none"
              stroke="#2a2e35"
              strokeWidth="1"
            />
            <path
              d="M-300 980 C 560 980, 860 800, 980 560 C 1080 360, 1240 280, 1500 280"
              fill="none"
              stroke="#2a2e35"
              strokeWidth="1"
            />
            {/* the line */}
            <path
              pathLength={1}
              className="apex-draw"
              d="M-300 930 C 420 930, 720 700, 820 470 C 900 290, 1120 130, 1500 110"
              fill="none"
              stroke="url(#line)"
              strokeWidth="3"
            />
            <circle
              cx="820"
              cy="470"
              r="9"
              className="apex-rise fill-volt"
              style={{ animationDelay: "1.1s" }}
            />
            <circle
              cx="820"
              cy="470"
              r="22"
              fill="none"
              stroke="#8f6bff"
              strokeOpacity="0.35"
              className="apex-rise"
              style={{ animationDelay: "1.25s" }}
            />
          </g>
        </svg>

        <div className="shell pb-16 pt-28 md:pb-24">
          <h1
            className="type-display apex-rise max-w-[14ch]"
            style={{ animationDelay: "0.2s" }}
          >
            Configure your dream.
          </h1>
          <p
            className="type-lead apex-rise mt-6"
            style={{ animationDelay: "0.45s" }}
          >
            Nine performance cars, one studio. Choose the paint, the wheels and
            the cabin, then walk around the result in 3D. Experience the
            difference.
          </p>
          <div
            className="apex-rise mt-10 flex flex-wrap items-center gap-4"
            style={{ animationDelay: "0.6s" }}
          >
            <LinkButton href="/configure" size="lg">
              Start customising
            </LinkButton>
            <LinkButton href="/cars" variant="secondary" size="lg">
              Explore cars
            </LinkButton>
          </div>
        </div>
      </section>

      {/* Showcase bay */}
      <section className="border-y border-line bg-graphite">
        <div className="grid lg:grid-cols-[1.5fr_1fr]">
          <StudioBay
            vehicle={showcase}
            size="stage"
            className="min-h-[24rem] lg:min-h-[34rem]"
          />
          <div className="flex flex-col justify-center px-[clamp(1.25rem,4vw,4rem)] py-14">
            <p className="type-label">In the studio</p>
            <h2 className="type-title mt-2">
              {showcase.manufacturer} {showcase.model}
            </h2>
            <p className="mt-5 max-w-md text-silver">{showcase.summary}</p>
            <dl className="mt-8 grid max-w-md grid-cols-2 gap-x-8 gap-y-5 border-t border-line pt-6 text-[0.9375rem]">
              <div>
                <dt className="text-steel">Engine</dt>
                <dd className="mt-0.5 text-chalk">{showcase.engine.value}</dd>
              </div>
              <div>
                <dt className="text-steel">Driven wheels</dt>
                <dd className="mt-0.5 text-chalk">
                  {showcase.drivetrain.value === "RWD" ? "Rear" : "All four"}
                </dd>
              </div>
            </dl>
            <div className="mt-10 flex flex-wrap items-center gap-5">
              <LinkButton href={`/configure/${showcase.slug}`}>
                Start customising
              </LinkButton>
              <Link
                href={`/cars/${showcase.slug}`}
                className={buttonClass("quiet")}
              >
                View details
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="shell py-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="type-title">Featured cars</h2>
          <Link href="/cars" className={buttonClass("quiet")}>
            See all nine
          </Link>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {featured.map((v) => (
            <VehicleCard key={v.slug} vehicle={v} />
          ))}
        </div>
      </section>

      {/* Brand */}
      <section className="border-y border-line">
        <div className="shell grid gap-12 py-24 lg:grid-cols-[1fr_1.2fr]">
          <h2 className="type-title max-w-[16ch]">
            A configurator that shows its working.
          </h2>
          <div className="space-y-10">
            <p className="type-lead">
              APEX MOTION is an independent concept platform. Every change you
              make is applied to a real 3D model, not a swapped photograph, and
              every figure on the site tells you whether it has been verified.
            </p>
            <dl className="grid gap-8 sm:grid-cols-3">
              <div className="border-t border-line pt-5">
                <dt className="type-heading">Real geometry</dt>
                <dd className="mt-2 text-[0.9375rem] text-silver">
                  Paint, wheels and trim change the model itself, panel by
                  panel.
                </dd>
              </div>
              <div className="border-t border-line pt-5">
                <dt className="type-heading">Inside too</dt>
                <dd className="mt-2 text-[0.9375rem] text-silver">
                  Sit in the cabin and look around before you settle on leather
                  and stitching.
                </dd>
              </div>
              <div className="border-t border-line pt-5">
                <dt className="type-heading">Honest numbers</dt>
                <dd className="mt-2 text-[0.9375rem] text-silver">
                  Unverified specifications are marked. Illustrative prices are
                  labelled.
                </dd>
              </div>
            </dl>
            <Link href="/about" className={buttonClass("quiet")}>
              Read about the platform
            </Link>
          </div>
        </div>
      </section>

      {/* Community */}
      <section className="shell py-24">
        <h2 className="type-title">Built by drivers</h2>
        <div className="mt-10 grid items-center gap-8 border border-line bg-graphite p-8 md:grid-cols-[1fr_auto] md:p-12">
          <div>
            <p className="type-heading">No builds have been published yet</p>
            <p className="mt-2 max-w-xl text-silver">
              The gallery opens for submissions when accounts go live. Save a
              build to your garage now and it will be ready to publish.
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <LinkButton href="/configure">Start customising</LinkButton>
            <LinkButton href="/gallery" variant="secondary">
              Visit the gallery
            </LinkButton>
          </div>
        </div>
      </section>
    </>
  );
}
