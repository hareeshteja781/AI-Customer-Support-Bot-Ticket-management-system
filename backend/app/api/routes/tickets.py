from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.routes.auth import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.ticket import TicketCreate
from app.services.ticket_service import create_ticket as create_ticket_service
from app.services.ticket_service import get_ticket as get_ticket_service
from app.services.ticket_service import list_tickets as list_tickets_service

router = APIRouter()


def serialize_ticket(ticket) -> dict:
    return {
        "id": ticket.id,
        "ticket_number": f"TKT-{ticket.id:06d}",
        "title": ticket.title,
        "description": ticket.description,
        "status": ticket.status,
        "priority": ticket.priority,
        "category": ticket.category,
        "customer_id": ticket.customer_id,
        "customer_email": ticket.customer.email if ticket.customer else None,
        "assigned_to": None,
        "conversation_id": ticket.conversation_id,
        "created_at": ticket.created_at.isoformat() if ticket.created_at else None,
        "updated_at": ticket.updated_at.isoformat() if ticket.updated_at else None,
        "ai_summary": None,
    }


@router.get("")
def list_tickets(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
    status: str | None = Query(default=None),
):
    tickets = list_tickets_service(db, current_user.id, current_user.role)
    if status:
        tickets = [ticket for ticket in tickets if ticket.status.lower() == status.lower()]
    return [serialize_ticket(ticket) for ticket in tickets]


@router.post("")
def create_ticket(
    payload: TicketCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    ticket = create_ticket_service(db, current_user.id, payload)
    return serialize_ticket(ticket)


@router.get("/{ticket_id}")
def get_ticket(
    ticket_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    ticket = get_ticket_service(db, ticket_id, current_user.id, current_user.role)
    return serialize_ticket(ticket)
