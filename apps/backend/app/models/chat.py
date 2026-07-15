"""Chat, Message, Feed, Notification models."""
from datetime import datetime
from sqlalchemy import String, Text, Integer, DateTime, ForeignKey, Boolean, JSON
from sqlalchemy.orm import Mapped, mapped_column
from typing import Optional

from app.core.database import Base


class Chat(Base):
    __tablename__ = "chats"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    type: Mapped[str] = mapped_column(String(20), default="direct")  # direct, group, channel
    name: Mapped[Optional[str]] = mapped_column(String(255))
    avatar: Mapped[Optional[str]] = mapped_column(String(500))
    description: Mapped[Optional[str]] = mapped_column(Text)
    members: Mapped[list] = mapped_column(JSON, default=list)  # list of user IDs
    admins: Mapped[list] = mapped_column(JSON, default=list)
    last_message: Mapped[Optional[str]] = mapped_column(Text)
    last_message_at: Mapped[Optional[datetime]] = mapped_column(DateTime)
    unread_counts: Mapped[dict] = mapped_column(JSON, default=dict)  # {user_id: count}
    metadata_json: Mapped[dict] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "type": self.type,
            "name": self.name,
            "avatar": self.avatar,
            "description": self.description,
            "members": self.members,
            "admins": self.admins,
            "lastMessage": self.last_message,
            "lastMessageAt": self.last_message_at.isoformat() if self.last_message_at else None,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }


class Message(Base):
    __tablename__ = "messages"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    chat_id: Mapped[int] = mapped_column(Integer, ForeignKey("chats.id", ondelete="CASCADE"), index=True)
    sender_id: Mapped[str] = mapped_column(String(32), ForeignKey("users.id", ondelete="CASCADE"), index=True)
    type: Mapped[str] = mapped_column(String(20), default="text")  # text, image, file, audio, system
    content: Mapped[str] = mapped_column(Text)
    attachments: Mapped[list] = mapped_column(JSON, default=list)
    reply_to: Mapped[Optional[int]] = mapped_column(Integer)
    read_by: Mapped[list] = mapped_column(JSON, default=list)
    is_edited: Mapped[bool] = mapped_column(Boolean, default=False)
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "chatId": self.chat_id,
            "senderId": self.sender_id,
            "type": self.type,
            "content": self.content,
            "attachments": self.attachments,
            "replyTo": self.reply_to,
            "readBy": self.read_by,
            "isEdited": self.is_edited,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }


class Post(Base):
    __tablename__ = "posts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(String(32), ForeignKey("users.id", ondelete="CASCADE"), index=True)
    content: Mapped[str] = mapped_column(Text)
    media: Mapped[list] = mapped_column(JSON, default=list)  # [{type, url, thumbnail}]
    media_type: Mapped[str] = mapped_column(String(20), default="text")  # text, image, video, link
    tags: Mapped[list] = mapped_column(JSON, default=list)
    mentions: Mapped[list] = mapped_column(JSON, default=list)
    hashtags: Mapped[list] = mapped_column(JSON, default=list)
    visibility: Mapped[str] = mapped_column(String(20), default="public")  # public, followers, private

    # Related entities
    startup_id: Mapped[Optional[int]] = mapped_column(Integer)
    service_id: Mapped[Optional[int]] = mapped_column(Integer)
    job_id: Mapped[Optional[int]] = mapped_column(Integer)

    # Engagement
    likes_count: Mapped[int] = mapped_column(Integer, default=0)
    comments_count: Mapped[int] = mapped_column(Integer, default=0)
    shares_count: Mapped[int] = mapped_column(Integer, default=0)
    views_count: Mapped[int] = mapped_column(Integer, default=0)

    is_pinned: Mapped[bool] = mapped_column(Boolean, default=False)
    is_edited: Mapped[bool] = mapped_column(Boolean, default=False)
    is_hidden: Mapped[bool] = mapped_column(Boolean, default=False)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "userId": self.user_id,
            "content": self.content,
            "media": self.media,
            "mediaType": self.media_type,
            "tags": self.tags,
            "mentions": self.mentions,
            "hashtags": self.hashtags,
            "visibility": self.visibility,
            "startupId": self.startup_id,
            "serviceId": self.service_id,
            "jobId": self.job_id,
            "likesCount": self.likes_count,
            "commentsCount": self.comments_count,
            "sharesCount": self.shares_count,
            "viewsCount": self.views_count,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }


class Comment(Base):
    __tablename__ = "comments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    post_id: Mapped[int] = mapped_column(Integer, ForeignKey("posts.id", ondelete="CASCADE"), index=True)
    user_id: Mapped[str] = mapped_column(String(32), ForeignKey("users.id", ondelete="CASCADE"), index=True)
    content: Mapped[str] = mapped_column(Text)
    parent_id: Mapped[Optional[int]] = mapped_column(Integer)  # for nested comments
    likes_count: Mapped[int] = mapped_column(Integer, default=0)
    is_edited: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "postId": self.post_id,
            "userId": self.user_id,
            "content": self.content,
            "parentId": self.parent_id,
            "likesCount": self.likes_count,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }


class Like(Base):
    __tablename__ = "likes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(String(32), ForeignKey("users.id", ondelete="CASCADE"), index=True)
    target_type: Mapped[str] = mapped_column(String(30))  # post, comment, startup, service
    target_id: Mapped[int] = mapped_column(Integer, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(String(32), ForeignKey("users.id", ondelete="CASCADE"), index=True)
    type: Mapped[str] = mapped_column(String(50))  # like, comment, follow, message, etc
    title: Mapped[str] = mapped_column(String(255))
    body: Mapped[Optional[str]] = mapped_column(Text)
    icon: Mapped[Optional[str]] = mapped_column(String(50))
    image: Mapped[Optional[str]] = mapped_column(String(500))
    action_url: Mapped[Optional[str]] = mapped_column(String(500))
    actor_id: Mapped[Optional[str]] = mapped_column(String(32))
    target_type: Mapped[Optional[str]] = mapped_column(String(30))
    target_id: Mapped[Optional[int]] = mapped_column(Integer)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False)
    read_at: Mapped[Optional[datetime]] = mapped_column(DateTime)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "type": self.type,
            "title": self.title,
            "body": self.body,
            "icon": self.icon,
            "image": self.image,
            "actionUrl": self.action_url,
            "actorId": self.actor_id,
            "targetType": self.target_type,
            "targetId": self.target_id,
            "isRead": self.is_read,
            "readAt": self.read_at.isoformat() if self.read_at else None,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }
