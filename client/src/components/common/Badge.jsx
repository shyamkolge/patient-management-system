const toneMap = {
  success: 'bg-emerald-100 text-emerald-700',
  warning: 'bg-amber-100 text-amber-700',
  danger: 'bg-rose-100 text-rose-700',
  info: 'bg-blue-100 text-blue-700',
  neutral: 'bg-slate-100 text-slate-700',
};

export const Badge = ({ children, tone = 'neutral' }) => (
  <span className={`rounded-full px-3 py-1 text-xs font-medium ${toneMap[tone] || toneMap.neutral}`}>
    {children}
  </span>
);
