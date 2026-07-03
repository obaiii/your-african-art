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

// ===== PAYMENT ROUTING =====
const PAYMENT_LINKS = {
  // Create payment links for totals that include shipping.
  // Suggested keys: 'atarci:international', 'atarci:lagos', 'atarci:abuja'.
  paypal: {
    default: ''
  },
  local: {
    default: ''
  }
};

const COUNTRY_OPTIONS = [
  { code: '', name: 'Select delivery country' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'GH', name: 'Ghana' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'KE', name: 'Kenya' },
  { code: 'MA', name: 'Morocco' },
  { code: 'FR', name: 'France' },
  { code: 'DE', name: 'Germany' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'ES', name: 'Spain' },
  { code: 'IT', name: 'Italy' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'OTHER', name: 'Other country' }
];

const LOCAL_CHECKOUT_COUNTRIES = ['NG'];
const LOCAL_DELIVERY_CITIES = ['LAGOS', 'ABUJA'];
const INTERNATIONAL_SHIPPING_USD = 30;
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
let selectedPainting = null;

function ensurePaymentModal() {
  let modal = document.getElementById('paymentModal');
  if (modal) return modal;

  modal = document.createElement('div');
  modal.id = 'paymentModal';
  modal.className = 'payment-modal';
  modal.innerHTML = `
    <div class="payment-modal-panel" role="dialog" aria-modal="true" aria-labelledby="paymentModalTitle">
      <button class="payment-modal-close" type="button" aria-label="Close checkout">&times;</button>
      <span class="section-tag">Secure Checkout</span>
      <h2 id="paymentModalTitle">Complete your purchase</h2>
      <div class="payment-summary">
        <div>
          <strong id="paymentArtworkTitle"></strong>
          <span id="paymentArtworkMeta"></span>
        </div>
        <b id="paymentArtworkPrice"></b>
      </div>
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
      <button class="payment-continue-btn" id="paymentContinueBtn" type="button" disabled>Continue to secure checkout</button>
      <p class="payment-config-note" id="paymentConfigNote"></p>
    </div>
  `;
  document.body.appendChild(modal);

  const select = modal.querySelector('#paymentCountry');
  select.innerHTML = COUNTRY_OPTIONS.map(country => (
    `<option value="${country.code}">${country.name}</option>`
  )).join('');

  modal.querySelector('.payment-modal-close').addEventListener('click', closePaymentModal);
  modal.addEventListener('click', e => {
    if (e.target === modal) closePaymentModal();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal.classList.contains('active')) closePaymentModal();
  });
  select.addEventListener('change', updatePaymentRoute);
  modal.querySelector('#paymentCity').addEventListener('change', updatePaymentRoute);
  modal.querySelector('#paymentContinueBtn').addEventListener('click', continueToPayment);

  return modal;
}

function getPaymentRoute(countryCode) {
  return LOCAL_CHECKOUT_COUNTRIES.includes(countryCode) ? 'local' : 'paypal';
}

function getPaymentKey(route, paintingId, cityCode) {
  if (route === 'local' && cityCode) return paintingId + ':' + cityCode.toLowerCase();
  return paintingId + ':international';
}

function getPaymentLink(route, paintingId, cityCode) {
  const links = PAYMENT_LINKS[route] || {};
  const key = getPaymentKey(route, paintingId, cityCode);
  return links[key] || links[paintingId] || links.default || '';
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
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

function getCheckoutTotals(route, countryCode) {
  if (!selectedPainting) return null;
  if (route === 'local') {
    const artwork = Math.round(selectedPainting.price * DISPLAY_USD_TO_NGN);
    const delivery = LOCAL_DELIVERY_NGN;
    return {
      currency: 'NGN',
      artwork,
      delivery,
      total: artwork + delivery
    };
  }
  const profile = DISPLAY_CURRENCY_BY_COUNTRY[countryCode] || DISPLAY_CURRENCY_BY_COUNTRY.OTHER;
  const artwork = Math.round(selectedPainting.price * profile.usdRate);
  const delivery = Math.round(INTERNATIONAL_SHIPPING_USD * profile.usdRate);
  return {
    currency: profile.currency,
    locale: profile.locale,
    artwork,
    delivery,
    total: artwork + delivery
  };
}

function renderPaymentTotals(route, countryCode) {
  const modal = ensurePaymentModal();
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
  modal.querySelector('#paymentArtworkPrice').textContent = formatter(totals.artwork);
  estimateNote.textContent = route === 'local'
    ? 'Local checkout total shown in NGN.'
    : 'Estimated local currency total. PayPal will show the final conversion before you pay.';
}

function updatePaymentRoute() {
  const modal = ensurePaymentModal();
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
    modal.querySelector('#paymentArtworkPrice').textContent = formatUsd(selectedPainting.price);
    return;
  }

  const route = getPaymentRoute(countryCode);
  renderPaymentTotals(route, countryCode);

  if (route === 'local') {
    if (!cityCode) {
      continueBtn.disabled = true;
      note.textContent = 'Choose your delivery city to see the final checkout total.';
      return;
    }
    if (!LOCAL_DELIVERY_CITIES.includes(cityCode)) {
      continueBtn.disabled = true;
      note.textContent = 'For this delivery city, please contact us for a delivery quote before payment.';
      configNote.textContent = 'Email hello@yourafricanart.com or use WhatsApp to confirm availability and delivery cost.';
      return;
    }
    note.textContent = 'A secure local checkout option is available. Delivery is included for this city.';
  } else {
    citySelect.value = '';
    note.textContent = 'You will continue through PayPal secure checkout. International delivery is included in the total shown.';
  }

  if (!getPaymentLink(route, selectedPainting.id, cityCode)) {
    continueBtn.disabled = true;
    configNote.textContent = 'Checkout links are being configured. Please email hello@yourafricanart.com to reserve this piece.';
  }
}

function closePaymentModal() {
  const modal = document.getElementById('paymentModal');
  if (!modal) return;
  modal.classList.remove('active');
  document.body.style.overflow = '';
}

function continueToPayment() {
  if (!selectedPainting) return;
  const modal = ensurePaymentModal();
  const countryCode = modal.querySelector('#paymentCountry').value;
  const cityCode = modal.querySelector('#paymentCity').value;
  if (!countryCode) return;

  const route = getPaymentRoute(countryCode);
  const link = getPaymentLink(route, selectedPainting.id, cityCode);
  if (link) {
    window.location.href = link;
  }
}

function handleBuy(id, title, price) {
  selectedPainting = { id, title, price };
  const modal = ensurePaymentModal();
  modal.querySelector('#paymentArtworkTitle').textContent = title;
  modal.querySelector('#paymentArtworkMeta').textContent = 'Original artwork';
  modal.querySelector('#paymentArtworkPrice').textContent = '$' + price;
  modal.querySelector('#paymentCountry').value = '';
  modal.querySelector('#paymentCity').value = '';
  updatePaymentRoute();
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}
