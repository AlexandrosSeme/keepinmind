import { lazy, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Bell,
  Calendar,
  ClipboardCheck,
  CreditCard,
  FileText,
  Megaphone,
  PieChart,
  QrCode,
  Settings,
  Smartphone,
  UserCog,
  Users,
} from "lucide-react";
import type { Permission } from "@/features/auth";

const DashboardPage = lazy(() => import("@/features/dashboard/pages/DashboardPage"));
const FinancePage = lazy(() => import("@/features/dashboard/pages/FinancePage"));
const MembersPage = lazy(() => import("@/features/members/pages/MembersPage"));
const MemberDetailsPage = lazy(() => import("@/features/members/pages/MemberDetailsPage"));
const SubscriptionsPage = lazy(() => import("@/features/subscriptions/pages/SubscriptionsPage"));
const PaymentsPage = lazy(() => import("@/features/payments/pages/PaymentsPage"));
const CalendarPage = lazy(() => import("@/features/bookings/pages/CalendarPage"));
const AttendancePage = lazy(() => import("@/features/attendance/pages/AttendancePage"));
const NotificationsPage = lazy(() => import("@/features/notifications/pages/NotificationsPage"));
const AnnouncementsPage = lazy(() => import("@/features/announcements/pages/AnnouncementsPage"));
const SettingsPage = lazy(() => import("@/features/settings/pages/SettingsPage"));
const QRScannerPage = lazy(() => import("@/features/checkin/pages/QRScannerPage"));
const UserQRCodePage = lazy(() => import("@/features/qr-codes/pages/UserQRCodePage"));
const ViewQRCodePage = lazy(() => import("@/features/qr-codes/pages/ViewQRCodePage"));
const PrintQRCodesPage = lazy(() => import("@/features/qr-codes/pages/PrintQRCodesPage"));
const StaffPage = lazy(() => import("@/features/staff/pages/StaffPage"));

export type StaffNavId =
  | "dashboard"
  | "members"
  | "subscriptions"
  | "calendar"
  | "attendance"
  | "qr-scanner"
  | "view-qr"
  | "print-qr-codes"
  | "notifications"
  | "announcements"
  | "settings"
  | "staff"
  | "member-portal"
  | "finance"
  | "payments";

export interface StaffPage {
  /** Label key: `layout:nav.<id>`. */
  id: StaffNavId;
  /** Route path without the leading slash. */
  path: string;
  icon: LucideIcon;
  element?: ReactNode;
  /** Hidden unless the role has one of these permissions. */
  anyOf?: readonly Permission[];
  /** Drawn in its own block under the main menu. */
  section?: "finance";
  /** Opens in a new tab. No in-app route. */
  external?: boolean;
}

/**
 * One list for the sidebar and the router. To add a page: one row here,
 * plus a `layout:nav.<id>` label. `anyOf` hides it from roles without that
 * permission and guards the route.
 */
export const staffPages: StaffPage[] = [
  { id: "dashboard", path: "dashboard", icon: BarChart3, element: <DashboardPage /> },
  { id: "members", path: "members", icon: Users, element: <MembersPage /> },
  { id: "subscriptions", path: "subscriptions", icon: FileText, element: <SubscriptionsPage /> },
  { id: "calendar", path: "calendar", icon: Calendar, element: <CalendarPage /> },
  { id: "attendance", path: "attendance", icon: ClipboardCheck, element: <AttendancePage /> },
  { id: "qr-scanner", path: "qr-scanner", icon: QrCode, element: <QRScannerPage /> },
  { id: "view-qr", path: "view-qr", icon: Smartphone, element: <ViewQRCodePage /> },
  { id: "print-qr-codes", path: "print-qr-codes", icon: QrCode, element: <PrintQRCodesPage /> },
  { id: "notifications", path: "notifications", icon: Bell, element: <NotificationsPage /> },
  { id: "announcements", path: "announcements", icon: Megaphone, element: <AnnouncementsPage /> },
  {
    id: "settings",
    path: "settings",
    icon: Settings,
    element: <SettingsPage />,
    anyOf: ["settings.business", "settings.dev"],
  },
  {
    id: "staff",
    path: "staff",
    icon: UserCog,
    element: <StaffPage />,
    anyOf: ["staff.manage"],
  },
  { id: "member-portal", path: "member", icon: Smartphone, external: true },
  {
    id: "finance",
    path: "finance",
    icon: PieChart,
    element: <FinancePage />,
    anyOf: ["finance"],
    section: "finance",
  },
  {
    id: "payments",
    path: "payments",
    icon: CreditCard,
    element: <PaymentsPage />,
    anyOf: ["finance"],
    section: "finance",
  },
];

/** Routes that have no menu entry. */
export const extraStaffRoutes: {
  path: string;
  element: ReactNode;
  anyOf?: readonly Permission[];
}[] = [
  { path: "members/:id", element: <MemberDetailsPage /> },
  { path: "user-qr", element: <UserQRCodePage /> },
];
