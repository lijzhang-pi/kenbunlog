from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.routers import auth, posts, comments, admin, upload

app = FastAPI(
    title="发帖网站 API",
    description="一个支持用户发帖和评论的网站API",
    version="1.0.0"
)

# CORS配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 静态文件服务
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# 路由
app.include_router(auth.router, prefix="/api/auth", tags=["认证"])
app.include_router(posts.router, prefix="/api/posts", tags=["帖子"])
app.include_router(comments.router, prefix="/api/comments", tags=["评论"])
app.include_router(upload.router, prefix="/api/upload", tags=["上传"])
app.include_router(admin.router, prefix="/api/admin", tags=["管理"])

@app.get("/")
async def root():
    return {"message": "发帖网站 API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)