import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import FloatingContactButtons from './components/FloatingContactButtons';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import AdminLoginPage from './pages/AdminLoginPage';
import MessRegistrationPage from './pages/MessRegistrationPage';
import OwnerDashboard from './pages/OwnerDashboard';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import RenewRentModal from './components/RenewRentModal';

const App = () => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('s3elite_admin');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [currentView, setCurrentView] = useState(() => {
    const savedUser = localStorage.getItem('s3elite_admin');
    if (savedUser) return 'owner';
    return 'home';
  });
  const [selectedRoomCot, setSelectedRoomCot] = useState(null);
  const [isRenewRentModalOpen, setIsRenewRentModalOpen] = useState(false);

  // Check initial URL path or hash for hidden /admin or /admin/login gateway
  useEffect(() => {
    const checkHiddenAdminRoute = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      if (!localStorage.getItem('s3elite_admin') && (path.includes('/admin') || hash.includes('/admin'))) {
        setCurrentView('admin-login');
      }
    };

    checkHiddenAdminRoute();
    window.addEventListener('hashchange', checkHiddenAdminRoute);
    return () => window.removeEventListener('hashchange', checkHiddenAdminRoute);
  }, []);

  const handleAdminLogin = (adminData) => {
    setUser(adminData);
    localStorage.setItem('s3elite_admin', JSON.stringify(adminData));
    setCurrentView('owner');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('s3elite_admin');
    setCurrentView('home');
    window.location.hash = '';
  };

  const handleOpenBooking = (rolePreference = 'student', roomCotInfo = null) => {
    setSelectedRoomCot(roomCotInfo);
    setCurrentView('booking-form');
  };

  const handleOpenMess = () => {
    setCurrentView('mess-registration');
  };

  // Strict Role-Based Route Guard
  const renderContent = () => {
    // 1. Hidden Enterprise Admin Login
    if (currentView === 'admin-login') {
      return <AdminLoginPage onAdminLogin={handleAdminLogin} />;
    }

    // 2. Protected Admin Dashboard (ERP)
    if (currentView === 'owner') {
      if (!user || user.role !== 'owner') {
        return (
          <div className="min-h-[75vh] flex items-center justify-center p-6">
            <div className="max-w-md w-full glass-card p-8 border border-rose-500/40 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black text-white">403 Unauthorized</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Access denied. This route is strictly restricted to authorized S3 Elite PG Enterprise Administrators. Students and public visitors are prohibited from accessing this resource.
              </p>
              <button
                onClick={() => setCurrentView('home')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                Return to Public Website
              </button>
            </div>
          </div>
        );
      }
      return <OwnerDashboard />;
    }

    // 3. Dedicated Booking Page
    if (currentView === 'booking-form') {
      return (
        <AuthPage
          selectedRoomCot={selectedRoomCot}
          onCancel={() => setCurrentView('home')}
        />
      );
    }

    // 4. Dedicated Mess Registration Page
    if (currentView === 'mess-registration') {
      return (
        <MessRegistrationPage
          onCancel={() => setCurrentView('home')}
        />
      );
    }

    // 5. Default Public Website
    return <HomePage onOpenAuth={handleOpenBooking} onOpenMess={handleOpenMess} onOpenRenewRent={() => setIsRenewRentModalOpen(true)} />;
  };

  return (
    <div className="min-h-screen bg-darkBg text-slate-100 flex flex-col relative">
      {/* Hide public navbar on Admin Login Gateway for enterprise security isolation */}
      {currentView !== 'admin-login' && (
        <Navbar
          user={user}
          onLogout={handleLogout}
          currentView={currentView}
          setCurrentView={setCurrentView}
          onOpenAuth={handleOpenBooking}
          onOpenRenewRent={() => setIsRenewRentModalOpen(true)}
        />
      )}

      {isRenewRentModalOpen && <RenewRentModal onClose={() => setIsRenewRentModalOpen(false)} />}

      <main className="flex-1">
        {renderContent()}
      </main>

      {/* Floating Action Buttons (Visible on all public pages) */}
      {currentView !== 'owner' && currentView !== 'admin-login' && (
        <FloatingContactButtons onOpenBooking={() => handleOpenBooking()} />
      )}

      <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
        <p>© 2026 S3 Elite PG & Hostel Management Platform • Complete Enterprise ERP Isolation • Built on MERN Stack</p>
      </footer>
    </div>
  );
};

export default App;
