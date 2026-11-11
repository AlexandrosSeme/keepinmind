import React from "react";
import { useTranslation } from "react-i18next";
import { PanelCard } from "@/shared/ui";
import { useStaffAuth } from "@/features/auth";
import i18n from "@/shared/i18n";
import { API_BASE_URL } from "@/shared/api/httpClient";

/** Runtime facts that help when debugging a local setup. */
const EnvironmentPanel: React.FC<{ latency: number | null }> = ({ latency }) => {
  const { t } = useTranslation("dashboard");
  const { profile } = useStaffAuth();
  const rows = [
    [t("admin.env.mode"), import.meta.env.MODE],
    [t("admin.env.api"), `${API_BASE_URL} → :3001${latency !== null ? ` · ${latency} ms` : ""}`],
    [t("admin.env.dataSource"), t("admin.env.dataSourceValue")],
    [t("admin.env.language"), i18n.language],
    [t("admin.env.session"), profile?.email ?? "—"],
  ];

  return (
    <PanelCard title={t("admin.env.title")} className="km-dash-panel">
      <dl className="km-env">
        {rows.map(([label, value]) => (
          <div key={label} className="km-env__row">
            <dt>{label}</dt>
            <dd>
              <code>{value}</code>
            </dd>
          </div>
        ))}
      </dl>
    </PanelCard>
  );
};

export default EnvironmentPanel;
