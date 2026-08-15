import { useEffect, useState } from 'react';
import api from '../services/api';
import { Users, Box, Sparkles } from 'lucide-react';

export default function AdminDashboardPage() {
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => { Promise.all([api.get('/analytics/overview'), api.get('/users')]).then(([analyticsRes, usersRes]) => { setAnalytics(analyticsRes.data); setUsers(usersRes.data); }).catch(() => setError('Unable to load admin overview.')).finally(() => setLoading(false)); }, []);
  return <div className="page-grid page-grid-dashboard"><section className="hero-card card"><div><p className="eyebrow">Admin dashboard</p><h2>System operations</h2><p className="section-copy">Review users, ticket status, and support analytics.</p></div></section><section className="stats-grid"><article className="stat-card card"><div className="stat-card-top"><Users size={20} /><p>Users</p></div><h3>{users.length}</h3></article><article className="stat-card card"><div className="stat-card-top"><Box size={20} /><p>Total tickets</p></div><h3>{analytics?.total_tickets ?? 0}</h3></article></section><section className="card activity-section"><div className="section-heading"><div><p className="eyebrow">Ticket analytics</p><h3>Status breakdown</h3></div></div>{loading ? <div className="loading-card">Loading analytics…</div> : error ? <div className="alert alert-error">{error}</div> : <div className="analytics-grid">{Object.entries(analytics?.tickets_by_status ?? {}).map(([status, count]) => <div key={status} className="analytics-card"><p>{status}</p><h3>{count}</h3></div>)}</div>}</section><section className="card"><div className="section-heading"><div><p className="eyebrow">Active users</p><h3>Accounts</h3></div></div>{users.length ? <div className="list-card">{users.slice(0, 10).map((user) => <div key={user.id} className="list-item admin-user-item"><div><h3>{user.full_name}</h3><p>{user.email}</p></div><span className="badge badge-pill">{user.role}</span></div>)}</div> : <div className="empty-state"><Sparkles size={32} /><p>No user accounts found.</p></div>}</section></div>;
}
