export const StatCard = ({ label, value, helper, icon }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow flex items-center gap-4">
    {icon && <div className="flex-shrink-0 bg-slate-100 rounded-xl p-3 flex items-center justify-center">{icon}</div>}
    <div>
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
      {helper && <p className="mt-1 text-xs text-slate-500">{helper}</p>}
    </div>
  </div>
);
