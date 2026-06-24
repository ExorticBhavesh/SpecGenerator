import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Plus, MoreVertical, Trash2, Share2 } from 'lucide-react';
import { usePipelineRuns } from '../hooks/usePipeline';

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
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase().replace('_', ' ');
};

const getProgress = (status: string) => {
  switch (status) {
    case 'COMPLETED':
      return 100;
    case 'RUNNING':
      return 60;
    case 'FAILED':
      return 40;
    case 'PENDING':
      return 20;
    default:
      return 0;
  }
};

export default function ProjectsPage() {
  const { data, isLoading, error } = usePipelineRuns();
  const projects = data || [];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Projects</h1>
          <p className="text-muted-foreground">Manage all your AI configuration projects</p>
        </div>
        <Link to="/new-project">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="text-center text-muted-foreground">Loading projects...</div>
      ) : error ? (
        <div className="text-center text-destructive">Error loading projects</div>
      ) : projects.length === 0 ? (
        <div className="text-center text-muted-foreground">
          No projects yet. <Link to="/new-project" className="text-primary hover:underline">Create your first project</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div key={project.id} className="glass rounded-lg p-6 hover:border-primary/50 transition-colors border border-white/10">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-foreground">
                    {project.requirements?.substring(0, 30) || 'Untitled Project'}
                    {project.requirements && project.requirements.length > 30 && '...'}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {project.requirements?.substring(0, 50) || 'No description'}
                    {project.requirements && project.requirements.length > 50 && '...'}
                  </p>
                </div>
                <button className="p-2 hover:bg-muted rounded-md transition-colors text-muted-foreground">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    {formatStatus(project.status)}
                  </span>
                  <span className="text-xs text-muted-foreground">{getProgress(project.status)}%</span>
                </div>

                <div className="bg-muted rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${getProgress(project.status)}%` }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/10">
                  <div>
                    <p className="text-xs text-muted-foreground">Status</p>
                    <p className="text-sm font-semibold text-foreground">{formatStatus(project.status)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Created</p>
                    <p className="text-sm font-semibold text-foreground">
                      {new Date(project.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Link
                    to={`/pipeline/${project.id}`}
                    className="flex-1 px-3 py-2 rounded-md bg-muted hover:bg-muted/80 text-muted-foreground text-sm font-medium transition-colors flex items-center justify-center gap-1"
                  >
                    <Share2 className="w-3 h-3" />
                    View
                  </Link>
                  <button className="flex-1 px-3 py-2 rounded-md bg-destructive/10 hover:bg-destructive/20 text-destructive text-sm font-medium transition-colors flex items-center justify-center gap-1">
                    <Trash2 className="w-3 h-3" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
