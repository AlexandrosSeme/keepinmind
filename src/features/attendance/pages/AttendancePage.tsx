import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";
import { PageHeader, Select } from "@/shared/ui";
import type { EntranceLog } from "../types";
import { getEntranceLogs } from "../api";
import { subscribeEntrances } from "../entranceBus";
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

  useEffect(() => {
    return subscribeEntrances((log) => {
      setEntranceLogs((current) =>
        current.some((item) => item.id === log.id) ? current : [log, ...current],
      );
    });
  }, []);

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
              <Select
                ariaLabel={t("fields.validation")}
                value={statusFilter}
                onChange={(value) => setStatusFilter(value as ValidationFilter)}
                options={[
                  { value: "all", label: t("filters.allStatuses") },
                  { value: "valid", label: t("common:status.valid") },
                  { value: "invalid", label: t("common:status.invalid") },
                  { value: "expiring_soon", label: t("common:status.expiring_soon") },
                ]}
              />
            </div>
            <div className="col-sm-6 col-lg-3">
              <Select
                ariaLabel={t("fields.type")}
                value={methodFilter}
                onChange={(value) => setMethodFilter(value as MethodFilter)}
                options={[
                  { value: "all", label: t("filters.allMethods") },
                  { value: "qr_scan", label: t("filters.qr") },
                  { value: "manual", label: t("filters.manual") },
                ]}
              />
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
