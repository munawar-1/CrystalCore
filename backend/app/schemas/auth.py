"""
Pydantic schemas for Role-Based Authentication.
Supports Coder and Marketing Team roles.
"""

from typing import List, Optional
from pydantic import BaseModel

class UserProfile(BaseModel):
    id: str
    name: str
    role: str  # "coder" | "marketing"
    role_name: str
    email: str
    title: str
    avatar: str
    permissions: List[str]

class LoginRequest(BaseModel):
    role: str  # "coder" | "marketing"
    email: Optional[str] = None
    password: Optional[str] = None

class AuthResponse(BaseModel):
    success: bool
    user: UserProfile
    token: str
    message: str
