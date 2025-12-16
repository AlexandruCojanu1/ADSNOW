/**
 * Google Indexing API Script
 * 
 * Notifică Google când se publică un articol nou pe blog.
 * 
 * Utilizare:
 *   node index-google.js https://www.adsnow.ro/blog/nume-articol
 * 
 * Sau editează direct URL-ul în cod și rulează:
 *   node index-google.js
 */

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// Configurare
const SERVICE_ACCOUNT_FILE = path.join(__dirname, 'service_account.json');
const GOOGLE_API_KEY = 'AIzaSyB6df86AbSKsr-K241rPioFu9ojKtf3AkQ';

// Verifică dacă există service_account.json
if (!fs.existsSync(SERVICE_ACCOUNT_FILE)) {
  console.error('❌ Eroare: Fișierul service_account.json nu a fost găsit!');
  console.error('📝 Instrucțiuni:');
  console.error('   1. Obține fișierul JSON de la Google Cloud Console');
  console.error('   2. Salvează-l ca service_account.json în directorul proiectului');
  console.error('   3. Vezi BLOG-README.md pentru instrucțiuni detaliate');
  process.exit(1);
}

// Încarcă cheia de service account
let key;
try {
  key = require(SERVICE_ACCOUNT_FILE);
} catch (error) {
  console.error('❌ Eroare la citirea service_account.json:', error.message);
  process.exit(1);
}

// Obține URL-ul din argumente sau folosește unul default
const urlToIndex = process.argv[2] || 'https://www.adsnow.ro/blog/test';

// Verifică dacă URL-ul este valid
if (!urlToIndex.startsWith('https://www.adsnow.ro/')) {
  console.error('❌ Eroare: URL-ul trebuie să înceapă cu https://www.adsnow.ro/');
  console.error('   Exemplu: https://www.adsnow.ro/blog/nume-articol');
  process.exit(1);
}

// Creează client JWT pentru autentificare
const jwtClient = new google.auth.JWT(
  key.client_email,
  null,
  key.private_key,
  ['https://www.googleapis.com/auth/indexing'],
  null
);

// Funcție pentru indexare
async function indexURL(url, type = 'URL_UPDATED') {
  try {
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
        type: type // 'URL_UPDATED' sau 'URL_DELETED'
      }
    });
    
    console.log('✅ Succes! Google a fost notificat.');
    console.log('   URL:', url);
    console.log('   Tip:', type);
    console.log('   Status:', response.status);
    
    if (response.data) {
      console.log('   Răspuns:', JSON.stringify(response.data, null, 2));
    }
    
    return response;
  } catch (error) {
    console.error('❌ Eroare la indexare:', error.message);
    
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Detalii:', JSON.stringify(error.response.data, null, 2));
    }
    
    // Erori comune și soluții
    if (error.message.includes('403')) {
      console.error('\n💡 Soluție: Verifică că:');
      console.error('   1. Service Account-ul are permisiuni în Google Search Console');
      console.error('   2. Email-ul service account este adăugat ca Owner în Search Console');
      console.error('   3. Google Indexing API este activat în Google Cloud Console');
    } else if (error.message.includes('401')) {
      console.error('\n💡 Soluție: Verifică că service_account.json este valid și corect');
    }
    
    throw error;
  }
}

// Rulează scriptul
(async () => {
  console.log('🚀 Pornire indexare Google...');
  console.log('   URL:', urlToIndex);
  console.log('');
  
  try {
    await indexURL(urlToIndex, 'URL_UPDATED');
    console.log('\n✨ Gata! Google va indexa URL-ul în scurt timp.');
  } catch (error) {
    console.error('\n❌ Indexarea a eșuat. Verifică erorile de mai sus.');
    process.exit(1);
  }
})();


