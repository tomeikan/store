// ===== 購物車（存在 localStorage）=====
function getCart() {
  return JSON.parse(localStorage.getItem('cart') || '[]');
}
function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartBadge();
}
function updateCartBadge() {
  const cart = getCart();
  const count = cart.reduce((s, i) => s + i.qty, 0);
  const badge = document.getElementById('cart-count');
  if (badge) badge.textContent = count;
}

// ===== Toast 提示 =====
function showToast(msg) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2200);
}

// ===== 取得登入使用者 =====
function getUser() {
  const raw = localStorage.getItem('user');
  return raw ? JSON.parse(raw) : null;
}
function getToken() {
  return localStorage.getItem('token');
}

// ===== 商品頁邏輯 =====
let allProducts = [];
let modalQty = 1;
let selectedProduct = null;

async function loadProducts() {
  const grid = document.getElementById('product-grid');
  if (!grid) return;
  try {
    const res = await fetch(`${CONFIG.API_URL}/api/products`);
    allProducts = await res.json();
    renderProducts(allProducts);
  } catch (e) {
    grid.innerHTML = '<div class="error-msg">無法載入商品，請稍後再試</div>';
  }
}

function renderProducts(products) {
  const grid = document.getElementById('product-grid');
  if (!products.length) {
    grid.innerHTML = '<div class="loading">目前沒有商品</div>';
    return;
  }
  grid.innerHTML = products.map(p => {
    // 取得主圖
    let thumbHtml = `<div class="product-thumb" style="background:#f0f7ff;">${p.emoji || '📦'}</div>`;
    if (p.images) {
      try {
        const imgs = JSON.parse(p.images);
        if (imgs.length) thumbHtml = `<img src="${imgs[0]}" style="width:100%;height:130px;object-fit:cover;display:block;" alt="${p.name}" />`;
      } catch(e) {}
    }
    return `
    <div class="product-card" onclick="location.href='product.html?id=${p.id}'">
      ${thumbHtml}
      <div class="product-body">
        ${p.is_sale ? '<span class="product-tag">特賣</span>' : ''}
        ${p.product_type === 'preorder' ? '<span class="product-tag" style="background:#e6f1fb;color:#185fa5;">預購</span>' : ''}
        <div class="product-name">${p.name}</div>
        <div>
          <span class="product-price">NT$${p.price.toLocaleString()}</span>
          ${p.original_price ? `<span class="product-old">NT$${p.original_price.toLocaleString()}</span>` : ''}
        </div>
        <button class="add-btn" onclick="event.stopPropagation(); quickAdd(${p.id})">加入購物車</button>
      </div>
    </div>`;
  }).join('');
}

function filterProducts() {
  const cat = document.getElementById('category-filter').value;
  const filtered = cat ? allProducts.filter(p => p.category === cat) : allProducts;
  renderProducts(filtered);
}

function openModal(id) {
  const p = allProducts.find(x => x.id === id);
  if (!p) return;
  selectedProduct = p;
  modalQty = 1;
  document.getElementById('modal-img').textContent = p.emoji || '📦';
  document.getElementById('modal-name').textContent = p.name;
  document.getElementById('modal-price').textContent = `NT$${p.price.toLocaleString()}`;
  document.getElementById('modal-desc').textContent = p.description || '';
  document.getElementById('modal-qty').textContent = 1;
  document.getElementById('modal').classList.add('open');
}

function closeModal() {
  document.getElementById('modal').classList.remove('open');
}

function changeModalQty(d) {
  modalQty = Math.max(1, modalQty + d);
  document.getElementById('modal-qty').textContent = modalQty;
}

function addToCartFromModal() {
  if (!selectedProduct) return;
  addItemToCart(selectedProduct, modalQty);
  closeModal();
  showToast(`已加入 ${selectedProduct.name} ×${modalQty}`);
}

function quickAdd(id) {
  const p = allProducts.find(x => x.id === id);
  if (!p) return;
  addItemToCart(p, 1);
  showToast(`已加入 ${p.name}`);
}

function addItemToCart(product, qty) {
  const cart = getCart();
  const existing = cart.find(i => i.id === product.id);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ id: product.id, name: product.name, price: product.price, emoji: product.emoji || '📦', qty });
  }
  saveCart(cart);
}

// ===== 公告頁 =====
async function loadNotices() {
  const list = document.getElementById('notice-list');
  if (!list) return;
  try {
    const res = await fetch(`${CONFIG.API_URL}/api/notices`);
    const notices = await res.json();
    if (!notices.length) { list.innerHTML = '<div class="loading">目前沒有公告</div>'; return; }
    list.innerHTML = notices.map(n => `
      <div class="notice-card">
        <span class="notice-tag tag-${n.tag}">${n.tag_label}</span>
        <div class="notice-title">${n.title}</div>
        <div class="notice-content">${n.content}</div>
        <div class="notice-date">${new Date(n.created_at).toLocaleDateString('zh-TW')}</div>
      </div>
    `).join('');
  } catch (e) {
    list.innerHTML = '<div class="error-msg">無法載入公告</div>';
  }
}

