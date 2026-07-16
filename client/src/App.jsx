import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import DashboardLayout from './layouts/DashboardLayout';

// Page Imports
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import RegisterMember from './pages/RegisterMember';
import Members from './pages/Members';
import MemberDetails from './pages/MemberDetails';
import Attendance from './pages/Attendance';
import PINCheckIn from './pages/PINCheckIn';
import Plans from './pages/Plans';
import Trainers from './pages/Trainers';
import Settings from './pages/Settings';
import Receipt from './pages/Receipt';
import MemberLogin from './pages/MemberLogin';
import MemberDashboard from './pages/MemberDashboard';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <Routes>
            {/* Public Login Route */}
            <Route path="/login" element={<Login />} />

            {/* Public PIN Checkin Kiosk Console */}
            <Route path="/kiosk" element={<PINCheckIn />} />

            {/* Member Portal Routes */}
            <Route path="/member-login" element={<MemberLogin />} />
            <Route path="/member/dashboard" element={<MemberDashboard />} />

            {/* Protected Administrative Dashboard Layout */}
            <Route path="/" element={<DashboardLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="register" element={<RegisterMember />} />
              <Route path="members" element={<Members />} />
              <Route path="members/:id" element={<MemberDetails />} />
              <Route path="attendance" element={<Attendance />} />
              <Route path="plans" element={<Plans />} />
              <Route path="trainers" element={<Trainers />} />
              <Route path="settings" element={<Settings />} />
              <Route path="receipt/:receiptNumber" element={<Receipt />} />
            </Route>

            {/* Catch-all Redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
