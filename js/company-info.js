
  // count-up
  function animateCounts() {
    document.querySelectorAll('.stat-number').forEach(el => {
      const target = +el.getAttribute('data-target') || 0;
      const duration = 900; // ms
      let start = 0;
      const stepTime = Math.max(10, Math.floor(duration / target || 1));
      const timer = setInterval(() => {
        start += 1;
        el.textContent = start;
        if (start >= target) clearInterval(timer);
      }, stepTime);
    });
  }

  // ====== reveal-on-scroll using IntersectionObserver ======
  const obsOptions = { root: null, rootMargin: '0px', threshold: 0.12 };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        if (entry.target.closest('.hero-creative')) {
          animateCounts();
        }
        observer.unobserve(entry.target);
      }
    });
  }, obsOptions);

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  const hero = document.querySelector('.hero-creative');
  if (hero) {
    observer.observe(hero);
  }

  (function rotateTestimonials(){
    const items = document.querySelectorAll('.testi');
    if (!items.length) return;
    let idx = 0;
    items[idx].classList.add('active');
    setInterval(() => {
      items[idx].classList.remove('active');
      idx = (idx + 1) % items.length;
      items[idx].classList.add('active');
    }, 3800);
  })();


  // Testimonials carousel logic
(() => {
  const carousel = document.querySelector('.testi-carousel');
  const track = document.querySelector('.testi-track');
  const slides = Array.from(document.querySelectorAll('.testi-card'));
  const dotsContainer = document.querySelector('.testi-dots');
  const dots = Array.from(dotsContainer.querySelectorAll('.dot'));

  if (!carousel || slides.length === 0) return;

  let currentIndex = 0;
  let slideCount = slides.length;
  let autoInterval = 1500; // ms
  let timerId = null;
  let isPaused = false;
  let startX = 0;
  let isDragging = false;
  const supportsTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  // calculate slide width (first slide width)
  function slideWidth() {
    return slides[0].getBoundingClientRect().width + parseFloat(getComputedStyle(track).gap || 0);
  }

  // set the correct transform to show the current index
  function updateTrack() {
    const w = slideWidth();
    const offset = w * currentIndex;
    track.style.transform = `translateX(-${offset}px)`;
    updateDots();
    // update aria for slides
    slides.forEach((s, i) => s.setAttribute('aria-hidden', i !== currentIndex));
  }

  function updateDots() {
    dots.forEach((d, i) => {
      const sel = i === currentIndex;
      d.setAttribute('aria-selected', sel ? 'true' : 'false');
      d.classList.toggle('active', sel);
    });
  }

  function goTo(index) {
    currentIndex = (index + slideCount) % slideCount;
    updateTrack();
  }

  function next() { goTo(currentIndex + 1); }
  function prev() { goTo(currentIndex - 1); }

  // Autoplay
  function startAuto() {
    stopAuto();
    timerId = setInterval(() => {
      if (!isPaused) next();
    }, autoInterval);
  }
  function stopAuto() {
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }
  }

  // Pause on hover/focus
  carousel.addEventListener('mouseenter', () => { isPaused = true; });
  carousel.addEventListener('mouseleave', () => { isPaused = false; });
  carousel.addEventListener('focusin', () => { isPaused = true; });
  carousel.addEventListener('focusout', () => { isPaused = false; });

  // Dots click
  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      goTo(i);
      // restart autoplay so timing feels natural after manual action
      startAuto();
    });
    dot.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        goTo(i);
        startAuto();
      }
    });
  });

  // Keyboard navigation
  carousel.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { next(); startAuto(); }
    if (e.key === 'ArrowLeft') { prev(); startAuto(); }
  });

  // Resize handling (recalc width)
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(updateTrack, 120);
  });

  // Touch / swipe support
  if (supportsTouch) {
    track.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      isDragging = true;
      stopAuto();
    }, { passive: true });

    track.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      const x = e.touches[0].clientX;
      const diff = startX - x;
      // small drag threshold -> visually move track slightly (optional)
      track.style.transition = 'none';
      track.style.transform = `translateX(-${currentIndex * slideWidth() + diff}px)`;
    }, { passive: true });

    track.addEventListener('touchend', (e) => {
      track.style.transition = ''; // restore transition CSS
      isDragging = false;
      const endX = e.changedTouches[0].clientX;
      const delta = startX - endX;
      const threshold = Math.min(40, window.innerWidth * 0.06); // threshold to change slide
      if (delta > threshold) next();
      else if (delta < -threshold) prev();
      else updateTrack();
      startAuto();
    }, { passive: true });
  } else {
    // mouse drag (optional)
    let mouseStart = 0;
    track.addEventListener('mousedown', (e) => {
      mouseStart = e.clientX;
      isDragging = true;
      track.style.transition = 'none';
      stopAuto();
      e.preventDefault();
    });
    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const diff = mouseStart - e.clientX;
      track.style.transform = `translateX(-${currentIndex * slideWidth() + diff}px)`;
    });
    window.addEventListener('mouseup', (e) => {
      if (!isDragging) return;
      isDragging = false;
      track.style.transition = '';
      const diff = mouseStart - e.clientX;
      const threshold = Math.min(40, window.innerWidth * 0.06);
      if (diff > threshold) next();
      else if (diff < -threshold) prev();
      else updateTrack();
      startAuto();
    });
  }

  // initial setup
  slides.forEach((s, i) => {
    s.style.flexShrink = 0;
    s.style.width = `${s.getBoundingClientRect().width}px`;
  });

  // Make sure first slide is visible and aria updated
  goTo(0);
  startAuto();

  // When page/tab hidden -> pause to save CPU
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopAuto();
    else startAuto();
  });

})();
