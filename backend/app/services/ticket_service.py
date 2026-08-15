from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.conversation import Conversation
from app.models.message import Message
from app.models.ticket import Ticket
from app.schemas.ticket import TicketCreate


def create_ticket(db: Session, user_id: int, payload: TicketCreate) -> Ticket:
    conversation = Conversation(title=payload.title, user_id=user_id)
    db.add(conversation)
    db.flush()

    ticket = Ticket(
        title=payload.title.strip(),
        description=payload.description.strip(),
        category=(payload.category or "general").lower(),
        priority=(payload.priority or "medium").lower(),
        customer_id=user_id,
        conversation_id=conversation.id,
    )
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    return ticket


def list_tickets(db: Session, user_id: int, role: str):
    query = db.query(Ticket)
    if role == "customer":
        query = query.filter(Ticket.customer_id == user_id)
    return query.order_by(Ticket.updated_at.desc(), Ticket.created_at.desc()).all()


def get_ticket(db: Session, ticket_id: int, user_id: int, role: str) -> Ticket:
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    if role == "customer" and ticket.customer_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    return ticket


def add_message_to_ticket(db: Session, ticket: Ticket, sender: str, content: str):
    if not ticket.conversation_id:
        return None
    message = Message(conversation_id=ticket.conversation_id, role=sender, content=content)
    db.add(message)
    db.commit()
    db.refresh(message)
    return message
