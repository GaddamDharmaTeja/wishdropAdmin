import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { DetailLink, ErrorBox, Loading, PageHeader, StatusBadge } from '../components/ui';

export function SurprisesList() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');

  const load = () => {
    const params = new URLSearchParams({ page: '1', limit: '50' });
    if (q) params.set('q', q);
    if (status) params.set('status', status);
    api
      .surprises(`?${params}`)
      .then(setData)
      .catch(err => setError(err.message));
  };

  useEffect(() => {
    load();
  }, []);

  if (error) return <ErrorBox message={error} />;
  if (!data) return <Loading />;

  return (
    <div className="stack">
      <PageHeader title="Surprises" sub={`${data.total} total surprises`} />
      <div className="row">
        <input className="search" placeholder="Search title or recipient" value={q} onChange={e => setQ(e.target.value)} />
        <select value={status} onChange={e => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {['draft', 'scheduled', 'live', 'expired'].map(item => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <button className="btn" type="button" onClick={load}>
          Apply
        </button>
      </div>
      <div className="card table-wrap">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Recipient</th>
              <th>Occasion</th>
              <th>Status</th>
              <th>Wishes</th>
              <th>Opens</th>
            </tr>
          </thead>
          <tbody>
            {data.surprises.map((item: any) => (
              <tr key={item.id}>
                <td>
                  <DetailLink to={`/surprises/${item.id}`}>{item.title}</DetailLink>
                </td>
                <td>{item.recipientName}</td>
                <td>{item.occasion}</td>
                <td>
                  <StatusBadge value={item.status} />
                </td>
                <td>{item.wishCount}</td>
                <td>{item.opensAt ? new Date(item.opensAt).toLocaleString() : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function SurpriseDetail() {
  const { id = '' } = useParams();
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = () => api.surprise(id).then(setData).catch(err => setError(err.message));

  useEffect(() => {
    load();
  }, [id]);

  if (error) return <ErrorBox message={error} />;
  if (!data) return <Loading />;
  const { surprise, wishes } = data;

  return (
    <div className="stack">
      <PageHeader
        title={surprise.title}
        sub={`For ${surprise.recipientName} · ${surprise.occasion}`}
        actions={
          <div className="row">
            <button
              className="btn secondary"
              type="button"
              onClick={async () => {
                const result = await api.regenerateInvite(id);
                setMessage(result.url || 'Invite regenerated');
                load();
              }}
            >
              Regenerate invite
            </button>
            <button
              className="btn danger"
              type="button"
              onClick={async () => {
                await api.disableInvite(id);
                setMessage('Invite disabled');
                load();
              }}
            >
              Disable invite
            </button>
          </div>
        }
      />
      {message ? <p className="muted">{message}</p> : null}
      <div className="grid grid-2">
        <div className="card stack">
          <div>
            Status: <StatusBadge value={surprise.status} />
          </div>
          <div className="muted">{surprise.message}</div>
          <div className="muted">Creator: {surprise.creator?.email || surprise.creatorId}</div>
          <div className="muted">Invite: {surprise.invite?.status}</div>
          <div className="muted">Share: {surprise.shareUrl || '—'}</div>
          <label className="field">
            Update status
            <select
              value={surprise.status}
              onChange={async e => {
                await api.patchSurprise(id, { status: e.target.value });
                load();
              }}
            >
              {['draft', 'scheduled', 'live', 'expired'].map(item => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="card table-wrap">
          <h3>Wishes ({wishes.length})</h3>
          <table>
            <thead>
              <tr>
                <th>Author</th>
                <th>Message</th>
                <th>Moderation</th>
              </tr>
            </thead>
            <tbody>
              {wishes.map((wish: any) => (
                <tr key={wish.id}>
                  <td>
                    <Link to={`/wishes/${wish.id}`} style={{ color: 'var(--pink)', fontWeight: 700 }}>
                      {wish.authorName}
                    </Link>
                  </td>
                  <td>{wish.message}</td>
                  <td>
                    <StatusBadge value={wish.moderation} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
