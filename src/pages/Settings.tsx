import { useEffect, useState, type FormEvent } from 'react';
import { api } from '../lib/api';
import { ErrorBox, Loading, PageHeader } from '../components/ui';

export default function SettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState('');
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    api
      .settings()
      .then(result => setSettings(result.settings))
      .catch(err => setError(err.message));
  }, []);

  if (error) return <ErrorBox message={error} />;
  if (!settings) return <Loading />;

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaved('');
    try {
      const result = await api.patchSettings(settings);
      setSettings(result.settings);
      setSaved('Settings saved.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    }
  };

  return (
    <div className="stack">
      <PageHeader title="Settings" sub="Global WishDrop configuration." />
      <form className="card stack" onSubmit={onSubmit}>
        <label className="field">
          App name
          <input value={settings.appName} onChange={e => setSettings({ ...settings, appName: e.target.value })} />
        </label>
        <label className="field">
          Support email
          <input value={settings.supportEmail} onChange={e => setSettings({ ...settings, supportEmail: e.target.value })} />
        </label>
        <label className="field">
          Default link expiry (days)
          <input
            type="number"
            value={settings.defaultLinkExpiryDays}
            onChange={e => setSettings({ ...settings, defaultLinkExpiryDays: Number(e.target.value) })}
          />
        </label>
        <label className="field">
          Max media upload (MB)
          <input
            type="number"
            value={settings.maxMediaUploadMb}
            onChange={e => setSettings({ ...settings, maxMediaUploadMb: Number(e.target.value) })}
          />
        </label>
        {(
          [
            ['allowRegistration', 'Allow user registration'],
            ['enableAnonymousWishes', 'Enable anonymous wishes'],
            ['maintenanceMode', 'Maintenance mode'],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="row">
            <input
              type="checkbox"
              checked={Boolean(settings[key])}
              onChange={e => setSettings({ ...settings, [key]: e.target.checked })}
            />
            {label}
          </label>
        ))}
        {saved ? <p className="muted">{saved}</p> : null}
        <button className="btn" type="submit">
          Save settings
        </button>
      </form>
      <section className="card stack" style={{ borderColor: '#ef4444' }}>
        <div>
          <h2 style={{ margin: 0, color: '#b91c1c' }}>Danger zone</h2>
          <p className="muted">These actions are permanent. The administrator account and configuration are retained so you can still sign in.</p>
        </div>
        <button className="btn secondary" type="button" disabled={clearing} onClick={async () => {
          if (!confirm('Clear other active sessions?')) return;
          setClearing(true); try { await api.clearData('sessions'); setSaved('Other sessions cleared.'); } catch (err) { setError(err instanceof Error ? err.message : 'Could not clear sessions'); } finally { setClearing(false); }
        }}>Clear session cache</button>
        <button className="btn danger" type="button" disabled={clearing} onClick={async () => {
          if (prompt('Type CLEAR to delete all surprises, wishes, uploaded media, reports, and notifications.') !== 'CLEAR') return;
          setClearing(true); try { await api.clearData('content'); setSaved('All content data cleared.'); } catch (err) { setError(err instanceof Error ? err.message : 'Could not clear content'); } finally { setClearing(false); }
        }}>Clear content data</button>
        <button className="btn danger" type="button" disabled={clearing} onClick={async () => {
          if (prompt('Type CLEAR to delete every non-admin user and all MongoDB app data.') !== 'CLEAR') return;
          setClearing(true); try { await api.clearData('all-data'); setSaved('All non-admin app data cleared.'); } catch (err) { setError(err instanceof Error ? err.message : 'Could not clear data'); } finally { setClearing(false); }
        }}>Clear all MongoDB app data</button>
      </section>
    </div>
  );
}
