# ALGO DIGITAL SOLUTIONS - Landing Page

O landing page modernă și interactivă pentru ALGO DIGITAL SOLUTIONS, o agenție de creație și strategie digitală.

## 📁 Structura Proiectului (Optimizată)

```
ADSNOW/
├── index.html                      # Fișierul HTML principal (OPTIMIZAT)
├── index-old-backup.html           # Backup versiune veche (ignorat de Git)
├── README.md                       # Documentație
├── USAGE.md                        # Ghid de utilizare
├── .gitignore                      # Git ignore file
│
├── assets/                         # Foldere pentru media
│   └── images/
│       └── ALGO DIGITAL SOLUTIONS.svg  # Logo companie
│
├── fonts/                          # Foldere pentru fonturi locale
│   ├── NunitoSans-VariableFont_YTLC,opsz,wdth,wght.ttf
│   └── NunitoSans-Italic-VariableFont_YTLC,opsz,wdth,wght.ttf
│
├── css/                            # Foldere CSS (organizat modular)
│   ├── variables.css              # Variabile CSS, culori, fonturi
│   ├── base.css                   # Stiluri de bază și reset
│   ├── hero.css                   # Secțiunea hero (independentă)
│   ├── pill-nav.css               # Navigație animată tip pill
│   ├── contact.css                # Informații de contact
│   ├── sections.css               # Toate secțiunile de conținut (independente)
│   ├── spline.css                 # Footer Spline (independent)
│   └── responsive.css             # Media queries și responsive design
│
└── js/                            # Foldere JavaScript (modular)
    ├── pill-nav.js                # Navigație animată cu GSAP
    ├── scroll.js                  # Comportament scroll
    ├── email.js                   # Funcționalitate clipboard pentru email
    ├── typing.js                  # Efecte de typing pentru text
    ├── three-metaballs.js         # Background Three.js cu metaballs
    └── spline-animations.js       # Animații GSAP pentru footer Spline
```

## ✨ Îmbunătățiri Recente

### ✅ Optimizări Implementate:

1. **Structură Organizată**
   - Fonturi mutate în `/fonts/`
   - Media (imagini, SVG) mutate în `/assets/images/`
   - CSS modular și independent
   - JavaScript modular

2. **Secțiuni Independente**
   - Fiecare secțiune are `isolation: isolate` pentru stacking context propriu
   - Nu există interferențe între secțiuni
   - Stiluri complet independente

3. **Responsive Design Complet**
   - Mobile-first approach
   - Breakpoints: 360px, 480px, 768px, 1200px
   - Suport pentru landscape mobile
   - Print styles

4. **Eliminarea Duplicărilor**
   - CSS optimizat fără duplicări
   - Referințe unificate către assets
   - Cod curat și DRY (Don't Repeat Yourself)

5. **Performanță**
   - Font-display: swap pentru încărcare rapidă
   - Reduced motion support
   - Optimizare pentru toate device-urile

## 🎨 Secțiuni

1. **Hero Section** - Secțiune principală cu background Three.js metaballs interactiv
2. **CTA Full** - Call-to-action full-screen "Let's see if we click"
3. **Why Section** - "De ce există ADSNOW"
4. **Typing Section** - Efect de typing cu "Simplu. Transparent. Relevant."
5. **Steps Section** - Cele 3 etape ale procesului
6. **Visibility Section** - "Vizibilitate, stabilitate, predictibilitate"
7. **About Section** - Despre agenție
8. **Final CTA** - Call-to-action final
9. **Spline Footer** - Footer interactiv cu animație Spline 3D

## 🎨 Paletă de Culori

- `#E7F0FA` (--c-1) - Albastru deschis (background)
- `#7BA4D0` (--c-2) - Albastru mediu (text secundar)
- `#2E5E99` (--c-3) - Albastru închis (text)
- `#0D2440` (--c-4) - Albastru foarte închis (fundal principal)

## 🔤 Fonturi

- **Nunito / Nunito Sans 900** - Pentru titluri (local + Google Fonts)
- **Inter** - Pentru text body (Google Fonts)
- **PPSupplyMono** - Pentru text secundar/monospațiat (CDN)

## 🚀 Tehnologii Utilizate

- **HTML5** - Structură semantică
- **CSS3** - Stilizare modernă cu variabile CSS
- **JavaScript (ES6+)** - Interactivitate
- **Three.js** - Background 3D cu metaballs
- **GSAP** - Animații fluide pentru navigație și Spline
- **Spline** - Scene 3D interactive
- **SplitType** - Animații text
- **Pill Navigation** - Navigație animată custom cu efecte hover

## 📱 Responsive Design

Site-ul este complet responsive și optimizat pentru:
- **Extra Small Mobile** (< 360px)
- **Mobile** (360px - 480px)
- **Tablet** (481px - 768px)
- **Desktop** (769px - 1199px)
- **Large Desktop** (1200px+)
- **Landscape Mobile** (height < 500px)

## ⚡ Optimizări Performanță

- **WebGL Pausing** - Background-ul Three.js se oprește când nu este vizibil
- **FPS Throttling** - Reducere automată a frame rate-ului dacă performanța scade
- **Lazy Loading** - Animațiile pornesc doar când secțiunea devine vizibilă
- **Device Detection** - Setări optimizate pentru mobile/desktop
- **CSS Grain** - Folosește gradient CSS în loc de imagine
- **Font Loading** - Font-display: swap pentru încărcare rapidă
- **Stacking Context** - Fiecare secțiune are propriul context (isolation: isolate)

## 🔧 Cum să Folosești

### Vizualizare Locală:

**Opțiunea 1: Live Server (Recomandat)**
```bash
# În VS Code, instalează extensia "Live Server"
# Click dreapta pe index.html → Open with Live Server
```

**Opțiunea 2: Python Server**
```bash
cd /Users/alexandrucojanu/Desktop/ADSNOW
python3 -m http.server 8000
# Deschide: http://localhost:8000
```

**Opțiunea 3: Node.js**
```bash
npx serve
```

### Deployment:

1. Upload toate fișierele pe server (fără `index-old-backup.html`)
2. Asigură-te că folderele `css/`, `js/`, `fonts/`, `assets/` sunt accesibile
3. Verifică că toate path-urile relative funcționează corect

## 📧 Contact

Email: algodigitalsolutions@gmail.com

## 📝 Licență

© 2025 ALGO DIGITAL SOLUTIONS. All rights reserved.

---

**Nota:** Pentru ghid detaliat de utilizare și personalizare, consultă `USAGE.md`
