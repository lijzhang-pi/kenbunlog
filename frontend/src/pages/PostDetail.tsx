import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { postsApi, commentsApi } from '../services/api';
import { PostWithComments, CommentCreateData } from '../types';
import { useAuth } from '../contexts/AuthContext';
import Loading from '../components/Loading';

const PostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<PostWithComments | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      fetchPost();
    }
  }, [id]);

  const fetchPost = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const fetchedPost = await postsApi.getPost(id);
      setPost(fetchedPost);
    } catch (err: any) {
      setError('获取帖子详情失败');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !id) return;

    try {
      setSubmittingComment(true);
      const commentData: CommentCreateData = {
        content: commentText.trim()
      };
      
      await commentsApi.createComment(id, commentData);
      setCommentText('');
      fetchPost(); // 重新获取帖子数据以更新评论列表
    } catch (err: any) {
      alert('发表评论失败: ' + (err.response?.data?.detail || err.message));
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeletePost = async () => {
    if (!post || !id) return;
    
    if (window.confirm('确定要删除这个帖子吗？')) {
      try {
        await postsApi.deletePost(id);
        navigate('/');
      } catch (err: any) {
        alert('删除帖子失败: ' + (err.response?.data?.detail || err.message));
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center items-center h-64">
          <Loading size="lg" />
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="text-red-600 mb-4">{error || '帖子未找到'}</div>
          <Link to="/" className="text-blue-600 hover:text-blue-800">
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  const canEditPost = user && user.id === post.author_id;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 帖子内容 */}
      <article className="bg-white rounded-lg shadow-sm p-8 mb-8">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center">
            <span className="text-sm text-gray-600">@{post.author.username}</span>
            <span className="mx-2 text-gray-400">·</span>
            <span className="text-sm text-gray-500">{formatDate(post.created_at)}</span>
            {post.updated_at && (
              <>
                <span className="mx-2 text-gray-400">·</span>
                <span className="text-xs text-gray-400">已编辑</span>
              </>
            )}
          </div>
          
          {canEditPost && (
            <div className="flex space-x-2">
              <Link
                to={`/edit/${post.id}`}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                编辑
              </Link>
              <button
                onClick={handleDeletePost}
                className="text-red-600 hover:text-red-800 text-sm font-medium"
              >
                删除
              </button>
            </div>
          )}
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          {post.title}
        </h1>

        {post.image_urls && post.image_urls.length > 0 && (
          <div className="mb-6">
            {post.image_urls.length === 1 ? (
              <img
                src={`http://localhost:8000${post.image_urls[0]}`}
                alt={post.title}
                className="w-full max-w-2xl mx-auto rounded-lg shadow-sm"
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {post.image_urls.map((url, index) => (
                  <img
                    key={index}
                    src={`http://localhost:8000${url}`}
                    alt={`${post.title} - ${index + 1}`}
                    className="w-full h-64 object-cover rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => {
                      // 可以添加图片预览功能
                      window.open(`http://localhost:8000${url}`, '_blank');
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        <div className="prose prose-lg max-w-none">
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {post.content}
          </p>
        </div>
      </article>

      {/* 评论区 */}
      <div className="bg-white rounded-lg shadow-sm p-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          评论 ({post.comments.length})
        </h2>

        {/* 发表评论表单 */}
        {isAuthenticated && (
          <form onSubmit={handleCommentSubmit} className="mb-8">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="写下你的评论..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              required
            />
            <div className="mt-2 flex justify-end">
              <button
                type="submit"
                disabled={submittingComment || !commentText.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submittingComment ? <Loading size="sm" /> : '发表评论'}
              </button>
            </div>
          </form>
        )}

        {/* 评论列表 */}
        <div className="space-y-6">
          {post.comments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              还没有评论，来发表第一个吧！
            </div>
          ) : (
            post.comments.map((comment) => (
              <div key={comment.id} className="border-b border-gray-100 pb-4 last:border-b-0">
                <div className="flex items-center mb-2">
                  <span className="text-sm font-medium text-gray-900">
                    @{comment.author.username}
                  </span>
                  <span className="mx-2 text-gray-400">·</span>
                  <span className="text-sm text-gray-500">
                    {formatDate(comment.created_at)}
                  </span>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {comment.content}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PostDetail;