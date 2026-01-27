import { Sidebar } from '../common/Sidebar.jsx';
import { Topbar } from '../common/Topbar.jsx';

const DashboardLayout = ({ title, subtitle, children }) => {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex">
        <Sidebar />
        <div className="flex min-h-screen flex-1 flex-col">
          <Topbar title={title} subtitle={subtitle} />
          <main className="flex-1 px-6 py-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
