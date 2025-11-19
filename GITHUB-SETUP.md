# Configurare GitHub API pentru Blog Admin

## Pasul 1: Creează un GitHub Personal Access Token

1. Mergi pe [GitHub Settings > Developer settings > Personal access tokens > Tokens (classic)](https://github.com/settings/tokens)
2. Click pe **"Generate new token"** → **"Generate new token (classic)"**
3. Completează:
   - **Note**: `ADS Now Blog Admin` (sau orice nume vrei)
   - **Expiration**: Alege perioada (recomandat: `90 days` sau `No expiration`)
   - **Scopes**: Bifează **`repo`** (acest scope include toate permisiunile necesare)
4. Click pe **"Generate token"**
5. **COPIAZĂ TOKEN-UL IMEDIAT** (nu vei mai putea să-l vezi după ce închizi pagina!)
   - Token-ul arată așa: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

## Pasul 2: Configurează în Admin Panel

1. Accesează `/admin.html` pe site-ul tău
2. Loghează-te cu parola admin
3. Click pe butonul **"⚙️ Setări"** din header
4. Completează:
   - **GitHub Personal Access Token**: Lipește token-ul copiat
   - **Repository**: `AlexandruCojanu1/ADSNOW` (sau repository-ul tău)
   - **Branch**: `main` (sau branch-ul tău)
5. Click pe **"Salvează"**

## Pasul 3: Testează

1. Scrie un articol de test în admin panel
2. Click pe **"Publică articol"**
3. Ar trebui să vezi mesajul: **"✅ Articolul a fost publicat cu succes pe GitHub! Vercel va redeploya automat."**
4. Verifică pe GitHub că articolul a fost adăugat
5. După câteva secunde, verifică pe site-ul live că articolul apare

## Securitate

- **Token-ul este salvat local în browser** (localStorage)
- Nu este trimis către niciun server extern (doar către GitHub API)
- Poți șterge token-ul oricând din Setări
- Dacă token-ul expiră, trebuie să creezi unul nou

## Troubleshooting

**Eroare: "GitHub API error: 401"**
- Token-ul este invalid sau expirat
- Creează un token nou și actualizează-l în Setări

**Eroare: "GitHub API error: 403"**
- Token-ul nu are permisiunea `repo`
- Creează un token nou cu scope `repo` bifat

**Eroare: "GitHub API error: 404"**
- Repository-ul sau branch-ul este incorect
- Verifică că ai scris corect `owner/repo` și numele branch-ului

**Articolul nu apare pe site-ul live**
- Verifică că Vercel este conectat la repository-ul tău
- Verifică că Vercel redeployează automat la push-uri pe branch-ul `main`
- Poți forța un redeploy manual din Vercel Dashboard

## Notă importantă

Dacă nu configurezi GitHub Token, admin panel-ul va funcționa în modul "fallback":
- Articolele se salvează local (descărcare fișier JSON)
- Trebuie să le încarci manual pe GitHub
- Trebuie să rulezi `node build-blog.js` manual

Cu GitHub Token configurat, totul este automat! 🚀

