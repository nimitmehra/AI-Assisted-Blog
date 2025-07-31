import React, { useState, useMemo } from 'react';
import { Search, Plus, Eye, X } from 'lucide-react';
import { stripHtmlTags } from '../utils/SharedUtils'; // ✅ ADD THIS IMPORT

const Dashboard = ({ 
  posts, 
  onEditPost, 
  onNewPost, 
  activeFilters = { tags: [], hasFilters: false },
  onClearFilters 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  // Filter posts based on status and search
  const filteredPosts = useMemo(() => {
    let filtered = posts;

    // Filter by status tab
    if (activeTab === 'published') {
      filtered = filtered.filter(post => post.status === 'published');
    } else if (activeTab === 'drafts') {
      filtered = filtered.filter(post => post.status === 'draft');
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(post => 
        post.title.toLowerCase().includes(term) ||
        stripHtmlTags(post.content).toLowerCase().includes(term) || // ✅ STRIP HTML FOR SEARCH
        (post.tags && post.tags.some(tag => tag.toLowerCase().includes(term)))
      );
    }

    // Sort by updatedAt (newest first)
    return filtered.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }, [posts, activeTab, searchTerm]);

  const handleViewBlog = () => {
    window.open('/blog', '_blank');
  };

  const getStatusCounts = () => {
    const published = posts.filter(post => post.status === 'published').length;
    const drafts = posts.filter(post => post.status === 'draft').length;
    return { all: posts.length, published, drafts };
  };

  const counts = getStatusCounts();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getWordCount = (content) => {
    // ✅ STRIP HTML BEFORE COUNTING WORDS
    const cleanContent = stripHtmlTags(content);
    return cleanContent.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const truncateContent = (content, maxLength = 200) => {
    // ✅ STRIP HTML BEFORE TRUNCATING
    const cleanContent = stripHtmlTags(content);
    if (cleanContent.length <= maxLength) return cleanContent;
    return cleanContent.substring(0, maxLength) + '...';
  };

  return (
    <div style={{ 
      padding: '2rem',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <div>
          <h1 style={{ 
            fontSize: '2rem', 
            fontWeight: 'bold', 
            margin: '0',
            color: '#1f2937'
          }}>
            Journal Dashboard
          </h1>
          <p style={{ 
            color: '#6b7280', 
            margin: '0.5rem 0 0 0' 
          }}>
            {counts.all} entries
          </p>
        </div>
        
        <div style={{ 
          display: 'flex', 
          gap: '0.75rem' 
        }}>
          <button
            onClick={handleViewBlog}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              backgroundColor: 'transparent',
              color: '#374151',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#f9fafb';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = 'transparent';
            }}
          >
            <Eye size={18} />
            View Blog
          </button>
          
          <button
            onClick={onNewPost}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#2563eb';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = '#3b82f6';
            }}
          >
            <Plus size={20} />
            New Post
          </button>
        </div>
      </div>

      {/* Active Filters Display */}
      {activeFilters.hasFilters && (
        <div style={{
          backgroundColor: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: '0.5rem',
          padding: '1rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: '#1e40af', fontWeight: '500' }}>
              Active filters:
            </span>
            {activeFilters.tags.map(tag => (
              <span
                key={tag}
                style={{
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '0.25rem',
                  fontSize: '0.75rem',
                  fontWeight: '500'
                }}
              >
                {tag}
              </span>
            ))}
          </div>
          <button
            onClick={onClearFilters}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              padding: '0.25rem 0.5rem',
              backgroundColor: 'transparent',
              color: '#dc2626',
              border: '1px solid #dc2626',
              borderRadius: '0.25rem',
              cursor: 'pointer',
              fontSize: '0.75rem'
            }}
          >
            <X size={12} />
            Clear
          </button>
        </div>
      )}

      {/* Search */}
      <div style={{ 
        position: 'relative', 
        marginBottom: '1.5rem' 
      }}>
        <Search 
          size={20} 
          style={{ 
            position: 'absolute', 
            left: '1rem', 
            top: '50%', 
            transform: 'translateY(-50%)', 
            color: '#9ca3af' 
          }} 
        />
        <input
          type="text"
          placeholder="Search posts by title, content, or tags..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '0.75rem 1rem 0.75rem 3rem',
            border: '1px solid #d1d5db',
            borderRadius: '0.5rem',
            fontSize: '1rem',
            outline: 'none',
            transition: 'border-color 0.2s'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#3b82f6';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#d1d5db';
          }}
        />
      </div>

      {/* Tabs */}
      <div style={{ 
        display: 'flex', 
        borderBottom: '1px solid #e5e7eb',
        marginBottom: '1.5rem'
      }}>
        {[
          { key: 'all', label: `All Posts (${counts.all})` },
          { key: 'published', label: `Published (${counts.published})` },
          { key: 'drafts', label: `Drafts (${counts.drafts})` }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'transparent',
              color: activeTab === tab.key ? '#3b82f6' : '#6b7280',
              border: 'none',
              borderBottom: activeTab === tab.key ? '2px solid #3b82f6' : '2px solid transparent',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Posts List */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '1rem' 
      }}>
        {filteredPosts.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '3rem',
            color: '#6b7280'
          }}>
            {activeFilters.hasFilters ? (
              <>
                <p>No posts found matching the current filters.</p>
                <button
                  onClick={onClearFilters}
                  style={{
                    marginTop: '1rem',
                    padding: '0.5rem 1rem',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.25rem',
                    cursor: 'pointer'
                  }}
                >
                  Clear Filters
                </button>
              </>
            ) : searchTerm ? (
              <p>No posts found matching "{searchTerm}"</p>
            ) : (
              <p>No posts yet. Create your first post!</p>
            )}
          </div>
        ) : (
          filteredPosts.map(post => (
            <div
              key={post.id}
              style={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                padding: '1.5rem',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onClick={() => onEditPost(post)}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = '#d1d5db';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = '#e5e7eb';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start',
                marginBottom: '0.75rem'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem',
                    marginBottom: '0.5rem'
                  }}>
                    <span style={{
                      width: '0.5rem',
                      height: '0.5rem',
                      borderRadius: '50%',
                      backgroundColor: post.status === 'published' ? '#10b981' : '#f59e0b'
                    }}></span>
                    <h3 style={{ 
                      fontSize: '1.25rem', 
                      fontWeight: '600', 
                      margin: '0',
                      color: '#1f2937'
                    }}>
                      {post.title || 'Untitled'}
                    </h3>
                    <span style={{ 
                      color: '#6b7280', 
                      fontSize: '0.875rem' 
                    }}>
                      {formatDate(post.updatedAt)}
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditPost(post);
                  }}
                  style={{
                    padding: '0.25rem',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#6b7280'
                  }}
                >
                  ✏️
                </button>
              </div>

              <p style={{ 
                color: '#6b7280', 
                marginBottom: '0.75rem',
                marginRight: '1rem',
                textAlign: 'left',
                lineHeight: '1.5'
              }}>
                {/* ✅ FIXED: Strip HTML tags before truncating */}
                {truncateContent(post.content)}
              </p>

              {post.tags && post.tags.length > 0 && (
                <div style={{ 
                  display: 'flex', 
                  gap: '0.5rem',
                  marginBottom: '0.5rem',
                  flexWrap: 'wrap'
                }}>
                  {post.tags.map(tag => (
                    <span
                      key={tag}
                      style={{
                        backgroundColor: '#f3f4f6',
                        color: '#374151',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '0.25rem',
                        fontSize: '0.75rem',
                        fontWeight: '500'
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div style={{ 
                color: '#9ca3af', 
                fontSize: '0.875rem',
                textAlign: 'left'
              }}>
                {/* ✅ FIXED: Strip HTML tags before counting words */}
                {getWordCount(post.content)} words
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard;

