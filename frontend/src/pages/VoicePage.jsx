import { useRef, useState } from 'react';
import { Mic, StopCircle, Waves } from 'lucide-react';
import api from '../services/api';

const getSpeechRecognition = () => (typeof window === 'undefined' ? null : window.SpeechRecognition || window.webkitSpeechRecognition || null);

export default function VoicePage() {
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [status, setStatus] = useState('Start a session to speak with AI support.');
  const [transcript, setTranscript] = useState('');
  const [assistantReply, setAssistantReply] = useState('');
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);

  const speechSupported = Boolean(getSpeechRecognition());
  const synthesisSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  const stopListening = () => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setListening(false);
  };

  const speak = (text) => {
    if (!synthesisSupported || !text) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const sendTranscript = async (text) => {
    try {
      setStatus('Sending transcript to AI support...');
      const { data: conversations } = await api.get('/chat/conversations');
      let conversationId = conversations[0]?.id;
      if (!conversationId) {
        const { data } = await api.post('/chat/conversations');
        conversationId = data.id;
      }
      const { data } = await api.post(`/chat/conversations/${conversationId}/messages`, { content: text });
      const reply = data.message?.content || data.messages?.at(-1)?.content || 'The assistant did not return a response.';
      setAssistantReply(reply);
      setStatus('AI response ready.');
      speak(reply);
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to send the transcript to AI support.');
      setStatus('');
    }
  };

  const startListening = () => {
    const Recognition = getSpeechRecognition();
    if (!Recognition) { setError('Speech recognition is not supported in this browser.'); return; }
    setError(null); setTranscript(''); setAssistantReply(''); setStatus('Listening...');
    const recognition = new Recognition();
    recognition.lang = 'en-US'; recognition.interimResults = false; recognition.continuous = false; recognition.maxAlternatives = 1;
    recognition.onstart = () => setListening(true);
    recognition.onresult = (event) => {
      const text = event.results[0]?.[0]?.transcript?.trim();
      if (text) { setTranscript(text); sendTranscript(text); } else { setStatus('No speech detected.'); }
    };
    recognition.onerror = (event) => { setError(event.error === 'not-allowed' ? 'Microphone access was denied.' : 'Speech recognition failed.'); setListening(false); };
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    try { recognition.start(); } catch { setError('Unable to start microphone.'); setListening(false); }
  };

  const toggle = () => { if (listening) stopListening(); else startListening(); };
  const endSession = () => { stopListening(); window.speechSynthesis?.cancel(); setSpeaking(false); setTranscript(''); setAssistantReply(''); setStatus('Session ended.'); setError(null); };

  return <div className="page-grid page-grid-full"><section className="card voice-card"><div className="section-heading"><div><p className="eyebrow">Voice support</p><h2>Browser voice assistance</h2></div></div><div className={`voice-visualizer ${listening ? 'voice-visualizer-listening' : ''} ${speaking ? 'voice-visualizer-speaking' : ''}`}><div className="voice-ring"><Mic size={36} /></div><div className="wave-row"><Waves size={24} /><Waves size={24} /><Waves size={24} /></div><div className="voice-status-pill">{error || status}</div></div><div className="voice-actions"><button type="button" className="primary-button" onClick={toggle} disabled={!speechSupported || !synthesisSupported}>{listening ? 'Stop listening' : 'Start voice session'}</button><button type="button" className="secondary-button" onClick={endSession}><StopCircle size={16} /> End session</button></div>{(!speechSupported || !synthesisSupported) && <div className="alert alert-warning">Use Chrome or Edge with microphone permission for browser voice features.</div>}<div className="voice-summary-grid"><div className="session-box"><p className="detail-label">Transcript</p><p>{transcript || 'Your speech will appear here.'}</p></div><div className="session-box"><p className="detail-label">AI response</p><p>{assistantReply || 'The AI response will appear here.'}</p></div></div></section></div>;
}
