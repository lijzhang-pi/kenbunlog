import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { postsApi } from '../services/api';
import { Post } from '../types';
import { useAuth } from '../contexts/AuthContext';
import PostCard from '../components/PostCard';
import Loading from '../components/Loading';

const Home: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const fetchedPosts = await postsApi.getPosts();
      setPosts(fetchedPosts);
    } catch (err: any) {
      setError('获取帖子列表失败');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-16 pb-20 text-center">
        <h1 className="text-5xl sm:text-6xl font-light text-black mb-6 tracking-tight">
          见闻录
        </h1>
        <p className="text-xl font-light text-black/70 mb-12 max-w-2xl mx-auto leading-relaxed">
          记录生活点滴，分享独特见解
        </p>
        
        {isAuthenticated && (
          <Link
            to="/create"
            className="bg-black hover:bg-gray-800 text-white px-8 py-3 rounded-full font-medium text-base transition-colors"
          >
            发布帖子
          </Link>
        )}
      </div>

      {error && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 mb-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl">
            {error}
          </div>
        </div>
      )}

      {/* Posts Section */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-20">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loading size="lg" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-black/60 text-xl font-light mb-8">开始记录你的第一个故事</p>
            {isAuthenticated && (
              <Link
                to="/create"
                className="bg-black hover:bg-gray-800 text-white px-8 py-3 rounded-full font-medium transition-colors"
              >
                发布帖子
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;