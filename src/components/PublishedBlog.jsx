import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import BlogSidebar from './BlogSidebar';
import { stripHtmlTags } from '../utils/SharedUtils';
import '../styles/blog.css';

const PublishedBlog = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { id, year, month, tagname } = useParams();

  // Load published posts from localStorage
  useEffect(() => {
    const loadPosts = () => {
      try {
        const savedPosts = localStorage.getItem('blog-posts');
        if (savedPosts) {
          const allPosts = JSON.parse(savedPosts);
          // Only show published posts, sorted newest first
          const publishedPosts = allPosts
            .filter(post => post.status === 'published')
            .sort((a, b) => new Date(b.publishedDate || b.updatedAt) - new Date(a.publishedDate || a.updatedAt));
          setPosts(publishedPosts);
        }
      } catch (error) {
        console.error('Error loading posts:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, []);

  // Filter posts based on URL parameters
  const getFilteredPosts = () => {
    let filtered = posts;

    if (id) {
      // Single post view
      filtered = posts.filter(post => post.id === id);
    } else if (year) {
      // Archive view
      filtered = posts.filter(post => {
        const postDate = new Date(post.publishedDate || post.updatedAt);
        const postYear = postDate.getFullYear();
        
        if (month) {
          const postMonth = postDate.toLocaleString('default', { month: 'long' }).toLowerCase();
          return postYear === parseInt(year) && postMonth === month.toLowerCase();
        }
        
        return postYear === parseInt(year);
      });
    } else if (tagname) {
      // Tag view
      const decodedTag = decodeURIComponent(tagname);
      filtered = posts.filter(post => 
        post.tags && post.tags.some(tag => 
          tag.toLowerCase() === decodedTag.toLowerCase()
        )
      );
    }

    return filtered;
  };

  // Generate archive data for sidebar
  const getArchiveData = () => {
    const archives = {};
    posts.forEach(post => {
      const date = new Date(post.publishedDate || post.updatedAt);
      const year = date.getFullYear();
      const month = date.toLocaleString('default', { month: 'long' });
      
      if (!archives[year]) archives[year] = {};
      if (!archives[year][month]) archives[year][month] = 0;
      archives[year][month]++;
    });
    return archives;
  };

  // Generate tag data for sidebar
  const getTagData = () => {
    const tags = {};
    posts.forEach(post => {
      if (post.tags) {
        post.tags.forEach(tag => {
          tags[tag] = (tags[tag] || 0) + 1;
        });
      }
    });
    return tags;
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get page title based on current view
  const getPageTitle = () => {
    if (id) return 'Blog Post';
    if (year && month) return `Archive: ${month} ${year}`;
    if (year) return `Archive: ${year}`;
    if (tagname) return `Tag: ${decodeURIComponent(tagname)}`;
    return 'Blog';
  };

  if (loading) {
    return (
      <div className="blog-container">
        <div className="blog-loading">Loading...</div>
      </div>
    );
  }

  const filteredPosts = getFilteredPosts();

  return (
    <div className="blog-container">
      {/* Header */}
      <header className="blog-header">
        <div className="blog-header-content">
          <h1 className="blog-title">
            {/* UPDATED: Blog home link now points to /blog */}
            <Link to="/blog">Blog</Link>
          </h1>
          <nav className="blog-nav">
            {/* UPDATED: Admin link now points to / (root) */}
            <Link to="/" className="admin-link">Admin</Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="blog-main">
        <div className="blog-content">
          {/* Page Title */}
          {(year || month || tagname) && (
            <div className="blog-page-title">
              <h2>{getPageTitle()}</h2>
              <div className="blog-breadcrumb">
                {/* UPDATED: Home link now points to /blog */}
                <Link to="/blog">Home</Link>
                {year && (
                  <>
                    <span> / </span>
                    {/* UPDATED: Archive year link includes /blog prefix */}
                    <Link to={`/blog/archive/${year}`}>{year}</Link>
                  </>
                )}
                {month && (
                  <>
                    <span> / </span>
                    <span>{month}</span>
                  </>
                )}
                {tagname && (
                  <>
                    <span> / </span>
                    <span>{decodeURIComponent(tagname)}</span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Posts */}
          {filteredPosts.length === 0 ? (
            <div className="blog-no-posts">
              <h2>No posts found</h2>
              <p>There are no published posts to display.</p>
              {/* UPDATED: Back to Home link now points to /blog */}
              <Link to="/blog" className="blog-home-link">← Back to Home</Link>
            </div>
          ) : (
            <div className="blog-posts">
              {filteredPosts.map((post, index) => (
                <article key={post.id} className="blog-post">
                  <header className="blog-post-header">
                    <h2 className="blog-post-title">
                      {id ? post.title : (
                        /* UPDATED: Post links include /blog prefix */
                        <Link to={`/blog/post/${post.id}`}>{post.title}</Link>
                      )}
                    </h2>
                    <div className="blog-post-meta">
                      <time className="blog-post-date">
                        {formatDate(post.publishedDate || post.updatedAt)}
                      </time>
                      {post.tags && post.tags.length > 0 && (
                        <div className="blog-post-tags">
                          {post.tags.map(tag => (
                            /* UPDATED: Tag links include /blog prefix */
                            <Link 
                              key={tag} 
                              to={`/blog/tag/${encodeURIComponent(tag)}`}
                              className="blog-post-tag"
                            >
                              {tag}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  </header>

                  <div className="blog-post-content">
                    <div 
                      dangerouslySetInnerHTML={{ __html: post.content }}
                    />
                  </div>

                  {/* Post separator (except for last post) */}
                  {index < filteredPosts.length - 1 && (
                    <div className="blog-post-separator" />
                  )}
                </article>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <BlogSidebar 
          archiveData={getArchiveData()}
          tagData={getTagData()}
        />
      </main>
    </div>
  );
};

export default PublishedBlog;

