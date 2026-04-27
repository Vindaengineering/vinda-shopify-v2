const sliders = document.querySelectorAll('[data-ba-slider]');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

sliders.forEach((slider) => {
  const clip = slider.querySelector('[data-ba-slider-clip]');
  const handle = slider.querySelector('[data-ba-slider-handle]');
  const announce = slider.querySelector('[data-ba-slider-announce]');
  if (!clip || !handle) return;

  let position = 80;

  function setPosition(pct) {
    position = Math.max(0, Math.min(100, pct));
    clip.style.clipPath = `inset(0 ${100 - position}% 0 0)`;
    handle.style.left = `${position}%`;
    handle.setAttribute('aria-valuenow', String(Math.round(position)));
    if (announce) announce.textContent = `${Math.round(position)}%`;
  }

  if (reducedMotion) {
    setPosition(50);
    handle.hidden = true;
    return;
  }

  setPosition(80);

  let introPlayed = false;
  let userInteracted = false;

  function playIntro() {
    if (introPlayed || userInteracted) return;
    introPlayed = true;

    const segmentDuration = 2200;
    const easeOut = (t) => 1 - Math.pow(1 - t, 3);
    const segments = [
      [80, 20],
      [20, 80],
      [80, 20],
    ];

    function runSegment(index) {
      if (userInteracted || index >= segments.length) return;
      const [startPct, endPct] = segments[index];
      const startTime = performance.now();

      function tick(now) {
        if (userInteracted) return;
        const elapsed = now - startTime;
        const t = Math.min(1, elapsed / segmentDuration);
        const eased = easeOut(t);
        setPosition(startPct + (endPct - startPct) * eased);
        if (t < 1) {
          requestAnimationFrame(tick);
        } else {
          runSegment(index + 1);
        }
      }
      requestAnimationFrame(tick);
    }

    setTimeout(() => runSegment(0), 2000);
  }

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            playIntro();
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.4 },
    );
    io.observe(slider);
  } else {
    playIntro();
  }

  function markUserInteracted() {
    userInteracted = true;
  }

  function onPointerMove(e) {
    const rect = slider.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    setPosition((x / rect.width) * 100);
  }

  function startDrag() {
    markUserInteracted();
    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', stopDrag, { once: true });
  }

  function stopDrag() {
    document.removeEventListener('pointermove', onPointerMove);
  }

  handle.addEventListener('pointerdown', startDrag);
  slider.addEventListener('pointerdown', (e) => {
    if (e.target === slider || e.target.classList.contains('v-ba__img')) {
      onPointerMove(e);
      startDrag();
    }
  });

  handle.addEventListener('keydown', (e) => {
    switch (e.key) {
      case 'ArrowLeft':
        markUserInteracted();
        setPosition(position - 5);
        e.preventDefault();
        break;
      case 'ArrowRight':
        markUserInteracted();
        setPosition(position + 5);
        e.preventDefault();
        break;
      case 'Home':
        markUserInteracted();
        setPosition(0);
        e.preventDefault();
        break;
      case 'End':
        markUserInteracted();
        setPosition(100);
        e.preventDefault();
        break;
    }
  });
});
