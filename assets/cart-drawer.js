// Vinda v2 — cart drawer + sticky cart bar wiring.
// Vanilla JS. Talks to Shopify via /cart/add.js, /cart/change.js, /cart.js.
// Custom events: cart:open, cart:close, cart:updated.

(function () {
  // ─── Cart drawer ─────────────────────────────────────────
  class CartDrawer extends HTMLElement {
    constructor() {
      super();
      this.panel = this.querySelector('.v-drawer__panel');
      this.itemsEl = this.querySelector('[data-drawer-items]');
      this.footerEl = this.querySelector('[data-drawer-footer]');
      this.totalEl = this.querySelector('[data-drawer-total]');
      this.countEl = this.querySelector('[data-drawer-count]');
      this.lastFocus = null;
      this.moneyFormat = this.dataset.moneyFormat || '${{amount}}';
    }

    connectedCallback() {
      this.querySelectorAll('[data-drawer-close]').forEach(el =>
        el.addEventListener('click', () => this.close())
      );
      this.addEventListener('keydown', e => {
        if (e.key === 'Escape') this.close();
        if (e.key === 'Tab') this.trapFocus(e);
      });
      this.addEventListener('click', e => {
        const remove = e.target.closest('[data-drawer-remove]');
        if (remove) {
          e.preventDefault();
          this.removeItem(remove.dataset.itemKey);
        }
      });
      document.addEventListener('cart:open', () => this.open());
      document.addEventListener('cart:close', () => this.close());
    }

    open() {
      this.lastFocus = document.activeElement;
      this.dataset.open = 'true';
      this.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      // hide sticky bar while drawer is open
      const sb = document.getElementById('VStickyBar');
      if (sb) sb.dataset.visible = 'false';
      // focus close button
      requestAnimationFrame(() => {
        const close = this.querySelector('[data-drawer-close]');
        if (close) close.focus();
      });
    }

    close() {
      this.dataset.open = 'false';
      this.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (this.lastFocus && typeof this.lastFocus.focus === 'function') {
        this.lastFocus.focus();
      }
      // re-evaluate sticky bar visibility
      window.dispatchEvent(new Event('scroll'));
    }

    trapFocus(e) {
      const focusables = this.panel.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    async removeItem(key) {
      try {
        const res = await fetch('/cart/change.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: key, quantity: 0 }),
        });
        const cart = await res.json();
        await this.refresh(cart);
      } catch (err) {
        console.error('Cart remove failed', err);
      }
    }

    async refresh(cart) {
      // Always re-fetch to get rendered HTML for items via Section Rendering API.
      // Simpler: rebuild items list client-side from /cart.js JSON.
      if (!cart) {
        const res = await fetch('/cart.js');
        cart = await res.json();
      }
      this.renderItems(cart);
      this.renderTotals(cart);
      document.dispatchEvent(new CustomEvent('cart:updated', { detail: cart }));
    }

    renderItems(cart) {
      if (cart.item_count === 0) {
        this.itemsEl.innerHTML = `
          <div class="v-drawer__empty">
            <p class="v-drawer__empty-title">Your cart is empty.</p>
            <p class="v-drawer__empty-sub">Add a product to get started.</p>
          </div>`;
        this.footerEl.classList.add('is-hidden');
        return;
      }

      const html = cart.items.map(item => {
        const img = item.featured_image && item.featured_image.url
          ? `<img src="${item.featured_image.url}&width=200" alt="${escapeHtml(item.product_title)}" width="68" height="68" loading="lazy">`
          : '';
        const variant = (item.variant_title && item.variant_title !== 'Default Title')
          ? `<p class="v-drawer__item-specs v-mono">${escapeHtml(item.variant_title)}</p>`
          : '';
        return `
          <div class="v-drawer__item" data-drawer-item data-item-key="${item.key}">
            <div class="v-drawer__item-media">${img}</div>
            <div class="v-drawer__item-body">
              <p class="v-drawer__item-title">${escapeHtml(item.product_title)}</p>
              ${variant}
              <div class="v-drawer__item-row">
                <span class="v-drawer__item-price" data-item-price>${formatMoney(item.final_line_price, this.moneyFormat)}</span>
                <button type="button" class="v-drawer__item-remove" data-drawer-remove data-item-key="${item.key}">Remove</button>
              </div>
            </div>
          </div>`;
      }).join('');
      this.itemsEl.innerHTML = html;
      this.footerEl.classList.remove('is-hidden');
    }

    renderTotals(cart) {
      if (this.totalEl) this.totalEl.textContent = formatMoney(cart.total_price, this.moneyFormat);
      if (this.countEl) this.countEl.textContent = cart.item_count > 0 ? `(${cart.item_count})` : '';
    }
  }

  if (!customElements.get('cart-drawer')) {
    customElements.define('cart-drawer', CartDrawer);
  }

  // ─── Intercept any [data-atc-form] form across the page ──
  document.addEventListener('submit', async (e) => {
    const form = e.target.closest('[data-atc-form]');
    if (!form) return;
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const original = btn ? btn.textContent : '';
    if (btn) { btn.disabled = true; btn.textContent = 'Adding…'; }
    try {
      const res = await fetch('/cart/add.js', {
        method: 'POST',
        headers: { 'Accept': 'application/javascript' },
        body: new FormData(form),
      });
      if (!res.ok) throw new Error('Add failed');
      // Then refresh the drawer + open it.
      const cartRes = await fetch('/cart.js');
      const cart = await cartRes.json();
      const drawer = document.querySelector('cart-drawer');
      if (drawer) drawer.refresh(cart);
      document.dispatchEvent(new CustomEvent('cart:open'));
    } catch (err) {
      console.error('ATC failed', err);
      // Fallback: submit normally (full-page redirect to /cart)
      form.submit();
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = original; }
    }
  });

  // ─── Sticky cart bar reveal ──────────────────────────────
  const stickyBar = document.getElementById('VStickyBar');
  if (stickyBar) {
    let ticking = false;
    function update() {
      const drawerOpen = document.querySelector('cart-drawer[data-open="true"]');
      const past = window.scrollY > window.innerHeight * 0.65;
      stickyBar.dataset.visible = (past && !drawerOpen) ? 'true' : 'false';
      ticking = false;
    }
    window.addEventListener('scroll', () => {
      if (!ticking) { window.requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();
  }

  // ─── helpers ─────────────────────────────────────────────
  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  // Minimal Shopify money formatter (handles {{amount}}, {{amount_no_decimals}},
  // {{amount_with_comma_separator}}, {{amount_no_decimals_with_comma_separator}}).
  function formatMoney(cents, format) {
    const n = Number(cents) / 100;
    return format
      .replace(/\{\{\s*amount\s*\}\}/g, n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ','))
      .replace(/\{\{\s*amount_no_decimals\s*\}\}/g, Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','))
      .replace(/\{\{\s*amount_with_comma_separator\s*\}\}/g, n.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!,))/g, '.'))
      .replace(/\{\{\s*amount_no_decimals_with_comma_separator\s*\}\}/g, Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.'));
  }
})();
