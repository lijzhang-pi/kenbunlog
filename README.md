# Kenbunlog - 全栈博客系统

一个基于 Python FastAPI 和 React 的现代化全栈博客网站，支持用户认证、发帖、评论和管理功能。

## 功能特性

- ✅ 用户注册/登录系统
- ✅ JWT 认证
- ✅ 发布文字和图片帖子
- ✅ 评论系统
- ✅ 用户权限管理
- ✅ 管理员后台
- ✅ 响应式设计

## 技术栈

### 后端
- Python 3.8+
- FastAPI
- SQLAlchemy
- SQLite/PostgreSQL
- JWT 认证
- Pillow (图片处理)

### 前端
- React 18
- TypeScript
- Tailwind CSS
- Axios
- React Router

## 快速开始

### 1. 启动后端

```bash
cd backend

# 安装依赖
pip install -r requirements.txt

# 初始化数据库
python create_db.py

# 启动开发服务器
python main.py
```

后端将在 http://localhost:8000 运行
API 文档：http://localhost:8000/docs

### 2. 启动前端

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm start
```

前端将在 http://localhost:3000 运行

## 环境配置

### 后端环境变量

创建 `.env` 文件并配置以下变量：

```env
SECRET_KEY=your-secret-key-here
DATABASE_URL=sqlite:///./posts.db
```

## API 接口

### 认证
- POST `/api/auth/register` - 用户注册
- POST `/api/auth/login` - 用户登录

### 帖子
- GET `/api/posts` - 获取帖子列表
- GET `/api/posts/{id}` - 获取帖子详情
- POST `/api/posts` - 创建帖子
- PUT `/api/posts/{id}` - 更新帖子
- DELETE `/api/posts/{id}` - 删除帖子

### 评论
- GET `/api/comments/post/{post_id}` - 获取帖子评论
- POST `/api/comments/post/{post_id}` - 创建评论
- PUT `/api/comments/{id}` - 更新评论
- DELETE `/api/comments/{id}` - 删除评论

### 上传
- POST `/api/upload/image` - 上传图片

### 管理员
- GET `/api/admin/users` - 获取用户列表
- PUT `/api/admin/users/{id}/block` - 屏蔽用户
- PUT `/api/admin/users/{id}/unblock` - 解除屏蔽
- GET `/api/admin/posts` - 获取所有帖子
- PUT `/api/admin/posts/{id}/hide` - 隐藏帖子

## 项目结构

```
kenbunlog/
├── backend/           # Python FastAPI 后端
│   ├── app/
│   │   ├── models/    # 数据库模型
│   │   ├── routers/   # API 路由
│   │   ├── schemas/   # Pydantic 模型
│   │   ├── crud/      # 数据库操作
│   │   ├── core/      # 配置和工具
│   │   └── dependencies/ # 依赖注入
│   ├── uploads/       # 上传文件目录
│   └── main.py        # 应用入口
├── frontend/          # React 前端
│   ├── src/
│   │   ├── components/ # React 组件
│   │   ├── pages/     # 页面组件
│   │   ├── services/  # API 服务
│   │   ├── contexts/  # React Context
│   │   └── types/     # TypeScript 类型
│   └── public/        # 静态资源
└── README.md
```

## 已完成功能

- ✅ 用户注册/登录/权限管理
- ✅ 帖子列表和详情页面
- ✅ 创建/编辑/删除帖子
- ✅ 图片上传功能
- ✅ 评论系统（发表/查看评论）
- ✅ 用户个人资料页面
- ✅ 管理员后台界面
- ✅ 用户屏蔽/解封功能
- ✅ 帖子/评论隐藏/删除功能
- ✅ 响应式设计

## 待扩展功能

- [ ] 帖子搜索功能
- [ ] 邮件通知
- [ ] 用户头像上传
- [ ] 帖子点赞功能
- [ ] 评论回复功能

## 开发指南

### 添加新的 API 端点
1. 在 `backend/app/models/` 中定义数据模型
2. 在 `backend/app/schemas/` 中定义 Pydantic 模型
3. 在 `backend/app/crud/` 中实现数据库操作
4. 在 `backend/app/routers/` 中创建 API 路由
5. 在 `main.py` 中注册路由

### 添加新的前端页面
1. 在 `frontend/src/types/` 中定义 TypeScript 类型
2. 在 `frontend/src/services/` 中添加 API 调用
3. 在 `frontend/src/pages/` 中创建页面组件
4. 在 `App.tsx` 中添加路由

## 部署说明

### 生产环境部署
1. 设置强密钥 `SECRET_KEY`
2. 配置生产数据库
3. 构建前端生产版本：`npm run build`
4. 配置反向代理（如 Nginx）

## 贡献指南

1. Fork 本项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

## 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 作者

Zhang Lijun - 初始工作