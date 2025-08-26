import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/api';
import { User, Post, Comment } from '../types';
import Loading from '../components/Loading';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'posts' | 'comments'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    
    try {
      switch (activeTab) {
        case 'users':
          const usersData = await adminApi.getUsers();
          setUsers(usersData);
          break;
        case 'posts':
          const postsData = await adminApi.getAllPosts();
          setPosts(postsData);
          break;
        case 'comments':
          const commentsData = await adminApi.getAllComments();
          setComments(commentsData);
          break;
      }
    } catch (err: any) {
      setError(`获取${activeTab === 'users' ? '用户' : activeTab === 'posts' ? '帖子' : '评论'}数据失败`);
    } finally {
      setLoading(false);
    }
  };

  const handleBlockUser = async (userId: string, isBlocked: boolean) => {
    try {
      if (isBlocked) {
        await adminApi.unblockUser(userId);
      } else {
        await adminApi.blockUser(userId);
      }
      loadData(); // 重新加载数据
    } catch (err: any) {
      alert(`${isBlocked ? '解除屏蔽' : '屏蔽'}用户失败: ${err.response?.data?.detail || err.message}`);
    }
  };

  const handleHidePost = async (postId: string) => {
    try {
      await adminApi.hidePost(postId);
      loadData();
    } catch (err: any) {
      alert(`隐藏帖子失败: ${err.response?.data?.detail || err.message}`);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (window.confirm('确定要删除这个帖子吗？')) {
      try {
        await adminApi.deletePost(postId);
        loadData();
      } catch (err: any) {
        alert(`删除帖子失败: ${err.response?.data?.detail || err.message}`);
      }
    }
  };

  const handleHideComment = async (commentId: string) => {
    try {
      await adminApi.hideComment(commentId);
      loadData();
    } catch (err: any) {
      alert(`隐藏评论失败: ${err.response?.data?.detail || err.message}`);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (window.confirm('确定要删除这个评论吗？')) {
      try {
        await adminApi.deleteComment(commentId);
        loadData();
      } catch (err: any) {
        alert(`删除评论失败: ${err.response?.data?.detail || err.message}`);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN');
  };

  const renderUsers = () => (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <ul className="divide-y divide-gray-200">
        {users.map((user) => (
          <li key={user.id}>
            <div className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    @{user.username}
                  </p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    <span className={`px-2 py-1 rounded-full text-xs mr-2 ${
                      user.role === 'admin' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user.role === 'admin' ? '管理员' : '用户'}
                    </span>
                    {user.is_blocked && (
                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs mr-2">
                        已屏蔽
                      </span>
                    )}
                    <span>注册于 {formatDate(user.created_at)}</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  {user.role !== 'admin' && (
                    <button
                      onClick={() => handleBlockUser(user.id, user.is_blocked)}
                      className={`px-3 py-1 text-xs font-medium rounded ${
                        user.is_blocked
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                    >
                      {user.is_blocked ? '解除屏蔽' : '屏蔽'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );

  const renderPosts = () => (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <ul className="divide-y divide-gray-200">
        {posts.map((post) => (
          <li key={post.id}>
            <div className="px-4 py-4 sm:px-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {post.title}
                  </p>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                    {post.content}
                  </p>
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    <span>@{post.author.username}</span>
                    <span className="mx-2">·</span>
                    <span>{formatDate(post.created_at)}</span>
                    {post.is_hidden && (
                      <>
                        <span className="mx-2">·</span>
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                          已隐藏
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2 ml-4">
                  {!post.is_hidden && (
                    <button
                      onClick={() => handleHidePost(post.id)}
                      className="px-3 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 hover:bg-yellow-200 rounded"
                    >
                      隐藏
                    </button>
                  )}
                  <button
                    onClick={() => handleDeletePost(post.id)}
                    className="px-3 py-1 text-xs font-medium bg-red-100 text-red-800 hover:bg-red-200 rounded"
                  >
                    删除
                  </button>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );

  const renderComments = () => (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <ul className="divide-y divide-gray-200">
        {comments.map((comment) => (
          <li key={comment.id}>
            <div className="px-4 py-4 sm:px-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-900">
                    {comment.content}
                  </p>
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    <span>@{comment.author.username}</span>
                    <span className="mx-2">·</span>
                    <span>{formatDate(comment.created_at)}</span>
                    {comment.is_hidden && (
                      <>
                        <span className="mx-2">·</span>
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                          已隐藏
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2 ml-4">
                  {!comment.is_hidden && (
                    <button
                      onClick={() => handleHideComment(comment.id)}
                      className="px-3 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 hover:bg-yellow-200 rounded"
                    >
                      隐藏
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    className="px-3 py-1 text-xs font-medium bg-red-100 text-red-800 hover:bg-red-200 rounded"
                  >
                    删除
                  </button>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">管理员后台</h1>
        <p className="text-gray-600 mt-2">管理用户、帖子和评论</p>
      </div>

      {/* 选项卡 */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'users', name: '用户管理', count: users.length },
            { id: 'posts', name: '帖子管理', count: posts.length },
            { id: 'comments', name: '评论管理', count: comments.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.name}
              {tab.count > 0 && (
                <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2 rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Loading size="lg" />
        </div>
      ) : (
        <div>
          {activeTab === 'users' && renderUsers()}
          {activeTab === 'posts' && renderPosts()}
          {activeTab === 'comments' && renderComments()}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;