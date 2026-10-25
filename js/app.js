/* ============ NOVA UI — shared behaviors ============ */

// Navbar scroll state
const nav = document.querySelector('.nav');
if (nav) {
  addEventListener('scroll', () => nav.classList.toggle('scrolled', scrollY > 30));
}

// Reveal on scroll
const io = new IntersectionObserver(
  (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('in')),
  { threshold: 0.12 }
);
document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

// Spotlight hover on cards
document.querySelectorAll('.card').forEach((card) => {
  card.addEventListener('mousemove', (e) => {
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', `${e.clientX - r.left}px`);
    card.style.setProperty('--my', `${e.clientY - r.top}px`);
  });
});

// Ripple on buttons (delegated — works for dynamically added buttons too)
document.addEventListener('click', (e) => {
  const btn = e.target.closest('.btn');
  if (!btn) return;
  const r = btn.getBoundingClientRect();
  const s = Math.max(r.width, r.height);
  const rip = document.createElement('span');
  rip.className = 'ripple';
  rip.style.cssText = `width:${s}px;height:${s}px;left:${e.clientX - r.left - s / 2}px;top:${e.clientY - r.top - s / 2}px`;
  btn.appendChild(rip);
  setTimeout(() => rip.remove(), 650);
});

// Toast system
function toast(msg, type = 'info') {
  let box = document.getElementById('toasts');
  if (!box) {
    box = document.createElement('div');
    box.id = 'toasts';
    document.body.appendChild(box);
  }
  const icons = { success: '✓', error: '✕', info: 'ℹ' };
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = `<div class="t-icon">${icons[type]}</div><div>${msg}</div>`;
  box.appendChild(t);
  setTimeout(() => {
    t.classList.add('out');
    setTimeout(() => t.remove(), 400);
  }, 3600);
}

// Mobile burger (delegated — navbar may be rewritten by the auth-aware block below)
document.addEventListener('click', (e) => {
  if (!e.target.closest('.burger')) return;
  const links = document.querySelector('.nav-links');
  if (!links) return;
  const open = links.style.display === 'flex';
  links.style.display = open ? '' : 'flex';
  if (!open) Object.assign(links.style, {
    position: 'absolute', top: '100%', right: '0', left: '0', flexDirection: 'column',
    gap: '4px', padding: '14px 6vw', background: 'rgba(7,10,23,.96)',
    borderBottom: '1px solid var(--border)', backdropFilter: 'blur(18px)',
  });
});

/* ============ tiny auth store (demo only — localStorage) ============ */
const DB = {
  users: () => JSON.parse(localStorage.getItem('nova_users') || '[]'),
  saveUsers: (u) => localStorage.setItem('nova_users', JSON.stringify(u)),
  session: () => JSON.parse(localStorage.getItem('nova_session') || 'null'),
  setSession: (s) => localStorage.setItem('nova_session', JSON.stringify(s)),
  clearSession: () => localStorage.removeItem('nova_session'),
};
// demo-only hash — NOT for production
function hash(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16);
}
function requireAuth() {
  if (!DB.session()) {
    location.href = 'login.html';
    return false;
  }
  return true;
}

/* ============ auth-aware navbar ============
   یک بار ورود کافی است: اگر سشن وجود داشته باشد،
   دکمه‌های «ورود/ثبت‌نام» با «رفتن به داشبورد» + «خروج» جایگزین می‌شوند. */
const navCta = document.querySelector('.nav-cta');
if (navCta && DB.session()) {
  navCta.innerHTML = `
    <a href="dashboard.html" class="btn btn-grad">رفتن به داشبورد ←</a>
    <button class="btn btn-ghost" data-logout>خروج ⏻</button>
    <button class="burger" aria-label="منو">☰</button>`;
}

// خروج از حساب — از هر صفحه‌ای
document.addEventListener('click', (e) => {
  if (!e.target.closest('[data-logout]')) return;
  DB.clearSession();
  toast('با موفقیت خارج شدی 👋', 'info');
  setTimeout(() => (location.href = 'index.html'), 700);
});

/* ============ FX layer — particles, cursor glow, tilt, progress, page transitions ============ */
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!reduceMotion) {
  // floating particles
  const p = document.createElement('div');
  p.className = 'particles';
  for (let i = 0; i < 22; i++) {
    const s = 2 + Math.random() * 5;
    const el = document.createElement('i');
    el.style.cssText = `left:${Math.random() * 100}vw;width:${s}px;height:${s}px;
      animation-duration:${9 + Math.random() * 14}s;animation-delay:${-Math.random() * 20}s;
      opacity:${.25 + Math.random() * .5}`;
    p.appendChild(el);
  }
  document.body.appendChild(p);

  // cursor glow
  const glow = document.createElement('div');
  glow.id = 'cursor-glow';
  glow.style.opacity = '0';
  document.body.appendChild(glow);
  addEventListener('pointermove', (e) => {
    glow.style.opacity = '1';
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
  });

  // 3D tilt on cards
  document.querySelectorAll('.card').forEach((c) => c.classList.add('tilt'));
  document.addEventListener('mousemove', (e) => {
    const card = e.target.closest('.card.tilt');
    if (!card) return;
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    card.style.transform = `perspective(900px) rotateY(${x * 9}deg) rotateX(${-y * 9}deg) translateY(-6px)`;
  });
  document.addEventListener('mouseout', (e) => {
    const card = e.target.closest?.('.card.tilt');
    if (card && !card.contains(e.relatedTarget)) card.style.transform = '';
  });

  // hero word-by-word reveal
  const h1 = document.querySelector('.hero h1');
  if (h1) {
    const walk = (node) => {
      [...node.childNodes].forEach((ch) => {
        if (ch.nodeType === 3) {
          const frag = document.createDocumentFragment();
          ch.textContent.split(/(\s+)/).forEach((w) => {
            if (!w.trim()) { frag.appendChild(document.createTextNode(w)); return; }
            const s = document.createElement('span');
            s.className = 'word';
            s.textContent = w;
            frag.appendChild(s);
          });
          ch.replaceWith(frag);
        } else if (ch.nodeType === 1 && ch.tagName !== 'BR') walk(ch);
      });
    };
    walk(h1);
    h1.style.animation = 'none';
    h1.querySelectorAll('.word').forEach((w, i) => (w.style.animationDelay = `${0.15 + i * 0.07}s`));
  }
}

// scroll progress bar
const prog = document.createElement('div');
prog.id = 'progress';
document.body.appendChild(prog);
addEventListener('scroll', () => {
  const max = document.documentElement.scrollHeight - innerHeight;
  prog.style.width = (max > 0 ? (scrollY / max) * 100 : 0) + '%';
}, { passive: true });

// smooth page transitions: fade out before following internal links
document.addEventListener('click', (e) => {
  const a = e.target.closest('a');
  if (!a) return;
  const href = a.getAttribute('href') || '';
  if (!/\.html(#.*)?$/.test(href) || a.target === '_blank' || reduceMotion) return;
  e.preventDefault();
  document.body.classList.add('leaving');
  setTimeout(() => (location.href = href), 280);
});
