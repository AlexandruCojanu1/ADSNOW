# Ghid de Utilizare - ADSNOW Landing Page

## 🚀 Cum să folosești proiectul

### 1. Structura Fișierelor

Proiectul este organizat în următoarea structură:

```
ADSNOW/
├── index-new.html          # Fișierul HTML principal (FOLOSEȘTE ACESTA!)
├── css/                    # Toate fișierele CSS
├── js/                     # Toate fișierele JavaScript
└── ALGO DIGITAL SOLUTIONS.svg
```

### 2. Pentru a vizualiza site-ul

**Opțiunea 1: Live Server (Recomandat)**
1. Instalează extensia "Live Server" în VS Code
2. Click dreapta pe `index-new.html`
3. Selectează "Open with Live Server"

**Opțiunea 2: Server local Python**
```bash
cd /Users/alexandrucojanu/Desktop/ADSNOW
python3 -m http.server 8000
```
Apoi deschide: `http://localhost:8000/index-new.html`

**Opțiunea 3: Server local Node.js**
```bash
npx serve
```

### 3. Editarea Conținutului

#### Modificarea Textelor
- Deschide `index-new.html`
- Caută textul pe care vrei să-l modifici
- Editează direct în HTML

#### Modificarea Stilurilor
- **Culori**: Editează `css/variables.css`
- **Layout Hero**: Editează `css/hero.css`
- **Header**: Editează `css/header.css`
- **Secțiuni**: Editează `css/sections.css`
- **Footer Spline**: Editează `css/spline.css`
- **Responsive**: Editează `css/responsive.css`

#### Modificarea Comportamentului JavaScript
- **Scroll**: Editează `js/scroll.js`
- **Email**: Editează `js/email.js`
- **Typing Effects**: Editează `js/typing.js`
- **Three.js Background**: Editează `js/three-metaballs.js`
- **Spline Animations**: Editează `js/spline-animations.js`

### 4. Personalizare Rapidă

#### Schimbarea Culorilor
Editează `css/variables.css`:
```css
:root {
  --c-1: #E7F0FA;  /* Culoare primară */
  --c-2: #7BA4D0;  /* Culoare secundară */
  --c-3: #2E5E99;  /* Culoare terțiară */
  --c-4: #0D2440;  /* Culoare fundal */
}
```

#### Schimbarea Fonturilor
Editează `css/variables.css`:
```css
:root {
  --font-primary: "Nunito", sans-serif;  /* Pentru titluri */
  --font-sans: "Inter", sans-serif;      /* Pentru text */
}
```

#### Modificarea Vitezei de Typing
Editează `js/typing.js`:
```javascript
const typingSpeed = 75;      // ms per caracter
const deletingSpeed = 30;    // ms per caracter ștergere
const pauseDuration = 1500;  // ms pauză între cuvinte
```

### 5. Adăugarea unei Noi Secțiuni

1. **Adaugă HTML-ul** în `index-new.html`:
```html
<section class="section my-new-section">
  <div class="my-new-wrap">
    <h2>Titlul Meu</h2>
    <p>Conținutul meu</p>
  </div>
</section>
```

2. **Adaugă CSS-ul** în `css/sections.css`:
```css
.my-new-section {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  padding: 16vh var(--spacing-large);
}

.my-new-wrap {
  max-width: 1000px;
  margin: 0 auto;
}
```

3. **Adaugă JavaScript** (dacă e necesar) în `js/`:
```javascript
// js/my-feature.js
(function(){
  // Codul tău aici
})();
```

4. **Include scriptul** în `index-new.html`:
```html
<script src="js/my-feature.js"></script>
```

### 6. Deployment

#### Pentru GitHub Pages:
1. Redenumește `index-new.html` în `index.html`
2. Push pe GitHub
3. Activează GitHub Pages în Settings

#### Pentru Netlify:
1. Drag & drop folderul ADSNOW pe Netlify
2. Setează `index-new.html` ca index file (sau redenumește în `index.html`)

#### Pentru Server Propriu:
1. Upload toate fișierele via FTP
2. Asigură-te că `index-new.html` este redenumit în `index.html`
3. Verifică că folderele `css/` și `js/` sunt accesibile

### 7. Debugging

#### Site-ul nu se încarcă corect:
- Verifică Console-ul browser-ului (F12)
- Verifică că toate path-urile către CSS și JS sunt corecte
- Verifică că serverul servește fișierele corect

#### Animațiile nu funcționează:
- Verifică că GSAP și SplitType se încarcă (vezi Network tab în DevTools)
- Verifică Console pentru erori JavaScript

#### Three.js nu se afișează:
- Verifică că browser-ul suportă WebGL
- Verifică Console pentru erori
- Încearcă pe un alt browser

### 8. Optimizare

#### Pentru Performanță:
- Compresia imaginilor (dacă adaugi imagini)
- Minificare CSS și JS pentru producție
- Lazy loading pentru imagini

#### Pentru SEO:
- Adaugă meta tags în `<head>`
- Adaugă schema.org markup
- Optimizează titlurile și descrierile

### 9. Browser Support

Site-ul funcționează pe:
- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

### 10. Întrebări Frecvente

**Q: Cum schimb logo-ul?**
A: Înlocuiește fișierul `ALGO DIGITAL SOLUTIONS.svg` cu noul logo (păstrează același nume sau actualizează path-ul în HTML).

**Q: Cum adaug Google Analytics?**
A: Adaugă scriptul Google Analytics în `<head>` din `index-new.html`.

**Q: Cum dezactivez animațiile Three.js?**
A: Comentează linia `<script type="module" src="js/three-metaballs.js"></script>` din HTML.

**Q: Cum schimb scena Spline?**
A: Înlocuiește URL-ul în `<spline-viewer url="...">` cu noul URL Spline.

---

Pentru asistență suplimentară, contactează: algodigitalsolutions@gmail.com

