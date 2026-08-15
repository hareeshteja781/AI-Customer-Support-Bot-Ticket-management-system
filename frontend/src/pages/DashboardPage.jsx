import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { MessageCircle, Box, Headphones, Sparkles, Clock3, CheckCircle2 } from 'lucide-react';

const statsCards = [
  { label: 'Open tickets', key: 'open_tickets', icon: Box },
  { label: 'Pending', key: 'pending_tickets', icon: Clock3 },
  { label: 'Resolved', key: 'resolved_tickets', icon: CheckCircle2 },
  { label: 'Conversations', key: 'conversation_count', icon: MessageCircle },
];

export default function DashboardPage() {
  const [tickets, setTickets] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([api.get('/tickets'), api.get('/chat/conversations')]).then(([ticketsRes, conversationsRes]) => { setTickets(ticketsRes.data); setConversations(conversationsRes.data); }).catch(() => setError('Unable to load support activity.')).finally(() => setLoading(false));
  }, []);

  const summary = useMemo(() => ({
    open_tickets: tickets.filter((item) => item.status === 'open').length,
    pending_tickets: tickets.filter((item) => item.status === 'pending').length,
    resolved_tickets: tickets.filter((item) => item.status === 'resolved').length,
    conversation_count: conversations.length,
  }), [tickets, conversations]);

  return <div className="page-grid page-grid-dashboard">
    <section className="hero-card card"><div><p className="eyebrow">Welcome back</p><h2 className="section-title">How can we help you today?</h2><p className="section-copy">Use AI-powered support, review tickets, and keep conversations organized.</p></div><div className="hero-actions"><button type="button" className="primary-button" onClick={() => navigate('/chat')}>Start AI support</button><button type="button" className="secondary-button" onClick={() => navigate('/tickets')}>Create ticket</button></div></section>
    <section className="stats-grid">{statsCards.map((card) => { const Icon = card.icon; return <article key={card.key} className="stat-card card"><div className="stat-card-top"><div className="stat-icon"><Icon size={20} /></div><p>{card.label}</p></div><h3>{summary[card.key]}</h3></article>; })}</section>
    <section className="activity-section"><div className="section-heading"><div><p className="eyebrow">Recent support activity</p><h3>Latest tickets</h3></div><button type="button" className="link-button" onClick={() => navigate('/tickets')}>View all tickets</button></div><div className="card activity-card">{loading ? <div className="loading-card">Loading tickets…</div> : error ? <div className="alert alert-error">{error}</div> : tickets.length ? <div className="ticket-list">{tickets.slice(0, 4).map((ticket) => <div key={ticket.id} className="ticket-preview"><div><h4>{ticket.ticket_number}</h4><p>{ticket.title}</p></div><span className={`badge ${ticket.status}`}>{ticket.status}</span></div>)}</div> : <div className="empty-state"><p>No ticket activity yet.</p></div>}</div></section>
    <section className="support-panel"><div className="section-heading"><div><p className="eyebrow">Fast actions</p><h3>Quick links</h3></div></div><div className="quick-actions-grid"><button type="button" className="action-card card" onClick={() => navigate('/chat')}><MessageCircle size={20} /><div><p>AI Support</p><span>Get help with the assistant.</span></div></button><button type="button" className="action-card card" onClick={() => navigate('/tickets')}><Box size={20} /><div><p>Create Ticket</p><span>Send an issue to support.</span></div></button><button type="button" className="action-card card" onClick={() => navigate('/conversations')}><Sparkles size={20} /><div><p>Conversation History</p><span>Review past chats.</span></div></button><button type="button" className="action-card card" onClick={() => navigate('/voice')}><Headphones size={20} /><div><p>Voice Support</p><span>Use browser speech tools.</span></div></button></div></section>
  </div>;
}
