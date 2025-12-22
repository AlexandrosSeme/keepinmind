import { createContext, useContext, type ReactNode } from "react";
import type { Stats, Member, UpcomingExpiry, Debt, Package } from "../types";
import {
  fetchAppData,
  createMember,
  updateMember,
  deleteMember,
  createDebt,
  updateDebt,
  deleteDebt,
  createPackage,
  updatePackage,
  deletePackage,
  createUpcomingExpiry,
  updateUpcomingExpiry,
  deleteUpcomingExpiry,
} from "../services/supabaseData";

interface AppDataContextType {
  // Data
  stats: Stats;
  members: Member[];
  upcomingExpiries: UpcomingExpiry[];
  debts: Debt[];
  packages: Package[];
  loading: boolean;

  // Refresh function
  refreshData: () => Promise<void>;

  // CRUD Operations
  // Members
  addMember: (member: Omit<Member, "id">) => Promise<Member | null>;
  editMember: (id: number, updates: Partial<Omit<Member, "id">>) => Promise<Member | null>;
  removeMember: (id: number) => Promise<boolean>;

  // Debts
  addDebt: (debt: Omit<Debt, "id">) => Promise<Debt | null>;
  editDebt: (id: number, updates: Partial<Omit<Debt, "id">>) => Promise<Debt | null>;
  removeDebt: (id: number) => Promise<boolean>;

  // Packages
  addPackage: (pkg: Omit<Package, "id">) => Promise<Package | null>;
  editPackage: (id: number, updates: Partial<Omit<Package, "id">>) => Promise<Package | null>;
  removePackage: (id: number) => Promise<boolean>;

  // Upcoming Expiries
  addUpcomingExpiry: (expiry: Omit<UpcomingExpiry, "id">) => Promise<UpcomingExpiry | null>;
  editUpcomingExpiry: (id: number, updates: Partial<Omit<UpcomingExpiry, "id">>) => Promise<UpcomingExpiry | null>;
  removeUpcomingExpiry: (id: number) => Promise<boolean>;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export function useAppData() {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error("useAppData must be used within AppDataProvider");
  }
  return context;
}

interface AppDataProviderProps {
  children: ReactNode;
  value: AppDataContextType;
}

export function AppDataProvider({ children, value }: AppDataProviderProps) {
  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

// Helper function to create context value
export function createAppDataContextValue(
  stats: Stats,
  members: Member[],
  upcomingExpiries: UpcomingExpiry[],
  debts: Debt[],
  packages: Package[],
  loading: boolean,
  setStats: (stats: Stats) => void,
  setMembers: (members: Member[]) => void,
  setUpcomingExpiries: (expiries: UpcomingExpiry[]) => void,
  setDebts: (debts: Debt[]) => void,
  setPackages: (packages: Package[]) => void,
  setLoading: (loading: boolean) => void
): AppDataContextType {
  const refreshData = async () => {
    setLoading(true);
    const data = await fetchAppData();
    if (data) {
      setStats(data.stats);
      setMembers(data.members);
      setUpcomingExpiries(data.upcomingExpiries);
      setDebts(data.debts);
      setPackages(data.packages);
    }
    setLoading(false);
  };

  return {
    stats,
    members,
    upcomingExpiries,
    debts,
    packages,
    loading,
    refreshData,

    // Members CRUD
    addMember: async (member) => {
      const newMember = await createMember(member);
      if (newMember) {
        await refreshData();
      }
      return newMember;
    },
    editMember: async (id, updates) => {
      const updated = await updateMember(id, updates);
      if (updated) {
        await refreshData();
      }
      return updated;
    },
    removeMember: async (id) => {
      const success = await deleteMember(id);
      if (success) {
        await refreshData();
      }
      return success;
    },

    // Debts CRUD
    addDebt: async (debt) => {
      const newDebt = await createDebt(debt);
      if (newDebt) {
        await refreshData();
      }
      return newDebt;
    },
    editDebt: async (id, updates) => {
      const updated = await updateDebt(id, updates);
      if (updated) {
        await refreshData();
      }
      return updated;
    },
    removeDebt: async (id) => {
      const success = await deleteDebt(id);
      if (success) {
        await refreshData();
      }
      return success;
    },

    // Packages CRUD
    addPackage: async (pkg) => {
      const newPackage = await createPackage(pkg);
      if (newPackage) {
        await refreshData();
      }
      return newPackage;
    },
    editPackage: async (id, updates) => {
      const updated = await updatePackage(id, updates);
      if (updated) {
        await refreshData();
      }
      return updated;
    },
    removePackage: async (id) => {
      const success = await deletePackage(id);
      if (success) {
        await refreshData();
      }
      return success;
    },

    // Upcoming Expiries CRUD
    addUpcomingExpiry: async (expiry) => {
      const newExpiry = await createUpcomingExpiry(expiry);
      if (newExpiry) {
        await refreshData();
      }
      return newExpiry;
    },
    editUpcomingExpiry: async (id, updates) => {
      const updated = await updateUpcomingExpiry(id, updates);
      if (updated) {
        await refreshData();
      }
      return updated;
    },
    removeUpcomingExpiry: async (id) => {
      const success = await deleteUpcomingExpiry(id);
      if (success) {
        await refreshData();
      }
      return success;
    },
  };
}

