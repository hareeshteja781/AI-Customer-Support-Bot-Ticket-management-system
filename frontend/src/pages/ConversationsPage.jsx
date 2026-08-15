import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Search, Sparkles } from 'lucide-react';

export default function ConversationsPage() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    api.get('/chat/conversations').then(({ data }) => setConversations(data)).catch(() => setError('Unable to load conversations.')).finally(() => setLoading(false));
  }, []);

  const filtered = conversations.filter((item) => (item.title || '').toLowerCase().includes(query.toLowerCase()));

  return <div className="page-grid page-grid-full page-full-height"><section className="card page-card-scroll">
    <div className="section-heading"><div><p className="eyebrow">Conversation history</p><h2>All chats</h2></div><div className="search-box"><Search size={16} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search conversations" /></div></div>
    {loading ? <div className="loading-card">Loading conversation history…</div> : error ? <div className="alert alert-error">{error}</div> : filtered.length ? <div className="list-card">{filtered.map((conversation) => <Link key={conversation.id} to={`/conversations/${conversation.id}`} className="list-item"><div><h3>{conversation.title || `Conversation #${conversation.id}`}</h3><p>{conversation.status}</p></div><div className="list-meta"><span>{conversation.updated_at ? new Date(conversation.updated_at).toLocaleString() : ''}</span></div></Link>)}</div> : <div className="empty-state"><Sparkles size={32} /><p>No conversations found yet.</p></div>}
  </section></div>;
}
