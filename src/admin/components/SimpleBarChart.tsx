interface SimpleBarChartProps {
  items: Array<{ label: string; value: number }>;
  valueFormatter?: (value: number) => string;
  emptyMessage?: string;
}

export function SimpleBarChart({
  items,
  valueFormatter = (value) => String(value),
  emptyMessage = 'Veri yok',
}: SimpleBarChartProps) {
  if (!items.length) {
    return (
      <p className="py-8 text-center text-xs text-slate-500">{emptyMessage}</p>
    );
  }

  const maxValue = Math.max(...items.map((item) => item.value), 1);

  return (
    <div className="space-y-2">
      {items.map((item) => {
        const width = Math.max((item.value / maxValue) * 100, item.value > 0 ? 4 : 0);
        return (
          <div key={item.label} className="grid grid-cols-[88px_1fr_auto] items-center gap-2">
            <span className="truncate text-[11px] text-slate-500">{item.label}</span>
            <div className="h-2 rounded-full bg-slate-100">
              <div
                className="h-2 rounded-full bg-slate-800 transition-all"
                style={{ width: `${width}%` }}
              />
            </div>
            <span className="text-[11px] font-medium text-slate-700">
              {valueFormatter(item.value)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

interface SimpleLineChartProps {
  items: Array<{ label: string; value: number }>;
  valueFormatter?: (value: number) => string;
  emptyMessage?: string;
}

export function SimpleLineChart({
  items,
  valueFormatter = (value) => String(value),
  emptyMessage = 'Veri yok',
}: SimpleLineChartProps) {
  if (!items.length) {
    return (
      <p className="py-8 text-center text-xs text-slate-500">{emptyMessage}</p>
    );
  }

  const width = 100;
  const height = 120;
  const padding = 8;
  const maxValue = Math.max(...items.map((item) => item.value), 1);
  const stepX =
    items.length > 1 ? (width - padding * 2) / (items.length - 1) : 0;

  const points = items.map((item, index) => {
    const x = padding + index * stepX;
    const y =
      height -
      padding -
      (item.value / maxValue) * (height - padding * 2);
    return { x, y, item };
  });

  const path = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-32 w-full">
        <path
          d={path}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-slate-800"
        />
        {points.map((point) => (
          <circle
            key={point.item.label}
            cx={point.x}
            cy={point.y}
            r="2"
            className="fill-slate-800"
          />
        ))}
      </svg>
      <div className="mt-2 flex justify-between gap-1 overflow-x-auto">
        {items.map((item) => (
          <div key={item.label} className="min-w-0 text-center">
            <p className="truncate text-[10px] text-slate-400">{item.label}</p>
            <p className="text-[10px] font-medium text-slate-700">
              {valueFormatter(item.value)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
