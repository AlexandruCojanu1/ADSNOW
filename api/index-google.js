/**
 * Google Indexing API - Serverless Function pentru Vercel
 * 
 * Notifică Google când se publică un articol nou pe blog.
 * 
 * Endpoint: POST /api/index-google
 * Body: { "url": "https://www.adsnow.ro/blog/nume-articol" }
 */

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// Configurare
const SERVICE_ACCOUNT_FILE = path.join(process.cwd(), 'service_account.json');

// Funcție pentru a obține service account key (din env var sau fișier)
function getServiceAccountKey() {
  // Încearcă să citească din environment variable (recomandat pentru producție)
  if (process.env.GOOGLE_SERVICE_ACCOUNT) {
    try {
      const key = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT);
      console.log('✅ Using service account from environment variable');
      return key;
    } catch (error) {
      console.error('❌ Error parsing GOOGLE_SERVICE_ACCOUNT environment variable:', error.message);
      throw new Error('Invalid GOOGLE_SERVICE_ACCOUNT environment variable format. Must be valid JSON.');
    }
  }
  
  // Fallback la fișier (pentru development local)
  if (fs.existsSync(SERVICE_ACCOUNT_FILE)) {
    try {
      const key = require(SERVICE_ACCOUNT_FILE);
      console.log('✅ Using service account from file (development mode)');
      return key;
    } catch (error) {
      console.error('❌ Error loading service_account.json:', error.message);
      throw new Error('Failed to load service_account.json file.');
    }
  }
  
  throw new Error('Service account configuration not found. Either set GOOGLE_SERVICE_ACCOUNT environment variable or provide service_account.json file.');
}

module.exports = async (req, res) => {
  // Doar POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed. Use POST.' 
    });
  }

  // Obține URL-ul din body
  const { url } = req.body;
  
  if (!url) {
    return res.status(400).json({ 
      error: 'URL is required',
      message: 'Please provide a URL in the request body: { "url": "https://www.adsnow.ro/blog/..." }'
    });
  }

  // Verifică dacă URL-ul este valid
  if (!url.startsWith('https://adsnow.ro/')) {
    return res.status(400).json({ 
      error: 'Invalid URL',
      message: 'URL must start with https://adsnow.ro/'
    });
  }

  try {
    // Obține cheia de service account (din env var sau fișier)
    const key = getServiceAccountKey();
    
    // Creează client JWT pentru autentificare
    const jwtClient = new google.auth.JWT(
      key.client_email,
      null,
      key.private_key,
      ['https://www.googleapis.com/auth/indexing'],
      null
    );

    // Autentifică clientul
    await jwtClient.authorize();
    
    // Creează clientul pentru Indexing API
    const indexing = google.indexing({
      version: 'v3',
      auth: jwtClient
    });
    
    // Trimite cererea către Google
    const response = await indexing.urlNotifications.publish({
      requestBody: {
        url: url,
        type: 'URL_UPDATED'
      }
    });
    
    console.log('✅ Google Indexing success:', url);
    console.log('   Status:', response.status);
    
    return res.status(200).json({
      success: true,
      message: 'Google has been notified successfully',
      url: url,
      status: response.status,
      data: response.data || null
    });
    
  } catch (error) {
    console.error('❌ Google Indexing error:', error.message);
    
    // Erori comune și soluții
    let errorMessage = error.message;
    let statusCode = 500;
    
    if (error.response) {
      statusCode = error.response.status || 500;
      console.error('   Status:', statusCode);
      console.error('   Details:', JSON.stringify(error.response.data, null, 2));
      
      if (statusCode === 403) {
        errorMessage = 'Permission denied. Check Google Search Console permissions.';
      } else if (statusCode === 401) {
        errorMessage = 'Unauthorized. Check service account configuration (GOOGLE_SERVICE_ACCOUNT env var or service_account.json file).';
      }
    }
    
    return res.status(statusCode).json({
      success: false,
      error: errorMessage,
      details: error.response?.data || null,
      url: url
    });
  }
};

