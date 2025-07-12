// Helper functions from your monolithic code
export const stripHtmlTags = (html) => {
  if (!html) return '';
  return html
    .replace(/<\/?(p|div|h[1-6]|li|br|ul|ol|blockquote)[^>]*>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

export const calculateWordCount = (text) => {
  if (!text || !text.trim()) return 0;
  return text.trim().split(/\s+/).length;
};

export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export const getStatusInfo = (status, isPublic) => {
  switch (status) {
    case 'published':
      return {
        color: isPublic ? 'text-blue-600' : 'text-gray-600',
        label: isPublic ? 'Published (Public)' : 'Published (Private)'
      };
    case 'draft':
      return {
        color: 'text-gray-500',
        label: 'Draft'
      };
    default:
      return { color: 'text-gray-500', label: 'Unknown' };
  }
};

export const generatePostId = () => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

export const searchPosts = (posts, query) => {
  if (!query.trim()) return posts;
  const searchTerm = query.toLowerCase();
  return posts.filter(post => 
    post.title.toLowerCase().includes(searchTerm) ||
    stripHtmlTags(post.content).toLowerCase().includes(searchTerm) ||
    post.tags.some(tag => tag.toLowerCase().includes(searchTerm))
  );
};

export const filterPostsByStatus = (posts, status) => {
  if (status === 'all') return posts;
  return posts.filter(post => post.status === status);
};
