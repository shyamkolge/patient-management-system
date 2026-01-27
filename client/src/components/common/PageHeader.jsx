export const PageHeader = ({ title, subtitle, action }) => (
  <div className="flex flex-wrap items-center justify-between gap-4">
    <div>
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
    </div>
    {action}
  </div>
);
