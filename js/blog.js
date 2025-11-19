// Blog functionality
(function() {
  'use strict';
  
  const ARTICLES_FILE = '../data/blog/articles.json';
  
  // Format date
  function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('ro-RO', options);
  }
  
  // Generate slug from title
  function generateSlug(title) {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  
  // Load and display blog posts
  async function loadBlogPosts() {
    const grid = document.getElementById('blog-grid');
    if (!grid) return;
    
    try {
      // Try multiple paths to find articles.json
      let data = { articles: [] };
      let loaded = false;
      
      // Try absolute path first (works better on Vercel)
      const pathsToTry = [
        '/data/blog/articles.json?v=' + Date.now(), // Absolute with cache busting
        '/data/blog/articles.json', // Absolute
        '../data/blog/articles.json?v=' + Date.now(), // Relative with cache busting
        '../data/blog/articles.json', // Relative
        'data/blog/articles.json?v=' + Date.now(), // No leading slash
        'data/blog/articles.json' // No leading slash
      ];
      
      for (const path of pathsToTry) {
        if (loaded) break;
        
        try {
          const response = await fetch(path);
          if (response.ok) {
            const jsonData = await response.json();
            if (jsonData && jsonData.articles) {
              data = jsonData;
              loaded = true;
              console.log('✅ Loaded articles from:', path, '- Found', data.articles.length, 'articles');
              break;
            }
          }
        } catch (error) {
          console.warn('Could not load from', path, ':', error.message);
        }
      }
      
      const articles = data.articles || [];
      
      // Sort by date (newest first)
      articles.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      if (articles.length === 0) {
        grid.innerHTML = '<div class="blog-empty">Nu există articole publicate încă.</div>';
        return;
      }
      
      console.log(`Displaying ${articles.length} articles`);
      
      grid.innerHTML = articles.map(article => {
        const slug = article.slug || generateSlug(article.title);
        const imageUrl = article.image ? (article.image.startsWith('http') ? article.image : `../${article.image}`) : '../assets/images/favicon.jpeg';
        // Clean HTML tags from excerpt
        const excerptText = article.excerpt || (article.content ? article.content.replace(/<[^>]*>/g, '').substring(0, 150) + '...' : '');
        
        return `
          <a href="${slug}.html" class="blog-card">
            <img src="${imageUrl}" alt="${article.title}" class="blog-card-image" loading="lazy" onerror="this.src='../assets/images/favicon.jpeg'">
            <div class="blog-card-content">
              <div class="blog-card-meta">
                <span class="blog-card-date">${formatDate(article.date)}</span>
                ${article.category ? `<span class="blog-card-category">${article.category}</span>` : ''}
              </div>
              <h2 class="blog-card-title">${article.title}</h2>
              <p class="blog-card-excerpt">${excerptText}</p>
            </div>
          </a>
        `;
      }).join('');
      
    } catch (error) {
      console.error('Error loading blog posts:', error);
      grid.innerHTML = '<div class="blog-empty">Eroare la încărcarea articolelor: ' + error.message + '</div>';
    }
  }
  
  // Escape HTML helper
  function escapeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  // Load blog post content
  async function loadBlogPost() {
    const container = document.querySelector('.blog-post-container');
    if (!container) return;
    
    // Get slug from URL
    const path = window.location.pathname;
    const slug = path.split('/').pop().replace('.html', '');
    
    try {
      // Try multiple paths to find articles.json
      let data = { articles: [] };
      let loaded = false;
      
      // Try multiple paths
      const pathsToTry = [
        '/data/blog/articles.json?v=' + Date.now(), // Absolute with cache busting
        '/data/blog/articles.json', // Absolute
        '../data/blog/articles.json?v=' + Date.now(), // Relative with cache busting
        '../data/blog/articles.json', // Relative
        'data/blog/articles.json?v=' + Date.now(), // No leading slash
        'data/blog/articles.json' // No leading slash
      ];
      
      for (const path of pathsToTry) {
        if (loaded) break;
        
        try {
          const response = await fetch(path);
          if (response.ok) {
            const jsonData = await response.json();
            if (jsonData && jsonData.articles) {
              data = jsonData;
              loaded = true;
              console.log('✅ Loaded articles from:', path);
              break;
            }
          }
        } catch (error) {
          console.warn('Could not load from', path, ':', error.message);
        }
      }
      
      const articles = data.articles || [];
      const article = articles.find(a => (a.slug || generateSlug(a.title)) === slug);
      
      if (!article) {
        container.innerHTML = '<div class="blog-empty">Articolul nu a fost găsit. Slug: ' + slug + '</div>';
        return;
      }
      
      const imageUrl = article.image ? (article.image.startsWith('http') ? article.image : `../${article.image}`) : null;
      
      container.innerHTML = `
        <article class="blog-post">
          <header class="blog-post-header">
            <div class="blog-post-meta">
              <span class="blog-card-date">${formatDate(article.date)}</span>
              ${article.category ? `<span class="blog-card-category">${escapeHTML(article.category)}</span>` : ''}
            </div>
            <h1 class="blog-post-title">${escapeHTML(article.title)}</h1>
            ${imageUrl ? `<img src="${imageUrl}" alt="${escapeHTML(article.title)}" class="blog-post-image" onerror="this.style.display='none'">` : ''}
          </header>
          <div class="blog-post-content">${article.content}</div>
          <footer class="blog-post-footer">
            <a href="index.html" class="blog-back-link">← Înapoi la blog</a>
          </footer>
        </article>
      `;
      
    } catch (error) {
      console.error('Error loading blog post:', error);
      container.innerHTML = '<div class="blog-empty">Eroare la încărcarea articolului: ' + error.message + '</div>';
    }
  }
  
  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      if (document.getElementById('blog-grid')) {
        loadBlogPosts();
      } else if (document.querySelector('.blog-post-container')) {
        loadBlogPost();
      }
    });
  } else {
    if (document.getElementById('blog-grid')) {
      loadBlogPosts();
    } else if (document.querySelector('.blog-post-container')) {
      loadBlogPost();
    }
  }
})();

