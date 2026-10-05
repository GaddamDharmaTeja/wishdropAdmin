import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api, resolveMediaUrl } from '../lib/api';
import { DetailLink, ErrorBox, Loading, PageHeader, StatusBadge } from '../components/ui';

export function WishesList() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.wishes('?page=1&limit=50').then(setData).catch(err => setError(err.message));
  }, []);

  if (error) return <ErrorBox message={error} />;
  if (!data) return <Loading />;

  return (
    <div className="stack">
      <PageHeader title="Wishes" sub={`${data.total} contributions across all surprises`} />
      <div className="card table-wrap">
        <table>
          <thead>
            <tr>
              <th>Author</th>
              <th>Message</th>
              <th>Media</th>
              <th>Moderation</th>
              <th>Surprise</th>
            </tr>
          </thead>
          <tbody>
            {data.wishes.map((wish: any) => (
              <tr key={wish.id}>
                <td>
                  <DetailLink to={`/wishes/${wish.id}`}>{wish.authorName}</DetailLink>
                </td>
                <td>{wish.message}</td>
                <td>{wish.media?.length || 0}</td>
                <td>
                  <StatusBadge value={wish.moderation} />
                </td>
                <td>
                  <DetailLink to={`/surprises/${wish.surpriseId}`}>Open</DetailLink>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function WishDetail() {
  const { id = '' } = useParams();
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');

  const load = () => api.wish(id).then(setData).catch(err => setError(err.message));
  useEffect(() => {
    load();
  }, [id]);

  if (error) return <ErrorBox message={error} />;
  if (!data) return <Loading />;

  return (
    <div className="stack">
      <PageHeader title={data.wish.authorName} sub={data.surprise?.title || 'Wish detail'} />
      <div className="card stack">
        <p>{data.wish.message}</p>
        <div>
          Moderation: <StatusBadge value={data.wish.moderation} />
        </div>
        {data.wish.media?.map((item: any) => {
          const src = resolveMediaUrl(item.uri);
          return (
            <div key={item.id} className="stack">
              {item.kind === 'image' ? (
                <img src={src} alt={item.name} style={{ maxWidth: 320, borderRadius: 12 }} />
              ) : (
                <a href={src} target="_blank" rel="noreferrer" style={{ color: 'var(--pink)' }}>
                  {item.kind}: {item.name}
                </a>
              )}
            </div>
          );
        })}
        <div className="row">
          <button className="btn secondary" type="button" onClick={() => api.patchWish(id, { moderation: 'visible' }).then(load)}>
            Mark visible
          </button>
          <button className="btn danger" type="button" onClick={() => api.deleteWish(id).then(load)}>
            Delete wish
          </button>
        </div>
      </div>
    </div>
  );
}
