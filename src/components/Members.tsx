import React, { useState } from 'react';
import { Search, Filter, Download, Plus, User, Edit, Trash2 } from 'lucide-react';
import type { Member } from '../types';
import { useAppData } from '../contexts/AppDataContext';

interface MembersProps {
  members: Member[];
}

const Members: React.FC<MembersProps> = ({ members: membersProp }) => {
  const { members, addMember, editMember, removeMember } = useAppData();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [formData, setFormData] = useState<Omit<Member, 'id'>>({
    name: '',
    phone: '',
    status: 'active',
    expiry: '',
    package: '',
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { class: 'bg-success text-white', text: 'Ενεργή' },
      expiring_soon: { class: 'bg-warning text-dark', text: 'Λήγει Σύντομα' },
      expired: { class: 'bg-danger text-white', text: 'Ληγμένη' },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { class: 'bg-secondary text-white', text: status };
    
    return (
      <span className={`badge ${config.class}`}>
        {config.text}
      </span>
    );
  };

  // Use members from context if available, otherwise use prop
  const displayMembers = members.length > 0 ? members : membersProp;

  const filteredMembers = displayMembers.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.phone.includes(searchTerm)
  );

  const handleAdd = () => {
    setFormData({ name: '', phone: '', status: 'active', expiry: '', package: '' });
    setShowAddModal(true);
  };

  const handleEdit = (member: Member) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      phone: member.phone,
      status: member.status,
      expiry: member.expiry,
      package: member.package,
    });
    setShowEditModal(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Είστε σίγουροι ότι θέλετε να διαγράψετε αυτό το μέλος;')) {
      await removeMember(id);
    }
  };

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const newMember = await addMember(formData);
    if (newMember) {
      setShowAddModal(false);
      setFormData({ name: '', phone: '', status: 'active', expiry: '', package: '' });
    }
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMember) {
      const updated = await editMember(editingMember.id, formData);
      if (updated) {
        setShowEditModal(false);
        setEditingMember(null);
      }
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between mb-4">
        <h2 className="h4 mb-3 mb-md-0">Μέλη Γυμναστηρίου</h2>
        <button className="btn btn-primary" onClick={handleAdd}>
          <Plus size={16} className="me-2" />
          Νέο Μέλος
        </button>
      </div>

      {/* Filters */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-12 col-md-6 col-lg-8">
              <div className="position-relative">
                <Search size={16} className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
                <input
                  type="text"
                  className="form-control ps-5"
                  placeholder="Αναζήτηση μέλους (όνομα, τηλέφωνο)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-6 col-md-3 col-lg-2">
              <button className="btn btn-outline-secondary w-100">
                <Filter size={16} className="me-2" />
                Φίλτρα
              </button>
            </div>
            <div className="col-6 col-md-3 col-lg-2">
              <button className="btn btn-outline-secondary w-100">
                <Download size={16} className="me-2" />
                Export
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Members Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th className="border-0 ps-4">Ονοματεπώνυμο</th>
                  <th className="border-0">Τηλέφωνο</th>
                  <th className="border-0 d-none d-md-table-cell">Πακέτο</th>
                  <th className="border-0 d-none d-lg-table-cell">Λήξη</th>
                  <th className="border-0">Κατάσταση</th>
                  <th className="border-0 pe-4">Ενέργειες</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map(member => (
                  <tr key={member.id}>
                    <td className="ps-4">
                      <div className="d-flex align-items-center">
                        <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px' }}>
                          <User size={20} className="text-primary" />
                        </div>
                        <div>
                          <div className="fw-semibold text-dark">{member.name}</div>
                          <small className="text-muted d-md-none">{member.phone}</small>
                        </div>
                      </div>
                    </td>
                    <td className="d-none d-md-table-cell">
                      <span className="text-muted">{member.phone}</span>
                    </td>
                    <td className="d-none d-md-table-cell">
                      <span className="text-muted">{member.package}</span>
                    </td>
                    <td className="d-none d-lg-table-cell">
                      <span className="text-muted">{member.expiry}</span>
                    </td>
                    <td>
                      {getStatusBadge(member.status)}
                    </td>
                    <td className="pe-4">
                      <div className="btn-group" role="group">
                        <button 
                          className="btn btn-link btn-sm text-primary p-0 me-2"
                          onClick={() => handleEdit(member)}
                          title="Επεξεργασία"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          className="btn btn-link btn-sm text-danger p-0"
                          onClick={() => handleDelete(member.id)}
                          title="Διαγραφή"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Mobile Cards View */}
      <div className="d-md-none">
        {filteredMembers.map(member => (
          <div key={member.id} className="card border-0 shadow-sm mb-3">
            <div className="card-body">
              <div className="d-flex align-items-start justify-content-between mb-3">
                <div className="d-flex align-items-center">
                  <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px' }}>
                    <User size={20} className="text-primary" />
                  </div>
                  <div>
                    <h6 className="mb-1">{member.name}</h6>
                    <small className="text-muted">{member.phone}</small>
                  </div>
                </div>
                {getStatusBadge(member.status)}
              </div>
              <div className="row g-2 mb-3">
                <div className="col-6">
                  <small className="text-muted d-block">Πακέτο</small>
                  <span className="text-dark">{member.package}</span>
                </div>
                <div className="col-6">
                  <small className="text-muted d-block">Λήξη</small>
                  <span className="text-dark">{member.expiry}</span>
                </div>
              </div>
              <div className="d-grid gap-2">
                <button 
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => handleEdit(member)}
                >
                  <Edit size={14} className="me-1" />
                  Επεξεργασία
                </button>
                <button 
                  className="btn btn-outline-danger btn-sm"
                  onClick={() => handleDelete(member.id)}
                >
                  <Trash2 size={14} className="me-1" />
                  Διαγραφή
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setShowAddModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Προσθήκη Νέου Μέλους</h5>
                <button type="button" className="btn-close" onClick={() => setShowAddModal(false)}></button>
              </div>
              <form onSubmit={handleSubmitAdd}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Ονοματεπώνυμο</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Τηλέφωνο</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Κατάσταση</label>
                    <select
                      className="form-select"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as Member['status'] })}
                      required
                    >
                      <option value="active">Ενεργή</option>
                      <option value="expiring_soon">Λήγει Σύντομα</option>
                      <option value="expired">Ληγμένη</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Ημερομηνία Λήξης</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="DD/MM/YYYY"
                      value={formData.expiry}
                      onChange={(e) => setFormData({ ...formData, expiry: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Πακέτο</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.package}
                      onChange={(e) => setFormData({ ...formData, package: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Ακύρωση</button>
                  <button type="submit" className="btn btn-primary">Αποθήκευση</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Member Modal */}
      {showEditModal && editingMember && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setShowEditModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Επεξεργασία Μέλους</h5>
                <button type="button" className="btn-close" onClick={() => setShowEditModal(false)}></button>
              </div>
              <form onSubmit={handleSubmitEdit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Ονοματεπώνυμο</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Τηλέφωνο</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Κατάσταση</label>
                    <select
                      className="form-select"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as Member['status'] })}
                      required
                    >
                      <option value="active">Ενεργή</option>
                      <option value="expiring_soon">Λήγει Σύντομα</option>
                      <option value="expired">Ληγμένη</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Ημερομηνία Λήξης</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="DD/MM/YYYY"
                      value={formData.expiry}
                      onChange={(e) => setFormData({ ...formData, expiry: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Πακέτο</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.package}
                      onChange={(e) => setFormData({ ...formData, package: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Ακύρωση</button>
                  <button type="submit" className="btn btn-primary">Αποθήκευση</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Members;
