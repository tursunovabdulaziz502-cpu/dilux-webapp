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
  const mapRow = document.getElementById('mapRow');
  if (mapRow) mapRow.classList.toggle('hidden-field', !val);
}

// ── XARiTA ──
let map = null;
let marker = null;
let selectedLatLng = null;

function openMap() {
  document.getElementById('mapOverlay').classList.add('open');

  setTimeout(() => {
    if (!map) {
      // Namangan markazi
      map = L.map('map').setView([41.0011, 71.6722], 14);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 19,
      }).addTo(map);

      // Custom pin icon
      const pinIcon = L.divIcon({
        className: '',
        html: `<div class="map-pin">
          <svg width="32" height="42" viewBox="0 0 32 42" fill="none">
            <path d="M16 0C7.16 0 0 7.16 0 16c0 11 16 26 16 26S32 27 32 16C32 7.16 24.84 0 16 0z" fill="#c8a96e"/>
            <circle cx="16" cy="16" r="7" fill="white"/>
          </svg>
        </div>`,
        iconSize: [32, 42],
        iconAnchor: [16, 42],
      });

      map.on('click', (e) => setPin(e.latlng, pinIcon));

      // Agar avval tanlangan bo'lsa
      if (selectedLatLng) {
        setPin(selectedLatLng, pinIcon);
        map.setView(selectedLatLng, 16);
      }
    }
    map.invalidateSize();
  }, 100);
}

function setPin(latlng, icon) {
  if (!icon) {
    icon = L.divIcon({
      className: '',
      html: `<div class="map-pin"><svg width="32" height="42" viewBox="0 0 32 42" fill="none"><path d="M16 0C7.16 0 0 7.16 0 16c0 11 16 26 16 26S32 27 32 16C32 7.16 24.84 0 16 0z" fill="#c8a96e"/><circle cx="16" cy="16" r="7" fill="white"/></svg></div>`,
      iconSize: [32, 42],
      iconAnchor: [16, 42],
    });
  }
  if (marker) marker.remove();
  marker = L.marker(latlng, { icon, draggable: true }).addTo(map);
  selectedLatLng = latlng;
  updateMapAddress(latlng);

  marker.on('dragend', (e) => {
    selectedLatLng = e.target.getLatLng();
    updateMapAddress(selectedLatLng);
  });
}

function updateMapAddress(latlng) {
  const lat = latlng.lat.toFixed(5);
  const lng = latlng.lng.toFixed(5);
  document.getElementById('mapAddress').textContent = `📍 ${lat}, ${lng} — aniqlanmoqda...`;

  // Reverse geocoding (OpenStreetMap Nominatim)
  fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latlng.lat}&lon=${latlng.lng}&format=json&accept-language=uz`)
    .then(r => r.json())
    .then(data => {
      const addr = data.display_name || `${lat}, ${lng}`;
      document.getElementById('mapAddress').textContent = addr;
      selectedLatLng._address = addr;
    })
    .catch(() => {
      document.getElementById('mapAddress').textContent = `${lat}, ${lng}`;
    });
}

function locateMe() {
  if (!navigator.geolocation) {
    alert("Geolokatsiya qo'llab-quvvatlanmaydi");
    return;
  }
  const btn = document.querySelector('.map-locate-btn');
  btn.textContent = 'Aniqlanmoqda...';
  btn.disabled = true;

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const latlng = L.latLng(pos.coords.latitude, pos.coords.longitude);
      map.setView(latlng, 17);
      setPin(latlng);
      btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg> Joylashuvimni aniqlash`;
      btn.disabled = false;
    },
    () => {
      alert("Joylashuvni aniqlab bo'lmadi. Xaritadan tanlang.");
      btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg> Joylashuvimni aniqlash`;
      btn.disabled = false;
    }
  );
}

function confirmLocation() {
  if (!selectedLatLng) {
    document.getElementById('mapAddress').style.color = '#e74c3c';
    document.getElementById('mapAddress').textContent = '⚠️ Iltimos, xaritadan joy tanlang!';
    return;
  }
  closeMap();
  // Checkout da manzilni ko'rsatish
  const addr = selectedLatLng._address ||
    `${selectedLatLng.lat.toFixed(5)}, ${selectedLatLng.lng.toFixed(5)}`;
  document.getElementById('mapAddressDisplay').textContent = addr;
  document.getElementById('mapAddressRow').classList.remove('hidden-field');
}

function closeMap() {
  document.getElementById('mapOverlay').classList.remove('open');
}

// ── ORDER → BOT ──
function placeOrder() {
  const name  = document.getElementById('nameInput').value.trim();
  const phone = document.getElementById('phoneInput').value.trim();
  const note  = document.getElementById('noteInput').value.trim();

  if (!name)  { shakeField('nameInput');  return; }
  if (!phone) { shakeField('phoneInput'); return; }

  if (delivery && !selectedLatLng) {
    document.getElementById('mapAddressRow').classList.remove('hidden-field');
    document.getElementById('mapAddressDisplay').textContent = '⚠️ Xaritadan manzil tanlang!';
    document.getElementById('mapAddressDisplay').style.color = '#e74c3c';
    openMap();
    return;
  }

  const items = Object.entries(cart).map(([id, qty]) => {
    const p = products.find(x => x.id == id);
    return `• ${p.name} × ${qty} — ${fmt(p.price * qty)}`;
  }).join('\n');

  let locationLine = '';
  if (delivery && selectedLatLng) {
    const addr = selectedLatLng._address ||
      `${selectedLatLng.lat.toFixed(5)}, ${selectedLatLng.lng.toFixed(5)}`;
    locationLine = `📍 Manzil: ${addr}\n🗺 Koordinat: ${selectedLatLng.lat.toFixed(6)},${selectedLatLng.lng.toFixed(6)}`;
  }

  const orderText = [
    `📦 YANGI ZAKAZ`,
    ``,
    `👤 Ism: ${name}`,
    `📱 Tel: ${phone}`,
    `🚚 Usul: ${delivery ? 'Yetkazib berish' : "O'zi olib ketish"}`,
    locationLine || '',
    note ? `💬 Izoh: ${note}` : '',
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
  selectedLatLng = null;
  updateBar();
  renderMenu(currentFilter);

  ['nameInput','phoneInput','noteInput'].forEach(id => {
    document.getElementById(id).value = '';
  });
  const mapRow = document.getElementById('mapAddressRow');
  if (mapRow) mapRow.classList.add('hidden-field');

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
['cartOverlay', 'checkoutOverlay', 'successOverlay', 'mapOverlay'].forEach(id => {
  document.getElementById(id).addEventListener('click', function(e) {
    if (e.target === this) this.classList.remove('open');
  });
});

// ── INIT ──
renderMenu('all');
