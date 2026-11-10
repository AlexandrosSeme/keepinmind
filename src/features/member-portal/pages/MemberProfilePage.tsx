import React, { useEffect, useState } from "react";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { StatusBadge } from "@/shared/ui";
import {
  getEntranceLogsByMember,
  type EntranceLog,
} from "@/features/attendance";
import { useMemberSession } from "../session/useMemberSession";

const MemberProfile: React.FC = () => {
  const { member, logout } = useMemberSession();
  const navigate = useNavigate();
  const [logs, setLogs] = useState<EntranceLog[]>([]);

  useEffect(() => {
    if (!member) return;
    getEntranceLogsByMember(member.id).then((data) =>
      setLogs(data.slice(0, 8)),
    );
  }, [member]);

  if (!member) return null;

  const handleLogout = () => {
    logout();
    navigate("/member", { replace: true });
  };

  return (
    <div>
      <h1 className="mp-page-title">Προφιλ</h1>
      <p className="mp-page-sub">Τα στοιχεια του λογαριασμου σου.</p>

      <div className="mp-card">
        <div className="d-flex align-items-center gap-3 mb-3">
          {member.photo_url ? (
            <img src={member.photo_url} alt="" className="mp-profile-photo" />
          ) : (
            <div className="km-avatar-soft mp-profile-initial">
              {member.name.charAt(0)}
            </div>
          )}
          <div>
            <div className="fw-bold mp-profile-name">{member.name}</div>
            <StatusBadge status={member.status} />
          </div>
        </div>

        <div className="row g-2">
          <div className="col-6">
            <div className="mp-stat-label">Τηλεφωνο</div>
            <div className="fw-semibold">{member.phone}</div>
          </div>
          <div className="col-6">
            <div className="mp-stat-label">Email</div>
            <div className="fw-semibold">{member.email || "—"}</div>
          </div>
          <div className="col-6">
            <div className="mp-stat-label">Πακετο</div>
            <div className="fw-semibold">{member.package || "—"}</div>
          </div>
          <div className="col-6">
            <div className="mp-stat-label">Ληξη</div>
            <div className="fw-semibold">{member.expiry || "—"}</div>
          </div>
          <div className="col-12">
            <div className="mp-stat-label">Member ID</div>
            <div className="fw-semibold">#{member.id}</div>
          </div>
        </div>
      </div>

      <div className="mp-card">
        <div className="mp-card-title">Τελευταιες προσελευσεις</div>
        {logs.length === 0 ? (
          <div className="text-muted">Καμια καταγραφη ακομα</div>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className="d-flex justify-content-between align-items-center py-2 border-bottom"
            >
              <small>{new Date(log.timestamp).toLocaleString("el-GR")}</small>
              <StatusBadge status={log.validationStatus} showDot={false} />
            </div>
          ))
        )}
      </div>

      <button
        type="button"
        className="mp-btn mp-btn-ghost"
        onClick={handleLogout}
      >
        <LogOut size={16} />
        Αποσυνδεση
      </button>
    </div>
  );
};

export default MemberProfile;
