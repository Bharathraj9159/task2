
  // animate progress fills when section enters view
  (function animateSnapshot(){
    const snapshot = document.querySelector('.snapshot');
    if (!snapshot) return;

    const obs = new IntersectionObserver((entries, o) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          // animate each progress fill
          document.querySelectorAll('.fill').forEach(f => {
            const v = f.getAttribute('data-fill') || '0';
            f.style.width = v + '%';
          });
          // add in-view class for reveal animation
          snapshot.classList.add('in-view');
          o.disconnect();
        }
      });
    }, { threshold: 0.16 });

    obs.observe(snapshot);
  })();



  // Dashboard animations: counters + reveal + progress animate
document.addEventListener('DOMContentLoaded', () => {
  // simple intersection observer for reveal + stagger delays
  const reveals = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const delay = parseInt(el.dataset.animateDelay || 0, 10);
        setTimeout(() => el.classList.add('is-visible'), delay);
        io.unobserve(el);
      }
    });
  }, { threshold: 0.12 });

  reveals.forEach(r => io.observe(r));

  // animated counters
  const counters = document.querySelectorAll('.stat-value');
  counters.forEach(c => {
    const target = +c.dataset.target || 0;
    const start = 0;
    const duration = 950;
    let rafId = null;

    function animateCounter() {
      const startTime = performance.now();
      function tick(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const value = Math.round(start + (target - start) * easeOutCubic(progress));
        c.textContent = formatNumber(value);
        if (progress < 1) rafId = requestAnimationFrame(tick);
      }
      rafId = requestAnimationFrame(tick);
    }

    // start when visible
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          animateCounter();
          obs.unobserve(c);
        }
      });
    }, { threshold: 0.5 });
    obs.observe(c);
  });

  // progress fills animate when visible
  const progressFills = document.querySelectorAll('.progress-fill');
  progressFills.forEach(p => {
    const parent = p.closest('.reveal') || p;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          // read inline width
          const targetWidth = p.style.width || '0%';
          requestAnimationFrame(() => { p.style.width = targetWidth; });
          obs.unobserve(p);
        }
      });
    }, { threshold: 0.3 });
    obs.observe(parent);
  });

  // helpers
  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
  function formatNumber(n) {
    // small formatting for large numbers (1.2k)
    if (n >= 1000) return (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1) + 'k';
    return String(n);
  }
});
