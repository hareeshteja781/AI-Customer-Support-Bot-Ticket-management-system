import {
  Navigate,
  Route,
  Routes,
} from 'react-router-dom';

import {
  AuthProvider,
  useAuth,
} from './context/AuthContext';

import {
  ThemeProvider,
} from './context/ThemeContext';

import ProtectedRoute from './components/ProtectedRoute';
import AppShell from './components/layout/AppShell';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ChatPage from './pages/ChatPage';
import ConversationsPage from './pages/ConversationsPage';
import ConversationDetailPage from './pages/ConversationDetailPage';
import TicketsPage from './pages/TicketsPage';
import TicketDetailPage from './pages/TicketDetailPage';
import VoicePage from './pages/VoicePage';
import AgentDashboardPage from './pages/AgentDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';

function HomeRedirect() {
  const {
    user,
    loading,
  } = useAuth();

  if (loading) {
    return null;
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  if (user.role === 'admin') {
    return (
      <Navigate
        to="/admin"
        replace
      />
    );
  }

  if (user.role === 'agent') {
    return (
      <Navigate
        to="/agent"
        replace
      />
    );
  }

  return (
    <Navigate
      to="/dashboard"
      replace
    />
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Routes>
          <Route
            path="/login"
            element={<LoginPage />}
          />

          <Route
            path="/register"
            element={<RegisterPage />}
          />

          <Route
            element={
              <ProtectedRoute
                allowedRoles={[
                  'customer',
                  'agent',
                  'admin',
                ]}
              />
            }
          >
            <Route
              path="/"
              element={<AppShell />}
            >
              <Route
                index
                element={
                  <DashboardPage />
                }
              />

              <Route
                path="dashboard"
                element={
                  <DashboardPage />
                }
              />

              <Route
                path="chat"
                element={
                  <ChatPage />
                }
              />

              <Route
                path="conversations"
                element={
                  <ConversationsPage />
                }
              />

              <Route
                path="conversations/:id"
                element={
                  <ConversationDetailPage />
                }
              />

              <Route
                path="tickets"
                element={
                  <TicketsPage />
                }
              />

              <Route
                path="tickets/:id"
                element={
                  <TicketDetailPage />
                }
              />

              <Route
                path="voice"
                element={
                  <VoicePage />
                }
              />

              <Route
                path="analytics"
                element={
                  <AnalyticsPage />
                }
              />

              <Route
                path="settings"
                element={
                  <SettingsPage />
                }
              />

              <Route
                path="agent"
                element={
                  <AgentDashboardPage />
                }
              />

              <Route
                path="admin"
                element={
                  <AdminDashboardPage />
                }
              />
            </Route>
          </Route>

          <Route
            path="*"
            element={
              <HomeRedirect />
            }
          />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
}