import { useEvaluation, useRunEvaluation } from '../hooks/useEvaluation';
import { MetricsCharts } from '../components/charts/MetricsCharts';
import { Link } from 'react-router-dom';

export default function EvaluationPage() {
  const { data, isLoading, error } = useEvaluation();
  const runMutation = useRunEvaluation();

  const metrics = data?.metrics ?? runMutation.data?.metrics;
  const runs = data?.runs ?? runMutation.data?.runs ?? [];
  const totalRuns = runs.length;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Evaluation Dashboard
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Pipeline evaluation metrics across 20 test prompts
          </p>
        </div>
        <button
          onClick={() => runMutation.mutate()}
          disabled={runMutation.isPending}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
        >
          {runMutation.isPending ? 'Running...' : 'Run Evaluation'}
        </button>
      </div>

      {isLoading && <p className="text-slate-500">Loading evaluation data...</p>}
      {error && (
        <p className="text-rose-600">Failed to load evaluation data.</p>
      )}

      {metrics && (
        <MetricsCharts metrics={metrics} totalRuns={totalRuns} />
      )}

      {!metrics && !isLoading && !runMutation.isPending && (
        <div className="bg-white rounded-lg border p-8 text-center text-slate-500">
          No evaluation runs yet. Click &quot;Run Evaluation&quot; to start.
        </div>
      )}

      {runs.length > 0 && (
        <div className="mt-8 bg-white rounded-lg border">
          <div className="px-4 py-3 border-b">
            <h2 className="font-semibold">Run History</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-2 text-left">Prompt</th>
                  <th className="px-4 py-2 text-left">Category</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Latency</th>
                  <th className="px-4 py-2 text-left">Repairs</th>
                  <th className="px-4 py-2 text-left">Pipeline</th>
                </tr>
              </thead>
              <tbody>
                {runs.map((run) => (
                  <tr key={run.promptId} className="border-t">
                    <td className="px-4 py-2">{run.subcategory}</td>
                    <td className="px-4 py-2">{run.category}</td>
                    <td className="px-4 py-2">
                      <span
                        className={
                          run.success
                            ? 'text-emerald-600'
                            : 'text-rose-600'
                        }
                      >
                        {run.success ? 'Pass' : 'Fail'}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      {(run.latencyMs / 1000).toFixed(1)}s
                    </td>
                    <td className="px-4 py-2">{run.repairCount}</td>
                    <td className="px-4 py-2">
                      {run.pipelineRunId ? (
                        <Link
                          to={`/pipeline/${run.pipelineRunId}`}
                          className="text-blue-600 hover:underline"
                        >
                          View
                        </Link>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
