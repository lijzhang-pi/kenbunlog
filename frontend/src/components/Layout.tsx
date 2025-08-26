import React, { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Layout: React.FC = () => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };


  return (
    <div className="min-h-screen bg-white">
      <nav className="bg-white/95 backdrop-blur-lg border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-14">
            <div className="flex items-center">
              <Link to="/" className="text-2xl font-light text-black tracking-tight">
                见闻录
              </Link>
            </div>
            
            {/* 搜索框 */}
            <div className="flex-1 max-w-md mx-8 hidden md:block">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-full bg-gray-50 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black/20 focus:bg-white transition-colors"
                    placeholder="搜索帖子..."
                  />
                </div>
              </form>
            </div>
            
            <div className="flex items-center space-x-1">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/create"
                    className="bg-black hover:bg-gray-800 text-white px-5 py-2 rounded-full text-sm font-medium transition-colors"
                  >
                    发布
                  </Link>
                  
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="text-black/70 hover:text-black px-4 py-2 rounded-full text-sm font-medium transition-colors"
                    >
                      管理
                    </Link>
                  )}
                  
                  <Link
                    to="/profile"
                    className="text-black/70 hover:text-black px-4 py-2 rounded-full text-sm font-medium transition-colors"
                  >
                    {user?.username}
                  </Link>
                  
                  <button
                    onClick={handleLogout}
                    className="text-black/70 hover:text-black px-4 py-2 rounded-full text-sm font-medium transition-colors"
                  >
                    退出
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-black/70 hover:text-black px-4 py-2 rounded-full text-sm font-medium transition-colors"
                  >
                    登录
                  </Link>
                  <Link
                    to="/register"
                    className="bg-black hover:bg-gray-800 text-white px-5 py-2 rounded-full text-sm font-medium transition-colors"
                  >
                    注册
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
      
      <main className="min-h-screen bg-white">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;