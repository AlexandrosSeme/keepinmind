import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Calendar, Filter, LogIn, Search } from "lucide-react";
import { PageHeader, StatusBadge } from "@/shared/ui";
import { useMembers } from "@/features/members";
import type { AttendanceRecord, EntranceLog, Program } from "../types";
import { getEntranceLogs } from "../api";
import { DEMO_PROGRAMS, DEMO_RECORDS } from "../demoData";
import ProgramsTable from "../components/ProgramsTable";
import AttendanceRecordsTable from "../components/AttendanceRecordsTable";
import EntranceLogsTable from "../components/EntranceLogsTable";
import RecordAttendanceModal from "../components/RecordAttendanceModal";

type Tab = "programs" | "entrance";
type StatusFilter = "all" | AttendanceRecord["status"];
type CategoryFilter = "all" | Program["type"];

const AttendancePage: React.FC = () => {
  const { t } = useTranslation(["attendance", "common"]);
  const { members } = useMembers();
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<StatusFilter>("all");
  const [filterCategory, setFilterCategory] = useState<CategoryFilter>("all");
  const [activeTab, setActiveTab] = useState<Tab>("programs");
  const [entranceLogs, setEntranceLogs] = useState<EntranceLog[]>([]);
  const [programs] = useState<Program[]>(DEMO_PROGRAMS);
  const [attendanceRecords, setAttendanceRecords] =
    useState<AttendanceRecord[]>(DEMO_RECORDS);

  const loadLogs = useCallback(async () => {
    try {
      setEntranceLogs(await getEntranceLogs());
    } catch (error) {
      console.error("[Attendance] Error loading entrance logs:", error);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "entrance") loadLogs();
  }, [activeTab, loadLogs]);

  const handleRecordAttendance = (
    memberId: number,
    status: AttendanceRecord["status"],
  ) => {
    if (!selectedProgram) return;

    const memberName =
      members.find((m) => m.id === memberId)?.name ?? "Unknown";
    const existing = attendanceRecords.find(
      (r) => r.programId === selectedProgram.id && r.memberId === memberId,
    );

    if (existing) {
      setAttendanceRecords((prev) =>
        prev.map((r) =>
          r.id === existing.id
            ? { ...r, status, notes: "", recordedAt: new Date().toISOString() }
            : r,
        ),
      );
    } else {
      setAttendanceRecords((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          programId: selectedProgram.id,
          memberId,
          memberName,
          status,
          recordedAt: new Date().toISOString(),
          notes: "",
        },
      ]);
    }
  };

  const term = searchTerm.toLowerCase();
  const filteredPrograms = programs.filter(
    (p) =>
      (p.title.toLowerCase().includes(term) ||
        p.instructor?.toLowerCase().includes(term)) &&
      (filterCategory === "all" || p.type === filterCategory),
  );
  const filteredRecords = attendanceRecords.filter(
    (r) =>
      r.memberName.toLowerCase().includes(term) &&
      (filterStatus === "all" || r.status === filterStatus),
  );
  const filteredEntranceLogs = entranceLogs.filter(
    (log) =>
      log.memberName.toLowerCase().includes(term) ||
      log.memberPhone.includes(searchTerm),
  );

  return (
    <div>
      <PageHeader title={t("page.title")} subtitle={t("page.subtitle")} />

      <ul className="nav nav-tabs mb-4" role="tablist">
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${activeTab === "programs" ? "active" : ""}`}
            onClick={() => setActiveTab("programs")}
          >
            <Calendar className="me-2" size={18} />
            {t("tabs.programs")}
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${activeTab === "entrance" ? "active" : ""}`}
            onClick={() => setActiveTab("entrance")}
          >
            <LogIn className="me-2" size={18} />
            {t("tabs.entranceLogs")}
            {entranceLogs.length > 0 && (
              <StatusBadge
                tone="brand"
                label={entranceLogs.length}
                className="ms-2"
                showDot={false}
              />
            )}
          </button>
        </li>
      </ul>

      <div className="card border-0 shadow-sm mb-4 km-toolbar-card">
        <div className="card-body">
          <div className="row g-3">
            <div className={activeTab === "programs" ? "col-md-6" : "col-12"}>
              <div className="position-relative">
                <Search
                  size={16}
                  className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"
                />
                <input
                  type="text"
                  className="form-control ps-5"
                  placeholder={t("page.searchPlaceholder")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            {activeTab === "programs" && (
              <>
                <div className="col-md-3">
                  <div className="input-group">
                    <span className="input-group-text">
                      <Filter size={18} />
                    </span>
                    <select
                      className="form-select"
                      value={filterCategory}
                      onChange={(e) =>
                        setFilterCategory(e.target.value as CategoryFilter)
                      }
                    >
                      <option value="all">{t("filters.allCategories")}</option>
                      <option value="group">{t("filters.group")}</option>
                      <option value="program">{t("filters.program")}</option>
                      <option value="appointment">
                        {t("filters.appointment")}
                      </option>
                      <option value="class">{t("filters.class")}</option>
                    </select>
                  </div>
                </div>
                <div className="col-md-3">
                  <select
                    className="form-select"
                    value={filterStatus}
                    onChange={(e) =>
                      setFilterStatus(e.target.value as StatusFilter)
                    }
                  >
                    <option value="all">{t("filters.allStatuses")}</option>
                    <option value="attended">
                      {t("common:status.attended")}
                    </option>
                    <option value="absent">{t("common:status.absent")}</option>
                    <option value="cancelled">
                      {t("common:status.cancelled")}
                    </option>
                  </select>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {activeTab === "programs" && (
        <>
          <div className="mb-4">
            <ProgramsTable
              programs={filteredPrograms}
              records={attendanceRecords}
              onRecord={setSelectedProgram}
            />
          </div>
          <AttendanceRecordsTable
            records={filteredRecords}
            programs={programs}
          />
        </>
      )}

      {activeTab === "entrance" && (
        <EntranceLogsTable
          logs={entranceLogs}
          visibleLogs={filteredEntranceLogs}
          onRefresh={loadLogs}
        />
      )}

      {selectedProgram && (
        <RecordAttendanceModal
          program={selectedProgram}
          members={members}
          records={attendanceRecords}
          onRecord={handleRecordAttendance}
          onClose={() => setSelectedProgram(null)}
        />
      )}
    </div>
  );
};

export default AttendancePage;
