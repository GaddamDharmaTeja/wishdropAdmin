import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth';
import { AdminLayout } from './layout/AdminLayout';
import AnalyticsPage from './pages/Analytics';
import Dashboard from './pages/Dashboard';
import InviteLinksPage from './pages/InviteLinks';
import Login from './pages/Login';
import MediaPage from './pages/Media';
import NotificationsPage from './pages/Notifications';
import { ReportDetail, ReportsList } from './pages/Reports';
import SettingsPage from './pages/Settings';
import { SurpriseDetail, SurprisesList } from './pages/Surprises';
import { UserDetail, UsersList } from './pages/Users';
import { WishDetail, WishesList } from './pages/Wishes';

function Protected() {
  const { user, loading } = useAuth();
  if (loading) return <p className="muted" style={{ padding: 40 }}>Loading…</p>;
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<Protected />}>
          <Route element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="surprises" element={<SurprisesList />} />
            <Route path="surprises/:id" element={<SurpriseDetail />} />
            <Route path="wishes" element={<WishesList />} />
            <Route path="wishes/:id" element={<WishDetail />} />
            <Route path="reports" element={<ReportsList />} />
            <Route path="reports/:id" element={<ReportDetail />} />
            <Route path="moderation" element={<ReportsList status="pending" />} />
            <Route path="users" element={<UsersList />} />
            <Route path="users/:id" element={<UserDetail />} />
            <Route path="media" element={<MediaPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="invite-links" element={<InviteLinksPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
