import React, { Suspense, useState } from "react";
import { Outlet } from "react-router-dom";
import { PageLoader } from "@/shared/ui";
import { GlobalQRScanner } from "@/features/checkin";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import "./AdminLayout.scss";

const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="km-shell">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="km-main">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />

        <main className="km-main__content p-3 p-lg-4">
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </main>
      </div>

      <GlobalQRScanner />
    </div>
  );
};

export default AdminLayout;
