// ─── SESSION helper ───
// If she already passed auth before (in this browser session), skip straight to garden
const SESSION_KEY  = 'vhallery-auth-done';
const STORAGE_KEY  = 'vhallery-garden-v2';

function isAuthenticated() {
  try { return localStorage.getItem(SESSION_KEY) === 'true'; } catch(e){ return false; }
}
function setAuthenticated() {
  try { localStorage.setItem(SESSION_KEY, 'true'); } catch(e){} 
}

// ─── STARS helper ───
function addStars(el) {
  for (let i = 0; i < 55; i++) {
    const s = document.createElement('div');
    s.className = 'star';
    const sz = .8 + Math.random() * 2.2;
    s.style.cssText = `width:${sz}px;height:${sz}px;top:${Math.random()*100}%;left:${Math.random()*100}%;animation-duration:${1.4+Math.random()*3}s;animation-delay:${Math.random()*3}s;`;
    el.appendChild(s);
  }
}

// ─── PANEL TRANSITION helper ───
function goTo(fromId, toId) {
  const from = document.getElementById(fromId);
  from.classList.add('hiding');
  setTimeout(() => {
    from.classList.remove('active','hiding');
    document.getElementById(toId).classList.add('active');
  }, 720);
}

// ─── SHAKE helper ───
function shake(btn) {
  btn.style.animation = 'none';
  requestAnimationFrame(() => btn.style.animation = 'shake .4s ease');
  setTimeout(() => btn.style.animation = '', 450);
}

// ─── CHOICE GRID helper ───
function setupChoices(gridId, callback) {
  const opts = document.querySelectorAll(`#${gridId} .choice-opt`);
  opts.forEach(opt => {
    opt.addEventListener('click', () => {
      opts.forEach(o => o.classList.remove('sel'));
      opt.classList.add('sel');
      callback(opt.dataset.val);
    });
  });
}

