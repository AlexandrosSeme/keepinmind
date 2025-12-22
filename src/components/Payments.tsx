import React from 'react';
import { CreditCard, Euro, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface Payment {
  id: number;
  memberName: string;
  amount: number;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  method: string;
}

interface PaymentsProps {
  payments?: Payment[];
}

const Payments: React.FC<PaymentsProps> = ({ payments = [] }) => {
  const mockPayments: Payment[] = [
    { id: 1, memberName: 'Νίκος Παπαδόπουλος', amount: 45, date: '15/10/2025', status: 'completed', method: 'Μετρητά' },
    { id: 2, memberName: 'Μαρία Γεωργίου', amount: 450, date: '14/10/2025', status: 'completed', method: 'Κάρτα' },
    { id: 3, memberName: 'Γιώργος Κωνσταντίνου', amount: 80, date: '13/10/2025', status: 'pending', method: 'Τραπεζική Μεταφορά' },
    { id: 4, memberName: 'Ελένη Δημητρίου', amount: 45, date: '12/10/2025', status: 'failed', method: 'Κάρτα' },
  ];

  const displayPayments = payments.length > 0 ? payments : mockPayments;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={16} className="text-success" />;
      case 'pending':
        return <Clock size={16} className="text-warning" />;
      case 'failed':
        return <AlertCircle size={16} className="text-danger" />;
      default:
        return <Clock size={16} className="text-muted" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-success';
      case 'pending':
        return 'text-warning';
      case 'failed':
        return 'text-danger';
      default:
        return 'text-muted';
    }
  };

  return (
    <div>
      <div className="row mb-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h4 className="card-title mb-3">
                <CreditCard className="me-2" />
                Διαχείριση Πληρωμών
              </h4>
              <p className="text-muted">Προβολή και διαχείριση όλων των πληρωμών</p>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-bottom">
              <h5 className="card-title mb-0">Ιστορικό Πληρωμών</h5>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Μέλος</th>
                      <th>Ποσό</th>
                      <th>Ημερομηνία</th>
                      <th>Μέθοδος</th>
                      <th>Κατάσταση</th>
                      <th>Ενέργειες</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayPayments.map(payment => (
                      <tr key={payment.id}>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-2" style={{ width: '32px', height: '32px' }}>
                              <Euro size={16} className="text-white" />
                            </div>
                            <div>
                              <div className="fw-semibold">{payment.memberName}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="fw-bold">€{payment.amount}</span>
                        </td>
                        <td>{payment.date}</td>
                        <td>{payment.method}</td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            {getStatusIcon(payment.status)}
                            <span className={getStatusColor(payment.status)}>
                              {payment.status === 'completed' ? 'Ολοκληρώθηκε' : 
                               payment.status === 'pending' ? 'Εκκρεμής' : 'Αποτυχία'}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="btn-group" role="group">
                            <button className="btn btn-outline-primary btn-sm">Προβολή</button>
                            {payment.status === 'pending' && (
                              <button className="btn btn-outline-success btn-sm">Επιβεβαίωση</button>
                            )}
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

export default Payments;
