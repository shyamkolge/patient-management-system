export const EmptyState = ({ title, description }) => (
  <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center">
    <p className="text-sm font-semibold text-slate-900">{title}</p>
    {description && <p className="text-sm text-slate-500">{description}</p>}
  </div>
);
