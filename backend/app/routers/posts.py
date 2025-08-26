from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app.dependencies.auth import get_current_active_user
from app.schemas.post import Post, PostCreate, PostUpdate, PostWithComments
from app.schemas.user import User
from app.crud import post as post_crud

router = APIRouter()

@router.get("/", response_model=List[Post])
async def get_posts(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None, description="搜索关键词，将在标题和内容中搜索"),
    db: Session = Depends(get_db)
):
    """获取帖子列表"""
    posts = post_crud.get_posts(db, skip=skip, limit=limit, search=search)
    return posts

@router.get("/{post_id}", response_model=PostWithComments)
async def get_post(post_id: str, db: Session = Depends(get_db)):
    """获取帖子详情"""
    post = post_crud.get_post_with_comments(db, post_id=post_id)
    if post is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="帖子未找到")
    return post

@router.post("/", response_model=Post)
async def create_post(
    post_data: PostCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """创建帖子"""
    post = post_crud.create_post(db=db, post=post_data, author_id=current_user.id)
    return post

@router.put("/{post_id}", response_model=Post)
async def update_post(
    post_id: str,
    post_update: PostUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """更新帖子"""
    # 检查帖子是否存在
    db_post = post_crud.get_post(db, post_id=post_id)
    if db_post is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="帖子未找到")
    
    # 检查权限（只能编辑自己的帖子）
    if db_post.author_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="无权编辑此帖子")
    
    updated_post = post_crud.update_post(db=db, post_id=post_id, post_update=post_update)
    return updated_post

@router.delete("/{post_id}")
async def delete_post(
    post_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """删除帖子"""
    # 检查帖子是否存在
    db_post = post_crud.get_post(db, post_id=post_id)
    if db_post is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="帖子未找到")
    
    # 检查权限（只能删除自己的帖子）
    if db_post.author_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="无权删除此帖子")
    
    success = post_crud.delete_post(db=db, post_id=post_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="删除失败")
    
    return {"message": "帖子已删除"}

@router.get("/user/{user_id}", response_model=List[Post])
async def get_user_posts(
    user_id: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """获取用户的帖子"""
    posts = post_crud.get_user_posts(db, user_id=user_id, skip=skip, limit=limit)
    return posts