import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../ui/Sidebar';
import TopBar from '../ui/TopBar';

export default function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="app-layout">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-panel">
        <TopBar onMobileMenu={() => setSidebarOpen(true)} />
        <main className="page-shell">
          <Outlet />
        </main>
      </div>
      <div className={`overlay ${sidebarOpen ? 'overlay-visible' : ''}`} onClick={() => setSidebarOpen(false)} />
    </div>
  );
}
