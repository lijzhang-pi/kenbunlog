import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Layout: React.FC = () => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  React.useEffect(() => {
    console.log('Layout - 用户状态:', { isAuthenticated, user, isAdmin });
    console.log('Layout - 当前路径:', window.location.pathname);
  }, [isAuthenticated, user, isAdmin]);

  React.useEffect(() => {
    console.log('Layout组件渲染，准备渲染Outlet');
  });

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
            
            <div className="flex items-center space-x-1">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/create"
                    className="bg-black hover:bg-gray-800 text-white px-5 py-2 rounded-full text-sm font-medium transition-colors"
                    onClick={(e) => {
                      console.log('发帖按钮被点击，用户状态:', { isAuthenticated, user, isAdmin });
                      console.log('导航到:', '/create');
                      console.log('Link事件:', e);
                    }}
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