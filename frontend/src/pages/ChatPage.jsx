import { useEffect, useRef, useState } from 'react';
import api from '../services/api';
import {
  Send,
  Sparkles,
  Loader2,
  Headphones,
} from 'lucide-react';

const suggestions = [
  'Where is my order?',
  'I need a refund',
  'Track my order',
  'I have an account problem',
  'Create a support ticket',
];

function formatTime(value) {
  if (!value) return '';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '';

  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDateTime(value) {
  if (!value) return '';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '';

  return date.toLocaleString();
}

function normalizeMessage(message, fallbackId) {
  return {
    id: message?.id ?? fallbackId,
    sender_type:
      message?.sender_type ||
      (message?.role === 'user' ? 'customer' : 'assistant'),
    content: message?.content || '',
    created_at: message?.created_at || null,
  };
}

export default function ChatPage() {
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState('');
  const [lastFailedMessage, setLastFailedMessage] = useState('');
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [conversationLoading, setConversationLoading] = useState(false);

  const chatWindowRef = useRef(null);

  const scrollChatToBottom = (behavior = 'smooth') => {
    const element = chatWindowRef.current;

    if (!element) return;

    element.scrollTo({
      top: element.scrollHeight,
      behavior,
    });
  };

  const loadHistory = async () => {
    setHistoryLoading(true);

    try {
      const { data } = await api.get('/chat/conversations');
      const nextHistory = Array.isArray(data) ? data : [];
      setHistory(nextHistory);
      return nextHistory;
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          'Unable to load conversation history.',
      );
      return [];
    } finally {
      setHistoryLoading(false);
    }
  };

  const loadConversation = async (id) => {
    if (!id) return;

    setConversationLoading(true);
    setError('');

    try {
      const { data } = await api.get(
        `/chat/conversations/${id}`,
      );

      const loadedMessages = Array.isArray(data?.messages)
        ? data.messages.map((message, index) =>
            normalizeMessage(message, `message-${index}`),
          )
        : [];

      setConversationId(data?.id ?? id);
      setMessages(loadedMessages);
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          'Unable to load this conversation.',
      );
    } finally {
      setConversationLoading(false);
    }
  };

  const createConversation = async () => {
    const { data } = await api.post('/chat/conversations');

    if (!data?.id) {
      throw new Error('Conversation could not be created.');
    }

    setConversationId(data.id);

    setHistory((previous) => [
      data,
      ...previous.filter((item) => item.id !== data.id),
    ]);

    return data.id;
  };

  const ensureConversation = async () => {
    if (conversationId) return conversationId;
    return createConversation();
  };

  const sendMessage = async (messageText) => {
    const text = messageText.trim();

    if (!text || loading) return;

    setError('');
    setLastFailedMessage('');
    setLoading(true);
    setTyping(true);
    setInput('');

    const localMessage = normalizeMessage(
      {
        id: `local-${Date.now()}`,
        sender_type: 'customer',
        content: text,
        created_at: new Date().toISOString(),
      },
      `local-${Date.now()}`,
    );

    setMessages((previous) => [...previous, localMessage]);

    try {
      const id = await ensureConversation();

      const { data } = await api.post(
        `/chat/conversations/${id}/messages`,
        { content: text },
      );

      const serverMessages = Array.isArray(data?.messages)
        ? data.messages.map((message, index) =>
            normalizeMessage(
              message,
              `server-message-${index}`,
            ),
          )
        : [];

      setConversationId(data?.conversation_id || id);

      if (serverMessages.length > 0) {
        setMessages(serverMessages);
      }

      await loadHistory();
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          'Unable to connect to the AI support service.',
      );
      setLastFailedMessage(text);
    } finally {
      setLoading(false);
      setTyping(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      const conversationHistory = await loadHistory();

      if (!mounted || conversationHistory.length === 0) return;

      await loadConversation(conversationHistory[0].id);
    };

    initialize();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      scrollChatToBottom('smooth');
    });

    return () => window.cancelAnimationFrame(frame);
  }, [messages, typing]);

  const handleInputKeyDown = (event) => {
    if (
      event.key === 'Enter' &&
      !event.shiftKey
    ) {
      event.preventDefault();
      sendMessage(input);
    }
  };

  const handleSuggestion = (suggestion) => {
    setInput(suggestion);
    sendMessage(suggestion);
  };

  return (
    <div className="page-grid page-grid-chat page-full-height">
      <section className="chat-pane card">
        <div className="section-heading chat-section-heading">
          <div>
            <p className="eyebrow">AI Support</p>
            <h2>Ask your support assistant</h2>
            <p className="chat-page-description">
              Ask a question and continue the conversation inside the
              scrollable chat area below.
            </p>
          </div>

          <button
            type="button"
            className="secondary-button"
            onClick={() =>
              sendMessage('Can you help me with my recent order?')
            }
            disabled={loading}
          >
            Quick start
          </button>
        </div>

        <div className="chat-window" ref={chatWindowRef}>
          {conversationLoading ? (
            <div className="empty-state empty-state-chat">
              <Loader2 className="spinner" size={28} />
              <p>Loading conversation...</p>
            </div>
          ) : messages.length > 0 ? (
            <div className="chat-message-list">
              {messages.map((message) => {
                const isCustomer =
                  message.sender_type === 'customer';

                return (
                  <article
                    key={message.id}
                    className={`chat-bubble ${
                      isCustomer
                        ? 'chat-bubble-user'
                        : 'chat-bubble-ai'
                    }`}
                  >
                    <div className="chat-bubble-header">
                      <div className="chat-avatar">
                        {isCustomer ? 'You' : 'AI'}
                      </div>

                      <span className="chat-sender-name">
                        {isCustomer ? 'You' : 'AI Assistant'}
                      </span>

                      <span className="chat-time">
                        {formatTime(message.created_at)}
                      </span>
                    </div>

                    <p className="chat-message-content">
                      {message.content}
                    </p>
                  </article>
                );
              })}

              {typing && (
                <div className="typing-indicator">
                  <Loader2 className="spinner" size={18} />
                  <span>AI is preparing a response...</span>
                </div>
              )}
            </div>
          ) : (
            <div className="empty-state empty-state-chat">
              <Sparkles size={34} />
              <p>Start your first AI conversation.</p>
              <span>
                Ask about orders, refunds, accounts, or support tickets.
              </span>
            </div>
          )}
        </div>

        <div className="chat-composer">
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="Describe your issue..."
            rows={4}
            disabled={loading}
            aria-label="Describe your issue"
          />

          <div className="chat-composer-actions">
            <span className="chat-composer-hint">
              Enter to send · Shift + Enter for a new line
            </span>

            <button
              type="button"
              className="primary-button chat-send-button"
              onClick={() => sendMessage(input)}
              disabled={loading || !input.trim()}
            >
              {loading ? (
                <>
                  <Loader2 className="spinner" size={16} />
                  Sending...
                </>
              ) : (
                <>
                  <Send size={16} />
                  Send
                </>
              )}
            </button>
          </div>
        </div>

        <div className="suggestions-row">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              className="pill-button"
              onClick={() => handleSuggestion(suggestion)}
              disabled={loading}
            >
              {suggestion}
            </button>
          ))}
        </div>

        {error && (
          <div className="alert alert-error">
            <div className="chat-error-content">
              <span>{error}</span>

              {lastFailedMessage && (
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => sendMessage(lastFailedMessage)}
                  disabled={loading}
                >
                  Retry
                </button>
              )}
            </div>
          </div>
        )}
      </section>

      <aside className="panel-card card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Helpful support</p>
            <h3>Conversation history</h3>
          </div>
        </div>

        {historyLoading ? (
          <div className="loading-card">
            <Loader2 className="spinner" size={20} />
            <span>Loading history...</span>
          </div>
        ) : history.length > 0 ? (
          <div className="preview-list">
            {history.slice(0, 8).map((item) => (
              <button
                type="button"
                key={item.id}
                className={`preview-item ${
                  item.id === conversationId ? 'active' : ''
                }`}
                onClick={() => loadConversation(item.id)}
                disabled={conversationLoading}
              >
                <div>
                  <p>
                    {item.title || `Conversation #${item.id}`}
                  </p>
                  <span>{formatDateTime(item.updated_at)}</span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>Your support conversations will appear here.</p>
          </div>
        )}

        <div className="panel-divider" />

        <div className="voice-support-panel">
          <p className="eyebrow">Voice support</p>

          <div className="voice-mic-card">
            <Headphones size={24} />

            <div>
              <p>Browser voice support</p>
              <span>
                Use the Voice Support page for speech input.
              </span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}