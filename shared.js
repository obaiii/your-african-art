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
const PAYSTACK_PUBLIC_KEY = 'pk_test_dc620a3776b7ebcc93da3a4693d9c87ebe77f8fa';
const PAYSTACK_IS_LIVE = PAYSTACK_PUBLIC_KEY.startsWith('pk_live_');
const PAYSTACK_ALLOW_TEST_CHECKOUT = !PAYSTACK_IS_LIVE && ['localhost', '127.0.0.1', ''].includes(window.location.hostname);
const PAYSTACK_SCRIPT_SRC = 'https://js.paystack.co/v2/inline.js';

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
const DHL_RATE_PROFILES = {
  CA: { baseUsd: 155, perHalfKgUsd: 32 },
  FR: { baseUsd: 135, perHalfKgUsd: 28 },
  DE: { baseUsd: 135, perHalfKgUsd: 28 },
  GH: { baseUsd: 95, perHalfKgUsd: 18 },
  IT: { baseUsd: 135, perHalfKgUsd: 28 },
  KE: { baseUsd: 110, perHalfKgUsd: 22 },
  MA: { baseUsd: 115, perHalfKgUsd: 24 },
  NL: { baseUsd: 135, perHalfKgUsd: 28 },
  OTHER: { baseUsd: 155, perHalfKgUsd: 32 },
  ZA: { baseUsd: 105, perHalfKgUsd: 20 },
  ES: { baseUsd: 135, perHalfKgUsd: 28 },
  AE: { baseUsd: 125, perHalfKgUsd: 25 },
  GB: { baseUsd: 135, perHalfKgUsd: 28 },
  US: { baseUsd: 155, perHalfKgUsd: 32 }
};
const LOCAL_DELIVERY_NGN = 10000;
const DISPLAY_USD_TO_NGN = 1600;
const AUTH_CERTIFICATE_USD_PER_PAINTING = 20;
const AUTH_CERTIFICATE_NGN_PER_PAINTING = 15000;
const DHL_TUBE_DIAMETER_IN = 2;
const DHL_TUBE_LENGTH_MARGIN_IN = 2;
const DHL_TUBE_HANDLING_BUFFER_USD = 20;
const CM_PER_INCH = 2.54;
const KG_PER_LB = 0.453592;
const DHL_VOLUMETRIC_DIVISOR_CM = 5000;
const ARTWORK_SHIPPING_PROFILES = {
  'atarci': { widthIn: 22.5, heightIn: 16, weightLb: 1.1 },
  'zinat': { widthIn: 14, heightIn: 25, weightLb: 1.0 },
  'hamid-kadiri': { widthIn: 11.8, heightIn: 15.8, weightLb: 0.8 },
  'hamid-kadiri-2': { widthIn: 10.5, heightIn: 8, weightLb: 0.6 },
  'hassan-wakif': { widthIn: 25.5, heightIn: 9.5, weightLb: 0.7 },
  'hassan-wakif-2': { widthIn: 25.5, heightIn: 9.5, weightLb: 0.7 },
  'g-joe': { widthIn: 17, heightIn: 19, weightLb: 1.2 },
  'g-joe-2': { widthIn: 17, heightIn: 19, weightLb: 1.2 },
  'g-joe-3': { widthIn: 19.5, heightIn: 17.5, weightLb: 1.2 },
  'nigerian-artist': { widthIn: 16, heightIn: 12, weightLb: 0.5 },
  'nigerian-artist-2': { widthIn: 16, heightIn: 12, weightLb: 0.5 },
  'east-africa-1': { widthIn: 29, heightIn: 18, weightLb: 1.3 },
  'east-africa-2': { widthIn: 26, heightIn: 19, weightLb: 1.3 },
  'east-africa-3': { widthIn: 27, heightIn: 17, weightLb: 1.2 },
  'east-africa-4': { widthIn: 37, heightIn: 25, weightLb: 1.7 },
  'kibuuka': { widthIn: 15.25, heightIn: 29, weightLb: 1.1 },
  'kibuuka-steven': { widthIn: 21, heightIn: 47, weightLb: 1.5 },
  'mutsiwa': { widthIn: 19.5, heightIn: 27, weightLb: 1.4 },
  'malawi-1': { widthIn: 13, heightIn: 34, weightLb: 1.0 },
  'malawi-2': { widthIn: 23, heightIn: 31, weightLb: 1.6 },
  'malawi-3': { widthIn: 32, heightIn: 22, weightLb: 1.5 }
};
const AUTHENTICATION_CERTIFICATE_PROVIDER = 'Nigerian National Museum, Onikan, Lagos or Nike Art Gallery, Lekki, Lagos';
const DISPLAY_CURRENCY_BY_COUNTRY = {
  NG: { currency: 'NGN', locale: 'en-NG', usdRate: DISPLAY_USD_TO_NGN },
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
const COUNTRY_BY_TIMEZONE = {
  'Africa/Lagos': 'NG',
  'Europe/London': 'GB',
  'Europe/Paris': 'FR',
  'Europe/Berlin': 'DE',
  'Europe/Amsterdam': 'NL',
  'Europe/Madrid': 'ES',
  'Europe/Rome': 'IT',
  'America/New_York': 'US',
  'America/Chicago': 'US',
  'America/Denver': 'US',
  'America/Los_Angeles': 'US',
  'America/Toronto': 'CA',
  'America/Vancouver': 'CA',
  'Africa/Accra': 'GH',
  'Africa/Johannesburg': 'ZA',
  'Africa/Nairobi': 'KE',
  'Africa/Casablanca': 'MA',
  'Asia/Dubai': 'AE'
};
const CART_STORAGE_KEY = 'yourAfricanArtCart';
let cartItems = loadCart();
let includeAuthenticationCertificate = false;

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
        <label class="payment-field payment-email-field" for="paymentEmail">
          <span>Email for checkout receipt</span>
          <input id="paymentEmail" type="email" autocomplete="email" placeholder="you@example.com">
        </label>
        <label class="cart-addon" for="authCertificate">
          <input type="checkbox" id="authCertificate">
          <span>
            <strong>Add painting authentication certificate</strong>
            <small>Certificate issued through the Nigerian National Museum, Onikan, Lagos or Nike Art Gallery, Lekki, Lagos. Fee is $20 per painting internationally, or NGN 15,000 per painting for Nigeria checkout.</small>
          </span>
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
  const detectedCountryCode = getDetectedCountryCode();
  if (COUNTRY_OPTIONS.some(country => country.code === detectedCountryCode)) {
    select.value = detectedCountryCode;
  }

  modal.querySelector('.cart-modal-close').addEventListener('click', closeCart);
  modal.addEventListener('click', e => {
    if (e.target === modal) closeCart();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal.classList.contains('active')) closeCart();
  });
  select.addEventListener('change', updatePaymentRoute);
  modal.querySelector('#paymentCity').addEventListener('change', updatePaymentRoute);
  modal.querySelector('#paymentEmail').addEventListener('input', updatePaymentRoute);
  modal.querySelector('#authCertificate').addEventListener('change', e => {
    includeAuthenticationCertificate = e.target.checked;
    updatePaymentRoute();
  });
  modal.querySelector('#paymentContinueBtn').addEventListener('click', continueToCheckout);

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

