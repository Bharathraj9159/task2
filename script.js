// LOADER SCRIPT


/* ======== AUTO-HIDE AFTER 5 SECONDS ======== */
setTimeout(() => {
  const el = document.getElementById("site-loader");
  if (!el) return;
  el.classList.add("hide");

  setTimeout(() => el.remove(), 400);
}, 5000);


// SEACRH BAR


(function () {
  const box = document.getElementById("searchBar");
  const input = box.querySelector(".search-bar-input");
  const dropdowns = box.querySelector("#searchBarDropdowns");
  const buttons = Array.from(box.querySelectorAll(".search-bar-dd-btn"));

  function openDD() {
    dropdowns.classList.add("open");
  }

  function closeDD() {
    dropdowns.classList.remove("open");
  }

  // Show dropdown when focusing
  input.addEventListener("focus", openDD);

  // Filter buttons based on input
  input.addEventListener("input", () => {
    const query = input.value.toLowerCase();

    buttons.forEach(btn => {
      btn.style.display = btn.textContent.toLowerCase().includes(query)
        ? "block"
        : "none";
    });

    openDD(); // keep open while typing
  });

  // Clicking a button → go to page
  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      window.location.href = btn.dataset.link;
    });
  });

  // Press Enter → go to best match
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();

      const q = input.value.toLowerCase();

      // Exact match check
      let exact = buttons.find(b => b.textContent.toLowerCase() === q);

      if (exact) {
        window.location.href = exact.dataset.link;
        return;
      }

      // Otherwise go to first visible button
      let firstVisible = buttons.find(b => b.style.display !== "none");

      if (firstVisible) {
        window.location.href = firstVisible.dataset.link;
      }
    }
  });

  // Close when clicking outside
  document.addEventListener("click", (e) => {
    if (!box.contains(e.target)) closeDD();
  });

  // ESC closes
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeDD();
  });
})();




/* =========================
   Namespaced modal open/close behavior
   - opens on #openLogin click
   - closes on escape / overlay click / close button
   - focus into modal when opened, returns focus on close
   - toggles body.login-section--open for scroll lock
   ========================= */

(function () {
  const openBtn = document.getElementById("openLogin");
  const overlay = document.getElementById("loginModal"); // .login-section__overlay
  const dialog = overlay.querySelector(".login-section__dialog");
  const closeBtn = document.getElementById("closeLogin");
  const firstFocusable = overlay.querySelector('.form .input, .form button, .card .blind_input') ;
  let lastFocused = null;

  function openModal() {
    lastFocused = document.activeElement;
    overlay.classList.add("open");
    overlay.setAttribute("aria-hidden", "false");
    document.body.classList.add("login-section--open");
    // small delay then focus first input
    setTimeout(() => {
      if (firstFocusable) firstFocusable.focus();
    }, 160);
    if (openBtn) openBtn.setAttribute("aria-expanded", "true");
    document.addEventListener("keydown", onKeyDown);
  }

  function closeModal() {
    overlay.classList.remove("open");
    overlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("login-section--open");
    if (openBtn) openBtn.setAttribute("aria-expanded", "false");
    if (lastFocused) lastFocused.focus();
    document.removeEventListener("keydown", onKeyDown);
  }

  function onKeyDown(e) {
    if (e.key === "Escape") {
      closeModal();
    }
    // note: basic Tab behavior left to browser; for full focus trap use a11y library
  }

  // open handlers
  if (openBtn) openBtn.addEventListener("click", openModal);

  // close button handler
  if (closeBtn) closeBtn.addEventListener("click", closeModal);

  // click outside to close
  overlay.addEventListener("mousedown", function (ev) {
    if (ev.target === overlay) closeModal();
  });

  // stop propagation inside dialog area
  dialog.addEventListener("mousedown", function (ev) {
    ev.stopPropagation();
  });

  // submit button behavior (closes modal as a placeholder)
  const submitBtn = overlay.querySelector(".submit");
  if (submitBtn) {
    submitBtn.addEventListener("click", function () {
      // place your validation / ajax here
      // right now we close to simulate success
      closeModal();
    });
  }
})();