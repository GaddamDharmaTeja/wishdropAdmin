import { useEffect, useState, type ChangeEvent } from 'react';
import { api, resolveMediaUrl } from '../lib/api';
import { ErrorBox, Loading, PageHeader } from '../components/ui';

type Frame = { id: string; key: string; title: string; imageUrl: string; active: boolean; sortOrder: number };

export default function FramesPage() {
  const [frames, setFrames] = useState<Frame[] | null>(null);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');

  const load = () => api.frames().then(result => setFrames(result.frames)).catch(err => setError(err.message));
  useEffect(() => { load(); }, []);

  const replaceImage = async (frame: Frame, event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      setBusyId(frame.id);
      const { url } = await api.uploadFrame(file);
      await api.patchFrame(frame.id, { imageUrl: url });
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not upload the frame.');
    } finally {
      setBusyId('');
      event.target.value = '';
    }
  };

  if (error) return <ErrorBox message={error} />;
  if (!frames) return <Loading />;

  return (
    <div className="stack">
      <PageHeader title="Surprise Frames" sub="Manage the six visual frames creators can select for a surprise." />
      <p className="muted">Upload a new PNG, JPG, or WebP to replace any frame. Changes apply to existing surprises using that frame too.</p>
      <div className="frame-grid">
        {frames.map(frame => (
          <div className="frame-card" key={frame.id}>
            <img src={resolveMediaUrl(frame.imageUrl)} alt={frame.title} />
            <div className="stack" style={{ padding: 12 }}>
              <strong>{frame.title}</strong>
              <span className="muted">Key: {frame.key}</span>
              <label className="btn secondary" style={{ textAlign: 'center' }}>
                {busyId === frame.id ? 'Uploading…' : 'Replace image'}
                <input type="file" accept="image/png,image/jpeg,image/webp" hidden disabled={Boolean(busyId)} onChange={event => void replaceImage(frame, event)} />
              </label>
              <div className="row">
                <button className="btn secondary" type="button" onClick={async () => { await api.patchFrame(frame.id, { active: !frame.active }); load(); }}>
                  {frame.active ? 'Disable' : 'Enable'}
                </button>
                <button className="btn danger" type="button" onClick={async () => { if (confirm(`Delete ${frame.title}?`)) { await api.deleteFrame(frame.id); load(); } }}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
