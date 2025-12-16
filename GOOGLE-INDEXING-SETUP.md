# Google Indexing API - Ghid de Configurare

Acest ghid te va ajuta să configurezi Google Indexing API pentru a notifica automat Google când publici un articol nou pe blog.

**✨ Funcționalitate automată:** După configurare, Google Indexing API va fi apelat automat când publici un articol nou prin Admin Panel. Nu mai e nevoie să rulezi manual scriptul!

## 📋 Pași de Configurare

### Pasul 1: Obține Cheia JSON (Google Cloud Platform)

1. Mergi în [Google Cloud Console](https://console.cloud.google.com/)
2. Creează un **Proiect Nou** (dă-i un nume, ex: `Blog-Indexer`)
3. În bara de sus, caută **"Google Indexing API"** și dă click pe **Enable**
4. Mergi la **"IAM & Admin"** → **"Service Accounts"**
5. Click pe **"Create Service Account"**
   - Dă-i un nume (ex: `indexer-bot`)
   - Dă-i rolul de **Owner** (sau *Editor*) pentru proiectul curent
6. După ce l-ai creat, click pe el în listă → tab-ul **Keys** → **Add Key** → **Create new key** → Alege **JSON**
7. Se va descărca un fișier `.json` pe calculatorul tău
8. **Redenumește-l în `service_account.json`** și pune-l în directorul root al proiectului (`/Users/alexandrucojanu/Desktop/ADSNOW/`)

### Pasul 2: Dă Permisiuni Botului (Google Search Console)

1. Deschide fișierul `service_account.json` și copiază adresa de la câmpul `"client_email"` (ceva de genul `indexer-bot@proiect-id.iam.gserviceaccount.com`)
2. Mergi în **Google Search Console** → Selectează site-ul tău (`adsnow.ro`)
3. Mergi la **Settings** → **Users and permissions**
4. Click **Add User**
5. Lipește adresa de email a botului și dă-i permisiunea **Owner** (Proprietar)

### Pasul 3: Instalează Dependențele

Deschide terminalul în directorul proiectului și rulează:

```bash
cd /Users/alexandrucojanu/Desktop/ADSNOW
npm install
```

Aceasta va instala librăria `googleapis` necesară pentru script.

### Pasul 4: Configurează Service Account pe Vercel

Pentru ca automatizarea să funcționeze pe Vercel, trebuie să configurezi service account credentials. Sistemul suportă două metode (env var este recomandat):

**✅ Opțiunea A: Environment Variable (RECOMANDAT pentru producție)**

1. **Copiază conținutul JSON complet:**
   - Deschide `service_account.json` din proiect
   - Selectează tot conținutul (Cmd+A / Ctrl+A) și copiază-l (Cmd+C / Ctrl+C)
   - Conținutul trebuie să fie un JSON valid pe o singură linie sau formatat

2. **Adaugă Environment Variable pe Vercel:**
   - Mergi în [Vercel Dashboard](https://vercel.com/dashboard)
   - Selectează proiectul tău
   - Mergi la **Settings** → **Environment Variables**
   - Click pe **Add New**
   - **Key:** `GOOGLE_SERVICE_ACCOUNT`
   - **Value:** Lipește conținutul JSON copiat din `service_account.json` (tot fișierul, inclusiv `{` și `}`)
   - Selectează toate mediile (Production, Preview, Development)
   - Click **Save**

3. **Redeploy pe Vercel:**
   - După ce adaugi environment variable, fă un redeploy (sau Vercel va face automat la următorul push pe GitHub)
   - Poți forța un redeploy din Deployments → trei puncte → Redeploy

**📁 Opțiunea B: Fișier direct (pentru development local)**

Pentru development local, puteți folosi direct fișierul:
- Asigură-te că `service_account.json` este în directorul root al proiectului
- **IMPORTANT:** Fișierul este deja în `.gitignore`, deci nu va fi commitat pe GitHub
- Serverless function-ul va detecta automat fișierul dacă nu există environment variable

**🔒 Notă de securitate:**
- Environment Variable este mai sigur pentru producție (nu expune fișierul în repository)
- Sistemul verifică întâi environment variable, apoi fallback la fișier
- Asigură-te că `.gitignore` include `service_account.json` pentru a nu comita accidental datele sensibile

## 🚀 Utilizare

### Mod Automat (Recomandat) ✨

După configurare, când publici un articol nou prin Admin Panel:

1. ✅ Articolul este salvat automat pe GitHub
2. ✅ Sitemap.xml este actualizat automat
3. ✅ **Google Indexing API este apelat automat** - nu mai e nevoie să rulezi manual scriptul!

Sistemul va notifica automat Google când publici un articol. Poți verifica în console (Developer Tools → Console) dacă indexarea a reușit.

### Mod Manual (Opțional)

Dacă vrei să rulezi manual scriptul (de exemplu, pentru re-indexare):

**Opțiunea 1: Rulează cu URL ca argument**

```bash
node index-google.js https://www.adsnow.ro/blog/nume-articol
```

**Opțiunea 2: Folosește npm script**

```bash
npm run index https://www.adsnow.ro/blog/nume-articol
```

**Opțiunea 3: Folosește serverless function direct (pentru testing)**

```bash
curl -X POST https://www.adsnow.ro/api/index-google \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.adsnow.ro/blog/nume-articol"}'
```

## 📝 Exemplu de Utilizare Completă (Automată)

1. Accesează Admin Panel (`/admin.html`)
2. Completează formularul cu datele articolului
3. Click pe "Publică articol"
4. Sistemul va face automat:
   - ✅ Salvare pe GitHub
   - ✅ Actualizare sitemap.xml
   - ✅ Notificare Google Indexing API

Nu mai e nevoie de pași manuali! 🎉

## 🔍 Verificare

După ce publici un articol (sau după ce rulezi scriptul manual), poți verifica în Google Search Console dacă URL-ul a fost indexat:

1. Mergi în **Google Search Console** → **URL Inspection**
2. Introdu URL-ul articolului (ex: `https://www.adsnow.ro/blog/nume-articol`)
3. Verifică statusul indexării

**Notă:** Indexarea poate dura câteva minute sau chiar ore. Google procesează cererile asincron.

## ⚠️ Note Importante

- **Rate Limiting**: Google Indexing API are limite de rate. Nu rula scriptul prea des pentru același URL
- **Doar pentru proprietari**: API-ul funcționează doar pentru URL-uri care aparțin site-ului tău verificat în Search Console
- **Service Account**: Asigură-te că `service_account.json` este în `.gitignore` pentru a nu-l comite accidental pe GitHub

## 🐛 Troubleshooting

### Eroare 403: Permission Denied
- Verifică că Service Account-ul este adăugat ca Owner în Google Search Console
- Verifică că Google Indexing API este activat în Google Cloud Console

### Eroare 401: Unauthorized
- Verifică că `service_account.json` este valid și corect
- Verifică că fișierul JSON nu este corupt

### Eroare: service_account.json not found / Service account configuration not found
- **Pentru development local:** Asigură-te că ai salvat fișierul JSON ca `service_account.json` în directorul root
- **Pentru Vercel cu Environment Variable:**
  - Verifică că ai adăugat variabila `GOOGLE_SERVICE_ACCOUNT` în Vercel Dashboard
  - Asigură-te că JSON-ul este valid (poți testa cu `JSON.parse()`)
  - Verifică că ai făcut redeploy după adăugarea environment variable
- **Pentru Vercel cu fișier:** Verifică că fișierul este inclus în deployment (dar nu commitat pe GitHub - folosește `.gitignore`)
- Verifică că ai rulat `npm install` pentru a instala dependențele

### Google Indexing API nu este apelat automat
- Verifică că ai configurat corect serverless function-ul (fișierul `api/index-google.js` există)
- Verifică în console (Developer Tools) dacă există erori când publici un articol
- Pentru Vercel: Verifică logs-urile serverless function-ului în Vercel Dashboard → Functions → Logs
- Asigură-te că environment variable `GOOGLE_SERVICE_ACCOUNT` este configurat corect pe Vercel

### Invalid GOOGLE_SERVICE_ACCOUNT environment variable format
- Asigură-te că ai copiat tot conținutul JSON din `service_account.json`
- JSON-ul trebuie să fie valid - poți testa cu un JSON validator online
- Dacă JSON-ul este formatat pe mai multe linii, asigură-te că îl copiezi complet
- Poți folosi și versiunea minificată (fără spații) a JSON-ului

## 📚 Resurse

- [Google Indexing API Documentation](https://developers.google.com/search/apis/indexing-api/v3/using-api)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Google Search Console](https://search.google.com/search-console)


