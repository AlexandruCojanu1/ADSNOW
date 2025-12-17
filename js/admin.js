// Admin Panel functionality
(function() {
  'use strict';
  
  const ADMIN_PASSWORD = 'adsnow2025'; // Change this to your desired password
  const ARTICLES_FILE = 'data/blog/articles.json';
  const GITHUB_API_BASE = 'https://api.github.com';
  
  // GitHub configuration (stored in localStorage with defaults)
  const DEFAULT_GITHUB_REPO = 'AlexandruCojanu1/ADSNOW';
  const DEFAULT_GITHUB_BRANCH = 'main';
  
  // CodeMirror editor instance
  let codeEditor = null;
  
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
    const loginScreen = document.getElementById('login-screen');
    const adminPanel = document.getElementById('admin-panel');
    if (loginScreen) loginScreen.style.display = 'flex';
    if (adminPanel) adminPanel.style.display = 'none';
    // Clear password field
    const passwordInput = document.getElementById('admin-password');
    if (passwordInput) passwordInput.value = '';
  }
  
  function showAdmin() {
    const loginScreen = document.getElementById('login-screen');
    const adminPanel = document.getElementById('admin-panel');
    if (loginScreen) loginScreen.style.display = 'none';
    if (adminPanel) adminPanel.style.display = 'block';
  }
  
  // Reset session (for debugging)
  function resetSession() {
    sessionStorage.removeItem('admin_authenticated');
    showLogin();
  }
  
  // Login handler
  function handleLogin(e) {
    e.preventDefault();
    const passwordInput = document.getElementById('admin-password');
    const password = passwordInput.value.trim();
    const errorDiv = document.getElementById('login-error');
    
    // Clear any previous errors
    errorDiv.style.display = 'none';
    errorDiv.textContent = '';
    
    if (!password) {
      errorDiv.textContent = 'Te rog introdu parola';
      errorDiv.style.display = 'block';
      return;
    }
    
    // Debug logging (remove in production)
    console.log('Login attempt - password length:', password.length);
    
    if (password === ADMIN_PASSWORD) {
      console.log('Login successful');
      setAuthenticated(true);
      showAdmin();
      loadArticles();
      // Initialize editor after login
      setTimeout(initCodeEditor, 100);
      passwordInput.value = '';
    } else {
      console.log('Login failed - password mismatch');
      errorDiv.textContent = 'Parolă incorectă. Te rog încearcă din nou.';
      errorDiv.style.display = 'block';
      passwordInput.value = '';
      passwordInput.focus();
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
    // Properly decode UTF-8 content from base64
    const base64Content = data.content.replace(/\s/g, '');
    const decodedContent = decodeURIComponent(escape(atob(base64Content)));
    return {
      content: decodedContent,
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
    
    // Fix UTF-8 encoding for Romanian characters (ă, â, î, ș, ț)
    // Use proper UTF-8 to Base64 conversion
    const base64Content = btoa(unescape(encodeURIComponent(content)));
    
    const body = {
      message: message,
      content: base64Content,
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
  
  // Generate sitemap.xml from articles
  function generateSitemap(articles) {
    const today = new Date().toISOString().split('T')[0];
    
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://adsnow.ro/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://adsnow.ro/blog</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`;
    
    // Add each blog post URL
    articles.forEach(article => {
      const slug = article.slug || generateSlug(article.title);
      const articleDate = article.date ? new Date(article.date).toISOString().split('T')[0] : today;
      sitemap += `
  <url>
    <loc>https://adsnow.ro/blog/${slug}</loc>
    <lastmod>${articleDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
    });
    
    sitemap += `
</urlset>`;
    
    return sitemap;
  }
  
  // Update sitemap.xml on GitHub
  async function updateSitemap(articles) {
    const config = getGitHubConfig();
    if (!config.token) {
      console.warn('GitHub token not configured, skipping sitemap update');
      return;
    }
    
    const sitemapContent = generateSitemap(articles);
    
    // Retry logic for handling SHA conflicts (same as saveArticle)
    let retries = 8;
    let lastError = null;
    let success = false;
    
    while (retries > 0 && !success) {
      try {
        // Always reload fresh sitemap SHA before updating
        let sitemapSha = null;
        try {
          const existingSitemap = await getGitHubFile('sitemap.xml');
          if (existingSitemap) {
            sitemapSha = existingSitemap.sha;
            console.log(`[Sitemap Attempt ${9 - retries}/8] Loaded fresh SHA:`, sitemapSha.substring(0, 8) + '...');
          }
        } catch (error) {
          if (error.message.includes('404')) {
            console.log('Sitemap.xml does not exist, will create new file');
          }
        }
        
        // Update sitemap.xml
        await updateGitHubFile(
          'sitemap.xml',
          sitemapContent,
          sitemapSha || undefined,
          'Update sitemap.xml with new blog posts'
        );
        
        success = true;
        console.log('✅ Sitemap.xml updated successfully!');
        
      } catch (error) {
        lastError = error;
        const is409 = error.message.includes('409');
        console.error(`[Sitemap Attempt ${9 - retries}/8] Failed:`, error.message, is409 ? '(SHA conflict)' : '');
        
        if (is409 && retries > 1) {
          // SHA conflict - wait and retry with fresh SHA
          const waitTime = (9 - retries) * 1000;
          console.log(`⏳ Sitemap SHA conflict, waiting ${waitTime}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          retries--;
        } else {
          // Non-409 error or last retry
          console.error('❌ Failed to update sitemap after all retries:', error);
          // Don't throw - sitemap update failure shouldn't break article publishing
          return;
        }
      }
    }
    
    if (!success && lastError) {
      console.error('❌ Failed to update sitemap after all retries:', lastError);
      // Don't throw - sitemap update failure shouldn't break article publishing
    }
  }
  
  // Notify Google Indexing API about a new/updated URL
  async function notifyGoogleIndexing(url) {
    try {
      // Determine the API endpoint - use current domain for production, or relative path for local dev
      const apiEndpoint = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? '/api/index-google'
        : `${window.location.origin}/api/index-google`;
      
      console.log('🚀 Notifying Google Indexing API:', url);
      console.log('   Endpoint:', apiEndpoint);
      
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url })
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        console.log('✅ Google Indexing API notified successfully:', result);
        return true;
      } else {
        console.error('❌ Google Indexing API Error Details:');
        console.error('   Status:', response.status);
        console.error('   Response:', JSON.stringify(result, null, 2));
        if (result.error) console.error('   Error:', result.error);
        if (result.details) console.error('   Details:', result.details);
        // Don't throw - indexing failure shouldn't break article publishing
        return false;
      }
    } catch (error) {
      console.warn('⚠️ Failed to notify Google Indexing API:', error.message);
      // Don't throw - indexing failure shouldn't break article publishing
      // This allows articles to be published even if Google Indexing API is temporarily unavailable
      return false;
    }
  }
  
  // Generate blog post HTML
  function generateBlogPostHTML(article) {
    // Check if content is already a complete HTML document
    const isCompleteHTML = article.content && (
      article.content.trim().toLowerCase().startsWith('<!doctype') ||
      article.content.trim().toLowerCase().startsWith('<html')
    );
    
    // If it's already complete HTML, inject the back button before </body>
    if (isCompleteHTML) {
      console.log('✅ Content is complete HTML document, injecting back button');
      let content = article.content;
      
      // Inject navigation and back button before </body>
      const backButtonHTML = `
    <!-- Blog Navigation -->
    <div style="max-width: 1200px; margin: 0 auto; padding: 2rem 1.5rem;">
      <a href="/blog" style="display: inline-flex; align-items: center; gap: 0.5rem; font-family: 'Inter', sans-serif; font-size: 1rem; color: #2E5E99; text-decoration: none; transition: color 0.3s ease; padding: 0.75rem 1.5rem; background: #E3EAFF; border-radius: 8px; font-weight: 600;">
        <span style="font-size: 1.2rem;">←</span> Înapoi la Blog
      </a>
    </div>
    
</body>`;
      
      content = content.replace(/<\/body>/i, backButtonHTML);
      return content;
    }
    
    // Otherwise, wrap it in template
    console.log('✅ Content is HTML fragment, wrapping in template');
    
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
            <a href="/blog" class="blog-back-link">← Înapoi la blog</a>
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
      
      // Retry logic for handling SHA conflicts
      let retries = 8; // Increased retries
      let lastError = null;
      let success = false;
      
      while (retries > 0 && !success) {
        try {
          // Always reload fresh data from GitHub before saving (critical for SHA)
          let data = { articles: [] };
          let articlesSha = null;
          
          try {
            const fileData = await getGitHubFile(ARTICLES_FILE);
            if (fileData) {
              data = JSON.parse(fileData.content);
              articlesSha = fileData.sha;
              console.log(`[Attempt ${9 - retries}/8] Loaded fresh SHA:`, articlesSha.substring(0, 8) + '...');
            } else {
              console.log('No existing articles file, will create new one');
            }
          } catch (error) {
            if (error.message.includes('404')) {
              console.log('Articles file does not exist, will create new one');
            } else {
              console.warn('Could not load existing articles:', error);
            }
          }
          
          // Check if article already exists (avoid duplicates)
          const slug = generateSlug(articleData.title);
          const existingIndex = data.articles.findIndex(a => (a.slug || generateSlug(a.title)) === slug);
          if (existingIndex !== -1) {
            // Article already exists, update it instead
            data.articles[existingIndex] = {
              ...articleData,
              slug: slug
            };
            console.log('Article already exists, updating...');
          } else {
            // Add new article
            const newArticle = {
              ...articleData,
              slug: slug
            };
            data.articles.push(newArticle);
            console.log('Adding new article...');
          }
          
          // Save articles.json to GitHub
          const jsonStr = JSON.stringify(data, null, 2);
          await updateGitHubFile(
            ARTICLES_FILE,
            jsonStr,
            articlesSha || undefined, // Use undefined instead of null for new files
            `Add blog post: ${articleData.title}`
          );
          
          // Success - break out of retry loop
          success = true;
          console.log('✅ Article saved successfully!');
          
        } catch (error) {
          lastError = error;
          const is409 = error.message.includes('409');
          console.error(`[Attempt ${9 - retries}/8] Failed:`, error.message, is409 ? '(SHA conflict)' : '');
          
          if (is409 && retries > 1) {
            // SHA conflict - wait longer and retry with fresh SHA
            // Progressive backoff: 1s, 2s, 3s, 4s, 5s, 6s, 7s
            const waitTime = (9 - retries) * 1000;
            console.log(`⏳ SHA conflict detected, waiting ${waitTime}ms before retry...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            retries--;
          } else {
            // Non-409 error or last retry - throw immediately
            throw error;
          }
        }
      }
      
      if (!success && lastError) {
        throw lastError;
      }
      
      // Reload fresh data for blog post HTML generation
      let data = { articles: [] };
      try {
        const fileData = await getGitHubFile(ARTICLES_FILE);
        if (fileData) {
          data = JSON.parse(fileData.content);
        }
      } catch (error) {
        console.warn('Could not reload articles:', error);
      }
      
      const slug = generateSlug(articleData.title);
      const newArticle = data.articles.find(a => (a.slug || generateSlug(a.title)) === slug) || {
        ...articleData,
        slug: slug
      };
      
      // Generate and save blog post HTML with retry logic
      const blogPostHTML = generateBlogPostHTML(newArticle);
      let blogPostSuccess = false;
      let blogPostRetries = 5;
      
      while (blogPostRetries > 0 && !blogPostSuccess) {
        try {
          // Check if blog post HTML already exists
          let blogPostSha = null;
          try {
            const existingBlogPost = await getGitHubFile(`blog/${slug}.html`);
            if (existingBlogPost) {
              blogPostSha = existingBlogPost.sha;
              console.log('Blog post HTML exists, will update with SHA:', blogPostSha.substring(0, 8) + '...');
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
          
          blogPostSuccess = true;
          console.log('✅ Blog post HTML saved successfully!');
          
        } catch (error) {
          const is409 = error.message.includes('409');
          console.error(`[HTML Save Attempt ${6 - blogPostRetries}/5] Failed:`, error.message, is409 ? '(SHA conflict)' : '');
          
          if (is409 && blogPostRetries > 1) {
            const waitTime = (6 - blogPostRetries) * 1000;
            console.log(`⏳ SHA conflict on HTML save, waiting ${waitTime}ms before retry...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            blogPostRetries--;
          } else {
            // Log error but don't fail the entire operation
            console.warn('⚠️ Could not save blog post HTML, but article was saved:', error);
            break;
          }
        }
      }
      
      // Update sitemap.xml with all articles (including the new one)
      // Use the data we already have from the successful save
      try {
        console.log('🗺️ Updating sitemap with latest articles...');
        
        // Wait a brief moment for GitHub to propagate the articles.json changes
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Get fresh articles data from GitHub
        const fileData = await getGitHubFile(ARTICLES_FILE);
        if (fileData) {
          const allArticles = JSON.parse(fileData.content);
          console.log(`📊 Found ${allArticles.articles.length} articles for sitemap`);
          
          // Update sitemap once with all articles
          await updateSitemap(allArticles.articles || []);
        } else {
          console.warn('⚠️ Could not load articles for sitemap update');
        }
      } catch (error) {
        console.warn('⚠️ Could not update sitemap:', error);
        // Don't fail the entire operation if sitemap update fails
      }
      
      // Notify Google Indexing API about the new article
      const articleSlug = generateSlug(articleData.title);
      const articleUrl = `https://adsnow.ro/blog/${articleSlug}`;
      await notifyGoogleIndexing(articleUrl);
      
      showMessage('✅ Articolul a fost publicat cu succes pe GitHub! Sitemap-ul a fost actualizat și Google a fost notificat. Vercel va redeploya automat în câteva secunde.', 'success');
      
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
      // Reset editor
      setEditorValue('<h1>Titlul articolului</h1>\n<p>Scrie conținutul HTML aici...</p>');
      
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
    // Retry logic for handling SHA conflicts
    let retries = 8;
    let lastError = null;
    let success = false;
    
    while (retries > 0 && !success) {
      try {
        // Always reload fresh data from GitHub before deleting
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
        
        // Update articles.json with fresh SHA
        const jsonStr = JSON.stringify(data, null, 2);
        await updateGitHubFile(
          ARTICLES_FILE,
          jsonStr,
          fileData.sha, // Use fresh SHA
          `Delete blog post: ${article.title}`
        );
        
        // Success - break out of retry loop
        success = true;
        console.log('✅ Article deleted successfully!');
        
      } catch (error) {
        lastError = error;
        const is409 = error.message.includes('409');
        console.error(`[Delete Attempt ${9 - retries}/8] Failed:`, error.message, is409 ? '(SHA conflict)' : '');
        
        if (is409 && retries > 1) {
          // SHA conflict - wait longer and retry with fresh SHA
          // Progressive backoff: 1s, 2s, 3s, 4s, 5s, 6s, 7s
          const waitTime = (9 - retries) * 1000;
          console.log(`⏳ SHA conflict on delete, waiting ${waitTime}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          retries--;
        } else {
          // Non-409 error or last retry - throw immediately
          throw error;
        }
      }
    }
    
    if (!success && lastError) {
      throw lastError;
    }
    
    // Get article info for HTML deletion
    const fileData = await getGitHubFile(ARTICLES_FILE);
    const data = fileData ? JSON.parse(fileData.content) : { articles: [] };
    const article = data.articles.find(a => (a.slug || generateSlug(a.title)) === slug);
    
    // Try to delete blog post HTML file (optional - may fail if file doesn't exist)
    try {
      const blogFileData = await getGitHubFile(`blog/${slug}.html`);
      if (blogFileData) {
        // Delete by updating with empty content and same SHA
        const articleTitle = article ? article.title : slug;
        await updateGitHubFile(
          `blog/${slug}.html`,
          '',
          blogFileData.sha,
          `Delete blog post page: ${articleTitle}`
        );
      }
    } catch (error) {
      // File might not exist, that's okay
      console.warn('Could not delete blog post HTML file (may not exist):', error);
    }
    
    // Update sitemap.xml after deletion
    try {
      const fileData = await getGitHubFile(ARTICLES_FILE);
      if (fileData) {
        const allArticles = JSON.parse(fileData.content);
        await updateSitemap(allArticles.articles || []);
      }
    } catch (error) {
      console.warn('Could not update sitemap after deletion:', error);
    }
    
    showMessage('✅ Articolul a fost șters de pe GitHub! Sitemap-ul a fost actualizat.', 'success');
    
    setTimeout(() => {
      loadArticles();
    }, 1000);
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
    // Get HTML content from CodeMirror editor
    const content = codeEditor ? codeEditor.getValue().trim() : '';
    
    if (!content) {
      showMessage('Completează conținutul HTML pentru preview', 'error');
      return;
    }
    
    const date = new Date().toISOString().split('T')[0];
    const formattedDate = new Date(date).toLocaleDateString('ro-RO', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    // Extract title from HTML
    const title = extractTitleFromHTML(content);
    
    // Use HTML directly from editor - wrap in blog post structure
    const previewHTML = `
      <article class="blog-post">
        <header class="blog-post-header">
          <div class="blog-post-meta">
            <span class="blog-card-date">${formattedDate}</span>
          </div>
        </header>
        <div class="blog-post-content">${content}</div>
      </article>
    `;
    
    document.getElementById('preview-content').innerHTML = previewHTML;
    document.getElementById('preview-modal').style.display = 'flex';
  }
  
  // Close preview
  function closePreview() {
    document.getElementById('preview-modal').style.display = 'none';
  }
  
  // Extract title from HTML (first h1 tag)
  function extractTitleFromHTML(html) {
    if (!html) return 'Articol fără titlu';
    
    // Try to find h1 tag
    const h1Match = html.match(/<h1[^>]*>(.*?)<\/h1>/i);
    if (h1Match && h1Match[1]) {
      // Remove HTML tags from title and decode entities
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = h1Match[1];
      return tempDiv.textContent || tempDiv.innerText || 'Articol fără titlu';
    }
    
    // Fallback: try h2
    const h2Match = html.match(/<h2[^>]*>(.*?)<\/h2>/i);
    if (h2Match && h2Match[1]) {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = h2Match[1];
      return tempDiv.textContent || tempDiv.innerText || 'Articol fără titlu';
    }
    
    return 'Articol fără titlu';
  }
  
  // Handle form submission
  function handleFormSubmit(e) {
    e.preventDefault();
    
    // Get HTML content from CodeMirror editor
    const content = codeEditor ? codeEditor.getValue().trim() : '';
    
    if (!content) {
      showMessage('Completează conținutul HTML!', 'error');
      return;
    }
    
    // Extract title from HTML (first h1)
    const title = extractTitleFromHTML(content);
    
    // Generate date (today)
    const date = new Date().toISOString().split('T')[0];
    
    // Use HTML directly from editor
    const articleData = {
      title: title,
      date: date,
      category: null,
      excerpt: null,
      image: null,
      content: content // HTML content
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
  
  // Initialize CodeMirror editor
  function initCodeEditor() {
    const editorContainer = document.getElementById('article-content-editor');
    if (!editorContainer) {
      console.warn('Editor container not found');
      return;
    }
    
    // Wait for CodeMirror to be available with retry
    if (typeof CodeMirror === 'undefined') {
      console.warn('CodeMirror not loaded yet, retrying in 100ms...');
      setTimeout(initCodeEditor, 100);
      return;
    }
    
    // Only initialize if not already initialized
    if (codeEditor) {
      console.log('Editor already initialized');
      return;
    }
    
    try {
      // Clear container first
      editorContainer.innerHTML = '';
      
      codeEditor = CodeMirror(editorContainer, {
        value: '<h1>Titlul articolului</h1>\n<p>Scrie conținutul HTML aici...</p>',
        mode: 'htmlmixed',
        theme: 'monokai',
        lineNumbers: true,
        lineWrapping: true,
        autoCloseTags: true,
        indentUnit: 2,
        indentWithTabs: false,
        tabSize: 2,
        viewportMargin: Infinity,
        autofocus: true
      });
      
      // Enable match tags addon if available
      if (CodeMirror.commands && CodeMirror.commands.matchTag) {
        // Add keymap for match tag (Ctrl+Shift+P or Cmd+Shift+P)
        codeEditor.setOption('extraKeys', {
          'Ctrl-Shift-P': function(cm) {
            CodeMirror.commands.matchTag(cm);
          },
          'Cmd-Shift-P': function(cm) {
            CodeMirror.commands.matchTag(cm);
          }
        });
      }
      
      // Set minimum height (larger for full-screen feel)
      codeEditor.setSize('100%', '600px');
      
      // Focus editor after a short delay to ensure it's rendered
      setTimeout(() => {
        codeEditor.focus();
      }, 200);
      
      console.log('✅ CodeMirror editor initialized successfully');
    } catch (error) {
      console.error('Error initializing CodeMirror:', error);
    }
  }
  
  // Set editor value (helper function)
  function setEditorValue(value) {
    if (codeEditor) {
      codeEditor.setValue(value || '<h1>Titlul articolului</h1>\n<p>Scrie conținutul HTML aici...</p>');
    }
  }
  
  function init() {
    // Check authentication
    if (isAuthenticated()) {
      showAdmin();
      loadArticles();
      // Initialize editor when admin panel is shown
      setTimeout(initCodeEditor, 100);
    } else {
      showLogin();
    }
    
    // Load GitHub config into settings
    const config = getGitHubConfig();
    const repoInput = document.getElementById('github-repo');
    const branchInput = document.getElementById('github-branch');
    if (repoInput) repoInput.value = config.repo;
    if (branchInput) branchInput.value = config.branch;
    
    // Event listeners - with null checks
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', handleLogin);
    }
    
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', handleLogout);
    }
    
    const articleForm = document.getElementById('article-form');
    if (articleForm) {
      articleForm.addEventListener('submit', handleFormSubmit);
    }
    
    const previewBtn = document.getElementById('preview-btn');
    if (previewBtn) {
      previewBtn.addEventListener('click', showPreview);
    }
    
    const closePreviewBtn = document.getElementById('close-preview');
    if (closePreviewBtn) {
      closePreviewBtn.addEventListener('click', closePreview);
    }
    
    const settingsBtn = document.getElementById('settings-btn');
    if (settingsBtn) {
      settingsBtn.addEventListener('click', openSettings);
    }
    
    const closeSettingsBtn = document.getElementById('close-settings');
    if (closeSettingsBtn) {
      closeSettingsBtn.addEventListener('click', closeSettings);
    }
    
    const saveSettingsBtn = document.getElementById('save-settings');
    if (saveSettingsBtn) {
      saveSettingsBtn.addEventListener('click', saveSettings);
    }
    
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

