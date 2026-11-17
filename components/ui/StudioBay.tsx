import { clsx } from "clsx";
import type { Vehicle } from "@/lib/vehicles/types";

/**
 * The empty studio a vehicle will stand in.
 *
 * Until a licensed, verified 3D model exists for a car, this is what is shown:
 * the lit bay with the car's generation code set into the back wall. It is not
 * a picture of the car and is never labelled as one. In Phase 2 the
 * React Three Fiber canvas mounts in this same frame.
 */
export function StudioBay({
  vehicle,
  size = "card",
  showStatus = true,
  children,
  className,
}: {
  vehicle: Vehicle;
  size?: "card" | "stage";
  showStatus?: boolean;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "relative isolate overflow-hidden bg-graphite",
        size === "card" ? "aspect-[16/10]" : "h-full min-h-[22rem] w-full",
        className,
      )}
    >
      {/* back wall wash */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(120% 70% at 50% 0%, #2b2f37 0%, #15171b 45%, #0a0b0d 100%)",
        }}
      />
      {/* overhead light bar */}
      <div
        aria-hidden="true"
        className={clsx("absolute left-[12%] right-[12%] -z-10 h-[3px] rounded-full bg-chalk/90 blur-[1px]", size === "card" ? "top-[9%]" : "top-[17%]")}
        style={{ boxShadow: "0 0 60px 18px rgba(243,244,246,0.16)" }}
      />
      {/* generation code set into the wall */}
      <span
        aria-hidden="true"
        className={clsx(
          "metal absolute inset-x-0 -z-10 select-none text-center font-display font-semibold leading-none opacity-[0.22]",
          size === "card" ? "top-[24%] text-[clamp(3rem,9vw,5.5rem)]" : "top-[27%] text-[clamp(5rem,16vw,13rem)]",
        )}
        style={{ fontStretch: "125%" }}
      >
        {vehicle.generation}
      </span>
      {/* floor with light-bar reflection */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 -z-10 h-[38%] border-t border-white/[0.06]"
        style={{
          background:
            "linear-gradient(180deg, #0d0e11 0%, #060708 100%), radial-gradient(60% 100% at 50% 0%, rgba(243,244,246,0.10), transparent)",
          backgroundBlendMode: "screen",
        }}
      >
        <div className="absolute left-[22%] right-[22%] top-[18%] h-px bg-chalk/25 blur-[2px]" />
      </div>

      {showStatus && (
        <p className="absolute bottom-3 left-4 flex items-center gap-2 text-[0.75rem] text-steel">
          <span className="h-1.5 w-1.5 rounded-full bg-steel" />
          3D model pending
        </p>
      )}
      {children}
    </div>
  );
}
