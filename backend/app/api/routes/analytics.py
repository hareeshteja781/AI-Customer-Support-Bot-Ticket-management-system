from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.routes.auth import get_current_user
from app.core.database import get_db
from app.models.ticket import Ticket
from app.models.user import User
from app.models.conversation import Conversation

router = APIRouter()


@router.get("/overview")
def analytics_overview(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    if current_user.role not in {"admin", "agent"}:
        raise HTTPException(status_code=403, detail="forbidden")

    tickets = db.query(Ticket).all()
    status_counts = {
        "open": sum(1 for ticket in tickets if ticket.status.lower() == "open"),
        "pending": sum(1 for ticket in tickets if ticket.status.lower() == "pending"),
        "resolved": sum(1 for ticket in tickets if ticket.status.lower() == "resolved"),
    }
    return {
        "total_tickets": len(tickets),
        "open_tickets": status_counts["open"],
        "pending_tickets": status_counts["pending"],
        "resolved_tickets": status_counts["resolved"],
        "high_priority_tickets": sum(1 for ticket in tickets if ticket.priority.lower() == "high"),
        "assigned_tickets": 0,
        "unassigned_tickets": len(tickets),
        "conversation_count": db.query(Conversation).count(),
        "tickets_by_status": status_counts,
    }
