"""
Authentication routes — register, login, refresh, profile.
"""

from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, status, Depends

from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
    get_current_user,
)
from app.core.config import settings
from app.models.user import User
from app.schemas.auth import (
    RegisterRequest,
    LoginRequest,
    TokenResponse,
    RefreshRequest,
    UserResponse,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(payload: RegisterRequest):
    """Register a new user account."""
    from app.core import database as db
    if not db.is_mongo_connected:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=db.mongo_error_message or "Database is disconnected. Set valid MONGODB_URL in environment.",
        )

    # Normalize email and name
    clean_email = str(payload.email).strip().lower()
    clean_name = payload.name.strip()

    # Check if email already taken
    existing = await User.find_one(User.email == clean_email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )

    # Create user
    user = User(
        email=clean_email,
        name=clean_name,
        hashed_password=hash_password(payload.password),
    )
    await user.insert()

    # Generate tokens
    token_data = {"sub": str(user.id)}
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest):
    """Authenticate and receive tokens."""
    from app.core import database as db
    if not db.is_mongo_connected:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=db.mongo_error_message or "Database is disconnected. Set valid MONGODB_URL in environment.",
        )

    clean_email = str(payload.email).strip().lower()
    user = await User.find_one(User.email == clean_email)
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated",
        )

    token_data = {"sub": str(user.id)}
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(payload: RefreshRequest):
    """Refresh an expired access token."""
    token_payload = decode_token(payload.refresh_token)

    if token_payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type — expected refresh token",
        )

    user_id = token_payload.get("sub")
    user = await User.get(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    token_data = {"sub": str(user.id)}
    access_token = create_access_token(token_data)
    new_refresh_token = create_refresh_token(token_data)

    return TokenResponse(
        access_token=access_token,
        refresh_token=new_refresh_token,
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )


@router.get("/me", response_model=UserResponse)
async def get_profile(current_user: User = Depends(get_current_user)):
    """Get current user's profile."""
    return UserResponse(
        id=str(current_user.id),
        email=current_user.email,
        name=current_user.name,
        avatar_url=current_user.avatar_url,
        plan=current_user.plan.value,
        created_at=current_user.created_at.isoformat(),
    )
