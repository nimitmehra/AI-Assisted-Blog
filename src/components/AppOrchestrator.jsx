import React, { useState, useEffect } from 'react';
import Dashboard from './Dashboard';
import Editor from './Editor';
import Sidebar from './Sidebar';

const AppOrchestrator = () => {
  // Load posts from localStorage on mount
  const [posts, setPosts] = useState(() => {
    const savedPosts = localStorage.getItem('blog-posts');
    if (savedPosts) {
      return JSON.parse(savedPosts);
    }
    // Fallback to sample data if no saved posts
    return [
      {
        id: '1',
        title: 'Reflections on Remote Work',
        content: 'Working from home has fundamentally changed how I think about productivity and work-life balance. The flexibility is incredible, but it requires discipline and clear boundaries to be effective.',
        status: 'published',
        isPublic: true,
        tags: ['work', 'productivity', 'remote'],
        createdAt: '2025-01-05T10:00:00Z',
        updatedAt: '2025-01-05T10:00:00Z',
        publishedDate: '2025-01-05T10:00:00Z',
        wordCount: 850
      },
      {
        id: '2',
        title: 'Learning to Cook Italian Food',
        content: 'Yesterday I attempted to make fresh pasta from scratch. The process was meditative, almost therapeutic. Mixing the flour with eggs, kneading the dough until it became silky smooth.',
        status: 'published',
        isPublic: true,
        tags: ['cooking', 'italy', 'learning'],
        createdAt: '2025-01-04T15:30:00Z',
        updatedAt: '2025-01-04T15:30:00Z',
        publishedDate: '2025-01-04T15:30:00Z',
        wordCount: 420
      },
      {
        id: '3',
        title: 'Morning Thoughts on Creativity',
        content: 'Creativity isn\'t about waiting for inspiration to strike. It\'s about showing up consistently and creating the conditions for ideas to emerge. The best creative work happens when we establish routines.',
        status: 'published',
        isPublic: true,
        tags: ['creativity', 'writing', 'morning'],
        createdAt: '2025-01-03T08:00:00Z',
        updatedAt: '2025-01-03T08:00:00Z',
        publishedDate: '2025-01-03T08:00:00Z',
        wordCount: 650
      }
    ];
  });

  // Save posts to localStorage whenever posts change
  useEffect(() => {
    localStorage.setItem('blog-posts', JSON.stringify(posts));
    console.log('📦 Posts saved to localStorage:', posts.length, 'posts');
  }, [posts]);

  // App state
  const [currentView, setCurrentView] = useState('dashboard');
  const [editingPost, setEditingPost] = useState(null);
  const [saveStatus, setSaveStatus] = useState('');
  const [lastSaved, setLastSaved] = useState(null);

  // Navigation functions
  const handleNewPost = () => {
    const newPost = {
      id: Date.now().toString(),
      title: '',
      content: '',
      status: 'draft',
      isPublic: false,
      tags: [], // Initialize with empty tags array
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedDate: null,
      wordCount: 0
    };
    setEditingPost(newPost);
    setCurrentView('editor');
  };

  const handleEditPost = (post) => {
    setEditingPost(post);
    setCurrentView('editor');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setEditingPost(null);
    setSaveStatus('');
    setLastSaved(null);
  };

  // Save functions
  const handleSaveDraft = (postData) => {
    setSaveStatus('saving');
    
    setTimeout(() => {
      const now = new Date().toISOString();
      
      if (editingPost.id && posts.find(p => p.id === editingPost.id)) {
        // Update existing post
        setPosts(posts.map(post => 
          post.id === editingPost.id 
            ? { 
                ...post, 
                ...postData, 
                status: 'draft',
                updatedAt: now
              }
            : post
        ));
      } else {
        // Add new post
        const newPost = {
          ...editingPost,
          ...postData,
          status: 'draft',
          updatedAt: now
        };
        setPosts([...posts, newPost]);
        setEditingPost(newPost);
      }
      
      setSaveStatus('saved');
      setLastSaved(new Date());
      
      setTimeout(() => setSaveStatus(''), 2000);
    }, 500);
  };

  const handlePublish = (postData) => {
    setSaveStatus('saving');
    
    setTimeout(() => {
      const now = new Date().toISOString();
      
      if (editingPost.id && posts.find(p => p.id === editingPost.id)) {
        // Update existing post
        setPosts(posts.map(post => 
          post.id === editingPost.id 
            ? { 
                ...post, 
                ...postData, 
                status: 'published',
                isPublic: true,
                updatedAt: now,
                publishedDate: now
              }
            : post
        ));
      } else {
        // Add new post
        const newPost = {
          ...editingPost,
          ...postData,
          status: 'published',
          isPublic: true,
          updatedAt: now,
          publishedDate: now
        };
        setPosts([...posts, newPost]);
        setEditingPost(newPost);
      }
      
      setSaveStatus('saved');
      setLastSaved(new Date());
      
      setTimeout(() => setSaveStatus(''), 2000);
    }, 500);
  };

  // NEW: Delete function
  const handleDeletePost = (postId) => {
    // Remove post from posts array
    setPosts(posts.filter(post => post.id !== postId));
    
    // Return to dashboard
    handleBackToDashboard();
    
    console.log('🗑️ Post deleted:', postId);
  };

  // Export function for PublishedBlog component
  const getPublishedPostsForBlog = () => {
    return posts.filter(post => post.status === 'published');
  };

  // Render current view
  const renderCurrentView = () => {
    switch (currentView) {
      case 'editor':
        return (
          <Editor
            post={editingPost}
            onSave={handleSaveDraft}
            onPublish={handlePublish}
            onCancel={handleBackToDashboard}
            onDelete={handleDeletePost} // NEW: Pass delete handler
            saveStatus={saveStatus}
            lastSaved={lastSaved}
          />
        );
      case 'dashboard':
      default:
        return (
          <Dashboard
            posts={posts}
            onEditPost={handleEditPost}
            onNewPost={handleNewPost}
          />
        );
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1 }}>
        {renderCurrentView()}
      </main>
    </div>
  );
};

// Export the function for PublishedBlog component
export const getPublishedPosts = () => {
  const savedPosts = localStorage.getItem('blog-posts');
  if (savedPosts) {
    const posts = JSON.parse(savedPosts);
    return posts.filter(post => post.status === 'published');
  }
  return [];
};

export default AppOrchestrator;

