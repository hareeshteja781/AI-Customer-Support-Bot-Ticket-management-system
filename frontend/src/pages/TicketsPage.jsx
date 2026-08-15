import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Plus } from 'lucide-react';

const initialForm = { title: '', description: '', category: 'general', priority: 'medium' };

export default function TicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [creating, setCreating] = useState(false);
  const [success, setSuccess] = useState(null);

  const loadTickets = async () => {
    try {
      const { data } = await api.get('/tickets');
      setTickets(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to load tickets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const { data } = await api.get('/tickets');
        if (active) setTickets(data);
      } catch (err) {
        if (active) setError(err.response?.data?.detail || 'Unable to load tickets.');
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setCreating(true); setError(null); setSuccess(null);
    try {
      await api.post('/tickets', form);
      setForm(initialForm); setSuccess('Ticket created successfully.'); await loadTickets();
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to create ticket.');
    } finally { setCreating(false); }
  };

  return <div className="page-grid page-grid-tickets">
    <section className="card ticket-list-card"><div className="section-heading"><div><p className="eyebrow">Ticket management</p><h2>Support tickets</h2></div></div>
      {loading ? <div className="loading-card">Loading tickets…</div> : error && !tickets.length ? <div className="alert alert-error">{error}</div> : tickets.length ? <div className="table-wrap"><table className="table ticket-table"><thead><tr><th>Ticket</th><th>Subject</th><th>Priority</th><th>Status</th><th>Updated</th></tr></thead><tbody>{tickets.map((ticket) => <tr key={ticket.id}><td><Link to={`/tickets/${ticket.id}`} className="link-primary">{ticket.ticket_number}</Link></td><td>{ticket.title}</td><td><span className={`badge ${ticket.priority}`}>{ticket.priority}</span></td><td><span className={`badge ${ticket.status}`}>{ticket.status}</span></td><td>{ticket.updated_at ? new Date(ticket.updated_at).toLocaleDateString() : '-'}</td></tr>)}</tbody></table></div> : <div className="empty-state"><p>No tickets yet.</p></div>}
    </section>
    <aside className="card ticket-form-card"><div className="section-heading"><div><p className="eyebrow">Create a ticket</p><h3>New support request</h3></div><Plus size={20} /></div><form className="form-stack" onSubmit={handleSubmit}>
      <label>Subject<input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></label>
      <label>Description<textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows="5" required /></label>
      <label>Category<select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}><option value="general">General</option><option value="billing">Billing</option><option value="orders">Orders</option><option value="shipping">Shipping</option><option value="account">Account</option></select></label>
      <label>Priority<select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></label>
      <button type="submit" className="primary-button" disabled={creating}>{creating ? 'Submitting…' : 'Submit ticket'}</button>
      {success && <div className="alert alert-success">{success}</div>}{error && <div className="alert alert-error">{error}</div>}
    </form></aside>
  </div>;
}
