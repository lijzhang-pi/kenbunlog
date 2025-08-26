import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { postsApi, uploadApi } from '../services/api';
import { Post } from '../types';
import { useAuth } from '../contexts/AuthContext';
import Loading from '../components/Loading';

const EditPost: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [currentImageUrls, setCurrentImageUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();
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
      setTitle(fetchedPost.title);
      setContent(fetchedPost.content);
      
      if (fetchedPost.image_urls && fetchedPost.image_urls.length > 0) {
        setCurrentImageUrls(fetchedPost.image_urls);
      }
      
      // 检查权限
      if (user && user.id !== fetchedPost.author_id) {
        setError('您没有权限编辑此帖子');
      }
    } catch (err: any) {
      setError('获取帖子失败');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const totalFiles = imageFiles.length + currentImageUrls.length + files.length;
      if (totalFiles > 10) {
        setError('最多只能上传10张图片');
        return;
      }
      
      setImageFiles(prev => [...prev, ...files]);
      
      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreviews(prev => [...prev, e.target?.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleCurrentImageRemove = (index: number) => {
    setCurrentImageUrls(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleNewImageRemove = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleClearAllImages = () => {
    setCurrentImageUrls([]);
    setImageFiles([]);
    setImagePreviews([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    
    setSubmitting(true);
    setError('');

    try {
      let finalImageUrls = [...currentImageUrls];
      
      // 如果有新图片，先上传
      if (imageFiles.length > 0) {
        setUploading(true);
        const uploadResult = await uploadApi.uploadImages(imageFiles);
        finalImageUrls = [...finalImageUrls, ...uploadResult.urls];
        setUploading(false);
      }

      // 更新帖子
      const updateData = {
        title: title.trim(),
        content: content.trim(),
        image_urls: finalImageUrls.length > 0 ? finalImageUrls : undefined,
      };

      await postsApi.updatePost(id, updateData);
      navigate(`/post/${id}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || '更新帖子失败');
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
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
          <button
            onClick={() => navigate('/')}
            className="text-blue-600 hover:text-blue-800"
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-sm p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">
          编辑帖子
        </h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 标题 */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              标题 *
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="输入帖子标题..."
              required
              maxLength={200}
            />
            <div className="mt-1 text-sm text-gray-500">
              {title.length}/200
            </div>
          </div>

          {/* 内容 */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              内容 *
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="分享你的想法..."
              required
            />
          </div>

          {/* 图片上传 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              图片 (可选)
            </label>
            
{currentImageUrls.length === 0 && imagePreviews.length === 0 ? (
              <div className="border-2 border-dashed border-gray-300 rounded-md p-6">
                <div className="text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="mt-4">
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <span className="mt-2 block text-sm font-medium text-gray-900">
                        点击上传图片
                      </span>
                      <span className="mt-1 block text-sm text-gray-500">
                        支持 PNG, JPG, GIF 格式，最大 20MB，最多10张图片
                      </span>
                    </label>
                    <input
                      id="image-upload"
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-gray-600">
                    {currentImageUrls.length + imagePreviews.length}/10 张图片
                  </span>
                  <div className="flex gap-2">
                    <label 
                      htmlFor="image-upload-more" 
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 cursor-pointer"
                    >
                      添加更多
                    </label>
                    <input
                      id="image-upload-more"
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                    />
                    <button
                      type="button"
                      onClick={handleClearAllImages}
                      className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                    >
                      清空全部
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {/* 显示现有图片 */}
                  {currentImageUrls.map((url, index) => (
                    <div key={`current-${index}`} className="relative group">
                      <img
                        src={`http://localhost:8000${url}`}
                        alt={`现有图片 ${index + 1}`}
                        className="w-full h-32 object-cover rounded-md shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={() => handleCurrentImageRemove(index)}
                        className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                  {/* 显示新图片预览 */}
                  {imagePreviews.map((preview, index) => (
                    <div key={`new-${index}`} className="relative group">
                      <img
                        src={preview}
                        alt={`新图片预览 ${index + 1}`}
                        className="w-full h-32 object-cover rounded-md shadow-sm border-2 border-blue-300"
                      />
                      <button
                        type="button"
                        onClick={() => handleNewImageRemove(index)}
                        className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      <span className="absolute bottom-1 left-1 bg-blue-600 text-white text-xs px-1 rounded">
                        新
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 提交按钮 */}
          <div className="flex justify-between items-center pt-6">
            <button
              type="button"
              onClick={() => navigate(`/post/${id}`)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              取消
            </button>
            
            <button
              type="submit"
              disabled={submitting || uploading || !title.trim() || !content.trim()}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {submitting ? (
                <>
                  <Loading size="sm" className="mr-2" />
                  {uploading ? '上传图片中...' : '更新中...'}
                </>
              ) : (
                '更新帖子'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPost;