from sqlalchemy.orm import Session, joinedload
from app.models.comment import Comment
from app.schemas.comment import CommentCreate, CommentUpdate
from typing import Optional, List

def get_comment(db: Session, comment_id: str) -> Optional[Comment]:
    """获取单个评论"""
    return db.query(Comment).options(joinedload(Comment.author)).filter(
        Comment.id == comment_id, 
        Comment.is_hidden == False
    ).first()

def get_post_comments(db: Session, post_id: str) -> List[Comment]:
    """获取帖子的评论"""
    return db.query(Comment).options(joinedload(Comment.author)).filter(
        Comment.post_id == post_id,
        Comment.is_hidden == False
    ).order_by(Comment.created_at.asc()).all()

def create_comment(db: Session, comment: CommentCreate, post_id: str, author_id: str) -> Comment:
    """创建评论"""
    db_comment = Comment(
        **comment.dict(),
        post_id=post_id,
        author_id=author_id
    )
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    return db_comment

def update_comment(db: Session, comment_id: str, comment_update: CommentUpdate) -> Optional[Comment]:
    """更新评论"""
    db_comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if db_comment:
        update_data = comment_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_comment, field, value)
        db.commit()
        db.refresh(db_comment)
    return db_comment

def delete_comment(db: Session, comment_id: str) -> bool:
    """删除评论"""
    db_comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if db_comment:
        db.delete(db_comment)
        db.commit()
        return True
    return False

def get_user_comments(db: Session, user_id: str, skip: int = 0, limit: int = 20) -> List[Comment]:
    """获取用户的评论"""
    return db.query(Comment).options(joinedload(Comment.author)).filter(
        Comment.author_id == user_id,
        Comment.is_hidden == False
    ).order_by(Comment.created_at.desc()).offset(skip).limit(limit).all()

# 管理员功能
def get_all_comments(db: Session, skip: int = 0, limit: int = 20) -> List[Comment]:
    """管理员获取所有评论（包括隐藏的）"""
    return db.query(Comment).options(joinedload(Comment.author)).order_by(
        Comment.created_at.desc()
    ).offset(skip).limit(limit).all()

def hide_comment(db: Session, comment_id: str) -> Optional[Comment]:
    """隐藏评论"""
    db_comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if db_comment:
        db_comment.is_hidden = True
        db.commit()
        db.refresh(db_comment)
    return db_comment