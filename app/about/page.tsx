import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { LinkButton } from "@/components/ui/Button";

export const metadata: Metadata = { title: "About" };

const sections = [
  {
    title: "Our story",
    body: "APEX MOTION began with a simple frustration: most online configurators show you a photograph and call it a preview. We wanted to build the car in front of you, let you walk around it, and open the door.",
  },
  {
    title: "Mission",
    body: "Give anyone a studio-quality way to specify a performance car, with every surface they change rendered on real geometry, inside and out.",
  },
  {
    title: "Vision",
    body: "A configurator people trust. If a number is not verified it says so. If a model cannot show an option, that option is switched off and the reason is given.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader title="About APEX MOTION" lead="An independent concept platform for configuring performance cars in 3D." />
      <div className="shell py-16">
        <div className="grid gap-12 lg:grid-cols-3">
          {sections.map((s) => (
            <section key={s.title} className="border-t border-line pt-6">
              <h2 className="type-heading">{s.title}</h2>
              <p className="mt-3 text-silver">{s.body}</p>
            </section>
          ))}
        </div>

        <section className="mt-20 grid gap-10 border border-line bg-graphite p-8 md:p-12 lg:grid-cols-[1fr_1.3fr]">
          <h2 className="type-title">How the platform works</h2>
          <div className="space-y-5 text-silver">
            <p>
              Each car is a licensed 3D model that has been inspected part by part. Its panels, wheels, seats and trim
              are mapped to the options you see, so a change in the panel is a change on the car.
            </p>
            <p>
              The platform is being built in stages. The studio, the catalogue and your garage are here now. The 3D
              models join car by car as each one is sourced and verified.
            </p>
            <p className="text-[0.9375rem] text-steel">
              APEX MOTION is not affiliated with or endorsed by any vehicle manufacturer. Vehicle names identify the
              cars shown and remain the property of their owners.
            </p>
            <LinkButton href="/cars">Explore cars</LinkButton>
          </div>
        </section>
      </div>
    </>
  );
}
