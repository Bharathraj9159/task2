// Quick navigation search widget
(function () {
  const items = [
    { title: 'Dashboard', href: './index.html', desc: 'Main dashboard' },
    { title: 'Company Info', href: './company-info.html', desc: 'About the company' },
    { title: 'History', href: './history.html', desc: 'Company timeline' },
    { title: 'Contact', href: './contact.html', desc: 'Contact page' }
  ];

  const wrap = document.getElementById('searchWrap');
  if (!wrap) return;

  const input = wrap.querySelector('#navSearch');
  const list = wrap.querySelector('#navList');
  const toggle = wrap.querySelector('#searchToggle');

  // Render items
  function renderList(filtered = items) {
    list.innerHTML = '';
    filtered.forEach((it, idx) => {
      const li = document.createElement('li');
      li.setAttribute('role', 'option');
      li.dataset.href = it.href;
      li.tabIndex = -1;
      li.innerHTML = `<div><span>${it.title}</span><small>${it.desc}</small></div>`;
      li.addEventListener('click', () => navigateTo(it.href));
      li.addEventListener('mouseenter', () => setSelectedIndex(idx));
      list.appendChild(li);
    });
    // reset selection
    selectedIndex = -1;
  }

  // Navigation helper
  function navigateTo(href) {
    // optional: you could check window.location and only set location if different
    window.location.href = href;
  }

  // Filter helper
  function filterList(q) {
    const qn = q.trim().toLowerCase();
    if (!qn) return items.slice();
    return items.filter(i => i.title.toLowerCase().includes(qn) || i.desc.toLowerCase().includes(qn));
  }

  // Keyboard navigation
  let selectedIndex = -1;
  function setSelectedIndex(i) {
    const children = Array.from(list.children);
    children.forEach((c, idx) => {
      const sel = idx === i;
      c.setAttribute('aria-selected', sel ? 'true' : 'false');
      if (sel) c.scrollIntoView({ block: 'nearest' });
    });
    selectedIndex = i;
  }

  input.addEventListener('input', (e) => {
    const q = e.target.value;
    const filtered = filterList(q);
    if (filtered.length) {
      renderList(filtered);
      list.hidden = false;
      input.setAttribute('aria-expanded', 'true');
    } else {
      list.hidden = true;
      input.setAttribute('aria-expanded', 'false');
    }
  });

  // toggle button opens/closes list and focuses input
  toggle.addEventListener('click', () => {
    if (list.hidden) {
      renderList(items);
      list.hidden = false;
      input.setAttribute('aria-expanded', 'true');
      input.focus();
    } else {
      list.hidden = true;
      input.setAttribute('aria-expanded', 'false');
    }
  });

  // keyboard handling
  input.addEventListener('keydown', (e) => {
    const visibleItems = Array.from(list.children);
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (visibleItems.length === 0) return;
      const next = Math.min(selectedIndex + 1, visibleItems.length - 1);
      setSelectedIndex(next);
      visibleItems[next].focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (visibleItems.length === 0) return;
      const prev = Math.max(selectedIndex - 1, 0);
      setSelectedIndex(prev);
      visibleItems[prev].focus();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && visibleItems[selectedIndex]) {
        const href = visibleItems[selectedIndex].dataset.href;
        if (href) navigateTo(href);
      } else if (visibleItems.length === 1) {
        // if only one suggestion, go there on Enter
        navigateTo(visibleItems[0].dataset.href);
      }
    } else if (e.key === 'Escape') {
      list.hidden = true;
      input.setAttribute('aria-expanded', 'false');
      input.blur();
    }
  });

  // allow arrow keys on list items and Enter to navigate
  list.addEventListener('keydown', (e) => {
    const itemsEls = Array.from(list.children);
    const idx = itemsEls.indexOf(document.activeElement);
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = Math.min(idx + 1, itemsEls.length - 1);
      itemsEls[next].focus(); setSelectedIndex(next);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = Math.max(idx - 1, 0);
      itemsEls[prev].focus(); setSelectedIndex(prev);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const href = document.activeElement.dataset.href;
      if (href) navigateTo(href);
    } else if (e.key === 'Escape') {
      list.hidden = true; input.setAttribute('aria-expanded', 'false'); input.focus();
    }
  });

  // close if clicked outside
  document.addEventListener('click', (ev) => {
    if (!wrap.contains(ev.target)) {
      list.hidden = true;
      input.setAttribute('aria-expanded', 'false');
    }
  });

  // initial render but keep hidden until use
  renderList(items);
  list.hidden = true;
})();
