export interface User {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  is_blocked: boolean;
  created_at: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  image_urls?: string[];
  author_id: string;
  is_hidden: boolean;
  created_at: string;
  updated_at?: string;
  author: User;
}

export interface PostWithComments extends Post {
  comments: Comment[];
}

export interface Comment {
  id: string;
  content: string;
  post_id: string;
  author_id: string;
  is_hidden: boolean;
  created_at: string;
  updated_at?: string;
  author: User;
}

export interface AuthToken {
  access_token: string;
  token_type: string;
  user: User;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface PostCreateData {
  title: string;
  content: string;
  image_urls?: string[];
}

export interface CommentCreateData {
  content: string;
}