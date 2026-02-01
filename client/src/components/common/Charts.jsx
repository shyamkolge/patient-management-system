import { useMemo } from 'react';

export const LineChart = ({ data, height = 300, showGrid = true, smooth = true }) => {
  const { points, maxValue, minValue } = useMemo(() => {
    if (!data || data.length === 0) return { points: '', maxValue: 0, minValue: 0 };

    const values = data.map(d => d.value);
    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = max - min || 1;

    const width = 100 / (data.length - 1 || 1);
    const pts = data.map((d, i) => {
      const x = i * width;
      const y = 100 - ((d.value - min) / range) * 80 - 10;
      return `${x},${y}`;
    }).join(' ');

    return { points: pts, maxValue: max, minValue: min };
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400">
        No data available
      </div>
    );
  }

  return (
    <div className="relative w-full" style={{ height }}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
        {/* Grid lines */}
        {showGrid && (
          <g className="text-slate-200">
            {[0, 25, 50, 75, 100].map(y => (
              <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="currentColor" strokeWidth="0.2" />
            ))}
          </g>
        )}

        {/* Gradient */}
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity="0.05" />
          </linearGradient>
        </defs>

        {/* Area under line */}
        <polygon
          points={`0,100 ${points} 100,100`}
          fill="url(#lineGradient)"
          className="transition-all duration-300"
        />

        {/* Line */}
        <polyline
          points={points}
          fill="none"
          stroke="rgb(59, 130, 246)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-all duration-300"
          style={{ vectorEffect: 'non-scaling-stroke' }}
        />

        {/* Points */}
        {data.map((d, i) => {
          const x = i * (100 / (data.length - 1 || 1));
          const y = 100 - ((d.value - minValue) / (maxValue - minValue || 1)) * 80 - 10;
          return (
            <g key={i}>
              <circle
                cx={x}
                cy={y}
                r="1.5"
                fill="white"
                stroke="rgb(59, 130, 246)"
                strokeWidth="1"
                className="transition-all duration-300 hover:r-2"
                style={{ vectorEffect: 'non-scaling-stroke' }}
              />
            </g>
          );
        })}
      </svg>

      {/* Labels */}
      <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-xs text-slate-500">
        {data.map((d, i) => (
          <span key={i} className="text-center" style={{ width: `${100 / data.length}%` }}>
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
};

export const BarChart = ({ data, height = 300, color = 'rgb(59, 130, 246)' }) => {
  const maxValue = useMemo(() => {
    if (!data || data.length === 0) return 0;
    return Math.max(...data.map(d => d.value));
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400">
        No data available
      </div>
    );
  }

  return (
    <div className="relative w-full pb-8" style={{ height }}>
      <div className="flex h-full items-end justify-around gap-2 px-2">
        {data.map((d, i) => {
          const heightPercent = maxValue ? (d.value / maxValue) * 100 : 0;
          return (
            <div key={i} className="flex flex-col items-center flex-1 group">
              <div className="relative flex-1 w-full flex items-end">
                <div className="w-full relative group">
                  <div
                    className="w-full rounded-t-lg transition-all duration-500 hover:opacity-80"
                    style={{
                      height: `${heightPercent}%`,
                      backgroundColor: color,
                      minHeight: '2px',
                    }}
                  >
                    {/* Tooltip on hover */}
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none">
                      {d.value}
                    </div>
                  </div>
                </div>
              </div>
              <span className="text-xs text-slate-600 mt-2 text-center">{d.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const DonutChart = ({ data, size = 200, strokeWidth = 30 }) => {
  const total = useMemo(() => {
    return data.reduce((sum, d) => sum + d.value, 0);
  }, [data]);

  const colors = [
    'rgb(34, 197, 94)',   // green
    'rgb(234, 179, 8)',   // yellow
    'rgb(239, 68, 68)',   // red
    'rgb(59, 130, 246)',  // blue
    'rgb(168, 85, 247)',  // purple
  ];

  if (!data || data.length === 0 || total === 0) {
    return (
      <div className="flex items-center justify-center text-slate-400" style={{ width: size, height: size }}>
        No data
      </div>
    );
  }

  const radius = 50 - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercentage = 0;

  return (
    <div className="flex items-center gap-6">
      <div className="relative" style={{ width: size, height: size }}>
        <svg viewBox="0 0 100 100" className="transform -rotate-90">
          {data.map((d, i) => {
            const percentage = (d.value / total) * 100;
            const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
            const strokeDashoffset = -((accumulatedPercentage / 100) * circumference);
            
            accumulatedPercentage += percentage;

            return (
              <circle
                key={i}
                cx="50"
                cy="50"
                r={radius}
                fill="transparent"
                stroke={colors[i % colors.length]}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-300 hover:opacity-80"
              />
            );
          })}
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-slate-900">{total}</span>
          <span className="text-xs text-slate-500">Total</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-col gap-2">
        {data.map((d, i) => {
          const percentage = ((d.value / total) * 100).toFixed(1);
          return (
            <div key={i} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: colors[i % colors.length] }}
              />
              <span className="text-sm text-slate-700">
                {d.label}: {d.value} ({percentage}%)
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
