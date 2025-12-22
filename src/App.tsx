import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import { createRoutes } from "./config/routes";
import type { Stats, Member, UpcomingExpiry, Debt, Package } from "./types";

function App() {
  // Mock Data
  const stats: Stats = {
    totalMembers: 156,
    activeSubscriptions: 142,
    expiringThisWeek: 12,
    overdueDebts: 8,
    monthlyRevenue: "12,450",
    pendingPayments: "2,340",
  };

  const members: Member[] = [
    {
      id: 1,
      name: "Νίκος Παπαδόπουλος",
      phone: "6912345678",
      status: "active",
      expiry: "15/11/2025",
      package: "Μηνιαία Απεριόριστη",
    },
    {
      id: 2,
      name: "Μαρία Γεωργίου",
      phone: "6923456789",
      status: "expiring_soon",
      expiry: "20/10/2025",
      package: "Ετήσια",
    },
    {
      id: 3,
      name: "Γιώργος Κωνσταντίνου",
      phone: "6934567890",
      status: "expired",
      expiry: "05/10/2025",
      package: "Ωριαία (10 ώρες)",
    },
    {
      id: 4,
      name: "Ελένη Δημητρίου",
      phone: "6945678901",
      status: "active",
      expiry: "30/12/2025",
      package: "Μηνιαία Απεριόριστη",
    },
  ];

  const upcomingExpiries: UpcomingExpiry[] = [
    {
      id: 1,
      name: "Μαρία Γεωργίου",
      phone: "6923456789",
      expiry: "20/10/2025",
      days: 7,
      package: "Ετήσια",
    },
    {
      id: 2,
      name: "Κώστας Αθανασίου",
      phone: "6956789012",
      expiry: "22/10/2025",
      days: 9,
      package: "Μηνιαία",
    },
    {
      id: 3,
      name: "Σοφία Νικολάου",
      phone: "6967890123",
      expiry: "25/10/2025",
      days: 12,
      package: "Ωριαία",
    },
  ];

  const debts: Debt[] = [
    {
      id: 1,
      name: "Γιώργος Κωνσταντίνου",
      amount: 50,
      daysOverdue: 8,
      status: "overdue",
    },
    {
      id: 2,
      name: "Αντώνης Μιχαηλίδης",
      amount: 120,
      daysOverdue: 3,
      status: "overdue",
    },
    {
      id: 3,
      name: "Κατερίνα Παυλίδου",
      amount: 45,
      daysOverdue: 15,
      status: "overdue",
    },
  ];

  const packages: Package[] = [
    {
      id: 1,
      name: "Μηνιαία Απεριόριστη",
      category: "subscription",
      duration: "30 ημέρες",
      price: 45,
      active: 78,
    },
    {
      id: 2,
      name: "Ετήσια Απεριόριστη",
      category: "subscription",
      duration: "365 ημέρες",
      price: 450,
      active: 42,
    },
    {
      id: 3,
      name: "Ωριαία 10 Sessions",
      category: "hourly",
      duration: "10 sessions",
      price: 80,
      active: 18,
    },
    {
      id: 4,
      name: "Παιδικό Μηνιαίο",
      category: "kids",
      duration: "30 ημέρες",
      price: 35,
      active: 12,
    },
  ];
  console.info(packages);

  // Create routes from configuration
  const routes = createRoutes({
    stats,
    members,
    upcomingExpiries,
    debts,
    packages,
  });
  console.info(routes);
  return (
    <Routes>
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
  );
}

export default App;
