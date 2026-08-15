import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../services/api';
import { ArrowLeft, MessageSquare } from 'lucide-react';

export default function ConversationDetailPage() {
  const { id } = useParams();
  const [conversation, setConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get(`/chat/conversations/${id}`).then(({ data }) => setConversation(data)).catch(() => setError('Unable to load the conversation.')).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="page-shell loading-screen">Loading conversation…</div>;
  return <div className="page-grid page-grid-full"><section className="card detail-card">
    <div className="section-heading"><div><Link to="/conversations" className="link-button"><ArrowLeft size={16} /> Back</Link><p className="eyebrow">Conversation details</p><h2>{conversation?.title || `Conversation #${id}`}</h2></div></div>
    {error ? <div className="alert alert-error">{error}</div> : (conversation?.messages?.length ? <div className="message-thread">{conversation.messages.map((message) => <div key={message.id} className={`chat-bubble ${message.sender_type === 'customer' ? 'chat-bubble-user' : 'chat-bubble-ai'}`}><div className="chat-bubble-header"><span>{message.sender_type === 'customer' ? 'You' : 'AI Assistant'}</span><span className="chat-time">{message.created_at ? new Date(message.created_at).toLocaleString() : ''}</span></div><p>{message.content}</p></div>)}</div> : <div className="empty-state"><MessageSquare size={32} /><p>No messages are available for this conversation.</p></div>)}
  </section></div>;
}
