
/* Animated analytics interactions
   - IntersectionObserver triggers animations when visible
   - Smooth count-up supports integers & decimals (one decimal)
   - Progress bars animate width and update visible percent
*/

(function () {
  // helper: count up
  function countUp(el, target, duration = 900) {
    const isFloat = String(target).includes('.');
    const start = 0;
    const startTs = performance.now();
    const to = isFloat ? parseFloat(target) : parseInt(target,10);

    function tick(now) {
      const elapsed = Math.min(now - startTs, duration);
      const progress = elapsed / duration;
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic-ish
      const current = isFloat ? (eased * to) : Math.round(eased * to);
      el.textContent = isFloat ? current.toFixed(1) : current;
      if (elapsed < duration) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = isFloat ? to.toFixed(1) : to;
      }
    }
    requestAnimationFrame(tick);
  }

  // animate progress bars
  function animateProgressBars(root) {
    root.querySelectorAll('.progress-bar').forEach(bar => {
      const pct = parseFloat(bar.getAttribute('data-progress') || '0');
      // clamp
      const final = Math.max(0, Math.min(100, pct));
      // small delay per bar
      const delay = (Array.from(root.querySelectorAll('.progress-bar')).indexOf(bar)) * 120;
      setTimeout(() => {
        bar.style.width = final + '%';
        // update inner label after width animation begins
        const label = bar.querySelector('.progress-value');
        if (label) label.textContent = Math.round(final) + '%';
      }, 160 + delay);
    });
  }

  // reveal sparkline
  function revealSparkline(root) {
    root.querySelectorAll('.sparkline').forEach(line => {
      // force reflow then add class to start CSS transition
      void line.getBoundingClientRect();
      line.classList.add('draw');
    });
    // also show fill
    root.querySelectorAll('.sparkfill').forEach(f => {
      void f.getBoundingClientRect();
      f.classList.add('draw');
    });
  }

  // orchestrator when component visible
  function triggerAnimations(root) {
    // KPI counts
    root.querySelectorAll('.kpi-value').forEach(el => {
      if (el.dataset.__animated) return;
      const raw = el.getAttribute('data-target') || '0';
      el.dataset.__animated = '1';
      countUp(el, raw, 900);
    });
    // sparkline + progress
    revealSparkline(root);
    animateProgressBars(root);
  }

  // use IntersectionObserver to trigger when card enters viewport
  const cards = document.querySelectorAll('.animated-card');
  if ('IntersectionObserver' in window) {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          triggerAnimations(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.35 });
    cards.forEach(c => obs.observe(c));
  } else {
    // fallback: just fire immediately
    cards.forEach(c => triggerAnimations(c));
  }

  // small accessibility improvement: allow keyboard focus to re-trigger animation
  cards.forEach(c => {
    c.addEventListener('focusin', () => triggerAnimations(c));
  });

})();


  // 3) small intersection observer for when section is visible
  (function initObserver(){
    const section = document.querySelector('.unique-section');
    if (!section) return;
    const obs = new IntersectionObserver((entries, o) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // run animations only once
          runKpiCounts();
          revealAnalytics();
          o.disconnect();
        }
      });
    }, {threshold: 0.18});
    obs.observe(section);
  })();


  const historyData = {
  "2019": {
    text: "Company founded with a mission to deliver modern solutions.",
    stat: 25
  },
  "2020": {
    text: "Launched our first product and acquired strong early clients.",
    stat: 80
  },
  "2021": {
    text: "Scaled to a larger team and expanded our tech stack.",
    stat: 130
  },
  "2022": {
    text: "Introduced automation features; boosted customer growth.",
    stat: 220
  },
  "2023": {
    text: "Crossed 500 clients and moved into global operations.",
    stat: 500
  }
};

const points = document.querySelectorAll(".h-point");
const card = document.getElementById("historyCard");
const hYear = document.getElementById("hYear");
const hContent = document.getElementById("hContent");
const hStat = document.getElementById("hStat");

points.forEach(point => {
  point.addEventListener("click", () => {
    // remove active
    points.forEach(p => p.classList.remove("active"));
    point.classList.add("active");

    const year = point.dataset.year;

    hYear.textContent = year;
    hContent.textContent = historyData[year].text;
    animateStat(historyData[year].stat);

    // re-animate card
    card.style.animation = "none";
    setTimeout(() => card.style.animation = "", 10);
  });
});

