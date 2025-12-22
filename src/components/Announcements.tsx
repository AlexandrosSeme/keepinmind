import React, { useState } from 'react';
import { Send } from 'lucide-react';

const Announcements: React.FC = () => {
  const [message, setMessage] = useState('');
  const [recipients, setRecipients] = useState('all');
  const [channel, setChannel] = useState('sms');

  const recentAnnouncements = [
    {
      id: 1,
      title: 'Χριστουγεννιάτικες Προσφορές',
      sentTo: '142 μέλη',
      channel: 'SMS',
      date: '10/12/2024 10:00',
      status: 'sent',
      successful: 138
    }
  ];

  const recipientOptions = [
    { value: 'all', label: 'Όλα τα μέλη (156)' },
    { value: 'active', label: 'Ενεργά μέλη (142)' },
    { value: 'expiring', label: 'Λήξη εντός 7 ημερών (12)' },
    { value: 'overdue', label: 'Ληξιπρόθεσμα (8)' },
    { value: 'monthly', label: 'Μηνιαία συνδρομή (78)' },
    { value: 'yearly', label: 'Ετήσια συνδρομή (42)' }
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      sent: { class: 'bg-success text-white', text: 'Στάλθηκε' },
      scheduled: { class: 'bg-warning text-dark', text: 'Προγραμματισμένο' },
      draft: { class: 'bg-secondary text-white', text: 'Πρόχειρο' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { class: 'bg-secondary text-white', text: status };
    
    return (
      <span className={`badge ${config.class}`}>
        {config.text}
      </span>
    );
  };

  const estimatedCost = Math.ceil(message.length / 160) * 0.05; // Rough estimate

  return (
    <div>
      {/* Header */}
      <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between mb-4">
        <h2 className="h4 mb-3 mb-md-0">Ανακοινώσεις</h2>
        <button className="btn btn-primary">
          <Send size={16} className="me-2" />
          Νέα Ανακοίνωση
        </button>
      </div>

      {/* Create Announcement Form */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header bg-white border-bottom">
          <h5 className="card-title mb-0">Δημιουργία Ανακοίνωσης</h5>
        </div>
        <div className="card-body">
          <div className="row g-4">
            {/* Recipients */}
            <div className="col-12 col-md-6">
              <label className="form-label fw-semibold">Αποδέκτες</label>
              <select 
                className="form-select"
                value={recipients}
                onChange={(e) => setRecipients(e.target.value)}
              >
                {recipientOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Channel */}
            <div className="col-12 col-md-6">
              <label className="form-label fw-semibold">Κανάλι</label>
              <div className="d-flex gap-3">
                <div className="form-check">
                  <input 
                    className="form-check-input" 
                    type="radio" 
                    name="channel" 
                    id="sms"
                    value="sms"
                    checked={channel === 'sms'}
                    onChange={(e) => setChannel(e.target.value)}
                  />
                  <label className="form-check-label" htmlFor="sms">
                    SMS
                  </label>
                </div>
                <div className="form-check">
                  <input 
                    className="form-check-input" 
                    type="radio" 
                    name="channel" 
                    id="email"
                    value="email"
                    checked={channel === 'email'}
                    onChange={(e) => setChannel(e.target.value)}
                  />
                  <label className="form-check-label" htmlFor="email">
                    Email
                  </label>
                </div>
                <div className="form-check">
                  <input 
                    className="form-check-input" 
                    type="radio" 
                    name="channel" 
                    id="both"
                    value="both"
                    checked={channel === 'both'}
                    onChange={(e) => setChannel(e.target.value)}
                  />
                  <label className="form-check-label" htmlFor="both">
                    Και τα δύο
                  </label>
                </div>
              </div>
            </div>

            {/* Message */}
            <div className="col-12">
              <label className="form-label fw-semibold">Μήνυμα</label>
              <textarea
                className="form-control"
                rows={4}
                placeholder="Γράψτε το μήνυμά σας εδώ..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <div className="d-flex justify-content-between mt-2">
                <small className="text-muted">
                  Χαρακτήρες: {message.length}/160
                </small>
                <small className="text-muted">
                  Εκτιμώμενο κόστος: €{estimatedCost.toFixed(2)}
                </small>
              </div>
            </div>

            {/* Actions */}
            <div className="col-12">
              <div className="d-flex gap-2">
                <button className="btn btn-outline-secondary flex-fill">
                  Αποθήκευση Πρόχειρου
                </button>
                <button className="btn btn-primary flex-fill">
                  Αποστολή Τώρα
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Announcements */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white border-bottom">
          <h5 className="card-title mb-0">Πρόσφατες Ανακοινώσεις</h5>
        </div>
        <div className="card-body p-0">
          {recentAnnouncements.map(announcement => (
            <div key={announcement.id} className="border-bottom p-4 hover-bg-light">
              <div className="d-flex align-items-start justify-content-between">
                <div className="flex-grow-1">
                  <h6 className="mb-1 text-dark">{announcement.title}</h6>
                  <p className="text-muted mb-2 small">
                    Στάλθηκε σε {announcement.sentTo} | {announcement.channel}
                  </p>
                  <small className="text-muted">{announcement.date}</small>
                </div>
                <div className="text-end">
                  {getStatusBadge(announcement.status)}
                  <div className="mt-1">
                    <small className="text-muted">
                      {announcement.successful} επιτυχημένα
                    </small>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {recentAnnouncements.length === 0 && (
        <div className="text-center py-5">
          <div className="mb-4">
            <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px' }}>
              <Send size={32} className="text-muted" />
            </div>
          </div>
          <h5 className="text-muted">Δεν υπάρχουν ανακοινώσεις</h5>
          <p className="text-muted mb-4">Δημιουργήστε την πρώτη ανακοίνωση για να ξεκινήσετε</p>
          <button className="btn btn-primary">
            <Send size={16} className="me-2" />
            Δημιουργία Ανακοίνωσης
          </button>
        </div>
      )}
    </div>
  );
};

export default Announcements;
