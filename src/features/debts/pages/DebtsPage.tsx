import React, { useState } from "react";
import {
  Euro,
  Clock,
  Phone,
  Mail,
  Plus,
  Edit,
  Trash2,
} from "lucide-react";
import StatusBadge from "./ui/StatusBadge";
import type { Debt } from "../types";
import { useAppData } from "../contexts/AppDataContext";

interface DebtsProps {
  debts?: Debt[];
}

const emptyForm: Omit<Debt, "id"> = {
  name: "",
  amount: 0,
  daysOverdue: 0,
  status: "overdue",
  lastContact: "",
  phone: "",
  email: "",
};

const Debts: React.FC<DebtsProps> = ({ debts: debtsProp = [] }) => {
  const { debts, members, addDebt, editDebt, removeDebt } = useAppData();
  const displayDebts = debts.length > 0 ? debts : debtsProp;

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Debt | null>(null);
  const [formData, setFormData] = useState<Omit<Debt, "id">>(emptyForm);
  const [saving, setSaving] = useState(false);

  const openAdd = () => {
    setEditing(null);
    setFormData(emptyForm);
    setShowModal(true);
  };

  const openEdit = (debt: Debt) => {
    setEditing(debt);
    setFormData({
      name: debt.name,
      amount: debt.amount,
      daysOverdue: debt.daysOverdue,
      status: debt.status,
      lastContact: debt.lastContact || "",
      phone: debt.phone || "",
      email: debt.email || "",
    });
    setShowModal(true);
  };

  const handleDelete = async (debt: Debt) => {
    if (
      !window.confirm(
        `Διαγραφη οφειλης του/της ${debt.name} (€${debt.amount});`
      )
    ) {
      return;
    }
    const ok = await removeDebt(debt.id);
    if (!ok) {
      alert("Αποτυχια διαγραφης. Ελεγξτε τη συνδεση με τη βαση.");
    }
  };

  const handleMemberPick = (memberName: string) => {
    const member = members.find((m) => m.name === memberName);
    setFormData((prev) => ({
      ...prev,
      name: memberName,
      phone: member?.phone || prev.phone,
      email: member?.email || prev.email,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload: Omit<Debt, "id"> = {
      name: formData.name.trim(),
      amount: Number(formData.amount) || 0,
      daysOverdue: Number(formData.daysOverdue) || 0,
      status: formData.status,
      lastContact: formData.lastContact || undefined,
      phone: formData.phone || undefined,
      email: formData.email || undefined,
    };

    try {
      if (editing) {
        const updated = await editDebt(editing.id, payload);
        if (!updated) {
          alert("Αποτυχια ενημερωσης οφειλης.");
          return;
        }
      } else {
        const created = await addDebt(payload);
        if (!created) {
          alert("Αποτυχια δημιουργιας οφειλης. Ελεγξτε τη συνδεση με τη βαση.");
          return;
        }
      }
      setShowModal(false);
      setEditing(null);
      setFormData(emptyForm);
    } finally {
      setSaving(false);
    }
  };

  const callPhone = (phone?: string) => {
    if (!phone) {
      alert("Δεν υπαρχει τηλεφωνο.");
      return;
    }
    window.location.href = `tel:${phone}`;
  };

  const sendMail = (email?: string) => {
    if (!email) {
      alert("Δεν υπαρχει email.");
      return;
    }
    window.location.href = `mailto:${email}`;
  };

  return (
    <div>
      <div className="km-page-header">
        <div>
          <h2 className="km-page-title">Οφειλες</h2>
          <p className="km-page-subtitle">
            Προβολη και διαχειριση ληξιπροθεσμων οφειλων
          </p>
        </div>
        <button className="btn btn-primary" type="button" onClick={openAdd}>
          <Plus size={16} className="me-2" />
          Νεα Οφειλη
        </button>
      </div>

      <div className="card border-0 shadow-sm km-table-card">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0 km-table">
              <thead className="table-light">
                <tr>
                  <th className="border-0 ps-4">Μελος</th>
                  <th className="border-0">Ποσο</th>
                  <th className="border-0">Ημερες καθυστερηση</th>
                  <th className="border-0">Κατασταση</th>
                  <th className="border-0">Τελευταια επαφη</th>
                  <th className="border-0 pe-4">Ενεργειες</th>
                </tr>
              </thead>
              <tbody>
                {displayDebts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center text-muted py-5">
                      Δεν υπαρχουν οφειλες. Προσθεστε την πρωτη με «Νεα Οφειλη».
                    </td>
                  </tr>
                ) : (
                  displayDebts.map((debt) => (
                    <tr key={debt.id}>
                      <td className="ps-4">
                        <div className="d-flex align-items-center">
                          <div
                            className="km-avatar-soft me-3"
                            style={{ width: 40, height: 40 }}
                          >
                            <Euro size={18} />
                          </div>
                          <div>
                            <div className="fw-semibold text-dark">
                              {debt.name}
                            </div>
                            <small className="text-muted">
                              {debt.phone || "—"}
                            </small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="fw-semibold text-danger">
                          €{debt.amount}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-2 text-muted">
                          <Clock size={16} />
                          <span className="fw-semibold text-dark">
                            {debt.daysOverdue} ημερες
                          </span>
                        </div>
                      </td>
                      <td>
                        <StatusBadge status={debt.status} />
                      </td>
                      <td>
                        <small className="text-muted">
                          {debt.lastContact || "—"}
                        </small>
                      </td>
                      <td className="pe-4">
                        <div className="d-flex align-items-center gap-2">
                          <button
                            type="button"
                            className="btn btn-link btn-sm km-action-link"
                            title="Κληση"
                            onClick={() => callPhone(debt.phone)}
                          >
                            <Phone size={16} />
                          </button>
                          <button
                            type="button"
                            className="btn btn-link btn-sm km-action-link"
                            title="Email"
                            onClick={() => sendMail(debt.email)}
                          >
                            <Mail size={16} />
                          </button>
                          <button
                            type="button"
                            className="btn btn-link btn-sm km-action-link"
                            title="Επεξεργασια"
                            onClick={() => openEdit(debt)}
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            type="button"
                            className="btn btn-link btn-sm km-action-link km-action-danger"
                            title="Διαγραφη"
                            onClick={() => handleDelete(debt)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={() => !saving && setShowModal(false)}
        >
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editing ? "Επεξεργασια Οφειλης" : "Νεα Οφειλη"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  disabled={saving}
                  onClick={() => setShowModal(false)}
                />
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  {members.length > 0 && (
                    <div className="mb-3">
                      <label className="form-label">Επιλογη μελους</label>
                      <select
                        className="form-select"
                        value={
                          members.some((m) => m.name === formData.name)
                            ? formData.name
                            : ""
                        }
                        onChange={(e) => {
                          if (e.target.value) handleMemberPick(e.target.value);
                        }}
                      >
                        <option value="">— Χειροκινητη εισαγωγη —</option>
                        {members.map((m) => (
                          <option key={m.id} value={m.name}>
                            {m.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div className="mb-3">
                    <label className="form-label">Ονοματεπωνυμο</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label">Ποσο (€)</label>
                      <input
                        type="number"
                        className="form-control"
                        min={0}
                        step="0.01"
                        value={formData.amount}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            amount: Number(e.target.value),
                          }))
                        }
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label">Ημερες καθυστερηση</label>
                      <input
                        type="number"
                        className="form-control"
                        min={0}
                        value={formData.daysOverdue}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            daysOverdue: Number(e.target.value),
                          }))
                        }
                        required
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Κατασταση</label>
                    <select
                      className="form-select"
                      value={formData.status}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          status: e.target.value as Debt["status"],
                        }))
                      }
                      required
                    >
                      <option value="warning">Προειδοποιηση</option>
                      <option value="overdue">Ληξιπροθεσμη</option>
                      <option value="critical">Κρισιμη</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Τηλεφωνο</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.phone || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          phone: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      value={formData.email || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="mb-0">
                    <label className="form-label">Τελευταια επαφη</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="DD/MM/YYYY"
                      value={formData.lastContact || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          lastContact: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    disabled={saving}
                    onClick={() => setShowModal(false)}
                  >
                    Ακυρωση
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={saving}
                  >
                    {saving
                      ? "Αποθηκευση..."
                      : editing
                        ? "Αποθηκευση"
                        : "Δημιουργια"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Debts;
