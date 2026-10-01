// Vinda v2 — click-to-load Google Maps embed.
// The iframe (and Google's cookies) are only created after the visitor
// clicks "Visa karta", so nothing third-party loads before consent.
(function () {
  if (window.__vindaMapEmbed) return;
  window.__vindaMapEmbed = true;

  function load(panel) {
    var src = panel.getAttribute('data-map-src');
    if (!src || panel.dataset.loaded === 'true') return;
    if (src.indexOf('https://www.google.com/maps/embed') !== 0) return;
    var iframe = document.createElement('iframe');
    iframe.src = src;
    iframe.title = panel.getAttribute('data-map-title') || 'Google Maps';
    iframe.loading = 'lazy';
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    iframe.setAttribute('allowfullscreen', '');
    iframe.className = 'v-map__frame';
    panel.dataset.loaded = 'true';
    panel.appendChild(iframe);
    var placeholder = panel.querySelector('[data-map-placeholder]');
    if (placeholder) placeholder.setAttribute('hidden', '');
  }

  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-map-load]');
    if (!btn) return;
    e.preventDefault();
    var panel = btn.closest('[data-map-embed]');
    if (panel) load(panel);
  });
})();
