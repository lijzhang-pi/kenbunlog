from app.core.database import engine
from app.models import User, Post, Comment
from app.models.user import UserRole
from app.core.security import get_password_hash
from sqlalchemy.orm import sessionmaker

# 创建所有表
from app.core.database import Base
Base.metadata.create_all(bind=engine)

# 创建默认管理员用户
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

# 检查是否已有管理员用户
admin_user = db.query(User).filter(User.role == UserRole.ADMIN).first()

if not admin_user:
    admin = User(
        username="admin",
        email="admin@example.com",
        hashed_password=get_password_hash("admin123"),
        role=UserRole.ADMIN
    )
    db.add(admin)
    db.commit()
    print("创建默认管理员用户: admin / admin123")
else:
    print("管理员用户已存在")

db.close()
print("数据库初始化完成！")