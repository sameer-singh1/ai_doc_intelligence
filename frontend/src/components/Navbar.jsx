import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar({ activeView, onViewChange }) {
  const { userEmail, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="nav-left">
        <div className="nav-brand">
          <svg width="26" height="26" viewBox="0 0 40 40" fill="none">
            <rect width="40" height="40" rx="12" fill="url(#navGrad)" />
            <path d="M12 14h16M12 20h12M12 26h8" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            <defs>
              <linearGradient id="navGrad" x1="0" y1="0" x2="40" y2="40">
                <stop stopColor="#1a1a2e" />
                <stop offset="1" stopColor="#2d2d44" />
              </linearGradient>
            </defs>
          </svg>
          <span>AI Doc Intelligence</span>
        </div>
      </div>

      <div className="nav-center">
        <button className={`nav-tab ${activeView === 'documents' ? 'nav-tab-active' : ''}`} onClick={() => onViewChange('documents')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          Documents
        </button>
        <button className={`nav-tab ${activeView === 'chat' ? 'nav-tab-active' : ''}`} onClick={() => onViewChange('chat')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          Chat
        </button>
      </div>

      <div className="nav-right">
        <span className="nav-email">{userEmail}</span>
        <button className="btn-logout" onClick={logout}>Sign Out</button>
      </div>
    </nav>
  );
}
