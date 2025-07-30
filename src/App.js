import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PublishedBlog from './components/PublishedBlog';
import AppOrchestrator from './components/AppOrchestrator';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Admin Route - DEFAULT (Dashboard/Editor) */}
        <Route path="/" element={<AppOrchestrator />} />
        
        {/* Blog Routes - Public */}
        <Route path="/blog" element={<PublishedBlog />} />
        <Route path="/blog/post/:id" element={<PublishedBlog />} />
        <Route path="/blog/archive/:year" element={<PublishedBlog />} />
        <Route path="/blog/archive/:year/:month" element={<PublishedBlog />} />
        <Route path="/blog/tag/:tagname" element={<PublishedBlog />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

