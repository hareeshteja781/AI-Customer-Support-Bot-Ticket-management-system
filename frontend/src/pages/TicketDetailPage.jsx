import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../services/api';
import { ArrowLeft } from 'lucide-react';

export default function TicketDetailPage() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { api.get(`/tickets/${id}`).then(({ data }) => setTicket(data)).catch(() => setError('Unable to load ticket details.')).finally(() => setLoading(false)); }, [id]);
  if (loading) return <div className="page-shell loading-screen">Loading ticket…</div>;
  return <div className="page-grid page-grid-full"><section className="card detail-card">{error ? <div className="alert alert-error">{error}</div> : <>
    <div className="section-heading"><div><Link to="/tickets" className="link-button"><ArrowLeft size={16} /> Back</Link><p className="eyebrow">Ticket details</p><h2>{ticket.ticket_number}</h2></div><span className={`badge ${ticket.status}`}>{ticket.status}</span></div>
    <div className="detail-grid"><div><p className="detail-label">Subject</p><h3>{ticket.title}</h3></div><div><p className="detail-label">Category</p><span>{ticket.category}</span></div><div><p className="detail-label">Priority</p><span>{ticket.priority}</span></div><div><p className="detail-label">Updated</p><span>{ticket.updated_at ? new Date(ticket.updated_at).toLocaleString() : '-'}</span></div></div>
    <div className="detail-copy"><p className="detail-label">Description</p><p>{ticket.description}</p></div>
  </>}</section></div>;
}
