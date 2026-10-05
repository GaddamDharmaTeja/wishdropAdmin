import { useEffect, useState } from 'react';
import { api, resolveMediaUrl } from '../lib/api';
import { ErrorBox, Loading, PageHeader } from '../components/ui';

function MediaPreview({ item }: { item: { kind: string; uri: string; name: string } }) {
  const src = resolveMediaUrl(item.uri);
  const [failed, setFailed] = useState(false);

  if (item.kind === 'image') {
    if (failed) {
      return (
        <div
          className="meta"
          style={{
            height: 120,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          Image unavailable
          <div>
            <a href={src} target="_blank" rel="noreferrer" style={{ color: 'var(--pink)' }}>
              Open URL
            </a>
          </div>
        </div>
      );
    }
    return <img src={src} alt={item.name} onError={() => setFailed(true)} />;
  }

  if (item.kind === 'video') {
    return (
      <video
        src={src}
        style={{ width: '100%', height: 120, objectFit: 'cover', background: '#1a1530', display: 'block' }}
        muted
        playsInline
        preload="metadata"
      />
    );
  }

  return <div className="meta">{item.kind.toUpperCase()}</div>;
}

export default function MediaPage() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');
  const [kind, setKind] = useState('');

  const load = () => {
    const params = new URLSearchParams({ page: '1', limit: '60' });
    if (kind) params.set('kind', kind);
    api
      .media(`?${params}`)
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
      <PageHeader title="Media" sub={`${data.total} uploaded assets`} />
      <div className="row">
        <select value={kind} onChange={e => setKind(e.target.value)}>
          <option value="">All types</option>
          {['image', 'video', 'audio', 'music'].map(item => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <button className="btn" type="button" onClick={load}>
          Filter
        </button>
      </div>
      <div className="media-grid">
        {data.media.map((item: any) => (
          <div key={item.id} className="media-tile">
            <MediaPreview item={item} />
            <div className="meta">
              <div title={item.name}>{item.name}</div>
              <a href={resolveMediaUrl(item.uri)} target="_blank" rel="noreferrer" style={{ color: 'var(--pink)', fontSize: 12 }}>
                Open
              </a>
              <button
                className="btn danger"
                type="button"
                style={{ marginTop: 8 }}
                onClick={async () => {
                  await api.deleteMedia(item.id);
                  load();
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
