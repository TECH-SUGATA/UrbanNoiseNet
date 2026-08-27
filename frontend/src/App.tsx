import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppDataProvider } from './context/AppDataContext';
import { AppShell } from './components/layout/AppShell';

import { DashboardPage } from './pages/DashboardPage';
import { ZonesPage } from './pages/ZonesPage';
import { ChallansPage } from './pages/ChallansPage';
import { DispatchPage } from './pages/DispatchPage';
import { ComplaintsInboxPage } from './pages/ComplaintsInboxPage';
import { CitizenComplaintPage } from './pages/CitizenComplaintPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SettingsPage } from './pages/SettingsPage';
import { LoginPage } from './pages/LoginPage';

export default function App() {
  return (
    <AppDataProvider>
      <BrowserRouter>
        <Routes>
          {/* Standalone Public Pages */}
          <Route path="/complaints" element={<CitizenComplaintPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Enterprise Command AppShell Pages */}
          <Route
            path="/"
            element={
              <AppShell>
                <DashboardPage />
              </AppShell>
            }
          />
          <Route
            path="/zones"
            element={
              <AppShell>
                <ZonesPage />
              </AppShell>
            }
          />
          <Route
            path="/challans"
            element={
              <AppShell>
                <ChallansPage />
              </AppShell>
            }
          />
          <Route
            path="/dispatch"
            element={
              <AppShell>
                <DispatchPage />
              </AppShell>
            }
          />
          <Route
            path="/complaints-inbox"
            element={
              <AppShell>
                <ComplaintsInboxPage />
              </AppShell>
            }
          />
          <Route
            path="/analytics"
            element={
              <AppShell>
                <AnalyticsPage />
              </AppShell>
            }
          />
          <Route
            path="/settings"
            element={
              <AppShell>
                <SettingsPage />
              </AppShell>
            }
          />

          {/* Fallback Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppDataProvider>
  );
}
