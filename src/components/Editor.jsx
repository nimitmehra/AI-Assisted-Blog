import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft, Bold, Italic, Underline, List, ListOrdered, Quote,
  Undo, Redo, Link, Image, Save, Send, CheckCircle, X,
  AlignLeft, AlignCenter, AlignRight, AlignJustify, Trash2, Tag
} from 'lucide-react';
import { calculateWordCount } from '../utils/SharedUtils';

const Editor = ({
  post,
  onSave,
  onPublish,
  onCancel,
  onDelete, // NEW: Delete handler prop
  saveStatus = '',
  lastSaved = null
}) => {
  // Editor State
  const [editorTitle, setEditorTitle] = useState(post?.title || '');
  const [editorContent, setEditorContent] = useState(post?.content || '');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // NEW: Tag State
  const [tags, setTags] = useState(post?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [availableTags, setAvailableTags] = useState([]);
  const [filteredTags, setFilteredTags] = useState([]);

  // NEW: Delete State
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Link Modal State
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkText, setLinkText] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);

  // Image Modal State
  const [showImageSizeModal, setShowImageSizeModal] = useState(false);

  // Active formatting state
  const [activeFormats, setActiveFormats] = useState({
    bold: false, italic: false, underline: false,
    justifyLeft: false, justifyCenter: false, justifyRight: false, justifyFull: false
  });

  // Refs
  const contentRef = useRef(null);
  const fileInputRef = useRef(null);
  const savedSelectionRef = useRef(null);
  const tagInputRef = useRef(null);

  // NEW: Load available tags from localStorage
  useEffect(() => {
    const loadAvailableTags = () => {
      try {
        const savedPosts = localStorage.getItem('blog-posts');
        if (savedPosts) {
          const posts = JSON.parse(savedPosts);
          const allTags = new Set();
          posts.forEach(post => {
            if (post.tags) {
              post.tags.forEach(tag => allTags.add(tag));
            }
          });
          setAvailableTags(Array.from(allTags).sort());
        }
      } catch (error) {
        console.error('Error loading available tags:', error);
      }
    };

    loadAvailableTags();
  }, []);

  // Initialize content when post changes
  useEffect(() => {
    if (post) {
      setEditorTitle(post.title || '');
      setEditorContent(post.content || '');
      setTags(post.tags || []); // NEW: Initialize tags
      setHasUnsavedChanges(false);
    }

    // Set content in contentEditable
    setTimeout(() => {
      if (contentRef.current && post?.content) {
        contentRef.current.innerHTML = post.content;
      }
    }, 100);
  }, [post]);

  // Update active formats based on cursor position
  const updateActiveFormats = () => {
    if (!contentRef.current) return;

    try {
      setActiveFormats({
        bold: document.queryCommandState('bold'),
        italic: document.queryCommandState('italic'),
        underline: document.queryCommandState('underline'),
        justifyLeft: document.queryCommandState('justifyLeft'),
        justifyCenter: document.queryCommandState('justifyCenter'),
        justifyRight: document.queryCommandState('justifyRight'),
        justifyFull: document.queryCommandState('justifyFull')
      });
    } catch (error) {
      console.error('Error updating active formats:', error);
    }
  };

  // Get button style based on active state
  const getButtonStyle = (isActive, baseStyle = {}) => ({
    ...baseStyle,
    backgroundColor: isActive ? '#3b82f6' : 'transparent',
    color: isActive ? 'white' : '#6b7280',
    fontWeight: isActive ? '600' : '500',
    transform: isActive ? 'scale(1.05)' : 'scale(1)',
    transition: 'all 0.2s ease',
    border: '1px solid #d1d5db',
    borderRadius: '0.375rem',
    cursor: 'pointer'
  });

  // Format text functions
  const formatText = (command, value = null) => {
    document.execCommand(command, false, value);
    contentRef.current?.focus();
    setTimeout(updateActiveFormats, 10);
  };

  const alignText = (alignment) => {
    formatText(`justify${alignment.charAt(0).toUpperCase() + alignment.slice(1)}`);
  };

  // Handle content changes
  const handleContentChange = () => {
    if (contentRef.current) {
      const newContent = contentRef.current.innerHTML;
      setEditorContent(newContent);
      setHasUnsavedChanges(true);
    }
  };

  const handleTitleChange = (e) => {
    setEditorTitle(e.target.value);
    setHasUnsavedChanges(true);
  };

  // NEW: Tag handling functions
  const handleTagInputChange = (e) => {
    const value = e.target.value;
    setTagInput(value);
    
    if (value.trim()) {
      const filtered = availableTags.filter(tag => 
        tag.toLowerCase().includes(value.toLowerCase()) && 
        !tags.includes(tag)
      );
      setFilteredTags(filtered);
      setShowTagDropdown(true);
    } else {
      setShowTagDropdown(false);
    }
  };

  const handleTagInputKeyDown = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      addTag(tagInput.trim());
    } else if (e.key === 'Escape') {
      setShowTagDropdown(false);
    }
  };

  const addTag = (tagName) => {
    if (tagName && !tags.includes(tagName)) {
      setTags([...tags, tagName]);
      setTagInput('');
      setShowTagDropdown(false);
      setHasUnsavedChanges(true);
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
    setHasUnsavedChanges(true);
  };

  const selectTagFromDropdown = (tag) => {
    addTag(tag);
  };

  // NEW: Delete handling functions
  const handleDeleteClick = () => {
    if (post && post.id) {
      setShowDeleteConfirm(true);
    }
  };

  const confirmDelete = () => {
    if (post && post.id && onDelete) {
      onDelete(post.id);
      setShowDeleteConfirm(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  // Link handling functions
  const handleLinkClick = () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      savedSelectionRef.current = selection.getRangeAt(0);
      setLinkText(selection.toString());
    }
    setShowLinkModal(true);
  };

  const insertLink = () => {
    if (linkUrl && savedSelectionRef.current) {
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(savedSelectionRef.current);
      
      const displayText = linkText || linkUrl;
      const linkHtml = `<a href="${linkUrl}" target="_blank">${displayText}</a>`;
      document.execCommand('insertHTML', false, linkHtml);
      
      setShowLinkModal(false);
      setLinkText('');
      setLinkUrl('');
      savedSelectionRef.current = null;
      contentRef.current?.focus();
      handleContentChange();
    }
  };

  // Image handling functions
  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file && (file.type === 'image/png' || file.type === 'image/jpeg')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target.result);
        setShowImageSizeModal(true);
      };
      reader.readAsDataURL(file);
    }
    event.target.value = '';
  };

  const insertImage = (size) => {
    if (selectedImage) {
      const img = `<img src="${selectedImage}" style="width: ${size}%; height: auto; border-radius: 0.375rem; margin: 0.5rem 0;" />`;
      document.execCommand('insertHTML', false, img);
      setShowImageSizeModal(false);
      setSelectedImage(null);
      contentRef.current?.focus();
      handleContentChange();
    }
  };

  // Save functions
  const handleSave = () => {
    const wordCount = calculateWordCount(editorContent);
    onSave({
      title: editorTitle,
      content: editorContent,
      tags: tags, // NEW: Include tags in save
      wordCount
    });
    setHasUnsavedChanges(false);
  };

  const handlePublish = () => {
    const wordCount = calculateWordCount(editorContent);
    onPublish({
      title: editorTitle,
      content: editorContent,
      tags: tags, // NEW: Include tags in publish
      wordCount
    });
    setHasUnsavedChanges(false);
  };

  const getWordCount = () => calculateWordCount(editorContent);
  const getCharCount = () => editorContent.replace(/<[^>]*>/g, '').length;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Header */}
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
          <button
            onClick={onCancel}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              backgroundColor: 'transparent',
              color: '#6b7280',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              cursor: 'pointer'
            }}
          >
            <ArrowLeft size={18} />
            <span>Back to Dashboard</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              {getWordCount()} words • {getCharCount()} characters
              {lastSaved && (
                <span style={{ marginLeft: '1rem' }}>
                  Last saved: {lastSaved.toLocaleTimeString()}
                </span>
              )}
            </div>
            
            {saveStatus && (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                color: saveStatus === 'saved' ? '#10b981' : '#6b7280'
              }}>
                {saveStatus === 'saved' && <CheckCircle size={16} />}
                <span style={{ fontSize: '0.875rem' }}>
                  {saveStatus === 'saving' ? 'Saving...' : 'Saved'}
                </span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Editor */}
      <main style={{ maxWidth: '72rem', margin: '0 auto', padding: '2rem 1.5rem' }}>
        <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
          {/* Title Input */}
          <div style={{ padding: '1.5rem 1.5rem 0' }}>
            <input
              type="text"
              placeholder="Post title..."
              value={editorTitle}
              onChange={handleTitleChange}
              style={{
                width: '100%',
                fontSize: '2rem',
                fontWeight: 'bold',
                border: 'none',
                outline: 'none',
                backgroundColor: 'transparent',
                color: '#111827'
              }}
            />
          </div>

          {/* NEW: Tag Input Section */}
          <div style={{ padding: '0 1.5rem 1rem', position: 'relative' }}>
            <div style={{ marginBottom: '0.5rem' }}>
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                fontSize: '0.875rem', 
                fontWeight: '500', 
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                <Tag size={16} />
                Tags
              </label>
              
              {/* Tag Display */}
              {tags.length > 0 && (
                <div style={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: '0.5rem',
                  marginBottom: '0.5rem'
                }}>
                  {tags.map(tag => (
                    <span 
                      key={tag}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        padding: '0.25rem 0.5rem',
                        backgroundColor: '#dbeafe',
                        color: '#1e40af',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        borderRadius: '0.375rem',
                        border: '1px solid #bfdbfe'
                      }}
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#1e40af',
                          cursor: 'pointer',
                          padding: '0',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                        title={`Remove ${tag}`}
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Tag Input */}
              <input
                ref={tagInputRef}
                type="text"
                placeholder="Add tags..."
                value={tagInput}
                onChange={handleTagInputChange}
                onKeyDown={handleTagInputKeyDown}
                onFocus={() => tagInput.trim() && setShowTagDropdown(true)}
                onBlur={() => setTimeout(() => setShowTagDropdown(false), 200)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  outline: 'none'
                }}
              />

              {/* Tag Dropdown */}
              {showTagDropdown && filteredTags.length > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: '1.5rem',
                  right: '1.5rem',
                  backgroundColor: 'white',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  zIndex: 10,
                  maxHeight: '200px',
                  overflowY: 'auto'
                }}>
                  {filteredTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => selectTagFromDropdown(tag)}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        textAlign: 'left',
                        border: 'none',
                        backgroundColor: 'transparent',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        color: '#374151'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Toolbar */}
          <div style={{ 
            padding: '0 1.5rem 1rem',
            borderBottom: '1px solid #e5e7eb'
          }}>
            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: '0.5rem',
              alignItems: 'center'
            }}>
              {/* Text Formatting */}
              <button
                onClick={() => formatText('bold')}
                style={getButtonStyle(activeFormats.bold, { padding: '0.5rem' })}
                title="Bold"
              >
                <Bold size={18} />
              </button>
              
              <button
                onClick={() => formatText('italic')}
                style={getButtonStyle(activeFormats.italic, { padding: '0.5rem' })}
                title="Italic"
              >
                <Italic size={18} />
              </button>
              
              <button
                onClick={() => formatText('underline')}
                style={getButtonStyle(activeFormats.underline, { padding: '0.5rem' })}
                title="Underline"
              >
                <Underline size={18} />
              </button>

              <div style={{ width: '1px', height: '1.5rem', backgroundColor: '#d1d5db' }} />

              {/* Alignment */}
              <button
                onClick={() => alignText('left')}
                style={getButtonStyle(activeFormats.justifyLeft, { padding: '0.5rem' })}
                title="Align Left"
              >
                <AlignLeft size={18} />
              </button>
              
              <button
                onClick={() => alignText('center')}
                style={getButtonStyle(activeFormats.justifyCenter, { padding: '0.5rem' })}
                title="Align Center"
              >
                <AlignCenter size={18} />
              </button>
              
              <button
                onClick={() => alignText('right')}
                style={getButtonStyle(activeFormats.justifyRight, { padding: '0.5rem' })}
                title="Align Right"
              >
                <AlignRight size={18} />
              </button>
              
              <button
                onClick={() => alignText('full')}
                style={getButtonStyle(activeFormats.justifyFull, { padding: '0.5rem' })}
                title="Justify"
              >
                <AlignJustify size={18} />
              </button>

              <div style={{ width: '1px', height: '1.5rem', backgroundColor: '#d1d5db' }} />

              {/* Lists */}
              <button
                onClick={() => formatText('insertUnorderedList')}
                style={getButtonStyle(false, { padding: '0.5rem' })}
                title="Bullet List"
              >
                <List size={18} />
              </button>
              
              <button
                onClick={() => formatText('insertOrderedList')}
                style={getButtonStyle(false, { padding: '0.5rem' })}
                title="Numbered List"
              >
                <ListOrdered size={18} />
              </button>
              
              <button
                onClick={() => formatText('formatBlock', 'blockquote')}
                style={getButtonStyle(false, { padding: '0.5rem' })}
                title="Quote"
              >
                <Quote size={18} />
              </button>

              <div style={{ width: '1px', height: '1.5rem', backgroundColor: '#d1d5db' }} />

              {/* Media */}
              <button
                onClick={handleLinkClick}
                style={getButtonStyle(false, { padding: '0.5rem' })}
                title="Insert Link"
              >
                <Link size={18} />
              </button>
              
              <button
                onClick={handleImageClick}
                style={getButtonStyle(false, { padding: '0.5rem' })}
                title="Insert Image"
              >
                <Image size={18} />
              </button>

              <div style={{ width: '1px', height: '1.5rem', backgroundColor: '#d1d5db' }} />

              {/* Undo/Redo */}
              <button
                onClick={() => formatText('undo')}
                style={getButtonStyle(false, { padding: '0.5rem' })}
                title="Undo"
              >
                <Undo size={18} />
              </button>
              
              <button
                onClick={() => formatText('redo')}
                style={getButtonStyle(false, { padding: '0.5rem' })}
                title="Redo"
              >
                <Redo size={18} />
              </button>
            </div>
          </div>

          {/* Content Editor */}
          <div
            ref={contentRef}
            contentEditable
            onInput={handleContentChange}
            onMouseUp={updateActiveFormats}
            onKeyUp={updateActiveFormats}
            onFocus={updateActiveFormats}
            style={{
              minHeight: '400px',
              padding: '1.5rem',
              outline: 'none',
              fontSize: '1rem',
              lineHeight: '1.6',
              color: '#111827'
            }}
            suppressContentEditableWarning={true}
          />

          {/* Action Buttons */}
          <div style={{ 
            padding: '1.5rem',
            borderTop: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            {/* NEW: Delete Button (only show for existing posts) */}
            <div>
              {post && post.id && (
                <button
                  onClick={handleDeleteClick}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    backgroundColor: 'transparent',
                    color: '#dc2626',
                    border: '1px solid #dc2626',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '500'
                  }}
                  title="Delete this post"
                >
                  <Trash2 size={16} />
                  <span>Delete Post</span>
                </button>
              )}
            </div>

            {/* Save Buttons */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={handleSave}
                disabled={!editorTitle.trim() || saveStatus === 'saving'}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#f9fafb',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  cursor: editorTitle.trim() && saveStatus !== 'saving' ? 'pointer' : 'not-allowed',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  opacity: editorTitle.trim() && saveStatus !== 'saving' ? 1 : 0.5
                }}
              >
                <Save size={18} />
                <span>Update Draft</span>
              </button>
              
              <button
                onClick={handlePublish}
                disabled={!editorTitle.trim() || saveStatus === 'saving'}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  backgroundColor: editorTitle.trim() && saveStatus !== 'saving' ? '#2563eb' : '#9ca3af',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: editorTitle.trim() && saveStatus !== 'saving' ? 'pointer' : 'not-allowed',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  boxShadow: editorTitle.trim() && saveStatus !== 'saving' ? '0 1px 2px 0 rgba(0, 0, 0, 0.05)' : 'none'
                }}
              >
                <Send size={18} />
                <span>Update & Publish</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg"
        onChange={handleImageUpload}
        style={{ display: 'none' }}
      />

      {/* Link Modal */}
      {showLinkModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50
        }}>
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '0.5rem', 
            padding: '2rem',
            margin: '1.5rem',
            maxWidth: '450px',
            width: '90%'
          }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>
              Add Link
            </h3>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.75rem' }}>
                Link Text (optional)
              </label>
              <input
                type="text"
                placeholder="Display text for the link"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.875rem 1rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem'
                }}
              />
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.75rem' }}>
                URL
              </label>
              <input
                type="url"
                placeholder="https://example.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.875rem 1rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem'
                }}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowLinkModal(false)}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#f9fafb',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '400'
                }}
              >
                Cancel
              </button>
              
              <button
                onClick={insertLink}
                disabled={!linkUrl}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: linkUrl ? '#2563eb' : '#9ca3af',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: linkUrl ? 'pointer' : 'not-allowed',
                  fontSize: '0.875rem',
                  fontWeight: '600'
                }}
              >
                Add Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Size Modal */}
      {showImageSizeModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50
        }}>
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '0.5rem', 
            padding: '1.5rem',
            margin: '1rem'
          }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>
              Choose Image Size
            </h3>
            
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {[25, 50, 75, 100].map(size => (
                <button
                  key={size}
                  onClick={() => insertImage(size)}
                  style={{
                    padding: '0.75rem 1rem',
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    fontSize: '0.875rem'
                  }}
                >
                  {size}%
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* NEW: Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50
        }}>
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '0.5rem', 
            padding: '2rem',
            margin: '1.5rem',
            maxWidth: '400px',
            width: '90%'
          }}>
            <div style={{ textAlign: 'center' }}>
              <Trash2 size={48} style={{ color: '#dc2626', margin: '0 auto 1rem' }} />
              
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem', color: '#111827' }}>
                Delete Post
              </h3>
              
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1.5rem' }}>
                Are you sure you want to delete "{editorTitle || 'this post'}"? This action cannot be undone.
              </p>
              
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                <button
                  onClick={cancelDelete}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#f9fafb',
                    color: '#374151',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '500'
                  }}
                >
                  Cancel
                </button>
                
                <button
                  onClick={confirmDelete}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#dc2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '600'
                  }}
                >
                  Delete Post
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Editor;

