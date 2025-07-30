import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PublishedBlog from './components/PublishedBlog';
import AppOrchestrator from './components/AppOrchestrator';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublishedBlog />} />
        <Route path="/post/:id" element={<PublishedBlog />} />
        <Route path="/archive/:year" element={<PublishedBlog />} />
        <Route path="/archive/:year/:month" element={<PublishedBlog />} />
        <Route path="/tag/:tagname" element={<PublishedBlog />} />
        <Route path="/admin" element={<AppOrchestrator />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;