import React, { useContext, useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { NotificationContext } from '../context/NotificationContext';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import GymLoader from '../components/GymLoader';

const DashboardLayout = () => {
  const { admin, loading } = useContext(AuthContext);
  const { fetchNotifications } = useContext(NotificationContext);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Poll notifications every 10 seconds to show live updates
  useEffect(() => {
    if (admin) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 10000);
      return () => clearInterval(interval);
    }
  }, [admin, fetchNotifications]);

  if (loading) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-deep)'
      }}>
        <GymLoader text="LOADING SECURITY PROTOCOLS..." color="var(--gold-primary)" />
      </div>
    );
  }

  // Redirect if not authenticated
  if (!admin) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-deep)', display: 'flex' }}>
      {/* Sidebar Navigation */}
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      {/* Main Content Area */}
      <div style={{
        flex: 1,
        marginLeft: isCollapsed ? '80px' : '260px',
        transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}>
        <Header />
        
        {/* Dynamic Inner Page */}
        <main style={{ padding: '30px', flex: 1, overflowY: 'auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
