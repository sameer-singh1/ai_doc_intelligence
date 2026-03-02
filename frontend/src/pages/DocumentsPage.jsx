import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './DocumentsPage.css';

export default function DocumentsPage({ documents, setDocuments }) {
  const { authFetch } = useAuth();
  const { showToast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ filename: '', percent: 0 });
  const [dragover, setDragover] = useState(false);

  const handleUpload = async (file) => {
    if (!file.name.endsWith('.pdf')) {
      showToast('Only PDF files are supported', 'error');
      return;
    }

    setUploading(true);
    setUploadProgress({ filename: file.name, percent: 0 });

    const interval = setInterval(() => {
      setUploadProgress(prev => ({
        ...prev,
        percent: Math.min(prev.percent + Math.random() * 18, 90),
      }));
    }, 200);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await authFetch('/documents/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(interval);

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Upload failed');
      }

      const data = await res.json();

      setUploadProgress({ filename: file.name, percent: 100 });

      const newDoc = {
        id: data.document_id,
        file_name: data.file_name || file.name,
        uploaded_at: new Date().toISOString(),
      };

      const updated = [...documents, newDoc];
      setDocuments(updated);
      localStorage.setItem('uploadedDocs', JSON.stringify(updated));
      showToast('Document uploaded successfully!', 'success');

      setTimeout(() => setUploading(false), 1500);
    } catch (err) {
      clearInterval(interval);
      setUploading(false);
      showToast(err.message, 'error');
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragover(false);
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now - d;
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="documents-page">
      <div className="page-header">
        <div>
          <h2>My Documents</h2>
          <p className="page-subtitle">Upload and manage your PDF documents</p>
        </div>
        <div className="doc-count-badge">{documents.length} document{documents.length !== 1 ? 's' : ''}</div>
      </div>

      {/* Upload Zone */}
      <div
        className={`upload-zone ${dragover ? 'upload-zone-dragover' : ''}`}
        onClick={() => document.getElementById('file-input').click()}
        onDragOver={(e) => { e.preventDefault(); setDragover(true); }}
        onDragLeave={() => setDragover(false)}
        onDrop={onDrop}
      >
        <input type="file" id="file-input" accept=".pdf" hidden onChange={e => { if (e.target.files[0]) handleUpload(e.target.files[0]); e.target.value = ''; }} />
        <div className="upload-icon-wrapper">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </div>
        <h3>Upload PDF Document</h3>
        <p>Click to browse or drag & drop your PDF file here</p>
        <span className="upload-hint">Only .pdf files • Max extraction with PyMuPDF</span>
      </div>

      {/* Upload Progress */}
      {uploading && (
        <div className="upload-progress">
          <div className="progress-info">
            <span className="progress-filename">📄 {uploadProgress.filename}</span>
            <span className="progress-percent">{Math.round(uploadProgress.percent)}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${uploadProgress.percent}%` }} />
          </div>
        </div>
      )}

      {/* Document List */}
      <div className="documents-grid">
        {documents.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📁</div>
            <h3>No documents yet</h3>
            <p>Upload your first PDF to get started with AI-powered analysis</p>
          </div>
        ) : (
          documents.map((doc, i) => (
            <div key={doc.id} className="doc-card" style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="doc-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <div className="doc-info">
                <span className="doc-name">{doc.file_name}</span>
                <span className="doc-meta">Uploaded {formatDate(doc.uploaded_at)}</span>
              </div>
              <span className="doc-badge">Ready</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
