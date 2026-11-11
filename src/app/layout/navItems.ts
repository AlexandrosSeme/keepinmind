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
  QrCode,
  Settings,
  Smartphone,
  Users,
} from "lucide-react";

export type NavId =
  | "dashboard"
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
  | "member-portal";

/** Labels come from `layout:nav.<id>`. */
export interface NavItem {
  id: NavId;
  icon: LucideIcon;
  path: string;
  /** Opens in a new tab instead of client-side navigation. */
  external?: boolean;
}

export const navItems: NavItem[] = [
  { id: "dashboard", icon: BarChart3, path: "/dashboard" },
  { id: "members", icon: Users, path: "/members" },
  { id: "subscriptions", icon: FileText, path: "/subscriptions" },
  { id: "payments", icon: CreditCard, path: "/payments" },
  { id: "debts", icon: AlertTriangle, path: "/debts" },
  { id: "calendar", icon: Calendar, path: "/calendar" },
  { id: "attendance", icon: ClipboardCheck, path: "/attendance" },
  { id: "qr-scanner", icon: QrCode, path: "/qr-scanner" },
  { id: "view-qr", icon: Smartphone, path: "/view-qr" },
  { id: "print-qr-codes", icon: QrCode, path: "/print-qr-codes" },
  { id: "notifications", icon: Bell, path: "/notifications" },
  { id: "announcements", icon: Megaphone, path: "/announcements" },
  { id: "settings", icon: Settings, path: "/settings" },
  { id: "member-portal", icon: Smartphone, path: "/member", external: true },
];
