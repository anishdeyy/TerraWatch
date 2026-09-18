/* ============================================================
   STARBUCKS INDIA — MAIN APP JS
   Shared across all pages
   ============================================================ */

'use strict';

// ── BACKEND API URL ──────────────────────────────────────────
const API_BASE = 'http://localhost:5000/api';

// ── CART STATE (localStorage) ────────────────────────────────
const CartStore = {
  KEY: 'sbux_cart',
  get()  { return JSON.parse(localStorage.getItem(this.KEY) || '[]'); },
  save(c){ localStorage.setItem(this.KEY, JSON.stringify(c)); },
  add(item) {
    const cart = this.get();
    const existing = cart.find(i => i.id === item.id);
    if (existing) { existing.qty += item.qty || 1; }
    else { cart.push({ ...item, qty: item.qty || 1 }); }
    this.save(cart);
    updateCartBadge();
  },
  remove(id) {
    const cart = this.get().filter(i => i.id !== id);
    this.save(cart);
    updateCartBadge();
  },
  update(id, qty) {
    const cart = this.get();
    const item = cart.find(i => i.id === id);
    if (item) { item.qty = Math.max(1, qty); this.save(cart); }
    updateCartBadge();
  },
  clear() { localStorage.removeItem(this.KEY); updateCartBadge(); },
  count() { return this.get().reduce((s, i) => s + i.qty, 0); },
  total() { return this.get().reduce((s, i) => s + i.price * i.qty, 0); }
};

// ── TOAST ────────────────────────────────────────────────────
function showToast(msg, type = 'success') {
  const c = document.getElementById('toast-container');
  if (!c) return;
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  const icons = { success: '✓', error: '✕', info: 'ℹ' };
  t.innerHTML = `<span>${icons[type] || '✓'}</span><span>${msg}</span>`;
  c.appendChild(t);
  setTimeout(() => { t.classList.add('fade-out'); setTimeout(() => t.remove(), 400); }, 3000);
}

// ── CART BADGE ───────────────────────────────────────────────
function updateCartBadge() {
  const count = CartStore.count();
  document.querySelectorAll('#cart-count, #floating-cart-count').forEach(el => {
    el.textContent = count;
  });
  const fc = document.getElementById('floating-cart');
  if (fc) fc.classList.toggle('visible', count > 0);
}

