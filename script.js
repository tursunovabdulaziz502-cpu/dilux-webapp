// ── Telegram WebApp ──
const tg = window.Telegram?.WebApp;
if (tg) { tg.ready(); tg.expand(); }

// ── MAHSULOTLAR ──
const products = [
  { id:1,  name:"Shokoladli tort",    desc:"Belgiya shokoladi, 1 kg",           price:180000, img:"https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&q=80", cat:"tort",      badge:"BESTSELLER" },
  { id:2,  name:"Medovik tort",       desc:"Asal bilan, 1.2 kg",                price:155000, img:"https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=600&q=80", cat:"tort",      badge:"KLASSIK"    },
  { id:3,  name:"Kekslar to'plami",   desc:"Krem va mevalar bilan, 6 dona",     price:75000,  img:"https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=600&q=80", cat:"keks",      badge:null         },
  { id:4,  name:"Tiramisu",           desc:"Italyan klassikasi, porsiya",        price:45000,  img:"https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&q=80", cat:"keks",      badge:"YANGI"      },
  { id:5,  name:"Makaronlar",         desc:"Frantsuz makaronlari, 12 dona",     price:110000, img:"https://images.unsplash.com/photo-1558326567-98ae2405596b?w=600&q=80", cat:"keks",      badge:null         },
  { id:6,  name:"Eklyer",            desc:"Shokolad krem bilan, 6 dona",        price:65000,  img:"https://images.unsplash.com/photo-1612203985729-70726954388c?w=600&q=80", cat:"keks",      badge:null         },
  { id:7,  name:"Artizan non",        desc:"Tabiiy xamirturushda, 2 dona",      price:35000,  img:"https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80", cat:"non",       badge:null         },
  { id:8,  name:"Briosh",            desc:"Sariyog'li frantsuz noni",            price:28000,  img:"https://images.unsplash.com/photo-1620921592173-4c7a24a19f0b?w=600&q=80", cat:"non",       badge:null         },
  { id:9,  name:"Keytering set",      desc:"10 kishilik kanape platter",         price:450000, img:"https://images.unsplash.com/photo-1555244162-803834f70033?w=600&q=80", cat:"keytering", badge:"VIP"         },
];

let cart = {};
let delivery = true;
let currentFilter = 'all';

// ── FORMAT PRICE ──
function fmt(n) {
  return n.toLocaleString('ru-RU') + " so'm";
}

// ── EMOJI FALLBACK ──
const fallbackEmoji = { tort:'🎂', keks:'🧁', non:'🍞', keytering:'🍱' };

// ── MENU RENDER ──
function renderMenu(catFilter) {
  currentFilter = catFilter;
  const grid = document.getElementById('menuGrid');
  const list = catFilter === 'all' ? products : products.filter(p => p.cat === catFilter);

  grid.innerHTML = list.map(p => `
    <div class="card">
      <div class="card-img-wrap">
        <img
          class="card-img"
          src="${p.img}"
          alt="${p.name}"
          loading="lazy"
          onerror="this.classList.add('img-hidden');this.parentElement.querySelector('.card-img-fallback').classList.add('img-show')"
        />
        <div class="card-img-fallback">
          ${fallbackEmoji[p.cat] || '🍰'}
        </div>
        <div class="card-img-overlay"></div>
        ${p.badge ? `<div class="card-badge">${p.badge}</div>` : ''}
      </div>
      <div class="card-body">
        <div class="card-title">${p.name}</div>
        <div class="card-desc">${p.desc}</div>
        <div class="card-footer">
          <span class="price">${fmt(p.price)}</span>
          <div id="ctrl-${p.id}">${ctrlHtml(p.id)}</div>
        </div>
      </div>
    </div>
  `).join('');
}

function ctrlHtml(id) {
  const qty = cart[id] || 0;
  if (!qty) {
    return `<button class="add-btn" onclick="addItem(${id})">+ Qo'shish</button>`;
  }
  return `<div class="qty-ctrl">
    <button class="qty-btn" onclick="changeQty(${id},-1)">−</button>
    <span class="qty-num">${qty}</span>
    <button class="qty-btn" onclick="changeQty(${id},1)">+</button>
  </div>`;
}

function addItem(id) {
  cart[id] = (cart[id] || 0) + 1;
  refresh(id);
  updateBar();
  bumpBadge();
}

function changeQty(id, delta) {
  cart[id] = (cart[id] || 0) + delta;
  if (cart[id] <= 0) delete cart[id];
  refresh(id);
  updateBar();
}

function refresh(id) {
  const el = document.getElementById('ctrl-' + id);
  if (el) el.innerHTML = ctrlHtml(id);
}

function bumpBadge() {
  const badge = document.getElementById('cartBadge');
  badge.classList.remove('bump');
  void badge.offsetWidth;
  badge.classList.add('bump');
  setTimeout(() => badge.classList.remove('bump'), 300);
}

