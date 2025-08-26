from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from .user import User

class CommentBase(BaseModel):
    content: str

class CommentCreate(CommentBase):
    pass

class CommentUpdate(BaseModel):
    content: Optional[str] = None

class Comment(CommentBase):
    id: str
    post_id: str
    author_id: str
    is_hidden: bool
    created_at: datetime
    updated_at: Optional[datetime]
    author: User
    
    class Config:
        from_attributes = True