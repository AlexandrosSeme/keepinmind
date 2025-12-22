import { useState } from 'react';
import { Calendar, Users, CreditCard, Bell, Settings, BarChart3, FileText, Send, Menu, X, Search, Plus, Filter, Download, AlertCircle, CheckCircle, Clock, Euro, TrendingUp } 
from 'lucide-react';

const GymMockups = () => {
  const [currentScreen, setCurrentScreen] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Mock Data
  const stats = {
    totalMembers: 156,
    activeSubscriptions: 142,
    expiringThisWeek: 12,
    overdueDebts: 8,
    monthlyRevenue: '12,450',
    pendingPayments: '2,340'
  };

  const recentMembers = [
    { id: 1, name: 'Νίκος Παπαδόπουλος', phone: '6912345678', status: 'active', expiry: '15/11/2025', package: 'Μηνιαία Απεριόριστη' },
    { id: 2, name: 'Μαρία Γεωργίου', phone: '6923456789', status: 'expiring_soon', expiry: '20/10/2025', package: 'Ετήσια' },
    { id: 3, name: 'Γιώργος Κωνσταντίνου', phone: '6934567890', status: 'expired', expiry: '05/10/2025', package: 'Ωριαία (10 ώρες)' },
    { id: 4, name: 'Ελένη Δημητρίου', phone: '6945678901', status: 'active', expiry: '30/12/2025', package: 'Μηνιαία Απεριόριστη' },
  ];

  const upcomingExpiries = [
    { id: 1, name: 'Μαρία Γεωργίου', phone: '6923456789', expiry: '20/10/2025', days: 7, package: 'Ετήσια' },
    { id: 2, name: 'Κώστας Αθανασίου', phone: '6956789012', expiry: '22/10/2025', days: 9, package: 'Μηνιαία' },
    { id: 3, name: 'Σοφία Νικολάου', phone: '6967890123', expiry: '25/10/2025', days: 12, package: 'Ωριαία' },
  ];

  const debts = [
    { id: 1, name: 'Γιώργος Κωνσταντίνου', amount: 50, daysOverdue: 8, status: 'overdue' },
    { id: 2, name: 'Αντώνης Μιχαηλίδης', amount: 120, daysOverdue: 3, status: 'overdue' },
    { id: 3, name: 'Κατερίνα Παυλίδου', amount: 45, daysOverdue: 15, status: 'overdue' },
  ];

  const packages = [
    { id: 1, name: 'Μηνιαία Απεριόριστη', category: 'subscription', duration: '30 ημέρες', price: 45, active: 78 },
    { id: 2, name: 'Ετήσια Απεριόριστη', category: 'subscription', duration: '365 ημέρες', price: 450, active: 42 },
    { id: 3, name: 'Ωριαία 10 Sessions', category: 'hourly', duration: '10 sessions', price: 80, active: 18 },
    { id: 4, name: 'Παιδικό Μηνιαίο', category: 'kids', duration: '30 ημέρες', price: 35, active: 12 },
  ];

  const calendarEvents = [
    { date: '15/10/2025', events: [{ type: 'expiry', title: 'Νίκος Π. - Λήξη', color: 'red' }] },
    { date: '20/10/2025', events: [{ type: 'expiry', title: 'Μαρία Γ. - Λήξη', color: 'orange' }] },
    { date: '25/10/2025', events: [{ type: 'debt', title: '3 Οφειλές λήγουν', color: 'red' }] },
  ];

  // Navigation
  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
    { id: 'members', name: 'Μέλη', icon: Users },
    { id: 'subscriptions', name: 'Συνδρομές', icon: FileText },
    { id: 'payments', name: 'Πληρωμές', icon: CreditCard },
    { id: 'debts', name: 'Οφειλές', icon: AlertCircle },
    { id: 'calendar', name: 'Ημερολόγιο', icon: Calendar },
    { id: 'notifications', name: 'Ειδοποιήσεις', icon: Bell },
    { id: 'announcements', name: 'Ανακοινώσεις', icon: Send },
    { id: 'settings', name: 'Ρυθμίσεις', icon: Settings },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'expiring_soon': return 'bg-orange-100 text-orange-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Ενεργή';
      case 'expiring_soon': return 'Λήγει Σύντομα';
      case 'expired': return 'Ληγμένη';
      case 'overdue': return 'Ληξιπρόθεσμο';
      default: return status;
    }
  };

  // Screen Components
  const DashboardScreen = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="bg-white p-6 rounded-lg shadow">
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <Plus className="w-4 h-4" />
          Νέο Μέλος
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Σύνολο Μελών</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalMembers}</p>
            </div>
            <Users className="w-12 h-12 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Ενεργές Συνδρομές</p>
              <p className="text-3xl font-bold text-green-600">{stats.activeSubscriptions}</p>
            </div>
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Λήγουν Αυτή την Εβδομάδα</p>
              <p className="text-3xl font-bold text-orange-600">{stats.expiringThisWeek}</p>
            </div>
            <Clock className="w-12 h-12 text-orange-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Μηνιαία Έσοδα</p>
              <p className="text-3xl font-bold text-blue-600">€{stats.monthlyRevenue}</p>
            </div>
            <TrendingUp className="w-12 h-12 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Εκκρεμείς Πληρωμές</p>
              <p className="text-3xl font-bold text-yellow-600">€{stats.pendingPayments}</p>
            </div>
            <Euro className="w-12 h-12 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Ληξιπρόθεσμες Οφειλές</p>
              <p className="text-3xl font-bold text-red-600">{stats.overdueDebts}</p>
            </div>
            <AlertCircle className="w-12 h-12 text-red-500" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Expiries */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Επερχόμενες Λήξεις</h3>
            <button className="text-blue-600 text-sm hover:underline">Προβολή Όλων</button>
          </div>
          <div className="p-4 space-y-3">
            {upcomingExpiries.map(exp => (
              <div key={exp.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{exp.name}</p>
                  <p className="text-sm text-gray-600">{exp.package}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-orange-700">Σε {exp.days} ημέρες</p>
                  <p className="text-xs text-gray-600">{exp.expiry}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Overdue Debts */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Ληξιπρόθεσμες Οφειλές</h3>
            <button className="text-blue-600 text-sm hover:underline">Προβολή Όλων</button>
          </div>
          <div className="p-4 space-y-3">
            {debts.map(debt => (
              <div key={debt.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{debt.name}</p>
                  <p className="text-sm text-gray-600">{debt.daysOverdue} ημέρες καθυστέρηση</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-red-700">€{debt.amount}</p>
                  <button className="text-xs text-blue-600 hover:underline">Καταγραφή Πληρωμής</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const MembersScreen = () => (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Μέλη Γυμναστηρίου</h2>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <Plus className="w-4 h-4" />
          Νέο Μέλος
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Αναζήτηση μέλους (όνομα, τηλέφωνο)..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
          <Filter className="w-4 h-4" />
          Φίλτρα
        </button>
        <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>

      {/* Members Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ονοματεπώνυμο</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Τηλέφωνο</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Πακέτο</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Λήξη</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Κατάσταση</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ενέργειες</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {recentMembers.map(member => (
              <tr key={member.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-medium">{member.name.split(' ').map(n => n[0]).join('')}</span>
                    </div>
                    <span className="ml-3 font-medium text-gray-900">{member.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-600">{member.phone}</td>
                <td className="px-6 py-4 text-gray-600">{member.package}</td>
                <td className="px-6 py-4 text-gray-600">{member.expiry}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(member.status)}`}>
                    {getStatusText(member.status)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button className="text-blue-600 hover:underline text-sm">Προβολή</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const SubscriptionsScreen = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Πακέτα Συνδρομών</h2>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <Plus className="w-4 h-4" />
          Νέο Πακέτο
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {packages.map(pkg => (
          <div key={pkg.id} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">{pkg.name}</h3>
              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">{pkg.category}</span>
            </div>
            <div className="space-y-2 mb-4">
              <p className="text-sm text-gray-600">Διάρκεια: {pkg.duration}</p>
              <p className="text-3xl font-bold text-blue-600">€{pkg.price}</p>
              <p className="text-sm text-gray-600">{pkg.active} ενεργά μέλη</p>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 text-sm px-3 py-2 border rounded hover:bg-gray-50">Επεξεργασία</button>
              <button className="flex-1 text-sm px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Ανανέωση</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const CalendarScreen = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Ημερολόγιο</h2>
        <div className="flex gap-2">
          <button className="px-4 py-2 border rounded-lg hover:bg-gray-50">Σήμερα</button>
          <button className="px-4 py-2 border rounded-lg hover:bg-gray-50">Εβδομάδα</button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">Μήνας</button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-gray-900">Οκτώβριος 2025</h3>
        </div>
        
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Δευ', 'Τρί', 'Τετ', 'Πέμ', 'Παρ', 'Σάβ', 'Κυρ'].map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">{day}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 35 }, (_, i) => {
            const day = i - 1;
            const hasEvent = calendarEvents.find(e => e.date === `${day}/10/2025`);
            return (
              <div
                key={i}
                className={`min-h-24 p-2 border rounded-lg ${
                  day > 0 && day <= 31 ? 'bg-white hover:bg-gray-50' : 'bg-gray-100'
                } ${day === 13 ? 'ring-2 ring-blue-500' : ''}`}
              >
                {day > 0 && day <= 31 && (
                  <>
                    <div className="text-sm font-medium text-gray-900 mb-1">{day}</div>
                    {hasEvent && hasEvent.events.map((event, idx) => (
                      <div
                        key={idx}
                        className={`text-xs p-1 rounded mb-1 ${
                          event.color === 'red' ? 'bg-red-100 text-red-800' : 
                          event.color === 'orange' ? 'bg-orange-100 text-orange-800' : 
                          'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {event.title}
                      </div>
                    ))}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Επερχόμενα Events</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">7 Συνδρομές λήγουν σε 7 ημέρες</p>
              <p className="text-sm text-gray-600">20/10/2025</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">5 Συνδρομές λήγουν σήμερα</p>
              <p className="text-sm text-gray-600">13/10/2025</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const NotificationsScreen = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Ειδοποιήσεις</h2>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <Bell className="w-4 h-4" />
          Νέα Ειδοποίηση
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">Όλες</button>
            <button className="px-4 py-2 border rounded-lg hover:bg-gray-50">Προγραμματισμένες</button>
            <button className="px-4 py-2 border rounded-lg hover:bg-gray-50">Σταλμένες</button>
            <button className="px-4 py-2 border rounded-lg hover:bg-gray-50">Αποτυχημένες</button>
          </div>
        </div>

        <div className="divide-y">
          <div className="p-4 hover:bg-gray-50">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <Clock className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">7 ημέρες πριν λήξη</p>
                  <p className="text-sm text-gray-600">Μαρία Γεωργίου - Η συνδρομή σας λήγει σε 7 ημέρες</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">SMS</span>
                    <span className="text-xs text-gray-500">Προγραμματισμένο για 13/10/2025 10:00</span>
                  </div>
                </div>
              </div>
              <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded">Εκκρεμεί</span>
            </div>
          </div>

          <div className="p-4 hover:bg-gray-50">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Ημέρα λήξης</p>
                  <p className="text-sm text-gray-600">Νίκος Παπαδόπουλος - Η συνδρομή σας λήγει σήμερα</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">SMS</span>
                    <span className="text-xs text-gray-500">Στάλθηκε 13/10/2025 10:05</span>
                  </div>
                </div>
              </div>
              <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">Σταλμένο</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const AnnouncementsScreen = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Ανακοινώσεις</h2>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <Send className="w-4 h-4" />
          Νέα Ανακοίνωση
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Δημιουργία Ανακοίνωσης</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Αποδέκτες</label>
            <select className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
              <option>Όλα τα μέλη (156)</option>
              <option>Ενεργά μέλη (142)</option>
              <option>Λήξη εντός 7 ημερών (12)</option>
              <option>Ληξιπρόθεσμα (8)</option>
              <option>Μηνιαία συνδρομή (78)</option>
              <option>Ετήσια συνδρομή (42)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Κανάλι</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input type="radio" name="channel" className="w-4 h-4" checked />
                <span>SMS</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="channel" className="w-4 h-4" />
                <span>Email</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="channel" className="w-4 h-4" />
                <span>Και τα δύο</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Μήνυμα</label>
            <textarea
              rows={4}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Γράψτε το μήνυμά σας εδώ..."
            ></textarea>
            <p className="text-sm text-gray-500 mt-1">Χαρακτήρες: 0/160 | Εκτιμώμενο κόστος: €0.00</p>
          </div>

          <div className="flex gap-2">
            <button className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">Αποθήκευση Πρόχειρου</button>
            <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Αποστολή Τώρα</button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-gray-900">Πρόσφατες Ανακοινώσεις</h3>
        </div>
        <div className="divide-y">
          <div className="p-4 hover:bg-gray-50">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-gray-900">Χριστουγεννιάτικες Προσφορές</p>
                <p className="text-sm text-gray-600 mt-1">Στάλθηκε σε 142 μέλη | SMS</p>
                <p className="text-xs text-gray-500 mt-1">10/12/2024 10:00</p>
              </div>
              <div className="text-right">
                <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">Στάλθηκε</span>
                <p className="text-sm text-gray-600 mt-1">138 επιτυχημένα</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const SettingsScreen = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">Ρυθμίσεις</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Στοιχεία Γυμναστηρίου</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Όνομα</label>
              <input type="text" defaultValue="Fighting Rooster Athens" className="w-full px-4 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Τηλέφωνο</label>
              <input type="text" defaultValue="210 1234567" className="w-full px-4 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input type="email" defaultValue="info@fightingrooster.gr" className="w-full px-4 py-2 border rounded-lg" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold text-gray-900 mb-4">SMS Provider</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Provider</label>
              <select className="w-full px-4 py-2 border rounded-lg">
                <option>Viber Business</option>
                <option>Twilio</option>
                <option>Plivo</option>
                <option>EasySMS.gr</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
              <input type="password" placeholder="••••••••••••" className="w-full px-4 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sender ID</label>
              <input type="text" defaultValue="FightingRstr" className="w-full px-4 py-2 border rounded-lg" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Αυτόματες Ειδοποιήσεις</h3>
          <div className="space-y-3">
            <label className="flex items-center justify-between">
              <span className="text-sm text-gray-700">7 ημέρες πριν λήξη</span>
              <input type="checkbox" className="w-5 h-5" defaultChecked />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm text-gray-700">3 ημέρες πριν λήξη</span>
              <input type="checkbox" className="w-5 h-5" defaultChecked />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Ημέρα λήξης</span>
              <input type="checkbox" className="w-5 h-5" defaultChecked />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm text-gray-700">3 ημέρες μετά λήξη</span>
              <input type="checkbox" className="w-5 h-5" />
            </label>
            <div className="pt-3 border-t">
              <label className="block text-sm font-medium text-gray-700 mb-2">Ώρα Αποστολής</label>
              <input type="time" defaultValue="10:00" className="w-full px-4 py-2 border rounded-lg" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Εμφάνιση</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Θέμα</label>
              <select className="w-full px-4 py-2 border rounded-lg">
                <option>Ανοιχτό</option>
                <option>Σκούρο</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Γλώσσα</label>
              <select className="w-full px-4 py-2 border rounded-lg">
                <option>Ελληνικά</option>
                <option>English</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Νόμισμα</label>
              <select className="w-full px-4 py-2 border rounded-lg">
                <option>EUR (€)</option>
                <option>USD ($)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <button className="px-6 py-2 border rounded-lg hover:bg-gray-50">Ακύρωση</button>
        <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Αποθήκευση</button>
      </div>
    </div>
  );

  const renderScreen = () => {
    switch (currentScreen) {
      case 'dashboard': return <DashboardScreen />;
      case 'members': return <MembersScreen />;
      case 'subscriptions': return <SubscriptionsScreen />;
      case 'calendar': return <CalendarScreen />;
      case 'notifications': return <NotificationsScreen />;
      case 'announcements': return <AnnouncementsScreen />;
      case 'settings': return <SettingsScreen />;
      default: return <DashboardScreen />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gray-900 text-white transition-all duration-300`}>
        <div className="p-4 flex items-center justify-between">
          {sidebarOpen && <h1 className="text-xl font-bold">Keep Fit</h1>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-800 rounded">
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <nav className="mt-8">
          {navigation.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentScreen(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-800 transition-colors ${
                  currentScreen === item.id ? 'bg-gray-800 border-l-4 border-blue-500' : ''
                }`}
              >
                <Icon className="w-5 h-5" />
                {sidebarOpen && <span>{item.name}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="px-8 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Fighting Rooster Gym Management</h1>
              <p className="text-sm text-gray-600">Καλώς ήρθατε στο σύστημα διαχείρισης</p>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-100 rounded-lg relative">
                <Bell className="w-6 h-6 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium">AD</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Admin</p>
                  <p className="text-xs text-gray-600">Διαχειριστής</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {renderScreen()}
        </div>
      </div>
    </div>
  );
};

export default GymMockups;