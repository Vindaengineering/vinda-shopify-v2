// Vinda v2 — header scroll-state toggle
// Adds data-scroll-state="scrolled" once the page scrolls past 20px,
// triggering the frosted background defined in header.css.

(function () {
  const header = document.getElementById('VHeader');
  if (!header) return;

  let ticking = false;
  function update() {
    header.dataset.scrollState = window.scrollY > 20 ? 'scrolled' : 'top';
    ticking = false;
  }
  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(update);
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  update();

  // Cart open trigger — Wave 4 will hook the actual drawer; for now dispatch a global event.
  document.querySelectorAll('[data-cart-open]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.dispatchEvent(new CustomEvent('cart:open'));
    });
  });

  // Listen for cart:updated to refresh the badge without a reload.
  document.addEventListener('cart:updated', (e) => {
    const count = e.detail && typeof e.detail.item_count === 'number' ? e.detail.item_count : 0;
    document.querySelectorAll('[data-cart-count]').forEach(el => {
      el.textContent = count;
      el.classList.toggle('is-empty', count === 0);
    });
  });
})();
