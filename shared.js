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
