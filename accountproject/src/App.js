// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StoreProvider, useStore } from './context/StoreContext';
import Layout from './components/layout/Layout';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProgramsPage from './pages/ProgramsPage';
import ApplicationFormPage from './pages/ApplicationFormPage';
import ApplicationsPage from './pages/ApplicationsPage';
import ApplicationDetailPage from './pages/ApplicationDetailPage';
import ToursPage from './pages/ToursPage';
import TourDetailPage from './pages/TourDetailPage';
import NotificationsPage from './pages/NotificationsPage';
import ArchivePage from './pages/ArchivePage';
import UsersPage from './pages/UsersPage';

function Guard({ children, roles }) {
  const store = useStore();
  const user = store.currentUser;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return <Layout>{children}</Layout>;
}

function AppRoutes() {
  const { currentUser: user } = useStore();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <RegisterPage />} />

      <Route path="/dashboard" element={<Guard><DashboardPage /></Guard>} />
      <Route path="/applications" element={<Guard><ApplicationsPage /></Guard>} />
      <Route path="/applications/:id" element={<Guard><ApplicationDetailPage /></Guard>} />
      <Route path="/notifications" element={<Guard><NotificationsPage /></Guard>} />

      {/* Tours — admin and manager */}
      <Route path="/tours" element={<Guard roles={['admin', 'manager']}><ToursPage /></Guard>} />
      <Route path="/tours/:id" element={<Guard roles={['admin', 'manager']}><TourDetailPage /></Guard>} />

      {/* Client only */}
      <Route path="/programs" element={<Guard roles={['client']}><ProgramsPage /></Guard>} />
      <Route path="/programs/:programId/apply" element={<Guard roles={['client']}><ApplicationFormPage /></Guard>} />

      {/* Admin only */}
      <Route path="/archive" element={<Guard roles={['admin']}><ArchivePage /></Guard>} />
      <Route path="/users" element={<Guard roles={['admin']}><UsersPage /></Guard>} />

      <Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </StoreProvider>
  );
}
