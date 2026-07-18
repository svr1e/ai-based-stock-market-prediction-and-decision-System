from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPAuthorizationCredentials
from datetime import datetime
import uuid

from core.database import get_db
from core.security import (
    hash_password, verify_password,
    create_access_token, create_refresh_token, decode_token,
    get_current_user
)
from schemas.auth import (
    UserRegister, UserLogin, TokenResponse,
    RefreshTokenRequest, FirebaseLoginRequest
)

router = APIRouter()


def serialize_user(user: dict) -> dict:
    return {
        "id": str(user.get("_id", "")),
        "email": user.get("email"),
        "name": user.get("name"),
        "photo_url": user.get("photo_url"),
        "plan": user.get("plan", "free"),
        "created_at": str(user.get("created_at", datetime.utcnow())),
    }


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(data: UserRegister):
    """Register with email and password."""
    db = get_db()

    if await db.users.find_one({"email": data.email}):
        raise HTTPException(status_code=400, detail="Email already registered")

    user_id = str(uuid.uuid4())
    user_doc = {
        "_id": user_id,
        "email": data.email,
        "name": data.name,
        "password_hash": hash_password(data.password),
        "photo_url": None,
        "plan": "free",
        "is_active": True,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }

    await db.users.insert_one(user_doc)

    # Create portfolio document
    await db.portfolio.insert_one({
        "_id": str(uuid.uuid4()),
        "user_id": user_id,
        "holdings": [],
        "created_at": datetime.utcnow(),
    })

    access_token = create_access_token({"sub": user_id})
    refresh_token = create_refresh_token({"sub": user_id})

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": serialize_user(user_doc),
    }


@router.post("/login", response_model=TokenResponse)
async def login(data: UserLogin):
    """Login with email and password."""
    db = get_db()
    user = await db.users.find_one({"email": data.email})

    if not user or not verify_password(data.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not user.get("is_active"):
        raise HTTPException(status_code=403, detail="Account is disabled")

    access_token = create_access_token({"sub": str(user["_id"])})
    refresh_token = create_refresh_token({"sub": str(user["_id"])})

    # Update last login
    await db.users.update_one({"_id": user["_id"]}, {"$set": {"last_login": datetime.utcnow()}})

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": serialize_user(user),
    }


@router.post("/firebase-login", response_model=TokenResponse)
async def firebase_login(data: FirebaseLoginRequest):
    """Login / register via Firebase token (Google OAuth)."""
    db = get_db()

    # In production: verify Firebase ID token using firebase-admin SDK
    # For now we decode the JWT locally (Firebase tokens are JWTs)
    # You must install firebase-admin and use: auth.verify_id_token(data.firebase_token)
    try:
        import base64, json
        parts = data.firebase_token.split(".")
        padded = parts[1] + "=" * (4 - len(parts[1]) % 4)
        payload = json.loads(base64.urlsafe_b64decode(padded))
        firebase_uid = payload.get("user_id") or payload.get("sub")
        email = payload.get("email", "")
        name = payload.get("name", email.split("@")[0])
        photo_url = payload.get("picture")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Firebase token")

    user = await db.users.find_one({"$or": [{"firebase_uid": firebase_uid}, {"email": email}]})

    if not user:
        user_id = str(uuid.uuid4())
        user = {
            "_id": user_id,
            "firebase_uid": firebase_uid,
            "email": email,
            "name": name,
            "photo_url": photo_url,
            "password_hash": None,
            "plan": "pro",
            "is_active": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        }
        await db.users.insert_one(user)
        await db.portfolio.insert_one({
            "_id": str(uuid.uuid4()),
            "user_id": user_id,
            "holdings": [],
            "created_at": datetime.utcnow(),
        })
    else:
        await db.users.update_one(
            {"_id": user["_id"]},
            {"$set": {"firebase_uid": firebase_uid, "photo_url": photo_url, "last_login": datetime.utcnow()}}
        )

    access_token = create_access_token({"sub": str(user["_id"])})
    refresh_token = create_refresh_token({"sub": str(user["_id"])})

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": serialize_user(user),
    }


@router.post("/refresh")
async def refresh_token(data: RefreshTokenRequest):
    """Get a new access token using refresh token."""
    payload = decode_token(data.refresh_token)
    if payload.get("type") != "refresh":
        raise HTTPException(status_code=400, detail="Invalid token type")

    user_id = payload.get("sub")
    new_access_token = create_access_token({"sub": user_id})

    return {"access_token": new_access_token, "token_type": "bearer"}


@router.get("/me")
async def get_me(user=Depends(get_current_user)):
    """Get current authenticated user."""
    return serialize_user(user)


@router.post("/logout")
async def logout(user=Depends(get_current_user)):
    """Logout (client should discard tokens)."""
    return {"message": "Logged out successfully"}
