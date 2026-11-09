// GSAP + SplitText drive typography. Button choreography adapts the Codrops magnetic-button reference.
(() => {
  'use strict';
  if (!window.gsap || !window.SplitText || !window.ScrollTrigger) return;
  gsap.registerPlugin(SplitText, ScrollTrigger);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const headings = [...document.querySelectorAll('h2.reveal')];
  headings.forEach(heading => heading.classList.remove('reveal', 'is-pending'));

  document.fonts.ready.then(() => {
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const splits = headings.map(heading => {
        const split = SplitText.create(heading, { type: 'words', mask: 'words', wordsClass: 'gsap-word', tag: 'span', aria: 'auto' });
        gsap.from(split.words, {
          yPercent: 115, autoAlpha: 0, duration: 1, stagger: .055, ease: 'expo.out',
          scrollTrigger: { trigger: heading, start: 'top 90%', once: true }
        });
        return split;
      });
      ScrollTrigger.refresh();
      return () => splits.forEach(split => split.revert());
    });
  });

  const buttons = [...document.querySelectorAll('.button,.text-link,.header-contact,.service-content a')];
  buttons.forEach(button => {
    const text = [...button.childNodes].find(node => node.nodeType === Node.TEXT_NODE && node.textContent.trim());
    if (text) {
      const label = document.createElement('span'); label.className = 'button-label';
      const front = document.createElement('span'); front.className = 'label-front'; front.textContent = text.textContent.trim();
      const back = front.cloneNode(true); back.className = 'label-back'; back.setAttribute('aria-hidden', 'true');
      label.append(front, back); text.replaceWith(label);
    }
    button.classList.add('motion-button', 'gsap-magnet');
    const xTo = gsap.quickTo(button, 'x', { duration: .55, ease: 'power3.out' });
    const yTo = gsap.quickTo(button, 'y', { duration: .55, ease: 'power3.out' });
    button.addEventListener('pointermove', event => {
      if (!finePointer.matches || reduced.matches) return;
      const rect = button.getBoundingClientRect();
      xTo((event.clientX - rect.left - rect.width / 2) * .06);
      yTo((event.clientY - rect.top - rect.height / 2) * .16);
    }, { passive: true });
    button.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
  });
  reduced.addEventListener('change', () => {
    if (reduced.matches) gsap.set(buttons, { x: 0, y: 0 });
  });
})();
