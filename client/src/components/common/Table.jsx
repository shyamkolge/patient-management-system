export const Table = ({ columns, rows, renderRow }) => (
  <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
    <table className="min-w-full divide-y divide-slate-200 text-sm">
      <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
        <tr>
          {columns.map((column) => (
            <th key={column} className="px-5 py-3">{column}</th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {rows.map(renderRow)}
      </tbody>
    </table>
  </div>
);
