import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './ChatPage.css';

export default function ChatPage({ documents }) {
  const { authFetch } = useAuth();
  const { showToast } = useToast();
  const [sessions, setSessions] = useState(JSON.parse(localStorage.getItem('chatSessions') || '[]'));
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [linkedDocIds, setLinkedDocIds] = useState(new Set());
  const [question, setQuestion] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const currentSession = sessions.find(s => s.id === currentSessionId);

  useEffect(() => {
    localStorage.setItem('chatSessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentSession?.messages]);

  const createSession = async () => {
    try {
      const res = await authFetch('/chat/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error('Failed to create session');
      const data = await res.json();

      const newSession = { id: data.session_id, created_at: new Date().toISOString(), messages: [] };
      setSessions(prev => [...prev, newSession]);
      setCurrentSessionId(data.session_id);
      setLinkedDocIds(new Set());
      showToast('New chat session created!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const selectSession = (id) => {
    setCurrentSessionId(id);
    setLinkedDocIds(new Set());
  };

  const linkDocument = async (docId) => {
    if (linkedDocIds.has(docId)) return;
    try {
      const res = await authFetch('/chat/link-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: currentSessionId, document_id: docId }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Failed to link');
      }
      setLinkedDocIds(prev => new Set([...prev, docId]));
      showToast('Document linked!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleAsk = async (e) => {
    e.preventDefault();
    if (!question.trim() || !currentSessionId) return;

    const q = question.trim();
    setQuestion('');
    setSending(true);

    setSessions(prev => prev.map(s =>
      s.id === currentSessionId
        ? { ...s, messages: [...s.messages, { role: 'user', content: q }] }
        : s
    ));

    try {
      const res = await authFetch('/chat/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: currentSessionId, question: q }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Failed to get answer');
      }

      const data = await res.json();

      setSessions(prev => prev.map(s =>
        s.id === currentSessionId
          ? { ...s, messages: [...s.messages, { role: 'assistant', content: data.answer }] }
          : s
      ));
    } catch (err) {
      setSessions(prev => prev.map(s =>
        s.id === currentSessionId
          ? { ...s, messages: [...s.messages, { role: 'assistant', content: `Error: ${err.message}` }] }
          : s
      ));
      showToast(err.message, 'error');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="chat-page">
      {/* Sidebar */}
      <aside className="chat-sidebar">
        <div className="sidebar-top">
          <h3>Chat Sessions</h3>
          <button className="btn-new-chat" onClick={createSession}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            New Chat
          </button>
        </div>

        <div className="sessions-list">
          {sessions.length === 0 ? (
            <p className="empty-sm">No sessions yet</p>
          ) : (
            sessions.map((s, i) => (
              <button key={s.id} className={`session-item ${s.id === currentSessionId ? 'session-active' : ''}`} onClick={() => selectSession(s.id)}>
                <span className="session-dot" />
                <span className="session-label">Chat {i + 1}</span>
                <span className="session-msgs">{s.messages.length}</span>
              </button>
            ))
          )}
        </div>

        {/* Link Documents */}
        {currentSessionId && (
          <div className="link-section">
            <h4>Link Documents</h4>
            <p className="link-hint">Select documents to use in this chat</p>
            <div className="link-list">
              {documents.length === 0 ? (
                <p className="empty-sm">Upload documents first</p>
              ) : (
                documents.map(doc => {
                  const isLinked = linkedDocIds.has(doc.id);
                  return (
                    <button key={doc.id} className={`link-item ${isLinked ? 'link-item-linked' : ''}`} onClick={() => !isLinked && linkDocument(doc.id)}>
                      <span className="link-check">
                        {isLinked && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>}
                      </span>
                      <span className="link-name">{doc.file_name}</span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </aside>

      {/* Main Chat */}
      <main className="chat-main">
        {!currentSessionId ? (
          <div className="chat-welcome">
            <div className="welcome-icon">
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <h3>Start a conversation</h3>
            <p>Create a new chat session, link your documents, and ask questions about them.</p>
          </div>
        ) : (
          <>
            <div className="chat-topbar">
              <h3>Chat Session {sessions.findIndex(s => s.id === currentSessionId) + 1}</h3>
              <span className="linked-count">
                {linkedDocIds.size === 0 ? 'No documents linked' : `${linkedDocIds.size} doc${linkedDocIds.size > 1 ? 's' : ''} linked`}
              </span>
            </div>

            <div className="chat-messages">
              {currentSession?.messages.length === 0 && (
                <div className="chat-hint">
                  <p>💡 Link a document from the sidebar, then ask a question about it!</p>
                </div>
              )}
              {currentSession?.messages.map((msg, i) => (
                <div key={i} className={`message message-${msg.role}`}>
                  <div className="msg-avatar">
                    {msg.role === 'user' ? 'U' : 'AI'}
                  </div>
                  <div className="msg-bubble">{msg.content}</div>
                </div>
              ))}
              {sending && (
                <div className="message message-assistant">
                  <div className="msg-avatar">AI</div>
                  <div className="msg-bubble msg-thinking">
                    <span className="thinking-dot" />
                    <span className="thinking-dot" />
                    <span className="thinking-dot" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form className="chat-input-area" onSubmit={handleAsk}>
              <div className="chat-input-box">
                <input
                  type="text"
                  placeholder="Ask a question about your documents..."
                  value={question}
                  onChange={e => setQuestion(e.target.value)}
                  disabled={sending}
                />
                <button type="submit" className="btn-send" disabled={sending || !question.trim()}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </div>
            </form>
          </>
        )}
      </main>
    </div>
  );
}
