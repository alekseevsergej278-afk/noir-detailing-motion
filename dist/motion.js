// Motion references are documented in MOTION.md. No runtime animation dependency is required.
(() => {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');

  // Masked word reveals preserve responsive wrapping and the original heading's accessible name.
  const headings = [...document.querySelectorAll('h2.reveal')];
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('type-in'); observer.unobserve(entry.target); }
  }), { threshold: .2, rootMargin: '0px 0px -4% 0px' });
  headings.forEach(heading => {
    const accessibleText = heading.innerText.replace(/\s+/g, ' ').trim();
    const walker = document.createTreeWalker(heading, NodeFilter.SHOW_TEXT);
    const nodes = []; while (walker.nextNode()) nodes.push(walker.currentNode);
    let index = 0;
    nodes.forEach(node => {
      const fragment = document.createDocumentFragment();
      node.textContent.split(/(\s+)/u).forEach(token => {
        if (!token || /^\s+$/u.test(token)) { fragment.append(document.createTextNode(token)); return; }
        const mask = document.createElement('span'); mask.className = 'word-mask';
        const word = document.createElement('span'); word.textContent = token;
        word.style.setProperty('--word-delay', `${Math.min(index++ * 45, 315)}ms`);
        mask.append(word); fragment.append(mask);
      });
      node.replaceWith(fragment);
    });
    heading.setAttribute('aria-label', accessibleText);
    [...heading.children].forEach(child => child.setAttribute('aria-hidden', 'true'));
    heading.classList.remove('reveal', 'is-pending'); heading.classList.add('type-ready');
    if (reduced.matches || heading.getBoundingClientRect().top < innerHeight) heading.classList.add('type-in');
    else observer.observe(heading);
  });

  // Labels roll through a mask, while the button remains the same stable tap target.
  const buttons = [...document.querySelectorAll('.button,.text-link,.header-contact,.service-content a')];
  buttons.forEach(button => {
    const text = [...button.childNodes].find(node => node.nodeType === Node.TEXT_NODE && node.textContent.trim());
    if (text) {
      const label = document.createElement('span'); label.className = 'button-label';
      const front = document.createElement('span'); front.className = 'label-front'; front.textContent = text.textContent.trim();
      const back = front.cloneNode(true); back.className = 'label-back'; back.setAttribute('aria-hidden', 'true');
      label.append(front, back); text.replaceWith(label);
    }
    button.classList.add('motion-button');
    button.addEventListener('pointermove', event => {
      if (!finePointer.matches || reduced.matches) return;
      const rect = button.getBoundingClientRect();
      button.style.setProperty('--magnet-x', `${(event.clientX - rect.left - rect.width / 2) * .055}px`);
      button.style.setProperty('--magnet-y', `${(event.clientY - rect.top - rect.height / 2) * .14}px`);
    }, { passive: true });
    button.addEventListener('pointerleave', () => { button.style.setProperty('--magnet-x', '0px'); button.style.setProperty('--magnet-y', '0px'); });
  });
  reduced.addEventListener('change', () => {
    if (!reduced.matches) return;
    headings.forEach(heading => heading.classList.add('type-in'));
    buttons.forEach(button => { button.style.setProperty('--magnet-x', '0px'); button.style.setProperty('--magnet-y', '0px'); });
  });
})();
