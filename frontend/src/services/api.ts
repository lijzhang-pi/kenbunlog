import axios from 'axios';
import { AuthToken, LoginData, RegisterData, Post, PostWithComments, PostCreateData, Comment, CommentCreateData, User } from '../types';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// 请求拦截器 - 添加认证token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截器 - 处理认证错误
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (data: LoginData): Promise<AuthToken> =>
    api.post('/auth/login', data).then(res => res.data),
  
  register: (data: RegisterData): Promise<User> =>
    api.post('/auth/register', data).then(res => res.data),
};

export const postsApi = {
  getPosts: (skip = 0, limit = 20): Promise<Post[]> =>
    api.get(`/posts?skip=${skip}&limit=${limit}`).then(res => res.data),
  
  getPost: (id: string): Promise<PostWithComments> =>
    api.get(`/posts/${id}`).then(res => res.data),
  
  createPost: (data: PostCreateData): Promise<Post> =>
    api.post('/posts', data).then(res => res.data),
  
  updatePost: (id: string, data: Partial<PostCreateData>): Promise<Post> =>
    api.put(`/posts/${id}`, data).then(res => res.data),
  
  deletePost: (id: string): Promise<void> =>
    api.delete(`/posts/${id}`).then(res => res.data),
  
  getUserPosts: (userId: string, skip = 0, limit = 20): Promise<Post[]> =>
    api.get(`/posts/user/${userId}?skip=${skip}&limit=${limit}`).then(res => res.data),
};

export const commentsApi = {
  getPostComments: (postId: string): Promise<Comment[]> =>
    api.get(`/comments/post/${postId}`).then(res => res.data),
  
  createComment: (postId: string, data: CommentCreateData): Promise<Comment> =>
    api.post(`/comments/post/${postId}`, data).then(res => res.data),
  
  updateComment: (id: string, data: Partial<CommentCreateData>): Promise<Comment> =>
    api.put(`/comments/${id}`, data).then(res => res.data),
  
  deleteComment: (id: string): Promise<void> =>
    api.delete(`/comments/${id}`).then(res => res.data),
  
  getUserComments: (userId: string, skip = 0, limit = 20): Promise<Comment[]> =>
    api.get(`/comments/user/${userId}?skip=${skip}&limit=${limit}`).then(res => res.data),
};

export const uploadApi = {
  uploadImage: (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(res => res.data);
  },
  
  uploadImages: (files: File[]): Promise<{ urls: string[] }> => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    return api.post('/upload/images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(res => res.data);
  },
};

export const adminApi = {
  getUsers: (skip = 0, limit = 100): Promise<User[]> =>
    api.get(`/admin/users?skip=${skip}&limit=${limit}`).then(res => res.data),
  
  blockUser: (userId: string): Promise<void> =>
    api.put(`/admin/users/${userId}/block`).then(res => res.data),
  
  unblockUser: (userId: string): Promise<void> =>
    api.put(`/admin/users/${userId}/unblock`).then(res => res.data),
  
  getAllPosts: (skip = 0, limit = 50): Promise<Post[]> =>
    api.get(`/admin/posts?skip=${skip}&limit=${limit}`).then(res => res.data),
  
  hidePost: (postId: string): Promise<void> =>
    api.put(`/admin/posts/${postId}/hide`).then(res => res.data),
  
  deletePost: (postId: string): Promise<void> =>
    api.delete(`/admin/posts/${postId}`).then(res => res.data),
  
  getAllComments: (skip = 0, limit = 50): Promise<Comment[]> =>
    api.get(`/admin/comments?skip=${skip}&limit=${limit}`).then(res => res.data),
  
  hideComment: (commentId: string): Promise<void> =>
    api.put(`/admin/comments/${commentId}/hide`).then(res => res.data),
  
  deleteComment: (commentId: string): Promise<void> =>
    api.delete(`/admin/comments/${commentId}`).then(res => res.data),
};

export default api;