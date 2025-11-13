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
  if (!cards.length || !('IntersectionObserver' in window)) return;

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

