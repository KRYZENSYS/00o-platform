"""Chat, Message, Post, Comment, Like models."""
from datetime import datetime
from sqlalchemy import (
    Column, String, Integer, Boolean, DateTime, Text, ForeignKey, JSON, Index, BigInteger,
)
from sqlalchemy.orm import relationship
from app.core.database import Base
import uuid


def _uuid():
    return str(uuid.uuid4())


class Chat(Base):
    """Chat room (direct or group)."""
    __tablename__ = "chats"
    id = Column(Integer, primary_key=True, index=True)
    type = Column(String(20), default="direct", index=True)  # direct, group, channel
    name = Column(String(200), nullable=True)
    description = Column(Text, nullable=True)
    avatar = Column(String(500), nullable=True)
    members = Column(JSON, default=list)  # list of user ids
    admins = Column(JSON, default=list)
    last_message = Column(Text, nullable=True)
    last_message_at = Column(DateTime, nullable=True)
    unread_counts = Column(JSON, default=dict)  # {user_id: count}
    is_archived = Column(Boolean, default=False)
    is_pinned = Column(Boolean, default=False)
    metadata_json = Column("metadata_json", JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    messages = relationship("Message", back_populates="chat", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id, "type": self.type, "name": self.name, "description": self.description,
            "avatar": self.avatar, "members": self.members or [], "admins": self.admins or [],
            "lastMessage": self.last_message, "lastMessageAt": self.last_message_at.isoformat() if self.last_message_at else None,
            "isArchived": self.is_archived, "isPinned": self.is_pinned,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }


class Message(Base):
    """Chat message."""
    __tablename__ = "messages"
    id = Column(BigInteger, primary_key=True, index=True)
    chat_id = Column(Integer, ForeignKey("chats.id", ondelete="CASCADE"), index=True)
    sender_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True)
    type = Column(String(20), default="text")  # text, image, file, voice, system
    content = Column(Text, nullable=False)
    attachments = Column(JSON, default=list)  # list of {url, type, name, size}
    reply_to = Column(BigInteger, ForeignKey("messages.id"), nullable=True)
    read_by = Column(JSON, default=list)  # list of user ids
    reactions = Column(JSON, default=dict)  # {user_id: emoji}
    is_edited = Column(Boolean, default=False)
    is_deleted = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    chat = relationship("Chat", back_populates="messages")

    def to_dict(self):
        return {
            "id": self.id, "chatId": self.chat_id, "senderId": self.sender_id, "type": self.type,
            "content": self.content, "attachments": self.attachments or [],
            "replyTo": self.reply_to, "readBy": self.read_by or [], "reactions": self.reactions or {},
            "isEdited": self.is_edited, "isDeleted": self.is_deleted,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }


class Post(Base):
    """Social feed post."""
    __tablename__ = "posts"
    id = Column(BigInteger, primary_key=True, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True)
    content = Column(Text, nullable=False)
    media = Column(JSON, default=list)  # list of {url, type, thumbnail}
    media_type = Column(String(20), default="text")  # text, image, video, link, poll
    tags = Column(JSON, default=list)
    mentions = Column(JSON, default=list)
    hashtags = Column(JSON, default=list)
    visibility = Column(String(20), default="public")  # public, followers, private
    is_pinned = Column(Boolean, default=False)
    is_featured = Column(Boolean, default=False)
    is_hidden = Column(Boolean, default=False)
    likes_count = Column(Integer, default=0, index=True)
    comments_count = Column(Integer, default=0)
    shares_count = Column(Integer, default=0)
    views_count = Column(Integer, default=0)
    startup_id = Column(Integer, ForeignKey("startups.id"), nullable=True)
    service_id = Column(Integer, nullable=True)
    job_id = Column(Integer, nullable=True)
    metadata_json = Column("metadata_json", JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (Index("idx_post_user_created", "user_id", "created_at"),)

    def to_dict(self):
        return {
            "id": self.id, "userId": self.user_id, "content": self.content, "media": self.media or [],
            "mediaType": self.media_type, "tags": self.tags or [], "mentions": self.mentions or [],
            "hashtags": self.hashtags or [], "visibility": self.visibility,
            "isPinned": self.is_pinned, "isFeatured": self.is_featured, "isHidden": self.is_hidden,
            "likesCount": self.likes_count, "commentsCount": self.comments_count,
            "sharesCount": self.shares_count, "viewsCount": self.views_count,
            "startupId": self.startup_id, "serviceId": self.service_id, "jobId": self.job_id,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }


class Comment(Base):
    """Post comment."""
    __tablename__ = "comments"
    id = Column(BigInteger, primary_key=True, index=True)
    post_id = Column(BigInteger, ForeignKey("posts.id", ondelete="CASCADE"), index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True)
    parent_id = Column(BigInteger, ForeignKey("comments.id"), nullable=True)
    content = Column(Text, nullable=False)
    likes_count = Column(Integer, default=0)
    is_edited = Column(Boolean, default=False)
    is_hidden = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id, "postId": self.post_id, "userId": self.user_id, "parentId": self.parent_id,
            "content": self.content, "likesCount": self.likes_count, "isEdited": self.is_edited,
            "isHidden": self.is_hidden,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }


class Like(Base):
    """Like (post, comment, startup, service, etc)."""
    __tablename__ = "likes"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True)
    target_type = Column(String(20), index=True)  # post, comment, startup, service, job
    target_id = Column(BigInteger, index=True)
    reaction = Column(String(10), default="like")  # like, love, fire, wow
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    __table_args__ = (Index("idx_like_unique", "user_id", "target_type", "target_id", unique=True),)

    def to_dict(self):
        return {
            "id": self.id, "userId": self.user_id, "targetType": self.target_type,
            "targetId": self.target_id, "reaction": self.reaction,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }


class Follow(Base):
    """User follow relationship."""
    __tablename__ = "follows"
    id = Column(Integer, primary_key=True, index=True)
    follower_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True)
    following_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True)
    is_close_friend = Column(Boolean, default=False)
    notify = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    __table_args__ = (Index("idx_follow_unique", "follower_id", "following_id", unique=True),)

    def to_dict(self):
        return {
            "id": self.id, "followerId": self.follower_id, "followingId": self.following_id,
            "isCloseFriend": self.is_close_friend, "notify": self.notify,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }
