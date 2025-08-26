import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Loading from './Loading';

const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, loading, user } = useAuth();

  console.log('ProtectedRoute - loading:', loading, 'isAuthenticated:', isAuthenticated, 'user:', user);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loading size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('用户未认证，重定向到登录页面');
    return <Navigate to="/login" replace />;
  }

  console.log('用户已认证，渲染受保护的路由');
  return <Outlet />;
};

export default ProtectedRoute;