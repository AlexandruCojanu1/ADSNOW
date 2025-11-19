// Script to generate blog post HTML pages from articles.json
// This should be run after articles.json is updated

async function generateBlogPages() {
  try {
    // Load articles
    const response = await fetch('data/blog/articles.json');
    if (!response.ok) {
      throw new Error('Failed to load articles.json');
    }
    
    const data = await response.json();
    const articles = data.articles || [];
    
    // Load template
    const templateResponse = await fetch('blog/template.html');
    if (!templateResponse.ok) {
      throw new Error('Failed to load template.html');
    }
    
    let template = await templateResponse.text();
    
    // Generate pages for each article
    articles.forEach(article => {
      const slug = article.slug || generateSlug(article.title);
      
      // Replace template placeholders
      let html = template
        .replace(/\{\{TITLE\}\}/g, article.title)
        .replace(/\{\{DESCRIPTION\}\}/g, article.excerpt || article.title);
      
      // Save file (this would need a backend in production)
      // For now, we'll create a download
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${slug}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
    
    console.log(`Generated ${articles.length} blog post pages`);
    
  } catch (error) {
    console.error('Error generating blog pages:', error);
  }
}

function generateSlug(title) {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Export for use in admin.js
if (typeof window !== 'undefined') {
  window.generateBlogPages = generateBlogPages;
  window.generateSlug = generateSlug;
}

