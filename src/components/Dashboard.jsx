import React, { useState, useMemo } from 'react';
import { Search, Plus, Edit3, Eye, Tag, FileText, Globe, Lock } from 'lucide-react';
import { 
  stripHtmlTags, 
  formatDate, 
  getStatusInfo, 
  searchPosts, 
  filterPostsByStatus 
} from '../utils/SharedUtils';

const Dashboard = ({ posts = [], onEditPost, onNewPost }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const filteredPosts = useMemo(() => {
    let result = posts;
    result = filterPostsByStatus(result, activeFilter);
    result = searchPosts(result, searchQuery);
    result.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    return result;
  }, [posts, searchQuery, activeFilter]);

  const getFilterCounts = () => ({
    all: posts.length,
    published: posts.filter(p => p.status === 'published').length,
    draft: posts.filter(p => p.status === 'draft').length
  });

  const counts = getFilterCounts();

  // ADDED: Simple function to navigate to blog view
  const handleViewBlog = () => {
    window.open('/', '_blank');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <header style={{ 
        backgroundColor: 'white', 
        borderBottom: '1px solid #e5e7eb', 
        padding: '1rem 1.5rem' 
      }}>
        <div style={{ 
          maxWidth: '72rem', 
          margin: '0 auto', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>
              Journal Dashboard
            </h1>
            <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              {posts.length} entries
            </span>
          </div>
          
          {/* ADDED: Button container with both View Blog and New Post buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={handleViewBlog}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                backgroundColor: '#f3f4f6',
                color: '#374151',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}
              title="View your published blog"
            >
              <Eye size={18} />
              <span>View Blog</span>
            </button>
            
            <button
              onClick={onNewPost}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                backgroundColor: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer'
              }}
            >
              <Plus size={20} />
              <span>New Post</span>
            </button>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: '72rem', margin: '0 auto', padding: '1.5rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ position: 'relative', marginBottom: '1rem' }}>
            <Search 
              style={{ 
                position: 'absolute', 
                left: '0.75rem', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                color: '#9ca3af' 
              }} 
              size={20} 
            />
            <input
              type="text"
              placeholder="Search posts by title, content, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                paddingLeft: '2.5rem',
                paddingRight: '1rem',
                paddingTop: '0.75rem',
                paddingBottom: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                fontSize: '1rem'
              }}
            />
          </div>

          <div style={{ 
            display: 'flex', 
            gap: '0.25rem', 
            backgroundColor: '#f3f4f6', 
            padding: '0.25rem', 
            borderRadius: '0.5rem' 
          }}>
            {[
              { key: 'all', label: `All Posts (${counts.all})` },
              { key: 'published', label: `Published (${counts.published})` },
              { key: 'draft', label: `Drafts (${counts.draft})` }
            ].map(filter => (
              <button
                key={filter.key}
                onClick={() => setActiveFilter(filter.key)}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: activeFilter === filter.key ? 'white' : 'transparent',
                  color: activeFilter === filter.key ? '#2563eb' : '#6b7280',
                  border: 'none',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  boxShadow: activeFilter === filter.key ? '0 1px 2px 0 rgba(0, 0, 0, 0.05)' : 'none'
                }}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredPosts.map((post) => {
            const statusInfo = getStatusInfo(post.status, post.isPublic);
            const StatusIcon = post.status === 'published' 
              ? (post.isPublic ? Globe : Lock) 
              : FileText;

            return (
              <div 
                key={post.id} 
                style={{ 
                  backgroundColor: 'white', 
                  borderRadius: '0.5rem', 
                  border: '1px solid #e5e7eb', 
                  padding: '1.5rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                      <StatusIcon size={18} />
                      <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', margin: 0 }}>
                        {post.title}
                      </h2>
                      <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                        {formatDate(post.createdAt)}
                      </span>
                    </div>

                    <p style={{ color: '#6b7280', marginBottom: '0.75rem', marginRight: '1rem', textAlign: 'left'}}>
                      {stripHtmlTags(post.content).substring(0, 150)}...
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      {post.tags.length > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Tag size={14} style={{ color: '#9ca3af' }} />
                          <div style={{ display: 'flex', gap: '0.25rem' }}>
                            {post.tags.map(tag => (
                              <span 
                                key={tag} 
                                style={{ 
                                  padding: '0.25rem 0.5rem', 
                                  backgroundColor: '#f3f4f6', 
                                  color: '#6b7280', 
                                  fontSize: '0.75rem', 
                                  borderRadius: '0.25rem' 
                                }}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                        {post.wordCount} words
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: '1rem' }}>
                    <button
                      onClick={() => onEditPost(post)}
                      style={{
                        padding: '0.5rem',
                        color: '#6b7280',
                        backgroundColor: 'transparent',
                        border: 'none',
                        borderRadius: '0.25rem',
                        cursor: 'pointer'
                      }}
                      title="Edit"
                    >
                      <Edit3 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