function getDetectedCountryCode() {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (COUNTRY_BY_TIMEZONE[timeZone]) return COUNTRY_BY_TIMEZONE[timeZone];

  const languageCountry = (navigator.languages || [navigator.language || ''])
    .map(language => (language.match(/-([A-Z]{2})\b/i) || [])[1])
    .find(Boolean);
  if (languageCountry) {
    const normalized = languageCountry.toUpperCase();
    if (DISPLAY_CURRENCY_BY_COUNTRY[normalized]) return normalized;
  }
  return 'US';
}

function getDisplayProfile(countryCode = getDetectedCountryCode()) {
  return DISPLAY_CURRENCY_BY_COUNTRY[countryCode] || DISPLAY_CURRENCY_BY_COUNTRY.OTHER;
}

function formatLocalArtworkPrice(usdAmount, countryCode = getDetectedCountryCode()) {
  const profile = getDisplayProfile(countryCode);
  const amount = Math.round(Number(usdAmount) * profile.usdRate);
  return formatCurrency(amount, profile.currency, profile.locale);
}

function updateLocalizedPriceDisplays() {
  document.querySelectorAll('[data-usd-price]').forEach(el => {
    el.textContent = formatLocalArtworkPrice(el.dataset.usdPrice);
  });
}

function getCheckoutTotals(route, countryCode) {
  if (!cartItems.length) return null;
  const subtotalUsd = getCartSubtotalUsd();
  const authenticationUsd = includeAuthenticationCertificate
    ? AUTH_CERTIFICATE_USD_PER_PAINTING * cartItems.length
    : 0;
  if (route === 'local') {
    const artwork = Math.round(subtotalUsd * DISPLAY_USD_TO_NGN);
    const authentication = includeAuthenticationCertificate
      ? AUTH_CERTIFICATE_NGN_PER_PAINTING * cartItems.length
      : 0;
    const delivery = LOCAL_DELIVERY_NGN;
    return {
      currency: 'NGN',
      artwork,
      authentication,
      delivery,
      total: artwork + authentication + delivery
    };
  }
  const profile = DISPLAY_CURRENCY_BY_COUNTRY[countryCode] || DISPLAY_CURRENCY_BY_COUNTRY.OTHER;
  const shippingEstimate = getDhlTubeShippingEstimate(countryCode);
  const shippingUsd = shippingEstimate.amountUsd;
  const artwork = Math.round(subtotalUsd * profile.usdRate);
  const authentication = Math.round(authenticationUsd * profile.usdRate);
  const delivery = Math.round(shippingUsd * profile.usdRate);
  return {
    currency: profile.currency,
    locale: profile.locale,
    artwork,
    authentication,
    delivery,
    total: artwork + authentication + delivery,
    paypalCurrency: 'USD',
    paypalArtwork: subtotalUsd,
    paypalAuthentication: authenticationUsd,
    paypalDelivery: shippingUsd,
    paypalTotal: subtotalUsd + authenticationUsd + shippingUsd,
    shippingDetail: shippingEstimate
  };
}

