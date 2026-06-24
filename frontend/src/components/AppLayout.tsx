import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { PageTransition } from './PageTransition';

export function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Sidebar />
      <Header />
      <main className="ml-64 pt-16 p-6">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>
    </div>
  );
}
