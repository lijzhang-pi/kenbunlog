from sqlalchemy.orm import Session, joinedload
from app.models.post import Post
from app.models.comment import Comment
from app.models.user import User
from app.schemas.post import PostCreate, PostUpdate
from typing import Optional, List

def get_post(db: Session, post_id: str) -> Optional[Post]:
    """获取单个帖子"""
    return db.query(Post).options(joinedload(Post.author)).filter(Post.id == post_id, Post.is_hidden == False).first()

def get_post_with_comments(db: Session, post_id: str) -> Optional[Post]:
    """获取帖子及其评论"""
    return db.query(Post).options(
        joinedload(Post.author),
        joinedload(Post.comments).joinedload(Comment.author)
    ).filter(Post.id == post_id, Post.is_hidden == False).first()

def get_posts(db: Session, skip: int = 0, limit: int = 20, search: Optional[str] = None) -> List[Post]:
    """获取帖子列表"""
    query = db.query(Post).options(joinedload(Post.author)).filter(Post.is_hidden == False)
    
    if search:
        # 在标题和内容中搜索关键词（不区分大小写）
        search_filter = f"%{search}%"
        query = query.filter(
            (Post.title.ilike(search_filter)) | 
            (Post.content.ilike(search_filter))
        )
    
    return query.order_by(Post.created_at.desc()).offset(skip).limit(limit).all()

def create_post(db: Session, post: PostCreate, author_id: str) -> Post:
    """创建帖子"""
    db_post = Post(**post.dict(), author_id=author_id)
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    return db_post

def update_post(db: Session, post_id: str, post_update: PostUpdate) -> Optional[Post]:
    """更新帖子"""
    db_post = db.query(Post).filter(Post.id == post_id).first()
    if db_post:
        update_data = post_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_post, field, value)
        db.commit()
        db.refresh(db_post)
    return db_post

def delete_post(db: Session, post_id: str) -> bool:
    """删除帖子"""
    db_post = db.query(Post).filter(Post.id == post_id).first()
    if db_post:
        db.delete(db_post)
        db.commit()
        return True
    return False

def get_user_posts(db: Session, user_id: str, skip: int = 0, limit: int = 20) -> List[Post]:
    """获取用户的帖子"""
    return db.query(Post).options(joinedload(Post.author)).filter(
        Post.author_id == user_id,
        Post.is_hidden == False
    ).order_by(Post.created_at.desc()).offset(skip).limit(limit).all()

# 管理员功能
def get_all_posts(db: Session, skip: int = 0, limit: int = 20) -> List[Post]:
    """管理员获取所有帖子（包括隐藏的）"""
    return db.query(Post).options(joinedload(Post.author)).order_by(Post.created_at.desc()).offset(skip).limit(limit).all()

def hide_post(db: Session, post_id: str) -> Optional[Post]:
    """隐藏帖子"""
    db_post = db.query(Post).filter(Post.id == post_id).first()
    if db_post:
        db_post.is_hidden = True
        db.commit()
        db.refresh(db_post)
    return db_post