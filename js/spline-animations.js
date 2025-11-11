// Spline Hero animations with GSAP (initialized lazily)
(function(){
  let splineHeroInitialized = false;

  function runSplineHeroAnimation(onComplete) {
    if (splineHeroInitialized) return;

    const hero = document.querySelector('.spline-footer.hero');
    if (!hero) return;

    const loader = hero.querySelector('.spline-loader');
    const title = hero.querySelector('.content h1');
    const text = hero.querySelector('.content .text');
    const phone = hero.querySelector('.content .spline-phone');
    const whatsapp = hero.querySelector('.content .spline-whatsapp');
    const header = hero.querySelector('header');
    const spline = hero.querySelector('spline-viewer');

    if (!title || !text || !header || !spline) return;

    let splitTitle;
    let wordsTarget;
    if (typeof SplitType !== 'undefined') {
      splitTitle = new SplitType(title, { type: 'words' });
      wordsTarget = splitTitle.words;
    } else {
      gsap.set(title, { opacity: 0, y: 24 });
      console.warn('SplitType not available, falling back to simple title animation.');
      wordsTarget = title;
    }

    gsap.set(hero, {
      width: 'calc(100vw - 4rem)',
      height: 'clamp(220px, 32vh, 360px)',
      minHeight: 'clamp(220px, 32vh, 360px)',
      borderRadius: '2rem'
    });

    const tl = gsap.timeline();

    if (loader) {
      tl.to(loader, {
        opacity: 0,
        duration: 0.45,
        ease: "power1.inOut"
      }, 0);
    }

    tl
      .to(spline, {
        opacity: 1,
        duration: 1,
        ease: "power2.out",
      })
      .to(wordsTarget, {
        y: 0,
        opacity: 1,
        duration: 1,
        stagger: splitTitle ? 0.15 : 0,
        ease: "power2.inOut",
      }, '<')
      .to(text, {
        opacity: 1,
        duration: 1,
        ease: "power2.out",
      }, '-=50%')
      .to(header, {
        opacity: 1,
        duration: 1,
        ease: "power2.out",
      }, '<');
    
    if (phone) {
      tl.to(phone, {
        opacity: 1,
        duration: 1,
        ease: "power2.out",
      }, '<');
    }

    if (whatsapp) {
      tl.to(whatsapp, {
        opacity: 1,
        duration: 1,
        ease: "power2.out",
      }, '<');
    }
    
    tl.add(() => {
      if (typeof onComplete === 'function') {
        onComplete();
      }
    });

    splineHeroInitialized = true;
  }

  window.initSplineHero = runSplineHeroAnimation;
})();

// Custom Cursor for Spline section
(function(){
  const bigCircleElement = document.querySelector('.cursor .big-circle');
  const smallCircleElement = document.querySelector('.cursor .small-circle');
  if (!bigCircleElement || !smallCircleElement) return;

  const mouse = { x: 0, y: 0 };
  const bigCircle = { x: 0, y: 0 };
  const smallCircle = { x: 0, y: 0 };

  window.addEventListener('mousemove', e => {
    mouse.x = e.x;
    mouse.y = e.y;
  });

  const smallCircleSpeed = 0.5;
  const bigCircleSpeed = 0.15;

  function tick() {
    bigCircle.x += (mouse.x - bigCircle.x) * bigCircleSpeed;
    bigCircle.y += (mouse.y - bigCircle.y) * bigCircleSpeed;
    bigCircleElement.style.transform = `translate(${bigCircle.x}px, ${bigCircle.y}px)`;

    smallCircle.x += (mouse.x - smallCircle.x) * smallCircleSpeed;
    smallCircle.y += (mouse.y - smallCircle.y) * smallCircleSpeed;
    smallCircleElement.style.transform = `translate(${smallCircle.x}px, ${smallCircle.y}px)`;

    window.requestAnimationFrame(tick);
  }
  tick();
})();

// Magnetic Button - Removed magnetic effect, button stays static
// Button only has hover fill effect via CSS