// animated counter
function animateStat(target) {
  let value = 0;
  const duration = 600;
  const interval = setInterval(() => {
    value += Math.ceil(target / 25);
    if (value >= target) {
      value = target;
      clearInterval(interval);
    }
    hStat.textContent = value;
  }, duration / 25);
}


/* Tiny form handling — validate email and show message (no frameworks) */
(function () {
  const form = document.getElementById('ezy__comingsoon10-subscription-form');
  const input = document.getElementById('ezy__comingsoon10-subscription-email');
  const msg = document.getElementById('ezy__comingsoon10-msg');

  function isValidEmail(email) {
    // simple email regex — adequate for UX validation
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const val = input.value.trim();
      if (!isValidEmail(val)) {
        msg.textContent = 'Please enter a valid email address.';
        msg.style.color = '#8b1a1a';
        input.focus();
        return;
      }

      // simulate success (replace with real submission)
      msg.textContent = 'Thanks — we will notify you!';
      msg.style.color = '#0f5132';
      input.value = '';
      // small visual confirmation
      input.classList.add('submitted');
      setTimeout(() => input.classList.remove('submitted'), 900);
    });
  }
})();


// faq

/* Vanilla JS: collapse/expand behavior with height animation and ARIA updates.
   - Allows multiple items open (like original). To change to accordion-only-open-one,
     modify toggle logic to close others.
*/

(function () {
  const list = document.getElementById('faqList');
  if (!list) return;

  // initialize: all collapse nodes with class 'show' should expand to proper height
  function setInitialHeights() {
    list.querySelectorAll('.ezy__faq11-collapse').forEach(node => {
      if (node.classList.contains('show')) {
        node.style.height = node.scrollHeight + 'px';
        node.style.opacity = 1;
      } else {
        node.style.height = '0px';
        node.style.opacity = 0;
      }
    });
  }

  // toggle function
  function toggleItem(btn) {
    const id = btn.getAttribute('aria-controls');
    const panel = document.getElementById(id);
    if (!panel) return;

    const isOpen = btn.getAttribute('aria-expanded') === 'true';

    if (isOpen) {
      // close
      btn.setAttribute('aria-expanded', 'false');
      panel.classList.remove('show');

      // animate height from current to 0
      panel.style.height = panel.scrollHeight + 'px';
      // allow next frame then set to 0
      requestAnimationFrame(() => {
        panel.style.height = '0px';
        panel.style.opacity = 0;
      });
    } else {
      // open
      btn.setAttribute('aria-expanded', 'true');
      panel.classList.add('show');

      // set height to scrollHeight to animate
      panel.style.height = panel.scrollHeight + 'px';
      panel.style.opacity = 1;

      // after transition, remove the explicit height so content can resize naturally
      panel.addEventListener('transitionend', function te(e) {
        if (e.propertyName === 'height') {
          panel.style.height = 'auto';
          panel.removeEventListener('transitionend', te);
        }
      });
    }
  }

  // click and keyboard handlers for toggle buttons
  list.addEventListener('click', (e) => {
    const btn = e.target.closest('.ezy__faq11-btn-collapse');
    if (!btn) return;
    e.preventDefault();
    toggleItem(btn);
  });

  // keyboard support: Enter/Space toggles when focused
  list.addEventListener('keydown', (e) => {
    if (e.target.matches('.ezy__faq11-btn-collapse') && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      toggleItem(e.target);
    }
  });

  // set up initial heights on load
  window.addEventListener('load', setInitialHeights);
  // also on resize - adjust open panels
  window.addEventListener('resize', () => {
    // reset explicit heights if panel is open (auto adjust)
    list.querySelectorAll('.ezy__faq11-collapse.show').forEach(panel => {
      panel.style.height = panel.scrollHeight + 'px';
      // after small timeout set to auto
      setTimeout(() => panel.style.height = 'auto', 350);
    });
  });

  // ensure accessible semantics for existing 'show' (first item)
  // if you want only one open at a time (accordion behavior), uncomment the block below:
  /*
  list.addEventListener('click', (e) => {
    const btn = e.target.closest('.ezy__faq11-btn-collapse');
    if (!btn) return;
    const allBtns = list.querySelectorAll('.ezy__faq11-btn-collapse');
    allBtns.forEach(b => {
      if (b !== btn) {
        const panel = document.getElementById(b.getAttribute('aria-controls'));
        if (panel && b.getAttribute('aria-expanded') === 'true') {
          b.setAttribute('aria-expanded','false');
          panel.classList.remove('show');
          panel.style.height = '0px';
          panel.style.opacity = 0;
        }
      }
    });
    toggleItem(btn);
  });
  */
})();