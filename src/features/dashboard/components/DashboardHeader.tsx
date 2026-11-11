import React, { type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useStaffAuth } from "@/features/auth";
import { longDate } from "../lib/format";

interface DashboardHeaderProps {
  /** Overrides the personal greeting, e.g. on the finance page. */
  title?: string;
  subtitle: string;
  actions?: ReactNode;
}

const greetingKey = (hour: number) =>
  hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening";

/** Personal greeting (or page title) + date, shared by every role dashboard. */
const DashboardHeader: React.FC<DashboardHeaderProps> = ({ title, subtitle, actions }) => {
  const { t } = useTranslation(["dashboard", "auth"]);
  const { profile } = useStaffAuth();
  const now = new Date();
  const firstName = (profile?.fullName || profile?.email || "").split(/[\s@]/)[0];

  return (
    <div className="km-dash-hero">
      <div className="min-w-0">
        <div className="km-dash-hero__meta">
          <span>{longDate(now)}</span>
          {profile && (
            <span className="km-dash-hero__role">{t(`auth:roles.${profile.role}`)}</span>
          )}
        </div>
        <h2 className="km-dash-hero__title">
          {title ?? (
            <>
              {t(`greeting.${greetingKey(now.getHours())}`)}
              {firstName && `, ${firstName}`}
            </>
          )}
        </h2>
        <p className="km-dash-hero__subtitle">{subtitle}</p>
      </div>
      {actions && <div className="km-dash-hero__actions">{actions}</div>}
    </div>
  );
};

export default DashboardHeader;
