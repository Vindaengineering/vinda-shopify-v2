class VCarousel {
  constructor(el) {
    this.el = el;
    this.slides = [...el.querySelectorAll('.v-carousel__slide')];
    this.dots = [...el.querySelectorAll('[data-carousel-dot]')];
    this.counter = el.querySelector('[data-carousel-current]');
    this.total = this.slides.length;
    this.current = 0;
    this.interval = parseInt(el.dataset.interval, 10) || 4000;
    this.timer = null;
    this.paused = false;

    el.querySelector('[data-carousel-prev]')
      ?.addEventListener('click', () => this.step(-1));
    el.querySelector('[data-carousel-next]')
      ?.addEventListener('click', () => this.step(1));

    this.dots.forEach(dot =>
      dot.addEventListener('click', () => this.goTo(parseInt(dot.dataset.carouselDot, 10)))
    );

    el.addEventListener('mouseenter', () => { this.paused = true; });
    el.addEventListener('mouseleave', () => { this.paused = false; });

    el.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft') this.step(-1);
      if (e.key === 'ArrowRight') this.step(1);
    });

    this._swipe();
    this._tick();
  }

  goTo(index) {
    this.slides[this.current].classList.remove('is-active');
    this.slides[this.current].setAttribute('aria-hidden', 'true');
    this.dots[this.current]?.classList.remove('is-active');
    this.dots[this.current]?.setAttribute('aria-selected', 'false');

    this.current = (index + this.total) % this.total;

    this.slides[this.current].classList.add('is-active');
    this.slides[this.current].setAttribute('aria-hidden', 'false');
    this.dots[this.current]?.classList.add('is-active');
    this.dots[this.current]?.setAttribute('aria-selected', 'true');

    if (this.counter) {
      this.counter.textContent = String(this.current + 1).padStart(2, '0');
    }
  }

  step(dir) {
    this.goTo(this.current + dir);
    this._restart();
  }

  _tick() {
    if (this.total <= 1) return;
    this.timer = setInterval(() => {
      if (!this.paused) this.goTo(this.current + 1);
    }, this.interval);
  }

  _restart() {
    clearInterval(this.timer);
    this._tick();
  }

  _swipe() {
    let startX = 0;
    this.el.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
    this.el.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) this.step(dx < 0 ? 1 : -1);
    }, { passive: true });
  }
}

document.querySelectorAll('[data-carousel]').forEach(el => new VCarousel(el));
