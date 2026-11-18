import { lazy } from "react";
import { createBrowserRouter, Navigate, type RouteObject } from "react-router-dom";
import { MemberLayout, MemberPortalRoot } from "@/features/member-portal";
import { RequirePermission, RequireStaff, StaffAuthRoot } from "@/features/auth";
import AdminLayout from "@/app/layout/AdminLayout";
import RootLayout from "@/app/layout/RootLayout";
import NotFoundPage from "./NotFoundPage";
import { extraStaffRoutes, staffPages, type StaffPage } from "./staffPages";

const StaffLoginPage = lazy(() => import("@/features/auth/pages/StaffLoginPage"));
const PublicQRPage = lazy(() => import("@/features/qr-codes/pages/PublicQRPage"));
const MemberLoginPage = lazy(() => import("@/features/member-portal/pages/MemberLoginPage"));
const MemberHomePage = lazy(() => import("@/features/member-portal/pages/MemberHomePage"));
const MemberAnnouncementsPage = lazy(
  () => import("@/features/member-portal/pages/MemberAnnouncementsPage"),
);
const MemberSchedulePage = lazy(
  () => import("@/features/member-portal/pages/MemberSchedulePage"),
);
const MemberBookingsPage = lazy(
  () => import("@/features/member-portal/pages/MemberBookingsPage"),
);
const MemberQRPage = lazy(() => import("@/features/member-portal/pages/MemberQRPage"));
const MemberProfilePage = lazy(
  () => import("@/features/member-portal/pages/MemberProfilePage"),
);

function guarded(page: Pick<StaffPage, "element" | "anyOf">) {
  if (!page.anyOf) return page.element;
  return <RequirePermission anyOf={page.anyOf}>{page.element}</RequirePermission>;
}

const staffChildRoutes: RouteObject[] = [
  { index: true, element: <Navigate to="/dashboard" replace /> },
  ...staffPages.flatMap((page) =>
    page.element ? [{ path: page.path, element: guarded(page) }] : [],
  ),
  ...extraStaffRoutes.map((page) => ({ path: page.path, element: guarded(page) })),
  { path: "*", element: <NotFoundPage /> },
];

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
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
        element: <StaffAuthRoot />,
        children: [
          { path: "/login", element: <StaffLoginPage /> },
          {
            path: "/",
            element: (
              <RequireStaff>
                <AdminLayout />
              </RequireStaff>
            ),
            children: staffChildRoutes,
          },
        ],
      },
    ],
  },
]);
