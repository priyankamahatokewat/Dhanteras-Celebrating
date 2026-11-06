'use strict';
/* ===== Helpers ===== */
const $ = s => document.querySelector(s), rnd = (a, b) => a + Math.random() * (b - a), pick = a => a[Math.random() * a.length | 0];
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const cv = $('#fx'), ctx = cv.getContext('2d');
let W, H, dpr, small, raf = 0, last = 0, px = 0, py = 0, tx = 0, ty = 0, T0 = performance.now(), frameN = 0;
let diyas = [], stars = [], bokeh = [], dust = [], flies = [], coins = [], petals = [], sparks = [], garland;

/* ===== Pre-rendered sprites (fast: drawImage instead of gradients per frame) ===== */
const spr = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); return c; };
const glowS = spr(128, 128, g => { const r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  [[0, 'rgba(255,225,140,1)'], [.25, 'rgba(255,170,50,.55)'], [.6, 'rgba(255,110,20,.15)'], [1, 'rgba(255,90,10,0)']].forEach(s => r.addColorStop(...s)); g.fillStyle = r; g.fillRect(0, 0, 128, 128); });
const flameS = spr(40, 80, g => { g.beginPath(); g.moveTo(20, 78); g.bezierCurveTo(-6, 60, 8, 30, 20, 2); g.bezierCurveTo(32, 30, 46, 60, 20, 78);
  const r = g.createRadialGradient(20, 62, 1, 20, 58, 34);
  [[0, '#fff'], [.25, '#ffe27a'], [.6, '#ff9d1c'], [1, 'rgba(255,70,5,.9)']].forEach(s => r.addColorStop(...s)); g.fillStyle = r; g.fill(); });
const bowlS = spr(100, 44, g => { g.beginPath(); g.moveTo(3, 14); g.bezierCurveTo(8, 50, 92, 50, 97, 14); g.closePath();
  const r = g.createLinearGradient(0, 14, 0, 42); [[0, '#f4e6c8'], [.55, '#d2bd94'], [1, '#6e5b3e']].forEach(s => r.addColorStop(...s)); g.fillStyle = r; g.fill();
  g.fillStyle = '#f3e4c4'; g.beginPath(); g.ellipse(50, 14, 47, 12, 0, 0, 6.29); g.fill();
  g.fillStyle = '#24110a'; g.beginPath(); g.ellipse(50, 14, 37, 8, 0, 0, 6.29); g.fill(); });
