import React from 'react';
import { Bell, Clock, CheckCircle } from 'lucide-react';

const Notifications: React.FC = () => {
  const notifications = [
    {
      id: 1,
      type: 'expiry_warning',
      title: '7 ημέρες πριν λήξη',
      message: 'Μαρία Γεωργίου - Η συνδρομή σας λήγει σε 7 ημέρες',
      channel: 'SMS',
      status: 'scheduled',
      scheduledFor: '13/10/2025 10:00',
      icon: Clock,
      iconColor: 'text-warning',
      iconBg: 'bg-warning bg-opacity-10'
    },
    {
      id: 2,
      type: 'expiry_today',
      title: 'Ημέρα λήξης',
      message: 'Νίκος Παπαδόπουλος - Η συνδρομή σας λήγει σήμερα',
      channel: 'SMS',
      status: 'sent',
      sentAt: '13/10/2025 10:05',
      icon: CheckCircle,
      iconColor: 'text-success',
      iconBg: 'bg-success bg-opacity-10'
    }
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      scheduled: { class: 'bg-warning text-dark', text: 'Εκκρεμεί' },
      sent: { class: 'bg-success text-white', text: 'Σταλμένο' },
      failed: { class: 'bg-danger text-white', text: 'Αποτυχία' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { class: 'bg-secondary text-white', text: status };
    
    return (
      <span className={`badge ${config.class}`}>
        {config.text}
      </span>
    );
  };

  return (
    <div>
      {/* Header */}
      <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between mb-4">
        <h2 className="h4 mb-3 mb-md-0">Ειδοποιήσεις</h2>
        <button className="btn btn-primary">
          <Bell size={16} className="me-2" />
          Νέα Ειδοποίηση
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="btn-group w-100" role="group">
            <button className="btn btn-primary">Όλες</button>
            <button className="btn btn-outline-secondary">Προγραμματισμένες</button>
            <button className="btn btn-outline-secondary">Σταλμένες</button>
            <button className="btn btn-outline-secondary">Αποτυχημένες</button>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          {notifications.map(notification => {
            const IconComponent = notification.icon;
            return (
              <div key={notification.id} className="border-bottom p-4 hover-bg-light">
                <div className="d-flex align-items-start justify-content-between">
                  <div className="d-flex align-items-start gap-3">
                    <div className={`p-2 rounded-circle ${notification.iconBg}`}>
                      <IconComponent size={20} className={notification.iconColor} />
                    </div>
                    <div className="flex-grow-1">
                      <h6 className="mb-1 text-dark">{notification.title}</h6>
                      <p className="text-muted mb-2 small">{notification.message}</p>
                      <div className="d-flex align-items-center gap-2">
                        <span className="badge bg-info text-white">{notification.channel}</span>
                        <small className="text-muted">
                          {notification.status === 'scheduled' 
                            ? `Προγραμματισμένο για ${notification.scheduledFor}`
                            : `Στάλθηκε ${notification.sentAt}`
                          }
                        </small>
                      </div>
                    </div>
                  </div>
                  <div className="text-end">
                    {getStatusBadge(notification.status)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Empty State */}
      {notifications.length === 0 && (
        <div className="text-center py-5">
          <div className="mb-4">
            <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px' }}>
              <Bell size={32} className="text-muted" />
            </div>
          </div>
          <h5 className="text-muted">Δεν υπάρχουν ειδοποιήσεις</h5>
          <p className="text-muted mb-4">Όλες οι ειδοποιήσεις θα εμφανίζονται εδώ</p>
        </div>
      )}
    </div>
  );
};

export default Notifications;
