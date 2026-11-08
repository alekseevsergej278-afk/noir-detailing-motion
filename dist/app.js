(() => {
 'use strict';
 const config = window.NOIR_CONFIG;
 const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
 const list = document.querySelector('#service-list');
 config.services.forEach(([title, price, description, time]) => {
  const item = document.createElement('details'); item.className = 'service';
  const summary = document.createElement('summary');
  const name = document.createElement('span'); name.className = 'service-title'; name.textContent = title;
  const meta = document.createElement('span'); meta.className = 'service-meta';
  const cost = document.createElement('span'); cost.textContent = price;
  meta.append(cost); meta.insertAdjacentHTML('beforeend', '<svg aria-hidden="true"><use href="#plus"/></svg>');
  summary.append(name, meta);
  const content = document.createElement('div'); content.className = 'service-content';
  const desc = document.createElement('p'); desc.textContent = description;
  const footer = document.createElement('footer');
  const duration = document.createElement('span'); duration.textContent = 'Ориентир по срокам: ' + time;
  const link = document.createElement('a'); link.href = '#contact'; link.textContent = 'Обсудить услугу';
  footer.append(duration, link); content.append(desc, footer); item.append(summary, content); list.append(item);
  item.addEventListener('toggle', () => { if (item.open) list.querySelectorAll('details').forEach(other => { if (other !== item) other.open = false; }); });
 });
 document.querySelectorAll('[data-config]').forEach(el => { if (config[el.dataset.config]) el.textContent = config[el.dataset.config]; });
 document.querySelector('#year').textContent = new Date().getFullYear();
 const notice = document.querySelector('#notice'); let noticeTimer;
 function showNotice(message) { notice.querySelector('p').textContent = message; notice.hidden = false; clearTimeout(noticeTimer); noticeTimer = setTimeout(() => { notice.hidden = true; }, 10000); }
 notice.querySelector('button').addEventListener('click', () => { notice.hidden = true; });
 const contacts = {
  phone: config.phone ? 'tel:' + config.phone.replace(/[^+\d]/g, '') : '',
  whatsapp: config.whatsapp ? 'https://wa.me/' + config.whatsapp.replace(/\D/g, '') : '',
  telegram: config.telegram ? 'https://t.me/' + encodeURIComponent(config.telegram.replace(/^@/, '')) : ''
 };
 document.querySelectorAll('[data-contact]').forEach(el => {
  const href = contacts[el.dataset.contact];
  if (href) { el.href = href; if (!href.startsWith('tel:')) { el.target = '_blank'; el.rel = 'noopener noreferrer'; } }
  else el.addEventListener('click', event => { event.preventDefault(); showNotice('Это демо NOIR. Запись пока недоступна: владелец проекта ещё не подключил контакты студии.'); });
 });
 const toggle = document.querySelector('.menu-toggle'); const menu = document.querySelector('#mobile-nav');
 function setMenu(open, returnFocus = false) {
  document.body.classList.toggle('menu-open', open); toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню'); menu.inert = !open;
  document.querySelector('main').inert = open; document.querySelector('.footer').inert = open;
  if (open) menu.querySelector('a').focus({preventScroll:true}); else if (returnFocus) toggle.focus();
 }
 toggle.addEventListener('click', () => setMenu(!document.body.classList.contains('menu-open')));
 menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
 document.addEventListener('keydown', event => {
  if (!document.body.classList.contains('menu-open')) return;
  if (event.key === 'Escape') setMenu(false, true);
  if (event.key === 'Tab') {
   const focusables = [toggle, ...menu.querySelectorAll('a')];
   const first = focusables[0], last = focusables[focusables.length - 1];
   if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
   else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
 });
 matchMedia('(min-width:768px)').addEventListener('change', e => { if (e.matches) setMenu(false); });
 const lightbox = document.querySelector('.lightbox');
 document.querySelectorAll('.gallery-item').forEach(button => button.addEventListener('click', () => {
  lightbox.querySelector('img').src = button.dataset.image; lightbox.querySelector('img').alt = button.querySelector('img').alt;
  lightbox.querySelector('p').textContent = button.dataset.caption; lightbox.showModal(); document.body.style.overflow = 'hidden';
 }));
 lightbox.querySelector('button').addEventListener('click', () => lightbox.close());
 lightbox.addEventListener('click', e => { if (e.target === lightbox) { const r = lightbox.getBoundingClientRect(); if(e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) lightbox.close(); } });
 lightbox.addEventListener('close', () => { document.body.style.overflow = ''; });
 // Progressive enhancement: content remains visible without JavaScript or IntersectionObserver.
 if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => { if(entry.isIntersecting) { entry.target.classList.remove('is-pending'); observer.unobserve(entry.target); } }), {threshold:.08});
  document.querySelectorAll('.reveal,.image-reveal').forEach(el => { if(el.getBoundingClientRect().top > innerHeight && !reduceMotion.matches) el.classList.add('is-pending'); observer.observe(el); });
 }
 const progress = document.querySelector('.progress'); const photos = [...document.querySelectorAll('[data-parallax]')]; let scheduled = false;
 function updateScroll() {
  const range = document.documentElement.scrollHeight - innerHeight;
  progress.style.transform = 'scaleX(' + (range > 0 ? scrollY / range : 0) + ')';
  if (!reduceMotion.matches) photos.forEach(img => { const rect = img.parentElement.getBoundingClientRect(); if(rect.bottom > 0 && rect.top < innerHeight) { const amount = innerWidth < 768 ? 10 : 24; const offset = (rect.top + rect.height/2 - innerHeight/2) / innerHeight * amount; img.style.transform = `scale(1.07) translateY(${offset}px)`; } });
  scheduled = false;
 }
 function requestUpdate() { if(!scheduled) { scheduled = true; requestAnimationFrame(updateScroll); } }
 addEventListener('scroll', requestUpdate, {passive:true}); addEventListener('resize', requestUpdate);
 reduceMotion.addEventListener('change', () => { if(reduceMotion.matches) { photos.forEach(img => img.style.transform = ''); document.querySelectorAll('.is-pending').forEach(el => el.classList.remove('is-pending')); } requestUpdate(); });
 updateScroll();
})();
