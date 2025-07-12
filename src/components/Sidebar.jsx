import React, { useState, useMemo } from 'react';
import { Calendar, Tag, ChevronDown, ChevronRight, FileText, Globe, Lock } from 'lucide-react';
import { formatDate, getStatusInfo } from '../utils/SharedUtils';

const Sidebar = ({ posts = [], onPostSelect, selectedPostId, isOpen, onToggle }) => {
  const [expandedYears, setExpandedYears] = useState(new Set());
  const [expandedMonths, setExpandedMonths] = useState(new Set());
  const [selectedTags, setSelectedTags] = useState(new Set());

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
      post.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
    return Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([tag, count]) => ({ tag, count }));
  }, [posts]);

  // Filter posts by selected tags
  const filteredPosts = useMemo(() => {
    if (selectedTags.size === 0) return posts;
    return posts.filter(post => 
      post.tags.some(tag => selectedTags.has(tag))
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

  const toggleTag = (tag) => {
    const newSelected = new Set(selectedTags);
    if (newSelected.has(tag)) {
      newSelected.delete(tag);
    } else {
      newSelected.add(tag);
    }
    setSelectedTags(newSelected);
  };

  const clearTagFilter = () => {
    setSelectedTags(new Set());
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <Tag size={16} style={{ color: '#6b7280' }} />
          <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151', margin: 0 }}>
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
                cursor: 'pointer'
              }}
            >
              Clear
            </button>
          )}
        </div>

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
              <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>({count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chronological Navigation */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <Calendar size={16} style={{ color: '#6b7280' }} />
          <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151', margin: 0 }}>
            Posts by Date
          </h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {Object.keys(organizedPosts)
            .sort((a, b) => parseInt(b) - parseInt(a))
            .map(year => {
              const yearPosts = Object.values(organizedPosts[year]).flat();
              const filteredYearPosts = yearPosts.filter(post => 
                selectedTags.size === 0 || post.tags.some(tag => selectedTags.has(tag))
              );
              
              if (filteredYearPosts.length === 0) return null;

              return (
                <div key={year}>
                  <button
                    onClick={() => toggleYear(year)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      width: '100%',
                      padding: '0.5rem',
                      backgroundColor: 'transparent',
                      border: 'none',
                      borderRadius: '0.25rem',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    {expandedYears.has(year) ? (
                      <ChevronDown size={14} />
                    ) : (
                      <ChevronRight size={14} />
                    )}
                    <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                      {year}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                      ({filteredYearPosts.length})
                    </span>
                  </button>

                  {expandedYears.has(year) && (
                    <div style={{ marginLeft: '1rem', marginTop: '0.25rem' }}>
                      {Object.keys(organizedPosts[year])
                        .sort((a, b) => {
                          const monthOrder = ['January', 'February', 'March', 'April', 'May', 'June',
                                            'July', 'August', 'September', 'October', 'November', 'December'];
                          return monthOrder.indexOf(b) - monthOrder.indexOf(a);
                        })
                        .map(month => {
                          const monthPosts = organizedPosts[year][month];
                          const filteredMonthPosts = monthPosts.filter(post => 
                            selectedTags.size === 0 || post.tags.some(tag => selectedTags.has(tag))
                          );
                          
                          if (filteredMonthPosts.length === 0) return null;

                          const yearMonth = `${year}-${month}`;

                          return (
                            <div key={month} style={{ marginBottom: '0.25rem' }}>
                              <button
                                onClick={() => toggleMonth(yearMonth)}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.5rem',
                                  width: '100%',
                                  padding: '0.375rem',
                                  backgroundColor: 'transparent',
                                  border: 'none',
                                  borderRadius: '0.25rem',
                                  cursor: 'pointer',
                                  textAlign: 'left'
                                }}
                              >
                                {expandedMonths.has(yearMonth) ? (
                                  <ChevronDown size={12} />
                                ) : (
                                  <ChevronRight size={12} />
                                )}
                                <span style={{ fontSize: '0.8125rem', color: '#6b7280' }}>
                                  {month}
                                </span>
                                <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                                  ({filteredMonthPosts.length})
                                </span>
                              </button>

                              {expandedMonths.has(yearMonth) && (
                                <div style={{ marginLeft: '1rem', marginTop: '0.25rem' }}>
                                  {filteredMonthPosts.map(post => {
                                    const statusInfo = getStatusInfo(post.status, post.isPublic);
                                    const StatusIcon = post.status === 'published' 
                                      ? (post.isPublic ? Globe : Lock) 
                                      : FileText;

                                    return (
                                      <button
                                        key={post.id}
                                        onClick={() => onPostSelect(post)}
                                        style={{
                                          display: 'flex',
                                          alignItems: 'flex-start',
                                          gap: '0.5rem',
                                          width: '100%',
                                          padding: '0.5rem',
                                          backgroundColor: selectedPostId === post.id ? '#eff6ff' : 'transparent',
                                          border: 'none',
                                          borderRadius: '0.25rem',
                                          cursor: 'pointer',
                                          textAlign: 'left'
                                        }}
                                      >
                                        <StatusIcon size={12} style={{ marginTop: '0.125rem', flexShrink: 0 }} />
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                          <div style={{ 
                                            fontSize: '0.75rem', 
                                            color: '#374151', 
                                            fontWeight: selectedPostId === post.id ? '500' : '400',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                          }}>
                                            {post.title}
                                          </div>
                                          <div style={{ fontSize: '0.6875rem', color: '#9ca3af' }}>
                                            {formatDate(post.createdAt)}
                                          </div>
                                        </div>
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
