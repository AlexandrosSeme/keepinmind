import React, { useState, useMemo } from 'react';
import { Calendar as BigCalendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Plus, X } from 'lucide-react';
import './Calendar.scss';

// Set moment locale to Greek
moment.locale('el');

const localizer = momentLocalizer(moment);

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource?: any;
  type: 'subscription_expiry' | 'class' | 'event';
  memberName?: string;
  subscriptionType?: string;
}

const Calendar: React.FC = () => {
  const [view, setView] = useState(Views.MONTH);
  const [date, setDate] = useState(new Date());
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null);
  const [newEvent, setNewEvent] = useState({
    title: '',
    type: 'class' as 'subscription_expiry' | 'class' | 'event',
    memberName: '',
    subscriptionType: '',
    description: ''
  });

  // Events state - now mutable for adding new events
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  // Initialize with sample data
  useMemo(() => {
    const today = new Date();
    const events: CalendarEvent[] = [];

    // Generate sample subscription expirations
    const sampleSubscriptions = [
      { name: 'Γιάννης Παπαδόπουλος', type: 'Μηνιαία', daysUntilExpiry: 3 },
      { name: 'Μαρία Κωνσταντίνου', type: 'Ετήσια', daysUntilExpiry: 7 },
      { name: 'Νίκος Αντωνίου', type: 'Μηνιαία', daysUntilExpiry: 0 },
      { name: 'Ελένη Δημητρίου', type: 'Τριμηνιαία', daysUntilExpiry: 1 },
      { name: 'Κώστας Γεωργίου', type: 'Μηνιαία', daysUntilExpiry: 5 },
      { name: 'Αννα Παπαδοπούλου', type: 'Ετήσια', daysUntilExpiry: 2 },
      { name: 'Δημήτρης Νικολάου', type: 'Μηνιαία', daysUntilExpiry: 0 },
      { name: 'Σοφία Αλεξάνδρου', type: 'Τριμηνιαία', daysUntilExpiry: 4 },
    ];

    sampleSubscriptions.forEach((sub, index) => {
      const expiryDate = new Date(today);
      expiryDate.setDate(today.getDate() + sub.daysUntilExpiry);
      
      let color = '#28a745'; // Green for future
      if (sub.daysUntilExpiry === 0) {
        color = '#dc3545'; // Red for today
      } else if (sub.daysUntilExpiry <= 3) {
        color = '#fd7e14'; // Orange for urgent
      }

      events.push({
        id: `sub-${index}`,
        title: `Λήξη συνδρομής - ${sub.name}`,
        start: expiryDate,
        end: expiryDate,
        type: 'subscription_expiry',
        memberName: sub.name,
        subscriptionType: sub.type,
        resource: { color }
      });
    });

    // Add some sample classes
    const sampleClasses = [
      { name: 'Boxing Class', time: '18:00', days: [1, 3, 5] }, // Mon, Wed, Fri
      { name: 'Muay Thai', time: '19:30', days: [2, 4] }, // Tue, Thu
      { name: 'MMA Training', time: '20:00', days: [6] }, // Sat
    ];

    sampleClasses.forEach((cls, index) => {
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);
      
      cls.days.forEach(dayOfWeek => {
        const classDate = new Date(nextWeek);
        classDate.setDate(nextWeek.getDate() - nextWeek.getDay() + dayOfWeek);
        
        const [hours, minutes] = cls.time.split(':');
        classDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        
        const endDate = new Date(classDate);
        endDate.setHours(classDate.getHours() + 1);

        events.push({
          id: `class-${index}-${dayOfWeek}`,
          title: cls.name,
          start: classDate,
          end: endDate,
          type: 'class',
          resource: { color: '#007bff' }
        });
      });
    });

    setEvents(events);
  }, []);

  // Event handlers
  const handleSelectSlot = (slotInfo: { start: Date; end: Date }) => {
    setSelectedSlot(slotInfo);
    setShowEventModal(true);
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    if (event.type === 'subscription_expiry') {
      alert(`Συνδρομή: ${event.memberName}\nΤύπος: ${event.subscriptionType}\nΗμερομηνία λήξης: ${moment(event.start).format('DD/MM/YYYY')}`);
    } else {
      alert(`Τάξη: ${event.title}\nΏρα: ${moment(event.start).format('HH:mm')} - ${moment(event.end).format('HH:mm')}`);
    }
  };

  const handleCreateEvent = () => {
    if (!selectedSlot || !newEvent.title.trim()) return;

    const eventColor = newEvent.type === 'subscription_expiry' ? '#dc3545' : 
                     newEvent.type === 'class' ? '#007bff' : '#28a745';

    const newCalendarEvent: CalendarEvent = {
      id: `event-${Date.now()}`,
      title: newEvent.title,
      start: selectedSlot.start,
      end: selectedSlot.end,
      type: newEvent.type,
      memberName: newEvent.memberName,
      subscriptionType: newEvent.subscriptionType,
      resource: { color: eventColor }
    };

    setEvents(prev => [...prev, newCalendarEvent]);
    setShowEventModal(false);
    setNewEvent({
      title: '',
      type: 'class',
      memberName: '',
      subscriptionType: '',
      description: ''
    });
    setSelectedSlot(null);
  };

  const handleCloseModal = () => {
    setShowEventModal(false);
    setNewEvent({
      title: '',
      type: 'class',
      memberName: '',
      subscriptionType: '',
      description: ''
    });
    setSelectedSlot(null);
  };

  const eventStyleGetter = (event: CalendarEvent) => {
    return {
      style: {
        backgroundColor: event.resource?.color || '#007bff',
        borderRadius: '3px',
        opacity: 0.9,
        color: 'white',
        border: '0px',
        display: 'block',
        fontSize: '0.7rem',
        fontWeight: '500',
        padding: '2px 4px',
        margin: '0',
        lineHeight: '1.1',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        position: 'relative' as const,
        top: '0',
        left: '0',
        width: '100%',
        height: 'auto',
        minHeight: '16px'
      }
    };
  };

  // Custom event component to force positioning
  const EventComponent = ({ event }: { event: CalendarEvent }) => {
    return (
      <div
        style={{
          backgroundColor: event.resource?.color || '#007bff',
          borderRadius: '3px',
          color: 'white',
          fontSize: '0.7rem',
          fontWeight: '500',
          padding: '2px 4px',
          margin: '0',
          lineHeight: '1.1',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          width: '100%',
          minHeight: '16px',
          display: 'block'
        }}
      >
        {event.title}
      </div>
    );
  };

  const handleNavigate = (newDate: Date) => {
    setDate(newDate);
  };

  const handleViewChange = (newView: any) => {
    setView(newView);
  };

  return (
    <div className="calendar-container">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between mb-4">
        <div>
          <h2 className="h4 mb-2">Ημερολόγιο Γυμναστηρίου</h2>
          <p className="text-muted mb-0">Διαχείριση συνδρομών</p>
        </div>
        <div className="mt-3 mt-md-0">
          <button 
            className="btn btn-primary d-flex align-items-center gap-2"
            onClick={() => setShowEventModal(true)}
          >
            <Plus size={18} />
            Προσθήκη Συμβάντος
          </button>
        </div>
        {/* <div className="btn-group mt-3 mt-md-0" role="group">
          <button 
            className={`btn ${view === Views.MONTH ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => setView(Views.MONTH)}
          >
            Μήνας
          </button>
          <button 
            className={`btn ${view === Views.WEEK ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => setView(Views.WEEK)}
          >
            Εβδομάδα
          </button>
          <button 
            className={`btn ${view === Views.DAY ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => setView(Views.DAY)}
          >
            Ημέρα
          </button>
        </div> */}
      </div>

      {/* Legend */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
        <div className="card-body">
              <h6 className="card-title mb-3">Υπόμνημα</h6>
              <div className="d-flex flex-wrap gap-3">
                <div className="d-flex align-items-center gap-2">
                  <div className="rounded" style={{ width: '16px', height: '16px', backgroundColor: '#dc3545' }}></div>
                  <small>Συνδρομές που λήγουν σήμερα</small>
          </div>
                <div className="d-flex align-items-center gap-2">
                  <div className="rounded" style={{ width: '16px', height: '16px', backgroundColor: '#fd7e14' }}></div>
                  <small>Συνδρομές που λήγουν σε 7 ημέρες</small>
              </div>
                <div className="d-flex align-items-center gap-2">
                  <div className="rounded" style={{ width: '16px', height: '16px', backgroundColor: '#28a745' }}></div>
                  <small>Συνδρομές που λήγουν στο μέλλον</small>
          </div>
                <div className="d-flex align-items-center gap-2">
                  <div className="rounded" style={{ width: '16px', height: '16px', backgroundColor: '#007bff' }}></div>
                  <small>Τάξεις</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
           <div style={{ height: '750px' }}>
            <BigCalendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              view={view}
              date={date}
              onNavigate={handleNavigate}
              onView={handleViewChange}
              onSelectEvent={handleSelectEvent}
              onSelectSlot={handleSelectSlot}
              selectable
              eventPropGetter={eventStyleGetter}
              components={{
                event: EventComponent
              }}
              views={[Views.MONTH, Views.WEEK, Views.DAY]}
              step={60}
              timeslots={1}
              culture="el"
              messages={{
                next: 'Επόμενο',
                previous: 'Προηγούμενο',
                today: 'Σήμερα',
                month: 'Μήνας',
                week: 'Εβδομάδα',
                day: 'Ημέρα',
                agenda: 'Ατζέντα',
                date: 'Ημερομηνία',
                time: 'Ώρα',
                event: 'Συμβάν',
                noEventsInRange: 'Δεν υπάρχουν συμβάντα σε αυτό το εύρος.',
                showMore: (total: number) => `+${total} περισσότερα`
              }}
            />
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="row mt-4">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <div className="text-danger fs-4 fw-bold">
                {events.filter(e => e.type === 'subscription_expiry' && moment(e.start).isSame(moment(), 'day')).length}
              </div>
              <small className="text-muted">Λήγουν σήμερα</small>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <div className="text-warning fs-4 fw-bold">
                {events.filter(e => e.type === 'subscription_expiry' && moment(e.start).isBetween(moment(), moment().add(3, 'days'), 'day', '[]')).length}
              </div>
              <small className="text-muted">Λήγουν σε 3 ημέρες</small>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <div className="text-info fs-4 fw-bold">
                {events.filter(e => e.type === 'class').length}
              </div>
              <small className="text-muted">Τάξεις αυτή την εβδομάδα</small>
            </div>
          </div>
        </div>
      </div>

      {/* Event Creation Modal */}
      {showEventModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Προσθήκη Νέου Συμβάντος</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={handleCloseModal}
                >
                  <X size={18} />
                </button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Τίτλος Συμβάντος</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newEvent.title}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="π.χ. Boxing Class, Λήξη Συνδρομής"
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Τύπος Συμβάντος</label>
                    <select
                      className="form-select"
                      value={newEvent.type}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, type: e.target.value as any }))}
                    >
                      <option value="class">Τάξη</option>
                      <option value="subscription_expiry">Λήξη Συνδρομής</option>
                      <option value="event">Γενικό Συμβάν</option>
                    </select>
                  </div>
                </div>

                {newEvent.type === 'subscription_expiry' && (
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Όνομα Μέλους</label>
                      <input
                        type="text"
                        className="form-control"
                        value={newEvent.memberName}
                        onChange={(e) => setNewEvent(prev => ({ ...prev, memberName: e.target.value }))}
                        placeholder="Όνομα μέλους"
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Τύπος Συνδρομής</label>
                      <select
                        className="form-select"
                        value={newEvent.subscriptionType}
                        onChange={(e) => setNewEvent(prev => ({ ...prev, subscriptionType: e.target.value }))}
                      >
                        <option value="">Επιλέξτε τύπο</option>
                        <option value="Μηνιαία">Μηνιαία</option>
                        <option value="Ετήσια">Ετήσια</option>
                        <option value="Τριμηνιαία">Τριμηνιαία</option>
                        <option value="Ωριαία">Ωριαία</option>
                      </select>
                    </div>
                  </div>
                )}

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Ημερομηνία & Ώρα Έναρξης</label>
                    <input
                      type="datetime-local"
                      className="form-control"
                      value={selectedSlot ? moment(selectedSlot.start).format('YYYY-MM-DDTHH:mm') : ''}
                      onChange={(e) => {
                        if (selectedSlot) {
                          const newStart = new Date(e.target.value);
                          const duration = selectedSlot.end.getTime() - selectedSlot.start.getTime();
                          setSelectedSlot({
                            start: newStart,
                            end: new Date(newStart.getTime() + duration)
                          });
                        }
                      }}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Ημερομηνία & Ώρα Λήξης</label>
                    <input
                      type="datetime-local"
                      className="form-control"
                      value={selectedSlot ? moment(selectedSlot.end).format('YYYY-MM-DDTHH:mm') : ''}
                      onChange={(e) => {
                        if (selectedSlot) {
                          setSelectedSlot({
                            ...selectedSlot,
                            end: new Date(e.target.value)
                          });
                        }
                      }}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Περιγραφή (Προαιρετικό)</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={newEvent.description}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Περιγραφή του συμβάντος..."
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={handleCloseModal}
                >
                  Ακύρωση
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={handleCreateEvent}
                  disabled={!newEvent.title.trim()}
                >
                  Δημιουργία Συμβάντος
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
