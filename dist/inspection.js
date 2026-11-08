// The inspection lamp uses a 2D position, independent of the before/after state.
(() => {
  'use strict';
  const stage = document.querySelector('#inspection-stage');
  const canvas = document.querySelector('#paint-canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const scratchLayer = document.createElement('canvas');
  const scratchCtx = scratchLayer.getContext('2d');
  const range = document.querySelector('#beam');
  const output = document.querySelector('#beam-value');
  const rail = document.querySelector('.beam-rail');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const buttons = [...document.querySelectorAll('[data-finish]')];
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
    stage.style.setProperty('--beam', `${lightX * 100}%`);
    stage.style.setProperty('--beam-y', `${lightY * 100}%`);
    if (Math.abs(lightX - targetX) > .0005 || Math.abs(lightY - targetY) > .0005 || Math.abs(defects - targetDefects) > .002) {
      frame = requestAnimationFrame(draw);
    } else frame = 0;
  }
  function requestDraw() { if (!frame) frame = requestAnimationFrame(draw); }
  function move(x, y = targetY) {
    targetX = clamp(x); targetY = Math.max(.15, Math.min(.85, y));
    const percentage = Math.round(targetX * 100);
    range.value = String(percentage);
    output.value = `${percentage}%`;
    rail.style.setProperty('--position', `${percentage}%`);
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
    // On touch screens, the dedicated range remains the drag surface so page scrolling stays native.
    if (event.pointerType === 'touch') { point(event); return; }
    event.preventDefault(); dragging = true; stage.setPointerCapture(event.pointerId); stage.classList.add('is-dragging'); point(event);
  });
  function release() { dragging = false; stage.classList.remove('is-dragging'); }
  stage.addEventListener('pointerup', release);
  stage.addEventListener('pointercancel', release);
  range.addEventListener('input', () => move(Number(range.value) / 100, .5));
  buttons.forEach(button => button.addEventListener('click', () => {
    const after = button.dataset.finish === 'after';
    targetDefects = after ? 0 : 1;
    buttons.forEach(b => { b.classList.toggle('active', b === button); b.setAttribute('aria-pressed', String(b === button)); });
    document.querySelector('#surface-state').textContent = after ? 'После коррекции' : 'До коррекции';
    document.querySelector('#inspection-caption').textContent = after ? 'Чёткое отражение. Поверхность после коррекции.' : 'Микроцарапины проявляются только в области света.';
    stage.dataset.finish = after ? 'after' : 'before';
    requestDraw();
  }));
  function resize() {
    const rect = stage.getBoundingClientRect(); width = rect.width; height = rect.height;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    scratchLayer.width = Math.ceil(width); scratchLayer.height = Math.ceil(height);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); requestDraw();
  }
  new ResizeObserver(resize).observe(stage);
  reduced.addEventListener('change', requestDraw);
  resize(); move(.52, .5);
})();
