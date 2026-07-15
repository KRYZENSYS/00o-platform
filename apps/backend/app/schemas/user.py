"""User schemas."""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional


class RegisterIn(BaseModel):
    email: EmailStr
    username: str = Field(min_length=3, max_length=30, pattern=r"^[a-zA-Z0-9_]+$")
    password: str = Field(min_length=8, max_length=100)
    first_name: str = Field(min_length=1, max_length=50)
    last_name: Optional[str] = Field(None, max_length=50)
    referral_code: Optional[str] = None


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    email: Optional[str] = None
    username: str
    firstName: str
    lastName: Optional[str] = ""
    avatar: Optional[str] = None
    bio: Optional[str] = None
    isPremium: bool = False
    isVerified: bool = False
    role: str = "user"
    tokens: int = 0
    xp: int = 0
    level: str = "Bronze"
    followersCount: int = 0
    followingCount: int = 0
    referralCode: str = ""


class TokenOut(BaseModel):
    success: bool = True
    data: dict
