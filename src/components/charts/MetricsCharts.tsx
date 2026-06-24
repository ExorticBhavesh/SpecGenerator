import type { EvaluationMetrics } from '../../types/pipeline';

interface MetricsChartsProps {
  metrics: EvaluationMetrics;
  totalRuns: number;
}

export function MetricsCharts({ metrics, totalRuns }: MetricsChartsProps) {
  const successPct = Math.round(metrics.successRate * 100);
  const repairPct = Math.round(metrics.repairRate * 100);
  const latencySec = (metrics.averageLatency / 1000).toFixed(1);

  const failureCategories = metrics.failureTypes.length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <MetricCard label="Success Rate" value={`${successPct}%`} accent="emerald" />
      <MetricCard label="Repair Rate" value={`${repairPct}%`} accent="amber" />
      <MetricCard label="Avg Latency" value={`${latencySec}s`} accent="blue" />
      <MetricCard label="Total Runs" value={String(totalRuns)} accent="slate" />
      <MetricCard
        label="Failure Categories"
        value={String(failureCategories)}
        accent="rose"
      />
      <MetricCard
        label="Consistency Errors"
        value={String(metrics.consistencyErrors)}
        accent="orange"
      />

      <div className="md:col-span-2 lg:col-span-3 bg-white rounded-lg border p-4">
        <h3 className="text-sm font-medium text-slate-600 mb-3">Rate Comparison</h3>
        <div className="space-y-3">
          <BarRow label="Success" value={successPct} color="bg-emerald-500" />
          <BarRow label="Repair" value={repairPct} color="bg-amber-500" />
        </div>
      </div>

      {metrics.failureTypes.length > 0 && (
        <div className="md:col-span-2 lg:col-span-3 bg-white rounded-lg border p-4">
          <h3 className="text-sm font-medium text-slate-600 mb-3">
            Failure Categories
          </h3>
          <ul className="space-y-1">
            {metrics.failureTypes.map((type: string) => (
              <li
                key={type}
                className="text-sm text-slate-700 bg-rose-50 px-3 py-1 rounded"
              >
                {type}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function MetricCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: string;
}) {
  const accentMap: Record<string, string> = {
    emerald: 'text-emerald-600',
    amber: 'text-amber-600',
    blue: 'text-blue-600',
    slate: 'text-slate-600',
    rose: 'text-rose-600',
    orange: 'text-orange-600',
  };

  return (
    <div className="bg-white rounded-lg border p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${accentMap[accent]}`}>{value}</p>
    </div>
  );
}

function BarRow({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all`}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
    </div>
  );
}
