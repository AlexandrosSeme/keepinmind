export interface UpcomingExpiry {
  id: number;
  name: string;
  phone: string;
  expiry: string;
  days: number;
  package: string;
}

export interface Stats {
  totalMembers: number;
  activeSubscriptions: number;
  expiringThisWeek: number;
  overdueDebts: number;
  monthlyRevenue: string;
  pendingPayments: string;
}
