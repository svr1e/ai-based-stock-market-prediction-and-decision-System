from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    name: str = Field(min_length=2)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: dict


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class FirebaseLoginRequest(BaseModel):
    firebase_token: str


class PasswordResetRequest(BaseModel):
    email: EmailStr


class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str = Field(min_length=8)


class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    photo_url: Optional[str] = None
    plan: str = "free"
    created_at: datetime
    is_active: bool = True
