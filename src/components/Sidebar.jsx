import React, { useState, useMemo } from 'react';
import { Calendar, Tag, ChevronDown, ChevronRight, FileText, Lock } from 'lucide-react';
import { formatDate, getStatusInfo } from '../utils/SharedUtils';

const Sidebar = ({ posts = [], onPostSelect, selectedPostId, isOpen, onToggle, selectedTags, onTagFilterChange, onClearFilters }) => {
  // ✅ FIXED: Use selectedTags from props instead of internal state
  // const [selectedTags, setSelectedTags] = useState(new Set()); // Remove this line
  const [expandedYears, setExpandedYears] = useState(new Set());
  const [expandedMonths, setExpandedMonths] = useState(new Set());

  // Organize posts by year and month
  const organizedPosts = useMemo(() => {
    const organized = {};
    
    posts.forEach(post => {
      const date = new Date(post.createdAt);
      const year = date.getFullYear();
      const month = date.toLocaleDateString('en-US', { month: 'long' });
      
      if (!organized[year]) {
        organized[year] = {};
      }
      if (!organized[year][month]) {
        organized[year][month] = [];
      }
      
      organized[year][month].push(post);
    });

    // Sort posts within each month by date (newest first)
    Object.keys(organized).forEach(year => {
      Object.keys(organized[year]).forEach(month => {
        organized[year][month].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      });
    });

    return organized;
  }, [posts]);

  // Get all unique tags
  const allTags = useMemo(() => {
    const tagCounts = {};
    posts.forEach(post => {
      if (post.tags) {
        post.tags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    });
    return Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([tag, count]) => ({ tag, count }));
  }, [posts]);

  // Filter posts by selected tags
  const filteredPosts = useMemo(() => {
    if (selectedTags.size === 0) return posts;
    return posts.filter(post => 
      post.tags && post.tags.some(tag => selectedTags.has(tag))
    );
  }, [posts, selectedTags]);

  const toggleYear = (year) => {
    const newExpanded = new Set(expandedYears);
    if (newExpanded.has(year)) {
      newExpanded.delete(year);
    } else {
      newExpanded.add(year);
    }
    setExpandedYears(newExpanded);
  };

  const toggleMonth = (yearMonth) => {
    const newExpanded = new Set(expandedMonths);
    if (newExpanded.has(yearMonth)) {
      newExpanded.delete(yearMonth);
    } else {
      newExpanded.add(yearMonth);
    }
    setExpandedMonths(newExpanded);
  };

  // ✅ FIXED: Update tag selection and notify parent
  const toggleTag = (tag) => {
    const newSelected = new Set(selectedTags);
    if (newSelected.has(tag)) {
      newSelected.delete(tag);
    } else {
      newSelected.add(tag);
    }
    
    // ✅ FIXED: Notify parent component of tag filter change
    if (onTagFilterChange) {
      onTagFilterChange(Array.from(newSelected));
    }
  };

  // ✅ FIXED: Clear all filters and notify parent
  const clearTagFilter = () => {
    if (onClearFilters) {
      onClearFilters();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        style={{
          position: 'fixed',
          top: '1rem',
          left: '1rem',
          padding: '0.5rem',
          backgroundColor: 'white',
          border: '1px solid #d1d5db',
          borderRadius: '0.375rem',
          cursor: 'pointer',
          zIndex: 10
        }}
      >
        <ChevronRight size={20} />
      </button>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '20rem',
      height: '100vh',
      backgroundColor: 'white',
      borderRight: '1px solid #e5e7eb',
      padding: '1rem',
      overflowY: 'auto',
      zIndex: 20
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827', margin: 0 }}>
          Navigation
        </h2>
        <button
          onClick={onToggle}
          style={{
            padding: '0.25rem',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          <ChevronDown size={20} />
        </button>
      </div>

      {/* Tag Filter Section */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Tag size={16} />
          Filter by Tags
        </h3>
        {selectedTags.size > 0 && (
          <button
            onClick={clearTagFilter}
            style={{
              fontSize: '0.75rem',
              color: '#2563eb',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              marginBottom: '0.5rem'
            }}
          >
            Clear
          </button>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {allTags.map(({ tag, count }) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.5rem',
                backgroundColor: selectedTags.has(tag) ? '#eff6ff' : 'transparent',
                color: selectedTags.has(tag) ? '#2563eb' : '#6b7280',
                border: 'none',
                borderRadius: '0.25rem',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <span style={{ fontSize: '0.875rem' }}>{tag}</span>
              <span style={{ fontSize: '0.75rem' }}>({count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Posts by Date */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Calendar size={16} />
          Posts by Date
        </h3>
        {Object.keys(organizedPosts)
          .sort((a, b) => parseInt(b) - parseInt(a))
          .map(year => (
            <div key={year}>
              <button
                onClick={() => toggleYear(year)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  width: '100%',
                  textAlign: 'left'
                }}
              >
                {expandedYears.has(year) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                  {year} ({Object.values(organizedPosts[year]).flat().length})
                </span>
              </button>
              
              {expandedYears.has(year) && (
                <div style={{ marginLeft: '1rem' }}>
                  {Object.keys(organizedPosts[year])
                    .sort((a, b) => new Date(`${b} 1, ${year}`) - new Date(`${a} 1, ${year}`))
                    .map(month => {
                      const yearMonth = `${year}-${month}`;
                      const monthPosts = organizedPosts[year][month];
                      
                      return (
                        <div key={month}>
                          <button
                            onClick={() => toggleMonth(yearMonth)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              padding: '0.25rem 0.5rem',
                              backgroundColor: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              width: '100%',
                              textAlign: 'left'
                            }}
                          >
                            {expandedMonths.has(yearMonth) ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            <span style={{ fontSize: '0.8125rem', color: '#6b7280' }}>
                              {month} ({monthPosts.length})
                            </span>
                          </button>
                          
                          {expandedMonths.has(yearMonth) && (
                            <div style={{ marginLeft: '1rem' }}>
                              {monthPosts.map(post => (
                                <button
                                  key={post.id}
                                  onClick={() => onPostSelect(post)}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.25rem 0.5rem',
                                    backgroundColor: selectedPostId === post.id ? '#f3f4f6' : 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    width: '100%',
                                    textAlign: 'left'
                                  }}
                                >
                                  {post.status === 'published' ? <FileText size={12} /> : <Lock size={12} />}
                                  <span style={{ 
                                    fontSize: '0.75rem', 
                                    color: selectedPostId === post.id ? '#111827' : '#6b7280',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                  }}>
                                    {post.title || 'Untitled'}
                                  </span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
};

export default Sidebar;

