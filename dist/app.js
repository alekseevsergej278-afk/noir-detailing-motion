(() => {
 'use strict';
 const config = window.NOIR_CONFIG;
 const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
 const processSteps = [...document.querySelectorAll('[data-process-step]')];
 const processFrames = [...document.querySelectorAll('[data-process-frame]')];
 processSteps.forEach((step, index) => step.addEventListener('click', () => {
  if (step.getAttribute('aria-pressed') === 'true') return;
  processSteps.forEach((item, position) => item.setAttribute('aria-pressed', String(position === index)));
  processFrames.forEach((frame, position) => {
   const selected = position === index;
   frame.classList.toggle('is-active', selected);
   frame.setAttribute('aria-hidden', String(!selected));
  });
 }));
 const list = document.querySelector('#service-list');
 const previewImages = ['paint.png','paint.png','atelier.png','mercedes.jpg','mercedes.jpg','atelier.png','mercedes.jpg','atelier.png'];
 const previewCopy = ['Ясность отражений.\nГлубина цвета.','Сохранить блеск.\nОблегчить уход.','Защитить линии.\nСохранить характер.','Внимание внутри.\nКомфорт каждый день.','Чистота материалов.\nСвежесть ощущений.','Изменить акценты.\nОстаться собой.','Подготовить к встрече.\nСоздать впечатление.','Один автомобиль.\nЦелая программа ухода.'];
 function previewService(index) {
  const photo = document.querySelector('#service-photo');
  const path = 'assets/' + previewImages[index];
  if (photo.getAttribute('src') !== path) { photo.classList.add('switching'); photo.src = path; photo.onload = () => photo.classList.remove('switching'); }
  document.querySelector('#service-visual-title').textContent = previewCopy[index];
 }

 config.services.forEach(([title, price, description, time], index) => {
  const item = document.createElement('details'); item.className = 'service';
  item.setAttribute('name', 'noir-services');
  const summary = document.createElement('summary');
  const name = document.createElement('span'); name.className = 'service-title'; name.textContent = title;
  const meta = document.createElement('span'); meta.className = 'service-meta';
  const cost = document.createElement('span'); cost.textContent = price;
  meta.append(cost); meta.insertAdjacentHTML('beforeend', '<svg aria-hidden="true"><use href="#chevron"/></svg>');
  summary.append(name, meta);
  const content = document.createElement('div'); content.className = 'service-content';
  const desc = document.createElement('p'); desc.textContent = description;
  const footer = document.createElement('footer');
  const duration = document.createElement('span'); duration.textContent = 'Ориентир по срокам: ' + time;
  const link = document.createElement('a'); link.href = '#contact'; link.textContent = 'Обсудить услугу';
  footer.append(duration, link); content.append(desc, footer); item.append(summary, content); list.append(item);
  item.addEventListener('pointerenter', () => previewService(index));
  summary.addEventListener('focus', () => previewService(index));
  item.addEventListener('toggle', () => {
   if (!item.open) return;
   previewService(index);
   // Older browsers do not enforce exclusive disclosure groups.
   if (!('name' in item)) list.querySelectorAll('details[open]').forEach(other => { if (other !== item) other.open = false; });
  });
 });
 list.addEventListener('keydown', event => {
  if (!event.target.matches('summary') || !['ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
  const summaries = [...list.querySelectorAll('summary')];
  const index = summaries.indexOf(event.target);
  const offset = event.key === 'ArrowDown' ? 1 : -1;
  const next = event.key === 'Home' ? 0 : event.key === 'End' ? summaries.length - 1 : (index + offset + summaries.length) % summaries.length;
  event.preventDefault();
  summaries[next].focus();
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
 document.querySelector('#work').addEventListener('click', event => {
  const button = event.target.closest('button[data-image]');
  if (!button) return;
  lightbox.querySelector('img').src = button.dataset.image; lightbox.querySelector('img').alt = button.querySelector('img').alt;
  lightbox.querySelector('p').textContent = button.dataset.caption; lightbox.showModal(); document.body.style.overflow = 'hidden';
 });
 lightbox.querySelector('button').addEventListener('click', () => lightbox.close());
 lightbox.addEventListener('click', e => { if (e.target === lightbox) { const r = lightbox.getBoundingClientRect(); if(e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) lightbox.close(); } });
 lightbox.addEventListener('close', () => { document.body.style.overflow = ''; });
 // Progressive enhancement: content remains visible without JavaScript or IntersectionObserver.
 if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => { if(entry.isIntersecting) { entry.target.classList.remove('is-pending'); observer.unobserve(entry.target); } }), {threshold:.08});
  document.querySelectorAll('.image-reveal').forEach(el => { if(el.getBoundingClientRect().top > innerHeight && !reduceMotion.matches) el.classList.add('is-pending'); observer.observe(el); });
 }
 const photos = [...document.querySelectorAll('[data-parallax]')]; let scheduled = false;
 function updateScroll() {
  if (!reduceMotion.matches) photos.forEach(img => { const rect = img.parentElement.getBoundingClientRect(); if(rect.bottom > 0 && rect.top < innerHeight) { const amount = innerWidth < 768 ? 10 : 24; const offset = (rect.top + rect.height/2 - innerHeight/2) / innerHeight * amount; img.style.transform = `scale(1.07) translateY(${offset}px)`; } });
  scheduled = false;
 }
 function requestUpdate() { if(!scheduled) { scheduled = true; requestAnimationFrame(updateScroll); } }
 addEventListener('scroll', requestUpdate, {passive:true}); addEventListener('resize', requestUpdate);
 reduceMotion.addEventListener('change', () => { if(reduceMotion.matches) { photos.forEach(img => img.style.transform = ''); document.querySelectorAll('.is-pending').forEach(el => el.classList.remove('is-pending')); } requestUpdate(); });
 updateScroll();
})();

// Light moves through the manifesto as the visitor reads.
(() => {
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const sentence=document.querySelector('[data-read]');
 sentence.textContent.split(' ').forEach((word,index)=>{if(index===0)sentence.textContent='';const span=document.createElement('span');span.textContent=word+' ';sentence.append(span);});
 const words=[...sentence.children];
 let queued=false;
 const clamp=n=>Math.min(1,Math.max(0,n));
 function update(){
  const r=sentence.getBoundingClientRect();const progress=clamp((innerHeight*.85-r.top)/(innerHeight*.7));
  sentence.classList.toggle('read-active',!reduced.matches);
  words.forEach((word,i)=>word.classList.toggle('lit',reduced.matches||i/words.length<progress));
  queued=false;
 }
 function schedule(){if(!queued){queued=true;requestAnimationFrame(update);}}
 addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);reduced.addEventListener('change',schedule);update();
})();
