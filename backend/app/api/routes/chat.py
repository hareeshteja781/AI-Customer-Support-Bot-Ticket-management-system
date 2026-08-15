from datetime import datetime, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.api.routes.auth import get_current_user
from app.core.database import get_db
from app.models.conversation import Conversation
from app.models.knowledge_document import KnowledgeDocument
from app.models.message import Message
from app.models.user import User
from app.services.ai_service import AIService
from app.services.rag_service import RAGService

router = APIRouter()


class MessageCreate(BaseModel):
    content: str = Field(min_length=1, max_length=10000)


class ConversationRename(BaseModel):
    title: str = Field(min_length=1, max_length=255)


def serialize_message(message: Message) -> dict:
    return {
        "id": message.id,
        "role": message.role,
        "sender_type": "customer" if message.role == "user" else message.role,
        "content": message.content,
        "created_at": message.created_at.isoformat() if message.created_at else datetime.now(timezone.utc).isoformat(),
    }


def serialize_conversation(conversation: Conversation) -> dict:
    return {
        "id": conversation.id,
        "title": conversation.title,
        "status": "active",
        "created_at": conversation.created_at.isoformat() if conversation.created_at else None,
        "updated_at": conversation.updated_at.isoformat() if conversation.updated_at else None,
    }


def get_owned_conversation(db: Session, conversation_id: int, user_id: int) -> Conversation:
    conversation = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conversation or conversation.user_id != user_id:
        raise HTTPException(status_code=404, detail="conversation not found")
    return conversation


@router.get("/conversations")
def list_conversations(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
    search: str | None = Query(default=None),
):
    query = db.query(Conversation).filter(Conversation.user_id == current_user.id)
    if search:
        query = query.filter(Conversation.title.ilike(f"%{search}%"))
    conversations = query.order_by(Conversation.updated_at.desc(), Conversation.id.desc()).all()
    return [serialize_conversation(conversation) for conversation in conversations]


@router.post("/conversations")
def create_conversation(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    conversation = Conversation(title="New conversation", user_id=current_user.id)
    db.add(conversation)
    db.commit()
    db.refresh(conversation)
    return serialize_conversation(conversation)


@router.get("/conversations/{conversation_id}")
def get_conversation(
    conversation_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    conversation = get_owned_conversation(db, conversation_id, current_user.id)
    messages = (
        db.query(Message)
        .filter(Message.conversation_id == conversation.id)
        .order_by(Message.id.asc())
        .all()
    )
    result = serialize_conversation(conversation)
    result["messages"] = [serialize_message(message) for message in messages]
    return result


@router.patch("/conversations/{conversation_id}")
def rename_conversation(
    conversation_id: int,
    payload: ConversationRename,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    conversation = get_owned_conversation(db, conversation_id, current_user.id)
    conversation.title = payload.title.strip()
    db.commit()
    db.refresh(conversation)
    return serialize_conversation(conversation)


@router.delete("/conversations/{conversation_id}")
def delete_conversation(
    conversation_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    conversation = get_owned_conversation(db, conversation_id, current_user.id)
    db.delete(conversation)
    db.commit()
    return {"status": "deleted", "id": conversation_id}


@router.post("/conversations/{conversation_id}/messages")
def send_message(
    conversation_id: int,
    payload: MessageCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    conversation = get_owned_conversation(db, conversation_id, current_user.id)
    user_content = payload.content.strip()

    history = [
        {"role": message.role, "content": message.content}
        for message in db.query(Message)
        .filter(Message.conversation_id == conversation.id)
        .order_by(Message.id.asc())
        .all()
    ]

    user_message = Message(conversation_id=conversation.id, role="user", content=user_content)
    db.add(user_message)
    db.flush()

    documents = (
        db.query(KnowledgeDocument)
        .order_by(KnowledgeDocument.updated_at.desc())
        .limit(20)
        .all()
    )
    context = RAGService().retrieve_context(user_content, [doc.text_preview for doc in documents if doc.text_preview])

    try:
        ai_reply = AIService().generate_response(user_content, history=history, knowledge_context=context or None)
    except RuntimeError as exc:
        db.rollback()
        raise HTTPException(status_code=503, detail=str(exc)) from exc

    assistant_message = Message(conversation_id=conversation.id, role="assistant", content=ai_reply)
    db.add(assistant_message)
    conversation.updated_at = datetime.now(timezone.utc)
    if conversation.title == "New conversation":
        conversation.title = user_content[:70]
    db.commit()
    db.refresh(assistant_message)
    db.refresh(conversation)

    messages = (
        db.query(Message)
        .filter(Message.conversation_id == conversation.id)
        .order_by(Message.id.asc())
        .all()
    )
    return {
        "conversation_id": conversation.id,
        "message": serialize_message(assistant_message),
        "messages": [serialize_message(message) for message in messages],
    }
