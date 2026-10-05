import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { DetailLink, ErrorBox, Loading, PageHeader, StatusBadge } from '../components/ui';

export default function InviteLinksPage() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');

  const load = () => api.inviteLinks('?page=1&limit=50').then(setData).catch(err => setError(err.message));
  useEffect(() => {
    load();
  }, []);

  if (error) return <ErrorBox message={error} />;
  if (!data) return <Loading />;

  return (
    <div className="stack">
      <PageHeader title="Invite Links" sub={`${data.total} contribution links`} />
      <div className="card table-wrap">
        <table>
          <thead>
            <tr>
              <th>Surprise</th>
              <th>Creator</th>
              <th>Status</th>
              <th>URL</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {data.links.map((item: any) => (
              <tr key={item.surpriseId}>
                <td>
                  <DetailLink to={`/surprises/${item.surpriseId}`}>{item.title}</DetailLink>
                </td>
                <td>{item.creator?.email || '—'}</td>
                <td>
                  <StatusBadge value={item.invite?.status} />
                </td>
                <td style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.url || 'Regenerate to view'}</td>
                <td className="row">
                  <button className="btn secondary" type="button" onClick={() => api.regenerateInvite(item.surpriseId).then(load)}>
                    Regen
                  </button>
                  <button className="btn danger" type="button" onClick={() => api.disableInvite(item.surpriseId).then(load)}>
                    Disable
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
