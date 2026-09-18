/* ============================================================
   STARBUCKS INDIA — MENU.JS
   ============================================================ */

'use strict';

// ── FULL MENU DATA ───────────────────────────────────────────
const MENU = [
  // ── BESTSELLER ──
  { id: 101, cat: 'bestseller', subcat: null, name: 'Cappuccino', meta: 'SHORT (237 ml) · 104 kcal', price: 336.00, img: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&q=80', veg: true, temp: 'hot', inStock: true, allergens: ['Milk'], desc: 'Dark, rich espresso lies in wait under a smoothed and stretched layer of deep, velvety foam.', taste: 'Bold espresso character balanced by airy microfoam — classic Italian elegance in every sip. Creamy, slightly bitter, deeply aromatic.' },
  { id: 102, cat: 'bestseller', subcat: null, name: 'Double Chocolate Chip Frappuccino', meta: 'SHORT (237 ml) · 344 kcal', price: 477.75, img: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&q=80', veg: true, temp: 'cold', inStock: true, allergens: ['Milk', 'Wheat'], desc: 'Rich mocha-flavoured sauce meets up with chocolaty chips, milk, and ice.', taste: 'Deep, bold chocolate that lingers — intensely rich, creamy, and satisfying. Made for true chocolate lovers. Sweet, indulgent, with a hint of espresso.' },
  { id: 103, cat: 'bestseller', subcat: null, name: 'Caffe Americano', meta: 'SHORT (237 ml) · 0 kcal', price: 325.50, img: 'https://images.unsplash.com/photo-1509785307050-d4066910ec1e?w=400&q=80', veg: true, temp: 'hot', inStock: true, allergens: [], desc: 'Rich, full-bodied espresso with hot water for a smooth, bold finish.', taste: 'Clean and pure — strong espresso intensity softened by hot water. Bold and direct with no distractions. The purist\'s choice.' },
  { id: 104, cat: 'bestseller', subcat: null, name: 'Java Chip Frappuccino', meta: 'TALL (354 ml) · 329 kcal', price: 456.75, img: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&q=80', veg: true, temp: 'cold', inStock: true, allergens: ['Soy', 'Milk', 'Wheat'], desc: 'Mocha sauce and Frappuccino® chips blended with roast coffee and milk and ice, topped with whipped vanilla topping and mocha drizzle.', taste: 'Rich, chocolatey with an intense espresso backbone. Each sip delivers layers of mocha, coffee, and cream — the ultimate indulgence in a cup.' },
  { id: 105, cat: 'bestseller', subcat: null, name: 'Cold Brew', meta: 'TALL (354 ml) · 354 kcal', price: 414.75, img: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=400&q=80', veg: true, temp: 'cold', inStock: true, allergens: ['Milk'], desc: "Everybody's favourite indulgence. Crafted expertly with premium cold brew coffee and cream.", taste: 'Silky, smooth, and cool — cold brew magic at its finest. Naturally sweet with low acidity. Refreshing and deeply satisfying, perfect for warm days.' },

  // ── DRINKS ──
  { id: 201, cat: 'drinks', subcat: 'Hot Coffee', name: 'Caffè Misto', meta: 'TALL (354 ml) · 90 kcal', price: 295.00, img: 'https://images.unsplash.com/photo-1497515114629-f71d768fd07c?w=400&q=80', veg: true, temp: 'hot', inStock: true, allergens: ['Milk'], desc: 'Half freshly brewed coffee, half steamed milk — the perfect balance of flavour and texture.', taste: 'Lighter than a latte but more indulgent than black coffee. Gentle, milky, with a pleasant coffee warmth. Soft and comforting.' },
  { id: 202, cat: 'drinks', subcat: 'Hot Coffee', name: 'Caramel Macchiato', meta: 'TALL (354 ml) · 240 kcal', price: 420.00, img: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&q=80', veg: true, temp: 'hot', inStock: true, allergens: ['Milk'], desc: 'Freshly steamed milk with vanilla-flavoured syrup, espresso and caramel sauce.', taste: 'Sweet vanilla and velvety milk crowned with bold espresso and a drizzle of caramel. A beautiful, layered experience — sweet, rich, and deeply satisfying.' },
  { id: 203, cat: 'drinks', subcat: 'Hot Coffee', name: 'Flat White', meta: 'SHORT (237 ml) · 130 kcal', price: 375.00, img: 'https://images.unsplash.com/photo-1518057111178-44a106bad636?w=400&q=80', veg: true, temp: 'hot', inStock: true, allergens: ['Milk'], desc: 'Ristretto shots of espresso with whole milk — a velvety, concentrated coffee experience.', taste: 'Intense espresso character with creamy microfoam. Richer and stronger than a latte — the coffee-lover\'s preferred choice. Bold, smooth, velvety.' },
  { id: 204, cat: 'drinks', subcat: 'Cold Coffee', name: 'Iced Caramel Latte', meta: 'TALL (354 ml) · 200 kcal', price: 390.00, img: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&q=80', veg: true, temp: 'cold', inStock: true, allergens: ['Milk'], desc: 'Espresso, milk, and caramel sauce over ice — refreshing, sweet, and indulgent.', taste: 'Cool, creamy, and sweet with bold espresso cutting through. Perfect refresher on a warm day. The caramel adds a luxurious buttery sweetness.' },
  { id: 205, cat: 'drinks', subcat: 'Cold Coffee', name: 'Brown Sugar Cinnamon Iced Shaken Espresso', meta: 'TALL (354 ml) · 117 kcal', price: 367.50, img: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=400&q=80', veg: true, temp: 'cold', inStock: true, allergens: ['Oat'], desc: 'Double shot of Signature Starbucks blonde roast shaken with brown sugar and cinnamon, topped with oat-based beverage blend.', taste: 'Warm spice meets cool refreshment. The brown sugar adds caramel depth while cinnamon brings warmth. Light, refreshing, effortlessly sophisticated.' },
  { id: 206, cat: 'drinks', subcat: 'Frappuccino', name: 'Caramel Frappuccino', meta: 'TALL (354 ml) · 380 kcal', price: 440.00, img: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=400&q=80', veg: true, temp: 'cold', inStock: true, allergens: ['Milk', 'Wheat'], desc: 'Buttery caramel sauce swirled through creamy blended coffee and milk, topped with whipped cream.', taste: 'Sweet, smooth, irresistibly velvety — finished with a cloud of whipped cream and caramel ribbon drizzle. Decadent and utterly delightful.' },
  { id: 207, cat: 'drinks', subcat: 'Frappuccino', name: 'Hogwarts Golden Vanilla Frappuccino', meta: 'TALL (354 ml) · 372 kcal', price: 577.50, img: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&q=80', veg: true, temp: 'cold', inStock: true, allergens: ['Milk', 'Barley', 'Soy'], desc: 'Enter the magical journey of Harry Potter — a treacle tart inspired beverage with the perfect combination of Starbucks signature coffee and flavour notes of Vanilla and caramel.', taste: 'Magical, dreamy, and uniquely delicious. Notes of vanilla and caramel with a Starbucks signature coffee backbone. Each sip is a taste of Hogwarts wonder.' },
  { id: 208, cat: 'drinks', subcat: 'Cold Coffee', name: 'Hogwarts Golden Vanilla Cold Brew', meta: 'TALL (354 ml) · 358 kcal', price: 472.50, img: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=400&q=80', veg: true, temp: 'cold', inStock: true, allergens: ['Milk', 'Soy'], desc: 'Enter the magical journey of Harry Potter with the Hogwarts Golden Vanilla Cold Brew.', taste: 'Smooth, velvety cold brew elevated with vanilla and caramel. A cool, enchanting experience that carries you to a world of magic.' },

  // ── FOOD ──
  { id: 301, cat: 'food', subcat: 'Sandwiches & Wraps', name: 'Avocado Panini Sandwich', meta: 'Per Serve (203g) · 490 kcal', price: 472.50, img: 'https://images.unsplash.com/photo-1528736235302-52922df5c122?w=400&q=80', veg: true, temp: null, inStock: true, allergens: ['Wheat', 'Milk', 'Nut'], desc: 'Avocado slices, buffalo mozzarella cheese, rocket leaves, and a basil pesto spread with a balsamic glaze dressing, sandwiched in a milk loaf panini.', taste: 'Fresh, creamy avocado meets rich mozzarella with herby pesto. Crispy on the outside, soft within — wholesome, flavourful, and utterly satisfying.' },
  { id: 302, cat: 'food', subcat: 'Sandwiches & Wraps', name: 'Chicken Ham Croissant Sandwich', meta: 'Per Serve · 420 kcal', price: 367.50, img: 'https://images.unsplash.com/photo-1599785209707-a456fc1337bb?w=400&q=80', veg: false, temp: null, inStock: true, allergens: ['Wheat', 'Milk', 'Egg'], desc: 'A croissant sandwich with grilled chicken and herb tossed chilli chicken.', taste: 'Flaky, buttery croissant with tender grilled chicken and a hint of herbs. Savory, satisfying, and perfectly balanced — the ideal light meal.' },
  { id: 303, cat: 'food', subcat: 'Sandwiches & Wraps', name: 'Grilled Paneer Cubano', meta: 'Per Serve · 430 kcal', price: 309.75, img: 'https://images.unsplash.com/photo-1553909489-cd47e0907980?w=400&q=80', veg: true, temp: null, inStock: true, allergens: ['Wheat', 'Milk'], desc: 'Grilled paneer with chimichurri, smoked tomato chutney and pickles.', taste: 'Smoky, herby, and wonderfully tangy. The chimichurri adds a fresh herbal lift while the tomato chutney deepens the flavour. Uniquely Indian-Latin fusion.' },
  { id: 304, cat: 'food', subcat: 'Sandwiches & Wraps', name: 'Paneer Tikka Wrap', meta: 'Per Serve · 415 kcal', price: 309.75, img: 'https://images.unsplash.com/photo-1565299543923-37dd37887442?w=400&q=80', veg: true, temp: null, inStock: false, allergens: ['Wheat', 'Milk'], desc: 'Grilled paneer with a tandoori marinade with veggies, onion, chillies.', taste: 'Smoky tandoori paneer, crisp veggies, and bold Indian spices wrapped in a soft tortilla. Familiar, comforting, and satisfying with every bite.' },
  { id: 305, cat: 'food', subcat: 'Sandwiches & Wraps', name: 'Smoked Paprika & Tomato Chicken Sandwich', meta: 'Per Serve · 370 kcal', price: 299.25, img: 'https://images.unsplash.com/photo-1521390188846-e2a3a97453a0?w=400&q=80', veg: false, temp: null, inStock: true, allergens: ['Wheat', 'Egg'], desc: 'Chunky chicken cubes in a sauce made of tomatoes and smoked paprika.', taste: 'Bold, smoky, and deeply savoury. The paprika adds a warm, earthy depth while the tomato keeps it bright and fresh. A substantial and flavourful choice.' },
  { id: 306, cat: 'food', subcat: 'Croissants & More', name: 'Chilli Cheese Toast', meta: 'Per Serve · 310 kcal', price: 378.00, img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80', veg: true, temp: null, inStock: true, allergens: ['Wheat', 'Milk'], desc: 'A cheesy French-style toasted baguette topped with red, yellow and green chillies.', taste: 'Crispy on the outside with gooey, melted cheese inside. The chillies bring a punchy heat that pairs perfectly with the richness of the cheese. Addictively good.' },
  { id: 307, cat: 'food', subcat: 'Cookies & Desserts', name: 'Double Chocolate Brownie', meta: 'Per Serve · 450 kcal', price: 295.00, img: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&q=80', veg: true, temp: null, inStock: true, allergens: ['Wheat', 'Milk', 'Egg'], desc: 'Rich, fudgy brownie made with two kinds of chocolate.', taste: 'Dense, fudgy, and intensely chocolatey. Perfectly moist with a crinkly crust and gooey centre. A chocolate lover\'s ultimate indulgence.' },
  { id: 308, cat: 'food', subcat: 'Cookies & Desserts', name: 'Chocolate Chip Cookie', meta: 'Per Serve · 220 kcal', price: 225.00, img: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&q=80', veg: true, temp: null, inStock: true, allergens: ['Wheat', 'Milk', 'Egg'], desc: 'Classic chewy chocolate chip cookie baked fresh with premium chocolate chips.', taste: 'Golden, chewy, and packed with melty chocolate chips. The edges are crisp, the centre is soft — classic cookie perfection that pairs beautifully with any beverage.' },

  // ── MERCHANDISE ──
  { id: 401, cat: 'merchandise', subcat: 'Mugs & Tumblers', name: 'Starbucks Green Ceramic Mug', meta: 'Capacity: 355 ml', price: 1299.00, img: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&q=80', veg: true, temp: null, inStock: true, allergens: [], desc: 'Classic Starbucks ceramic mug in signature green with the iconic Siren logo.', taste: 'Elevate your home coffee ritual with premium ceramic quality. Holds heat beautifully and feels perfect in hand.' },
  { id: 402, cat: 'merchandise', subcat: 'Mugs & Tumblers', name: 'Starbucks Cold Cup Tumbler', meta: 'Capacity: 473 ml', price: 1899.00, img: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&q=80', veg: true, temp: null, inStock: true, allergens: [], desc: 'Reusable cold cup with sliding lid and reusable straw — Starbucks sustainability in style.', taste: 'Keeps your drinks cold for hours. Stunning design, earth-conscious choice. Ideal for iced coffees and cold brews on the go.' },
  { id: 403, cat: 'merchandise', subcat: 'Coffee Beans', name: 'Starbucks Arabica Ground Coffee', meta: '200g | Medium Roast', price: 799.00, img: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400&q=80', veg: true, temp: null, inStock: true, allergens: [], desc: 'Signature Starbucks Arabica medium roast ground coffee for brewing at home.', taste: 'Smooth, balanced, and aromatic. Notes of cocoa and brown sugar with a clean, satisfying finish. Brings the Starbucks café experience to your kitchen.' },
];

// ── CATEGORY CONFIG ──────────────────────────────────────────
const CAT_CONFIG = {
  bestseller:   { title: 'Bestseller', desc: "Everyone's favorite Starbucks put together in a specially curated collection.", subcats: [] },
  drinks:       { title: 'Drinks', desc: 'Handcrafted beverages from espresso to cold brew — every sip tells a story.', subcats: ['Hot Coffee', 'Cold Coffee', 'Frappuccino'] },
  food:         { title: 'Food', desc: 'Freshly prepared food made with quality ingredients to complement your coffee.', subcats: ['Sandwiches & Wraps', 'Croissants & More', 'Cookies & Desserts'] },
  merchandise:  { title: 'Merchandise', desc: 'Take a piece of Starbucks home with you.', subcats: ['Mugs & Tumblers', 'Coffee Beans'] },
  'coffee-home':{ title: 'Coffee At Home', desc: 'Bring the Starbucks experience to your kitchen.', subcats: [] },
  'ready-to-eat':{ title: 'Ready to Eat', desc: 'Grab and go — delicious items ready when you are.', subcats: [] },
};

// ── STATE ────────────────────────────────────────────────────
let currentCat = 'bestseller';
let currentSubcat = null;
let currentFilter = 'all';
let currentSearch = '';
let modalQty = 1;
let modalItem = null;

// ── DOM REFS ─────────────────────────────────────────────────
const menuGrid    = document.getElementById('menu-grid');
const noResults   = document.getElementById('no-results');
const secTitle    = document.getElementById('menu-section-title');
const secDesc     = document.getElementById('menu-section-desc');
const subTabsEl   = document.getElementById('sub-tabs');
const menuSearch  = document.getElementById('menu-search');

// ── RENDER MENU ──────────────────────────────────────────────
function renderMenu() {
  if (!menuGrid) return;

  const conf = CAT_CONFIG[currentCat] || {};
  if (secTitle) secTitle.textContent = conf.title || currentCat;
  if (secDesc)  secDesc.textContent  = conf.desc  || '';

  // Build sub-tabs
  if (subTabsEl) {
    const subs = conf.subcats || [];
    subTabsEl.innerHTML = subs.length ? subs.map(s =>
      `<button class="sub-tab ${currentSubcat === s ? 'active' : ''}" data-sub="${s}">${s}</button>`
    ).join('') : '';
    subTabsEl.querySelectorAll('.sub-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        currentSubcat = btn.dataset.sub === currentSubcat ? null : btn.dataset.sub;
        renderMenu();
      });
    });
  }

  // Filter items
  let items = MENU.filter(i => i.cat === currentCat);
  if (currentSubcat) items = items.filter(i => i.subcat === currentSubcat);
  if (currentFilter === 'veg')     items = items.filter(i => i.veg);
  if (currentFilter === 'non-veg') items = items.filter(i => !i.veg);
  if (currentFilter === 'hot')     items = items.filter(i => i.temp === 'hot');
  if (currentFilter === 'cold')    items = items.filter(i => i.temp === 'cold');
  if (currentSearch) {
    const q = currentSearch.toLowerCase();
    items = items.filter(i => i.name.toLowerCase().includes(q) || i.desc.toLowerCase().includes(q));
  }

  if (!items.length) {
    menuGrid.innerHTML = '';
    noResults.style.display = 'block';
    return;
  }
  noResults.style.display = 'none';

  menuGrid.innerHTML = items.map(item => `
    <div class="menu-item-card" data-id="${item.id}">
      <img class="item-thumb" src="${item.img}" alt="${item.name}" loading="lazy" />
      <div class="item-info">
        <div class="item-veg-row">
          <span style="display:inline-block;width:16px;height:16px;border:2px solid ${item.veg?'#2e7d32':'#c62828'};border-radius:2px;position:relative;">
            ${item.veg 
              ? `<span style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:8px;height:8px;border-radius:50%;background:#2e7d32;"></span>`
              : `<span style="position:absolute;bottom:1px;left:50%;transform:translateX(-50%);width:0;height:0;border:4px solid transparent;border-bottom-color:#c62828;"></span>`}
          </span>
        </div>
        <div class="item-name">${item.name}</div>
        <div class="item-calories">${item.meta}</div>
        <div class="item-desc">${item.desc}</div>
        <div class="item-footer">
          <span class="item-price">₹ ${item.price.toFixed(2)}</span>
          ${item.inStock
            ? `<button class="item-add-btn ripple" data-id="${item.id}">Add Item</button>`
            : `<span class="item-out-of-stock">Out of Stock</span>`}
        </div>
      </div>
    </div>
  `).join('');

  // Bind clicks
  menuGrid.querySelectorAll('.menu-item-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('.item-add-btn')) return;
      const id = parseInt(card.dataset.id);
      openModal(id);
    });
  });
  menuGrid.querySelectorAll('.item-add-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const id = parseInt(btn.dataset.id);
      const item = MENU.find(x => x.id === id);
      if (!item || !item.inStock) return;
      CartStore.add({ ...item });
      btn.textContent = '✓ Added';
      btn.classList.add('added');
      showToast(`${item.name} added to cart!`, 'success');
      setTimeout(() => { btn.textContent = 'Add Item'; btn.classList.remove('added'); }, 1500);
    });
  });
}

// ── MODAL ────────────────────────────────────────────────────
function openModal(id) {
  const item = MENU.find(x => x.id === id);
  if (!item) return;
  modalItem = item;
  modalQty = 1;

  document.getElementById('modal-img').src   = item.img;
  document.getElementById('modal-img').alt   = item.name;
  document.getElementById('modal-name').textContent  = item.name;
  document.getElementById('modal-meta').textContent  = item.meta;
  document.getElementById('modal-desc').textContent  = item.desc;
  document.getElementById('modal-taste').textContent = item.taste;
  document.getElementById('modal-price').textContent = `₹ ${item.price.toFixed(2)}`;
  document.getElementById('modal-qty').textContent   = 1;

  const allergenEl = document.getElementById('modal-allergens');
  allergenEl.innerHTML = item.allergens.map(a => `<span class="allergen-tag">${a}</span>`).join('');

  const vegEl = document.getElementById('modal-veg');
  vegEl.innerHTML = `<span style="display:inline-block;width:18px;height:18px;border:2px solid ${item.veg?'#2e7d32':'#c62828'};border-radius:2px;position:relative;">
    ${item.veg ? `<span style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:8px;height:8px;border-radius:50%;background:#2e7d32;"></span>` : `<span style="position:absolute;bottom:2px;left:50%;transform:translateX(-50%);width:0;height:0;border:4px solid transparent;border-bottom-color:#c62828;"></span>`}
  </span>`;

  const addBtn = document.getElementById('modal-add-cart');
  if (item.inStock) {
    addBtn.textContent = 'Add to Cart';
    addBtn.disabled = false;
  } else {
    addBtn.textContent = 'Out of Stock';
    addBtn.disabled = true;
  }

  document.getElementById('item-modal-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('item-modal-overlay').classList.remove('open');
  document.body.style.overflow = '';
}

// Modal qty controls
document.getElementById('modal-minus')?.addEventListener('click', () => {
  if (modalQty > 1) { modalQty--; document.getElementById('modal-qty').textContent = modalQty; }
});
document.getElementById('modal-plus')?.addEventListener('click', () => {
  modalQty++;
  document.getElementById('modal-qty').textContent = modalQty;
});
document.getElementById('modal-add-cart')?.addEventListener('click', () => {
  if (!modalItem || !modalItem.inStock) return;
  CartStore.add({ ...modalItem, qty: modalQty });
  showToast(`${modalItem.name} (×${modalQty}) added to cart!`, 'success');
  closeModal();
});
document.getElementById('modal-close')?.addEventListener('click', closeModal);
document.getElementById('item-modal-overlay')?.addEventListener('click', e => {
  if (e.target === e.currentTarget) closeModal();
});

// ── CATEGORY TABS ────────────────────────────────────────────
document.querySelectorAll('.cat-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.cat-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    currentCat = tab.dataset.cat;
    currentSubcat = null;
    currentSearch = '';
    if (menuSearch) menuSearch.value = '';
    renderMenu();
    window.scrollTo({ top: 300, behavior: 'smooth' });
  });
});

// ── FILTER CHIPS ─────────────────────────────────────────────
document.querySelectorAll('.filter-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    currentFilter = chip.dataset.filter;
    renderMenu();
  });
});

// ── SEARCH ───────────────────────────────────────────────────
if (menuSearch) {
  menuSearch.addEventListener('input', () => {
    currentSearch = menuSearch.value.trim();
    renderMenu();
  });
}

// ── ORDER MODE TOGGLE ─────────────────────────────────────────
document.getElementById('dine-in-btn')?.addEventListener('click', function() {
  this.classList.add('active');
  document.getElementById('takeaway-btn')?.classList.remove('active');
  localStorage.setItem('sbux_mode', 'dine-in');
});
document.getElementById('takeaway-btn')?.addEventListener('click', function() {
  this.classList.add('active');
  document.getElementById('dine-in-btn')?.classList.remove('active');
  localStorage.setItem('sbux_mode', 'takeaway');
});

// ── URL PARAMS ───────────────────────────────────────────────
const urlParams = new URLSearchParams(window.location.search);
const catParam  = urlParams.get('cat');
const qParam    = urlParams.get('q');

if (catParam && CAT_CONFIG[catParam]) {
  currentCat = catParam;
  document.querySelectorAll('.cat-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.cat === catParam);
  });
}
if (qParam) {
  currentSearch = qParam;
  if (menuSearch) menuSearch.value = qParam;
}

// ── INIT ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderMenu();
});
