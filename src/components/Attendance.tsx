import React, { useState } from 'react';
import { CheckCircle, XCircle, Clock, Plus, Search, UserCheck, UserX } from 'lucide-react';
import type { Program, AttendanceRecord, Member } from '../types';
import moment from 'moment';

moment.locale('el');

const Attendance: React.FC = () => {
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'attended' | 'absent' | 'cancelled'>('all');

  // Dummy data - Programs
  const [programs] = useState<Program[]>([
    {
      id: 1,
      title: 'Boxing Class',
      date: '2025-10-15',
      time: '18:00',
      type: 'Τάξη',
      instructor: 'Γιάννης Παπαδόπουλος',
      maxParticipants: 20,
    },
    {
      id: 2,
      title: 'Muay Thai',
      date: '2025-10-15',
      time: '19:30',
      type: 'Τάξη',
      instructor: 'Μαρία Κωνσταντίνου',
      maxParticipants: 15,
    },
    {
      id: 3,
      title: 'MMA Training',
      date: '2025-10-16',
      time: '20:00',
      type: 'Προπόνηση',
      instructor: 'Νίκος Αντωνίου',
      maxParticipants: 12,
    },
    {
      id: 4,
      title: 'Boxing Class',
      date: '2025-10-17',
      time: '18:00',
      type: 'Τάξη',
      instructor: 'Γιάννης Παπαδόπουλος',
      maxParticipants: 20,
    },
    {
      id: 5,
      title: 'Personal Training - Ελένη Δημητρίου',
      date: '2025-10-18',
      time: '10:00',
      type: 'Προσωπική Προπόνηση',
      instructor: 'Κώστας Γεωργίου',
      maxParticipants: 1,
    },
  ]);

  // Dummy data - Members
  const [members] = useState<Member[]>([
    { id: 1, name: 'Νίκος Παπαδόπουλος', phone: '6912345678', status: 'active', expiry: '15/11/2025', package: 'Μηνιαία Απεριόριστη' },
    { id: 2, name: 'Μαρία Γεωργίου', phone: '6923456789', status: 'active', expiry: '20/10/2025', package: 'Ετήσια' },
    { id: 3, name: 'Γιώργος Κωνσταντίνου', phone: '6934567890', status: 'active', expiry: '05/10/2025', package: 'Ωριαία (10 ώρες)' },
    { id: 4, name: 'Ελένη Δημητρίου', phone: '6945678901', status: 'active', expiry: '30/12/2025', package: 'Μηνιαία Απεριόριστη' },
    { id: 5, name: 'Κώστας Αθανασίου', phone: '6956789012', status: 'active', expiry: '22/10/2025', package: 'Μηνιαία' },
    { id: 6, name: 'Σοφία Νικολάου', phone: '6967890123', status: 'active', expiry: '25/10/2025', package: 'Ωριαία' },
    { id: 7, name: 'Αντώνης Μιχαηλίδης', phone: '6978901234', status: 'active', expiry: '18/11/2025', package: 'Ετήσια' },
    { id: 8, name: 'Κατερίνα Παυλίδου', phone: '6989012345', status: 'active', expiry: '12/10/2025', package: 'Μηνιαία' },
  ]);

  // Dummy data - Attendance Records
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([
    { id: 1, programId: 1, memberId: 1, memberName: 'Νίκος Παπαδόπουλος', status: 'attended', recordedAt: '2025-10-15T18:05:00', notes: '' },
    { id: 2, programId: 1, memberId: 2, memberName: 'Μαρία Γεωργίου', status: 'attended', recordedAt: '2025-10-15T18:03:00', notes: '' },
    { id: 3, programId: 1, memberId: 3, memberName: 'Γιώργος Κωνσταντίνου', status: 'absent', recordedAt: '2025-10-15T18:15:00', notes: 'Δεν εμφανίστηκε' },
    { id: 4, programId: 1, memberId: 4, memberName: 'Ελένη Δημητρίου', status: 'attended', recordedAt: '2025-10-15T18:02:00', notes: '' },
    { id: 5, programId: 2, memberId: 5, memberName: 'Κώστας Αθανασίου', status: 'attended', recordedAt: '2025-10-15T19:32:00', notes: '' },
    { id: 6, programId: 2, memberId: 6, memberName: 'Σοφία Νικολάου', status: 'attended', recordedAt: '2025-10-15T19:30:00', notes: '' },
    { id: 7, programId: 2, memberId: 7, memberName: 'Αντώνης Μιχαηλίδης', status: 'absent', recordedAt: '2025-10-15T19:45:00', notes: 'Ακύρωσε τελευταία στιγμή' },
    { id: 8, programId: 3, memberId: 1, memberName: 'Νίκος Παπαδόπουλος', status: 'attended', recordedAt: '2025-10-16T20:01:00', notes: '' },
    { id: 9, programId: 3, memberId: 3, memberName: 'Γιώργος Κωνσταντίνου', status: 'attended', recordedAt: '2025-10-16T20:00:00', notes: '' },
    { id: 10, programId: 3, memberId: 8, memberName: 'Κατερίνα Παυλίδου', status: 'cancelled', recordedAt: '2025-10-16T19:30:00', notes: 'Ακύρωση από μέλος' },
  ]);

  const handleSelectProgram = (program: Program) => {
    setSelectedProgram(program);
    setShowRecordModal(true);
  };

  const handleRecordAttendance = (memberId: number, status: 'attended' | 'absent' | 'cancelled', notes?: string) => {
    if (!selectedProgram) return;

    const member = members.find(m => m.id === memberId);
    if (!member) return;

    // Check if record already exists
    const existingRecord = attendanceRecords.find(
      r => r.programId === selectedProgram.id && r.memberId === memberId
    );

    if (existingRecord) {
      // Update existing record
      setAttendanceRecords(prev =>
        prev.map(r =>
          r.id === existingRecord.id
            ? { ...r, status, notes: notes || '', recordedAt: new Date().toISOString() }
            : r
        )
      );
    } else {
      // Create new record
      const newRecord: AttendanceRecord = {
        id: attendanceRecords.length + 1,
        programId: selectedProgram.id,
        memberId,
        memberName: member.name,
        status,
        recordedAt: new Date().toISOString(),
        notes: notes || '',
      };
      setAttendanceRecords(prev => [...prev, newRecord]);
    }
  };

  const getProgramAttendance = (programId: number) => {
    return attendanceRecords.filter(r => r.programId === programId);
  };

  const getAttendanceStats = (programId: number) => {
    const records = getProgramAttendance(programId);
    return {
      attended: records.filter(r => r.status === 'attended').length,
      absent: records.filter(r => r.status === 'absent').length,
      cancelled: records.filter(r => r.status === 'cancelled').length,
      total: records.length,
    };
  };

  const filteredPrograms = programs.filter(program => {
    const matchesSearch = program.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         program.instructor?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const filteredRecords = attendanceRecords.filter(record => {
    const matchesSearch = record.memberName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || record.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'attended':
        return <CheckCircle size={18} className="text-success" />;
      case 'absent':
        return <XCircle size={18} className="text-danger" />;
      case 'cancelled':
        return <Clock size={18} className="text-warning" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'attended':
        return 'Παρέστη';
      case 'absent':
        return 'Απουσία';
      case 'cancelled':
        return 'Ακυρώθηκε';
      default:
        return status;
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between mb-4">
        <div>
          <h2 className="h4 mb-2">Καταγραφή Προσέλευσης</h2>
          <p className="text-muted mb-0">Διαχείριση προσέλευσης σε προγράμματα και ραντεβού</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="row mb-4">
        <div className="col-md-6 mb-3 mb-md-0">
          <div className="input-group">
            <span className="input-group-text">
              <Search size={18} />
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Αναζήτηση προγράμματος ή μέλους..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="col-md-3">
          <select
            className="form-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
          >
            <option value="all">Όλες οι καταστάσεις</option>
            <option value="attended">Παρέστη</option>
            <option value="absent">Απουσία</option>
            <option value="cancelled">Ακυρώθηκε</option>
          </select>
        </div>
      </div>

      {/* Programs List */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white">
              <h5 className="mb-0">Προγράμματα & Ραντεβού</h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Ημερομηνία</th>
                      <th>Ώρα</th>
                      <th>Πρόγραμμα</th>
                      <th>Τύπος</th>
                      <th>Εκπαιδευτής</th>
                      <th>Στατιστικά</th>
                      <th>Ενέργειες</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPrograms.map(program => {
                      const stats = getAttendanceStats(program.id);
                      return (
                        <tr key={program.id}>
                          <td>{moment(program.date).format('DD/MM/YYYY')}</td>
                          <td>{program.time}</td>
                          <td className="fw-semibold">{program.title}</td>
                          <td>
                            <span className="badge bg-info">{program.type}</span>
                          </td>
                          <td>{program.instructor || '-'}</td>
                          <td>
                            <div className="d-flex gap-2 align-items-center">
                              <small className="text-success">
                                <UserCheck size={14} className="me-1" />
                                {stats.attended}
                              </small>
                              <small className="text-danger">
                                <UserX size={14} className="me-1" />
                                {stats.absent}
                              </small>
                              {stats.cancelled > 0 && (
                                <small className="text-warning">
                                  <Clock size={14} className="me-1" />
                                  {stats.cancelled}
                                </small>
                              )}
                            </div>
                          </td>
                          <td>
                            <button
                              className="btn btn-sm btn-primary"
                              onClick={() => handleSelectProgram(program)}
                            >
                              <Plus size={14} className="me-1" />
                              Καταγραφή
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Records */}
      <div className="row">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white">
              <h5 className="mb-0">Καταγραφές Προσέλευσης</h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Ημερομηνία</th>
                      <th>Πρόγραμμα</th>
                      <th>Μέλος</th>
                      <th>Κατάσταση</th>
                      <th>Ημερομηνία Καταγραφής</th>
                      <th>Σημειώσεις</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecords.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center text-muted py-4">
                          Δεν βρέθηκαν καταγραφές
                        </td>
                      </tr>
                    ) : (
                      filteredRecords.map(record => {
                        const program = programs.find(p => p.id === record.programId);
                        return (
                          <tr key={record.id}>
                            <td>
                              {program && `${moment(program.date).format('DD/MM/YYYY')} ${program.time}`}
                            </td>
                            <td className="fw-semibold">{program?.title || '-'}</td>
                            <td>{record.memberName}</td>
                            <td>
                              <div className="d-flex align-items-center gap-2">
                                {getStatusIcon(record.status)}
                                <span>{getStatusText(record.status)}</span>
                              </div>
                            </td>
                            <td>{moment(record.recordedAt).format('DD/MM/YYYY HH:mm')}</td>
                            <td>
                              <small className="text-muted">{record.notes || '-'}</small>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Record Attendance Modal */}
      {showRecordModal && selectedProgram && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  Καταγραφή Προσέλευσης - {selectedProgram.title}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowRecordModal(false);
                    setSelectedProgram(null);
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <p className="mb-1">
                    <strong>Ημερομηνία:</strong> {moment(selectedProgram.date).format('DD/MM/YYYY')}
                  </p>
                  <p className="mb-1">
                    <strong>Ώρα:</strong> {selectedProgram.time}
                  </p>
                  <p className="mb-0">
                    <strong>Εκπαιδευτής:</strong> {selectedProgram.instructor || '-'}
                  </p>
                </div>

                <hr />

                <h6 className="mb-3">Μέλη</h6>
                <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Όνομα</th>
                        <th>Τηλέφωνο</th>
                        <th>Κατάσταση</th>
                        <th>Ενέργειες</th>
                      </tr>
                    </thead>
                    <tbody>
                      {members.map(member => {
                        const existingRecord = attendanceRecords.find(
                          r => r.programId === selectedProgram.id && r.memberId === member.id
                        );
                        return (
                          <tr key={member.id}>
                            <td>{member.name}</td>
                            <td>{member.phone}</td>
                            <td>
                              {existingRecord ? (
                                <div className="d-flex align-items-center gap-2">
                                  {getStatusIcon(existingRecord.status)}
                                  <span>{getStatusText(existingRecord.status)}</span>
                                </div>
                              ) : (
                                <span className="text-muted">-</span>
                              )}
                            </td>
                            <td>
                              <div className="btn-group btn-group-sm" role="group">
                                <button
                                  className="btn btn-outline-success"
                                  onClick={() => handleRecordAttendance(member.id, 'attended')}
                                  title="Παρέστη"
                                >
                                  <CheckCircle size={16} />
                                </button>
                                <button
                                  className="btn btn-outline-danger"
                                  onClick={() => handleRecordAttendance(member.id, 'absent')}
                                  title="Απουσία"
                                >
                                  <XCircle size={16} />
                                </button>
                                <button
                                  className="btn btn-outline-warning"
                                  onClick={() => handleRecordAttendance(member.id, 'cancelled')}
                                  title="Ακυρώθηκε"
                                >
                                  <Clock size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowRecordModal(false);
                    setSelectedProgram(null);
                  }}
                >
                  Κλείσιμο
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;

