import { useEffect, useState } from 'react';
import api from '../services/api';

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => { api.get('/analytics/overview').then(({ data }) => setAnalytics(data)).catch(() => setError('Unable to load analytics overview.')).finally(() => setLoading(false)); }, []);
  return <div className="page-grid page-grid-full"><section className="card"><div className="section-heading"><div><p className="eyebrow">Analytics</p><h2>Support overview</h2></div></div>{loading ? <div className="loading-card">Loading analytics…</div> : error ? <div className="alert alert-error">{error}</div> : <div className="analytics-grid full">{Object.entries(analytics?.tickets_by_status ?? {}).map(([status, count]) => <div key={status} className="analytics-card"><p>{status}</p><h3>{count}</h3></div>)}<div className="analytics-card"><p>Total tickets</p><h3>{analytics?.total_tickets ?? 0}</h3></div><div className="analytics-card"><p>High priority</p><h3>{analytics?.high_priority_tickets ?? 0}</h3></div></div>}</section></div>;
}
