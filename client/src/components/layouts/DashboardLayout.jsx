import { Sidebar } from '../common/Sidebar.jsx';
import { Topbar } from '../common/Topbar.jsx';

import { useState } from 'react';

const DashboardLayout = ({ title, subtitle, action, children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex">
        {/* Mobile Sidebar Backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-20 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="flex min-h-screen flex-1 flex-col transition-all duration-300 lg:ml-60">
          <Topbar
            title={title}
            subtitle={subtitle}
            action={action}
            onMenuClick={() => setSidebarOpen(true)}
          />
          <main className="flex-1 px-4 py-6 md:px-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
