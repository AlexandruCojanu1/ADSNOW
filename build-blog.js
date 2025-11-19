// Node.js script to generate blog post HTML pages from articles.json
// Run with: node build-blog.js

const fs = require('fs');
const path = require('path');

function generateSlug(title) {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('ro-RO', options);
}

async function generateBlogPages() {
  try {
    // Load articles
    const articlesPath = path.join(__dirname, 'data', 'blog', 'articles.json');
    const articlesData = JSON.parse(fs.readFileSync(articlesPath, 'utf8'));
    const articles = articlesData.articles || [];
    
    // Load template
    const templatePath = path.join(__dirname, 'blog', 'template.html');
    let template = fs.readFileSync(templatePath, 'utf8');
    
    // Ensure blog directory exists
    const blogDir = path.join(__dirname, 'blog');
    if (!fs.existsSync(blogDir)) {
      fs.mkdirSync(blogDir, { recursive: true });
    }
    
    // Generate pages for each article
    articles.forEach(article => {
      const slug = article.slug || generateSlug(article.title);
      const imageUrl = article.image ? (article.image.startsWith('http') ? article.image : `../${article.image}`) : null;
      const formattedDate = formatDate(article.date);
      
      // Generate HTML content
      let html = template
        .replace(/\{\{TITLE\}\}/g, article.title)
        .replace(/\{\{DESCRIPTION\}\}/g, article.excerpt || article.title);
      
      // Replace the container content with actual article
      const articleHTML = `
        <article class="blog-post">
          <header class="blog-post-header">
            <div class="blog-post-meta">
              <span class="blog-card-date">${formattedDate}</span>
              ${article.category ? `<span class="blog-card-category">${article.category}</span>` : ''}
            </div>
            <h1 class="blog-post-title">${article.title}</h1>
            ${imageUrl ? `<img src="${imageUrl}" alt="${article.title}" class="blog-post-image">` : ''}
          </header>
          <div class="blog-post-content">${article.content}</div>
          <footer class="blog-post-footer">
            <a href="index.html" class="blog-back-link">← Înapoi la blog</a>
          </footer>
        </article>
      `;
      
      html = html.replace(
        /<!-- Content will be loaded dynamically -->/,
        articleHTML
      );
      
      // Save file
      const outputPath = path.join(blogDir, `${slug}.html`);
      fs.writeFileSync(outputPath, html, 'utf8');
      console.log(`Generated: ${slug}.html`);
    });
    
    console.log(`\n✅ Generated ${articles.length} blog post pages`);
    
  } catch (error) {
    console.error('❌ Error generating blog pages:', error);
    process.exit(1);
  }
}

// Run
generateBlogPages();

