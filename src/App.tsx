import { useEffect, useState, useCallback } from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import MemberLayout from "./layouts/MemberLayout";
import UserQRPage from "./components/UserQRPage";
import MemberLogin from "./components/member/MemberLogin";
import MemberHome from "./components/member/MemberHome";
import MemberAnnouncements from "./components/member/MemberAnnouncements";
import MemberSchedule from "./components/member/MemberSchedule";
import MemberBookings from "./components/member/MemberBookings";
import MemberQR from "./components/member/MemberQR";
import MemberProfile from "./components/member/MemberProfile";
import { createRoutes } from "./config/routes";
import type {
  Stats,
  Member,
  UpcomingExpiry,
  Debt,
  Package,
  Payment,
} from "./types";
import { fetchAppData } from "./services/supabaseData";
import {
  AppDataProvider,
  createAppDataContextValue,
} from "./contexts/AppDataContext";
import { MemberSessionProvider } from "./contexts/MemberSessionContext";

// Empty initial state - all data comes from Supabase
const emptyStats: Stats = {
  totalMembers: 0,
  activeSubscriptions: 0,
  expiringThisWeek: 0,
  overdueDebts: 0,
  monthlyRevenue: "0",
  pendingPayments: "0",
};

function MemberPortalRoot() {
  return (
    <MemberSessionProvider>
      <Outlet />
    </MemberSessionProvider>
  );
}

function App() {
  const [stats, setStats] = useState<Stats>(emptyStats);
  const [members, setMembers] = useState<Member[]>([]);
  const [upcomingExpiries, setUpcomingExpiries] = useState<UpcomingExpiry[]>(
    []
  );
  const [debts, setDebts] = useState<Debt[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
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
      setPayments(data.payments);
    } else {
      setStats(emptyStats);
      setMembers([]);
      setUpcomingExpiries([]);
      setDebts([]);
      setPackages([]);
      setPayments([]);
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
    payments,
    loading,
    setStats,
    setMembers,
    setUpcomingExpiries,
    setDebts,
    setPackages,
    setPayments,
    setLoading
  );

  const routes = createRoutes({
    stats,
    members,
    upcomingExpiries,
    debts,
    packages,
    payments,
  });

  return (
    <AppDataProvider value={contextValue}>
      <Routes>
        {/* Public / legacy QR link */}
        <Route path="/my-qr" element={<UserQRPage />} />

        {/* Member portal */}
        <Route path="/member" element={<MemberPortalRoot />}>
          <Route index element={<MemberLogin />} />
          <Route path="app" element={<MemberLayout />}>
            <Route index element={<MemberHome />} />
            <Route path="announcements" element={<MemberAnnouncements />} />
            <Route path="schedule" element={<MemberSchedule />} />
            <Route path="bookings" element={<MemberBookings />} />
            <Route path="qr" element={<MemberQR />} />
            <Route path="profile" element={<MemberProfile />} />
          </Route>
        </Route>

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