const coinS = spr(48, 48, g => { const r = g.createRadialGradient(18, 16, 2, 24, 24, 24);
  [[0, '#fff6c0'], [.55, '#f5b82e'], [1, '#9a5a08']].forEach(s => r.addColorStop(...s)); g.fillStyle = r; g.beginPath(); g.arc(24, 24, 23, 0, 6.29); g.fill();
  g.strokeStyle = '#8a5206'; g.lineWidth = 2; g.beginPath(); g.arc(24, 24, 16, 0, 6.29); g.stroke();
  g.fillStyle = '#8a5206'; g.font = 'bold 20px serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('₹', 24, 25); });
const petalS = [['#ff8a1f', '#ffb020'], ['#ffc02e', '#ff9d1c']].map(([a, b]) => spr(24, 14, g => {
  const r = g.createLinearGradient(0, 0, 24, 0); r.addColorStop(0, a); r.addColorStop(1, b); g.fillStyle = r; g.beginPath(); g.ellipse(12, 7, 11, 6, 0, 0, 6.29); g.fill(); }));

/* ===== Scene layout (rebuilt on resize) ===== */
function marigold(g, x, y, r) {
  for (let k = 0; k < 9; k++) { const a = k * .698; g.fillStyle = k % 2 ? '#ff8a1f' : '#ffa91f'; g.beginPath(); g.arc(x + Math.cos(a) * r * .6, y + Math.sin(a) * r * .6, r * .5, 0, 6.29); g.fill(); }
  g.fillStyle = '#ffc84a'; g.beginPath(); g.arc(x, y, r * .5, 0, 6.29); g.fill();
}
function layout() {
  dpr = Math.min(devicePixelRatio || 1, 2); W = innerWidth; H = innerHeight; small = W < 700;
  cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  // Diyas: group 0 lights up on its own after the intro, group 1 waits for "Light the Diyas"
  diyas = [];
  const add = (x, y, s, g) => diyas.push({ x, y, s, g, f: rnd(.7, 1.4), ph: rnd(0, 6.3), lit: reduced ? 1 : 0, at: g || reduced ? (reduced ? 0 : Infinity) : 3.6 + Math.abs(x / W - .5) * 3 + rnd(0, .6) });
  const s0 = Math.max(40, Math.min(90, W * .07));
  [[s0, H - 14, 0], [s0 * .74, H - 14 - s0 * .42, 1], [s0 * .55, H - 14 - s0 * .74, 1]].forEach(([s, y, g]) => {
    const n = Math.floor(W / (s * 1.15)); for (let i = 0; i < n; i++) add((i + .5 + rnd(-.15, .15)) * W / n, y, s, g); });
  const cols = small ? 1 : 2, cnt = small ? 3 : 6;
  for (let c = 0; c < cols; c++) for (let i = 0; i < cnt; i++) { const y = H * (.2 + .42 * i / (cnt - 1)), s = small ? 22 : 38, x = (small ? 16 : 28) + c * 46;
    add(x, y, s, c); add(W - x, y, s, c); }
  const rn = small ? 16 : 30;
  for (let i = 0; i < rn; i++) { const a = i / rn * 6.283, x = W / 2 + Math.cos(a) * W * .47, y = H * .46 + Math.sin(a) * H * .42; if (y < H * .74) add(x, y, small ? 18 : 24, 1); }
  if (!small) for (let i = 0; i < Math.floor(W / 50); i++) add((i + .5) * W / Math.floor(W / 50), 112, 16, 1);
  diyas.sort((a, b) => a.y - b.y);
  // Ambient layers
  const sc = small ? .5 : 1, ar = (n, f) => Array.from({ length: Math.round(n * sc) }, f);
  stars = ar(240, () => ({ x: rnd(0, W), y: rnd(0, H * .85), s: Math.random() < .1 ? 2.4 : rnd(.8, 1.7), tw: rnd(.8, 3), ph: rnd(0, 6.3), d: rnd(.2, 1), c: pick(['#fff', '#ffe9a3', '#ffd45e', '#ffb86b']) }));
  bokeh = ar(12, () => ({ x: rnd(0, W), y: rnd(0, H), r: rnd(50, 150), vx: rnd(-8, 8), vy: rnd(-6, 6), a: rnd(.05, .14) }));
  dust = ar(90, () => ({ x: rnd(0, W), y: rnd(0, H), v: rnd(6, 22), s: rnd(1, 2.2), ph: rnd(0, 6.3) }));
  flies = ar(20, () => ({ x: rnd(0, W), y: rnd(H * .3, H), sp: rnd(.4, 1), ph: rnd(0, 6.3) }));
  coins = ar(38, () => resetCoin({ r: rnd(0, 6), vr: rnd(2, 6), ph: rnd(0, 6.3), y: rnd(-H, H) }));
  petals = ar(28, () => resetPetal({ r: rnd(0, 6), vr: rnd(-2, 2), ph: rnd(0, 6.3), y: rnd(-H, H) }));
  // Marigold garland border (drawn once)
  garland = spr(W, 110, g => { const sw = small ? 2 : 4, per = W / sw;
    for (let x = 0; x < W; x += 20) { const f = (x % per) / per, y = 14 + 26 * Math.sin(f * Math.PI); marigold(g, x, y, 9);
      if (Math.floor(x / 20) % 3 === 0) for (let k = 1; k < 4; k++) marigold(g, x, y + k * 15, 9 - k); } });
}
const resetCoin = c => Object.assign(c, { x: rnd(0, W), y: rnd(-60, -10), s: rnd(7, 16), vy: rnd(35, 85), b: Math.random() < .3, n: 0 });
const resetPetal = p => Object.assign(p, { x: rnd(0, W), y: rnd(-40, -10), w: rnd(12, 22), vy: rnd(25, 55), k: Math.random() < .5 ? 0 : 1 });

/* ===== Sparks / particle bursts ===== */
const GOLD = ['#fff3c0', '#ffd45e', '#ffb02e', '#ff8a1f', '#ffe9a3'];
function burst(x, y, n = 140, o = {}) {
  const cols = o.cols || GOLD;
  for (let i = 0; i < n; i++) { const a = rnd(0, 6.283), v = rnd(60, o.v || 460);
    sparks.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - (o.up ?? 120), life: rnd(.9, 2), col: pick(cols), s: rnd(1.5, 4), g: o.g ?? 260, k: o.heart && i % 2 ? 'h' : i % 4 ? 'd' : 's' }); }
  if (sparks.length > 700) sparks.splice(0, sparks.length - 700);
}
function star4(x, y, r) { ctx.beginPath(); for (let i = 0; i < 8; i++) { const rr = i % 2 ? r * .35 : r, t = i * .785; ctx.lineTo(x + Math.cos(t) * rr, y + Math.sin(t) * rr); } ctx.fill(); }

