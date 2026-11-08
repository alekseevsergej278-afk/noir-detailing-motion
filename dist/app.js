(() => {
 'use strict';
 const config = window.NOIR_CONFIG;
 const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
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
  item.addEventListener('pointerenter', () => previewService(index));
  summary.addEventListener('focus', () => previewService(index));
  item.addEventListener('toggle', () => { if (item.open) previewService(index); if (item.open) list.querySelectorAll('details').forEach(other => { if (other !== item) other.open = false; }); });
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
 document.querySelectorAll('.work-image').forEach(button => button.addEventListener('click', () => {
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
 const progress = document.querySelector('.reading-progress'); const photos = [...document.querySelectorAll('[data-parallax]')]; let scheduled = false;
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

// Paint inspection: one photograph, an authored simulation of defects and a movable light.
(() => {
 'use strict';
 const stage = document.querySelector('#inspection-stage');
 const canvas = document.querySelector('#paint-canvas');
 const ctx = canvas.getContext('2d');
 if (!ctx) return;
 const range = document.querySelector('#beam');
 const reduced = matchMedia('(prefers-reduced-motion: reduce)');
 const buttons = [...document.querySelectorAll('[data-finish]')];
 let width = 1, height = 1, light = .52, targetLight = .52;
 let roughness = 1, targetRoughness = 1, frame = 0;
 let seed = 27;
 const random = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
 const scratches = Array.from({length: 380}, () => ({x:random(), y:.13+random()*.78, radius:.015+random()*.16, start:random()*Math.PI*2, length:.16+random()*.95, strength:.25+random()*.7}));
 function draw() {
  light += (targetLight-light) * (reduced.matches ? 1 : .18);
  roughness += (targetRoughness-roughness) * (reduced.matches ? 1 : .12);
  ctx.clearRect(0,0,width,height);
  const x = light*width, y = height*.49, radius = Math.max(width*.24,height*.55);
  // The radial falloff belongs to the inspection lamp, inside the photograph only.
  const lamp = ctx.createRadialGradient(x,y,0,x,y,radius);
  lamp.addColorStop(0,'rgba(235,243,226,.16)'); lamp.addColorStop(.25,'rgba(222,234,218,.065)'); lamp.addColorStop(1,'rgba(222,234,218,0)');
  ctx.fillStyle=lamp;ctx.fillRect(0,0,width,height);
  if(roughness>.005) {
   const haze=ctx.createRadialGradient(x,y,0,x,y,radius*.9);
   haze.addColorStop(0,`rgba(199,211,200,${.16*roughness})`);haze.addColorStop(1,'rgba(199,211,200,0)');ctx.fillStyle=haze;ctx.fillRect(0,0,width,height);
   scratches.forEach(s => {
    const sx=s.x*width,sy=s.y*height;
    const distance=Math.hypot((sx-x)*.8,sy-y);
    const exposure=Math.max(0,1-distance/radius);
    if(exposure<.06)return;
    ctx.strokeStyle=`rgba(225,234,224,${exposure*exposure*s.strength*roughness*.7})`;
    ctx.lineWidth=.65;ctx.beginPath();ctx.arc(sx,sy,s.radius*Math.min(width,height),s.start,s.start+s.length);ctx.stroke();
   });
  }
  stage.style.setProperty('--beam',(light*100)+'%');
  if(Math.abs(light-targetLight)>.0005||Math.abs(roughness-targetRoughness)>.002) frame=requestAnimationFrame(draw);
  else frame=0;
 }
 function requestDraw(){if(!frame)frame=requestAnimationFrame(draw);}
 function resize(){const rect=stage.getBoundingClientRect();width=rect.width;height=rect.height;const dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);requestDraw();}
 function move(value){targetLight=Math.max(0,Math.min(1,value));range.value=String(Math.round(targetLight*100));requestDraw();}
 stage.addEventListener('pointermove',event=>{if(event.pointerType==='touch')return;const rect=stage.getBoundingClientRect();move((event.clientX-rect.left)/rect.width);},{passive:true});
 stage.addEventListener('pointerdown',event=>{const rect=stage.getBoundingClientRect();move((event.clientX-rect.left)/rect.width);},{passive:true});
 range.addEventListener('input',()=>move(Number(range.value)/100));
 buttons.forEach(button=>button.addEventListener('click',()=>{
  const after=button.dataset.finish==='after';targetRoughness=after?0:1;
  buttons.forEach(b=>{const selected=b===button;b.classList.toggle('active',selected);b.setAttribute('aria-pressed',String(selected));});
  document.querySelector('#surface-state').textContent=after?'После коррекции':'До коррекции';
  document.querySelector('#inspection-caption').textContent=after?'Чёткое отражение. Свет больше не рассеивается в дефектах.':'То, что не видно при обычном освещении.';
  stage.dataset.finish=after?'after':'before';requestDraw();
 }));
 new ResizeObserver(resize).observe(stage);
 reduced.addEventListener('change',requestDraw);
 resize();
})();

// Light moves through the manifesto and the process as the visitor reads.
(() => {
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const sentence=document.querySelector('[data-read]');
 sentence.textContent.split(' ').forEach((word,index)=>{if(index===0)sentence.textContent='';const span=document.createElement('span');span.textContent=word+' ';sentence.append(span);});
 const words=[...sentence.children];
 const process=document.querySelector('.approach');
 const line=document.querySelector('.process-indicator span');
 const point=document.querySelector('.process-indicator i');
 let queued=false;
 const clamp=n=>Math.min(1,Math.max(0,n));
 function update(){
  const r=sentence.getBoundingClientRect();const progress=clamp((innerHeight*.85-r.top)/(innerHeight*.7));
  sentence.classList.toggle('read-active',!reduced.matches);
  words.forEach((word,i)=>word.classList.toggle('lit',reduced.matches||i/words.length<progress));
  const p=process.getBoundingClientRect();const amount=clamp((innerHeight*.55-p.top)/(p.height-innerHeight*.3));
  line.style.transform=`scaleX(${amount})`;point.style.left=`${amount*100}%`;queued=false;
 }
 function schedule(){if(!queued){queued=true;requestAnimationFrame(update);}}
 addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);reduced.addEventListener('change',schedule);update();
})();
