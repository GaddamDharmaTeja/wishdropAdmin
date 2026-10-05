import { useEffect, useState, type FormEvent } from 'react';
import { api } from '../lib/api';
import { ErrorBox, Loading, PageHeader } from '../components/ui';

export default function SettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState('');

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
    </div>
  );
}