/* ===== Main draw loop: stars → bokeh → diyas → coins → petals → sparks ===== */
function draw(t, dt) {
  const rv = reduced ? 1 : Math.min(1, Math.max(0, (t - 2.2) / 3)), sa = reduced ? 1 : Math.min(1, t / 1.5);
  px += (tx - px) * .05; py += (ty - py) * .05;
  document.body.style.setProperty('--px', px.toFixed(3)); document.body.style.setProperty('--py', py.toFixed(3));
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H); ctx.globalCompositeOperation = 'source-over';
  for (const s of stars) { ctx.globalAlpha = sa * (.2 + .8 * Math.abs(Math.sin(t * s.tw + s.ph))); ctx.fillStyle = s.c; ctx.fillRect(s.x + px * s.d * 16, s.y + py * s.d * 10, s.s, s.s); }
  ctx.globalCompositeOperation = 'lighter';
  for (const b of bokeh) { b.x += b.vx * dt; b.y += b.vy * dt; if (b.x < -150) b.x = W + 150; if (b.x > W + 150) b.x = -150; if (b.y < -150) b.y = H + 150; if (b.y > H + 150) b.y = -150;
    ctx.globalAlpha = b.a * rv; ctx.drawImage(glowS, b.x + px * 30, b.y + py * 20, b.r, b.r); }
  ctx.fillStyle = '#ffd98a';
  for (const d of dust) { d.y -= d.v * dt; d.x += Math.sin(t + d.ph) * 6 * dt; if (d.y < -5) { d.y = H + 5; d.x = rnd(0, W); } ctx.globalAlpha = .5 * sa; ctx.fillRect(d.x, d.y, d.s, d.s); }
  for (const f of flies) { f.x += Math.cos(t * f.sp + f.ph) * 30 * dt; f.y += Math.sin(t * f.sp * 1.3 + f.ph) * 22 * dt; if (f.x < 0) f.x = W; if (f.x > W) f.x = 0; if (f.y < 0) f.y = H; if (f.y > H) f.y = 0;
    ctx.globalAlpha = rv * (.3 + .7 * Math.abs(Math.sin(t * 1.7 + f.ph))); ctx.drawImage(glowS, f.x - 9, f.y - 9, 18, 18); }
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = rv; ctx.drawImage(garland, 0, (rv - 1) * 60 + Math.sin(t * .8) * 2, W, 110);
  let lit = 0;
  for (const d of diyas) {
    if (t >= d.at && d.lit < 1) d.lit = Math.min(1, d.lit + dt * .9); lit += d.lit;
    const s = d.s, bh = s * .44, L = d.lit;
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = rv * (.5 + .5 * L); ctx.drawImage(bowlS, d.x - s / 2, d.y - bh, s, bh);
    if (L > 0) {
      const fl = 1 + .12 * Math.sin(t * d.f * 7 + d.ph) + .07 * Math.sin(t * d.f * 13 + d.ph * 2), sw = Math.sin(t * d.f * 3 + d.ph) * .22;
      const fh = s * .55 * fl * L, fw = s * .2 * L * (2 - fl), fy = d.y - bh * .7, gs = s * 2.8;
      ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = rv * L * .5 * (.8 + .2 * fl); ctx.drawImage(glowS, d.x - gs / 2, fy - fh * .5 - gs / 2, gs, gs);
      ctx.globalAlpha = rv * L; ctx.setTransform(dpr, 0, sw * dpr, dpr, d.x * dpr, fy * dpr); ctx.drawImage(flameS, -fw / 2, -fh, fw, fh);
      if (s > 34) { ctx.setTransform(dpr, 0, -sw * dpr, -.5 * dpr, d.x * dpr, (d.y + s * .05) * dpr); ctx.globalAlpha = rv * L * .28; ctx.drawImage(flameS, -fw / 2, -fh, fw, fh); } // floor reflection
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  }
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = rv;
  for (const c of coins) { c.y += c.vy * dt; if (c.b) c.vy += 60 * dt; c.x += Math.sin(t * .8 + c.ph) * 12 * dt; c.r += c.vr * dt;
    if (c.b && c.y > H - 26 && c.vy > 0) { c.vy *= -.42; c.n++; if (c.n > 2) resetCoin(c); } else if (c.y > H + 30) resetCoin(c);
    ctx.save(); ctx.translate(c.x, c.y); ctx.scale(Math.max(.12, Math.abs(Math.cos(c.r))), 1); ctx.drawImage(coinS, -c.s, -c.s, c.s * 2, c.s * 2); ctx.restore(); }
  for (const p of petals) { p.y += p.vy * dt; p.x += Math.sin(t * .9 + p.ph) * 24 * dt; p.r += p.vr * dt; if (p.y > H + 20) resetPetal(p);
    ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.scale(1, .5 + .5 * Math.sin(t * 2 + p.ph)); ctx.drawImage(petalS[p.k], -p.w / 2, -p.w / 3, p.w, p.w * .58); ctx.restore(); }
  ctx.globalCompositeOperation = 'lighter';
  for (let i = sparks.length - 1; i >= 0; i--) { const s = sparks[i]; s.life -= dt; if (s.life <= 0) { sparks.splice(i, 1); continue; }
    s.vy += s.g * dt; s.x += s.vx * dt; s.y += s.vy * dt; s.vx *= .99; ctx.globalAlpha = Math.min(1, s.life); ctx.fillStyle = s.col;
    if (s.k === 's') star4(s.x, s.y, s.s * 1.8); else if (s.k === 'h') { ctx.font = '16px serif'; ctx.fillText('❤', s.x, s.y); } else ctx.fillRect(s.x, s.y, s.s, s.s); }
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  if (++frameN % 12 === 0) $('#amb').style.opacity = (.15 + .85 * lit / diyas.length).toFixed(2); // room brightens as diyas light
}
function loop(now) { raf = requestAnimationFrame(loop); const dt = Math.min(.05, (now - last) / 1000 || .016); last = now; draw((now - T0) / 1000, dt); }
function lightAll() { const t = (performance.now() - T0) / 1000; diyas.forEach(d => { if (d.lit < 1 && d.at === Infinity) d.at = t + (H - d.y) / H * 2.5 + rnd(0, .8); }); }

