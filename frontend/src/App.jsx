import { useState } from 'react';
import { useAuth } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import DocumentsPage from './pages/DocumentsPage';
import ChatPage from './pages/ChatPage';
import Navbar from './components/Navbar';
import './App.css';

function App() {
  const { token } = useAuth();
  const [activeView, setActiveView] = useState('documents');
  const [documents, setDocuments] = useState(
    JSON.parse(localStorage.getItem('uploadedDocs') || '[]')
  );

  if (!token) {
    return <AuthPage />;
  }

  return (
    <div className="app-layout">
      <Navbar activeView={activeView} onViewChange={setActiveView} />
      <div className="app-content">
        {activeView === 'documents' && (
          <DocumentsPage documents={documents} setDocuments={setDocuments} />
        )}
        {activeView === 'chat' && (
          <ChatPage documents={documents} />
        )}
      </div>
    </div>
  );
}

export default App;
