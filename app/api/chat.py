from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.database.models import ChatSession
from app.core.auth_dependency import get_current_user

router = APIRouter(prefix="/chat", tags=["Chat"])


@router.post("/create-session")
def create_session(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    new_session = ChatSession(user_id=current_user.id)

    db.add(new_session)
    db.commit()
    db.refresh(new_session)

    return {
        "message": "Session created successfully",
        "session_id": str(new_session.id)
    }


from app.database.models import SessionDocument, Document
from app.schemas.chat import LinkDocumentRequest
from fastapi import HTTPException


@router.post("/link-document")
def link_document_to_session(
    request: LinkDocumentRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # Check session belongs to user
    session = db.query(ChatSession).filter(
        ChatSession.id == request.session_id,
        ChatSession.user_id == current_user.id
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # Check document belongs to user
    document = db.query(Document).filter(
        Document.id == request.document_id,
        Document.user_id == current_user.id
    ).first()

    if not document:
        raise HTTPException(status_code=404, detail="Document not found")  

    # Check if already linked
    existing_link = db.query(SessionDocument).filter(  #changed
        SessionDocument.session_id == request.session_id,  #changed
        SessionDocument.document_id == request.document_id  #changed
    ).first() #changed

    if existing_link: #changed
        return {"message": "Document already linked to session"}  #changed

    # Link document to session
    link = SessionDocument(
        session_id=request.session_id,
        document_id=request.document_id
    )

    db.add(link)
    db.commit()

    return {"message": "Document linked to session successfully"}



from app.ai.azure_client import ask_azure
from app.database.models import Message
from app.schemas.chat import AskQuestionRequest


@router.post("/ask")
def ask_question(
    request: AskQuestionRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # Verify session ownership
    session = db.query(ChatSession).filter(
        ChatSession.id == request.session_id,
        ChatSession.user_id == current_user.id
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # Fetch linked documents
    linked_docs = db.query(Document).join(SessionDocument).filter(
        SessionDocument.session_id == request.session_id
    ).all()

    if not linked_docs:
        raise HTTPException(status_code=400, detail="No documents linked to this session")

    # Combine document content
    combined_content = "\n\n".join([doc.content or "" for doc in linked_docs])

    # Create prompt
    prompt = f"""
Use the following document content to answer the question.

Document Content:
{combined_content}

Question:
{request.question}
"""

    # Call Azure
    answer = ask_azure(prompt)

    # Store user message
    user_message = Message(
        session_id=request.session_id,
        role="user",
        content=request.question
    )
    db.add(user_message)

    # Store assistant response
    assistant_message = Message(
        session_id=request.session_id,
        role="assistant",
        content=answer
    )
    db.add(assistant_message)

    db.commit()

    return {"answer": answer}