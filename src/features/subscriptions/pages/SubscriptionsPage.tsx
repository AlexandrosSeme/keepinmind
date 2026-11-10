import React, { useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import type { Package } from "../types";
import StatusBadge from "./ui/StatusBadge";
import { useAppData } from "../contexts/AppDataContext";

interface SubscriptionsProps {
  packages: Package[];
}

const emptyForm: Omit<Package, "id"> = {
  name: "",
  category: "subscription",
  duration: "",
  price: 0,
  active: 0,
};

const Subscriptions: React.FC<SubscriptionsProps> = ({
  packages: packagesProp,
}) => {
  const { packages, addPackage, editPackage, removePackage } = useAppData();
  const displayPackages = packages.length > 0 ? packages : packagesProp;

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Package | null>(null);
  const [formData, setFormData] = useState<Omit<Package, "id">>(emptyForm);
  const [saving, setSaving] = useState(false);

  const openAdd = () => {
    setEditing(null);
    setFormData(emptyForm);
    setShowModal(true);
  };

  const openEdit = (pkg: Package) => {
    setEditing(pkg);
    setFormData({
      name: pkg.name,
      category: pkg.category,
      duration: pkg.duration,
      price: pkg.price,
      active: pkg.active,
    });
    setShowModal(true);
  };

  const handleDelete = async (pkg: Package) => {
    if (
      !window.confirm(
        `Ειστε σιγουροι οτι θελετε να διαγραψετε το πακετο «${pkg.name}»;`
      )
    ) {
      return;
    }
    const ok = await removePackage(pkg.id);
    if (!ok) {
      alert("Αποτυχια διαγραφης. Ελεγξτε τη συνδεση με τη βαση.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload: Omit<Package, "id"> = {
      ...formData,
      price: Number(formData.price) || 0,
      active: Number(formData.active) || 0,
    };

    try {
      if (editing) {
        const updated = await editPackage(editing.id, payload);
        if (!updated) {
          alert("Αποτυχια ενημερωσης πακετου.");
          return;
        }
      } else {
        const created = await addPackage(payload);
        if (!created) {
          alert("Αποτυχια δημιουργιας πακετου. Ελεγξτε τη συνδεση με τη βαση.");
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

  return (
    <div>
      <div className="km-page-header">
        <h2 className="km-page-title">Πακετα Συνδρομων</h2>
        <button className="btn btn-primary" type="button" onClick={openAdd}>
          <Plus size={16} className="me-2" />
          Νεο Πακετο
        </button>
      </div>

      <div className="row g-3">
        {displayPackages.map((pkg) => (
          <div key={pkg.id} className="col-12 col-md-6 col-lg-4 col-xl-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="d-flex align-items-start justify-content-between mb-3 gap-2">
                  <h5 className="card-title mb-0">{pkg.name}</h5>
                  <StatusBadge status={pkg.category} />
                </div>

                <div className="mb-3">
                  <small className="text-muted d-block">Διαρκεια</small>
                  <span className="text-dark">{pkg.duration}</span>
                </div>

                <div className="mb-3">
                  <div className="km-stat-value text-primary">€{pkg.price}</div>
                </div>

                <div className="mb-4">
                  <small className="text-muted d-block">Ενεργα μελη</small>
                  <span className="fw-semibold text-dark">{pkg.active}</span>
                </div>

                <div className="d-flex align-items-center gap-3">
                  <button
                    type="button"
                    className="btn btn-link btn-sm km-action-link p-0"
                    onClick={() => openEdit(pkg)}
                  >
                    <Edit size={16} className="me-1" />
                    Επεξεργασια
                  </button>
                  <button
                    type="button"
                    className="btn btn-link btn-sm km-action-link km-action-danger p-0"
                    onClick={() => handleDelete(pkg)}
                  >
                    <Trash2 size={16} className="me-1" />
                    Διαγραφη
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {displayPackages.length === 0 && (
        <div className="card border-0 shadow-sm">
          <div className="card-body text-center py-5">
            <div
              className="km-avatar-soft d-inline-flex mb-3"
              style={{ width: 80, height: 80 }}
            >
              <Plus size={32} />
            </div>
            <h5 className="text-muted">Δεν υπαρχουν πακετα συνδρομων</h5>
            <p className="text-muted mb-4">
              Δημιουργηστε το πρωτο πακετο συνδρομης για να ξεκινησετε
            </p>
            <button className="btn btn-primary" type="button" onClick={openAdd}>
              <Plus size={16} className="me-2" />
              Δημιουργια Πακετου
            </button>
          </div>
        </div>
      )}

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
                  {editing ? "Επεξεργασια Πακετου" : "Νεο Πακετο"}
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
                  <div className="mb-3">
                    <label className="form-label">Ονομα πακετου</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, name: e.target.value }))
                      }
                      placeholder="π.χ. Μηνιαια Unlimited"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Κατηγορια</label>
                    <select
                      className="form-select"
                      value={formData.category}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          category: e.target.value as Package["category"],
                        }))
                      }
                      required
                    >
                      <option value="subscription">Συνδρομη</option>
                      <option value="hourly">Ωριαια</option>
                      <option value="kids">Παιδικο</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Διαρκεια</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.duration}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          duration: e.target.value,
                        }))
                      }
                      placeholder="π.χ. 30 ημερες / 10 επισκεψεις"
                      required
                    />
                  </div>
                  <div className="row g-3">
                    <div className="col-6">
                      <label className="form-label">Τιμη (€)</label>
                      <input
                        type="number"
                        className="form-control"
                        min={0}
                        step="0.01"
                        value={formData.price}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            price: Number(e.target.value),
                          }))
                        }
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label">Ενεργα μελη</label>
                      <input
                        type="number"
                        className="form-control"
                        min={0}
                        step={1}
                        value={formData.active}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            active: Number(e.target.value),
                          }))
                        }
                      />
                    </div>
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

export default Subscriptions;
