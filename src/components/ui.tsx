import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

export function PageHeader({ title, sub, actions }: { title: string; sub?: string; actions?: ReactNode }) {
  return (
    <div className="row" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
      <div>
        <h1 className="h1">{title}</h1>
        {sub ? <p className="sub">{sub}</p> : null}
      </div>
      {actions}
    </div>
  );
}

export function StatusBadge({ value }: { value?: string }) {
  const v = (value || 'unknown').toLowerCase();
  return <span className={`badge ${v}`}>{value || '—'}</span>;
}

export function Loading() {
  return <p className="muted">Loading…</p>;
}

export function ErrorBox({ message }: { message: string }) {
  return <p className="error">{message}</p>;
}

export function DetailLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link to={to} style={{ color: 'var(--pink)', fontWeight: 700 }}>
      {children}
    </Link>
  );
}
