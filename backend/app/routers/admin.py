from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.dependencies.auth import get_admin_user
from app.schemas.user import User
from app.schemas.post import Post
from app.schemas.comment import Comment
from app.crud import user as user_crud, post as post_crud, comment as comment_crud

router = APIRouter()

# 用户管理
@router.get("/users", response_model=List[User])
async def get_all_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """获取所有用户"""
    users = user_crud.get_users(db, skip=skip, limit=limit)
    return users

@router.put("/users/{user_id}/block")
async def block_user(
    user_id: str,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """屏蔽用户"""
    user = user_crud.update_user_block_status(db, user_id=user_id, is_blocked=True)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="用户未找到")
    return {"message": "用户已屏蔽"}

@router.put("/users/{user_id}/unblock")
async def unblock_user(
    user_id: str,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """解除屏蔽用户"""
    user = user_crud.update_user_block_status(db, user_id=user_id, is_blocked=False)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="用户未找到")
    return {"message": "用户已解除屏蔽"}

# 帖子管理
@router.get("/posts", response_model=List[Post])
async def get_all_posts(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """获取所有帖子（包括隐藏的）"""
    posts = post_crud.get_all_posts(db, skip=skip, limit=limit)
    return posts

@router.put("/posts/{post_id}/hide")
async def hide_post(
    post_id: str,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """隐藏帖子"""
    post = post_crud.hide_post(db, post_id=post_id)
    if post is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="帖子未找到")
    return {"message": "帖子已隐藏"}

@router.delete("/posts/{post_id}")
async def delete_post_admin(
    post_id: str,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """删除帖子（管理员）"""
    success = post_crud.delete_post(db, post_id=post_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="帖子未找到")
    return {"message": "帖子已删除"}

# 评论管理
@router.get("/comments", response_model=List[Comment])
async def get_all_comments(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """获取所有评论（包括隐藏的）"""
    comments = comment_crud.get_all_comments(db, skip=skip, limit=limit)
    return comments

@router.put("/comments/{comment_id}/hide")
async def hide_comment(
    comment_id: str,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """隐藏评论"""
    comment = comment_crud.hide_comment(db, comment_id=comment_id)
    if comment is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="评论未找到")
    return {"message": "评论已隐藏"}

@router.delete("/comments/{comment_id}")
async def delete_comment_admin(
    comment_id: str,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """删除评论（管理员）"""
    success = comment_crud.delete_comment(db, comment_id=comment_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="评论未找到")
    return {"message": "评论已删除"}