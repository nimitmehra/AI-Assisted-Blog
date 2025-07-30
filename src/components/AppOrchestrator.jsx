import React, { useState, useCallback, useEffect } from 'react';
import Dashboard from './Dashboard';
import Editor from './Editor';
import Sidebar from './Sidebar';
import { generatePostId, calculateWordCount } from '../utils/SharedUtils';

const AppOrchestrator = () => {
  // Global Application State
  const [currentView, setCurrentView] = useState('dashboard');
  const [editingPost, setEditingPost] = useState(null);
  const [saveStatus, setSaveStatus] = useState('');
  const [lastSaved, setLastSaved] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // FIXED: Load posts from localStorage on mount, fallback to sample data
  const [posts, setPosts] = useState(() => {
    const savedPosts = localStorage.getItem('blog-posts');
    if (savedPosts) {
      return JSON.parse(savedPosts);
    }
    // Fallback to sample data if no saved posts
    return [
      {
        id: "1",
        title: "Reflections on Remote Work",
        content: "Working from home has fundamentally changed how I think about productivity and work-life balance. The flexibility is incredible, but it requires discipline and clear boundaries between work and personal life.",
        status: "published",
        isPublic: true,
        createdAt: "2025-01-05T10:30:00",
        updatedAt: "2025-01-05T14:20:00",
        tags: ["work", "productivity", "remote"],
        wordCount: 850
      },
      {
        id: "2",
        title: "Learning to Cook Italian Food",
        content: "Yesterday I attempted to make fresh pasta from scratch. The process was meditative, almost therapeutic. Mixing the flour with eggs, kneading the dough until it became silky smooth - there's something deeply satisfying about creating something delicious with your own hands.",
        status: "draft",
        isPublic: false,
        createdAt: "2025-01-04T16:45:00",
        updatedAt: "2025-01-04T17:30:00",
        tags: ["cooking", "italy", "learning"],
        wordCount: 420
      },
      {
        id: "3",
        title: "Morning Thoughts on Creativity",
        content: "Creativity isn't about waiting for inspiration to strike. It's about showing up consistently and creating the conditions for ideas to emerge. The best creative work happens when we establish routines and remove friction from the creative process.",
        status: "published",
        isPublic: true,
        createdAt: "2025-01-03T08:15:00",
        updatedAt: "2025-01-03T08:45:00",
        tags: ["creativity", "writing", "morning"],
        wordCount: 650
      }
    ];
  });

  // ADDED: Save posts to localStorage whenever posts state changes
  useEffect(() => {
    localStorage.setItem('blog-posts', JSON.stringify(posts));
    console.log('📦 Posts saved to localStorage:', posts.length, 'posts');
  }, [posts]);

  // Navigation Functions
  const handleNewPost = useCallback(() => {
    console.log('🆕 Navigation: Dashboard → Editor (New Post)');
    setEditingPost(null);
    setCurrentView('editor');
  }, []);

  const handleEditPost = useCallback((post) => {
    console.log('✏️ Navigation: Dashboard → Editor (Edit Post)', post.title);
    setEditingPost(post);
    setCurrentView('editor');
  }, []);

  const handleBackToDashboard = useCallback(() => {
    console.log('🔙 Navigation: Editor → Dashboard');
    setCurrentView('dashboard');
    setEditingPost(null);
    setSaveStatus('');
  }, []);

  // Save Operations - FIXED: These match exactly what Editor.jsx expects
  const handleSaveDraft = useCallback((postData) => {
    console.log('💾 Save Operation: Save as Draft');
    setSaveStatus('saving');

    setTimeout(() => {
      const now = new Date().toISOString();
      
      if (editingPost) {
        // Update existing post
        const updatedPost = {
          ...editingPost,
          title: postData.title,
          content: postData.content,
          status: 'draft',
          isPublic: false,
          updatedAt: now,
          wordCount: postData.wordCount
        };

        setPosts(posts.map(p => p.id === editingPost.id ? updatedPost : p));
        setEditingPost(updatedPost);
        console.log('✅ Updated existing post as draft');
      } else {
        // Create new post
        const newPost = {
          id: generatePostId(),
          title: postData.title,
          content: postData.content,
          status: 'draft',
          isPublic: false,
          createdAt: now,
          updatedAt: now,
          tags: [], // TODO: Extract tags from content
          wordCount: postData.wordCount
        };

        setPosts([newPost, ...posts]);
        setEditingPost(newPost);
        console.log('✅ Created new post as draft');
      }

      setLastSaved(new Date());
      setSaveStatus('saved');
      
      // Clear save status after 3 seconds
      setTimeout(() => setSaveStatus(''), 3000);
    }, 500);
  }, [editingPost, posts]);

  const handlePublish = useCallback((postData) => {
    console.log('🚀 Save Operation: Publish');
    setSaveStatus('saving');

    setTimeout(() => {
      const now = new Date().toISOString();
      
      if (editingPost) {
        // Update existing post as published
        const publishedPost = {
          ...editingPost,
          title: postData.title,
          content: postData.content,
          status: 'published',
          isPublic: true,
          updatedAt: now,
          publishedDate: now, // ADDED: Track when published
          wordCount: postData.wordCount
        };

        setPosts(posts.map(p => p.id === editingPost.id ? publishedPost : p));
        console.log('✅ Updated existing post as published');
      } else {
        // Create new post as published
        const newPost = {
          id: generatePostId(),
          title: postData.title,
          content: postData.content,
          status: 'published',
          isPublic: true,
          createdAt: now,
          updatedAt: now,
          publishedDate: now, // ADDED: Track when published
          tags: [], // TODO: Extract tags from content
          wordCount: postData.wordCount
        };

        setPosts([newPost, ...posts]);
        console.log('✅ Created new post as published');
      }

      setSaveStatus('saved');
      
      // Return to dashboard after publishing
      setTimeout(() => {
        setCurrentView('dashboard');
        setEditingPost(null);
        setSaveStatus('');
      }, 1000);
    }, 500);
  }, [editingPost, posts]);

  // Sidebar Functions
  const handlePostSelect = useCallback((post) => {
    handleEditPost(post);
  }, [handleEditPost]);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(!sidebarOpen);
  }, [sidebarOpen]);

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
    <div style={{ position: 'relative' }}>
      {/* Sidebar */}
      <Sidebar
        posts={posts}
        onPostSelect={handlePostSelect}
        selectedPostId={editingPost?.id}
        isOpen={sidebarOpen}
        onToggle={toggleSidebar}
      />

      {/* Main Content */}
      <div style={{ 
        marginLeft: sidebarOpen ? '20rem' : '0',
        transition: 'margin-left 0.3s ease',
        minHeight: '100vh'
      }}>
        {renderCurrentView()}
      </div>

      {/* Sidebar Overlay for mobile */}
      {sidebarOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 15
          }}
          onClick={toggleSidebar}
        />
      )}
    </div>
  );
};

// Export function for published blog - UPDATED to read from localStorage
export const getPublishedPostsForBlog = () => {
  const savedPosts = localStorage.getItem('blog-posts');
  if (!savedPosts) return [];
  return JSON.parse(savedPosts)
    .filter(post => post.status === 'published')
    .sort((a, b) => new Date(b.publishedDate || b.updatedAt) - new Date(a.publishedDate || a.updatedAt));
};

export default AppOrchestrator;

