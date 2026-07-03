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
  modal.querySelector('#paymentContinueBtn').addEventListener('click', continueToPayment);

  return modal;
}

function getPaymentRoute(countryCode) {
  return LOCAL_CHECKOUT_COUNTRIES.includes(countryCode) ? 'local' : 'paypal';
}

function getPaymentLink(route, paintingId) {
  const links = PAYMENT_LINKS[route] || {};
  return links[paintingId] || links.default || '';
}

function updatePaymentRoute() {
  const modal = ensurePaymentModal();
  const countryCode = modal.querySelector('#paymentCountry').value;
  const note = modal.querySelector('#paymentRouteNote');
  const configNote = modal.querySelector('#paymentConfigNote');
  const continueBtn = modal.querySelector('#paymentContinueBtn');

  configNote.textContent = '';
  continueBtn.disabled = !countryCode;

  if (!countryCode) {
    note.textContent = 'Choose your delivery country to continue.';
    return;
  }

  const route = getPaymentRoute(countryCode);
  note.textContent = route === 'local'
    ? 'A secure local checkout option is available for this delivery country.'
    : 'You will continue through PayPal secure checkout.';

  if (!getPaymentLink(route, selectedPainting.id)) {
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
  if (!countryCode) return;

  const route = getPaymentRoute(countryCode);
  const link = getPaymentLink(route, selectedPainting.id);
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
  updatePaymentRoute();
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}
