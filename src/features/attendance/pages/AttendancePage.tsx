import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";
import { PageHeader } from "@/shared/ui";
import type { EntranceLog } from "../types";
import { getEntranceLogs } from "../api";
import EntranceLogsTable from "../components/EntranceLogsTable";

type ValidationFilter = "all" | EntranceLog["validationStatus"];
type MethodFilter = "all" | EntranceLog["entranceType"];

const AttendancePage: React.FC = () => {
  const { t } = useTranslation(["attendance", "common"]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ValidationFilter>("all");
  const [methodFilter, setMethodFilter] = useState<MethodFilter>("all");
  const [entranceLogs, setEntranceLogs] = useState<EntranceLog[]>([]);

  const loadLogs = useCallback(async () => {
    try {
      setEntranceLogs(await getEntranceLogs());
    } catch (error) {
      console.error("[Attendance] Error loading entrance logs:", error);
    }
  }, []);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  return (
    <div>
      <PageHeader title={t("page.title")} subtitle={t("page.subtitle")} />

      <div className="card border-0 shadow-sm mb-4 km-toolbar-card">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-12 col-lg-6">
              <div className="position-relative">
                <Search
                  size={16}
                  className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"
                />
                <input
                  type="search"
                  className="form-control ps-5"
                  placeholder={t("page.searchPlaceholder")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  aria-label={t("common:actions.search")}
                />
              </div>
            </div>
            <div className="col-sm-6 col-lg-3">
              <select
                className="form-select"
                value={statusFilter}
                aria-label={t("fields.validation")}
                onChange={(e) => setStatusFilter(e.target.value as ValidationFilter)}
              >
                <option value="all">{t("filters.allStatuses")}</option>
                <option value="valid">{t("common:status.valid")}</option>
                <option value="invalid">{t("common:status.invalid")}</option>
                <option value="expiring_soon">{t("common:status.expiring_soon")}</option>
              </select>
            </div>
            <div className="col-sm-6 col-lg-3">
              <select
                className="form-select"
                value={methodFilter}
                aria-label={t("fields.type")}
                onChange={(e) => setMethodFilter(e.target.value as MethodFilter)}
              >
                <option value="all">{t("filters.allMethods")}</option>
                <option value="qr_scan">{t("filters.qr")}</option>
                <option value="manual">{t("filters.manual")}</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <EntranceLogsTable
        logs={entranceLogs}
        searchTerm={searchTerm}
        statusFilter={statusFilter}
        methodFilter={methodFilter}
        onRefresh={loadLogs}
      />
    </div>
  );
};

export default AttendancePage;