/* ===== Floating words ===== */
const WORDS = ['WEALTH', 'HEALTH', 'JOY', 'PROSPERITY', 'LUCK', 'धन', 'शुभ', 'लक्ष्मी', 'PEACE', 'MONEY', 'सरस्वती', 'SUCCESS', 'HAPPINESS', 'ABUNDANCE', 'FORTUNE', 'BLESSINGS', 'WEALTHY LIFE', 'GOOD VIBRATIONS', 'सुख', 'समृद्धि', 'ऐश्वर्य', 'मंगलमय', 'सौभाग्य', 'शांति', 'आरोग्य', 'विजय'];
const wordsEl = $('#words'); let nw = 0;
function word() {
  if (document.hidden || nw >= (small ? 6 : 11)) return;
  const w = pick(WORDS), a = pick(['rise', 'rise', 'ltr', 'zoom', 'rot', 'neon', 'fade']), dv = /[\u0900-\u097F]/.test(w), el = document.createElement('span');
  el.className = 'wd ' + a + (dv ? ' dv' : ''); el.textContent = w; if (dv) el.lang = 'hi';
  const t = a === 'ltr' ? rnd(16, 28) : a === 'rise' ? rnd(12, 20) : rnd(6, 10), edge = Math.random() < .5 ? rnd(2, 26) : rnd(62, 84);
  el.style.cssText = `--fs:${(rnd(1.1, 2.4) * (dv ? 1.35 : 1) * (small ? .85 : 1)).toFixed(2)}rem;--t:${t.toFixed(1)}s;--a:w-${a};` +
    (a === 'rise' ? `left:${rnd(4, 78)}%;top:72%` : a === 'ltr' ? `left:0;top:${rnd(8, 56)}%` : `left:${edge}%;top:${rnd(10, 62)}%`);
  el.addEventListener('animationend', () => { el.remove(); nw--; }, { once: true }); wordsEl.appendChild(el); nw++;
}