// ─── ON LOAD: skip auth if already logged in ───
window.addEventListener('DOMContentLoaded', () => {
  if (isAuthenticated()) {
    // Hide all auth panels and intro, go straight to garden
    document.getElementById('auth1').classList.remove('active');
    startGarden();
    return;
  }

  // Add stars to auth + intro panels
  addStars(document.getElementById('auth1'));
  addStars(document.getElementById('auth2'));
  addStars(document.getElementById('auth3'));
  addStars(document.getElementById('intro'));

  // ─── AUTH 1 ───
  const CORRECT_NAME  = ['vhall','vhallery','vhallery camat','camat'];
  const CORRECT_COLOR = 'purple';
  let sel1Color = null;

  document.querySelectorAll('#auth1 .color-opt').forEach(opt => {
    opt.addEventListener('click', () => {
      document.querySelectorAll('#auth1 .color-opt').forEach(o => o.classList.remove('sel'));
      opt.classList.add('sel');
      sel1Color = opt.dataset.color;
    });
  });

  function tryAuth1() {
    const nameVal = document.getElementById('name-input').value.trim().toLowerCase();
    const err = document.getElementById('err1');
    const btn = document.getElementById('btn1');
    if (!nameVal)                        { shake(btn); err.textContent = "What's your name? 🌸"; return; }
    if (!sel1Color)                      { shake(btn); err.textContent = "Pick your favorite color! 🎨"; return; }
    if (!CORRECT_NAME.includes(nameVal)) { shake(btn); err.textContent = "Hmm… that doesn't sound right. 🤔"; return; }
    if (sel1Color !== CORRECT_COLOR)     { shake(btn); err.textContent = "That's not her favorite color… 💜"; return; }
    err.textContent = '';
    goTo('auth1', 'auth2');
  }
  document.getElementById('btn1').addEventListener('click', tryAuth1);
  document.getElementById('name-input').addEventListener('keydown', e => { if(e.key==='Enter') tryAuth1(); });

  // ─── AUTH 2 ───
  const VALID_NICKNAMES = ['marc','lawrence','hon','daddy','baby','beb','mamarc','honey','hubby','husband'];

  function tryAuth2() {
    const nick = document.getElementById('nickname-input').value.trim().toLowerCase();
    const err  = document.getElementById('err2');
    const btn  = document.getElementById('btn2');
    if (!nick)                           { shake(btn); err.textContent = "What do you call me? 🥰"; return; }
    if (!VALID_NICKNAMES.includes(nick)) { shake(btn); err.textContent = "That doesn't sound right... 💭"; return; }
    err.textContent = '';
    goTo('auth2', 'auth3');
  }
  document.getElementById('btn2').addEventListener('click', tryAuth2);
  document.getElementById('nickname-input').addEventListener('keydown', e => { if(e.key==='Enter') tryAuth2(); });

  // ─── AUTH 3 ───
  const CORRECT_PROF = 'cpa lawyer';
  let sel3Prof = null;
  setupChoices('prof-choices', v => sel3Prof = v);

  function tryAuth3() {
    const err = document.getElementById('err3');
    const btn = document.getElementById('btn3');
    if (!sel3Prof)                 { shake(btn); err.textContent = "Choose your dream profession! ✨"; return; }
    if (sel3Prof !== CORRECT_PROF) { shake(btn); err.textContent = "Are you sure? Dream bigger! 🌟"; return; }
    err.textContent = '';
    const auth3 = document.getElementById('auth3');
    auth3.classList.add('hiding');
    setTimeout(() => {
      auth3.classList.remove('active','hiding');
      document.getElementById('intro').classList.add('active');
    }, 720);
  }
  document.getElementById('btn3').addEventListener('click', tryAuth3);

  // ─── INTRO SLIDES ───
  const slides  = Array.from(document.querySelectorAll('.slide'));
  const dotEls  = Array.from(document.querySelectorAll('.dot'));
  const nextBtn = document.getElementById('next-btn');
  let cur = 0;

  nextBtn.addEventListener('click', () => {
    slides[cur].classList.remove('active');
    slides[cur].classList.add('exiting');
    dotEls[cur].classList.remove('on');
    const prev = cur;
    setTimeout(() => slides[prev].classList.remove('exiting'), 650);
    cur++;
    if (cur < slides.length) {
      slides[cur].classList.add('active');
      dotEls[cur].classList.add('on');
      if (cur === slides.length - 1) nextBtn.textContent = 'Open Garden 🌻';
    } else {
      const intro = document.getElementById('intro');
      intro.classList.add('hiding');
      setTimeout(() => {
        intro.classList.remove('active','hiding');
        setAuthenticated(); // ← mark as logged in
        startGarden();
      }, 900);
    }
  });
});

// ─── GARDEN ───
function isNight() {
  const h = new Date().getHours();
  return h >= 20 || h < 6;
}

function isMobile() {
  return window.innerWidth <= 480;
}

