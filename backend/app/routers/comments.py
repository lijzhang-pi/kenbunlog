from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.dependencies.auth import get_current_active_user
from app.schemas.comment import Comment, CommentCreate, CommentUpdate
from app.schemas.user import User
from app.crud import comment as comment_crud, post as post_crud

router = APIRouter()

@router.get("/post/{post_id}", response_model=List[Comment])
async def get_post_comments(post_id: str, db: Session = Depends(get_db)):
    """获取帖子的评论"""
    # 检查帖子是否存在
    post = post_crud.get_post(db, post_id=post_id)
    if post is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="帖子未找到")
    
    comments = comment_crud.get_post_comments(db, post_id=post_id)
    return comments

@router.post("/post/{post_id}", response_model=Comment)
async def create_comment(
    post_id: str,
    comment_data: CommentCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """在帖子下创建评论"""
    # 检查帖子是否存在
    post = post_crud.get_post(db, post_id=post_id)
    if post is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="帖子未找到")
    
    comment = comment_crud.create_comment(
        db=db,
        comment=comment_data,
        post_id=post_id,
        author_id=current_user.id
    )
    return comment

@router.put("/{comment_id}", response_model=Comment)
async def update_comment(
    comment_id: str,
    comment_update: CommentUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """更新评论"""
    # 检查评论是否存在
    db_comment = comment_crud.get_comment(db, comment_id=comment_id)
    if db_comment is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="评论未找到")
    
    # 检查权限（只能编辑自己的评论）
    if db_comment.author_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="无权编辑此评论")
    
    updated_comment = comment_crud.update_comment(
        db=db,
        comment_id=comment_id,
        comment_update=comment_update
    )
    return updated_comment

@router.delete("/{comment_id}")
async def delete_comment(
    comment_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """删除评论"""
    # 检查评论是否存在
    db_comment = comment_crud.get_comment(db, comment_id=comment_id)
    if db_comment is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="评论未找到")
    
    # 检查权限（只能删除自己的评论）
    if db_comment.author_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="无权删除此评论")
    
    success = comment_crud.delete_comment(db=db, comment_id=comment_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="删除失败")
    
    return {"message": "评论已删除"}

@router.get("/user/{user_id}", response_model=List[Comment])
async def get_user_comments(
    user_id: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """获取用户的评论"""
    comments = comment_crud.get_user_comments(db, user_id=user_id, skip=skip, limit=limit)
    return comments