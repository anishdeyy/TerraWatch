/* ============================================================
   STARBUCKS INDIA — AUTH.JS
   ============================================================ */

'use strict';

// ── TAB SWITCH ───────────────────────────────────────────────
const loginTab    = document.getElementById('login-tab');
const registerTab = document.getElementById('register-tab');
const loginWrap   = document.getElementById('login-form-wrap');
const regWrap     = document.getElementById('register-form-wrap');

// Auto-open register if URL has ?mode=register
const urlMode = new URLSearchParams(window.location.search).get('mode');
if (urlMode === 'register') {
  loginTab?.classList.remove('active');
  registerTab?.classList.add('active');
  loginWrap.style.display = 'none';
  regWrap.style.display = 'block';
}

loginTab?.addEventListener('click', () => {
  loginTab.classList.add('active');
  registerTab.classList.remove('active');
  loginWrap.style.display = 'block';
  regWrap.style.display = 'none';
});
registerTab?.addEventListener('click', () => {
  registerTab.classList.add('active');
  loginTab.classList.remove('active');
  regWrap.style.display = 'block';
  loginWrap.style.display = 'none';
});

// ── SHOW PASSWORD TOGGLE ──────────────────────────────────────
document.querySelectorAll('.toggle-pw').forEach(btn => {
  btn.addEventListener('click', () => {
    const input = document.getElementById(btn.dataset.target);
    if (input) {
      input.type = input.type === 'password' ? 'text' : 'password';
    }
  });
});

// ── PASSWORD STRENGTH ─────────────────────────────────────────
document.getElementById('reg-password')?.addEventListener('input', function() {
  const pw   = this.value;
  const bar  = document.getElementById('pw-bar');
  const label = document.getElementById('pw-strength-label');
  if (!bar || !label) return;

  let strength = 0;
  if (pw.length >= 8)   strength++;
  if (/[A-Z]/.test(pw)) strength++;
  if (/[0-9]/.test(pw)) strength++;
  if (/[^A-Za-z0-9]/.test(pw)) strength++;

  const levels = [
    { pct: '25%', bg: '#f44336', text: 'Weak' },
    { pct: '50%', bg: '#ff9800', text: 'Fair' },
    { pct: '75%', bg: '#ffc107', text: 'Good' },
    { pct: '100%', bg: '#4caf50', text: 'Strong' },
  ];
  const lvl = levels[Math.max(0, strength - 1)];
  if (pw.length > 0 && lvl) {
    bar.style.width = lvl.pct;
    bar.style.background = lvl.bg;
    label.textContent = lvl.text;
    label.style.color = lvl.bg;
  } else {
    bar.style.width = '0';
    label.textContent = '';
  }
});

// ── LOGIN FORM ───────────────────────────────────────────────
document.getElementById('login-form')?.addEventListener('submit', async function(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  const pw    = document.getElementById('login-password').value;

  const btn = this.querySelector('.auth-submit');
  btn.textContent = 'Signing in...';
  btn.disabled = true;

  try {
    const res  = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pw })
    });
    const data = await res.json();

    if (res.ok && data.token) {
      localStorage.setItem('sbux_token', data.token);
      localStorage.setItem('sbux_user', JSON.stringify(data.user));
      showToast(`Welcome back, ${data.user.name || 'coffee lover'}!`, 'success');
      setTimeout(() => { window.location.href = 'index.html'; }, 1000);
    } else {
      throw new Error(data.message || 'Invalid credentials');
    }
  } catch (err) {
    // Demo mode: simulate login with any email/password
    if (email && pw.length >= 6) {
      const demoUser = { name: email.split('@')[0], email, id: Date.now() };
      localStorage.setItem('sbux_user', JSON.stringify(demoUser));
      localStorage.setItem('sbux_token', 'demo_token_' + Date.now());
      showToast(`Welcome, ${demoUser.name}! (Demo mode)`, 'success');
      setTimeout(() => {
        const redirect = new URLSearchParams(window.location.search).get('redirect') || 'index.html';
        window.location.href = redirect;
      }, 1000);
    } else {
      showToast(err.message || 'Login failed. Check your credentials.', 'error');
    }
  }

  btn.textContent = 'Sign In';
  btn.disabled = false;
});

// ── REGISTER FORM ────────────────────────────────────────────
document.getElementById('register-form')?.addEventListener('submit', async function(e) {
  e.preventDefault();
  const fname = document.getElementById('reg-fname').value.trim();
  const lname = document.getElementById('reg-lname').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const phone = document.getElementById('reg-phone').value.trim();
  const pw    = document.getElementById('reg-password').value;

  if (pw.length < 8) { showToast('Password must be at least 8 characters', 'error'); return; }

  const btn = this.querySelector('.auth-submit');
  btn.textContent = 'Creating account...';
  btn.disabled = true;

  try {
    const res  = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firstName: fname, lastName: lname, email, phone, password: pw })
    });
    const data = await res.json();

    if (res.ok && data.token) {
      localStorage.setItem('sbux_token', data.token);
      localStorage.setItem('sbux_user', JSON.stringify(data.user));
      showToast(`Account created! Welcome, ${fname}!`, 'success');
      setTimeout(() => { window.location.href = 'index.html'; }, 1000);
    } else {
      throw new Error(data.message || 'Registration failed');
    }
  } catch (err) {
    // Demo mode
    const demoUser = { name: `${fname} ${lname}`, email, phone, id: Date.now() };
    localStorage.setItem('sbux_user', JSON.stringify(demoUser));
    localStorage.setItem('sbux_token', 'demo_token_' + Date.now());
    showToast(`Welcome, ${fname}! Account created (Demo mode)`, 'success');
    setTimeout(() => { window.location.href = 'index.html'; }, 1000);
  }

  btn.textContent = 'Create Account';
  btn.disabled = false;
});
