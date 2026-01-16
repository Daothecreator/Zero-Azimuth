"""
Authentication and authorization API endpoints.
"""

from datetime import datetime, timedelta
from typing import Optional, Dict, Any

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from ..core.database import get_db_session
from ..core.security import SecurityManager
from ..models.user import User, UserRole


router = APIRouter(prefix="/api/auth", tags=["Authentication"])
security = HTTPBearer()
security_manager = SecurityManager()


# Pydantic models
class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]


class RegisterRequest(BaseModel):
    username: str
    email: EmailStr
    password: str
    full_name: str


class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    full_name: str
    role: str
    is_active: bool
    is_verified: bool
    created_at: datetime


# Dependency to get current user
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db_session)
) -> User:
    """Get current authenticated user."""
    token = credentials.credentials
    payload = security_manager.verify_token(token)
    
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )
    
    user_id = payload.get("sub")
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive"
        )
    
    return user


@router.post("/login", response_model=LoginResponse)
async def login(
    login_data: LoginRequest,
    db: AsyncSession = Depends(get_db_session)
):
    """User login endpoint."""
    # Find user by username or email
    result = await db.execute(
        select(User).where(
            (User.username == login_data.username) | 
            (User.email == login_data.username)
        )
    )
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    # Verify password
    if not security_manager.verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    # Generate access token
    access_token = security_manager.create_access_token(user.id, user.role)
    
    return LoginResponse(
        access_token=access_token,
        user={
            "id": str(user.id),
            "username": user.username,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role.value,
            "is_active": user.is_active,
            "is_verified": user.is_verified,
            "created_at": user.created_at,
        }
    )


@router.post("/register", response_model=UserResponse)
async def register(
    register_data: RegisterRequest,
    db: AsyncSession = Depends(get_db_session)
):
    """User registration endpoint."""
    # Check if username already exists
    result = await db.execute(
        select(User).where(User.username == register_data.username)
    )
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already exists"
        )
    
    # Check if email already exists
    result = await db.execute(
        select(User).where(User.email == register_data.email)
    )
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Hash password
    password_hash = security_manager.hash_password(register_data.password)
    
    # Generate API key
    api_key = security_manager.generate_api_key()
    api_key_hash = security_manager.hash_api_key(api_key)
    
    # Create new user
    new_user = User(
        username=register_data.username,
        email=register_data.email,
        password_hash=password_hash,
        full_name=register_data.full_name,
        role=UserRole.VIEWER,  # Default role
        api_key=api_key_hash,
    )
    
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    
    return UserResponse(
        id=str(new_user.id),
        username=new_user.username,
        email=new_user.email,
        full_name=new_user.full_name,
        role=new_user.role.value,
        is_active=new_user.is_active,
        is_verified=new_user.is_verified,
        created_at=new_user.created_at,
    )


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information."""
    return UserResponse(
        id=str(current_user.id),
        username=current_user.username,
        email=current_user.email,
        full_name=current_user.full_name,
        role=current_user.role.value,
        is_active=current_user.is_active,
        is_verified=current_user.is_verified,
        created_at=current_user.created_at,
    )


@router.post("/logout")
async def logout(current_user: User = Depends(get_current_user)):
    """User logout endpoint."""
    # In a production system, you would invalidate the token here
    # For now, we'll just return a success message
    return {"message": "Logged out successfully"}


@router.post("/refresh")
async def refresh_token(current_user: User = Depends(get_current_user)):
    """Refresh access token."""
    new_token = security_manager.create_access_token(current_user.id, current_user.role)
    return {"access_token": new_token, "token_type": "bearer"}


@router.get("/verify/{token}")
async def verify_token(token: str):
    """Verify JWT token."""
    payload = security_manager.verify_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )
    return {"valid": True, "payload": payload}


# Admin endpoints
@router.get("/users", response_model=list[UserResponse])
async def list_users(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_user)
):
    """List all users (admin only)."""
    if current_user.role not in [UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions"
        )
    
    result = await db.execute(
        select(User).offset(skip).limit(limit).order_by(User.created_at.desc())
    )
    users = result.scalars().all()
    
    return [
        UserResponse(
            id=str(user.id),
            username=user.username,
            email=user.email,
            full_name=user.full_name,
            role=user.role.value,
            is_active=user.is_active,
            is_verified=user.is_verified,
            created_at=user.created_at,
        )
        for user in users
    ]