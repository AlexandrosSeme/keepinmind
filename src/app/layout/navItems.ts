import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
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

export type NavId =
  | "dashboard"
  | "finance"
  | "members"
  | "subscriptions"
  | "payments"
  | "debts"
  | "calendar"
  | "attendance"
  | "qr-scanner"
  | "view-qr"
  | "print-qr-codes"
  | "notifications"
  | "announcements"
  | "settings"
  | "staff"
  | "member-portal";

/** Labels come from `layout:nav.<id>`. */
export interface NavItem {
  id: NavId;
  icon: LucideIcon;
  path: string;
  /** Opens in a new tab instead of client-side navigation. */
  external?: boolean;
  /** Shown only to roles with at least one of these permissions; omit for all staff. */
  requires?: readonly Permission[];
}

export const navItems: NavItem[] = [
  { id: "dashboard", icon: BarChart3, path: "/dashboard" },
  { id: "finance", icon: PieChart, path: "/finance", requires: ["finance"] },
  { id: "members", icon: Users, path: "/members" },
  { id: "subscriptions", icon: FileText, path: "/subscriptions" },
  {
    id: "payments",
    icon: CreditCard,
    path: "/payments",
    requires: ["finance"],
  },
  { id: "debts", icon: AlertTriangle, path: "/debts", requires: ["finance"] },
  { id: "calendar", icon: Calendar, path: "/calendar" },
  { id: "attendance", icon: ClipboardCheck, path: "/attendance" },
  { id: "qr-scanner", icon: QrCode, path: "/qr-scanner" },
  { id: "view-qr", icon: Smartphone, path: "/view-qr" },
  { id: "print-qr-codes", icon: QrCode, path: "/print-qr-codes" },
  { id: "notifications", icon: Bell, path: "/notifications" },
  { id: "announcements", icon: Megaphone, path: "/announcements" },
  {
    id: "settings",
    icon: Settings,
    path: "/settings",
    requires: ["settings.business", "settings.dev"],
  },
  { id: "staff", icon: UserCog, path: "/staff", requires: ["staff.manage"] },
  { id: "member-portal", icon: Smartphone, path: "/member", external: true },
];
