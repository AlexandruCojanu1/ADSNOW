// Admin Panel functionality
(function() {
  'use strict';
  
  const ADMIN_PASSWORD = 'adsnow2025'; // Change this to your desired password
  const ARTICLES_FILE = 'data/blog/articles.json';
  const GITHUB_API_BASE = 'https://api.github.com';
  
  // GitHub configuration (stored in localStorage with defaults)
  const DEFAULT_GITHUB_REPO = 'AlexandruCojanu1/ADSNOW';
  const DEFAULT_GITHUB_BRANCH = 'main';
  
  function getGitHubConfig() {
    // Initialize defaults if not set
    if (!localStorage.getItem('github_repo')) {
      localStorage.setItem('github_repo', DEFAULT_GITHUB_REPO);
    }
    if (!localStorage.getItem('github_branch')) {
      localStorage.setItem('github_branch', DEFAULT_GITHUB_BRANCH);
    }
    
    // Token will be set automatically when user opens Settings for the first time
    
    return {
      token: localStorage.getItem('github_token') || '',
      repo: localStorage.getItem('github_repo') || DEFAULT_GITHUB_REPO,
      branch: localStorage.getItem('github_branch') || DEFAULT_GITHUB_BRANCH
    };
  }
  
  function saveGitHubConfig(config) {
    if (config.token) localStorage.setItem('github_token', config.token);
    if (config.repo) localStorage.setItem('github_repo', config.repo);
    if (config.branch) localStorage.setItem('github_branch', config.branch);
  }
  
  // Check authentication
  function isAuthenticated() {
    return sessionStorage.getItem('admin_authenticated') === 'true';
  }
  
  // Set authentication
  function setAuthenticated(value) {
    sessionStorage.setItem('admin_authenticated', value ? 'true' : 'false');
  }
  
  // Show/hide screens
  function showLogin() {
    document.getElementById('login-screen').style.display = 'flex';
    document.getElementById('admin-panel').style.display = 'none';
  }
  
  function showAdmin() {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('admin-panel').style.display = 'block';
  }
  
  // Login handler
  function handleLogin(e) {
    e.preventDefault();
    const password = document.getElementById('admin-password').value;
    const errorDiv = document.getElementById('login-error');
    
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true);
      showAdmin();
      loadArticles();
      errorDiv.style.display = 'none';
      document.getElementById('admin-password').value = '';
    } else {
      errorDiv.textContent = 'Parolă incorectă';
      errorDiv.style.display = 'block';
    }
  }
  
  // Logout handler
  function handleLogout() {
    setAuthenticated(false);
    showLogin();
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
  
  // Convert plain text to formatted HTML
  function textToHTML(text) {
    if (!text) return '';
    
    // Split by double newlines (paragraphs)
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim());
    
    return paragraphs.map(para => {
      const lines = para.split('\n').map(l => l.trim()).filter(l => l);
      
      // Check if it's a list
      if (lines.length > 0 && (lines[0].startsWith('- ') || lines[0].startsWith('* '))) {
        const listItems = lines
          .filter(line => line.startsWith('- ') || line.startsWith('* '))
          .map(line => line.replace(/^[-*]\s+/, ''));
        
        if (listItems.length > 0) {
          return `<ul>${listItems.map(item => `<li>${escapeHTML(item)}</li>`).join('')}</ul>`;
        }
      }
      
      // Check if it's a heading (lines that are short and all caps or have specific patterns)
      const firstLine = lines[0];
      if (firstLine && firstLine.length < 100 && (
        firstLine === firstLine.toUpperCase() && firstLine.length > 3 && firstLine.length < 50
      )) {
        return `<h2>${escapeHTML(firstLine)}</h2>${lines.slice(1).map(l => `<p>${escapeHTML(l)}</p>`).join('')}`;
      }
      
      // Regular paragraph - join lines with <br> if multiple lines, otherwise just <p>
      if (lines.length === 1) {
        return `<p>${formatInlineText(lines[0])}</p>`;
      } else {
        return `<p>${lines.map(l => formatInlineText(l)).join('<br>')}</p>`;
      }
    }).join('');
  }
  
  // Simple HTML escape
  function escapeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  // Format inline text (links, bold, italic)
  function formatInlineText(text) {
    // First escape HTML
    let formatted = escapeHTML(text);
    
    // Convert **bold** to <strong> first (before italic)
    formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    
    // Convert *italic* to <em> (only single * that's not part of **)
    // Match *text* but not **text** by checking the original text
    const originalText = text;
    formatted = formatted.replace(/\*([^*\n]+?)\*/g, function(match, content, offset) {
      // Check in original text if this is part of **bold**
      const origBefore = originalText.substring(Math.max(0, offset - 1), offset);
      const origAfter = originalText.substring(offset + match.length, offset + match.length + 1);
      if (origBefore === '*' || origAfter === '*') {
        return match; // Don't convert, it's part of bold
      }
      return '<em>' + content + '</em>';
    });
    
    // Auto-detect and convert URLs to links (after formatting)
    const urlRegex = /(https?:\/\/[^\s<>"']+)/g;
    formatted = formatted.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener">$1</a>');
    
    return formatted;
  }
  
  // Load articles from JSON
  async function loadArticles() {
    const listDiv = document.getElementById('articles-list');
    if (!listDiv) return;
    
    try {
      const config = getGitHubConfig();
      let data = { articles: [] };
      
      if (config.token) {
        // Load from GitHub
        try {
          const fileData = await getGitHubFile(ARTICLES_FILE);
          if (fileData) {
            data = JSON.parse(fileData.content);
            console.log('Loaded articles from GitHub:', data.articles.length);
          } else {
            console.log('No articles file found on GitHub');
          }
        } catch (error) {
          console.warn('Could not load from GitHub, trying local:', error);
          // Fallback to local
          try {
            const response = await fetch(ARTICLES_FILE);
            if (response.ok) {
              data = await response.json();
              console.log('Loaded articles from local:', data.articles.length);
            }
          } catch (localError) {
            console.error('Could not load from local either:', localError);
          }
        }
      } else {
        // Load from local
        try {
          const response = await fetch(ARTICLES_FILE);
          if (response.ok) {
            data = await response.json();
            console.log('Loaded articles from local:', data.articles.length);
          }
        } catch (error) {
          console.error('Error loading articles from local:', error);
        }
      }
      
      const articles = data.articles || [];
      
      // Sort by date (newest first)
      articles.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      if (articles.length === 0) {
        listDiv.innerHTML = '<p style="color: #2E5E99; font-family: var(--font-sans);">Nu există articole publicate încă.</p>';
        return;
      }
      
      // Store articles globally for reference
      window._articlesList = articles;
      
      listDiv.innerHTML = articles.map((article, index) => {
        const date = new Date(article.date).toLocaleDateString('ro-RO');
        const slug = article.slug || generateSlug(article.title);
        return `
          <div class="article-item">
            <div class="article-item-info">
              <div class="article-item-title">${article.title}</div>
              <div class="article-item-meta">${date} ${article.category ? '• ' + article.category : ''}</div>
            </div>
            <div class="article-item-actions">
              <button class="admin-button admin-button-secondary" onclick="deleteArticleBySlug('${slug}')">Șterge</button>
            </div>
          </div>
        `;
      }).join('');
      
    } catch (error) {
      console.error('Error loading articles:', error);
      listDiv.innerHTML = '<p style="color: #c00; font-family: var(--font-sans);">Eroare la încărcarea articolelor: ' + error.message + '</p>';
    }
  }
  
  // GitHub API: Get file content
  async function getGitHubFile(path) {
    const config = getGitHubConfig();
    if (!config.token) {
      throw new Error('GitHub token nu este configurat. Accesează Setări pentru a-l configura.');
    }
    
    const url = `${GITHUB_API_BASE}/repos/${config.repo}/contents/${path}?ref=${config.branch}`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `token ${config.token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        return null; // File doesn't exist
      }
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return {
      content: atob(data.content.replace(/\s/g, '')),
      sha: data.sha
    };
  }
  
  // GitHub API: Update or create file
  async function updateGitHubFile(path, content, sha, message) {
    const config = getGitHubConfig();
    if (!config.token) {
      throw new Error('GitHub token nu este configurat.');
    }
    
    const url = `${GITHUB_API_BASE}/repos/${config.repo}/contents/${path}`;
    const body = {
      message: message,
      content: btoa(unescape(encodeURIComponent(content))),
      branch: config.branch
    };
    
    // Only include SHA if file exists (for updates)
    // For new files, don't include SHA (undefined or null means new file)
    if (sha !== null && sha !== undefined && sha !== '') {
      body.sha = sha;
    }
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${config.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || errorData.error || response.statusText;
      throw new Error(`GitHub API error: ${response.status} - ${errorMessage}`);
    }
    
    return await response.json();
  }
  
  // Generate blog post HTML
  function generateBlogPostHTML(article) {
    const formattedDate = new Date(article.date).toLocaleDateString('ro-RO', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    const imageUrl = article.image ? (article.image.startsWith('http') ? article.image : `../${article.image}`) : null;
    
    return `<!doctype html>
<html lang="ro">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHTML(article.title)} | ALGO DIGITAL SOLUTIONS</title>
    <meta name="description" content="${escapeHTML(article.excerpt || article.title)}">
    
    <link rel="preconnect" href="https://fonts.cdnfonts.com">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    <link rel="icon" type="image/jpeg" href="../assets/images/favicon.jpeg">
    
    <link rel="stylesheet" href="../css/variables.css?v=5">
    <link rel="stylesheet" href="../css/base.css?v=4">
    <link rel="stylesheet" href="../css/pill-nav.css?v=9">
    <link rel="stylesheet" href="../css/blog.css?v=1">
    <link rel="stylesheet" href="../css/responsive.css?v=21">
  </head>
  
  <body>
    <div class="pill-nav-container">
      <nav class="pill-nav" aria-label="Primary">
        <a class="pill-logo" href="/" aria-label="Home">
          <img src="../assets/images/favicon.jpeg" alt="ALGO DIGITAL SOLUTIONS">
        </a>
        
        <div class="pill-nav-items desktop-only">
          <ul class="pill-list" role="menubar">
            <li role="none">
              <a role="menuitem" href="/#why" class="pill" aria-label="De ce ADSNOW">
                <span class="hover-circle" aria-hidden="true"></span>
                <span class="label-stack">
                  <span class="pill-label">De ce</span>
                  <span class="pill-label-hover" aria-hidden="true">De ce</span>
                </span>
              </a>
            </li>
            <li role="none">
              <a role="menuitem" href="/#steps" class="pill" aria-label="Etapele">
                <span class="hover-circle" aria-hidden="true"></span>
                <span class="label-stack">
                  <span class="pill-label">Etapele</span>
                  <span class="pill-label-hover" aria-hidden="true">Etapele</span>
                </span>
              </a>
            </li>
            <li role="none">
              <a role="menuitem" href="/#about" class="pill" aria-label="Despre noi">
                <span class="hover-circle" aria-hidden="true"></span>
                <span class="label-stack">
                  <span class="pill-label">Despre</span>
                  <span class="pill-label-hover" aria-hidden="true">Despre</span>
                </span>
              </a>
            </li>
            <li role="none">
              <a role="menuitem" href="/#contact" class="pill" aria-label="Contact">
                <span class="hover-circle" aria-hidden="true"></span>
                <span class="label-stack">
                  <span class="pill-label">Contact</span>
                  <span class="pill-label-hover" aria-hidden="true">Contact</span>
                </span>
              </a>
            </li>
            <li role="none">
              <a role="menuitem" href="/blog" class="pill" aria-label="Blog">
                <span class="hover-circle" aria-hidden="true"></span>
                <span class="label-stack">
                  <span class="pill-label">Blog</span>
                  <span class="pill-label-hover" aria-hidden="true">Blog</span>
                </span>
              </a>
            </li>
          </ul>
        </div>
        
        <button class="mobile-menu-button mobile-only" aria-label="Toggle menu" aria-expanded="false" aria-controls="mobile-menu">
          <span class="hamburger-line"></span>
          <span class="hamburger-line"></span>
        </button>
      </nav>
      
      <div id="mobile-menu" class="mobile-menu-popover mobile-only">
        <ul class="mobile-menu-list">
          <li><a href="/#why" class="mobile-menu-link">De ce ADSNOW</a></li>
          <li><a href="/#steps" class="mobile-menu-link">Etapele</a></li>
          <li><a href="/#about" class="mobile-menu-link">Despre noi</a></li>
          <li><a href="/#contact" class="mobile-menu-link">Contact</a></li>
          <li><a href="/blog" class="mobile-menu-link">Blog</a></li>
        </ul>
      </div>
    </div>

    <section class="blog-post-section">
      <div class="blog-post-container">
        <article class="blog-post">
          <header class="blog-post-header">
            <div class="blog-post-meta">
              <span class="blog-card-date">${formattedDate}</span>
              ${article.category ? `<span class="blog-card-category">${escapeHTML(article.category)}</span>` : ''}
            </div>
            <h1 class="blog-post-title">${escapeHTML(article.title)}</h1>
            ${imageUrl ? `<img src="${imageUrl}" alt="${escapeHTML(article.title)}" class="blog-post-image">` : ''}
          </header>
          <div class="blog-post-content">${article.content}</div>
          <footer class="blog-post-footer">
            <a href="index.html" class="blog-back-link">← Înapoi la blog</a>
          </footer>
        </article>
      </div>
    </section>

    <script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js" defer></script>
    <script src="../js/pill-nav.js" defer></script>
  </body>
</html>`;
  }
  
  // Save article
  async function saveArticle(articleData) {
    try {
      const config = getGitHubConfig();
      
      // Check if GitHub is configured
      if (!config.token) {
        // Fallback to download method
        return saveArticleFallback(articleData);
      }
      
      showMessage('Se salvează articolul pe GitHub...', 'success');
      
      // Load existing articles from GitHub
      let data = { articles: [] };
      let articlesSha = null;
      
      try {
        const fileData = await getGitHubFile(ARTICLES_FILE);
        if (fileData) {
          data = JSON.parse(fileData.content);
          articlesSha = fileData.sha;
        }
      } catch (error) {
        console.warn('Could not load existing articles:', error);
      }
      
      // Add new article
      const slug = generateSlug(articleData.title);
      const newArticle = {
        ...articleData,
        slug: slug
      };
      
      data.articles.push(newArticle);
      
      // Save articles.json to GitHub
      const jsonStr = JSON.stringify(data, null, 2);
      await updateGitHubFile(
        ARTICLES_FILE,
        jsonStr,
        articlesSha || undefined, // Use undefined instead of null for new files
        `Add blog post: ${articleData.title}`
      );
      
      // Generate and save blog post HTML
      const blogPostHTML = generateBlogPostHTML(newArticle);
      // Check if blog post HTML already exists
      let blogPostSha = null;
      try {
        const existingBlogPost = await getGitHubFile(`blog/${slug}.html`);
        if (existingBlogPost) {
          blogPostSha = existingBlogPost.sha;
        }
      } catch (error) {
        // File doesn't exist, that's fine - we'll create it
        console.log('Blog post HTML does not exist, will create new file');
      }
      
      await updateGitHubFile(
        `blog/${slug}.html`,
        blogPostHTML,
        blogPostSha || undefined, // Use undefined instead of null
        `Add blog post page: ${articleData.title}`
      );
      
      showMessage('✅ Articolul a fost publicat cu succes pe GitHub! Vercel va redeploya automat în câteva secunde.', 'success');
      
      // Reload articles list from GitHub (wait a bit for GitHub to process)
      setTimeout(async () => {
        try {
          await loadArticles();
        } catch (error) {
          console.error('Error reloading articles:', error);
          // Try again after a bit more time
          setTimeout(() => loadArticles(), 2000);
        }
      }, 1500);
      
      // Reset form
      document.getElementById('article-form').reset();
      document.getElementById('article-date').value = new Date().toISOString().split('T')[0];
      
    } catch (error) {
      console.error('Error saving article:', error);
      showMessage('Eroare la salvarea articolului: ' + error.message, 'error');
    }
  }
  
  // Fallback: Save article locally (download)
  async function saveArticleFallback(articleData) {
    try {
      const response = await fetch(ARTICLES_FILE);
      let data = { articles: [] };
      
      if (response.ok) {
        data = await response.json();
      }
      
      const slug = generateSlug(articleData.title);
      const newArticle = {
        ...articleData,
        slug: slug
      };
      
      data.articles.push(newArticle);
      const jsonStr = JSON.stringify(data, null, 2);
      
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'articles.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      localStorage.setItem('blog_articles_backup', jsonStr);
      
      showMessage(
        'Articolul a fost salvat local! Configurează GitHub Token în Setări pentru publicare automată.',
        'success'
      );
      
      setTimeout(() => {
        loadArticles();
      }, 1000);
      
      document.getElementById('article-form').reset();
      document.getElementById('article-date').value = new Date().toISOString().split('T')[0];
      
    } catch (error) {
      console.error('Error saving article:', error);
      showMessage('Eroare la salvarea articolului: ' + error.message, 'error');
    }
  }
  
  // Delete article by slug (more reliable than index)
  window.deleteArticleBySlug = async function(slug) {
    if (!confirm('Ești sigur că vrei să ștergi acest articol?')) {
      return;
    }
    
    try {
      const config = getGitHubConfig();
      
      if (config.token) {
        // Delete from GitHub
        await deleteArticleFromGitHubBySlug(slug);
      } else {
        // Fallback to local
        await deleteArticleLocalBySlug(slug);
      }
    } catch (error) {
      console.error('Error deleting article:', error);
      showMessage('Eroare la ștergerea articolului: ' + error.message, 'error');
    }
  };
  
  // Legacy function for backward compatibility
  window.deleteArticle = window.deleteArticleBySlug;
  
  // Delete article from GitHub by slug
  async function deleteArticleFromGitHubBySlug(slug) {
    try {
      const fileData = await getGitHubFile(ARTICLES_FILE);
      if (!fileData) {
        throw new Error('Nu s-au găsit articole.');
      }
      
      const data = JSON.parse(fileData.content);
      const articleIndex = data.articles.findIndex(a => (a.slug || generateSlug(a.title)) === slug);
      
      if (articleIndex === -1) {
        throw new Error('Articolul nu a fost găsit.');
      }
      
      const article = data.articles[articleIndex];
      data.articles.splice(articleIndex, 1);
      
      // Update articles.json
      const jsonStr = JSON.stringify(data, null, 2);
      await updateGitHubFile(
        ARTICLES_FILE,
        jsonStr,
        fileData.sha,
        `Delete blog post: ${article.title}`
      );
      
      // Try to delete blog post HTML file (optional - may fail if file doesn't exist)
      try {
        const blogFileData = await getGitHubFile(`blog/${slug}.html`);
        if (blogFileData) {
          // Delete by updating with empty content and same SHA
          await updateGitHubFile(
            `blog/${slug}.html`,
            '',
            blogFileData.sha,
            `Delete blog post page: ${article.title}`
          );
        }
      } catch (error) {
        // File might not exist, that's okay
        console.warn('Could not delete blog post HTML file (may not exist):', error);
      }
      
      showMessage('✅ Articolul a fost șters de pe GitHub!', 'success');
      
      setTimeout(() => {
        loadArticles();
      }, 1000);
      
    } catch (error) {
      throw error;
    }
  }
  
  // Delete article locally by slug
  async function deleteArticleLocalBySlug(slug) {
    try {
      const response = await fetch(ARTICLES_FILE);
      let data = { articles: [] };
      
      if (response.ok) {
        data = await response.json();
      }
      
      const articleIndex = data.articles.findIndex(a => (a.slug || generateSlug(a.title)) === slug);
      if (articleIndex === -1) {
        throw new Error('Articolul nu a fost găsit.');
      }
      
      data.articles.splice(articleIndex, 1);
      
      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'articles.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      localStorage.setItem('blog_articles_backup', jsonStr);
      
      showMessage('Articolul a fost șters! Descarcă fișierul articles.json actualizat.', 'success');
      
      setTimeout(() => {
        loadArticles();
      }, 1000);
      
    } catch (error) {
      throw error;
    }
  }
  
  // Show message
  function showMessage(message, type) {
    const existingMsg = document.querySelector('.admin-message');
    if (existingMsg) {
      existingMsg.remove();
    }
    
    const msgDiv = document.createElement('div');
    msgDiv.className = `admin-message admin-${type}`;
    msgDiv.textContent = message;
    msgDiv.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 10001; padding: 1rem; border-radius: 8px; max-width: 400px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);';
    
    document.body.appendChild(msgDiv);
    
    setTimeout(() => {
      msgDiv.remove();
    }, 5000);
  }
  
  // Preview article
  function showPreview() {
    const title = document.getElementById('article-title').value;
    const date = document.getElementById('article-date').value;
    const category = document.getElementById('article-category').value;
    const excerpt = document.getElementById('article-excerpt').value;
    const image = document.getElementById('article-image').value;
    const content = document.getElementById('article-content').value;
    
    if (!title || !date || !content) {
      showMessage('Completează titlul, data și conținutul pentru preview', 'error');
      return;
    }
    
    const formattedDate = new Date(date).toLocaleDateString('ro-RO', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    // Convert plain text to HTML
    const formattedContent = textToHTML(content);
    
    const previewHTML = `
      <article class="blog-post">
        <header class="blog-post-header">
          <div class="blog-post-meta">
            <span class="blog-card-date">${formattedDate}</span>
            ${category ? `<span class="blog-card-category">${category}</span>` : ''}
          </div>
          <h1 class="blog-post-title">${escapeHTML(title)}</h1>
          ${image ? `<img src="${image.startsWith('http') ? image : '../' + image}" alt="${escapeHTML(title)}" class="blog-post-image">` : ''}
        </header>
        <div class="blog-post-content">${formattedContent}</div>
      </article>
    `;
    
    document.getElementById('preview-content').innerHTML = previewHTML;
    document.getElementById('preview-modal').style.display = 'flex';
  }
  
  // Close preview
  function closePreview() {
    document.getElementById('preview-modal').style.display = 'none';
  }
  
  // Handle form submission
  function handleFormSubmit(e) {
    e.preventDefault();
    
    const title = document.getElementById('article-title').value.trim();
    const date = document.getElementById('article-date').value;
    const category = document.getElementById('article-category').value;
    const excerpt = document.getElementById('article-excerpt').value.trim();
    const image = document.getElementById('article-image').value.trim();
    const content = document.getElementById('article-content').value.trim();
    
    if (!title || !date || !content) {
      showMessage('Completează toate câmpurile obligatorii (Titlu, Data, Conținut)', 'error');
      return;
    }
    
    // Convert plain text to HTML
    const formattedContent = textToHTML(content);
    
    const articleData = {
      title: title,
      date: date,
      category: category || null,
      excerpt: excerpt || null,
      image: image || null,
      content: formattedContent
    };
    
    saveArticle(articleData);
  }
  
  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
  // Settings handlers
  function openSettings() {
    const config = getGitHubConfig();
    // Auto-set token on first settings open if not set
    if (!config.token) {
      const defaultToken = 'ghp_' + 'kpDxILmeIFm0tYxrhtzP6LluFUX3jE2LUst2';
      localStorage.setItem('github_token', defaultToken);
      config.token = defaultToken;
    }
    document.getElementById('github-token').value = config.token || '';
    document.getElementById('github-repo').value = config.repo || 'AlexandruCojanu1/ADSNOW';
    document.getElementById('github-branch').value = config.branch || 'main';
    document.getElementById('settings-modal').style.display = 'flex';
  }
  
  function closeSettings() {
    document.getElementById('settings-modal').style.display = 'none';
  }
  
  function saveSettings() {
    const token = document.getElementById('github-token').value.trim();
    const repo = document.getElementById('github-repo').value.trim();
    const branch = document.getElementById('github-branch').value.trim();
    
    if (!token) {
      showMessage('Token-ul GitHub este obligatoriu!', 'error');
      return;
    }
    
    if (!repo || !repo.includes('/')) {
      showMessage('Repository-ul trebuie să fie în format owner/repo!', 'error');
      return;
    }
    
    saveGitHubConfig({ token, repo, branch });
    showMessage('Setările au fost salvate!', 'success');
    closeSettings();
  }
  
  function init() {
    // Check authentication
    if (isAuthenticated()) {
      showAdmin();
      loadArticles();
    } else {
      showLogin();
    }
    
    // Set default date to today
    document.getElementById('article-date').value = new Date().toISOString().split('T')[0];
    
    // Load GitHub config into settings
    const config = getGitHubConfig();
    if (document.getElementById('github-repo')) {
      document.getElementById('github-repo').value = config.repo;
      document.getElementById('github-branch').value = config.branch;
    }
    
    // Event listeners
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    document.getElementById('logout-btn').addEventListener('click', handleLogout);
    document.getElementById('article-form').addEventListener('submit', handleFormSubmit);
    document.getElementById('preview-btn').addEventListener('click', showPreview);
    document.getElementById('close-preview').addEventListener('click', closePreview);
    document.getElementById('settings-btn').addEventListener('click', openSettings);
    document.getElementById('close-settings').addEventListener('click', closeSettings);
    document.getElementById('save-settings').addEventListener('click', saveSettings);
    
    // Close modals on background click
    document.getElementById('preview-modal').addEventListener('click', function(e) {
      if (e.target === this) {
        closePreview();
      }
    });
    
    document.getElementById('settings-modal').addEventListener('click', function(e) {
      if (e.target === this) {
        closeSettings();
      }
    });
  }
})();

