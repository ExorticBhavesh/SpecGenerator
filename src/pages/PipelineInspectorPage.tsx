import { useParams, Link } from 'react-router-dom';
import { usePipelineInspector } from '../hooks/usePipelineInspector';
import { ValidationPanelView } from '../components/ValidationPanel';

const STAGE_ORDER = [
  'INTENT',
  'DESIGN',
  'DATABASE',
  'API',
  'UI',
  'CONSISTENCY',
  'REPAIR',
  'SIMULATION',
];

export default function PipelineInspectorPage() {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading, error } = usePipelineInspector(id);

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 text-slate-500">
        Loading pipeline...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 text-rose-600">
        Pipeline not found.
      </div>
    );
  }

  const orderedStages = STAGE_ORDER.map((name) =>
    data.stages.find((s) => s.name === name),
  ).filter(Boolean);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/evaluation" className="text-blue-600 text-sm hover:underline">
          ← Back to Evaluation
        </Link>
        <h1 className="text-2xl font-bold mt-2">Pipeline Inspector</h1>
        <p className="text-slate-500 text-sm mt-1 font-mono">{data.id}</p>
      </div>

      <div className="bg-white rounded-lg border p-4 mb-6">
        <div className="flex flex-wrap gap-4 text-sm">
          <div>
            <span className="text-slate-500">Status:</span>{' '}
            <StatusBadge status={data.status} />
          </div>
          <div>
            <span className="text-slate-500">Duration:</span>{' '}
            {data.totalDurationMs
              ? `${(data.totalDurationMs / 1000).toFixed(1)}s`
              : '—'}
          </div>
        </div>
        <p className="mt-3 text-sm text-slate-700">{data.requirements}</p>
      </div>

      <ValidationPanelView validation={data.validation} />

      <div className="mt-6 space-y-4">
        <h2 className="font-semibold text-lg">Pipeline Stages</h2>
        {orderedStages.map((stage) => (
          <StageCard key={stage!.name} stage={stage!} />
        ))}
      </div>
    </div>
  );
}

function StageCard({
  stage,
}: {
  stage: {
    name: string;
    status: string;
    durationMs: number | null;
    output: Record<string, unknown> | null;
    error: string | null;
  };
}) {
  return (
    <div className="bg-white rounded-lg border">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <h3 className="font-medium">{stage.name}</h3>
        <div className="flex items-center gap-3 text-sm">
          <StatusBadge status={stage.status} />
          {stage.durationMs !== null && (
            <span className="text-slate-500">
              {(stage.durationMs / 1000).toFixed(2)}s
            </span>
          )}
        </div>
      </div>
      <div className="p-4">
        {stage.error && (
          <p className="text-rose-600 text-sm mb-2">{stage.error}</p>
        )}
        {stage.output ? (
          <pre className="text-xs bg-slate-50 p-3 rounded overflow-x-auto max-h-64">
            {JSON.stringify(stage.output, null, 2)}
          </pre>
        ) : (
          <p className="text-slate-400 text-sm">No output</p>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    COMPLETED: 'bg-emerald-100 text-emerald-700',
    FAILED: 'bg-rose-100 text-rose-700',
    RUNNING: 'bg-blue-100 text-blue-700',
    PENDING: 'bg-slate-100 text-slate-600',
  };
  return (
    <span
      className={`px-2 py-0.5 rounded text-xs font-medium ${colors[status] ?? colors.PENDING}`}
    >
      {status}
    </span>
  );
}
