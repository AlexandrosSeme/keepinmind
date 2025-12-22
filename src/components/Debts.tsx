import React from 'react';
import { AlertTriangle, Euro, Clock, Phone, Mail } from 'lucide-react';

interface Debt {
  id: number;
  memberName: string;
  amount: number;
  daysOverdue: number;
  status: 'overdue' | 'warning' | 'critical';
  lastContact: string;
  phone: string;
  email: string;
}

interface DebtsProps {
  debts?: Debt[];
}

const Debts: React.FC<DebtsProps> = ({ debts = [] }) => {
  const displayDebts = debts;


  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'critical':
        return 'bg-danger';
      case 'overdue':
        return 'bg-warning';
      case 'warning':
        return 'bg-info';
      default:
        return 'bg-secondary';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'critical':
        return 'Κρίσιμη';
      case 'overdue':
        return 'Ληξιπρόθεσμη';
      case 'warning':
        return 'Προειδοποίηση';
      default:
        return 'Άγνωστη';
    }
  };

  return (
    <div>
      <div className="row mb-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h4 className="card-title mb-3">
                <AlertTriangle className="me-2" />
                Διαχείριση Οφειλών
              </h4>
              <p className="text-muted">Προβολή και διαχείριση όλων των οφειλών</p>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-bottom">
              <h5 className="card-title mb-0">Ληξιπρόθεσμες Οφειλές</h5>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Μέλος</th>
                      <th>Ποσό</th>
                      <th>Ημέρες καθυστέρηση</th>
                      <th>Κατάσταση</th>
                      <th>Τελευταία επαφή</th>
                      <th>Ενέργειες</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayDebts.map(debt => (
                      <tr key={debt.id}>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="bg-danger rounded-circle d-flex align-items-center justify-content-center me-2" style={{ width: '32px', height: '32px' }}>
                              <Euro size={16} className="text-white" />
                            </div>
                            <div>
                              <div className="fw-semibold">{debt.memberName}</div>
                              <small className="text-muted">{debt.phone}</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="fw-bold text-danger">€{debt.amount}</span>
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <Clock size={16} className="text-warning" />
                            <span className="fw-semibold">{debt.daysOverdue} ημέρες</span>
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${getStatusBadge(debt.status)} text-white`}>
                            {getStatusText(debt.status)}
                          </span>
                        </td>
                        <td>
                          <small className="text-muted">{debt.lastContact}</small>
                        </td>
                        <td>
                          <div className="btn-group" role="group">
                            <button className="btn btn-outline-primary btn-sm">
                              <Phone size={14} className="me-1" />
                              Κλήση
                            </button>
                            <button className="btn btn-outline-success btn-sm">
                              <Mail size={14} className="me-1" />
                              Email
                            </button>
                            <button className="btn btn-outline-warning btn-sm">
                              Καταγραφή
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
        </div>
      </div>
    </div>
  );
};

export default Debts;
