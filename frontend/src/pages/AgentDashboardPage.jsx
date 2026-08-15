import { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import { ShieldCheck, Box, Sparkles, Clock3 } from 'lucide-react';

export default function AgentDashboardPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => { api.get('/tickets').then(({ data }) => setTickets(data)).catch(() => setError('Unable to load agent tickets.')).finally(() => setLoading(false)); }, []);
  const metrics = useMemo(() => ({ total: tickets.length, open: tickets.filter((item) => item.status === 'open').length, high: tickets.filter((item) => item.priority === 'high').length }), [tickets]);
  return <div className="page-grid page-grid-dashboard"><section className="hero-card card"><div><p className="eyebrow">Agent dashboard</p><h2>Support operations</h2><p className="section-copy">Monitor the support queue and prioritize customer requests.</p></div></section><section className="stats-grid"><article className="stat-card card"><div className="stat-card-top"><Box size={20} /><p>Total tickets</p></div><h3>{metrics.total}</h3></article><article className="stat-card card"><div className="stat-card-top"><Clock3 size={20} /><p>Open tickets</p></div><h3>{metrics.open}</h3></article><article className="stat-card card"><div className="stat-card-top"><ShieldCheck size={20} /><p>High priority</p></div><h3>{metrics.high}</h3></article></section><section className="card activity-section"><div className="section-heading"><div><p className="eyebrow">Recent requests</p><h3>Latest tickets</h3></div></div>{loading ? <div className="loading-card">Loading ticket queue…</div> : error ? <div className="alert alert-error">{error}</div> : tickets.length ? <div className="ticket-list">{tickets.slice(0, 8).map((ticket) => <div key={ticket.id} className="ticket-preview"><div><h4>{ticket.ticket_number}</h4><p>{ticket.title}</p></div><span className={`badge ${ticket.status}`}>{ticket.status}</span></div>)}</div> : <div className="empty-state"><Sparkles size={32} /><p>No active ticket activity available.</p></div>}</section></div>;
}
