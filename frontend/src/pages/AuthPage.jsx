import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './AuthPage.css';

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const { login } = useAuth();
  const { showToast } = useToast();

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({ email: '', password: '', confirm: '' });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginForm.email, password: loginForm.password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Login failed');

      login(data.access_token, loginForm.email);
      showToast('Welcome back!', 'success');
    } catch (err) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (signupForm.password !== signupForm.confirm) {
      setMessage({ text: 'Passwords do not match', type: 'error' });
      return;
    }
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: signupForm.email, password: signupForm.password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Signup failed');

      setMessage({ text: 'Account created! You can now sign in.', type: 'success' });
      setTimeout(() => setActiveTab('login'), 1500);
    } catch (err) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand">
          <div className="brand-icon">
            <svg width="36" height="36" viewBox="0 0 40 40" fill="none">
              <rect width="40" height="40" rx="12" fill="url(#authGrad)" />
              <path d="M12 14h16M12 20h12M12 26h8" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <defs>
                <linearGradient id="authGrad" x1="0" y1="0" x2="40" y2="40">
                  <stop stopColor="#1a1a2e" />
                  <stop offset="1" stopColor="#2d2d44" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h1>AI Doc Intelligence</h1>
        </div>

        <div className="auth-hero">
          <h2>Unlock insights from your documents</h2>
          <p>Upload PDFs and let AI help you analyze, summarize, and answer questions about your documents in seconds.</p>
          <div className="auth-features">
            <div className="auth-feature"><span className="feature-emoji">📄</span><span>PDF Text Extraction</span></div>
            <div className="auth-feature"><span className="feature-emoji">🤖</span><span>AI-Powered Q&A</span></div>
            <div className="auth-feature"><span className="feature-emoji">💬</span><span>Multi-Document Chat</span></div>
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-tabs">
            <button className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`} onClick={() => { setActiveTab('login'); setMessage(null); }}>
              Sign In
            </button>
            <button className={`auth-tab ${activeTab === 'signup' ? 'active' : ''}`} onClick={() => { setActiveTab('signup'); setMessage(null); }}>
              Sign Up
            </button>
          </div>

          {activeTab === 'login' ? (
            <form className="auth-form" onSubmit={handleLogin}>
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" placeholder="you@example.com" required value={loginForm.email}
                  onChange={e => setLoginForm({ ...loginForm, email: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input type="password" placeholder="••••••••" required value={loginForm.password}
                  onChange={e => setLoginForm({ ...loginForm, password: e.target.value })} />
              </div>
              <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                {loading ? <span className="btn-loader" /> : 'Sign In'}
              </button>
            </form>
          ) : (
            <form className="auth-form" onSubmit={handleSignup}>
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" placeholder="you@example.com" required value={signupForm.email}
                  onChange={e => setSignupForm({ ...signupForm, email: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input type="password" placeholder="••••••••" required minLength={6} value={signupForm.password}
                  onChange={e => setSignupForm({ ...signupForm, password: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Confirm Password</label>
                <input type="password" placeholder="••••••••" required minLength={6} value={signupForm.confirm}
                  onChange={e => setSignupForm({ ...signupForm, confirm: e.target.value })} />
              </div>
              <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                {loading ? <span className="btn-loader" /> : 'Create Account'}
              </button>
            </form>
          )}

          {message && (
            <div className={`auth-message auth-message-${message.type}`}>
              {message.text}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
