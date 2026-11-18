import type { Metadata } from "next";
import { PageHeader, Notice } from "@/components/ui/PageHeader";
import { LinkButton } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Admin", robots: { index: false } };

const modules = [
  { name: "Vehicles", detail: "Add, edit and retire cars in the catalogue." },
  { name: "Customisation options", detail: "Manage categories, options and prices per car." },
  { name: "Assets", detail: "Upload 3D models, record licences and sign off verification reports." },
  { name: "Users", detail: "View accounts and assign roles." },
  { name: "Gallery moderation", detail: "Approve or remove published builds." },
  { name: "Enquiries", detail: "Read and resolve contact messages." },
];

export default function AdminPage() {
  return (
    <>
      <PageHeader title="Admin" lead="Catalogue, assets, users and moderation." />
      <div className="shell space-y-10 py-10">
        <Notice title="Admin tools arrive in Phase 7">
          Accounts and the admin role now exist in the database, and the database already refuses catalogue changes
          from anyone who is not an admin. The screens below are built in Phase 7.
        </Notice>
        <ul className="grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((m) => (
            <li key={m.name} className="bg-carbon p-6 opacity-60">
              <h2 className="type-heading">{m.name}</h2>
              <p className="mt-2 text-[0.9375rem] text-silver">{m.detail}</p>
              <p className="mt-4 text-[0.8125rem] text-steel">Locked</p>
            </li>
          ))}
        </ul>
        <LinkButton href="/auth/login" variant="secondary">
          Sign in
        </LinkButton>
      </div>
    </>
  );
}
