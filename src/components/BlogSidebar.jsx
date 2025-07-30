import React from 'react';
import { Link } from 'react-router-dom';

const BlogSidebar = ({ archiveData, tagData }) => {
  return (
    <aside className="blog-sidebar">
      {/* Archives Section */}
      <section className="blog-sidebar-section">
        <h3 className="blog-sidebar-title">Archives</h3>
        <div className="blog-archive-list">
          {Object.keys(archiveData).length === 0 ? (
            <p className="blog-sidebar-empty">No archives yet</p>
          ) : (
            Object.entries(archiveData)
              .sort(([a], [b]) => parseInt(b) - parseInt(a)) // Sort years descending
              .map(([year, months]) => (
                <div key={year} className="blog-archive-year">
                  <h4 className="blog-archive-year-title">
                    {/* UPDATED: Archive year link includes /blog prefix */}
                    <Link to={`/blog/archive/${year}`} className="blog-archive-year-link">
                      {year}
                    </Link>
                  </h4>
                  <ul className="blog-archive-months">
                    {Object.entries(months)
                      .sort(([a], [b]) => {
                        // Sort months chronologically (newest first)
                        const monthOrder = [
                          'January', 'February', 'March', 'April', 'May', 'June',
                          'July', 'August', 'September', 'October', 'November', 'December'
                        ];
                        return monthOrder.indexOf(b) - monthOrder.indexOf(a);
                      })
                      .map(([month, count]) => (
                        <li key={month} className="blog-archive-month">
                          {/* UPDATED: Archive month link includes /blog prefix */}
                          <Link 
                            to={`/blog/archive/${year}/${month.toLowerCase()}`}
                            className="blog-archive-month-link"
                          >
                            {month} ({count})
                          </Link>
                        </li>
                      ))}
                  </ul>
                </div>
              ))
          )}
        </div>
      </section>

      {/* Tags Section */}
      <section className="blog-sidebar-section">
        <h3 className="blog-sidebar-title">Tags</h3>
        <div className="blog-tag-cloud">
          {Object.keys(tagData).length === 0 ? (
            <p className="blog-sidebar-empty">No tags yet</p>
          ) : (
            Object.entries(tagData)
              .sort(([,a], [,b]) => b - a) // Sort by count descending
              .map(([tag, count]) => (
                /* UPDATED: Tag links include /blog prefix */
                <Link 
                  key={tag} 
                  to={`/blog/tag/${encodeURIComponent(tag)}`}
                  className="blog-tag-link"
                  title={`${count} post${count === 1 ? '' : 's'}`}
                >
                  {tag} ({count})
                </Link>
              ))
          )}
        </div>
      </section>
    </aside>
  );
};

export default BlogSidebar;

