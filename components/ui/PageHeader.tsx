export function PageHeader({
  title,
  lead,
  children,
}: {
  title: string;
  lead?: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="border-b border-line">
      <div className="shell flex flex-col gap-6 py-14 md:flex-row md:items-end md:justify-between md:py-20">
        <div>
          <h1 className="type-title">{title}</h1>
          {lead && <p className="type-lead mt-4">{lead}</p>}
        </div>
        {children && <div className="shrink-0">{children}</div>}
      </div>
    </header>
  );
}

/** States plainly that a feature is not live yet and when it arrives. */
export function Notice({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div role="status" className="border-l-2 border-volt bg-slate px-5 py-4">
      <p className="font-medium text-chalk">{title}</p>
      <div className="mt-1 text-[0.9375rem] text-silver">{children}</div>
    </div>
  );
}
