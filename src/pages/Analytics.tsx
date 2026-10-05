import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Line, LineChart, Pie, PieChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { api } from '../lib/api';
import { ErrorBox, Loading, PageHeader } from '../components/ui';

const COLORS = ['#F21C92', '#7526D9', '#FF735E', '#22C55E', '#3B82F6'];

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.analytics().then(setData).catch(err => setError(err.message));
  }, []);

  if (error) return <ErrorBox message={error} />;
  if (!data) return <Loading />;

  return (
    <div className="stack">
      <PageHeader title="Analytics" sub="Trends across surprises and wishes." />
      <div className="grid grid-2">
        <div className="card">
          <h3>Wishes over 30 days</h3>
          <div className="chart-box">
            <ResponsiveContainer>
              <LineChart data={data.wishesTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" hide />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#7526D9" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card">
          <h3>Wishes by type</h3>
          <div className="chart-box">
            <ResponsiveContainer>
              <BarChart data={data.byKind}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="kind" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#F21C92" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card">
          <h3>Surprises by status</h3>
          <div className="chart-box">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={data.byStatus} dataKey="count" nameKey="status" outerRadius={90}>
                  {data.byStatus.map((_: unknown, index: number) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card">
          <h3>Occasions</h3>
          <div className="chart-box">
            <ResponsiveContainer>
              <BarChart data={data.occasions}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="occasion" hide />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#7526D9" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
