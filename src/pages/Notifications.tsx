import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { ErrorBox, Loading, PageHeader } from '../components/ui';

export default function NotificationsPage() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');

  const load = () => api.notifications('?page=1&limit=50').then(setData).catch(err => setError(err.message));
  useEffect(() => {
    load();
  }, []);

  if (error) return <ErrorBox message={error} />;
  if (!data) return <Loading />;

  return (
    <div className="stack">
      <PageHeader title="Notifications" sub={`${data.total} admin alerts`} />
      <div className="stack">
        {data.notifications.map((item: any) => (
          <div key={item.id} className="card row" style={{ justifyContent: 'space-between' }}>
            <div>
              <strong>{item.title}</strong>
              <div className="muted">{item.body}</div>
              <div className="muted">{item.createdAt ? new Date(item.createdAt).toLocaleString() : ''}</div>
            </div>
            {!item.readAt ? (
              <button className="btn secondary" type="button" onClick={() => api.readNotification(item.id).then(load)}>
                Mark read
              </button>
            ) : (
              <span className="muted">Read</span>
            )}
          </div>
        ))}
        {!data.notifications.length ? <p className="empty">No notifications yet.</p> : null}
      </div>
    </div>
  );
}
