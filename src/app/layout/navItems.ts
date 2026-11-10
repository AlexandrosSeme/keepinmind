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

export interface NavItem {
  id: string;
  name: string;
  icon: LucideIcon;
  path: string;
  /** Opens in a new tab instead of client-side navigation. */
  external?: boolean;
}

export const navItems: NavItem[] = [
  { id: "dashboard", name: "Dashboard", icon: BarChart3, path: "/dashboard" },
  { id: "members", name: "Μελη", icon: Users, path: "/members" },
  {
    id: "subscriptions",
    name: "Συνδρομες",
    icon: FileText,
    path: "/subscriptions",
  },
  { id: "payments", name: "Πληρωμες", icon: CreditCard, path: "/payments" },
  { id: "debts", name: "Οφειλες", icon: AlertTriangle, path: "/debts" },
  { id: "calendar", name: "Ημερολογιο", icon: Calendar, path: "/calendar" },
  {
    id: "attendance",
    name: "Προσελευση",
    icon: ClipboardCheck,
    path: "/attendance",
  },
  {
    id: "qr-scanner",
    name: "Σαρωση QR Code",
    icon: QrCode,
    path: "/qr-scanner",
  },
  {
    id: "view-qr",
    name: "Προβολη QR Code",
    icon: Smartphone,
    path: "/view-qr",
  },
  {
    id: "print-qr-codes",
    name: "Καρτες",
    icon: QrCode,
    path: "/print-qr-codes",
  },
  {
    id: "notifications",
    name: "Ειδοποιησεις",
    icon: Bell,
    path: "/notifications",
  },
  {
    id: "announcements",
    name: "Ανακοινωσεις",
    icon: Megaphone,
    path: "/announcements",
  },
  { id: "settings", name: "Ρυθμισεις", icon: Settings, path: "/settings" },
  {
    id: "member-portal",
    name: "Πυλη μελους",
    icon: Smartphone,
    path: "/member",
    external: true,
  },
];
