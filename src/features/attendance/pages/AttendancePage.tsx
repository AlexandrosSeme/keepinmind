import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Plus, Search, UserCheck, UserX, Filter, Calendar, Users, CalendarDays, QrCode, LogIn, RefreshCw } from 'lucide-react';
import type { Program, AttendanceRecord, EntranceLog } from '../types';
import moment from 'moment';
import { getEntranceLogs } from '../services/entranceLogService';
import { useAppData } from '../contexts/AppDataContext';
import StatusBadge from './ui/StatusBadge';


moment.locale('el');

const Attendance: React.FC = () => {
  const { members } = useAppData();
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'attended' | 'absent' | 'cancelled'>('all');
  const [filterCategory, setFilterCategory] = useState<'all' | 'group' | 'program' | 'appointment'>('all');
  const [activeTab, setActiveTab] = useState<'programs' | 'entrance'>('programs');
  const [entranceLogs, setEntranceLogs] = useState<EntranceLog[]>([]);

  // Programs with categories
  const [programs] = useState<Program[]>([
    {
      id: 1,
      title: 'Boxing Class',
      date: '2025-10-15',
      time: '18:00',
      type: 'class',
      instructor: 'Γιαννης Παπαδοπουλος',
      maxParticipants: 20,
    },
    {
      id: 2,
      title: 'Muay Thai',
      date: '2025-10-15',
      time: '19:30',
      type: 'class',
      instructor: 'Μαρια Κωνσταντινου',
      maxParticipants: 15,
    },
    {
      id: 3,
      title: 'MMA Training',
      date: '2025-10-16',
      time: '20:00',
      type: 'program',
      instructor: 'Νικος Αντωνιου',
      maxParticipants: 12,
    },
    {
      id: 4,
      title: 'Boxing Class',
      date: '2025-10-17',
      time: '18:00',
      type: 'class',
      instructor: 'Γιαννης Παπαδοπουλος',
      maxParticipants: 20,
    },
    {
      id: 5,
      title: 'Personal Training - Ελενη Δημητριου',
      date: '2025-10-18',
      time: '10:00',
      type: 'appointment',
      instructor: 'Κωστας Γεωργιου',
      maxParticipants: 1,
    },
    {
      id: 6,
      title: 'Group Training - Advanced',
      date: '2025-10-19',
      time: '17:00',
      type: 'group',
      instructor: 'Μαρια Κωνσταντινου',
      maxParticipants: 10,
    },
  ]);

  // Dummy data - Attendance Records
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([
    { id: 1, programId: 1, memberId: 1, memberName: 'Νικος Παπαδοπουλος', status: 'attended', recordedAt: '2025-10-15T18:05:00', notes: '' },
    { id: 2, programId: 1, memberId: 2, memberName: 'Μαρια Γεωργιου', status: 'attended', recordedAt: '2025-10-15T18:03:00', notes: '' },
    { id: 3, programId: 1, memberId: 3, memberName: 'Γιωργος Κωνσταντινου', status: 'absent', recordedAt: '2025-10-15T18:15:00', notes: 'Δεν εμφανιστηκε' },
    { id: 4, programId: 1, memberId: 4, memberName: 'Ελενη Δημητριου', status: 'attended', recordedAt: '2025-10-15T18:02:00', notes: '' },
    { id: 5, programId: 2, memberId: 5, memberName: 'Κωστας Αθανασιου', status: 'attended', recordedAt: '2025-10-15T19:32:00', notes: '' },
    { id: 6, programId: 2, memberId: 6, memberName: 'Σοφια Νικολαου', status: 'attended', recordedAt: '2025-10-15T19:30:00', notes: '' },
    { id: 7, programId: 2, memberId: 7, memberName: 'Αντωνης Μιχαηλιδης', status: 'absent', recordedAt: '2025-10-15T19:45:00', notes: 'Ακυρωσε τελευταια στιγμη' },
    { id: 8, programId: 3, memberId: 1, memberName: 'Νικος Παπαδοπουλος', status: 'attended', recordedAt: '2025-10-16T20:01:00', notes: '' },
    { id: 9, programId: 3, memberId: 3, memberName: 'Γιωργος Κωνσταντινου', status: 'attended', recordedAt: '2025-10-16T20:00:00', notes: '' },
    { id: 10, programId: 3, memberId: 8, memberName: 'Κατερινα Παυλιδου', status: 'cancelled', recordedAt: '2025-10-16T19:30:00', notes: 'Ακυρωση απο μελος' },
  ]);

  useEffect(() => {
    // Only load logs when entrance tab is active
    if (activeTab !== 'entrance') return;

    // Load entrance logs once when tab becomes active
    const loadLogs = async () => {
      try {
        const logs = await getEntranceLogs();
        setEntranceLogs(logs);
      } catch (error) {
        console.error('[Attendance] Error loading entrance logs:', error);
      }
    };
    
    loadLogs();
  }, [activeTab]);

  const handleSelectProgram = (program: Program) => {
    setSelectedProgram(program);
    setShowRecordModal(true);
  };

  const handleRecordAttendance = (memberId: number, status: 'attended' | 'absent' | 'cancelled', notes?: string) => {
    if (!selectedProgram) return;

    const member = members.find(m => m.id === memberId) || 
                   { id: memberId, name: 'Unknown', phone: '', status: 'active' as const, expiry: '', package: '' };
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

  const getCategoryIcon = (type: string) => {
    switch (type) {
      case 'group': return <Users size={16} />;
      case 'program': return <Calendar size={16} />;
      case 'appointment': return <CalendarDays size={16} />;
      case 'class': return <UserCheck size={16} />;
      default: return <Calendar size={16} />;
    }
  };

  const filteredPrograms = programs.filter(program => {
    const matchesSearch = program.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         program.instructor?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || program.type === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredRecords = attendanceRecords.filter(record => {
    const matchesSearch = record.memberName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || record.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const filteredEntranceLogs = entranceLogs.filter(log => {
    const matchesSearch = log.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.memberPhone.includes(searchTerm);
    return matchesSearch;
  });

  return (
    <div>
      {/* Header */}
      <div className="km-page-header">
        <div>
          <h2 className="km-page-title">Προσελευση</h2>
          <p className="km-page-subtitle">Διαχειριση προσελευσης σε προγραμματα και καταγραφη εισοδων</p>
        </div>
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4" role="tablist">
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${activeTab === 'programs' ? 'active' : ''}`}
            onClick={() => setActiveTab('programs')}
          >
            <Calendar className="me-2" size={18} />
            Προγραμματα & Ραντεβου
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${activeTab === 'entrance' ? 'active' : ''}`}
            onClick={() => setActiveTab('entrance')}
          >
            <LogIn className="me-2" size={18} />
            Logs Εισοδων
            {entranceLogs.length > 0 && (
              <StatusBadge tone="brand" label={entranceLogs.length} className="ms-2" showDot={false} />
            )}
          </button>
        </li>
      </ul>

      {/* Search and Filter */}
      <div className="card border-0 shadow-sm mb-4 km-toolbar-card">
        <div className="card-body">
          <div className="row g-3">
            <div className={activeTab === 'programs' ? 'col-md-6' : 'col-12'}>
              <div className="position-relative">
                <Search
                  size={16}
                  className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"
                />
                <input
                  type="text"
                  className="form-control ps-5"
                  placeholder="Αναζητηση..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            {activeTab === 'programs' && (
              <>
                <div className="col-md-3">
                  <div className="input-group">
                    <span className="input-group-text">
                      <Filter size={18} />
                    </span>
                    <select
                      className="form-select"
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value as 'all' | 'group' | 'program' | 'appointment')}
                    >
                      <option value="all">Ολες οι κατηγοριες</option>
                      <option value="group">Ομαδικα</option>
                      <option value="program">Προγραμματα</option>
                      <option value="appointment">Ραντεβου</option>
                      <option value="class">Ταξεις</option>
                    </select>
                  </div>
                </div>
                <div className="col-md-3">
                  <select
                    className="form-select"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as 'all' | 'attended' | 'absent' | 'cancelled')}
                  >
                    <option value="all">Ολες οι καταστασεις</option>
                    <option value="attended">Παρεστη</option>
                    <option value="absent">Απουσια</option>
                    <option value="cancelled">Ακυρωθηκε</option>
                  </select>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Programs Tab */}
      {activeTab === 'programs' && (
        <>
          {/* Programs List */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="card border-0 shadow-sm km-table-card">
                <div className="card-header border-0 py-3 d-flex justify-content-between align-items-center border-0">
                  <h5 className="mb-0">Προγραμματα & Ραντεβου</h5>
                  <StatusBadge
                    tone="neutral"
                    label={`${filteredPrograms.length} προγραμματα`}
                    showDot={false}
                  />
                </div>
                <div className="card-body p-0">
                  <div className="table-responsive">
                    <table className="table table-hover mb-0 km-table">
                      <thead className="table-light">
                        <tr>
                          <th className="border-0 ps-4">Ημερομηνια</th>
                          <th className="border-0">Ωρα</th>
                          <th className="border-0">Προγραμμα</th>
                          <th className="border-0">Κατηγορια</th>
                          <th className="border-0">Εκπαιδευτης</th>
                          <th className="border-0">Στατιστικα</th>
                          <th className="border-0 pe-4">Ενεργειες</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPrograms.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="text-center text-muted py-4">
                              Δεν βρεθηκαν προγραμματα
                            </td>
                          </tr>
                        ) : (
                          filteredPrograms.map(program => {
                            const stats = getAttendanceStats(program.id);
                            return (
                              <tr key={program.id}>
                                <td className="ps-4">{moment(program.date).format('DD/MM/YYYY')}</td>
                                <td>{program.time}</td>
                                <td className="fw-semibold">{program.title}</td>
                                <td>
                                  <StatusBadge
                                    status={program.type}
                                    icon={getCategoryIcon(program.type)}
                                    showDot={false}
                                  />
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
                                <td className="pe-4">
                                  <button
                                    className="btn btn-sm btn-primary"
                                    onClick={() => handleSelectProgram(program)}
                                  >
                                    <Plus size={14} className="me-1" />
                                    Καταγραφη
                                  </button>
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

          {/* Attendance Records */}
          <div className="row">
            <div className="col-12">
              <div className="card border-0 shadow-sm km-table-card">
                <div className="card-header border-0 py-3">
                  <h5 className="mb-0">Καταγραφες Προσελευσης</h5>
                </div>
                <div className="card-body p-0">
                  <div className="table-responsive">
                    <table className="table table-hover mb-0 km-table">
                      <thead className="table-light">
                        <tr>
                          <th className="border-0 ps-4">Ημερομηνια</th>
                          <th className="border-0">Προγραμμα</th>
                          <th className="border-0">Μελος</th>
                          <th className="border-0">Κατασταση</th>
                          <th className="border-0">Ημερομηνια Καταγραφης</th>
                          <th className="border-0 pe-4">Σημειωσεις</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRecords.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="text-center text-muted py-4">
                              Δεν βρεθηκαν καταγραφες
                            </td>
                          </tr>
                        ) : (
                          filteredRecords.map(record => {
                            const program = programs.find(p => p.id === record.programId);
                            return (
                              <tr key={record.id}>
                                <td className="ps-4">
                                  {program && `${moment(program.date).format('DD/MM/YYYY')} ${program.time}`}
                                </td>
                                <td className="fw-semibold">{program?.title || '-'}</td>
                                <td>{record.memberName}</td>
                                <td>
                                  <StatusBadge status={record.status} />
                                </td>
                                <td>{moment(record.recordedAt).format('DD/MM/YYYY HH:mm')}</td>
                                <td className="pe-4">
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
        </>
      )}

      {/* Entrance Logs Tab */}
      {activeTab === 'entrance' && (
        <div className="row">
          <div className="col-12">
            <div className="card border-0 shadow-sm km-table-card">
              <div className="card-header border-0 py-3 d-flex justify-content-between align-items-center border-0">
                <h5 className="mb-0">Logs Εισοδων</h5>
                <div className="d-flex gap-2 align-items-center flex-wrap">
                  <button
                    className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
                    onClick={async () => {
                      const logs = await getEntranceLogs();
                      setEntranceLogs(logs);
                    }}
                    title="Ανανεωση logs"
                  >
                    <RefreshCw size={16} />
                  </button>
                  <StatusBadge
                    tone="success"
                    label={`${entranceLogs.filter(l => l.validationStatus === 'valid').length} Εγκυρες`}
                    showDot={false}
                  />
                  <StatusBadge
                    tone="danger"
                    label={`${entranceLogs.filter(l => l.validationStatus === 'invalid').length} Μη Εγκυρες`}
                    showDot={false}
                  />
                  <StatusBadge
                    tone="warning"
                    label={`${entranceLogs.filter(l => l.validationStatus === 'expiring_soon').length} Ληγουν Συντομα`}
                    showDot={false}
                  />
                </div>
              </div>
              <div className="card-body p-0">
                {filteredEntranceLogs.length === 0 ? (
                  <div className="text-center text-muted py-5">
                    <QrCode size={48} className="mb-3 opacity-50" />
                    <p>Δεν υπαρχουν logs εισοδων</p>
                    <small>Οι εισοδοι απο QR scanner θα εμφανιζονται εδω</small>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover mb-0 km-table">
                      <thead className="table-light">
                        <tr>
                          <th className="border-0 ps-4">Ημερομηνια/Ωρα</th>
                          <th className="border-0">Μελος</th>
                          <th className="border-0">Τηλεφωνο</th>
                          <th className="border-0">Κατασταση Συνδρομης</th>
                          <th className="border-0">Επικυρωση</th>
                          <th className="border-0">Τυπος</th>
                          <th className="border-0 pe-4">Μηνυμα</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredEntranceLogs.map(log => (
                          <tr key={log.id}>
                            <td className="ps-4">{moment(log.timestamp).format('DD/MM/YYYY HH:mm:ss')}</td>
                            <td className="fw-semibold">{log.memberName}</td>
                            <td>{log.memberPhone}</td>
                            <td>
                              <StatusBadge status={log.memberStatus} />
                            </td>
                            <td>
                              <StatusBadge status={log.validationStatus} />
                            </td>
                            <td>
                              <StatusBadge
                                status={log.entranceType}
                                icon={log.entranceType === 'qr_scan' ? <QrCode size={12} /> : undefined}
                                showDot={log.entranceType !== 'qr_scan'}
                              />
                            </td>
                            <td className="pe-4">
                              <small className="text-muted">{log.validationMessage}</small>
                              {log.notes && (
                                <div className="small text-muted mt-1">{log.notes}</div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Record Attendance Modal */}
      {showRecordModal && selectedProgram && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  Καταγραφη Προσελευσης - {selectedProgram.title}
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
                    <strong>Ημερομηνια:</strong> {moment(selectedProgram.date).format('DD/MM/YYYY')}
                  </p>
                  <p className="mb-1">
                    <strong>Ωρα:</strong> {selectedProgram.time}
                  </p>
                  <p className="mb-0">
                    <strong>Εκπαιδευτης:</strong> {selectedProgram.instructor || '-'}
                  </p>
                </div>

                <hr />

                <h6 className="mb-3">Μελη</h6>
                <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Ονομα</th>
                        <th>Τηλεφωνο</th>
                        <th>Κατασταση</th>
                        <th>Ενεργειες</th>
                      </tr>
                    </thead>
                    <tbody>
                      {members.length > 0 ? members.map(member => {
                        const existingRecord = attendanceRecords.find(
                          r => r.programId === selectedProgram.id && r.memberId === member.id
                        );
                        return (
                          <tr key={member.id}>
                            <td>{member.name}</td>
                            <td>{member.phone}</td>
                            <td>
                              {existingRecord ? (
                                <StatusBadge status={existingRecord.status} />
                              ) : (
                                <span className="text-muted">-</span>
                              )}
                            </td>
                            <td>
                              <div className="btn-group btn-group-sm" role="group">
                                <button
                                  className="btn btn-outline-success"
                                  onClick={() => handleRecordAttendance(member.id, 'attended')}
                                  title="Παρεστη"
                                >
                                  <CheckCircle size={16} />
                                </button>
                                <button
                                  className="btn btn-outline-danger"
                                  onClick={() => handleRecordAttendance(member.id, 'absent')}
                                  title="Απουσια"
                                >
                                  <XCircle size={16} />
                                </button>
                                <button
                                  className="btn btn-outline-warning"
                                  onClick={() => handleRecordAttendance(member.id, 'cancelled')}
                                  title="Ακυρωθηκε"
                                >
                                  <Clock size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      }) : (
                        <tr>
                          <td colSpan={4} className="text-center text-muted py-3">
                            Δεν υπαρχουν μελη
                          </td>
                        </tr>
                      )}
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
                  Κλεισιμο
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
