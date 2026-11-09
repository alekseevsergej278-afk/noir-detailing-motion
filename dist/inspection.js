// The inspection lamp uses a 2D position, independent of the before/after state.
(() => {
  'use strict';
  const stage = document.querySelector('#inspection-stage');
  const canvas = document.querySelector('#paint-canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const scratchLayer = document.createElement('canvas');
  const scratchCtx = scratchLayer.getContext('2d');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const buttons = [...document.querySelectorAll('[data-finish]')];
  const comparison = document.querySelector('#paint-comparison');
  if (typeof comparison._setPosition !== 'function') return;
  const handle = comparison.lastElementChild;
  handle.classList.add('noir-compare-handle');
  handle.firstElementChild.classList.add('noir-compare-grip');
  const comparisonPosition = { value: .5 };
  let settingComparison = false;
  handle.setAttribute('role', 'slider'); handle.tabIndex = 0;
  handle.setAttribute('aria-label', 'Сравнение лака. Слева до коррекции, справа после.');
  handle.setAttribute('aria-valuemin', '0'); handle.setAttribute('aria-valuemax', '100');
  handle.setAttribute('aria-valuenow', '50');

  // Trace the painted hood in paint.png's 1672 × 941 coordinate space.
  const hoodOutline = new Path2D('M 0 82 C 108 79 195 61 270 61 C 495 61 723 99 943 155 C 1210 222 1450 350 1635 499 C 1665 529 1602 613 1527 662 C 1365 769 1148 835 1014 941 H 0 Z');
  const photoWidth = 1672;
  const photoHeight = 941;
  let hoodMask;
  let width = 1, height = 1, frame = 0;
  let lightX = .52, lightY = .5, targetX = .52, targetY = .5;
  let defects = 1, targetDefects = 1, dragging = false;
  let seed = 27;
  const random = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const scratches = Array.from({ length: 700 }, () => ({
    x: random(), y: .12 + random() * .78,
    radius: .07 + random() * .4,
    start: random() * Math.PI * 2,
    length: .04 + random() * .26,
    strength: .25 + random() * .7
  }));
  const clamp = value => Math.max(0, Math.min(1, value));

  function draw() {
    const ease = reduced.matches ? 1 : .16;
    lightX += (targetX - lightX) * ease;
    lightY += (targetY - lightY) * ease;
    defects += (targetDefects - defects) * (reduced.matches ? 1 : .1);
    ctx.clearRect(0, 0, width, height);
    ctx.save();
    ctx.clip(hoodMask);
    const x = lightX * width, y = lightY * height;
    const radius = Math.min(width * .38, height * .64);
    const lamp = ctx.createRadialGradient(x, y, 0, x, y, radius);
    lamp.addColorStop(0, 'rgba(242,247,235,.23)');
    lamp.addColorStop(.2, 'rgba(235,242,226,.1)');
    lamp.addColorStop(1, 'rgba(235,242,226,0)');
    ctx.fillStyle = lamp;
    ctx.fillRect(0, 0, width, height);
    if (defects > .005) {
      const haze = ctx.createRadialGradient(x, y, 0, x, y, radius);
      haze.addColorStop(0, `rgba(191,208,193,${.14 * defects})`);
      haze.addColorStop(1, 'rgba(191,208,193,0)');
      ctx.fillStyle = haze;
      ctx.fillRect(0, 0, width, height);
      scratchCtx.clearRect(0, 0, width, height);
      scratchCtx.globalCompositeOperation = 'source-over';
      scratches.forEach(s => {
        scratchCtx.strokeStyle = `rgba(230,239,228,${s.strength * defects * .62})`;
        scratchCtx.lineWidth = .7;
        scratchCtx.beginPath();
        scratchCtx.arc(s.x * width, s.y * height, s.radius * Math.min(width, height), s.start, s.start + s.length);
        scratchCtx.stroke();
      });
      const exposureMask = scratchCtx.createRadialGradient(x, y, 0, x, y, radius);
      exposureMask.addColorStop(0, 'rgba(255,255,255,1)');
      exposureMask.addColorStop(.35, 'rgba(255,255,255,.6)');
      exposureMask.addColorStop(1, 'rgba(255,255,255,0)');
      scratchCtx.globalCompositeOperation = 'destination-in';
      scratchCtx.fillStyle = exposureMask;
      scratchCtx.fillRect(0, 0, width, height);
      scratchCtx.globalCompositeOperation = 'source-over';
      ctx.drawImage(scratchLayer, 0, 0, width, height);
    }
    ctx.restore();
    stage.style.setProperty('--beam', `${lightX * 100}%`);
    stage.style.setProperty('--beam-y', `${lightY * 100}%`);
    if (Math.abs(lightX - targetX) > .0005 || Math.abs(lightY - targetY) > .0005 || Math.abs(defects - targetDefects) > .002) {
      frame = requestAnimationFrame(draw);
    } else frame = 0;
  }
  function requestDraw() { if (!frame) frame = requestAnimationFrame(draw); }
  function move(x, y = targetY) {
    targetX = clamp(x); targetY = Math.max(.15, Math.min(.85, y));
    requestDraw();
  }
  function point(event) {
    const rect = stage.getBoundingClientRect();
    move((event.clientX - rect.left) / rect.width, (event.clientY - rect.top) / rect.height);
  }
  stage.addEventListener('pointermove', event => {
    if (event.pointerType === 'touch' && !dragging) return;
    point(event);
  }, { passive: true });
  stage.addEventListener('pointerdown', event => {
    if (event.target.closest('.noir-compare-handle')) return;
    // A touch positions the lamp while vertical scrolling stays native.
    if (event.pointerType === 'touch') { point(event); return; }
    event.preventDefault(); dragging = true; stage.setPointerCapture(event.pointerId); stage.classList.add('is-dragging'); point(event);
  });
  function release() { dragging = false; stage.classList.remove('is-dragging'); }
  stage.addEventListener('pointerup', release);
  stage.addEventListener('pointercancel', release);
  stage.addEventListener('keydown', event => {
    const step = event.shiftKey ? .1 : .025;
    const directions = { ArrowLeft: [-step,0], ArrowRight: [step,0], ArrowUp: [0,-step], ArrowDown: [0,step] };
    if (directions[event.key]) {
      event.preventDefault();
      move(targetX + directions[event.key][0], targetY + directions[event.key][1]);
    } else if (event.key === 'Home') { event.preventDefault(); move(.5,.5); }
  });
  buttons.forEach(button => button.addEventListener('click', () => {
    const after = button.dataset.finish === 'after';
    targetDefects = after ? 0 : 1;
    setComparison(after ? 0 : 1);
    buttons.forEach(b => { b.classList.toggle('active', b === button); b.setAttribute('aria-pressed', String(b === button)); });
    document.querySelector('#surface-state').textContent = after ? 'После коррекции' : 'До коррекции';
    document.querySelector('#inspection-caption').textContent = after ? 'Чёткое отражение. Поверхность после коррекции.' : 'Микроцарапины проявляются только в области света.';
    stage.dataset.finish = after ? 'after' : 'before';
    requestDraw();
  }));
  // Adapter for pinned GoogleChromeLabs Two-Up 1.0.1, which exposes no public position setter.
  // Keep its pixel and relative coordinates synchronized so subsequent dragging never jumps.
  function setComparison(value, animate = true) {
    settingComparison = true;
    gsap.to(comparisonPosition, {
      value: clamp(value), duration: animate && !reduced.matches ? .65 : 0, ease: 'power3.out', overwrite: true,
      onUpdate() {
        comparison._relativePosition = comparisonPosition.value;
        comparison._position = comparisonPosition.value * comparison.getBoundingClientRect().width;
        comparison._setPosition();
      },
      onComplete() { settingComparison = false; }
    });
  }
  function compare() {
    gsap.killTweensOf(comparisonPosition); settingComparison = false;
    comparisonPosition.value = comparison._relativePosition;
    targetDefects = 1;
    buttons.forEach(button => { button.classList.remove('active'); button.setAttribute('aria-pressed', 'false'); });
    document.querySelector('#surface-state').textContent = 'Сравнение';
    document.querySelector('#inspection-caption').textContent = 'Слева — до коррекции. Справа — после.';
    requestDraw();
  }
  handle.addEventListener('pointerdown', compare);
  handle.addEventListener('keydown', event => {
    const key = event.key;
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(key)) return;
    event.preventDefault(); event.stopPropagation(); compare();
    const amount = event.shiftKey ? .1 : .025;
    const position = key === 'Home' ? 0 : key === 'End' ? 1 : comparisonPosition.value + (key === 'ArrowLeft' ? -amount : amount);
    setComparison(position, false);
  });
  new MutationObserver(() => {
    const position = comparison._relativePosition;
    handle.setAttribute('aria-valuenow', String(Math.round(position * 100)));
    if (!settingComparison) comparisonPosition.value = position;
  }).observe(comparison, { attributes: true, attributeFilter: ['style'] });
  function resize() {
    const rect = stage.getBoundingClientRect(); width = rect.width; height = rect.height;
    // Match the photograph's centered object-fit: cover crop at every breakpoint.
    const scale = Math.max(width / photoWidth, height / photoHeight);
    hoodMask = new Path2D();
    hoodMask.addPath(hoodOutline, new DOMMatrix([
      scale, 0, 0, scale, (width - photoWidth * scale) / 2, (height - photoHeight * scale) / 2
    ]));
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    scratchLayer.width = Math.ceil(width); scratchLayer.height = Math.ceil(height);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); requestDraw();
  }
  new ResizeObserver(resize).observe(stage);
  reduced.addEventListener('change', requestDraw);
  resize(); move(.52, .5);
})();
