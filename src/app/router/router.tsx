import { lazy } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { MemberLayout, MemberPortalRoot } from "@/features/member-portal";
import AdminLayout from "@/app/layout/AdminLayout";
import RootLayout from "@/app/layout/RootLayout";
import NotFoundPage from "./NotFoundPage";

const DashboardPage = lazy(
  () => import("@/features/dashboard/pages/DashboardPage"),
);
const MembersPage = lazy(() => import("@/features/members/pages/MembersPage"));
const MemberDetailsPage = lazy(
  () => import("@/features/members/pages/MemberDetailsPage"),
);
const SubscriptionsPage = lazy(
  () => import("@/features/subscriptions/pages/SubscriptionsPage"),
);
const PaymentsPage = lazy(
  () => import("@/features/payments/pages/PaymentsPage"),
);
const DebtsPage = lazy(() => import("@/features/debts/pages/DebtsPage"));
const CalendarPage = lazy(
  () => import("@/features/bookings/pages/CalendarPage"),
);
const AttendancePage = lazy(
  () => import("@/features/attendance/pages/AttendancePage"),
);
const NotificationsPage = lazy(
  () => import("@/features/notifications/pages/NotificationsPage"),
);
const AnnouncementsPage = lazy(
  () => import("@/features/announcements/pages/AnnouncementsPage"),
);
const SettingsPage = lazy(
  () => import("@/features/settings/pages/SettingsPage"),
);
const QRScannerPage = lazy(
  () => import("@/features/checkin/pages/QRScannerPage"),
);
const UserQRCodePage = lazy(
  () => import("@/features/qr-codes/pages/UserQRCodePage"),
);
const ViewQRCodePage = lazy(
  () => import("@/features/qr-codes/pages/ViewQRCodePage"),
);
const PrintQRCodesPage = lazy(
  () => import("@/features/qr-codes/pages/PrintQRCodesPage"),
);
const PublicQRPage = lazy(
  () => import("@/features/qr-codes/pages/PublicQRPage"),
);

const MemberLoginPage = lazy(
  () => import("@/features/member-portal/pages/MemberLoginPage"),
);
const MemberHomePage = lazy(
  () => import("@/features/member-portal/pages/MemberHomePage"),
);
const MemberAnnouncementsPage = lazy(
  () => import("@/features/member-portal/pages/MemberAnnouncementsPage"),
);
const MemberSchedulePage = lazy(
  () => import("@/features/member-portal/pages/MemberSchedulePage"),
);
const MemberBookingsPage = lazy(
  () => import("@/features/member-portal/pages/MemberBookingsPage"),
);
const MemberQRPage = lazy(
  () => import("@/features/member-portal/pages/MemberQRPage"),
);
const MemberProfilePage = lazy(
  () => import("@/features/member-portal/pages/MemberProfilePage"),
);

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      // Public / legacy QR link
      { path: "/my-qr", element: <PublicQRPage /> },

      {
        path: "/member",
        element: <MemberPortalRoot />,
        children: [
          { index: true, element: <MemberLoginPage /> },
          {
            path: "app",
            element: <MemberLayout />,
            children: [
              { index: true, element: <MemberHomePage /> },
              { path: "announcements", element: <MemberAnnouncementsPage /> },
              { path: "schedule", element: <MemberSchedulePage /> },
              { path: "bookings", element: <MemberBookingsPage /> },
              { path: "qr", element: <MemberQRPage /> },
              { path: "profile", element: <MemberProfilePage /> },
            ],
          },
        ],
      },

      {
        path: "/",
        element: <AdminLayout />,
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> },
          { path: "dashboard", element: <DashboardPage /> },
          { path: "members", element: <MembersPage /> },
          { path: "members/:id", element: <MemberDetailsPage /> },
          { path: "subscriptions", element: <SubscriptionsPage /> },
          { path: "payments", element: <PaymentsPage /> },
          { path: "debts", element: <DebtsPage /> },
          { path: "calendar", element: <CalendarPage /> },
          { path: "attendance", element: <AttendancePage /> },
          { path: "notifications", element: <NotificationsPage /> },
          { path: "announcements", element: <AnnouncementsPage /> },
          { path: "settings", element: <SettingsPage /> },
          { path: "qr-scanner", element: <QRScannerPage /> },
          { path: "user-qr", element: <UserQRCodePage /> },
          { path: "view-qr", element: <ViewQRCodePage /> },
          { path: "print-qr-codes", element: <PrintQRCodesPage /> },
          { path: "*", element: <NotFoundPage /> },
        ],
      },
    ],
  },
]);
