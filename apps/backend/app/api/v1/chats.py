"""Chat, Message endpoints."""
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, and_
from pydantic import BaseModel
from typing import Optional, List

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.chat import Chat, Message

router = APIRouter()


class ChatCreate(BaseModel):
    type: str = "direct"
    name: Optional[str] = None
    memberIds: List[str]
    description: Optional[str] = None


class MessageCreate(BaseModel):
    type: str = "text"
    content: str
    attachments: List[dict] = []
    replyTo: Optional[int] = None


@router.get("")
async def list_chats(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """Get all chats for current user."""
    result = await db.execute(
        select(Chat).where(Chat.members.contains([user.id])).order_by(Chat.last_message_at.desc())
    )
    chats = result.scalars().all()

    # Enrich with other member info
    items = []
    for chat in chats:
        data = chat.to_dict()
        # For direct chats, get other member's info
        if chat.type == "direct":
            other_ids = [m for m in (chat.members or []) if m != user.id]
            if other_ids:
                other = await db.execute(select(User).where(User.id == other_ids[0]))
                other_user = other.scalar_one_or_none()
                if other_user:
                    data["otherUser"] = {
                        "id": other_user.id,
                        "username": other_user.username,
                        "firstName": other_user.first_name,
                        "avatar": other_user.avatar,
                        "isOnline": other_user.is_online,
                    }
        data["unreadCount"] = (chat.unread_counts or {}).get(user.id, 0)
        items.append(data)
    return {"success": True, "data": items}


@router.post("", status_code=201)
async def create_chat(data: ChatCreate, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """Create a new chat."""
    members = list(set([user.id] + data.memberIds))

    # For direct chat, check if already exists
    if data.type == "direct" and len(members) == 2:
        for m in data.memberIds:
            existing = await db.execute(
                select(Chat).where(
                    and_(Chat.type == "direct", Chat.members.contains([m]))
                )
            )
            for c in existing.scalars().all():
                if sorted(c.members or []) == sorted(members):
                    return {"success": True, "data": c.to_dict()}

    chat = Chat(
        type=data.type,
        name=data.name,
        members=members,
        admins=[user.id] if data.type != "direct" else [],
        description=data.description,
    )
    db.add(chat)
    await db.flush()
    return {"success": True, "data": chat.to_dict()}


@router.get("/{chat_id}")
async def get_chat(chat_id: int, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Chat).where(Chat.id == chat_id))
    chat = result.scalar_one_or_none()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    if user.id not in (chat.members or []):
        raise HTTPException(status_code=403, detail="Not a member")
    return {"success": True, "data": chat.to_dict()}


@router.get("/{chat_id}/messages")
async def get_messages(
    chat_id: int,
    limit: int = Query(50, le=200),
    before: Optional[int] = None,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get chat messages."""
    chat = await db.execute(select(Chat).where(Chat.id == chat_id))
    chat = chat.scalar_one_or_none()
    if not chat or user.id not in (chat.members or []):
        raise HTTPException(status_code=403, detail="Access denied")

    query = select(Message).where(Message.chat_id == chat_id, Message.is_deleted == False)
    if before:
        query = query.where(Message.id < before)
    query = query.order_by(Message.id.desc()).limit(limit)
    result = await db.execute(query)
    messages = list(reversed([m.to_dict() for m in result.scalars().all()]))
    return {"success": True, "data": messages}


@router.post("/{chat_id}/messages", status_code=201)
async def send_message(
    chat_id: int,
    data: MessageCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    chat = await db.execute(select(Chat).where(Chat.id == chat_id))
    chat = chat.scalar_one_or_none()
    if not chat or user.id not in (chat.members or []):
        raise HTTPException(status_code=403, detail="Access denied")

    message = Message(
        chat_id=chat_id,
        sender_id=user.id,
        type=data.type,
        content=data.content,
        attachments=data.attachments,
        reply_to=data.replyTo,
    )
    db.add(message)

    # Update chat
    chat.last_message = data.content[:100]
    chat.last_message_at = datetime.utcnow()
    # Increment unread for other members
    unread = dict(chat.unread_counts or {})
    for m in (chat.members or []):
        if m != user.id:
            unread[m] = unread.get(m, 0) + 1
    chat.unread_counts = unread

    await db.flush()
    return {"success": True, "data": message.to_dict()}


@router.post("/{chat_id}/read")
async def mark_read(chat_id: int, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    chat = await db.execute(select(Chat).where(Chat.id == chat_id))
    chat = chat.scalar_one_or_none()
    if not chat or user.id not in (chat.members or []):
        raise HTTPException(status_code=403, detail="Access denied")

    unread = dict(chat.unread_counts or {})
    unread[user.id] = 0
    chat.unread_counts = unread

    # Mark all messages as read
    from sqlalchemy import update
    await db.execute(
        update(Message)
        .where(Message.chat_id == chat_id, Message.sender_id != user.id)
        .values(read_by=Message.read_by.op("||")([user.id]))
    )
    return {"success": True, "data": {"read": True}}


@router.post("/{chat_id}/typing")
async def typing(chat_id: int, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return {"success": True, "data": {"typing": True}}
