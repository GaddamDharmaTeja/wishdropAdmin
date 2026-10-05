import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CartesianGrid, Line, LineChart, Pie, PieChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { api } from '../lib/api';
import { ErrorBox, Loading, PageHeader, StatusBadge } from '../components/ui';

const COLORS = ['#F21C92', '#7526D9', '#FF735E', '#22C55E', '#3B82F6', '#F59E0B'];

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.stats().then(setData).catch(err => setError(err.message));
  }, []);

  if (error) return <ErrorBox message={error} />;
  if (!data) return <Loading />;

  return (
    <div className="stack">
      <PageHeader title="Dashboard" sub="Live overview of WishDrop activity." />
      <div className="grid grid-4">
        {[
          ['Total Surprises', data.totals.surprises],
          ['Total Wishes', data.totals.wishes],
          ['Total Users', data.totals.users],
          ['Open Reports', data.totals.reports],
        ].map(([label, value]) => (
          <div key={label as string} className="card">
            <div className="muted">{label}</div>
            <div className="kpi">{value}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-2">
        <div className="card">
          <h3>Wishes trend</h3>
          <div className="chart-box">
            <ResponsiveContainer>
              <LineChart data={data.wishesTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" hide />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#F21C92" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card">
          <h3>Top occasions</h3>
          <div className="chart-box">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={data.occasions} dataKey="count" nameKey="occasion" outerRadius={90}>
                  {data.occasions.map((_: unknown, index: number) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <div className="grid grid-2">
        <div className="card table-wrap">
          <h3>Recent surprises</h3>
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Recipient</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.recentSurprises.map((item: any) => (
                <tr key={item.id}>
                  <td>
                    <Link to={`/surprises/${item.id}`} style={{ color: 'var(--pink)', fontWeight: 700 }}>
                      {item.title}
                    </Link>
                  </td>
                  <td>{item.recipientName}</td>
                  <td>
                    <StatusBadge value={item.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card table-wrap">
          <h3>Recent reports</h3>
          <table>
            <thead>
              <tr>
                <th>Reason</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {data.recentReports.map((item: any) => (
                <tr key={item.id}>
                  <td>{item.reason}</td>
                  <td>
                    <StatusBadge value={item.status} />
                  </td>
                  <td>
                    <Link to={`/reports/${item.id}`} style={{ color: 'var(--pink)', fontWeight: 700 }}>
                      Open
                    </Link>
                  </td>
                </tr>
              ))}
              {!data.recentReports.length ? (
                <tr>
                  <td colSpan={3} className="empty">
                    No reports yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
