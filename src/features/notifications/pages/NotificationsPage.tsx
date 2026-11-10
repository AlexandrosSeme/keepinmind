import React from 'react';
import { Bell, Clock, CheckCircle } from 'lucide-react';
import StatusBadge from './ui/StatusBadge';

const Notifications: React.FC = () => {
  const notifications = [
    {
      id: 1,
      type: 'expiry_warning',
      title: '7 ημερες πριν ληξη',
      message: 'Μαρια Γεωργιου - Η συνδρομη σας ληγει σε 7 ημερες',
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
      title: 'Ημερα ληξης',
      message: 'Νικος Παπαδοπουλος - Η συνδρομη σας ληγει σημερα',
      channel: 'SMS',
      status: 'sent',
      sentAt: '13/10/2025 10:05',
      icon: CheckCircle,
      iconColor: 'text-success',
      iconBg: 'bg-success bg-opacity-10'
    }
  ];

  return (
    <div>
      <div className="km-page-header">
        <h2 className="km-page-title">Ειδοποιησεις</h2>
        <button className="btn btn-primary">
          <Bell size={16} className="me-2" />
          Νεα Ειδοποιηση
        </button>
      </div>

      <div className="card border-0 shadow-sm mb-4 km-toolbar-card">
        <div className="card-body">
          <div className="d-flex flex-wrap gap-2">
            <button className="btn btn-primary btn-sm">Ολες</button>
            <button className="btn btn-outline-secondary btn-sm">Προγραμματισμενες</button>
            <button className="btn btn-outline-secondary btn-sm">Σταλμενες</button>
            <button className="btn btn-outline-secondary btn-sm">Αποτυχημενες</button>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          {notifications.map(notification => {
            const IconComponent = notification.icon;
            return (
              <div key={notification.id} className="km-list-row">
                <div className="d-flex align-items-start justify-content-between gap-3">
                  <div className="d-flex align-items-start gap-3">
                    <div className={`p-2 rounded-2 d-inline-flex align-items-center justify-content-center ${notification.iconBg}`}>
                      <IconComponent size={20} className={notification.iconColor} />
                    </div>
                    <div className="flex-grow-1">
                      <h6 className="mb-1 text-dark">{notification.title}</h6>
                      <p className="text-muted mb-2 small">{notification.message}</p>
                      <div className="d-flex align-items-center gap-2 flex-wrap">
                        <StatusBadge tone="info" label={notification.channel} />
                        <small className="text-muted">
                          {notification.status === 'scheduled'
                            ? `Προγραμματισμενο για ${notification.scheduledFor}`
                            : `Σταλθηκε ${notification.sentAt}`
                          }
                        </small>
                      </div>
                    </div>
                  </div>
                  <StatusBadge
                    status={notification.status}
                    label={
                      notification.status === 'scheduled'
                        ? 'Εκκρεμει'
                        : notification.status === 'sent'
                          ? 'Σταλμενο'
                          : undefined
                    }
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {notifications.length === 0 && (
        <div className="text-center py-5">
          <Bell size={48} className="text-muted mb-3" />
          <h5 className="text-muted">Δεν υπαρχουν ειδοποιησεις</h5>
        </div>
      )}
    </div>
  );
};

export default Notifications;
