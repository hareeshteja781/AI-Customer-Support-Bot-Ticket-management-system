from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jwt import InvalidTokenError
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User
from app.schemas.auth import TokenResponse, UserCreate, UserLogin, UserOut
from app.services.auth_service import authenticate_user, create_access_token, decode_access_token, register_user

router = APIRouter()
security = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(security)],
    db: Annotated[Session, Depends(get_db)],
) -> User:
    if credentials is None:
        raise HTTPException(status_code=401, detail="missing credentials")
    try:
        payload = decode_access_token(credentials.credentials)
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="invalid token")
        user = db.query(User).filter(User.id == int(user_id)).first()
    except (InvalidTokenError, ValueError, TypeError) as exc:
        raise HTTPException(status_code=401, detail="invalid token") from exc

    if user is None or not user.is_active:
        raise HTTPException(status_code=401, detail="user not found")
    return user


@router.post("/register", response_model=TokenResponse)
def register(payload: UserCreate, db: Annotated[Session, Depends(get_db)]):
    user = register_user(db, payload)
    token = create_access_token(str(user.id), user.role)
    return TokenResponse(access_token=token, user=UserOut.model_validate(user))


@router.post("/login", response_model=TokenResponse)
def login(payload: UserLogin, db: Annotated[Session, Depends(get_db)]):
    user, token = authenticate_user(db, payload)
    return TokenResponse(access_token=token, user=UserOut.model_validate(user))


@router.post("/logout")
def logout():
    return {"message": "logged out"}


@router.get("/me", response_model=UserOut)
def get_me(current_user: Annotated[User, Depends(get_current_user)]):
    return UserOut.model_validate(current_user)
