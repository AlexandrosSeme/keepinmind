import React from "react";
import moment from "moment";
import { CheckCircle, Clock, XCircle } from "lucide-react";
import { Modal, StatusBadge } from "@/shared/ui";
import type { Member } from "@/features/members";
import type { AttendanceRecord, Program } from "../types";
import "./RecordAttendanceModal.scss";

interface RecordAttendanceModalProps {
  program: Program;
  members: Member[];
  records: AttendanceRecord[];
  onRecord: (memberId: number, status: AttendanceRecord["status"]) => void;
  onClose: () => void;
}

const RecordAttendanceModal: React.FC<RecordAttendanceModalProps> = ({
  program,
  members,
  records,
  onRecord,
  onClose,
}) => (
  <Modal
    title={`Καταγραφη Προσελευσης - ${program.title}`}
    onClose={onClose}
    size="lg"
    closeOnBackdrop={false}
    footer={
      <button type="button" className="btn btn-secondary" onClick={onClose}>
        Κλεισιμο
      </button>
    }
  >
    <div className="mb-3">
      <p className="mb-1">
        <strong>Ημερομηνια:</strong> {moment(program.date).format("DD/MM/YYYY")}
      </p>
      <p className="mb-1">
        <strong>Ωρα:</strong> {program.time}
      </p>
      <p className="mb-0">
        <strong>Εκπαιδευτης:</strong> {program.instructor || "-"}
      </p>
    </div>

    <hr />

    <h6 className="mb-3">Μελη</h6>
    <div className="table-responsive km-record-attendance__list">
      <table className="table table-sm">
        <thead>
          <tr>
            <th>Ονομα</th>
            <th>Τηλεφωνο</th>
            <th>Κατασταση</th>
            <th>Ενεργειες</th>
          </tr>
        </thead>
        <tbody>
          {members.length > 0 ? (
            members.map((member) => {
              const existing = records.find(
                (r) => r.programId === program.id && r.memberId === member.id,
              );
              return (
                <tr key={member.id}>
                  <td>{member.name}</td>
                  <td>{member.phone}</td>
                  <td>
                    {existing ? (
                      <StatusBadge status={existing.status} />
                    ) : (
                      <span className="text-muted">-</span>
                    )}
                  </td>
                  <td>
                    <div className="btn-group btn-group-sm" role="group">
                      <button
                        className="btn btn-outline-success"
                        onClick={() => onRecord(member.id, "attended")}
                        title="Παρεστη"
                      >
                        <CheckCircle size={16} />
                      </button>
                      <button
                        className="btn btn-outline-danger"
                        onClick={() => onRecord(member.id, "absent")}
                        title="Απουσια"
                      >
                        <XCircle size={16} />
                      </button>
                      <button
                        className="btn btn-outline-warning"
                        onClick={() => onRecord(member.id, "cancelled")}
                        title="Ακυρωθηκε"
                      >
                        <Clock size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={4} className="text-center text-muted py-3">
                Δεν υπαρχουν μελη
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </Modal>
);

export default RecordAttendanceModal;
