
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

// Number animation (runs only when section is visible)
function animateNumber(valueElement) {
  const target = +valueElement.getAttribute("data-target");
  let count = 0;

  const updateCount = () => {
    const increment = target / 100;

    if (count < target) {
      count += increment;
      valueElement.innerText = Math.floor(count);
      requestAnimationFrame(updateCount);
    } else {
      valueElement.innerText = target;
    }
  };

  updateCount();
}

// Observer for visibility
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const element = entry.target;

        // Prevent re-animating multiple times
        if (!element.classList.contains("animated")) {
          element.classList.add("animated");
          animateNumber(element);
        }
      }
    });
  },
  { threshold: 0.4 } // Runs when 40% of element is visible
);

// Attach observer to all stat counters
document.querySelectorAll(".dashboard-insight-value").forEach((el) => {
  observer.observe(el);
});


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

/* Progress fill + count animation triggered when .snap-progress-card is in view.
   - Uses IntersectionObserver
   - Staggers each prog-item using data-index and --stagger
   - Animates width and percentage counter
*/

(function () {
  const card = document.querySelector('.snap-progress-card');
  if (!card) return;

  const baseDelay = parseInt(card.dataset.animateDelay || 0, 10) || 0;
  const items = Array.from(card.querySelectorAll('.prog-item'));
  const stagger = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--stagger')) || 140;
  const DURATION = 1100; // ms for percent/count animation

  function animateItem(item) {
    const target = Math.max(0, Math.min(100, parseInt(item.dataset.fill || 0, 10)));
    const fillEl = item.querySelector('.fill');
    const fillShimmer = item.querySelector('.fill-shimmer');
    const percentEl = item.querySelector('.percent');
    const bar = item.querySelector('.bar');

    // set ARIA
    bar.setAttribute('aria-valuenow', target);

    // Start: remove shimmer after small delay so UX feels like "loading → done"
    setTimeout(() => {
      // animate width
      // use small easing by setting width directly and letting CSS transition run
      requestAnimationFrame(() => {
        fillEl.style.width = target + '%';
      });

      // hide shimmer slightly later so it crosses the bar
      setTimeout(() => {
        if (fillShimmer) fillShimmer.style.opacity = '0';
      }, Math.min(600, DURATION / 2));

      // Counting animation (numeric)
      const start = performance.now();
      function tick(now) {
        const elapsed = Math.min(now - start, DURATION);
        const progress = elapsed / DURATION;
        const current = Math.round(progress * target);
        percentEl.innerText = current + '%';
        if (elapsed < DURATION) {
          requestAnimationFrame(tick);
        } else {
          percentEl.innerText = target + '%';
          if (target === 100) item.classList.add('complete');
        }
      }
      requestAnimationFrame(tick);
    }, 120); // slight delay before filling to allow shimmer impression
  }

  // IntersectionObserver to trigger when card visible
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      // reveal the card (optional)
      card.classList.add('revealed');

      // stagger items and animate
      items.forEach((it, idx) => {
        const itemDelayAttr = parseInt(it.dataset.index, 10) || idx;
        const totalDelay = baseDelay + (itemDelayAttr * stagger);
        setTimeout(() => {
          it.classList.add('visible');
          animateItem(it);
        }, totalDelay);
      });

      obs.unobserve(entry.target);
    });
  }, { threshold: 0.28 });

  io.observe(card);
})();
  // helpers
  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
  function formatNumber(n) {
    // small formatting for large numbers (1.2k)
    if (n >= 1000) return (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1) + 'k';
    return String(n);
  }
});



// recent activity


(function () {
  const panel = document.querySelector('.dashboard-activity-full');
  if (!panel) return;

  const delay = parseInt(panel.dataset.animateDelay) || 0;

  // Reveal panel first
  setTimeout(() => {
    panel.classList.add('visible');

    const items = panel.querySelectorAll('.timeline-item');

    items.forEach((item, index) => {
      const itemDelay = parseInt(item.dataset.itemDelay) || (index * 100);
      setTimeout(() => {
        item.classList.add('visible');
      }, itemDelay);
    });

  }, delay);
})();