// ── RIPPLE EFFECT ────────────────────────────────────────────
document.addEventListener('click', e => {
  const el = e.target.closest('.ripple');
  if (!el) return;
  const r = document.createElement('span');
  r.className = 'ripple-effect';
  const rect = el.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  r.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX-rect.left-size/2}px;top:${e.clientY-rect.top-size/2}px`;
  el.appendChild(r);
  r.addEventListener('animationend', () => r.remove());
});

// ── PAGE LOADER ──────────────────────────────────────────────
window.addEventListener('load', () => {
  const loader = document.getElementById('page-loader');
  if (loader) {
    setTimeout(() => loader.classList.add('hidden'), 600);
  }
  updateCartBadge();
});

// ── NAVBAR SCROLL ────────────────────────────────────────────
window.addEventListener('scroll', () => {
  const nav = document.getElementById('navbar');
  if (nav) nav.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

// ── HAMBURGER MENU ───────────────────────────────────────────
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');
if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open');
  });
}

// ── NAVBAR SEARCH ────────────────────────────────────────────
const navSearch = document.getElementById('nav-search');
if (navSearch) {
  navSearch.addEventListener('keydown', e => {
    if (e.key === 'Enter' && navSearch.value.trim()) {
      window.location.href = `menu.html?q=${encodeURIComponent(navSearch.value.trim())}`;
    }
  });
}

// ── INTERSECTION OBSERVER (showcase items) ───────────────────
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.showcase-item').forEach(el => io.observe(el));

// ── FACTS TYPING ANIMATION ───────────────────────────────────
const FACTS = [
  "Starbucks opens about 2 new stores every single day around the world.",
  "The Starbucks logo features a twin-tailed siren from Greek mythology — symbolizing the irresistible allure of coffee.",
  "Starbucks sources coffee from over 30 countries. Their expert tasters sample over 250,000 cups of coffee per year.",
  "The name 'Starbucks' was inspired by Starbuck, the first mate in Herman Melville's classic novel 'Moby Dick'.",
  "India's first Starbucks opened in Mumbai in 2012 — a joint venture with Tata Consumer Products."
];

function runTypingAnimation() {
  const el = document.getElementById('facts-typing');
  if (!el) return;

  let factIdx = 0;
  let charIdx = 0;
  let typing = true;

  function tick() {
    const fact = FACTS[factIdx];
    const dots = document.querySelectorAll('#facts .dot');

    if (typing) {
      charIdx++;
      el.innerHTML = fact.substring(0, charIdx) + '<span class="typing-cursor"></span>';
      if (charIdx >= fact.length) {
        typing = false;
        setTimeout(tick, 3000);
        return;
      }
      setTimeout(tick, 40 + Math.random() * 20);
    } else {
      charIdx--;
      el.innerHTML = fact.substring(0, charIdx) + '<span class="typing-cursor"></span>';
      if (charIdx <= 0) {
        typing = true;
        factIdx = (factIdx + 1) % FACTS.length;
        dots.forEach((d, i) => d.classList.toggle('active', i === factIdx));
        setTimeout(tick, 300);
        return;
      }
      setTimeout(tick, 18);
    }
  }
  tick();
}

// ── TOP SELLERS CAROUSEL ─────────────────────────────────────
const TOP_SELLERS = [
  { id: 1, name: 'Java Chip Frappuccino', meta: 'TALL (354 ml) · 329 kcal', price: 456.75, img: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&q=80', veg: true, desc: 'Mocha sauce and Frappuccino® chips blended with roast coffee, milk, and ice. Rich chocolate meets intense espresso.' },
  { id: 2, name: 'Cappuccino', meta: 'SHORT (237 ml) · 104 kcal', price: 336.00, img: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&q=80', veg: true, desc: 'Dark, rich espresso under a smoothed layer of deep, velvety foam. Classic Italian perfection.' },
  { id: 3, name: 'Caffe Americano', meta: 'SHORT (237 ml) · 0 kcal', price: 325.50, img: 'https://images.unsplash.com/photo-1509785307050-d4066910ec1e?w=400&q=80', veg: true, desc: 'Rich, full-bodied espresso with hot water for a smooth, bold finish. Clean, pure coffee at its best.' },
  { id: 4, name: 'Double Choc Chip Frappuccino', meta: 'SHORT (237 ml) · 344 kcal', price: 477.75, img: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&q=80', veg: true, desc: 'Rich mocha sauce, chocolaty chips, milk and ice. Deep, bold chocolate that lingers.' },
  { id: 5, name: 'Cold Brew', meta: 'TALL (354 ml) · 354 kcal', price: 414.75, img: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=400&q=80', veg: true, desc: "Everyone's favourite indulgence, crafted expertly with premium cold brew coffee and cream." },
  { id: 6, name: 'Caramel Latte', meta: 'TALL (354 ml) · 310 kcal', price: 420.00, img: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&q=80', veg: true, desc: 'Velvety espresso swirled with steamed milk and a ribbon of caramel sauce. Sweet comfort in every sip.' },
];

function buildCarousel() {
  const track = document.getElementById('carousel-track');
  if (!track) return;

  // Show skeleton first
  track.innerHTML = TOP_SELLERS.map(() => `
    <div class="skeleton-card">
      <div class="skeleton skeleton-img"></div>
      <div class="skeleton-body">
        <div class="skeleton skeleton-line" style="width:80%"></div>
        <div class="skeleton skeleton-line short"></div>
        <div class="skeleton skeleton-line" style="width:60%"></div>
      </div>
    </div>
  `).join('');

  setTimeout(() => {
    track.innerHTML = TOP_SELLERS.map(item => `
      <div class="product-card" data-id="${item.id}">
        <div class="card-img-wrap">
          <img src="${item.img}" alt="${item.name}" loading="lazy" />
          <div class="card-veg-dot ${item.veg ? 'veg' : 'nonveg'}"></div>
        </div>
        <div class="card-body">
          <div class="card-name">${item.name}</div>
          <div class="card-meta">${item.meta}</div>
          <div class="card-desc">${item.desc}</div>
          <div class="card-footer">
            <span class="card-price">₹ ${item.price.toFixed(2)}</span>
            <button class="card-add-btn ripple" data-id="${item.id}">Add Item</button>
          </div>
        </div>
      </div>
    `).join('');

    track.querySelectorAll('.card-add-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const id = parseInt(btn.dataset.id);
        const item = TOP_SELLERS.find(x => x.id === id);
        CartStore.add({ ...item });
        btn.textContent = '✓ Added';
        btn.classList.add('added');
        showToast(`${item.name} added to cart!`, 'success');
        setTimeout(() => { btn.textContent = 'Add Item'; btn.classList.remove('added'); }, 1500);
      });
    });
  }, 800);
}

// Carousel nav
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const carouselTrack = document.getElementById('carousel-track');
if (prevBtn && carouselTrack) {
  prevBtn.addEventListener('click', () => carouselTrack.scrollBy({ left: -300, behavior: 'smooth' }));
}
if (nextBtn && carouselTrack) {
  nextBtn.addEventListener('click', () => carouselTrack.scrollBy({ left: 300, behavior: 'smooth' }));
}

// ── INIT ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  buildCarousel();
  runTypingAnimation();
  updateCartBadge();
});
