
document.addEventListener('DOMContentLoaded', function () {

  // placeholder hack for floating labels
  document.querySelectorAll('.cc-form input, .cc-form textarea').forEach(el => {
    if (!el.placeholder) el.placeholder = ' ';
  });

  // reveal on scroll
  (function reveal(){
    const obs = new IntersectionObserver((entries, o) => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          en.target.classList.add('in-view');
          o.unobserve(en.target);
        }
      });
    }, {threshold:0.12});
    document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
  })();

  // form progress and submit mock
  const form = document.getElementById('ccForm');
  const fill = document.querySelector('.progress-fill');
  const status = document.getElementById('ccStatus');
  const clearBtn = document.getElementById('ccClear');

  function updateProgress() {
    if (!form || !fill) return;
    const fields = Array.from(form.querySelectorAll('input, textarea'));
    const total = fields.length;
    const filled = fields.filter(f => f.value.trim() !== '').length;
    const pct = Math.round((filled/total)*100);
    fill.style.width = pct + '%';
  }

  if (form) {
    form.addEventListener('input', updateProgress);
    updateProgress();

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = form.name.value.trim();
      const email = form.email.value.trim();
      const msg = form.message.value.trim();
      if (!name || !email || !msg) {
        status.style.color = 'crimson';
        status.textContent = 'Please fill all fields.';
        return;
      }
      status.style.color = 'green';
      status.textContent = 'Sending…';
      setTimeout(() => {
        status.textContent = 'Thanks — message sent.';
        form.reset();
        updateProgress();
        setTimeout(()=> status.textContent = '', 3500);
      }, 900);
    });
  }
  if (clearBtn && form) clearBtn.addEventListener('click', () => { form.reset(); updateProgress(); });

  // FAQ accordion (single open)
  document.querySelectorAll('.faq-q').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const wasOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
      if (!wasOpen) item.classList.add('open');
    });
  });

});




/* Sunscribe form — simple client-side validation + simulated send
   Replace sendEmailSimulation with real API call when ready.
*/
(function () {
  const form = document.getElementById('sunscribeForm');
  const emailInput = document.getElementById('sunscribeEmail');
  const btn = document.getElementById('sunscribeBtn');
  const msg = document.getElementById('sunscribeMsg');

  // Simple email validator
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  // Simulate sending (returns Promise)
  function sendEmailSimulation(email) {
    return new Promise((resolve, reject) => {
      // simulate network delay
      setTimeout(() => {
        // 95% success chance
        if (Math.random() < 0.95) resolve({ ok: true });
        else reject(new Error('Network error'));
      }, 900);
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const val = emailInput.value.trim();

    msg.style.color = '#000';
    if (!isValidEmail(val)) {
      msg.textContent = 'Please enter a valid email address.';
      msg.style.color = '#8b1a1a';
      emailInput.focus();
      return;
    }

    // UI: show sending
    btn.disabled = true;
    const originalText = btn.textContent;
    btn.textContent = 'Sending...';
    msg.textContent = '';

    try {
      await sendEmailSimulation(val);
      msg.style.color = '#0f5132';
      msg.textContent = 'Thanks — check your inbox!';
      emailInput.value = '';
    } catch (err) {
      msg.style.color = '#8b1a1a';
      msg.textContent = 'Oops — something went wrong. Try again.';
    } finally {
      btn.disabled = false;
      btn.textContent = originalText;
    }
  }

  if (form) {
    form.addEventListener('submit', handleSubmit);
  }

  // allow Enter to submit from input
  emailInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      form.requestSubmit();
    }
  });

})();