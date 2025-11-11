// Pill Navigation - Vanilla JS implementation
(function() {
  'use strict';
  
  const ease = 'power2.out';
  let isMobileMenuOpen = false;
  const circleRefs = [];
  const tlRefs = [];
  const activeTweenRefs = [];
  
  // Wait for GSAP to be loaded
  function initPillNav() {
    if (typeof gsap === 'undefined') {
      console.error('GSAP not loaded');
      return;
    }
    
    const nav = document.querySelector('.pill-nav');
    if (!nav) return;
    
    const pills = nav.querySelectorAll('.pill');
    const logoImg = nav.querySelector('.pill-logo img');
    const hamburger = nav.querySelector('.mobile-menu-button');
    const mobileMenu = nav.querySelector('.mobile-menu-popover');
    const logo = nav.querySelector('.pill-logo');
    const navItems = nav.querySelector('.pill-nav-items');
    
    // Layout function
    function layout() {
      pills.forEach((pill, index) => {
        const circle = pill.querySelector('.hover-circle');
        if (!circle) return;
        
        const rect = pill.getBoundingClientRect();
        const w = rect.width;
        const h = rect.height;
        
        // Calculate circle dimensions
        const R = ((w * w) / 4 + h * h) / (2 * h);
        const D = Math.ceil(2 * R) + 2;
        const delta = Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 1;
        const originY = D - delta;
        
        circle.style.width = `${D}px`;
        circle.style.height = `${D}px`;
        circle.style.bottom = `-${delta}px`;
        
        gsap.set(circle, {
          xPercent: -50,
          scale: 0,
          transformOrigin: `50% ${originY}px`
        });
        
        const label = pill.querySelector('.pill-label');
        const hoverLabel = pill.querySelector('.pill-label-hover');
        
        if (label) gsap.set(label, { y: 0 });
        if (hoverLabel) gsap.set(hoverLabel, { y: h + 12, opacity: 0 });
        
        // Kill existing timeline
        if (tlRefs[index]) tlRefs[index].kill();
        
        // Create hover timeline
        const tl = gsap.timeline({ paused: true });
        tl.to(circle, { scale: 1.2, xPercent: -50, duration: 0.4, ease, overwrite: 'auto' }, 0);
        
        if (label) {
          tl.to(label, { y: -(h + 8), duration: 0.4, ease, overwrite: 'auto' }, 0);
        }
        
        if (hoverLabel) {
          gsap.set(hoverLabel, { y: Math.ceil(h + 100), opacity: 0 });
          tl.to(hoverLabel, { y: 0, opacity: 1, duration: 0.4, ease, overwrite: 'auto' }, 0);
        }
        
        tlRefs[index] = tl;
        circleRefs[index] = circle;
      });
    }
    
    // Handle pill hover
    function handleEnter(index) {
      const tl = tlRefs[index];
      if (!tl) return;
      
      if (activeTweenRefs[index]) activeTweenRefs[index].kill();
      activeTweenRefs[index] = tl.tweenTo(tl.duration(), {
        duration: 0.3,
        ease,
        overwrite: 'auto'
      });
    }
    
    function handleLeave(index) {
      const tl = tlRefs[index];
      if (!tl) return;
      
      if (activeTweenRefs[index]) activeTweenRefs[index].kill();
      activeTweenRefs[index] = tl.tweenTo(0, {
        duration: 0.2,
        ease,
        overwrite: 'auto'
      });
    }
    
    // Handle logo hover
    function handleLogoEnter() {
      if (!logoImg) return;
      gsap.to(logoImg, {
        rotate: 360,
        duration: 0.4,
        ease,
        overwrite: 'auto'
      });
    }
    
    // Toggle mobile menu
    function toggleMobileMenu() {
      isMobileMenuOpen = !isMobileMenuOpen;
      
      if (hamburger) {
        hamburger.setAttribute('aria-expanded', isMobileMenuOpen);
        const lines = hamburger.querySelectorAll('.hamburger-line');
        if (isMobileMenuOpen) {
          gsap.to(lines[0], { rotation: 45, y: 3, duration: 0.3, ease });
          gsap.to(lines[1], { rotation: -45, y: -3, duration: 0.3, ease });
        } else {
          gsap.to(lines[0], { rotation: 0, y: 0, duration: 0.3, ease });
          gsap.to(lines[1], { rotation: 0, y: 0, duration: 0.3, ease });
        }
      }
      
      if (mobileMenu) {
        if (isMobileMenuOpen) {
          gsap.set(mobileMenu, { visibility: 'visible' });
          gsap.fromTo(
            mobileMenu,
            { opacity: 0, y: 10 },
            {
              opacity: 1,
              y: 0,
              duration: 0.3,
              ease,
              transformOrigin: 'top center'
            }
          );
        } else {
          gsap.to(mobileMenu, {
            opacity: 0,
            y: 10,
            duration: 0.2,
            ease,
            transformOrigin: 'top center',
            onComplete: () => {
              gsap.set(mobileMenu, { visibility: 'hidden' });
            }
          });
        }
      }
    }
    
    // Initial layout
    layout();
    
    // Event listeners
    pills.forEach((pill, index) => {
      pill.addEventListener('mouseenter', () => handleEnter(index));
      pill.addEventListener('mouseleave', () => handleLeave(index));
    });
    
    if (logo) {
      logo.addEventListener('mouseenter', handleLogoEnter);
    }
    
    if (hamburger) {
      hamburger.addEventListener('click', toggleMobileMenu);
    }
    
    // Close mobile menu when clicking a link
    if (mobileMenu) {
      const mobileLinks = mobileMenu.querySelectorAll('.mobile-menu-link');
      mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
          if (isMobileMenuOpen) toggleMobileMenu();
        });
      });
    }
    
    // Resize handler
    window.addEventListener('resize', layout);
    
    // Font load handler
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(layout).catch(() => {});
    }
    
    // Initial load animation
    if (logo) {
      gsap.set(logo, { scale: 0 });
      gsap.to(logo, {
        scale: 1,
        duration: 0.6,
        ease,
        delay: 0.2
      });
    }
    
    if (navItems) {
      gsap.set(navItems, { width: 0, overflow: 'hidden' });
      gsap.to(navItems, {
        width: 'auto',
        duration: 0.6,
        ease,
        delay: 0.2
      });
    }
    
    // Set active link based on current page
    const currentPath = window.location.pathname;
    pills.forEach(pill => {
      const href = pill.getAttribute('href');
      if (href === currentPath || (currentPath === '/' && href === '#')) {
        pill.classList.add('is-active');
      }
    });
  }
  
  // Initialize when DOM and GSAP are ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      // Wait a bit for GSAP to load from CDN
      setTimeout(initPillNav, 100);
    });
  } else {
    setTimeout(initPillNav, 100);
  }
})();

