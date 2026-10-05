import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth';

const LINKS = [
  ['/', 'Dashboard'],
  ['/surprises', 'Surprises'],
  ['/wishes', 'Wishes'],
  ['/reports', 'Reports'],
  ['/users', 'Users'],
  ['/media', 'Media'],
  ['/moderation', 'Moderation'],
  ['/analytics', 'Analytics'],
  ['/invite-links', 'Invite Links'],
  ['/notifications', 'Notifications'],
  ['/settings', 'Settings'],
] as const;

export function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">♥</div>
          <span>WishDrop</span>
        </div>
        {LINKS.map(([to, label]) => (
          <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            {label}
          </NavLink>
        ))}
      </aside>
      <div className="content">
        <header className="topbar">
          <input className="search" placeholder="Search surprises, users, wishes…" readOnly onFocus={() => navigate('/surprises')} />
          <div className="row">
            <button className="btn secondary" type="button" onClick={() => navigate('/notifications')}>
              Alerts
            </button>
            <span className="muted">{user?.name || 'Admin'}</span>
            <button
              className="btn secondary"
              type="button"
              onClick={async () => {
                await logout();
                navigate('/login');
              }}
            >
              Log out
            </button>
          </div>
        </header>
        <main className="page">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
