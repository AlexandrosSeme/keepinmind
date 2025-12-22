export interface Member {
  id: number;
  name: string;
  phone: string;
  email?: string;
  status: 'active' | 'expiring_soon' | 'expired';
  expiry: string;
  package: string;
}

export interface UpcomingExpiry {
  id: number;
  name: string;
  phone: string;
  expiry: string;
  days: number;
  package: string;
}

export interface Debt {
  id: number;
  name: string;
  amount: number;
  daysOverdue: number;
  status: 'overdue' | 'warning' | 'critical';
  lastContact?: string;
  phone?: string;
  email?: string;
}

export interface Package {
  id: number;
  name: string;
  category: 'subscription' | 'hourly' | 'kids';
  duration: string;
  price: number;
  active: number;
}

export interface CalendarEvent {
  date: string;
  events: {
    type: 'expiry' | 'debt';
    title: string;
    color: 'red' | 'orange' | 'blue';
  }[];
}

export interface NavigationItem {
  id: string;
  name: string;
  icon: any;
}

export interface Stats {
  totalMembers: number;
  activeSubscriptions: number;
  expiringThisWeek: number;
  overdueDebts: number;
  monthlyRevenue: string;
  pendingPayments: string;
}

export interface Program {
  id: number;
  title: string;
  date: string;
  time: string;
  type: 'group' | 'program' | 'appointment' | 'class';
  instructor?: string;
  maxParticipants?: number;
}

export interface AttendanceRecord {
  id: number;
  programId?: number;
  memberId: number;
  memberName: string;
  status: 'attended' | 'absent' | 'cancelled';
  recordedAt: string;
  notes?: string;
}

export interface EntranceLog {
  id: number;
  memberId: number;
  memberName: string;
  memberPhone: string;
  memberStatus: 'active' | 'expiring_soon' | 'expired';
  validationStatus: 'valid' | 'invalid' | 'expiring_soon';
  validationMessage: string;
  entranceType: 'qr_scan' | 'manual';
  timestamp: string;
  notes?: string;
}
