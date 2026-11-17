import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { ContactForm } from "@/components/contact/ContactForm";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <>
      <PageHeader title="Contact" lead="Questions about the platform, a car you want added, or something that is not working." />
      <div className="shell py-12">
        <div className="max-w-2xl">
          <ContactForm />
        </div>
      </div>
    </>
  );
}
