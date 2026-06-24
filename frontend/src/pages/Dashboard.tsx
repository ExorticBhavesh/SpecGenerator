import { motion } from 'framer-motion';
import { StatCard } from '../components/StatCard';
import { Activity, Zap, CheckCircle, Clock } from 'lucide-react';
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
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase().replace('_', ' ');
};

export default function Dashboard() {
  const { data, isLoading, error } = usePipelineRuns();
  const runs = data || [];

  const totalProjects = runs.length;
  const completedRuns = runs.filter((r) => r.status === 'COMPLETED').length;
  const successRate = totalProjects > 0 ? Math.round((completedRuns / totalProjects) * 100) : 0;

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here&apos;s your AI configuration activity.</p>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        <StatCard
          title="Total Projects"
          value={totalProjects}
          subtitle="All pipeline runs"
          icon={<Activity className="w-5 h-5" />}
        />
        <StatCard
          title="Pipeline Runs"
          value={totalProjects}
          subtitle="Total executions"
          icon={<Zap className="w-5 h-5" />}
        />
        <StatCard
          title="Successful Configs"
          value={completedRuns}
          subtitle={`${successRate}% success rate`}
          icon={<CheckCircle className="w-5 h-5" />}
        />
        <StatCard
          title="Avg. Processing Time"
          value="2.3s"
          subtitle="Estimated average"
          icon={<Clock className="w-5 h-5" />}
        />
      </motion.div>

      <motion.div
        className="glass rounded-xl overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <div className="border-b border-white/10 p-6">
          <h2 className="text-xl font-bold text-foreground">Recent Projects</h2>
        </div>
        {isLoading ? (
          <div className="p-6 text-center text-muted-foreground">Loading...</div>
        ) : error ? (
          <div className="p-6 text-center text-destructive">Error loading projects</div>
        ) : runs.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground">
            No projects yet. <Link to="/new-project" className="text-primary hover:underline">Create your first project</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-muted-foreground">Project Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-muted-foreground">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-muted-foreground">Date</th>
                </tr>
              </thead>
              <tbody>
                {runs.slice(0, 5).map((run, idx) => (
                  <motion.tr
                    key={run.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 + idx * 0.05 }}
                    whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                    className="border-b border-white/10 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4 text-sm text-foreground font-medium">
                      <Link to={`/pipeline/${run.id}`} className="hover:text-primary transition-colors">
                        {run.requirements?.substring(0, 50) || 'Untitled Project'}
                        {run.requirements && run.requirements.length > 50 && '...'}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <motion.span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(run.status)}`}
                        whileHover={{ scale: 1.05 }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {formatStatus(run.status)}
                      </motion.span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {new Date(run.createdAt).toLocaleDateString()}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}
