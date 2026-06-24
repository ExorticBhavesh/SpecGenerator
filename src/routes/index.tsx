import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout';
import Dashboard from '../pages/Dashboard';
import Projects from '../pages/Projects';
import NewProject from '../pages/NewProject';
import PipelineRuns from '../pages/PipelineRuns';
import EvaluationPage from '../pages/EvaluationPage';
import PipelineInspectorPage from '../pages/PipelineInspectorPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'projects', element: <Projects /> },
      { path: 'new-project', element: <NewProject /> },
      { path: 'pipeline-runs', element: <PipelineRuns /> },
      { path: 'evaluation', element: <EvaluationPage /> },
      { path: 'pipeline/:id', element: <PipelineInspectorPage /> },
    ],
  },
]);
