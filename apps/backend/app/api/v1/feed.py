"""Feed endpoints."""
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, func
from pydantic import BaseModel
from typing import Optional, List

from app.core.database import get_db
from app.core.deps import get_current_user, get_current_user_optional
from app.models.user import User
from app.models.chat import Post, Comment, Like

router = APIRouter()


class PostCreate(BaseModel):
    content: str
    media: List[dict] = []
    mediaType: str = "text"
    tags: List[str] = []
    mentions: List[str] = []
    hashtags: List[str] = []
    visibility: str = "public"
    startupId: Optional[int] = None
    serviceId: Optional[int] = None
    jobId: Optional[int] = None


@router.get("")
async def list_posts(
    limit: int = Query(20, le=100),
    offset: int = 0,
    user: Optional[User] = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db),
):
    """List public posts."""
    result = await db.execute(
        select(Post, User)
        .join(User, User.id == Post.user_id)
        .where(Post.is_hidden == False, Post.visibility == "public")
        .order_by(Post.is_pinned.desc(), Post.created_at.desc())
        .limit(limit).offset(offset)
    )
    items = []
    for p, u in result.all():
        data = p.to_dict()
        data["user"] = u.to_dict()
        if user:
            lk = await db.execute(
                select(Like).where(
                    Like.user_id == user.id,
                    Like.target_type == "post",
                    Like.target_id == p.id,
                )
            )
            data["isLiked"] = lk.scalar_one_or_none() is not None
        items.append(data)
    return {"success": True, "data": items}


@router.get("/trending")
async def trending(db: AsyncSession = Depends(get_db)):
    """Get trending posts."""
    from datetime import timedelta
    week_ago = datetime.utcnow() - timedelta(days=7)
    result = await db.execute(
        select(Post, User)
        .join(User, User.id == Post.user_id)
        .where(Post.created_at >= week_ago, Post.is_hidden == False)
        .order_by((Post.likes_count + Post.comments_count * 2).desc())
        .limit(20)
    )
    items = []
    for p, u in result.all():
        data = p.to_dict()
        data["user"] = u.to_dict()
        items.append(data)
    return {"success": True, "data": items}


@router.post("", status_code=201)
async def create_post(data: PostCreate, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    post = Post(
        user_id=user.id,
        content=data.content,
        media=data.media,
        media_type=data.mediaType,
        tags=data.tags,
        mentions=data.mentions,
        hashtags=data.hashtags,
        visibility=data.visibility,
        startup_id=data.startupId,
        service_id=data.serviceId,
        job_id=data.jobId,
    )
    db.add(post)
    user.posts_count = (user.posts_count or 0) + 1
    await db.flush()
    return {"success": True, "data": post.to_dict()}


@router.get("/{post_id}")
async def get_post(post_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Post, User)
        .join(User, User.id == Post.user_id)
        .where(Post.id == post_id, Post.is_hidden == False)
    )
    row = result.first()
    if not row:
        raise HTTPException(status_code=404, detail="Post not found")
    p, u = row
    data = p.to_dict()
    data["user"] = u.to_dict()
    p.views_count = (p.views_count or 0) + 1
    return {"success": True, "data": data}


@router.delete("/{post_id}")
async def delete_post(post_id: int, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Post).where(Post.id == post_id))
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    if post.user_id != user.id and user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    post.is_hidden = True
    return {"success": True, "data": {"deleted": True}}


@router.post("/{post_id}/like")
async def like_post(post_id: int, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Post).where(Post.id == post_id))
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    existing = await db.execute(
        select(Like).where(
            Like.user_id == user.id, Like.target_type == "post", Like.target_id == post_id
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Already liked")

    like = Like(user_id=user.id, target_type="post", target_id=post_id)
    db.add(like)
    post.likes_count = (post.likes_count or 0) + 1
    return {"success": True, "data": {"liked": True, "likesCount": post.likes_count}}


@router.delete("/{post_id}/like")
async def unlike_post(post_id: int, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Like).where(
            Like.user_id == user.id, Like.target_type == "post", Like.target_id == post_id
        )
    )
    like = result.scalar_one_or_none()
    if not like:
        raise HTTPException(status_code=400, detail="Not liked")

    await db.delete(like)
    post_res = await db.execute(select(Post).where(Post.id == post_id))
    post = post_res.scalar_one_or_none()
    if post:
        post.likes_count = max(0, (post.likes_count or 0) - 1)
    return {"success": True, "data": {"liked": False}}


@router.post("/{post_id}/share")
async def share_post(post_id: int, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Post).where(Post.id == post_id))
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    post.shares_count = (post.shares_count or 0) + 1
    return {"success": True, "data": {"sharesCount": post.shares_count}}


@router.get("/{post_id}/comments")
async def get_comments(post_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Comment, User)
        .join(User, User.id == Comment.user_id)
        .where(Comment.post_id == post_id)
        .order_by(Comment.created_at.asc())
    )
    items = []
    for c, u in result.all():
        data = c.to_dict()
        data["user"] = u.to_dict()
        items.append(data)
    return {"success": True, "data": items}


@router.post("/{post_id}/comments", status_code=201)
async def add_comment(post_id: int, data: dict, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Post).where(Post.id == post_id))
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    comment = Comment(
        post_id=post_id,
        user_id=user.id,
        content=data.get("content", ""),
        parent_id=data.get("parentId"),
    )
    db.add(comment)
    post.comments_count = (post.comments_count or 0) + 1
    await db.flush()
    return {"success": True, "data": comment.to_dict()}
