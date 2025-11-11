// Typing effects for multiple sections

// Typing effect for "Simplu. Transparent. Relevant."
(function(){
  const el = document.getElementById('type-text');
  const cursor = document.getElementById('type-cursor');
  if (!el || !cursor) return;
  
  const list = ["Simplu.", "Transparent.", "Relevant."];
  const typingSpeed = 75; // ms per char
  const deletingSpeed = 30; // ms per char delete
  const pauseDuration = 1500; // ms hold full text
  let textIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  function type(){
    const full = list[textIndex % list.length];
    if (!isDeleting) {
      if (charIndex <= full.length) {
        el.textContent = full.slice(0, charIndex);
        charIndex++;
        setTimeout(type, typingSpeed);
      } else {
        setTimeout(() => { isDeleting = true; setTimeout(type, deletingSpeed); }, pauseDuration);
      }
    } else {
      if (charIndex > 0) {
        el.textContent = full.slice(0, charIndex - 1);
        charIndex--;
        setTimeout(type, deletingSpeed);
      } else {
        isDeleting = false;
        textIndex++;
        setTimeout(type, typingSpeed);
      }
    }
  }

  // Start typing when section becomes visible
  const section = document.querySelector('.type-nunito');
  if (section && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries)=>{
      entries.forEach((entry)=>{
        if (entry.isIntersecting) { type(); io.unobserve(section); }
      })
    }, { threshold: 0.25 });
    io.observe(section);
  } else {
    type();
  }
})();

// Reveal cards in Simplu/Transparent/Relevat section
(function(){
  const cards = document.querySelectorAll('.type-card');
  const heading = document.querySelector('.type-heading');
  if (!cards.length || !heading || !('IntersectionObserver' in window)) return;

  // Detect mobile device
  const isMobile = window.matchMedia('(max-width: 768px)').matches;

  const io = new IntersectionObserver((entries)=>{
    entries.forEach((entry)=>{
      if (entry.isIntersecting) {
        requestAnimationFrame(() => {
          entry.target.classList.add('is-visible');
        });
      }
    });
  }, { threshold: 0.35, rootMargin: '0px 0px -10% 0px' });
  cards.forEach((card)=>io.observe(card));

  // Disable sticky title behavior on mobile
  if (isMobile) {
    heading.style.position = 'static';
    return;
  }

  const typeGrid = document.querySelector('.type-grid');
  const hideTrigger = typeGrid ? typeGrid.querySelector('.type-prompt') : null;
  if (!hideTrigger || !typeGrid) return;

  const revealObserver = new IntersectionObserver((entries)=>{
    entries.forEach(entry => {
      const ratio = entry.intersectionRatio;
      if (ratio > 0.25) {
        entry.target.classList.add('is-visible');
      } else if (entry.boundingClientRect.top > entry.rootBounds.bottom) {
        entry.target.classList.remove('is-visible');
      }
    });
  }, { threshold: [0, 0.2, 0.4, 0.6, 0.8, 1], rootMargin: '0px 0px -20% 0px' });

  cards.forEach(card => revealObserver.observe(card));

  const headingHideObserver = new IntersectionObserver((entries)=>{
    entries.forEach(entry => {
      requestAnimationFrame(() => {
        const passedTop = entry.boundingClientRect.top <= entry.rootBounds.top;
        heading.classList.toggle('is-hidden', passedTop);
      });
    });
  }, { threshold: 0, rootMargin: '-50% 0px 0px 0px' });

  headingHideObserver.observe(hideTrigger);
})();

// Reveal panels in visibility/about sections
(function(){
  const revealables = document.querySelectorAll('.visibility-item, .about-item');
  if (!revealables.length || !('IntersectionObserver' in window)) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3, rootMargin: '0px 0px -15% 0px' });

  revealables.forEach((el, index) => {
    el.style.transitionDelay = `${index * 0.08}s`;
    io.observe(el);
  });
})();

