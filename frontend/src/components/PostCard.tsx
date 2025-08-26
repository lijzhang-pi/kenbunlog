import React from 'react';
import { Link } from 'react-router-dom';
import { Post } from '../types';

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN', {
      year: 'numeric',
      month: 'numeric', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <article className="bg-white border border-gray-100 rounded-2xl hover:border-gray-200 transition-all duration-300 overflow-hidden">
      {post.image_urls && post.image_urls.length > 0 && (
        <div className="aspect-video bg-gray-50">
          {post.image_urls.length === 1 ? (
            <img
              src={`http://localhost:8000${post.image_urls[0]}`}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="p-4">
              <div className="grid grid-cols-2 gap-2">
                {post.image_urls.slice(0, 4).map((url, index) => (
                  <div key={index} className="relative aspect-square">
                    <img
                      src={`http://localhost:8000${url}`}
                      alt={`${post.title} - ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    {index === 3 && post.image_urls!.length > 4 && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-lg">
                        <span className="text-white font-medium">
                          +{post.image_urls!.length - 4}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      <div className="p-8">
        <div className="flex items-center mb-4">
          <span className="text-sm font-medium text-black/60">@{post.author.username}</span>
          <span className="mx-2 text-black/30">·</span>
          <span className="text-sm text-black/50">{formatDate(post.created_at)}</span>
          {post.updated_at && (
            <>
              <span className="mx-2 text-black/30">·</span>
              <span className="text-xs text-black/40">已编辑</span>
            </>
          )}
        </div>
        
        <h2 className="text-2xl font-medium text-black mb-4 leading-tight">
          <Link to={`/post/${post.id}`} className="hover:text-black/80 transition-colors">
            {post.title}
          </Link>
        </h2>
        
        <p className="text-black/70 mb-6 line-clamp-3 leading-relaxed">
          {post.content}
        </p>
        
        <Link 
          to={`/post/${post.id}`}
          className="inline-flex items-center text-black/60 hover:text-black font-medium transition-colors"
        >
          阅读全文
          <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </article>
  );
};

export default PostCard;