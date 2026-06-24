import { Filter, Download } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { usePipelineRuns } from '../hooks/usePipeline';
import { Link } from 'react-router-dom';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'COMPLETED':
      return 'bg-green-500/20 text-green-400';
    case 'RUNNING':
      return 'bg-blue-500/20 text-blue-400';
    case 'FAILED':
      return 'bg-red-500/20 text-red-400';
    case 'PENDING':
      return 'bg-yellow-500/20 text-yellow-400';
    default:
      return 'bg-gray-500/20 text-gray-400';
  }
};

const formatStatus = (status: string) => {
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
};

export default function PipelineRunsPage() {
  const { data, isLoading, error } = usePipelineRuns();
  const runs = data || [];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Pipeline Runs</h1>
          <p className="text-muted-foreground">Monitor and analyze all pipeline executions</p>
        </div>
        <div className="flex gap-2">
          <Button className="bg-muted hover:bg-muted/80 text-foreground">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="glass rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-6 text-center text-muted-foreground">Loading pipeline runs...</div>
        ) : error ? (
          <div className="p-6 text-center text-destructive">Error loading pipeline runs</div>
        ) : runs.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground">
            No pipeline runs yet. <Link to="/new-project" className="text-primary hover:underline">Create your first project</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-muted-foreground">Run ID</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-muted-foreground">Requirements</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-muted-foreground">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-muted-foreground">Created At</th>
                </tr>
              </thead>
              <tbody>
                {runs.map((run) => (
                  <tr key={run.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 text-sm font-mono text-primary">
                      <Link to={`/pipeline/${run.id}`} className="hover:underline">
                        {run.id.substring(0, 8)}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      {run.requirements?.substring(0, 50) || 'Untitled'}
                      {run.requirements && run.requirements.length > 50 && '...'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(run.status)}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {formatStatus(run.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {new Date(run.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
