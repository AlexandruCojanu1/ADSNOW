# 🚀 Configurare Vercel - Google Indexing API

## ⚠️ IMPORTANT: Trebuie să configurezi Environment Variable pe Vercel!

Fără această configurare, Google Indexing API **NU VA FUNCȚIONA** pe producție.

---

## 📋 Pași Simpli (5 minute)

### 1️⃣ Copiază JSON-ul Service Account

Deschide fișierul `service_account.json` din proiect și **copiază tot conținutul** (inclusiv `{` și `}`).

**Conținutul pe care trebuie să-l copiezi arată așa:**

```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n[YOUR PRIVATE KEY HERE]\n-----END PRIVATE KEY-----\n",
  "client_email": "your-bot@your-project.iam.gserviceaccount.com",
  "client_id": "123456789",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/your-bot%40your-project.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
}
```

**⚠️ IMPORTANT:** Copiază conținutul din **TU** fișierul `service_account.json` (nu exemplul de mai sus)!

---

### 2️⃣ Adaugă Environment Variable pe Vercel

1. **Mergi pe Vercel Dashboard:**
   - [https://vercel.com/dashboard](https://vercel.com/dashboard)

2. **Selectează proiectul ADSNOW**

3. **Mergi la Settings → Environment Variables**

4. **Click pe "Add New"**

5. **Completează:**
   - **Key (Nume):** `GOOGLE_SERVICE_ACCOUNT`
   - **Value (Valoare):** Lipește tot JSON-ul copiat din pasul 1
   - **Environments:** Bifează toate (Production, Preview, Development)

6. **Click "Save"**

---

### 3️⃣ Redeploy Proiectul

După ce ai adăugat environment variable, trebuie să faci redeploy:

**Opțiunea A: Redeploy Manual (Rapid)**
1. Mergi la **Deployments** în Vercel
2. Găsește ultimul deployment
3. Click pe **trei puncte** (⋯) → **Redeploy**
4. Confirmă

**Opțiunea B: Push pe GitHub (Automat)**
1. Fă orice modificare în proiect (sau un commit gol)
2. Push pe GitHub
3. Vercel va detecta automat și va face redeploy

---

## 🧪 Testare Locală (Opțional)

Dacă vrei să testezi Google Indexing API local (pe calculatorul tău), ai două opțiuni:

**Opțiunea 1: Folosește `.env.local` (Recomandat)**
- Fișierul `.env.local` a fost deja creat pentru tine cu credențialele corecte
- Este automat ignorat de Git (nu va fi commitat)
- Vercel va citi automat acest fișier când rulezi local

**Opțiunea 2: Folosește `service_account.json`**
- Fișierul `service_account.json` este deja în proiect
- Este și el ignorat de Git
- Serverless function-ul va detecta automat fișierul

Pentru a testa local:
```bash
cd /Users/alexandrucojanu/Desktop/ADSNOW
vercel dev
```

---

## ✅ Verificare

După redeploy, testează din Admin Panel:
1. Publică un articol nou
2. Verifică în Console (F12) dacă apare:
   - ✅ `✅ Google Indexing API notified successfully!`
   - ❌ **NU** `⚠️ Failed to notify Google Indexing API`

---

## 🔧 Troubleshooting

### Eroare: "Service account configuration not found"
→ **Soluție:** Ai uitat să adaugi environment variable pe Vercel (vezi pasul 2)

### Eroare: "Invalid GOOGLE_SERVICE_ACCOUNT environment variable format"
→ **Soluție:** JSON-ul copiat este invalid. Verifică că ai copiat **tot** conținutul din `service_account.json`

### Eroare: "Permission denied. Check Google Search Console permissions"
→ **Soluție:** Trebuie să adaugi `client_email` din JSON ca **Owner** în Google Search Console

### Eroare: "Unauthorized. Check service account configuration"
→ **Soluție:** Verifică că JSON-ul copiat este complet și corect

---

## 📚 Documentație Completă

Pentru mai multe detalii, vezi: `GOOGLE-INDEXING-SETUP.md`

---

**🎯 Rezultat Final:**
După configurare, când publici un articol din Admin Panel:
1. ✅ Articolul se salvează pe GitHub
2. ✅ Se generează HTML-ul
3. ✅ Se actualizează `sitemap.xml`
4. ✅ **Google este notificat automat** (Indexing API)

**Totul automat, fără intervenție manuală!** 🚀

