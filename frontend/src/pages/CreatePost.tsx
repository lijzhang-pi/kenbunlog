import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { postsApi, uploadApi } from '../services/api';
import { PostCreateData } from '../types';
import Loading from '../components/Loading';
import { useAuth } from '../contexts/AuthContext';

const CreatePost: React.FC = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();

  useEffect(() => {
    console.log('CreatePost组件加载，认证状态:', { isAuthenticated, authLoading });
    if (!authLoading && !isAuthenticated) {
      console.log('用户未认证，重定向到登录页面');
      navigate('/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white">
        <Loading size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      // 限制最多10张图片
      const totalFiles = imageFiles.length + files.length;
      if (totalFiles > 10) {
        setError('最多只能上传10张图片');
        return;
      }
      
      setImageFiles(prev => [...prev, ...files]);
      
      // 创建预览
      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreviews(prev => [...prev, e.target?.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleImageRemove = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleClearAllImages = () => {
    setImageFiles([]);
    setImagePreviews([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('发帖按钮被点击，开始处理表单提交');
    console.log('表单数据:', { title: title.trim(), content: content.trim(), imageFiles });
    
    setLoading(true);
    setError('');

    try {
      let imageUrls: string[] = [];
      
      // 如果有图片，先上传
      if (imageFiles.length > 0) {
        console.log('开始上传图片:', imageFiles.length, '张');
        setUploading(true);
        const uploadResult = await uploadApi.uploadImages(imageFiles);
        imageUrls = uploadResult.urls;
        console.log('图片上传完成，URLs:', imageUrls);
        setUploading(false);
      }

      // 创建帖子
      const postData: PostCreateData = {
        title: title.trim(),
        content: content.trim(),
        image_urls: imageUrls.length > 0 ? imageUrls : undefined,
      };

      console.log('准备创建帖子，数据:', postData);
      const post = await postsApi.createPost(postData);
      console.log('帖子创建成功:', post);
      navigate(`/post/${post.id}`);
    } catch (err: any) {
      console.error('发帖失败:', err);
      console.error('错误详情:', err.response?.data);
      setError(err.response?.data?.detail || '发布帖子失败');
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  console.log('CreatePost render - 渲染CreatePost组件');

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <div style={{ padding: '20px', border: '2px solid red', margin: '20px' }}>
          <h2 style={{ color: 'red' }}>调试信息：CreatePost组件已渲染</h2>
          <p>当前用户认证状态: {isAuthenticated ? '已认证' : '未认证'}</p>
        </div>
        <h1 className="text-4xl font-light text-black mb-12 text-center tracking-tight">
          发布新内容
        </h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-8">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 标题 */}
          <div>
            <label htmlFor="title" className="block text-base font-medium text-black/80 mb-3">
              标题
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black/20 text-lg"
              placeholder="分享你的故事..."
              required
              maxLength={200}
            />
            <div className="mt-2 text-sm text-black/60">
              {title.length}/200
            </div>
          </div>

          {/* 内容 */}
          <div>
            <label htmlFor="content" className="block text-base font-medium text-black/80 mb-3">
              内容
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={10}
              className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black/20 text-base leading-relaxed resize-none"
              placeholder="记录你的见闻与感悟..."
              required
            />
          </div>

          {/* 图片上传 */}
          <div>
            <label className="block text-base font-medium text-black/80 mb-3">
              图片
            </label>
            
            {imagePreviews.length === 0 ? (
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 hover:border-gray-300 transition-colors">
                <div className="text-center">
                  <svg className="mx-auto h-16 w-16 text-black/30" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="mt-6">
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <span className="block text-lg font-medium text-black/90 mb-2">
                        添加图片
                      </span>
                      <span className="block text-sm text-black/60">
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
                <div className="flex justify-between items-center mb-6">
                  <span className="text-sm font-medium text-black/60">{imagePreviews.length}/10 张图片</span>
                  <div className="flex gap-3">
                    <label 
                      htmlFor="image-upload-more" 
                      className="px-4 py-2 bg-black text-white text-sm rounded-full hover:bg-gray-800 cursor-pointer transition-colors"
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
                      className="px-4 py-2 text-black/60 hover:text-black text-sm rounded-full border border-gray-200 hover:border-gray-300 transition-colors"
                    >
                      清空全部
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`预览 ${index + 1}`}
                        className="w-full h-40 object-cover rounded-xl"
                      />
                      <button
                        type="button"
                        onClick={() => handleImageRemove(index)}
                        className="absolute top-3 right-3 bg-black/60 text-white rounded-full p-2 hover:bg-black/80 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 提交按钮 */}
          <div className="flex justify-between items-center pt-8">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-6 py-3 text-black/60 hover:text-black font-medium rounded-full transition-colors"
            >
              取消
            </button>
            
            <button
              type="submit"
              disabled={loading || uploading || !title.trim() || !content.trim()}
              onClick={(e) => {
                console.log('发帖按钮点击事件触发');
                console.log('按钮状态:', {
                  loading,
                  uploading,
                  titleTrimmed: title.trim(),
                  contentTrimmed: content.trim(),
                  isDisabled: loading || uploading || !title.trim() || !content.trim()
                });
              }}
              className="px-8 py-3 bg-black hover:bg-gray-800 text-white font-medium rounded-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
            >
              {loading ? (
                <>
                  <Loading size="sm" className="mr-2" />
                  {uploading ? '上传图片中...' : '发布中...'}
                </>
              ) : (
                '发布'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;