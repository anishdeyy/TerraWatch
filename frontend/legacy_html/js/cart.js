/* ============================================================
   STARBUCKS INDIA — CART.JS
   ============================================================ */

'use strict';

const TAX_RATE   = 0.05;
const PROMO_CODES = { 'SBUX10': 0.10, 'FIRST20': 0.20, 'INDIA15': 0.15 };
let orderMode    = localStorage.getItem('sbux_mode') || 'dine-in';
let promoDiscount = 0;
let orderCounter  = parseInt(localStorage.getItem('sbux_order_counter') || '1000');

// ── RENDER CART ──────────────────────────────────────────────
function renderCart() {
  const cart = CartStore.get();
  const listEl   = document.getElementById('cart-items-list');
  const emptyEl  = document.getElementById('empty-cart');
  const rightEl  = document.getElementById('cart-right');

  if (!listEl) return;

  if (!cart.length) {
    listEl.innerHTML = '';
    if (emptyEl) emptyEl.style.display = 'flex';
    if (rightEl) rightEl.style.display = 'none';
    return;
  }

  if (emptyEl) emptyEl.style.display = 'none';
  if (rightEl) rightEl.style.display = 'block';

  listEl.innerHTML = cart.map(item => `
    <div class="cart-item" data-id="${item.id}">
      <img class="cart-item-img" src="${item.img}" alt="${item.name}" />
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-meta">${item.meta || ''} · ${orderMode === 'dine-in' ? 'Dine-In' : 'Takeaway'}</div>
        <div class="cart-item-controls">
          <div class="cart-qty-control">
            <button class="cart-qty-btn" data-action="minus" data-id="${item.id}">−</button>
            <span class="cart-qty-val">${item.qty}</span>
            <button class="cart-qty-btn" data-action="plus" data-id="${item.id}">+</button>
          </div>
          <span class="cart-item-price">₹ ${(item.price * item.qty).toFixed(2)}</span>
          <button class="cart-remove-btn" data-id="${item.id}">✕ Remove</button>
        </div>
      </div>
    </div>
  `).join('');

  // Bind qty buttons
  listEl.querySelectorAll('.cart-qty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id  = parseInt(btn.dataset.id);
      const cart = CartStore.get();
      const item = cart.find(i => i.id === id);
      if (!item) return;
      if (btn.dataset.action === 'plus') {
        CartStore.update(id, item.qty + 1);
      } else {
        if (item.qty <= 1) CartStore.remove(id);
        else CartStore.update(id, item.qty - 1);
      }
      renderCart();
      updateSummary();
    });
  });

  // Bind remove buttons
  listEl.querySelectorAll('.cart-remove-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.id);
      CartStore.remove(id);
      renderCart();
      updateSummary();
      showToast('Item removed from cart', 'info');
    });
  });

  updateSummary();
}

// ── UPDATE SUMMARY ───────────────────────────────────────────
function updateSummary() {
  const subtotal = CartStore.total();
  const discount = subtotal * promoDiscount;
  const discounted = subtotal - discount;
  const tax = discounted * TAX_RATE;
  const total = discounted + tax;

  document.getElementById('summary-subtotal').textContent  = `₹ ${subtotal.toFixed(2)}`;
  document.getElementById('summary-tax').textContent       = `₹ ${tax.toFixed(2)}`;
  document.getElementById('summary-total').textContent     = `₹ ${total.toFixed(2)}`;
  document.getElementById('payment-total').textContent     = `₹ ${total.toFixed(2)}`;

  return total;
}

// ── ORDER MODE TOGGLE ─────────────────────────────────────────
document.getElementById('cart-dine-in')?.addEventListener('click', function() {
  orderMode = 'dine-in';
  localStorage.setItem('sbux_mode', orderMode);
  this.classList.add('active');
  document.getElementById('cart-takeaway')?.classList.remove('active');
  renderCart();
});
document.getElementById('cart-takeaway')?.addEventListener('click', function() {
  orderMode = 'takeaway';
  localStorage.setItem('sbux_mode', orderMode);
  this.classList.add('active');
  document.getElementById('cart-dine-in')?.classList.remove('active');
  renderCart();
});

// ── PROMO CODE ───────────────────────────────────────────────
document.getElementById('promo-apply')?.addEventListener('click', () => {
  const code = document.getElementById('promo-input').value.trim().toUpperCase();
  const msgEl = document.getElementById('promo-msg');
  if (PROMO_CODES[code]) {
    promoDiscount = PROMO_CODES[code];
    msgEl.className = 'promo-msg success';
    msgEl.textContent = `✓ ${(promoDiscount * 100).toFixed(0)}% discount applied!`;
    updateSummary();
    showToast(`Promo code applied! ${(promoDiscount*100).toFixed(0)}% off`, 'success');
  } else {
    promoDiscount = 0;
    msgEl.className = 'promo-msg error';
    msgEl.textContent = 'Invalid promo code. Try SBUX10, FIRST20, or INDIA15.';
    updateSummary();
  }
});

// ── CHECKOUT MODAL ───────────────────────────────────────────
document.getElementById('checkout-btn')?.addEventListener('click', () => {
  if (!CartStore.count()) { showToast('Your cart is empty!', 'error'); return; }
  openCheckoutModal();
});

