# 🧠 AI Doc Intelligence

A full-stack AI-powered document intelligence platform. Upload PDF documents and chat with an AI assistant to extract insights, ask questions, and analyze your documents — all in real time.

---

## ✨ Features

| Feature                     | Description                                                                  |
| --------------------------- | ---------------------------------------------------------------------------- |
| 🔐 **Authentication**       | Secure signup/login with JWT-based access tokens and bcrypt password hashing |
| 📄 **PDF Upload**           | Upload PDF documents with automatic text extraction using PyMuPDF            |
| 💬 **Chat Sessions**        | Create dedicated chat sessions to discuss your documents                     |
| 🔗 **Document Linking**     | Link one or more documents to a chat session for multi-document analysis     |
| 🤖 **AI-Powered Q&A**       | Ask questions about your documents — powered by Azure OpenAI (GPT-4o-mini)   |
| 💾 **Conversation History** | All messages are stored in PostgreSQL for future reference                   |

---

## 🏗️ Tech Stack

### Backend

- **FastAPI** — High-performance async Python web framework
- **SQLAlchemy** — ORM for database interactions
- **PostgreSQL** — Relational database
- **PyMuPDF (fitz)** — PDF text extraction
- **Passlib + bcrypt** — Password hashing
- **python-jose** — JWT token generation & validation
- **Azure OpenAI** — AI chat completions (GPT-4o-mini)

### Frontend

- **React 19** — Component-based UI
- **Vite** — Fast build tool and dev server
- **Vanilla CSS** — Custom design system with CSS variables
- **Plus Jakarta Sans** — Premium Google Font

---

## 📁 Project Structure

```
ai_doc/
├── app/
│   ├── main.py                  # FastAPI app entry point, CORS, routers
│   ├── config.py                # Environment variable settings
│   ├── ai/
│   │   └── azure_client.py      # Azure OpenAI integration
│   ├── api/
│   │   ├── auth.py              # Signup & login endpoints
│   │   ├── documents.py         # PDF upload & text extraction
│   │   └── chat.py              # Chat sessions, linking, Q&A
│   ├── core/
│   │   ├── security.py          # Password hashing & JWT creation
│   │   └── auth_dependency.py   # get_current_user dependency
│   ├── database/
│   │   ├── connection.py        # SQLAlchemy engine & session
│   │   └── models.py            # User, Document, ChatSession, Message models
│   └── schemas/
│       ├── users.py             # UserCreate, UserLogin, Token schemas
│       └── chat.py              # LinkDocumentRequest, AskQuestionRequest schemas
│
├── frontend/
│   ├── index.html               # HTML entry point
│   ├── vite.config.js           # Vite config with API proxy
│   └── src/
│       ├── main.jsx             # React entry with providers
│       ├── App.jsx              # Root component with view routing
│       ├── App.css              # Shared styles (buttons, toasts, layout)
│       ├── index.css            # Design system tokens & animations
│       ├── context/
│       │   ├── AuthContext.jsx   # Auth state & token management
│       │   └── ToastContext.jsx  # Toast notification system
│       ├── components/
│       │   ├── Navbar.jsx       # Top navigation bar
│       │   └── Navbar.css
│       └── pages/
│           ├── AuthPage.jsx     # Login / Signup page
│           ├── AuthPage.css
│           ├── DocumentsPage.jsx # Upload & manage PDFs
│           ├── DocumentsPage.css
│           ├── ChatPage.jsx     # Chat sessions & AI Q&A
│           └── ChatPage.css
│
├── uploads/                     # Uploaded PDF files (gitignored)
├── requirements.txt             # Python dependencies
├── .env                         # Environment variables (gitignored)
└── .gitignore
```

---

## 🚀 Getting Started

### Prerequisites

- **Python 3.12+**
- **Node.js 18+**
- **PostgreSQL** running locally

### 1. Clone the Repository

```bash
git clone https://github.com/sameer-singh1/ai_doc_intelligence.git
cd ai_doc_intelligence
```

### 2. Set Up the Backend

```bash
# Create virtual environment
python -m venv .venv

# Activate it
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Configure Environment Variables

Create a `.env` file in the project root:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/ai_doc_db

SECRET_KEY=your_secret_key_here
ACCESS_TOKEN_EXPIRE_MINUTES=60
ALGORITHM=HS256

AZURE_OPENAI_API_KEY=your_azure_openai_api_key
AZURE_OPENAI_ENDPOINT=your_azure_openai_endpoint
AZURE_DEPLOYMENT_NAME=gpt-4o-mini
```

### 4. Create the PostgreSQL Database

```sql
CREATE DATABASE ai_doc_db;
```

> Tables are auto-created on startup via `Base.metadata.create_all()`.

### 5. Run the Backend

```bash
uvicorn app.main:app --reload
```

The API will be available at `http://127.0.0.1:8000`  
Swagger docs at `http://127.0.0.1:8000/docs`

### 6. Set Up the Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`

---

## 📡 API Endpoints

### Authentication

| Method | Endpoint       | Description                 |
| ------ | -------------- | --------------------------- |
| POST   | `/auth/signup` | Create a new user account   |
| POST   | `/auth/login`  | Login and receive JWT token |

### Documents

| Method | Endpoint            | Description       | Auth |
| ------ | ------------------- | ----------------- | ---- |
| POST   | `/documents/upload` | Upload a PDF file | 🔒   |

### Chat

| Method | Endpoint               | Description                           | Auth |
| ------ | ---------------------- | ------------------------------------- | ---- |
| POST   | `/chat/create-session` | Create a new chat session             | 🔒   |
| POST   | `/chat/link-document`  | Link a document to a session          | 🔒   |
| POST   | `/chat/ask`            | Ask a question about linked documents | 🔒   |

---

## 🗄️ Database Schema

```
┌──────────────┐       ┌──────────────────┐       ┌──────────────────┐
│    users     │       │    documents     │       │  chat_sessions   │
├──────────────┤       ├──────────────────┤       ├──────────────────┤
│ id (UUID PK) │◄──┐   │ id (UUID PK)     │   ┌──►│ id (UUID PK)     │
│ email        │   ├───│ user_id (FK)     │   │   │ user_id (FK)     │
│ hashed_pw    │   │   │ file_name        │   │   │ created_at       │
└──────────────┘   │   │ file_path        │   │   └──────────────────┘
                   │   │ content (Text)   │   │
                   │   │ uploaded_at      │   │   ┌──────────────────┐
                   │   └──────────────────┘   │   │    messages       │
                   │                          │   ├──────────────────┤
                   │   ┌──────────────────┐   │   │ id (UUID PK)     │
                   │   │session_documents │   │   │ session_id (FK)  │
                   │   ├──────────────────┤   │   │ role             │
                   │   │ session_id (FK) ─┼───┘   │ content (Text)   │
                   │   │ document_id (FK) │       │ created_at       │
                   │   └──────────────────┘       └──────────────────┘
                   │
                   └── All user_id FKs reference users.id
```

---

## 🔑 Important Notes

- **bcrypt version**: Must use `bcrypt==3.2.2` for compatibility with `passlib==1.7.4`. Newer bcrypt versions (4.x, 5.x) cause errors.
- **PDF only**: The upload endpoint only accepts `.pdf` files.
- **Azure OpenAI**: Requires valid Azure OpenAI credentials in `.env` for the chat Q&A feature to work.
- **Uploads folder**: PDF files are stored locally in `/uploads` (gitignored).

---

## 📄 License

This project is for educational and personal use.
