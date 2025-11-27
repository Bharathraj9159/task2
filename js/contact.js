
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

