// Scroll behavior - hide fixed elements when hero section ends
(function(){
  const root = document.documentElement;
  function toggle() {
    const heroSection = document.querySelector('.hero-section');
    if (!heroSection) return;
    
    // Get the bottom position of hero section
    const heroRect = heroSection.getBoundingClientRect();
    const heroBottom = heroRect.bottom + window.scrollY;
    
    // Hide contact-info and footer-links when scrolling past hero section end
    // Add small offset (50px) to hide slightly before hero ends for smoother transition
    if (window.scrollY + window.innerHeight > heroBottom - 50) {
      root.classList.add('hide-fixed');
    } else {
      root.classList.remove('hide-fixed');
    }
  }
  window.addEventListener('scroll', toggle, { passive: true });
  window.addEventListener('resize', toggle, { passive: true });
  toggle();
})();

