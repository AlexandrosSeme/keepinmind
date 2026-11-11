import React from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Dumbbell, Server } from "lucide-react";
import { useStaffAuth } from "@/features/auth";
import DashboardHeader from "../components/DashboardHeader";
import AdminSystemDashboard from "../views/AdminSystemDashboard";
import { ManagerGymDashboard, TrainerGymDashboard } from "../views/GymDashboard";
import "./DashboardPage.scss";

type AdminTab = "system" | "gym";

/** Admins (devs) switch between the system view and the gym monitoring view. */
const AdminDashboard: React.FC = () => {
  const { t } = useTranslation("dashboard");
  const [params, setParams] = useSearchParams();
  const tab: AdminTab = params.get("view") === "gym" ? "gym" : "system";

  const tabs: { key: AdminTab; icon: React.ReactNode }[] = [
    { key: "system", icon: <Server size={14} /> },
    { key: "gym", icon: <Dumbbell size={14} /> },
  ];

  return (
    <div className="km-dash">
      <DashboardHeader
        subtitle={t(tab === "system" ? "subtitle.admin" : "subtitle.gym")}
        actions={
          <div className="km-tabs" role="tablist">
            {tabs.map(({ key, icon }) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={tab === key}
                className={`km-tabs__tab${tab === key ? " is-active" : ""}`}
                onClick={() => setParams(key === "system" ? {} : { view: key }, { replace: true })}
              >
                {icon}
                {t(`tabs.${key}`)}
              </button>
            ))}
          </div>
        }
      />
      {tab === "system" ? <AdminSystemDashboard /> : <ManagerGymDashboard embedded />}
    </div>
  );
};

/** Each staff role gets the dashboard that matches its daily work. */
const DashboardPage: React.FC = () => {
  const { role } = useStaffAuth();
  if (role === "admin") return <AdminDashboard />;
  if (role === "owner") return <ManagerGymDashboard />;
  return <TrainerGymDashboard />;
};

export default DashboardPage;
