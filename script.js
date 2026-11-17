/* Ansh portfolio: keepy-uppy, player card, sketch pad, count-up, reveals */
(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const buzz = ms => { if (navigator.vibrate) navigator.vibrate(ms); };
  const cols = ['#D8F24B', '#FF5A1F', '#111111', '#145A42'];

  /* Toast and particle bursts */
  const toast = $('.toast');
  let tt;
  const say = msg => {
    toast.textContent = msg; toast.classList.add('show');
    clearTimeout(tt); tt = setTimeout(() => toast.classList.remove('show'), 2200);
  };
  const burst = (x, y, n = 14) => {
    if (reduce) return;
    for (let i = 0; i < n; i++) {
      const p = document.createElement('i');
      p.className = 'bit';
      p.style.cssText = `left:${x}px;top:${y}px;background:${cols[i % 4]};border-radius:${i % 2 ? '50%' : '2px'};--dx:${(Math.random() - 0.5) * 260}px;--dy:${-60 - Math.random() * 160}px;--r:${Math.random() * 360 - 180}deg`;
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 1000);
    }
  };
  const centre = el => { const r = el.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; };

  /* Progress bar, nav scroll-spy, reveals and count-up */
  const bar = $('.progress'), links = $$('.links a');
  const onScroll = () => {
    const de = document.documentElement, max = de.scrollHeight - innerHeight;
    bar.style.setProperty('--p', max > 0 ? Math.min(scrollY / max, 1).toFixed(4) : 0);
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  const spy = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) links.forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + e.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  $$('main section').forEach(s => spy.observe(s));
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: 0.2 });
  $$('.reveal').forEach(el => io.observe(el));
  const nums = $$('[data-count]');
  if (!reduce) {
    const fmt = (n, v) => v.toFixed(+n.dataset.dec || 0) + (n.dataset.suf || '');
    nums.forEach(n => { n.textContent = fmt(n, 0); });
    const co = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      co.unobserve(e.target);
      const n = e.target, end = +n.dataset.count, start = performance.now();
      const step = t => {
        const p = Math.min((t - start) / 1600, 1);
        n.textContent = fmt(n, end * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }), { threshold: 0.6 });
    nums.forEach(n => co.observe(n));
  }

  /* Tape marquee loop */
  const mq = $('.mq');
  for (let i = 0; i < 2; i++) mq.insertAdjacentHTML('beforeend', mq.innerHTML);

  /* Player card: flip, tilt and shine */
  const pc = $('#pcard');
  const flip = () => { pc.setAttribute('aria-pressed', String(pc.classList.toggle('on'))); buzz(10); };
  pc.addEventListener('click', flip);
  pc.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); } });
  if (!reduce) {
    pc.addEventListener('pointermove', e => {
      if (e.pointerType === 'touch') return;
      const r = pc.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      pc.style.setProperty('--ry', ((px - 0.5) * 16).toFixed(1) + 'deg');
      pc.style.setProperty('--rx', ((0.5 - py) * 14).toFixed(1) + 'deg');
      pc.style.setProperty('--sx', (px * 100).toFixed(0) + '%');
      pc.style.setProperty('--sy', (py * 100).toFixed(0) + '%');
    });
    pc.addEventListener('pointerleave', () => { pc.style.setProperty('--rx', '0deg'); pc.style.setProperty('--ry', '0deg'); });
  }

  /* Keepy-uppy: tap the ball to keep it in the air */
  const box = $('#keepy'), ball = $('#ball'), ks = $('#k-s'), kb = $('#k-b');
  let bx = 0, by = 0, vx = 0, vy = 0, rot = 0, live = false, score = 0, best = 0, last = performance.now();
  try { best = +localStorage.getItem('ansh-best') || 0; } catch (err) { /* storage unavailable */ }
  kb.textContent = best;
  const area = () => [box.clientWidth - 56, box.clientHeight - 56];
  const put = () => { ball.style.transform = `translate(${bx}px,${by}px) rotate(${rot}deg)`; };
  const rest = () => { const [w, h] = area(); bx = w / 2; by = h; vx = 0; vy = 0; put(); };
  rest();
  addEventListener('resize', () => { if (!live) rest(); });
  ball.addEventListener('pointerdown', e => {
    e.preventDefault();
    const r = ball.getBoundingClientRect();
    vx = -((e.clientX - (r.left + r.width / 2)) / 28) * 4 + (Math.random() - 0.5) * 2;
    vy = -10.5;
    if (!live) { live = true; score = 0; }
    score++; ks.textContent = score; buzz(8);
  });
  const tick = t => {
    const dt = Math.min((t - last) / 16.67, 2);
    last = t;
    if (live) {
      const [w, h] = area();
      vy += 0.5 * dt; bx += vx * dt; by += vy * dt; rot += vx * 4 * dt;
      if (bx < 0 || bx > w) { bx = Math.max(0, Math.min(w, bx)); vx *= -0.8; }
      if (by < 0) { by = 0; vy = Math.abs(vy) * 0.4; }
      if (by >= h) {
        by = h; vx = 0; vy = 0; live = false;
        if (score > best) { best = score; kb.textContent = best; try { localStorage.setItem('ansh-best', best); } catch (err) { /* storage unavailable */ } }
        say('Dropped at ' + score + '. Best: ' + best);
      }
      put();
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);

  /* Trophies and interest rows */
  $$('.trophy').forEach(t => t.addEventListener('click', e => {
    const [cx, cy] = centre(t);
    burst(e.clientX || cx, e.clientY || cy, 22); buzz(15);
  }));
  $$('.row').forEach(r => r.addEventListener('click', e => {
    r.classList.toggle('on');
    burst(e.clientX || centre(r)[0], e.clientY || centre(r)[1], 10); buzz(8);
  }));

  /* Sketch pad: strokes are stored as fractions so they survive resizing */
  const cv = $('#pad'), ctx = cv.getContext('2d'), pbox = $('#padbox');
  let strokes = [], cur = null, ink = '#111111', brush = 5;
  const pt = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height]; };
  const line = (s, a, b) => {
    const w = cv.clientWidth, h = cv.clientHeight;
    ctx.strokeStyle = s.c; ctx.lineWidth = s.w; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(a[0] * w, a[1] * h); ctx.lineTo(b[0] * w + 0.01, b[1] * h); ctx.stroke();
  };
  const redraw = () => {
    ctx.clearRect(0, 0, cv.clientWidth, cv.clientHeight);
    strokes.forEach(s => s.p.forEach((q, i) => line(s, s.p[Math.max(i - 1, 0)], q)));
    pbox.classList.toggle('drawn', strokes.length > 0);
  };
  const fit = () => {
    const d = devicePixelRatio || 1;
    cv.width = cv.clientWidth * d; cv.height = cv.clientHeight * d;
    ctx.setTransform(d, 0, 0, d, 0, 0);
    redraw();
  };
  fit();
  addEventListener('resize', fit);
  cv.addEventListener('pointerdown', e => {
    cv.setPointerCapture(e.pointerId);
    cur = { c: ink, w: brush, p: [pt(e)] };
    strokes.push(cur); line(cur, cur.p[0], cur.p[0]);
    pbox.classList.add('drawn');
  });
  cv.addEventListener('pointermove', e => {
    if (!cur) return;
    const q = pt(e);
    line(cur, cur.p[cur.p.length - 1], q);
    cur.p.push(q);
  });
  const end = () => { cur = null; };
  cv.addEventListener('pointerup', end);
  cv.addEventListener('pointercancel', end);
  $$('.swatch').forEach(s => s.addEventListener('click', () => {
    ink = s.dataset.c;
    $$('.swatch').forEach(o => o.classList.toggle('on', o === s));
  }));
  $('#size').addEventListener('input', e => { brush = +e.target.value; });
  $('#undo').addEventListener('click', () => { strokes.pop(); redraw(); });
  $('#clear').addEventListener('click', () => { strokes = []; redraw(); });
  $('#save').addEventListener('click', () => {
    const t = document.createElement('canvas');
    t.width = cv.width; t.height = cv.height;
    const c = t.getContext('2d');
    c.fillStyle = '#FBF9F2'; c.fillRect(0, 0, t.width, t.height); c.drawImage(cv, 0, 0);
    const a = document.createElement('a');
    a.download = 'my-sketch.png'; a.href = t.toDataURL('image/png'); a.click();
    say('Sketch saved');
  });

  /* Copy to clipboard and print */
  $$('.copy').forEach(b => b.addEventListener('click', async () => {
    const v = b.dataset.copy;
    try { await navigator.clipboard.writeText(v); }
    catch (err) {
      const t = document.createElement('textarea');
      t.value = v; t.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(t); t.select(); document.execCommand('copy'); t.remove();
    }
    say('Copied ' + v);
    const [cx, cy] = centre(b);
    burst(cx, cy, 8);
  }));
  $$('[data-print]').forEach(b => b.addEventListener('click', () => window.print()));
})();
