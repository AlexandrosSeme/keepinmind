import React, { useState, useEffect, useMemo } from 'react';
import moment from 'moment';
import { 
  Plus, 
  X, 
  Edit2, 
  Trash2, 
  User, 
  Clock, 
  Calendar as CalendarIcon,
  Users,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Search,
  Filter,
  Dumbbell,
  UserCheck
} from 'lucide-react';
import './Calendar.scss';
import { useAppData } from '../contexts/AppDataContext';
import { fetchBookings, createBooking, updateBooking, deleteBooking } from '../services/bookingService';
import type { Booking, BookingFormData } from '../types';

// Set moment locale to Greek
moment.locale('el');

// Time slots for the day (6:00 - 23:00)
const TIME_SLOTS = Array.from({ length: 18 }, (_, i) => {
  const hour = 6 + i;
  return {
    hour,
    label: `${hour.toString().padStart(2, '0')}:00`,
    value: hour
  };
});

// Days of the week
const DAYS_OF_WEEK = [
  { key: 0, label: 'Δευτέρα', short: 'Δευ' },
  { key: 1, label: 'Τρίτη', short: 'Τρί' },
  { key: 2, label: 'Τετάρτη', short: 'Τετ' },
  { key: 3, label: 'Πέμπτη', short: 'Πέμ' },
  { key: 4, label: 'Παρασκευή', short: 'Παρ' },
  { key: 5, label: 'Σάββατο', short: 'Σάβ' },
  { key: 6, label: 'Κυριακή', short: 'Κυρ' }
];

// Color mapping for booking types
const getBookingColor = (type: Booking['type']): string => {
  switch (type) {
    case 'class':
      return '#3b82f6'; // Blue
    case 'personal_training':
      return '#10b981'; // Green
    case 'appointment':
      return '#8b5cf6'; // Purple
    case 'event':
      return '#f59e0b'; // Orange
    default:
      return '#6b7280';
  }
};

// Type labels in Greek
const typeLabels: Record<Booking['type'], string> = {
  class: 'Τάξη',
  personal_training: 'Προσωπική Προπόνηση',
  appointment: 'Ραντεβού',
  event: 'Εκδήλωση'
};

