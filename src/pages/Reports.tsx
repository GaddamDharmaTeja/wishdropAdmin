import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { DetailLink, ErrorBox, Loading, PageHeader, StatusBadge } from '../components/ui';

export function ReportsList({ status }: { status?: string }) {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');
  const title = status === 'pending' ? 'Moderation' : 'Reports';

  useEffect(() => {
    const params = new URLSearchParams({ page: '1', limit: '50' });
    if (status) params.set('status', status);
    api
      .reports(`?${params}`)
      .then(setData)
      .catch(err => setError(err.message));
  }, [status]);

  if (error) return <ErrorBox message={error} />;
  if (!data) return <Loading />;

  return (
    <div className="stack">
      <PageHeader title={title} sub={`${data.total} ${status || 'all'} reports`} />
      <div className="card table-wrap">
        <table>
          <thead>
            <tr>
              <th>Reason</th>
              <th>Status</th>
              <th>Created</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {data.reports.map((item: any) => (
              <tr key={item.id}>
                <td>{item.reason}</td>
                <td>
                  <StatusBadge value={item.status} />
                </td>
                <td>{item.createdAt ? new Date(item.createdAt).toLocaleString() : '—'}</td>
                <td>
                  <DetailLink to={`/reports/${item.id}`}>Open</DetailLink>
                </td>
              </tr>
            ))}
            {!data.reports.length ? (
              <tr>
                <td colSpan={4} className="empty">
                  No reports.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function ReportDetail() {
  const { id = '' } = useParams();
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');

  const load = () => api.report(id).then(setData).catch(err => setError(err.message));
  useEffect(() => {
    load();
  }, [id]);

  if (error) return <ErrorBox message={error} />;
  if (!data) return <Loading />;

  return (
    <div className="stack">
      <PageHeader title="Report detail" sub={data.report.reason} />
      <div className="grid grid-2">
        <div className="card stack">
          <div>
            Status: <StatusBadge value={data.report.status} />
          </div>
          <div className="muted">{data.report.details || 'No extra details'}</div>
          <div className="row">
            <button className="btn" type="button" onClick={() => api.patchReport(id, { status: 'resolved', hideWish: true }).then(load)}>
              Resolve & hide wish
            </button>
            <button className="btn secondary" type="button" onClick={() => api.patchReport(id, { status: 'dismissed' }).then(load)}>
              Dismiss
            </button>
          </div>
        </div>
        <div className="card stack">
          <h3>Wish</h3>
          <p>{data.wish?.message || 'Wish removed'}</p>
          <div className="muted">{data.wish?.authorName}</div>
          {data.surprise ? <DetailLink to={`/surprises/${data.surprise.id}`}>{data.surprise.title}</DetailLink> : null}
        </div>
      </div>
    </div>
  );
}
