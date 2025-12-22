import { useEffect, useState, useCallback } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import UserQRPage from "./components/UserQRPage";
import { createRoutes } from "./config/routes";
import type { Stats, Member, UpcomingExpiry, Debt, Package } from "./types";
import { fetchAppData } from "./services/supabaseData";
import { AppDataProvider, createAppDataContextValue } from "./contexts/AppDataContext";

// Empty initial state - all data comes from Supabase
const emptyStats: Stats = {
  totalMembers: 0,
  activeSubscriptions: 0,
  expiringThisWeek: 0,
  overdueDebts: 0,
  monthlyRevenue: "0",
  pendingPayments: "0",
};

function App() {
  const [stats, setStats] = useState<Stats>(emptyStats);
  const [members, setMembers] = useState<Member[]>([]);
  const [upcomingExpiries, setUpcomingExpiries] = useState<UpcomingExpiry[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    const data = await fetchAppData();
    
    if (data) {
      setStats(data.stats);
      setMembers(data.members);
      setUpcomingExpiries(data.upcomingExpiries);
      setDebts(data.debts);
      setPackages(data.packages);
    } else {
      // If Supabase is not configured, show empty state
      setStats(emptyStats);
      setMembers([]);
      setUpcomingExpiries([]);
      setDebts([]);
      setPackages([]);
    }
    
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const contextValue = createAppDataContextValue(
    stats,
    members,
    upcomingExpiries,
    debts,
    packages,
    loading,
    setStats,
    setMembers,
    setUpcomingExpiries,
    setDebts,
    setPackages,
    setLoading
  );

  const routes = createRoutes({
    stats,
    members,
    upcomingExpiries,
    debts,
    packages,
  });

  return (
    <AppDataProvider value={contextValue}>
      <Routes>
        {/* Standalone User QR Page - No Layout */}
        <Route path="/my-qr" element={<UserQRPage />} />
        
        {/* Admin Routes with MainLayout */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          {routes.map((route) =>
            route.path === "test-routing" ? (
              <Route
                key={route.path}
                path={route.path}
                element={<route.element {...(route.props || {})} />}
              >
                <Route
                  index
                  element={<Navigate to="test-routing-1" replace />}
                />
                {route.children?.map((child) => (
                  <Route
                    key={child.path}
                    path={child.path}
                    element={<child.element />}
                  >
                    {child.subChildren?.map((subChild) => (
                      <Route
                        key={subChild.path}
                        path={subChild.path}
                        element={<subChild.element />}
                      />
                    ))}
                  </Route>
                ))}
              </Route>
            ) : (
              <Route
                key={route.path}
                path={route.path}
                element={<route.element {...(route.props || {})} />}
              />
            )
          )}
        </Route>
      </Routes>
    </AppDataProvider>
  );
}

export default App;
