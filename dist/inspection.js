// Extend the existing Two-Up handles with independent keyboard and click controls.
(() => {
  'use strict';

  document.querySelectorAll('two-up[data-comparison]').forEach(comparison => {
    if (typeof comparison._setPosition !== 'function') return;
    const handle = comparison.lastElementChild;
    const grip = handle.firstElementChild;
    const icon = grip.querySelector('svg');
    handle.classList.add('noir-compare-handle');
    grip.classList.add('noir-compare-grip');
    icon.setAttribute('viewBox', '0 0 24 24');
    icon.setAttribute('aria-hidden', 'true');
    icon.innerHTML = '<use href="#drag"/>';
    handle.tabIndex = 0;
    handle.setAttribute('role', 'slider');
    handle.setAttribute('aria-label', `Сравнение до и после — ${comparison.dataset.comparison}`);
    handle.setAttribute('aria-valuemin', '0');
    handle.setAttribute('aria-valuemax', '100');

    function reportPosition() {
      const value = Math.round(comparison._relativePosition * 100);
      handle.setAttribute('aria-valuenow', String(value));
      handle.setAttribute('aria-valuetext', `${value}% кадра до обработки`);
    }

    function setPosition(value) {
      // Two-Up 1.0.1 has no public setter. Keep both coordinates aligned for subsequent drags.
      comparison._relativePosition = Math.max(0, Math.min(1, value));
      comparison._position = comparison._relativePosition * comparison.getBoundingClientRect().width;
      comparison._setPosition();
      reportPosition();
    }

    handle.addEventListener('keydown', event => {
      const key = event.key;
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(key)) return;
      event.preventDefault();
      const amount = event.shiftKey ? .1 : .025;
      if (key === 'Home') setPosition(0);
      else if (key === 'End') setPosition(1);
      else setPosition(comparison._relativePosition + (key === 'ArrowLeft' ? -amount : amount));
    });

    comparison.addEventListener('click', event => {
      if (handle.contains(event.target)) return;
      const rect = comparison.getBoundingClientRect();
      setPosition((event.clientX - rect.left) / rect.width);
      handle.focus({ preventScroll: true });
    });

    reportPosition();
    new MutationObserver(reportPosition).observe(comparison, { attributes: true, attributeFilter: ['style'] });
  });
})();
