// ===== MOBILE MENU =====
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    mobileMenu.classList.toggle('active');
    document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
  });
}
function closeMobile() {
  if (hamburger) hamburger.classList.remove('active');
  if (mobileMenu) mobileMenu.classList.remove('active');
  document.body.style.overflow = '';
}

// ===== NAV HIDE ON SCROLL (disabled on shop page) =====
let lastY = 0;
const isShopPage = window.location.pathname.includes('shop');
window.addEventListener('scroll', () => {
  if (isShopPage) return;
  const y = window.scrollY;
  const nav = document.getElementById('mainNav');
  if (nav) nav.classList.toggle('hidden', y > lastY && y > 100);
  lastY = y;
}, { passive: true });

// ===== SCROLL ANIMATIONS =====
const obs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') });
}, { threshold: .1, rootMargin: '0px 0px -50px 0px' });
document.querySelectorAll('.fade-up').forEach(el => obs.observe(el));

// ===== EMAIL =====
function handleEmail(e) {
  e.preventDefault();
  const input = e.target.querySelector('input[type="email"]');
  console.log('Email captured:', input.value);
  e.target.style.display = 'none';
  const success = document.getElementById('emailSuccess');
  if (success) success.classList.add('show');
}

// ===== CART & PAYMENT ROUTING =====
const PAYPAL_BUSINESS = 'SG2LRK7JZVVUS';

const COUNTRY_OPTIONS = [
  { code: '', name: 'Select delivery country' },
  { code: 'CA', name: 'Canada' },
  { code: 'FR', name: 'France' },
  { code: 'DE', name: 'Germany' },
  { code: 'GH', name: 'Ghana' },
  { code: 'IT', name: 'Italy' },
  { code: 'KE', name: 'Kenya' },
  { code: 'MA', name: 'Morocco' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'OTHER', name: 'Other country' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'ES', name: 'Spain' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'US', name: 'United States' }
];

const LOCAL_CHECKOUT_COUNTRIES = ['NG'];
const LOCAL_DELIVERY_CITIES = ['LAGOS', 'ABUJA'];
const INTERNATIONAL_SHIPPING_USD_BY_COUNTRY = {
  CA: 175,
  FR: 155,
  DE: 155,
  GH: 115,
  IT: 155,
  KE: 130,
  MA: 135,
  NL: 155,
  OTHER: 175,
  ZA: 125,
  ES: 155,
  AE: 145,
  GB: 155,
  US: 175
};
const LOCAL_DELIVERY_NGN = 10000;
const DISPLAY_USD_TO_NGN = 1600;
const DISPLAY_CURRENCY_BY_COUNTRY = {
  US: { currency: 'USD', locale: 'en-US', usdRate: 1 },
  GB: { currency: 'GBP', locale: 'en-GB', usdRate: 0.79 },
  CA: { currency: 'CAD', locale: 'en-CA', usdRate: 1.37 },
  GH: { currency: 'GHS', locale: 'en-GH', usdRate: 10.3 },
  ZA: { currency: 'ZAR', locale: 'en-ZA', usdRate: 17.8 },
  KE: { currency: 'KES', locale: 'en-KE', usdRate: 129 },
  MA: { currency: 'MAD', locale: 'fr-MA', usdRate: 9.0 },
  FR: { currency: 'EUR', locale: 'fr-FR', usdRate: 0.92 },
  DE: { currency: 'EUR', locale: 'de-DE', usdRate: 0.92 },
  NL: { currency: 'EUR', locale: 'nl-NL', usdRate: 0.92 },
  ES: { currency: 'EUR', locale: 'es-ES', usdRate: 0.92 },
  IT: { currency: 'EUR', locale: 'it-IT', usdRate: 0.92 },
  AE: { currency: 'AED', locale: 'en-AE', usdRate: 3.67 },
  OTHER: { currency: 'USD', locale: 'en-US', usdRate: 1 }
};
const CART_STORAGE_KEY = 'yourAfricanArtCart';
let cartItems = loadCart();

function loadCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_STORAGE_KEY)) || [];
  } catch (err) {
    return [];
  }
}

function saveCart() {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
}

function getCartSubtotalUsd() {
  return cartItems.reduce((sum, item) => sum + item.price, 0);
}

function getCartCount() {
  return cartItems.length;
}

function ensureCartModal() {
  let modal = document.getElementById('cartModal');
  if (modal) return modal;

  modal = document.createElement('div');
  modal.id = 'cartModal';
  modal.className = 'cart-modal';
  modal.innerHTML = `
    <div class="cart-modal-panel" role="dialog" aria-modal="true" aria-labelledby="cartModalTitle">
      <button class="cart-modal-close" type="button" aria-label="Close cart">&times;</button>
      <span class="section-tag">Secure Checkout</span>
      <h2 id="cartModalTitle">Your Cart</h2>
      <div class="cart-items" id="cartItems"></div>
      <div class="cart-empty" id="cartEmpty">Your cart is empty.</div>
      <div class="cart-checkout" id="cartCheckout">
        <label class="payment-field" for="paymentCountry">
          <span>Delivery country</span>
          <select id="paymentCountry"></select>
        </label>
        <label class="payment-field payment-city-field" for="paymentCity">
          <span>Delivery city</span>
          <select id="paymentCity">
            <option value="">Select delivery city</option>
            <option value="LAGOS">Lagos</option>
            <option value="ABUJA">Abuja</option>
            <option value="OTHER">Other city</option>
          </select>
        </label>
        <div class="payment-totals" id="paymentTotals" aria-live="polite"></div>
        <p class="payment-estimate-note" id="paymentEstimateNote"></p>
        <p class="payment-route-note" id="paymentRouteNote">Choose your delivery country to continue.</p>
        <button class="payment-continue-btn" id="paymentContinueBtn" type="button" disabled>Checkout with PayPal</button>
        <p class="payment-config-note" id="paymentConfigNote"></p>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  const select = modal.querySelector('#paymentCountry');
  select.innerHTML = COUNTRY_OPTIONS.map(country => (
    `<option value="${country.code}">${country.name}</option>`
  )).join('');

  modal.querySelector('.cart-modal-close').addEventListener('click', closeCart);
  modal.addEventListener('click', e => {
    if (e.target === modal) closeCart();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal.classList.contains('active')) closeCart();
  });
  select.addEventListener('change', updatePaymentRoute);
  modal.querySelector('#paymentCity').addEventListener('change', updatePaymentRoute);
  modal.querySelector('#paymentContinueBtn').addEventListener('click', continueToPayPal);

  return modal;
}

function getPaymentRoute(countryCode) {
  return LOCAL_CHECKOUT_COUNTRIES.includes(countryCode) ? 'local' : 'paypal';
}

function formatUsd(amount) {
  return '$' + amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function formatNgn(amount) {
  return 'NGN ' + amount.toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function formatCurrency(amount, currency, locale) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    currencyDisplay: 'code',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

function getCheckoutTotals(route, countryCode) {
  if (!cartItems.length) return null;
  const subtotalUsd = getCartSubtotalUsd();
  if (route === 'local') {
    const artwork = Math.round(subtotalUsd * DISPLAY_USD_TO_NGN);
    const delivery = LOCAL_DELIVERY_NGN;
    return {
      currency: 'NGN',
      artwork,
      delivery,
      total: artwork + delivery
    };
  }
  const profile = DISPLAY_CURRENCY_BY_COUNTRY[countryCode] || DISPLAY_CURRENCY_BY_COUNTRY.OTHER;
  const shippingUsd = getInternationalShippingUsd(countryCode);
  const artwork = Math.round(subtotalUsd * profile.usdRate);
  const delivery = Math.round(shippingUsd * profile.usdRate);
  return {
    currency: profile.currency,
    locale: profile.locale,
    artwork,
    delivery,
    total: artwork + delivery,
    paypalCurrency: 'USD',
    paypalArtwork: subtotalUsd,
    paypalDelivery: shippingUsd,
    paypalTotal: subtotalUsd + shippingUsd
  };
}

function getInternationalShippingUsd(countryCode) {
  return INTERNATIONAL_SHIPPING_USD_BY_COUNTRY[countryCode] || INTERNATIONAL_SHIPPING_USD_BY_COUNTRY.OTHER;
}

function renderPaymentTotals(route, countryCode) {
  const modal = ensureCartModal();
  const totals = getCheckoutTotals(route, countryCode);
  const totalsEl = modal.querySelector('#paymentTotals');
  const estimateNote = modal.querySelector('#paymentEstimateNote');
  if (!totals) {
    totalsEl.innerHTML = '';
    estimateNote.textContent = '';
    return;
  }

  const formatter = totals.currency === 'NGN'
    ? formatNgn
    : amount => formatCurrency(amount, totals.currency, totals.locale);
  totalsEl.innerHTML = `
    <div><span>Artwork</span><strong>${formatter(totals.artwork)}</strong></div>
    <div><span>Delivery</span><strong>${formatter(totals.delivery)}</strong></div>
    <div class="payment-total-row"><span>Total</span><strong>${formatter(totals.total)}</strong></div>
  `;
  estimateNote.textContent = route === 'local'
    ? 'Local checkout total shown in NGN.'
    : 'Estimated local currency total. PayPal checkout is charged in USD and will show the final conversion before you pay.';
}

function updatePaymentRoute() {
  const modal = ensureCartModal();
  const countryCode = modal.querySelector('#paymentCountry').value;
  const cityField = modal.querySelector('.payment-city-field');
  const citySelect = modal.querySelector('#paymentCity');
  const cityCode = citySelect.value;
  const note = modal.querySelector('#paymentRouteNote');
  const configNote = modal.querySelector('#paymentConfigNote');
  const continueBtn = modal.querySelector('#paymentContinueBtn');

  configNote.textContent = '';
  continueBtn.disabled = !countryCode;
  cityField.classList.toggle('show', countryCode === 'NG');

  if (!countryCode) {
    note.textContent = 'Choose your delivery country to continue.';
    modal.querySelector('#paymentTotals').innerHTML = '';
    modal.querySelector('#paymentEstimateNote').textContent = '';
    return;
  }

  const route = getPaymentRoute(countryCode);
  renderPaymentTotals(route, countryCode);

  if (route === 'local') {
    if (!cityCode) {
      continueBtn.disabled = true;
      continueBtn.textContent = 'Paystack checkout';
      note.textContent = 'Choose your delivery city to see the local checkout total.';
      return;
    }
    if (!LOCAL_DELIVERY_CITIES.includes(cityCode)) {
      continueBtn.disabled = true;
      continueBtn.textContent = 'Request delivery quote';
      note.textContent = 'For this delivery city, please contact us for a delivery quote before payment.';
      configNote.textContent = 'Email hello@yourafricanart.com or use WhatsApp to confirm availability and delivery cost.';
      return;
    }
    continueBtn.disabled = true;
    continueBtn.textContent = 'Paystack checkout coming soon';
    note.textContent = 'A secure local checkout option is available. Delivery is included for this city.';
    configNote.textContent = 'Paystack checkout will be enabled next for local orders.';
  } else {
    citySelect.value = '';
    continueBtn.textContent = 'Checkout with PayPal';
    note.textContent = 'You will continue through PayPal secure checkout. International DHL/FedEx delivery is included in the total shown.';
    if (!PAYPAL_BUSINESS) {
      continueBtn.disabled = true;
      configNote.textContent = 'PayPal merchant ID is needed before live checkout can be enabled.';
    }
  }
}

function closeCart() {
  const modal = document.getElementById('cartModal');
  if (!modal) return;
  modal.classList.remove('active');
  document.body.style.overflow = '';
}

function continueToPayPal() {
  if (!cartItems.length || !PAYPAL_BUSINESS) return;
  const modal = ensureCartModal();
  const countryCode = modal.querySelector('#paymentCountry').value;
  if (!countryCode) return;

  const route = getPaymentRoute(countryCode);
  if (route !== 'paypal') return;

  submitPayPalCart(countryCode);
}

function handleBuy(id, title, price) {
  addToCart({ id, title, price });
}

function addToCart(item) {
  if (!cartItems.some(cartItem => cartItem.id === item.id)) {
    cartItems.push({ id: item.id, title: item.title, price: Number(item.price) });
    saveCart();
  }
  openCart();
}

function removeFromCart(id) {
  cartItems = cartItems.filter(item => item.id !== id);
  saveCart();
  renderCart();
}

function ensureCartButton() {
  if (document.getElementById('floatingCartButton')) return;
  const button = document.createElement('button');
  button.id = 'floatingCartButton';
  button.className = 'floating-cart-button';
  button.type = 'button';
  button.innerHTML = `Cart <span id="floatingCartCount">0</span>`;
  button.addEventListener('click', openCart);
  document.body.appendChild(button);
}

function renderCart() {
  const modal = ensureCartModal();
  const itemsEl = modal.querySelector('#cartItems');
  const emptyEl = modal.querySelector('#cartEmpty');
  const checkoutEl = modal.querySelector('#cartCheckout');
  const countEl = document.getElementById('floatingCartCount');
  const count = getCartCount();

  if (countEl) countEl.textContent = String(count);
  emptyEl.style.display = count ? 'none' : 'block';
  checkoutEl.style.display = count ? 'block' : 'none';

  itemsEl.innerHTML = cartItems.map(item => `
    <div class="cart-item">
      <div>
        <strong>${item.title}</strong>
        <span>Original artwork</span>
      </div>
      <div class="cart-item-actions">
        <b>${formatUsd(item.price)}</b>
        <button type="button" onclick="removeFromCart('${item.id}')" aria-label="Remove ${item.title}">Remove</button>
      </div>
    </div>
  `).join('');

  updatePaymentRoute();
}

function openCart() {
  const modal = ensureCartModal();
  renderCart();
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function submitPayPalCart(countryCode) {
  const form = document.createElement('form');
  form.method = 'post';
  form.action = 'https://www.paypal.com/cgi-bin/webscr';
  form.target = '_self';

  const fields = {
    cmd: '_cart',
    upload: '1',
    business: PAYPAL_BUSINESS,
    currency_code: 'USD',
    no_note: '0',
    no_shipping: '2',
    return: window.location.origin + window.location.pathname,
    cancel_return: window.location.href
  };

  Object.keys(fields).forEach(name => addHiddenField(form, name, fields[name]));

  cartItems.forEach((item, index) => {
    const n = index + 1;
    addHiddenField(form, 'item_name_' + n, item.title);
    addHiddenField(form, 'item_number_' + n, item.id);
    addHiddenField(form, 'amount_' + n, item.price.toFixed(2));
    addHiddenField(form, 'quantity_' + n, '1');
  });

  const shippingIndex = cartItems.length + 1;
  addHiddenField(form, 'item_name_' + shippingIndex, 'International delivery');
  addHiddenField(form, 'item_number_' + shippingIndex, 'shipping-international');
  addHiddenField(form, 'amount_' + shippingIndex, getInternationalShippingUsd(countryCode).toFixed(2));
  addHiddenField(form, 'quantity_' + shippingIndex, '1');

  document.body.appendChild(form);
  form.submit();
}

function addHiddenField(form, name, value) {
  const input = document.createElement('input');
  input.type = 'hidden';
  input.name = name;
  input.value = value;
  form.appendChild(input);
}

ensureCartButton();
renderCart();
