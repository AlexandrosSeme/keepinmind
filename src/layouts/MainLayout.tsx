import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { Bell, Menu, X, User, BarChart3, Users, FileText, CreditCard, AlertTriangle, Calendar, Bell as BellIcon, Megaphone, Settings, ClipboardCheck } from 'lucide-react';
import './MainLayout.scss';
  
const MainLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: <BarChart3 size={20} />, path: '/dashboard' },
    { id: 'members', name: 'Μέλη', icon: <Users size={20} />, path: '/members' },
    { id: 'subscriptions', name: 'Συνδρομές', icon: <FileText size={20} />, path: '/subscriptions' },
    { id: 'payments', name: 'Πληρωμές', icon: <CreditCard size={20} />, path: '/payments' },
    { id: 'debts', name: 'Οφειλές', icon: <AlertTriangle size={20} />, path: '/debts' },
    { id: 'calendar', name: 'Ημερολόγιο', icon: <Calendar size={20} />, path: '/calendar' },
    { id: 'attendance', name: 'Προσέλευση', icon: <ClipboardCheck size={20} />, path: '/attendance' },
    { id: 'notifications', name: 'Ειδοποιήσεις', icon: <BellIcon size={20} />, path: '/notifications' },
    { id: 'announcements', name: 'Ανακοινώσεις', icon: <Megaphone size={20} />, path: '/announcements' },
    { id: 'settings', name: 'Ρυθμίσεις', icon: <Settings size={20} />, path: '/settings' }
  ];

  return (
    <div className="d-flex vh-100 bg-light">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="d-lg-none position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50" 
          style={{ zIndex: 1040 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        bg-dark text-white d-flex flex-column
        ${sidebarOpen ? 'position-fixed start-0 top-0' : 'd-none'}
        d-lg-flex
        ${sidebarOpen ? 'w-100' : ''}
        d-lg-block
      `} style={{ 
        width: sidebarOpen ? '280px' : '280px', 
        zIndex: 1050,
        height: '100vh'
      }}>
        {/* Header */}
        <div className="p-3 py-4 d-flex align-items-center justify-content-between border-bottom">
          <h4 className="app-title mb-0 text-primary-300">KM Management</h4> 
          <div className="text-white pt-1"><span className='mx-1 fw-bold'>|</span>  CRM</div>
          <button 
            className="btn btn-link text-white p-0 d-lg-none"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-grow-1 p-3">
          <ul className="nav nav-pills flex-column gap-2">
            {navigation.map(item => (
              <li key={item.id} className="nav-item">
                <Link
                  to={item.path}
                  className={`nav-link w-100 text-start d-flex align-items-center gap-3 ${
                    location.pathname === item.path ? 'nav-buttons' : 'text-white'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="fs-5">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-grow-1 d-flex flex-column" style={{ overflow: 'auto', backgroundColor: 'rgb(240, 240, 240)' }}>
        {/* Top Header */}
        <header className="bg-dark shadow-sm border-bottom">
          <div className="container-fluid">
            <div className="row align-items-center py-3">
              <div className="col">
                <div className="d-flex align-items-center gap-3">
                  <button 
                    className="btn btn-outline-secondary d-lg-none"
                    onClick={() => setSidebarOpen(true)}
                  >
                    <Menu size={20} />
                  </button>
                  <div>
                    {/* <h1 className="h5 mb-0 text-white">Fighting Rooster Gym Management</h1> */}
                    <small className="text-secondary">Καλώς ήρθατε στο σύστημα διαχείρισης</small>
                  </div>
                </div>
              </div>
              <div className="col-auto">
                <div className="d-flex align-items-center gap-4">
                  <button className="btn btn-outline-secondary position-relative text-white">
                    <Bell size={20} />
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                      3
                    </span>
                  </button>
                  <div className="d-flex align-items-center gap-2">
                    <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                      <User size={20} className="text-white" />
                    </div>
                    <div className="d-none d-md-block">
                      <div className="fw-semibold text-white">Admin</div>
                      <small className="text-secondary">Διαχειριστής</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-grow-1 p-3 p-lg-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
