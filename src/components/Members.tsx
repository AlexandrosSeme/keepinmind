import React, { useState } from 'react';
import { Search, Filter, Download, Plus, User } from 'lucide-react';
import type { Member } from '../types';

interface MembersProps {
  members: Member[];
}

const Members: React.FC<MembersProps> = ({ members }) => {
  const [searchTerm, setSearchTerm] = useState('');

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

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.phone.includes(searchTerm)
  );

  return (
    <div>
      {/* Header */}
      <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between mb-4">
        <h2 className="h4 mb-3 mb-md-0">Μέλη Γυμναστηρίου</h2>
        <button className="btn btn-primary">
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
                      <button className="btn btn-link btn-sm text-primary p-0">
                        Προβολή
                      </button>
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
              <button className="btn btn-outline-primary btn-sm w-100">
                Προβολή
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Members;
