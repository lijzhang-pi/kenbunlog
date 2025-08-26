import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { postsApi } from '../services/api';
import { Post } from '../types';
import PostCard from '../components/PostCard';
import Loading from '../components/Loading';

const SearchResults: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const query = searchParams.get('q') || '';

  useEffect(() => {
    if (query.trim()) {
      fetchSearchResults();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const fetchSearchResults = async () => {
    try {
      setLoading(true);
      setError('');
      const results = await postsApi.getPosts(0, 50, query.trim());
      setPosts(results);
    } catch (err: any) {
      setError('搜索失败，请稍后重试');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loading size="lg" />
      </div>
    );
  }

  if (!query.trim()) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-light text-gray-600 mb-4">请输入搜索关键词</h1>
          <Link 
            to="/" 
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="text-red-600 mb-4">{error}</div>
          <button
            onClick={fetchSearchResults}
            className="text-blue-600 hover:text-blue-800 font-medium mr-4"
          >
            重试
          </button>
          <Link 
            to="/" 
            className="text-gray-600 hover:text-gray-800 font-medium"
          >
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 搜索结果标题 */}
      <div className="mb-8">
        <h1 className="text-2xl font-light text-gray-900 mb-2">
          搜索结果
        </h1>
        <p className="text-gray-600">
          关键词 "<span className="font-medium text-gray-900">{query}</span>" 
          找到 {posts.length} 个结果
        </p>
      </div>

      {/* 搜索结果列表 */}
      {posts.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">
            没有找到包含 "<span className="font-medium">{query}</span>" 的帖子
          </div>
          <div className="text-sm text-gray-400 mb-6">
            尝试使用其他关键词或浏览最新帖子
          </div>
          <Link 
            to="/" 
            className="bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-full font-medium transition-colors"
          >
            浏览最新帖子
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchResults;