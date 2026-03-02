from pydantic import BaseModel
from uuid import UUID

class LinkDocumentRequest(BaseModel):
    session_id: UUID
    document_id: UUID


class AskQuestionRequest(BaseModel):
    session_id: UUID
    question: str