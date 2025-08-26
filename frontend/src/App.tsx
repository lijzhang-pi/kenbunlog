import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import PostDetail from './pages/PostDetail';
import CreatePost from './pages/CreatePost';
import EditPost from './pages/EditPost';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import SearchResults from './pages/SearchResults';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* 公共路由 */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Layout包装的路由 */}
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="search" element={<SearchResults />} />
              <Route path="post/:id" element={<PostDetail />} />
              
              {/* 需要登录的路由 */}
              <Route element={<ProtectedRoute />}>
                <Route path="create" element={<CreatePost />} />
                <Route path="edit/:id" element={<EditPost />} />
                <Route path="profile" element={<Profile />} />
              </Route>
              
              {/* 管理员路由 */}
              <Route element={<AdminRoute />}>
                <Route path="admin" element={<AdminDashboard />} />
              </Route>
            </Route>
            
            {/* 重定向 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;