function getDhlTubeShippingEstimate(countryCode) {
  const profile = DHL_RATE_PROFILES[countryCode] || DHL_RATE_PROFILES.OTHER;
  const packageProfile = getCartTubePackageProfile();
  const extraHalfKgUnits = Math.max(0, Math.ceil((packageProfile.chargeableKg - 1) * 2));
  const amountUsd = profile.baseUsd + DHL_TUBE_HANDLING_BUFFER_USD + (extraHalfKgUnits * profile.perHalfKgUsd);
  return {
    amountUsd,
    chargeableKg: packageProfile.chargeableKg,
    tubeCount: packageProfile.tubeCount,
    lengthIn: packageProfile.lengthIn
  };
}

function getCartTubePackageProfile() {
  const profiles = cartItems.map(item => ARTWORK_SHIPPING_PROFILES[item.id]).filter(Boolean);
  if (!profiles.length) {
    return { tubeCount: cartItems.length || 1, lengthIn: 20, chargeableKg: 1 };
  }

  const tubeCount = profiles.length;
  const lengthIn = Math.max(...profiles.map(profile => getTubeLengthIn(profile)));
  const widthIn = DHL_TUBE_DIAMETER_IN;
  const heightIn = DHL_TUBE_DIAMETER_IN * tubeCount;
  const actualKg = profiles.reduce((sum, profile) => sum + profile.weightLb, 0) * KG_PER_LB;
  const volumetricKg = (
    (lengthIn * CM_PER_INCH) *
    (widthIn * CM_PER_INCH) *
    (heightIn * CM_PER_INCH)
  ) / DHL_VOLUMETRIC_DIVISOR_CM;
  const chargeableKg = Math.max(1, Math.ceil(Math.max(actualKg, volumetricKg) * 2) / 2);
  return { tubeCount, lengthIn, chargeableKg };
}