/* ===== Ornaments: kalash, lotus, Lakshmi footprints, and the rangoli mandala (SVG strings) ===== */
const kalash = `<svg viewBox="0 0 60 84"><path d="M30 18Q10 6 8 0Q26 4 30 18ZM30 18Q50 6 52 0Q34 4 30 18Z" fill="#ff9d1c" stroke="#ffe9a3" stroke-width=".8"/><circle cx="30" cy="12" r="8" fill="url(#gold)"/><ellipse cx="30" cy="26" rx="13" ry="4" fill="url(#gold)"/><path d="M19 28Q4 48 18 70Q30 78 42 70Q56 48 41 28Z" fill="url(#gold)" stroke="#8a5206"/><path d="M16 50h28M18 58h24" stroke="#8a5206" stroke-width="1.4"/><circle cx="30" cy="42" r="4" fill="#c4161c"/><rect x="16" y="72" width="28" height="6" rx="2" fill="url(#gold)"/></svg>`;
const lotus = `<svg viewBox="0 0 60 50">${[-64, -38, 38, 64, -14, 14].map(a => `<ellipse cx="30" cy="26" rx="7" ry="20" transform="rotate(${a} 30 46)" fill="url(#lot)" stroke="#fff3c0" stroke-width=".8"/>`).join('')}<ellipse cx="30" cy="46" rx="26" ry="4" fill="#b8780f"/></svg>`;
const foot = x => `<ellipse cx="${x}" cy="40" rx="8" ry="15" fill="url(#gold)" stroke="#8a5206"/>${[[-7, 19], [-3, 15], [1, 14], [5, 15], [8, 18]].map(([dx, y]) => `<circle cx="${x + dx}" cy="${y}" r="2.6" fill="url(#gold)"/>`).join('')}`;
const feet = `<svg viewBox="0 0 60 58">${foot(16)}${foot(44)}</svg>`;
$('#orn').innerHTML = kalash + lotus + feet + lotus + kalash;
(function mandala() {
  const ring = (n, r, rx, ry, f) => Array.from({ length: n }, (_, i) => `<ellipse cx="200" cy="${200 - r}" rx="${rx}" ry="${ry}" fill="${f}" stroke="#ffd45e" stroke-width="1.6" transform="rotate(${i * 360 / n} 200 200)"/>`).join('');
  const dots = Array.from({ length: 36 }, (_, i) => `<circle cx="200" cy="12" r="3.5" fill="#ffd45e" transform="rotate(${i * 10} 200 200)"/>`).join('');
  $('#mandala').innerHTML = `<svg viewBox="0 0 400 400"><circle cx="200" cy="200" r="192" fill="none" stroke="#ffd45e" stroke-dasharray="4 8"/>${dots}${ring(20, 160, 16, 36, 'rgba(255,138,31,.3)')}${ring(20, 124, 10, 26, 'none')}${ring(16, 96, 16, 28, 'rgba(200,40,60,.3)')}${ring(12, 66, 12, 24, 'none')}${ring(8, 40, 12, 20, 'rgba(255,212,94,.35)')}<circle cx="200" cy="200" r="20" fill="rgba(255,212,94,.4)" stroke="#ffd45e"/></svg>`;
})();