function startGarden() {
  const garden = document.getElementById('garden');
  garden.style.display = 'block';
  requestAnimationFrame(() => requestAnimationFrame(() => garden.style.opacity = 1));

  // Grass
  const grassRow = document.getElementById('grass-row');
  for (let i = 0; i < Math.ceil(window.innerWidth / 12) + 2; i++) {
    const b = document.createElement('div'); b.className = 'grass-blade';
    b.style.left              = (i*12 + Math.random()*6)+'px';
    b.style.height            = (16 + Math.random()*16)+'px';
    b.style.animationDelay    = (Math.random()*2.5)+'s';
    b.style.animationDuration = (2+Math.random()*2)+'s';
    b.style.background        = `hsl(${130+Math.round(Math.random()*20)},60%,35%)`;
    grassRow.appendChild(b);
  }

  // Sky stars
  const sky = document.getElementById('sky');
  const skyStars = [];
  for (let i = 0; i < 80; i++) {
    const s = document.createElement('div'); s.className = 'sky-star';
    const sz = .6 + Math.random() * 1.8;
    s.style.width             = sz+'px';
    s.style.height            = sz+'px';
    s.style.top               = Math.random()*90+'%';
    s.style.left              = Math.random()*100+'%';
    s.style.animationDuration = (1.5+Math.random()*3)+'s';
    s.style.animationDelay    = (Math.random()*3)+'s';
    sky.appendChild(s);
    skyStars.push(s);
  }

  // Storage
  function save(list) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch(e){} }
  function load()     { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch(e){ return []; } }
  let savedFlowers = load();
  let count = 0;

  const countEl    = document.getElementById('count');
  const fc         = document.getElementById('flowers');
  const timeBadge  = document.getElementById('time-badge');
  const nightLabel = document.getElementById('night-label');
  const msgCard    = document.getElementById('message-card');
  const counterEl  = document.getElementById('counter');

  // ─── MAKE SUNFLOWER ───
  function makeSunflower(x, seed, instant) {
    const mobile = isMobile();
    const stemH  = seed ? seed.stemH : (mobile?45:80)+Math.floor(Math.random()*(mobile?45:80));
    const pCnt   = seed ? seed.pCnt  : 12+Math.floor(Math.random()*4);
    const hSz    = seed ? seed.hSz   : (mobile?32:50)+Math.floor(Math.random()*(mobile?14:24));
    const pl     = seed ? seed.pl    : 48+Math.random()*12;
    const cSz    = Math.round(hSz*.55), pW = Math.round(hSz*.28), pH = Math.round(hSz*.52);

    const f = document.createElement('div');
    f.className = 'sunflower' + (instant ? ' hidden' : ' grow');
    f.style.left = x+'px';

    const stem = document.createElement('div'); stem.className='stem'; stem.style.height=stemH+'px';
    const ll   = document.createElement('div'); ll.className='leaf leaf-left'; ll.style.bottom=(stemH*.35)+'px';
    const lr   = document.createElement('div'); lr.className='leaf leaf-right'; lr.style.bottom=(stemH*.6)+'px';
    stem.appendChild(ll); stem.appendChild(lr);

    const head = document.createElement('div'); head.className='head';
    head.style.width=hSz+'px'; head.style.height=hSz+'px'; head.style.animationDelay=(Math.random()*2)+'s';

    const pd = document.createElement('div'); pd.className='petals';
    for (let i=0;i<pCnt;i++) {
      const p = document.createElement('div'); p.className='petal';
      p.style.width=pW+'px'; p.style.height=pH+'px';
      p.style.marginTop=-(pH-2)+'px'; p.style.marginLeft=-(pW/2)+'px';
      p.style.transform=`rotate(${(360/pCnt)*i}deg)`;
      p.style.background=`linear-gradient(180deg,hsl(45,95%,${pl+8}%) 0%,hsl(38,90%,${pl}%) 100%)`;
      pd.appendChild(p);
    }
    const cc = document.createElement('div'); cc.className='center-circle'; cc.style.width=cSz+'px'; cc.style.height=cSz+'px';
    const cd = document.createElement('div'); cd.className='center-dots'; cc.appendChild(cd);
    head.appendChild(pd); head.appendChild(cc);
    f.appendChild(head); f.appendChild(stem);
    fc.appendChild(f);
    countEl.textContent = ++count;

    if (!seed) {
      savedFlowers.push({ x, stemH, pCnt, hSz, pl, t: Date.now() });
      save(savedFlowers);
    }
    return f;
  }

  // Replay saved
  savedFlowers.forEach(fl => makeSunflower(fl.x, fl, true));

  // ─── DAY / NIGHT ───
  let curNight = null;
  function applyDayNight(night, animated) {
    if (curNight === night) return;
    curNight = night;
    const sunEl    = document.getElementById('sun');
    const moonEl   = document.getElementById('moon');
    const groundEl = document.getElementById('ground');
    const flowers  = Array.from(fc.querySelectorAll('.sunflower'));

    if (night) {
      sky.classList.add('night'); groundEl.classList.add('night');
      sunEl.classList.add('hide'); moonEl.classList.add('show');
      skyStars.forEach(s => s.classList.add('show'));
      document.querySelectorAll('.cloud').forEach(c => c.classList.add('night'));
      msgCard.classList.add('night'); counterEl.classList.add('night'); timeBadge.classList.add('night');
      nightLabel.classList.add('show');
      flowers.forEach((f, i) => {
        setTimeout(() => {
          f.classList.remove('grow','wake','hidden');
          f.classList.add('sleep');
          setTimeout(() => { f.classList.remove('sleep'); f.classList.add('hidden'); }, 1500);
        }, animated ? i*80 : 0);
      });
    } else {
      sky.classList.remove('night'); groundEl.classList.remove('night');
      sunEl.classList.remove('hide'); moonEl.classList.remove('show');
      skyStars.forEach(s => s.classList.remove('show'));
      document.querySelectorAll('.cloud').forEach(c => c.classList.remove('night'));
      msgCard.classList.remove('night'); counterEl.classList.remove('night'); timeBadge.classList.remove('night');
      nightLabel.classList.remove('show');
      flowers.forEach((f, i) => {
        setTimeout(() => {
          f.classList.remove('sleep','hidden');
          f.classList.add('wake');
        }, animated ? i*100 : 0);
      });
    }
  }

  applyDayNight(isNight(), false);
  setInterval(() => applyDayNight(isNight(), true), 60000);

  // ─── AUTO-BLOOM every 1 min daytime ───
  setInterval(() => {
    if (!isNight()) {
      const x = 40 + Math.random() * (window.innerWidth - 80);
      makeSunflower(x, null, false);
      particles(x, window.innerHeight * (isMobile() ? 0.45 : 0.5));
    }
  }, 60000);

  // ─── CLOCK ───
  function updateClock() {
    const now = new Date(), h = now.getHours(), m = now.getMinutes();
    const ampm = h>=12?'PM':'AM', h12 = h%12||12, mm = String(m).padStart(2,'0');
    timeBadge.textContent = `${isNight()?'🌙':'☀️'} ${h12}:${mm} ${ampm}`;
  }
  updateClock();
  setInterval(updateClock, 30000);

  // ─── PARTICLES ───
  function particles(x, y) {
    const cols = ['#facc15','#fb923c','#fde68a','#f59e0b','#fef08a','#fff'];
    for (let i=0;i<10;i++) {
      const p = document.createElement('div'); p.className='particle';
      const sz = 4+Math.random()*8;
      p.style.width=sz+'px'; p.style.height=sz+'px';
      p.style.background = cols[Math.floor(Math.random()*cols.length)];
      p.style.left=x+'px'; p.style.top=y+'px';
      const a=Math.random()*360, d=30+Math.random()*60;
      p.style.setProperty('--dx', Math.cos(a*Math.PI/180)*d+'px');
      p.style.setProperty('--dy', Math.sin(a*Math.PI/180)*d+'px');
      p.style.animationDuration = (.8+Math.random()*.6)+'s';
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 1600);
    }
  }

  // ─── CLICK / TOUCH ───
  const skip = e => e.target.closest('#message-card')||e.target.closest('#counter')||e.target.closest('#reset-btn')||e.target.closest('#time-badge');
  garden.addEventListener('click', e => {
    if (skip(e)||isNight()) return;
    makeSunflower(e.clientX, null, false); particles(e.clientX, e.clientY);
  });
  garden.addEventListener('touchstart', e => {
    if (skip(e)||isNight()) return;
    const t = e.touches[0]; makeSunflower(t.clientX, null, false); particles(t.clientX, t.clientY);
  }, {passive:true});

  // ─── RESET ───
  document.getElementById('reset-btn').addEventListener('click', ev => {
    ev.stopPropagation();
    if (confirm('Clear all sunflowers and start fresh?')) {
      localStorage.removeItem(STORAGE_KEY);
      fc.innerHTML=''; savedFlowers=[]; count=0; countEl.textContent='0';
    }
  });
}