const Calendar: React.FC = () => {
  const { members } = useAppData();
  const [currentWeek, setCurrentWeek] = useState(moment().startOf('week'));
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showBookingDetails, setShowBookingDetails] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ day: number; hour: number } | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<Booking['type'] | 'all'>('all');
  const [filterCoach, setFilterCoach] = useState<string>('all');

  const [formData, setFormData] = useState<BookingFormData>({
    memberId: null,
    title: '',
    description: '',
    type: 'class',
    startTime: new Date(),
    endTime: new Date(),
    instructor: '',
    maxParticipants: null,
    notes: ''
  });

  // Get unique coaches from bookings
  const coaches = useMemo(() => {
    const coachSet = new Set<string>();
    bookings.forEach(b => {
      if (b.instructor) coachSet.add(b.instructor);
    });
    return Array.from(coachSet).sort();
  }, [bookings]);

  // Load bookings for current week
  useEffect(() => {
    loadBookings();
  }, [currentWeek]);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const weekStart = currentWeek.clone().startOf('week').toDate();
      const weekEnd = currentWeek.clone().endOf('week').toDate();
      const fetchedBookings = await fetchBookings(weekStart, weekEnd);
      setBookings(fetchedBookings);
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get bookings for a specific day and hour
  const getBookingsForSlot = (day: number, hour: number): Booking[] => {
    const dayDate = currentWeek.clone().day(day);
    const slotStart = dayDate.clone().hour(hour).minute(0).second(0);
    const slotEnd = slotStart.clone().add(1, 'hour');

    return bookings
      .filter(booking => {
        if (filterType !== 'all' && booking.type !== filterType) return false;
        if (filterCoach !== 'all' && booking.instructor !== filterCoach) return false;
        if (searchTerm && !booking.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
            !booking.memberName.toLowerCase().includes(searchTerm.toLowerCase()) &&
            !(booking.instructor && booking.instructor.toLowerCase().includes(searchTerm.toLowerCase()))) {
          return false;
        }

        const bookingStart = moment(booking.startTime);
        const bookingEnd = moment(booking.endTime);
        
        // Check if booking overlaps with this time slot
        return bookingStart.isBefore(slotEnd) && bookingEnd.isAfter(slotStart);
      })
      .sort((a, b) => moment(a.startTime).diff(moment(b.startTime)));
  };

  const handleSlotClick = (day: number, hour: number) => {
    const dayDate = currentWeek.clone().day(day);
    const startTime = dayDate.clone().hour(hour).minute(0).second(0).toDate();
    const endTime = dayDate.clone().hour(hour + 1).minute(0).second(0).toDate();

    setSelectedSlot({ day, hour });
    setFormData(prev => ({
      ...prev,
      startTime: startTime,
      endTime: endTime
    }));
    setEditingBooking(null);
    setShowBookingModal(true);
  };

  const handleBookingClick = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowBookingDetails(true);
  };

  const handleCreateBooking = async () => {
    if (!formData.title.trim() || !formData.instructor.trim()) {
      alert('Παρακαλώ συμπληρώστε τίτλο και προπονητή');
      return;
    }

    try {
      const bookingData: Omit<Booking, 'id' | 'created_at' | 'updated_at'> = {
        memberId: formData.memberId || 0,
        memberName: formData.memberId 
          ? members.find(m => m.id === formData.memberId)?.name || 'Γενική Τάξη'
          : 'Γενική Τάξη',
        memberPhone: formData.memberId 
          ? members.find(m => m.id === formData.memberId)?.phone || undefined
          : undefined,
        title: formData.title,
        description: formData.description || undefined,
        type: formData.type,
        startTime: formData.startTime.toISOString(),
        endTime: formData.endTime.toISOString(),
        status: 'confirmed',
        instructor: formData.instructor,
        maxParticipants: formData.maxParticipants || undefined,
        color: getBookingColor(formData.type),
        notes: formData.notes || undefined
      };

      const newBooking = await createBooking(bookingData);
      if (newBooking) {
        await loadBookings();
        handleCloseModal();
      } else {
        alert('Σφάλμα κατά τη δημιουργία κράτησης');
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Σφάλμα κατά τη δημιουργία κράτησης');
    }
  };

  const handleUpdateBooking = async () => {
    if (!editingBooking || !formData.title.trim() || !formData.instructor.trim()) {
      return;
    }

    try {
      const updates: Partial<Booking> = {
        title: formData.title,
        description: formData.description || undefined,
        type: formData.type,
        startTime: formData.startTime.toISOString(),
        endTime: formData.endTime.toISOString(),
        instructor: formData.instructor,
        maxParticipants: formData.maxParticipants || undefined,
        notes: formData.notes || undefined,
        color: getBookingColor(formData.type)
      };

      if (formData.memberId) {
        const selectedMember = members.find(m => m.id === formData.memberId);
        if (selectedMember) {
          updates.memberId = selectedMember.id;
          updates.memberName = selectedMember.name;
          updates.memberPhone = selectedMember.phone;
        }
      }

      const updated = await updateBooking(editingBooking.id, updates);
      if (updated) {
        await loadBookings();
        handleCloseModal();
      } else {
        alert('Σφάλμα κατά την ενημέρωση κράτησης');
      }
    } catch (error) {
      console.error('Error updating booking:', error);
      alert('Σφάλμα κατά την ενημέρωση κράτησης');
    }
  };

  const handleDeleteBooking = async (bookingId: number) => {
    if (!confirm('Είστε σίγουροι ότι θέλετε να διαγράψετε αυτή την κράτηση;')) {
      return;
    }

    try {
      const success = await deleteBooking(bookingId);
      if (success) {
        await loadBookings();
        setShowBookingDetails(false);
        setSelectedBooking(null);
      } else {
        alert('Σφάλμα κατά τη διαγραφή κράτησης');
      }
    } catch (error) {
      console.error('Error deleting booking:', error);
      alert('Σφάλμα κατά τη διαγραφή κράτησης');
    }
  };

  const handleEditBooking = () => {
    if (!selectedBooking) return;
    
    setEditingBooking(selectedBooking);
    setFormData({
      memberId: selectedBooking.memberId || null,
      title: selectedBooking.title,
      description: selectedBooking.description || '',
      type: selectedBooking.type,
      startTime: new Date(selectedBooking.startTime),
      endTime: new Date(selectedBooking.endTime),
      instructor: selectedBooking.instructor || '',
      maxParticipants: selectedBooking.maxParticipants || null,
      notes: selectedBooking.notes || ''
    });
    setShowBookingDetails(false);
    setShowBookingModal(true);
  };

  const handleCloseModal = () => {
    setShowBookingModal(false);
    setShowBookingDetails(false);
    setSelectedSlot(null);
    setSelectedBooking(null);
    setEditingBooking(null);
    setFormData({
      memberId: null,
      title: '',
      description: '',
      type: 'class',
      startTime: new Date(),
      endTime: new Date(),
      instructor: '',
      maxParticipants: null,
      notes: ''
    });
  };

  const goToPreviousWeek = () => {
    setCurrentWeek(prev => prev.clone().subtract(1, 'week'));
  };

  const goToNextWeek = () => {
    setCurrentWeek(prev => prev.clone().add(1, 'week'));
  };

  const goToToday = () => {
    setCurrentWeek(moment().startOf('week'));
  };

  const stats = useMemo(() => {
    const today = moment().startOf('day');
    const thisWeek = currentWeek.clone().endOf('week');
    
    return {
      total: bookings.length,
      today: bookings.filter(b => moment(b.startTime).isSame(today, 'day')).length,
      thisWeek: bookings.filter(b => moment(b.startTime).isBetween(currentWeek.clone().startOf('week'), thisWeek, 'day', '[]')).length,
      coaches: coaches.length
    };
  }, [bookings, currentWeek, coaches]);

  return (
    <div className="schedule-container">
      {/* Header */}
      <div className="schedule-header">
        <div className="header-content">
          <div>
            <h2 className="page-title">Πρόγραμμα Προπονήσεων</h2>
            <p className="page-subtitle">Τάξεις & Προπονήσεις - Εβδομαδιαίο Πρόγραμμα</p>
          </div>
          <button 
            className="btn btn-primary btn-add-booking"
            onClick={() => {
              setSelectedSlot(null);
              setEditingBooking(null);
              setFormData({
                memberId: null,
                title: '',
                description: '',
                type: 'class',
                startTime: new Date(),
                endTime: moment().add(1, 'hour').toDate(),
                instructor: '',
                maxParticipants: null,
                notes: ''
              });
              setShowBookingModal(true);
            }}
          >
            <Plus size={20} />
            Νέα Τάξη/Προπόνηση
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon stat-icon-primary">
            <Dumbbell size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Σύνολο Προπονήσεων</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-success">
            <CheckCircle2 size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.today}</div>
            <div className="stat-label">Σήμερα</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-info">
            <CalendarIcon size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.thisWeek}</div>
            <div className="stat-label">Αυτή την Εβδομάδα</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-warning">
            <UserCheck size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.coaches}</div>
            <div className="stat-label">Προπονητές</div>
          </div>
        </div>
      </div>

      {/* Filters & Week Navigation */}
      <div className="schedule-controls">
        <div className="week-navigation">
          <button className="btn-nav" onClick={goToPreviousWeek}>
            <ChevronLeft size={20} />
          </button>
          <div className="week-display">
            <button className="btn-today" onClick={goToToday}>
              Σήμερα
            </button>
            <h3 className="week-title">
              {currentWeek.format('DD MMMM')} - {currentWeek.clone().endOf('week').format('DD MMMM YYYY')}
            </h3>
          </div>
          <button className="btn-nav" onClick={goToNextWeek}>
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="filters-section">
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Αναζήτηση τάξης, προπονητή ή μέλους..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="filter-group">
            <Filter size={18} />
            <select
              className="filter-select"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
            >
              <option value="all">Όλοι οι τύποι</option>
              <option value="class">Τάξη</option>
              <option value="personal_training">Προσωπική Προπόνηση</option>
              <option value="appointment">Ραντεβού</option>
              <option value="event">Εκδήλωση</option>
            </select>
            <select
              className="filter-select"
              value={filterCoach}
              onChange={(e) => setFilterCoach(e.target.value)}
            >
              <option value="all">Όλοι οι προπονητές</option>
              {coaches.map(coach => (
                <option key={coach} value={coach}>{coach}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Schedule Grid */}
      <div className="schedule-grid-container">
        {loading ? (
          <div className="loading-overlay">
            <Loader2 size={32} className="spinner" />
            <p>Φόρτωση προγράμματος...</p>
          </div>
        ) : (
          <div className="schedule-grid">
            {/* Time column header */}
            <div className="time-header"></div>
            
            {/* Day headers */}
            {DAYS_OF_WEEK.map(day => {
              const dayDate = currentWeek.clone().day(day.key);
              const isToday = dayDate.isSame(moment(), 'day');
              
              return (
                <div key={day.key} className={`day-header ${isToday ? 'today' : ''}`}>
                  <div className="day-name">{day.label}</div>
                  <div className="day-date">{dayDate.format('DD/MM')}</div>
                </div>
              );
            })}

            {/* Time slots */}
            {TIME_SLOTS.map((timeSlot, slotIndex) => (
              <React.Fragment key={timeSlot.hour}>
                {/* Time label */}
                <div className="time-slot-label">
                  <span>{timeSlot.label}</span>
                </div>

                {/* Day columns */}
                {DAYS_OF_WEEK.map(day => {
                  const slotBookings = getBookingsForSlot(day.key, timeSlot.hour);
                  
                  return (
                    <div
                      key={`${day.key}-${timeSlot.hour}`}
                      className="schedule-cell"
                      onClick={() => handleSlotClick(day.key, timeSlot.hour)}
                    >
                      {slotBookings.map(booking => (
                        <div
                          key={booking.id}
                          className="booking-card"
                          style={{ 
                            backgroundColor: booking.color || getBookingColor(booking.type),
                            borderLeft: `4px solid ${booking.color || getBookingColor(booking.type)}`
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBookingClick(booking);
                          }}
                        >
                          <div className="booking-title">{booking.title}</div>
                          {booking.instructor && (
                            <div className="booking-coach">
                              <User size={12} />
                              {booking.instructor}
                            </div>
                          )}
                          {booking.memberName && booking.memberName !== 'Γενική Τάξη' && (
                            <div className="booking-member">
                              <Users size={12} />
                              {booking.memberName}
                            </div>
                          )}
                          <div className="booking-time">
                            {moment(booking.startTime).format('HH:mm')} - {moment(booking.endTime).format('HH:mm')}
                          </div>
                        </div>
                      ))}
                      {slotBookings.length === 0 && (
                        <div className="empty-slot">
                          <Plus size={16} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingBooking ? 'Επεξεργασία Προπόνησης' : 'Νέα Τάξη/Προπόνηση'}</h3>
              <button className="modal-close" onClick={handleCloseModal}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">
                  <Dumbbell size={16} />
                  Τίτλος Τάξης/Προπόνησης <span className="required">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="π.χ. Boxing Class, Muay Thai, Προσωπική Προπόνηση"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">
                    <UserCheck size={16} />
                    Προπονητής <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.instructor}
                    onChange={(e) => setFormData(prev => ({ ...prev, instructor: e.target.value }))}
                    placeholder="Όνομα προπονητή"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <Filter size={16} />
                    Τύπος
                  </label>
                  <select
                    className="form-control"
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                  >
                    <option value="class">Τάξη</option>
                    <option value="personal_training">Προσωπική Προπόνηση</option>
                    <option value="appointment">Ραντεβού</option>
                    <option value="event">Εκδήλωση</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">
                    <Clock size={16} />
                    Έναρξη <span className="required">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    className="form-control"
                    value={moment(formData.startTime).format('YYYY-MM-DDTHH:mm')}
                    onChange={(e) => {
                      const newStart = new Date(e.target.value);
                      const duration = formData.endTime.getTime() - formData.startTime.getTime();
                      setFormData(prev => ({
                        ...prev,
                        startTime: newStart,
                        endTime: new Date(newStart.getTime() + duration)
                      }));
                    }}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <Clock size={16} />
                    Λήξη <span className="required">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    className="form-control"
                    value={moment(formData.endTime).format('YYYY-MM-DDTHH:mm')}
                    onChange={(e) => setFormData(prev => ({ ...prev, endTime: new Date(e.target.value) }))}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">
                    <User size={16} />
                    Μέλος (Προαιρετικό)
                  </label>
                  <select
                    className="form-control"
                    value={formData.memberId || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, memberId: parseInt(e.target.value) || null }))}
                  >
                    <option value="">Γενική Τάξη (Χωρίς συγκεκριμένο μέλος)</option>
                    {members.map(member => (
                      <option key={member.id} value={member.id}>
                        {member.name} {member.status === 'active' ? '✓' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <Users size={16} />
                    Μέγιστος Αριθμός Συμμετεχόντων
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.maxParticipants || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxParticipants: parseInt(e.target.value) || null }))}
                    placeholder="Απεριόριστο"
                    min="1"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Περιγραφή</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Περιγραφή της τάξης/προπόνησης..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">Σημειώσεις</label>
                <textarea
                  className="form-control"
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Εσωτερικές σημειώσεις..."
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={handleCloseModal}>
                Ακύρωση
              </button>
              <button 
                className="btn btn-primary" 
                onClick={editingBooking ? handleUpdateBooking : handleCreateBooking}
                disabled={!formData.title.trim() || !formData.instructor.trim()}
              >
                {editingBooking ? 'Αποθήκευση' : 'Δημιουργία'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Booking Details Modal */}
      {showBookingDetails && selectedBooking && (
        <div className="modal-overlay" onClick={() => setShowBookingDetails(false)}>
          <div className="modal-content modal-content-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedBooking.title}</h3>
              <button className="modal-close" onClick={() => setShowBookingDetails(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="booking-details">
                {selectedBooking.instructor && (
                  <div className="detail-item highlight">
                    <div className="detail-label">
                      <UserCheck size={18} />
                      Προπονητής
                    </div>
                    <div className="detail-value coach-name">{selectedBooking.instructor}</div>
                  </div>
                )}

                <div className="detail-item">
                  <div className="detail-label">
                    <Filter size={18} />
                    Τύπος
                  </div>
                  <div className="detail-value">
                    <span className="badge badge-type">{typeLabels[selectedBooking.type]}</span>
                  </div>
                </div>

                <div className="detail-item">
                  <div className="detail-label">
                    <Clock size={18} />
                    Ημερομηνία & Ώρα
                  </div>
                  <div className="detail-value">
                    {moment(selectedBooking.startTime).format('dddd, DD MMMM YYYY')}
                    <br />
                    <small>{moment(selectedBooking.startTime).format('HH:mm')} - {moment(selectedBooking.endTime).format('HH:mm')}</small>
                  </div>
                </div>

                {selectedBooking.memberName && selectedBooking.memberName !== 'Γενική Τάξη' && (
                  <div className="detail-item">
                    <div className="detail-label">
                      <User size={18} />
                      Μέλος
                    </div>
                    <div className="detail-value">{selectedBooking.memberName}</div>
                  </div>
                )}

                {selectedBooking.maxParticipants && (
                  <div className="detail-item">
                    <div className="detail-label">
                      <Users size={18} />
                      Συμμετέχοντες
                    </div>
                    <div className="detail-value">
                      {selectedBooking.currentParticipants || 0} / {selectedBooking.maxParticipants}
                    </div>
                  </div>
                )}

                {selectedBooking.description && (
                  <div className="detail-item">
                    <div className="detail-label">Περιγραφή</div>
                    <div className="detail-value">{selectedBooking.description}</div>
                  </div>
                )}

                {selectedBooking.notes && (
                  <div className="detail-item">
                    <div className="detail-label">Σημειώσεις</div>
                    <div className="detail-value">{selectedBooking.notes}</div>
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-danger" onClick={() => handleDeleteBooking(selectedBooking.id)}>
                <Trash2 size={18} />
                Διαγραφή
              </button>
              <button className="btn btn-secondary" onClick={() => setShowBookingDetails(false)}>
                Κλείσιμο
              </button>
              <button className="btn btn-primary" onClick={handleEditBooking}>
                <Edit2 size={18} />
                Επεξεργασία
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
