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
import ProtocolsPage from './pages/ProtocolsPage';
import ResultsPage from './pages/ResultsPage';
import NotificationsPage from './pages/NotificationsPage';
import ArchivePage from './pages/ArchivePage';
import UsersPage from './pages/UsersPage';

function ProtectedRoute({ children, allowedRoles }) {
  const store = useStore();
  const user = store.currentUser;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return <Layout>{children}</Layout>;
}

function AppRoutes() {
  const store = useStore();
  const user = store.currentUser;

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <RegisterPage />} />

      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/applications" element={<ProtectedRoute><ApplicationsPage /></ProtectedRoute>} />
      <Route path="/applications/:id" element={<ProtectedRoute><ApplicationDetailPage /></ProtectedRoute>} />
      <Route path="/protocols" element={<ProtectedRoute allowedRoles={['admin','manager']}><ProtocolsPage /></ProtectedRoute>} />
      <Route path="/results" element={<ProtectedRoute allowedRoles={['admin','client']}><ResultsPage /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
      <Route path="/archive" element={<ProtectedRoute allowedRoles={['admin']}><ArchivePage /></ProtectedRoute>} />
      <Route path="/users" element={<ProtectedRoute allowedRoles={['admin']}><UsersPage /></ProtectedRoute>} />
      <Route path="/programs" element={<ProtectedRoute allowedRoles={['client']}><ProgramsPage /></ProtectedRoute>} />
      <Route path="/programs/:programId/apply" element={<ProtectedRoute allowedRoles={['client']}><ApplicationFormPage /></ProtectedRoute>} />

      <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
      <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
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