/* ===== Audio (Web Audio synthesis: tanpura drone + pentatonic plucks; starts only after a click) ===== */
let ac, master, delay, droneOn = [], musicTimer = 0, musicOn = false;
function audioInit() {
  if (ac) return; ac = new (window.AudioContext || window.webkitAudioContext)();
  master = ac.createGain(); master.gain.value = 0; master.connect(ac.destination);
  delay = ac.createDelay(); delay.delayTime.value = .42; const fb = ac.createGain(); fb.gain.value = .38; delay.connect(fb); fb.connect(delay); delay.connect(master);
}
const SCALE = [261.63, 293.66, 329.63, 392, 440, 523.25, 587.33, 659.25]; let ni = 3;
function pluck() {
  if (Math.random() < .2) return; ni = Math.max(0, Math.min(SCALE.length - 1, ni + pick([-2, -1, -1, 1, 1, 2]))); const f = SCALE[ni], n = ac.currentTime;
  const g = ac.createGain(); g.gain.setValueAtTime(0, n); g.gain.linearRampToValueAtTime(.2, n + .01); g.gain.exponentialRampToValueAtTime(.001, n + 1.8); g.connect(master); g.connect(delay);
  [['triangle', f], ['sine', f * 2]].forEach(([ty, fr]) => { const o = ac.createOscillator(); o.type = ty; o.frequency.value = fr; o.connect(g); o.start(n); o.stop(n + 1.9); });
}
function musicToggle() {
  audioInit(); musicOn = !musicOn; const b = $('#music'); b.textContent = musicOn ? '🎵' : '🔇'; b.setAttribute('aria-pressed', musicOn);
  if (musicOn) { ac.resume(); master.gain.cancelScheduledValues(ac.currentTime); master.gain.linearRampToValueAtTime(.55, ac.currentTime + 2);
    [[65.41, 'sawtooth', .05], [98, 'sine', .12], [130.81, 'sine', .08]].forEach(([f, ty, v]) => { const o = ac.createOscillator(), lp = ac.createBiquadFilter(), g = ac.createGain();
      o.type = ty; o.frequency.value = f; lp.type = 'lowpass'; lp.frequency.value = 500; g.gain.value = v; o.connect(lp); lp.connect(g); g.connect(master); o.start(); droneOn.push(o); });
    musicTimer = setInterval(pluck, 520);
  } else { clearInterval(musicTimer); master.gain.linearRampToValueAtTime(0, ac.currentTime + 1); const old = droneOn; droneOn = []; setTimeout(() => old.forEach(o => o.stop()), 1200); }
}
function diyaSound() { // soft match-strike whoosh + tiny chime
  audioInit(); ac.resume(); const n = ac.currentTime, buf = ac.createBuffer(1, ac.sampleRate * .6, ac.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
  const src = ac.createBufferSource(), bp = ac.createBiquadFilter(), g = ac.createGain(); src.buffer = buf; bp.type = 'bandpass'; bp.frequency.setValueAtTime(600, n); bp.frequency.exponentialRampToValueAtTime(3000, n + .5);
  g.gain.setValueAtTime(.12, n); g.gain.exponentialRampToValueAtTime(.001, n + .6); src.connect(bp); bp.connect(g); g.connect(ac.destination); src.start(n);
  const o = ac.createOscillator(), og = ac.createGain(); o.frequency.value = 1318; og.gain.setValueAtTime(.08, n + .05); og.gain.exponentialRampToValueAtTime(.001, n + 1.2); o.connect(og); og.connect(ac.destination); o.start(n + .05); o.stop(n + 1.3);
}

/* ===== Buttons ===== */
const BLESS = ["May Lakshmi's grace fill your home with golden light ✨", 'आपके घर में धन-धान्य की वर्षा हो 💰', 'Health, wealth & happiness are on their way to you 🌟',
  'माँ लक्ष्मी की कृपा सदा बनी रहे 🪔', 'May every diya bring a new blessing into your life 🪔', 'सुख, समृद्धि और सौभाग्य आपके साथ हों 🌸'];
const msg = $('#msg'), toastEl = $('#toast'); let bi = -1;
const say = m => { msg.textContent = m; msg.lang = /[\u0900-\u097F]/.test(m) ? 'hi' : 'en'; msg.classList.remove('pop'); void msg.offsetWidth; msg.classList.add('pop'); };
const toast = m => { toastEl.textContent = m; toastEl.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => toastEl.classList.remove('show'), 2400); };
const center = b => { const r = b.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; };
const actions = {
  celebrate(b) { say('शुभ धनतेरस! 🎉'); if (reduced) return; burst(...center(b)); setTimeout(() => burst(rnd(W * .2, W * .8), rnd(H * .1, H * .4)), 250); setTimeout(() => burst(rnd(W * .2, W * .8), rnd(H * .1, H * .4)), 500); },
  light() { lightAll(); diyaSound(); say('हर दीप से रोशनी, हर घर में खुशी 🪔'); },
  bless(b) { bi = (bi + 1 + (Math.random() * 3 | 0)) % BLESS.length; say(BLESS[bi]); if (!reduced) burst(...center(b), 60); },
  happy(b) { say('Spreading happiness everywhere ❤️'); if (!reduced) burst(...center(b), 70, { heart: true, cols: ['#ff7fa0', '#ffd45e', '#fff3c0', '#ff4d6d'], up: 260, g: 160 }); },
  async share() {
    const data = { title: 'शुभ धनतेरस – Happy Dhanteras!', text: 'Wishing you wealth, health, joy & prosperity this Dhanteras 🪔 शुभ धनतेरस!', url: location.href };
    try { if (navigator.share) { await navigator.share(data); return; } throw 0; }
    catch (e) { if (e && e.name === 'AbortError') return;
      try { await navigator.clipboard.writeText(data.text + ' ' + data.url); toast('Link copied! Share the blessings 🪔'); }
      catch { const ta = document.createElement('textarea'); ta.value = data.url; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); toast('Link copied! 🪔'); } catch { toast(data.url); } ta.remove(); } }
  }
};
document.querySelector('.btns').addEventListener('click', e => { const b = e.target.closest('button'); if (b) actions[b.dataset.a](b); });
$('#music').addEventListener('click', musicToggle);

/* ===== Init ===== */
layout();
addEventListener('pointermove', e => { tx = e.clientX / W * 2 - 1; ty = e.clientY / H * 2 - 1; }, { passive: true });
let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { layout(); if (reduced) draw(6, 0); }, 200); });
if (reduced) { draw(6, 0); }
else {
  last = performance.now(); raf = requestAnimationFrame(loop);
  setTimeout(() => burst(W / 2, H * .42, 220, { g: 0, v: 520, up: 0 }), 900);      // golden particles spread across the dark screen
  setTimeout(() => { word(); setInterval(word, small ? 1500 : 950); }, 2600);
  setTimeout(() => $('#intro').remove(), 5300);
  document.addEventListener('visibilitychange', () => { if (document.hidden) cancelAnimationFrame(raf); else { last = performance.now(); raf = requestAnimationFrame(loop); } });
}
