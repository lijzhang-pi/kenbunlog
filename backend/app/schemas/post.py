from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List, TYPE_CHECKING
from .user import User

if TYPE_CHECKING:
    from .comment import Comment

class PostBase(BaseModel):
    title: str
    content: str
    image_urls: Optional[List[str]] = []

class PostCreate(PostBase):
    pass

class PostUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    image_urls: Optional[List[str]] = None

class Post(PostBase):
    id: str
    author_id: str
    is_hidden: bool
    created_at: datetime
    updated_at: Optional[datetime]
    author: User
    
    class Config:
        from_attributes = True

class PostWithComments(Post):
    comments: List['Comment'] = []
    
    class Config:
        from_attributes = True