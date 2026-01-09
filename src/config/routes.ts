import Dashboard from "../components/Dashboard";
import Members from "../components/Members";
import SingleMember from "../components/SingleMember";
import Subscriptions from "../components/Subscriptions";
import Payments from "../components/Payments";
import Debts from "../components/Debts";
import Calendar from "../components/Calendar";
import Notifications from "../components/Notifications";
import Announcements from "../components/Announcements";
import Settings from "../components/Settings";
import Attendance from "../components/Attendance";
import QRScanner from "../components/QRScanner";
import UserQRCode from "../components/UserQRCode";
import ViewQRCode from "../components/ViewQRCode";
import HomeAssistant from "../components/HomeAssistant";

import type { ComponentType } from "react";
import type { Stats, Member, UpcomingExpiry, Debt, Package } from "../types";

export interface ChildRouteConfig {
  path: string;
  element: ComponentType<any>;
  subChildren?: ChildRouteConfig[];
}

export interface RouteConfig {
  path: string;
  element: ComponentType<any>;
  props?: Record<string, any>;
  children?: ChildRouteConfig[];
}

export interface AppData {
  stats: Stats;
  members: Member[];
  upcomingExpiries: UpcomingExpiry[];
  debts: Debt[];
  packages: Package[];
}

export const createRoutes = (data: AppData): RouteConfig[] => [
  {
    path: "dashboard",
    element: Dashboard,
    props: {
      stats: data.stats,
      upcomingExpiries: data.upcomingExpiries,
      debts: data.debts,
    },
  },
  {
    path: "members",
    element: Members,
    props: {
      members: data.members,
    },
  },
  {
    path: "members/:id",
    element: SingleMember,
  },
  {
    path: "subscriptions",
    element: Subscriptions,
    props: {
      packages: data.packages,
    },
  },
  {
    path: "payments",
    element: Payments,
  },
  {
    path: "debts",
    element: Debts,
  },
  {
    path: "calendar",
    element: Calendar,
  },
  {
    path: "attendance",
    element: Attendance,
  },
  {
    path: "notifications",
    element: Notifications,
  },
  {
    path: "announcements",
    element: Announcements,
  },
  {
    path: "settings",
    element: Settings,
  },
  {
    path: "qr-scanner",
    element: QRScanner,
  },
  {
    path: "user-qr",
    element: UserQRCode,
  },
  {
    path: "view-qr",
    element: ViewQRCode,
  },
  {
    path: "home-assistant",
    element: HomeAssistant,
  },
];
