import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { DetailLink, ErrorBox, Loading, PageHeader, StatusBadge } from '../components/ui';

export function UsersList() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.users('?page=1&limit=50').then(setData).catch(err => setError(err.message));
  }, []);

  if (error) return <ErrorBox message={error} />;
  if (!data) return <Loading />;

  return (
    <div className="stack">
      <PageHeader title="Users" sub={`${data.total} registered users`} />
      <div className="card table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined</th>
            </tr>
          </thead>
          <tbody>
            {data.users.map((user: any) => (
              <tr key={user.id}>
                <td>
                  <DetailLink to={`/users/${user.id}`}>{user.name}</DetailLink>
                </td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>
                  <StatusBadge value={user.lifecycle} />
                </td>
                <td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function UserDetail() {
  const { id = '' } = useParams();
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');

  const load = () => api.user(id).then(setData).catch(err => setError(err.message));
  useEffect(() => {
    load();
  }, [id]);

  if (error) return <ErrorBox message={error} />;
  if (!data) return <Loading />;

  return (
    <div className="stack">
      <PageHeader title={data.user.name} sub={data.user.email} />
      <div className="grid grid-4">
        <div className="card">
          <div className="muted">Surprises</div>
          <div className="kpi">{data.stats.surprises}</div>
        </div>
        <div className="card">
          <div className="muted">Status</div>
          <div className="kpi" style={{ fontSize: 18 }}>
            <StatusBadge value={data.user.lifecycle} />
          </div>
        </div>
      </div>
      <div className="row">
        <button className="btn secondary" type="button" onClick={() => api.patchUser(id, { lifecycle: 'active' }).then(load)}>
          Activate
        </button>
        <button className="btn danger" type="button" onClick={() => api.patchUser(id, { lifecycle: 'suspended' }).then(load)}>
          Suspend
        </button>
      </div>
      <div className="card table-wrap">
        <h3>Created surprises</h3>
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {data.surprises.map((item: any) => (
              <tr key={item.id}>
                <td>
                  <DetailLink to={`/surprises/${item.id}`}>{item.title}</DetailLink>
                </td>
                <td>
                  <StatusBadge value={item.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