function openCheckoutModal() {
  const isLoggedIn = localStorage.getItem('sbux_user');
  const loginReq   = document.getElementById('login-required');
  const payPanel   = document.getElementById('payment-panel');

  if (isLoggedIn) {
    loginReq.style.display = 'none';
    payPanel.style.display = 'block';
    buildPaymentSummary();
  } else {
    loginReq.style.display = 'flex';
    payPanel.style.display = 'none';
  }

  document.getElementById('checkout-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function buildPaymentSummary() {
  const cart = CartStore.get();
  const listEl = document.getElementById('payment-items-list');
  if (!listEl) return;
  listEl.innerHTML = cart.map(i => `
    <div class="summary-row">
      <span>${i.name} × ${i.qty}</span>
      <span>₹ ${(i.price * i.qty).toFixed(2)}</span>
    </div>
  `).join('');

  // Check payment downtime (mock)
  checkPaymentDowntime();
}

async function checkPaymentDowntime() {
  // Mock: in production, call GET /v1/payments/downtimes via backend
  const hasDowntime = false; // Set to true to simulate
  const msgEl = document.getElementById('payment-downtime-msg');
  if (msgEl) msgEl.style.display = hasDowntime ? 'block' : 'none';
}

document.getElementById('checkout-close')?.addEventListener('click', () => {
  document.getElementById('checkout-overlay').classList.remove('open');
  document.body.style.overflow = '';
});

// ── RAZORPAY PAYMENT ─────────────────────────────────────────
document.getElementById('pay-now-btn')?.addEventListener('click', initiatePayment);

async function initiatePayment() {
  const total = updateSummary();
  const amountPaise = Math.round(total * 100);
  const user = JSON.parse(localStorage.getItem('sbux_user') || '{}');

  const btn = document.getElementById('pay-now-btn');
  btn.textContent = 'Initiating payment...';
  btn.disabled = true;

  try {
    // Create order via backend
    let razorpayOrderId = null;
    try {
      const res = await fetch(`${API_BASE}/payments/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('sbux_token')}` },
        body: JSON.stringify({ amount: amountPaise })
      });
      const data = await res.json();
      razorpayOrderId = data.id;
    } catch {
      // If backend unavailable, use frontend-only demo mode
      console.warn('Backend unavailable, using demo mode');
    }

    const options = {
      key: 'rzp_test_YOUR_KEY_HERE',          // Replace with your Razorpay test key
      amount: amountPaise,
      currency: 'INR',
      name: 'Starbucks India',
      description: `Order for ${CartStore.count()} item(s)`,
      image: 'https://upload.wikimedia.org/wikipedia/en/d/d3/Starbucks_Corporation_Logo_2011.svg',
      order_id: razorpayOrderId,
      prefill: {
        name: user.name || '',
        email: user.email || '',
        contact: user.phone || ''
      },
      theme: { color: '#006241' },
      handler: function(response) {
        handlePaymentSuccess(response, total);
      },
      modal: {
        ondismiss: function() {
          btn.textContent = 'Pay with Razorpay';
          btn.disabled = false;
        }
      }
    };

    const rzp = new Razorpay(options);
    rzp.open();

  } catch (err) {
    console.error('Payment error:', err);
    // Demo mode: simulate payment success
    const demoResponse = { razorpay_payment_id: 'pay_demo_' + Date.now() };
    handlePaymentSuccess(demoResponse, total);
  }

  btn.textContent = 'Pay with Razorpay';
  btn.disabled = false;
}

function handlePaymentSuccess(response, total) {
  // Generate order ID
  orderCounter++;
  localStorage.setItem('sbux_order_counter', orderCounter);

  const orderId = '#' + orderCounter;
  const orderData = {
    id: orderId,
    items: CartStore.get(),
    total: total,
    paymentId: response.razorpay_payment_id,
    mode: orderMode,
    timestamp: new Date().toISOString(),
    status: 'confirmed'
  };

  // Save order history
  const history = JSON.parse(localStorage.getItem('sbux_orders') || '[]');
  history.push(orderData);
  localStorage.setItem('sbux_orders', JSON.stringify(history));

  // Clear cart
  CartStore.clear();

  // Close checkout modal
  document.getElementById('checkout-overlay').classList.remove('open');
  document.body.style.overflow = '';

  // Show success
  document.getElementById('success-order-id').textContent = `Your Order ${orderId} is confirmed`;
  document.getElementById('success-overlay').classList.add('open');
  renderCart();
  showToast(`Order ${orderId} placed successfully!`, 'success');
}

// ── ORDER MODE INIT ───────────────────────────────────────────
const savedMode = localStorage.getItem('sbux_mode') || 'dine-in';
if (savedMode === 'takeaway') {
  document.getElementById('cart-takeaway')?.classList.add('active');
  document.getElementById('cart-dine-in')?.classList.remove('active');
} else {
  document.getElementById('cart-dine-in')?.classList.add('active');
  document.getElementById('cart-takeaway')?.classList.remove('active');
}
orderMode = savedMode;

// ── INIT ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderCart();
});