function getTubeLengthIn(profile) {
  return Math.ceil(Math.min(profile.widthIn, profile.heightIn) + DHL_TUBE_LENGTH_MARGIN_IN);
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
    ${totals.authentication ? `<div><span>Authentication certificate</span><strong>${formatter(totals.authentication)}</strong></div>` : ''}
    <div><span>Delivery</span><strong>${formatter(totals.delivery)}</strong></div>
    <div class="payment-total-row"><span>Total</span><strong>${formatter(totals.total)}</strong></div>
  `;
  estimateNote.textContent = route === 'local'
    ? 'Local checkout total shown in NGN.'
    : `DHL tube estimate for ${totals.shippingDetail.tubeCount} rolled painting${totals.shippingDetail.tubeCount === 1 ? '' : 's'}: ${totals.shippingDetail.lengthIn}" tube length, ${totals.shippingDetail.chargeableKg} kg chargeable weight. PayPal checkout is charged in USD and will show the final conversion before you pay.`;
}

function updatePaymentRoute() {
  const modal = ensureCartModal();
  const countryCode = modal.querySelector('#paymentCountry').value;
  const cityField = modal.querySelector('.payment-city-field');
  const citySelect = modal.querySelector('#paymentCity');
  const cityCode = citySelect.value;
  const emailField = modal.querySelector('.payment-email-field');
  const emailInput = modal.querySelector('#paymentEmail');
  const customerEmail = emailInput.value.trim();
  const note = modal.querySelector('#paymentRouteNote');
  const configNote = modal.querySelector('#paymentConfigNote');
  const continueBtn = modal.querySelector('#paymentContinueBtn');

  configNote.textContent = '';
  continueBtn.disabled = !countryCode;
  cityField.classList.toggle('show', countryCode === 'NG');
  emailField.classList.toggle('show', countryCode === 'NG');

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
    continueBtn.textContent = PAYSTACK_IS_LIVE
      ? 'Checkout with Paystack'
      : PAYSTACK_ALLOW_TEST_CHECKOUT
        ? 'Test Paystack checkout'
        : 'Paystack awaiting review';
    note.textContent = 'You will continue through Paystack secure checkout in NGN. Local delivery for this city is included in the total shown.';
    if (!isValidEmail(customerEmail)) {
      continueBtn.disabled = true;
      configNote.textContent = 'Enter an email address so Paystack can issue the payment receipt.';
      return;
    }
    if (!PAYSTACK_PUBLIC_KEY) {
      continueBtn.disabled = true;
      configNote.textContent = 'Paystack public key is needed before local checkout can be enabled.';
      return;
    }
    if (!PAYSTACK_IS_LIVE) {
      configNote.textContent = PAYSTACK_ALLOW_TEST_CHECKOUT
        ? 'Paystack is currently connected with the test public key. Replace it with the live public key before accepting real payments.'
        : 'Paystack has been activated and is awaiting review. Local checkout will open when the live public key is available.';
      continueBtn.disabled = !PAYSTACK_ALLOW_TEST_CHECKOUT;
      return;
    }
    continueBtn.disabled = false;
  } else {
    citySelect.value = '';
    emailInput.value = '';
    continueBtn.textContent = 'Checkout with PayPal';
    note.textContent = 'You will continue through PayPal secure checkout. DHL tube delivery is included in the total shown.';
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

function continueToCheckout() {
  if (!cartItems.length) return;
  const modal = ensureCartModal();
  const countryCode = modal.querySelector('#paymentCountry').value;
  if (!countryCode) return;

  const route = getPaymentRoute(countryCode);
  if (route === 'local') {
    submitPaystackCart();
    return;
  }

  if (!PAYPAL_BUSINESS) return;
  submitPayPalCart(countryCode);
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
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
        <b data-usd-price="${item.price}">${formatLocalArtworkPrice(item.price)}</b>
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
  const shippingEstimate = getDhlTubeShippingEstimate(countryCode);
  addHiddenField(form, 'item_name_' + shippingIndex, 'DHL tube delivery');
  addHiddenField(form, 'item_number_' + shippingIndex, 'shipping-international');
  addHiddenField(form, 'amount_' + shippingIndex, shippingEstimate.amountUsd.toFixed(2));
  addHiddenField(form, 'quantity_' + shippingIndex, '1');

  if (includeAuthenticationCertificate) {
    const certificateIndex = shippingIndex + 1;
    addHiddenField(form, 'item_name_' + certificateIndex, 'Painting authentication certificate');
    addHiddenField(form, 'item_number_' + certificateIndex, 'authentication-certificate');
    addHiddenField(form, 'amount_' + certificateIndex, AUTH_CERTIFICATE_USD_PER_PAINTING.toFixed(2));
    addHiddenField(form, 'quantity_' + certificateIndex, String(cartItems.length));
  }

  document.body.appendChild(form);
  form.submit();
}

function submitPaystackCart() {
  const modal = ensureCartModal();
  const email = modal.querySelector('#paymentEmail').value.trim();
  const countryCode = modal.querySelector('#paymentCountry').value;
  const cityCode = modal.querySelector('#paymentCity').value;
  const totals = getCheckoutTotals('local', countryCode);

  if (!totals || !PAYSTACK_PUBLIC_KEY || !isValidEmail(email) || !LOCAL_DELIVERY_CITIES.includes(cityCode)) {
    updatePaymentRoute();
    return;
  }

  loadPaystackInline()
    .then(() => {
      const popup = new PaystackPop();
      popup.newTransaction({
        key: PAYSTACK_PUBLIC_KEY,
        email,
        amount: totals.total * 100,
        currency: 'NGN',
        reference: 'yaa-ng-' + Date.now(),
        metadata: {
          custom_fields: [
            {
              display_name: 'Artwork',
              variable_name: 'artwork',
              value: cartItems.map(item => item.title).join(', ')
            },
            {
              display_name: 'Delivery city',
              variable_name: 'delivery_city',
              value: cityCode === 'LAGOS' ? 'Lagos' : 'Abuja'
            },
            {
              display_name: 'Authentication certificate',
              variable_name: 'authentication_certificate',
              value: includeAuthenticationCertificate
                ? AUTHENTICATION_CERTIFICATE_PROVIDER
                : 'Not requested'
            }
          ]
        },
        onSuccess: transaction => {
          cartItems = [];
          saveCart();
          renderCart();
          modal.querySelector('#paymentConfigNote').textContent = 'Payment received. Reference: ' + transaction.reference + '. We will confirm and arrange dispatch.';
        },
        onCancel: () => {
          modal.querySelector('#paymentConfigNote').textContent = 'Paystack checkout was closed before payment was completed.';
        },
        onError: error => {
          modal.querySelector('#paymentConfigNote').textContent = 'Paystack could not load checkout: ' + error.message;
        }
      });
    })
    .catch(() => {
      modal.querySelector('#paymentConfigNote').textContent = 'Paystack checkout could not be loaded. Please check your connection and try again.';
    });
}

function loadPaystackInline() {
  if (window.PaystackPop) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const existingScript = document.querySelector('script[data-paystack-inline]');
    if (existingScript) {
      existingScript.addEventListener('load', resolve, { once: true });
      existingScript.addEventListener('error', reject, { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = PAYSTACK_SCRIPT_SRC;
    script.async = true;
    script.dataset.paystackInline = 'true';
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
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
updateLocalizedPriceDisplays();
window.formatLocalArtworkPrice = formatLocalArtworkPrice;
window.updateLocalizedPriceDisplays = updateLocalizedPriceDisplays;
window.getDetectedCountryCode = getDetectedCountryCode;
document.dispatchEvent(new CustomEvent('yaa:currency-ready'));
