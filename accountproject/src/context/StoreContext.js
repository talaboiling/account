// src/context/StoreContext.js
//
// Backend-backed data layer. Reads (getAppById, getUserById, ...) are plain
// synchronous lookups over a client-side cache that mirrors what the current
// user is allowed to see; mutations call the API, then refresh that cache so
// every consumer re-renders with the persisted result.
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { api, getToken, setToken } from '../api/client';

const StoreContext = createContext(null);

const EMPTY = { users: [], programs: [], applications: [], tours: [], notifications: [], allNotifications: [] };

export function StoreProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [data, setData] = useState(EMPTY);
  const [bootstrapping, setBootstrapping] = useState(true);
  const [error, setError] = useState(null);

  const flashError = useCallback(err => {
    setError(err?.message || String(err));
  }, []);

  const refreshAll = useCallback(async user => {
    const role = user?.role;
    if (!role) { setData(EMPTY); return; }
    const [programs, users, applications, tours, notifications, allNotifications] = await Promise.all([
      api.getPrograms().then(r => r.programs),
      api.getUsers().then(r => r.users),
      api.getApplications().then(r => r.applications),
      role === 'admin' || role === 'manager' ? api.getTours().then(r => r.tours) : Promise.resolve([]),
      api.getNotifications().then(r => r.notifications),
      role === 'admin' ? api.getAllNotifications().then(r => r.notifications) : Promise.resolve([]),
    ]);
    setData({ programs, users, applications, tours, notifications, allNotifications });
  }, []);

  useEffect(() => {
    (async () => {
      const token = getToken();
      if (!token) { setBootstrapping(false); return; }
      try {
        const { user } = await api.me();
        setCurrentUser(user);
        await refreshAll(user);
      } catch {
        setToken(null);
      } finally {
        setBootstrapping(false);
      }
    })();
  }, [refreshAll]);

  const login = useCallback(async (email, password) => {
    try {
      const { token, user } = await api.login(email, password);
      setToken(token);
      setCurrentUser(user);
      await refreshAll(user);
      return { user };
    } catch (e) {
      return { error: e.message };
    }
  }, [refreshAll]);

  const logout = useCallback(() => {
    setToken(null);
    setCurrentUser(null);
    setData(EMPTY);
  }, []);

  const registerClient = useCallback(async payload => {
    try {
      return await api.register(payload);
    } catch (e) {
      return { error: e.message };
    }
  }, []);

  const verifyEmail = useCallback(async (email, code) => {
    try {
      return await api.verifyEmail(email, code);
    } catch (e) {
      return { error: e.message };
    }
  }, []);

  // Every mutation follows the same shape: call the API, refresh the cache
  // so the UI reflects the persisted state, and surface failures via the
  // shared error banner instead of leaving the app looking unresponsive.
  const mutate = useCallback(async fn => {
    try {
      const result = await fn();
      await refreshAll(currentUser);
      return result;
    } catch (e) {
      flashError(e);
      throw e;
    }
  }, [currentUser, refreshAll, flashError]);

  const submitApplication = useCallback((clientId, programId, formData) =>
    mutate(() => api.submitApplication(programId, formData).then(r => r.application)), [mutate]);
  const acceptApplication = useCallback((appId, adminId, note) =>
    mutate(() => api.acceptApplication(appId, note)), [mutate]);
  const rejectApplication = useCallback((appId, adminId, note) =>
    mutate(() => api.rejectApplication(appId, note)), [mutate]);
  const attachDraftContract = useCallback((appId, adminId, filename) =>
    mutate(() => api.attachDraftContract(appId, filename)), [mutate]);
  const uploadSignedContract = useCallback((appId, clientId, filename) =>
    mutate(() => api.uploadSignedContract(appId, filename)), [mutate]);
  const confirmSamplesReceived = useCallback((appId) =>
    mutate(() => api.confirmSamplesReceived(appId)), [mutate]);
  const uploadProtocol = useCallback((appId, clientId, filename) =>
    mutate(() => api.uploadProtocol(appId, filename)), [mutate]);
  const setProcessingStatus = useCallback((appId, adminId, note) =>
    mutate(() => api.setProcessingStatus(appId, note)), [mutate]);
  const uploadFinalDocuments = useCallback((appId, adminId, docs) =>
    mutate(() => api.uploadFinalDocuments(appId, docs)), [mutate]);

  const startTour = useCallback((tourId, adminId, managerId, taskNote) =>
    mutate(() => api.startTour(tourId, managerId, taskNote)), [mutate]);
  const updateTourWorkStatus = useCallback((tourId, managerId, workStatus, note) =>
    mutate(() => api.updateTourWorkStatus(tourId, workStatus, note)), [mutate]);
  const notifyTourSamplesSent = useCallback((tourId, adminId, note) =>
    mutate(() => api.notifyTourSamplesSent(tourId, note)), [mutate]);

  const markNotificationRead = useCallback(id => mutate(() => api.markNotificationRead(id)), [mutate]);
  const markAllRead = useCallback(() => mutate(() => api.markAllRead()), [mutate]);
  const createUser = useCallback(payload => mutate(() => api.createUser(payload)), [mutate]);

  const uploadFile = useCallback(async file => {
    try {
      return await api.uploadFile(file);
    } catch (e) {
      flashError(e);
      throw e;
    }
  }, [flashError]);

  const store = useMemo(() => ({
    currentUser,
    bootstrapping,
    error,
    clearError: () => setError(null),

    users: data.users,
    programs: data.programs,
    applications: data.applications,
    tours: data.tours,
    notifications: data.notifications,
    allNotifications: data.allNotifications,

    // Auth
    login, logout, registerClient, verifyEmail,

    // Reads — synchronous lookups over the cache above.
    getUserById: id => data.users.find(u => u.id === id),
    getProgramById: id => data.programs.find(p => p.id === id),
    getAppById: id => data.applications.find(a => a.id === id),
    getTourById: id => data.tours.find(t => t.id === id),
    getManagers: () => data.users.filter(u => u.role === 'manager'),
    getAppsInTour: tourId => data.applications.filter(a => a.tourId === tourId),
    getAllApplications: () => data.applications,
    getApplicationsForClient: () => data.applications,
    getApplicationsForManager: () => data.applications,
    getToursForManager: managerId => data.tours.filter(t => t.assignedManagerId === managerId),
    getNotificationsForUser: () => data.notifications,
    getUnreadCount: () => data.notifications.filter(n => !n.read).length,

    // Mutations
    submitApplication, acceptApplication, rejectApplication, attachDraftContract,
    uploadSignedContract, confirmSamplesReceived, uploadProtocol, setProcessingStatus,
    uploadFinalDocuments, startTour, updateTourWorkStatus, notifyTourSamplesSent,
    markNotificationRead, markAllRead, createUser, uploadFile,
  }), [
    currentUser, bootstrapping, error, data,
    login, logout, registerClient, verifyEmail,
    submitApplication, acceptApplication, rejectApplication, attachDraftContract,
    uploadSignedContract, confirmSamplesReceived, uploadProtocol, setProcessingStatus,
    uploadFinalDocuments, startTour, updateTourWorkStatus, notifyTourSamplesSent,
    markNotificationRead, markAllRead, createUser, uploadFile,
  ]);

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

export function useStore() { return useContext(StoreContext); }