// ===== 購物車頁 =====
function renderCart() {
  const wrap = document.getElementById('cart-wrap');
  if (!wrap) return;
  const cart = getCart();
  if (!cart.length) {
    wrap.innerHTML = `
      <div class="cart-empty">
        <div class="cart-empty-icon">🛒</div>
        <p>購物車是空的</p>
        <br><a href="index.html" style="color:#1a1a2e;font-weight:600;">去逛逛</a>
      </div>`;
    return;
  }
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  wrap.innerHTML = `
    <div class="cart-list">
      ${cart.map((item, idx) => `
        <div class="cart-item">
          <div class="cart-thumb">${item.emoji}</div>
          <div class="cart-info">
            <div class="cart-name">${item.name}</div>
            <div class="cart-unit-price">NT$${item.price.toLocaleString()} / 件</div>
            <div class="cart-subtotal">NT$${(item.price * item.qty).toLocaleString()}</div>
          </div>
          <div class="cart-qty">
            <button onclick="updateCartQty(${idx}, -1)">−</button>
            <span>${item.qty}</span>
            <button onclick="updateCartQty(${idx}, 1)">+</button>
          </div>
          <button class="remove-btn" onclick="removeCartItem(${idx})">✕</button>
        </div>
      `).join('')}
    </div>
    <div class="cart-summary">
      <div class="summary-row"><span>商品小計</span><span>NT$${subtotal.toLocaleString()}</span></div>
      <div class="summary-row"><span>運費</span><span>免運</span></div>
      <div class="summary-total">
        <span class="summary-total-label">合計</span>
        <span class="summary-total-price">NT$${subtotal.toLocaleString()}</span>
      </div>
      <button class="checkout-btn" onclick="checkout()">前往結帳</button>
    </div>
  `;
}

function updateCartQty(idx, delta) {
  const cart = getCart();
  cart[idx].qty = Math.max(1, cart[idx].qty + delta);
  saveCart(cart);
  renderCart();
}

function removeCartItem(idx) {
  const cart = getCart();
  cart.splice(idx, 1);
  saveCart(cart);
  renderCart();
}

async function checkout() {
  const user = getUser();
  if (!user) { showToast('請先登入再結帳'); setTimeout(() => location.href = 'profile.html', 1500); return; }
  const cart = getCart();
  if (!cart.length) return;
  try {
    const res = await fetch(`${CONFIG.API_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
      body: JSON.stringify({ items: cart })
    });
    if (res.ok) {
      saveCart([]);
      showToast('訂單建立成功！');
      setTimeout(() => location.href = 'orders.html', 1500);
    } else { showToast('結帳失敗，請重試'); }
  } catch (e) { showToast('網路錯誤'); }
}

// ===== 個人資料頁 =====
function renderProfile() {
  const wrap = document.getElementById('profile-wrap');
  if (!wrap) return;
  const user = getUser();
  if (!user) {
    wrap.innerHTML = `
      <div style="text-align:center; padding: 40px 20px;">
        <div style="font-size:56px; margin-bottom:16px;">👤</div>
        <p style="color:#888; margin-bottom:20px;">登入後查看訂單、管理個人資料</p>
        <button class="line-btn" onclick="lineLogin()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/></svg>
          使用 LINE 帳號登入
        </button>
      </div>`;
    return;
  }
  const initial = user.display_name ? user.display_name[0] : '?';
  wrap.innerHTML = `
    <div class="profile-header">
      <div class="avatar">${user.picture ? `<img src="${user.picture}" style="width:60px;height:60px;border-radius:50%;object-fit:cover;">` : initial}</div>
      <div>
        <div class="profile-name">${user.display_name}</div>
        <div class="profile-sub">LINE 會員</div>
      </div>
    </div>
    <div class="menu-section">
      <a href="orders.html" class="menu-item">
        <span class="menu-icon">📦</span><span class="menu-label">我的訂單</span><span class="menu-arrow">›</span>
      </a>
      <a href="address.html" class="menu-item">
        <span class="menu-icon">📍</span><span class="menu-label">收件地址</span><span class="menu-arrow">›</span>
      </a>
    </div>
    <button class="logout-btn" onclick="logout()">登出</button>
  `;
}

function lineLogin() {
  const state = Math.random().toString(36).substring(2);
  localStorage.setItem('line_state', state);
  const url = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${CONFIG.LINE_CHANNEL_ID}&redirect_uri=${encodeURIComponent(CONFIG.LINE_CALLBACK_URL)}&state=${state}&scope=profile%20openid`;
  location.href = url;
}

function logout() {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
  renderProfile();
  showToast('已登出');
}

// ===== 初始化 =====
document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();
  if (typeof loadProducts === 'function' && document.getElementById('product-grid')) loadProducts();
  if (typeof loadNotices === 'function' && document.getElementById('notice-list')) loadNotices();
  if (document.getElementById('cart-wrap')) renderCart();
  if (document.getElementById('profile-wrap')) renderProfile();
});
