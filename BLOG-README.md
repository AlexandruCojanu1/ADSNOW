# Blog System - Ghid de utilizare

## Funcționalități

1. **Pagina Blog** (`/blog/index.html`) - Afișează toate articolele publicate
2. **Admin Panel** (`/admin.html`) - Interfață pentru adăugarea și gestionarea articolelor
3. **Paginile individuale** - Generate automat pentru fiecare articol

## Cum să adaugi un articol nou

### Pasul 1: Accesează Admin Panel
1. Deschide `/admin.html` în browser
2. Introdu parola: `adsnow2025` (poți schimba parola în `js/admin.js`, variabila `ADMIN_PASSWORD`)

### Pasul 2: Completează formularul
- **Titlu** (obligatoriu) - Titlul articolului
- **Data** (obligatoriu) - Data publicării
- **Categorie** (opțional) - Marketing Digital, Web Design, SEO, Branding, Strategie
- **Rezumat** (opțional) - Scurt rezumat al articolului
- **Imagine** (opțional) - URL sau path către imagine (ex: `assets/images/blog/imagine.jpg`)
- **Conținut** (obligatoriu) - Conținutul articolului (poți folosi HTML)

### Pasul 3: Publică articolul
1. Click pe "Publică articol"
2. Fișierul `articles.json` va fi descărcat automat
3. Înlocuiește fișierul `data/blog/articles.json` cu cel descărcat

### Pasul 4: Generează paginile HTML
Rulează în terminal:
```bash
node build-blog.js
```

Aceasta va genera paginile HTML pentru toate articolele din `articles.json`.

## Structura fișierelor

```
/blog/
  ├── index.html          # Pagina principală de blog
  ├── template.html       # Template pentru paginile individuale
  └── [slug].html         # Paginile generate pentru fiecare articol

/data/blog/
  └── articles.json       # Toate articolele (JSON)

/admin.html               # Admin panel
/build-blog.js            # Script pentru generarea paginilor HTML
```

## Formatul unui articol în JSON

```json
{
  "title": "Titlul articolului",
  "date": "2025-01-20",
  "category": "Marketing Digital",
  "excerpt": "Scurt rezumat...",
  "image": "assets/images/blog/imagine.jpg",
  "content": "<p>Conținutul articolului cu HTML...</p>",
  "slug": "titlul-articolului"
}
```

## Schimbarea parolei admin

Editează `js/admin.js` și schimbă valoarea variabilei `ADMIN_PASSWORD`:
```javascript
const ADMIN_PASSWORD = 'parola-ta-noua';
```

## Note importante

- Articolele sunt sortate automat după dată (cel mai nou primul)
- Slug-ul este generat automat din titlu (fără diacritice, cu cratime)
- Pentru imagini, poți folosi URL-uri externe sau path-uri relative către `assets/images/blog/`
- Conținutul suportă HTML complet (h2, h3, p, ul, ol, img, a, strong, em, etc.)

## Troubleshooting

**Articolele nu apar pe pagina blog:**
- Verifică că `data/blog/articles.json` există și are formatul corect
- Verifică consola browser-ului pentru erori

**Paginile HTML nu se generează:**
- Asigură-te că ai Node.js instalat
- Verifică că `build-blog.js` este în directorul root al proiectului
- Verifică că `data/blog/articles.json` există și este valid JSON

**Admin panel nu se deschide:**
- Verifică că parola este corectă
- Șterge cache-ul browser-ului sau folosește modul incognito
- Verifică consola browser-ului pentru erori