function updateBar() {
  const count = cartCount();
  const total = cartTotal();
  document.getElementById('floatCount').textContent = `🛒 ${count} mahsulot`;
  document.getElementById('floatTotal').textContent = fmt(total);
  document.getElementById('cartBadge').textContent = count;
  document.getElementById('floatBar').classList.toggle('hidden', count === 0);
}

function cartCount() {
  return Object.values(cart).reduce((a, b) => a + b, 0);
}

function cartTotal() {
  return Object.entries(cart).reduce((sum, [id, qty]) => {
    const p = products.find(x => x.id == id);
    return sum + (p ? p.price * qty : 0);
  }, 0);
}

// ── FILTER ──
function filter(btn, cat) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  renderMenu(cat);
}

// ── NAVBAR SCROLL ──
window.addEventListener('scroll', () => {
  document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

// ── CART MODAL ──
function openCart() {
  if (!cartCount()) return;
  renderCartItems();
  document.getElementById('cartOverlay').classList.add('open');
}

function renderCartItems() {
  const el = document.getElementById('cartItems');
  el.innerHTML = Object.entries(cart).map(([id, qty]) => {
    const p = products.find(x => x.id == id);
    return `<div class="cart-item">
      <img
        class="cart-item-thumb"
        src="${p.img}"
        alt="${p.name}"
        onerror="this.classList.add('img-hidden')"
      />
      <div class="cart-item-info">
        <div class="cart-item-name">${p.name}</div>
        <div class="cart-item-price">${fmt(p.price)} × ${qty} = ${fmt(p.price * qty)}</div>
      </div>
      <div class="qty-ctrl">
        <button class="qty-btn" onclick="changeQtyCart(${id},-1)">−</button>
        <span class="qty-num">${qty}</span>
        <button class="qty-btn" onclick="changeQtyCart(${id},1)">+</button>
      </div>
    </div>`;
  }).join('');
  document.getElementById('cartTotalDisplay').textContent = fmt(cartTotal());
}

function changeQtyCart(id, delta) {
  cart[id] = (cart[id] || 0) + delta;
  if (cart[id] <= 0) delete cart[id];
  refresh(id);
  updateBar();
  if (!cartCount()) { closeCart(); return; }
  renderCartItems();
}

function closeCart() {
  document.getElementById('cartOverlay').classList.remove('open');
}

// ── CHECKOUT ──
function openCheckout() {
  closeCart();
  document.getElementById('checkoutTotal').textContent = fmt(cartTotal());
  document.getElementById('checkoutOverlay').classList.add('open');
}

function closeCheckout() {
  document.getElementById('checkoutOverlay').classList.remove('open');
}

function setDelivery(val, btn) {
  delivery = val;
  document.querySelectorAll('.checkout-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('addressField').classList.toggle('hidden-field', !val);
}

// ── ORDER → BOT ──
function placeOrder() {
  const name    = document.getElementById('nameInput').value.trim();
  const phone   = document.getElementById('phoneInput').value.trim();
  const address = document.getElementById('addressInput').value.trim();
  const note    = document.getElementById('noteInput').value.trim();

  if (!name)              { shakeField('nameInput');    return; }
  if (!phone)             { shakeField('phoneInput');   return; }
  if (delivery && !address) { shakeField('addressInput'); return; }

  const items = Object.entries(cart).map(([id, qty]) => {
    const p = products.find(x => x.id == id);
    return `• ${p.name} × ${qty} — ${fmt(p.price * qty)}`;
  }).join('\n');

  const orderText = [
    `📦 YANGI ZAKAZ`,
    ``,
    `👤 Ism: ${name}`,
    `📱 Tel: ${phone}`,
    `🚚 Usul: ${delivery ? 'Yetkazib berish' : "O'zi olib ketish"}`,
    address ? `📍 Manzil: ${address}` : '',
    note    ? `💬 Izoh: ${note}` : '',
    ``,
    `🛒 Mahsulotlar:`,
    items,
    ``,
    `💰 Jami: ${fmt(cartTotal())}`,
  ].filter(Boolean).join('\n');

  if (tg) {
    tg.sendData(orderText);
  } else {
    console.log("ZAKAZ:\n" + orderText);
  }

  // Reset
  cart = {};
  updateBar();
  renderMenu(currentFilter);

  ['nameInput','phoneInput','addressInput','noteInput'].forEach(id => {
    document.getElementById(id).value = '';
  });

  closeCheckout();
  document.getElementById('successOverlay').classList.add('open');

  setTimeout(() => { if (tg) tg.close(); }, 3000);
}

function shakeField(inputId) {
  const el = document.getElementById(inputId);
  el.classList.add('field-error');
  el.focus();
  setTimeout(() => el.classList.remove('field-error'), 2000);
}


function closeSuccess() {
  document.getElementById('successOverlay').classList.remove('open');
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── BACKDROP CLICK ──
['cartOverlay', 'checkoutOverlay', 'successOverlay'].forEach(id => {
  document.getElementById(id).addEventListener('click', function(e) {
    if (e.target === this) this.classList.remove('open');
  });
});

// ── INIT ──
renderMenu('all');
