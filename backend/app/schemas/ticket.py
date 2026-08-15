from pydantic import BaseModel, ConfigDict


class TicketCreate(BaseModel):
    title: str
    description: str
    category: str | None = None
    priority: str | None = None


class TicketOut(BaseModel):
    id: int
    title: str
    description: str
    category: str
    status: str
    priority: str
    customer_id: int
    conversation_id: int | None = None

    model_config = ConfigDict(from_attributes=True)
