import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft, Bold, Italic, Underline, List, ListOrdered, Quote, 
  Undo, Redo, Link, Image, Save, Send, CheckCircle, X,
  AlignLeft, AlignCenter, AlignRight, AlignJustify
} from 'lucide-react';
import { calculateWordCount } from '../utils/SharedUtils';

const Editor = ({ 
  post, 
  onSave, 
  onPublish, 
  onCancel,
  saveStatus = '',
  lastSaved = null
}) => {
  // Editor State
  const [editorTitle, setEditorTitle] = useState(post?.title || '');
  const [editorContent, setEditorContent] = useState(post?.content || '');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Rich editor state
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkText, setLinkText] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [showImageSizeModal, setShowImageSizeModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  
  // Refs
  const contentRef = useRef(null);
  const fileInputRef = useRef(null);
  const savedSelectionRef = useRef(null);

  // Initialize content when post changes
  useEffect(() => {
    if (post) {
      setEditorTitle(post.title || '');
      setEditorContent(post.content || '');
      setHasUnsavedChanges(false);
      
      // Set content in contentEditable
      setTimeout(() => {
        if (contentRef.current) {
          contentRef.current.innerHTML = post.content || '';
        }
      }, 0);
    }
  }, [post]);

  // Content change tracking
  const handleTitleChange = (e) => {
    setEditorTitle(e.target.value);
    setHasUnsavedChanges(true);
  };

  const handleContentChange = () => {
    const newContent = contentRef.current?.innerHTML || '';
    setEditorContent(newContent);
    setHasUnsavedChanges(true);
  };

  // Rich text formatting functions
  const formatText = (command, value = null) => {
    document.execCommand(command, false, value);
    contentRef.current?.focus();
    handleContentChange();
  };

  // Text alignment functions
  const alignText = (alignment) => {
    formatText('justifyLeft');
    if (alignment === 'center') formatText('justifyCenter');
    if (alignment === 'right') formatText('justifyRight');
    if (alignment === 'justify') formatText('justifyFull');
  };

  const handleAddLink = () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      savedSelectionRef.current = selection.getRangeAt(0).cloneRange();
      const selectedText = selection.toString();
      setLinkText(selectedText || '');
    } else {
      savedSelectionRef.current = null;
      setLinkText('');
    }
    setShowLinkModal(true);
  };

  const insertLink = () => {
    if (!linkUrl) return;

    contentRef.current?.focus();
    const linkElement = document.createElement('a');
    linkElement.href = linkUrl;
    linkElement.target = '_blank';
    linkElement.rel = 'noopener noreferrer';
    linkElement.style.color = '#2563eb';
    linkElement.style.textDecoration = 'underline';
    linkElement.textContent = linkText || linkUrl;

    if (savedSelectionRef.current) {
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(savedSelectionRef.current);
      savedSelectionRef.current.deleteContents();
      savedSelectionRef.current.insertNode(linkElement);
      savedSelectionRef.current.setStartAfter(linkElement);
      savedSelectionRef.current.setEndAfter(linkElement);
      selection.removeAllRanges();
      selection.addRange(savedSelectionRef.current);
    }

    handleContentChange();
    setShowLinkModal(false);
    setLinkText('');
    setLinkUrl('');
    savedSelectionRef.current = null;
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageHtml = `<img src="${e.target.result}" alt="Uploaded image" class="editor-image" style="max-width: 50%; height: auto; margin: 1rem 0; border-radius: 8px; display: block;" />`;
        document.execCommand('insertHTML', false, imageHtml);
        contentRef.current?.focus();
        handleContentChange();
      };
      reader.readAsDataURL(file);
    }
    event.target.value = '';
  };

  const triggerImageUpload = () => {
    fileInputRef.current?.click();
  };

  // Image sizing functions
  const handleImageClick = (e) => {
    if (e.target.tagName === 'IMG') {
      setSelectedImage(e.target);
      setShowImageSizeModal(true);
    }
  };

  const resizeImage = (size) => {
    if (!selectedImage) return;
    
    const sizeMap = {
      small: '25%',
      medium: '50%',
      large: '75%',
      full: '100%'
    };
    
    selectedImage.style.maxWidth = sizeMap[size];
    setShowImageSizeModal(false);
    setSelectedImage(null);
    handleContentChange();
  };

  const handleSave = () => {
    if (!editorTitle.trim()) {
      alert('Please enter a title');
      return;
    }
    onSave({
      title: editorTitle,
      content: editorContent,
      wordCount: calculateWordCount(editorContent)
    });
    setHasUnsavedChanges(false);
  };

  const handlePublish = () => {
    if (!editorTitle.trim()) {
      alert('Please enter a title');
      return;
    }
    onPublish({
      title: editorTitle,
      content: editorContent,
      wordCount: calculateWordCount(editorContent)
    });
    setHasUnsavedChanges(false);
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      const confirmLeave = window.confirm('You have unsaved changes. Are you sure you want to leave?');
      if (!confirmLeave) return;
    }
    onCancel();
  };

  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      maxWidth: '64rem', 
      margin: '0 auto', 
      backgroundColor: 'white' 
    }}>
      {/* Editor Header - Fixed Height */}
      <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #e5e7eb', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <button
            onClick={handleCancel}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              color: '#6b7280',
              backgroundColor: 'transparent',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              cursor: 'pointer'
            }}
          >
            <ArrowLeft size={20} />
            <span>Back to Dashboard</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {hasUnsavedChanges && (
              <span style={{ fontSize: '0.875rem', color: '#f59e0b', fontWeight: '500' }}>
                • Unsaved changes
              </span>
            )}
            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              {post ? `Editing: ${post.title}` : 'New Post'}
            </div>
          </div>
        </div>

        <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827', margin: 0, marginBottom: '0.5rem' }}>
          {post ? 'Edit Post' : 'New Journal Entry'}
        </h1>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.875rem', color: '#6b7280' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span>{calculateWordCount(editorContent)} words</span>
            <span>{editorContent.length} characters</span>
            {lastSaved && (
              <span>Last saved: {lastSaved.toLocaleTimeString()}</span>
            )}
          </div>

          {/* Save Status Indicator */}
          {saveStatus && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {saveStatus === 'saving' && (
                <span style={{ color: '#2563eb' }}>Saving...</span>
              )}
              {saveStatus === 'saved' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#059669' }}>
                  <CheckCircle size={16} />
                  <span>Saved!</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Title Input - Fixed Height */}
      <div style={{ padding: '0 1.5rem', paddingTop: '1rem', flexShrink: 0 }}>
        <input
          type="text"
          placeholder="Entry title..."
          value={editorTitle}
          onChange={handleTitleChange}
          style={{
            width: '100%',
            fontSize: '1.875rem',
            fontWeight: 'bold',
            color: '#111827',
            backgroundColor: 'transparent',
            border: 'none',
            outline: 'none',
            padding: '0.5rem 0'
          }}
        />
      </div>

      {/* Rich Text Formatting Toolbar - Fixed Height */}
      <div style={{ padding: '0 1.5rem', paddingBottom: '1rem', flexShrink: 0 }}>
        <div style={{ padding: '0.75rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            {/* Text Formatting */}
            <button onClick={() => formatText('bold')} style={{ padding: '0.5rem', backgroundColor: 'transparent', border: 'none', borderRadius: '0.25rem', cursor: 'pointer' }} title="Bold">
              <Bold size={18} />
            </button>
            <button onClick={() => formatText('italic')} style={{ padding: '0.5rem', backgroundColor: 'transparent', border: 'none', borderRadius: '0.25rem', cursor: 'pointer' }} title="Italic">
              <Italic size={18} />
            </button>
            <button onClick={() => formatText('underline')} style={{ padding: '0.5rem', backgroundColor: 'transparent', border: 'none', borderRadius: '0.25rem', cursor: 'pointer' }} title="Underline">
              <Underline size={18} />
            </button>

            <div style={{ width: '1px', height: '1.5rem', backgroundColor: '#d1d5db', margin: '0 0.5rem' }}></div>

            {/* Text Alignment */}
            <button onClick={() => alignText('left')} style={{ padding: '0.5rem', backgroundColor: 'transparent', border: 'none', borderRadius: '0.25rem', cursor: 'pointer' }} title="Align Left">
              <AlignLeft size={18} />
            </button>
            <button onClick={() => alignText('center')} style={{ padding: '0.5rem', backgroundColor: 'transparent', border: 'none', borderRadius: '0.25rem', cursor: 'pointer' }} title="Align Center">
              <AlignCenter size={18} />
            </button>
            <button onClick={() => alignText('right')} style={{ padding: '0.5rem', backgroundColor: 'transparent', border: 'none', borderRadius: '0.25rem', cursor: 'pointer' }} title="Align Right">
              <AlignRight size={18} />
            </button>
            <button onClick={() => alignText('justify')} style={{ padding: '0.5rem', backgroundColor: 'transparent', border: 'none', borderRadius: '0.25rem', cursor: 'pointer' }} title="Justify">
              <AlignJustify size={18} />
            </button>

            <div style={{ width: '1px', height: '1.5rem', backgroundColor: '#d1d5db', margin: '0 0.5rem' }}></div>

            {/* Lists and Quotes */}
            <button onClick={() => formatText('insertUnorderedList')} style={{ padding: '0.5rem', backgroundColor: 'transparent', border: 'none', borderRadius: '0.25rem', cursor: 'pointer' }} title="Bullet List">
              <List size={18} />
            </button>
            <button onClick={() => formatText('insertOrderedList')} style={{ padding: '0.5rem', backgroundColor: 'transparent', border: 'none', borderRadius: '0.25rem', cursor: 'pointer' }} title="Numbered List">
              <ListOrdered size={18} />
            </button>
            <button onClick={() => formatText('formatBlock', 'blockquote')} style={{ padding: '0.5rem', backgroundColor: 'transparent', border: 'none', borderRadius: '0.25rem', cursor: 'pointer' }} title="Quote">
              <Quote size={18} />
            </button>

            <div style={{ width: '1px', height: '1.5rem', backgroundColor: '#d1d5db', margin: '0 0.5rem' }}></div>

            {/* Links and Images */}
            <button onClick={handleAddLink} style={{ padding: '0.5rem', backgroundColor: 'transparent', border: 'none', borderRadius: '0.25rem', cursor: 'pointer' }} title="Add Link">
              <Link size={18} />
            </button>
            <button onClick={triggerImageUpload} style={{ padding: '0.5rem', backgroundColor: 'transparent', border: 'none', borderRadius: '0.25rem', cursor: 'pointer' }} title="Upload Image">
              <Image size={18} />
            </button>

            <div style={{ width: '1px', height: '1.5rem', backgroundColor: '#d1d5db', margin: '0 0.5rem' }}></div>

            {/* Undo/Redo */}
            <button onClick={() => formatText('undo')} style={{ padding: '0.5rem', backgroundColor: 'transparent', border: 'none', borderRadius: '0.25rem', cursor: 'pointer' }} title="Undo">
              <Undo size={18} />
            </button>
            <button onClick={() => formatText('redo')} style={{ padding: '0.5rem', backgroundColor: 'transparent', border: 'none', borderRadius: '0.25rem', cursor: 'pointer' }} title="Redo">
              <Redo size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Content Editor - Flexible Height */}
      <div style={{ flex: 1, padding: '0 1.5rem', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <div
          ref={contentRef}
          contentEditable
          onInput={handleContentChange}
          onClick={handleImageClick}
          style={{
            flex: 1,
            padding: '1rem',
            fontSize: '1.125rem',
            lineHeight: '1.8',
            color: '#111827',
            border: '1px solid #d1d5db',
            borderRadius: '0.5rem',
            outline: 'none',
            backgroundColor: 'white',
            textAlign: 'left',
            overflowY: 'auto'
          }}
          suppressContentEditableWarning={true}
          data-placeholder="Start writing your thoughts..."
        />
      </div>

      {/* Save Action Buttons - Fixed Height */}
      <div style={{ padding: '1.5rem', borderTop: '1px solid #e5e7eb', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            {post ? 'Changes will update the existing post' : 'Choose how to save your new post'}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={handleSave}
              disabled={saveStatus === 'saving'}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                backgroundColor: '#f3f4f6',
                color: '#374151',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                cursor: saveStatus === 'saving' ? 'not-allowed' : 'pointer'
              }}
            >
              <Save size={18} />
              <span>{post ? 'Update Draft' : 'Save Draft'}</span>
            </button>

            <button
              onClick={handlePublish}
              disabled={saveStatus === 'saving'}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1.5rem',
                backgroundColor: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: saveStatus === 'saving' ? 'not-allowed' : 'pointer'
              }}
            >
              <Send size={18} />
              <span>{post ? 'Update & Publish' : 'Publish'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Hidden file input for image upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
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
          <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '1.5rem', width: '24rem', maxWidth: '90vw', margin: '1rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', margin: 0 }}>Add Link</h3>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.25rem' }}>
                Link Text (optional)
              </label>
              <input
                type="text"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                placeholder="Display text for the link"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem'
                }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.25rem' }}>
                URL
              </label>
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem'
                }}
                autoFocus
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                onClick={() => {
                  setShowLinkModal(false);
                  setLinkText('');
                  setLinkUrl('');
                  savedSelectionRef.current = null;
                  contentRef.current?.focus();
                }}
                style={{
                  padding: '0.5rem 1rem',
                  color: '#6b7280',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={insertLink}
                disabled={!linkUrl}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: linkUrl ? '#2563eb' : '#d1d5db',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: linkUrl ? 'pointer' : 'not-allowed'
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
          <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '1.5rem', width: '20rem', maxWidth: '90vw', margin: '1rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', margin: 0 }}>Resize Image</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                onClick={() => resizeImage('small')}
                style={{
                  padding: '0.75rem',
                  backgroundColor: '#f3f4f6',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <div style={{ fontWeight: '500' }}>Small (25%)</div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Compact size for inline content</div>
              </button>
              
              <button
                onClick={() => resizeImage('medium')}
                style={{
                  padding: '0.75rem',
                  backgroundColor: '#f3f4f6',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <div style={{ fontWeight: '500' }}>Medium (50%)</div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Default size for most content</div>
              </button>
              
              <button
                onClick={() => resizeImage('large')}
                style={{
                  padding: '0.75rem',
                  backgroundColor: '#f3f4f6',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <div style={{ fontWeight: '500' }}>Large (75%)</div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Prominent display size</div>
              </button>
              
              <button
                onClick={() => resizeImage('full')}
                style={{
                  padding: '0.75rem',
                  backgroundColor: '#f3f4f6',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <div style={{ fontWeight: '500' }}>Full Width (100%)</div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Maximum width display</div>
              </button>
            </div>

            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowImageSizeModal(false);
                  setSelectedImage(null);
                }}
                style={{
                  padding: '0.5rem 1rem',
                  color: '#6b7280',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSS for contentEditable */}
      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9CA3AF;
          font-style: italic;
        }

        [contenteditable] blockquote {
          border-left: 4px solid #E5E7EB;
          padding-left: 1rem;
          margin: 1rem 0;
          font-style: italic;
          color: #6B7280;
        }

        [contenteditable] ul {
          margin: 1rem 0;
          padding-left: 2rem;
          list-style-type: disc;
          text-align: left;
        }

        [contenteditable] ol {
          margin: 1rem 0;
          padding-left: 2rem;
          list-style-type: decimal;
          text-align: left;
        }

        [contenteditable] li {
          margin: 0.5rem 0;
          display: list-item;
          text-align: left;
        }

        [contenteditable] a {
          color: #2563eb;
          text-decoration: underline;
        }

        .editor-image {
          cursor: pointer;
          transition: opacity 0.2s;
        }

        .editor-image:hover {
          opacity: 0.8;
        }

        [contenteditable] p {
          text-align: left;
          margin: 0.5rem 0;
        }

        [contenteditable] div {
          text-align: left;
        }
      `}</style>
    </div>
  );
};

export default Editor;
