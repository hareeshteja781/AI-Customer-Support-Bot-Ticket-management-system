from typing import Annotated

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)
from sqlalchemy.orm import Session

from app.api.routes.auth import (
    get_current_user,
)
from app.core.database import get_db
from app.models.user import User
from app.schemas.auth import (
    UserUpdate,
)

router = APIRouter()


def serialize_user(user: User) -> dict:
    return {
        'id': user.id,
        'email': user.email,
        'full_name': user.full_name,
        'role': user.role,
        'is_active': user.is_active,
        'created_at': (
            user.created_at.isoformat()
            if user.created_at
            else None
        ),
    }


@router.get('/me')
def get_current_user_profile(
    current_user: Annotated[
        User,
        Depends(get_current_user),
    ],
):
    return serialize_user(
        current_user
    )


@router.patch('/me')
def update_current_user_profile(
    payload: UserUpdate,
    current_user: Annotated[
        User,
        Depends(get_current_user),
    ],
    db: Annotated[
        Session,
        Depends(get_db),
    ],
):
    new_name = payload.full_name.strip()

    if len(new_name) < 2:
        raise HTTPException(
            status_code=422,
            detail='Full name must contain at least 2 characters.',
        )

    current_user.full_name = new_name

    db.add(current_user)
    db.commit()
    db.refresh(current_user)

    return serialize_user(
        current_user
    )


@router.get('')
def list_users(
    current_user: Annotated[
        User,
        Depends(get_current_user),
    ],
    db: Annotated[
        Session,
        Depends(get_db),
    ],
):
    if current_user.role != 'admin':
        raise HTTPException(
            status_code=403,
            detail='admin access required',
        )

    users = (
        db.query(User)
        .order_by(
            User.created_at.desc()
        )
        .all()
    )

    return [
        serialize_user(user)
        for user in users
    ]