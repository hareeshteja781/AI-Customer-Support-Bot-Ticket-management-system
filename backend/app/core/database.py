import os
import sys
from pathlib import Path

from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.config import DATABASE_URL


def resolve_database_url() -> str:
    if "pytest" in sys.modules or os.getenv("PYTEST_CURRENT_TEST"):
        return os.getenv("TEST_DATABASE_URL", "sqlite://")
    return DATABASE_URL


DATABASE_URL = resolve_database_url()
engine_kwargs = {"future": True}

if DATABASE_URL.startswith("sqlite"):
    engine_kwargs["connect_args"] = {"check_same_thread": False}
    if DATABASE_URL == "sqlite://":
        engine_kwargs["poolclass"] = StaticPool

engine = create_engine(DATABASE_URL, **engine_kwargs)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    from app.models import conversation, knowledge_document, message, ticket, user  # noqa: F401
    from app.models.conversation import Conversation
    from app.models.ticket import Ticket
    from app.models.user import User
    from app.services.auth_service import hash_password

    if engine.dialect.name == "postgresql":
        with engine.begin() as connection:
            try:
                connection.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))
            except Exception:
                connection.rollback()

    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        required_users = {
            "admin@example.com": ("Admin User", "adm123", "admin"),
            "agent@example.com": ("Agent User", "agt123", "agent"),
            "customer@example.com": ("Customer User", "password", "customer"),
        }

        for email, (full_name, password, role) in required_users.items():
            existing = db.query(User).filter(User.email == email).first()
            if not existing:
                db.add(User(email=email, full_name=full_name, password_hash=hash_password(password), role=role))
        db.commit()

        customer = db.query(User).filter(User.email == "customer@example.com").first()
        if customer and db.query(Ticket).count() == 0:
            conversation = Conversation(title="Billing issue", user_id=customer.id)
            db.add(conversation)
            db.flush()
            db.add(
                Ticket(
                    title="Billing issue",
                    description="Invoice for last month did not arrive.",
                    category="Billing",
                    status="open",
                    priority="high",
                    customer_id=customer.id,
                    conversation_id=conversation.id,
                )
            )
            db.commit()
    finally:
        db.close()
