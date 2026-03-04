/**
 * home.js — Home page interactions
 */

// ── Hero Particles ─────────────────────────────────────────────────
function createParticles() {
    const container = document.getElementById('hero-particles');
    if (!container) return;
    const emojis = ['🍪', '🍫', '✨', '🎂', '🍬', '⭐', '🌟', '💛'];
    for (let i = 0; i < 12; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        p.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        p.style.left = Math.random() * 100 + '%';
        p.style.animationDuration = (12 + Math.random() * 16) + 's';
        p.style.animationDelay = (Math.random() * 10) + 's';
        p.style.fontSize = (0.8 + Math.random() * 1) + 'rem';
        container.appendChild(p);
    }
}

// ── Products Loading ───────────────────────────────────────────────
let allProducts = [];
let currentCategory = 'all';

async function loadProducts(category = 'all') {
    const grid = document.getElementById('products-grid');
    if (!grid) return;
    grid.innerHTML = `<div style="text-align:center;padding:60px;grid-column:1/-1;color:var(--text-light)"><div class="loader-spinner" style="margin:0 auto 16px;"></div>Loading...</div>`;
    try {
        const url = category === 'all' ? '/products' : `/products?category=${category}`;
        allProducts = await API.get(url);
        renderProducts(allProducts);
    } catch (e) {
        grid.innerHTML = `<div style="text-align:center;padding:60px;grid-column:1/-1;color:var(--text-light)">Failed to load products. Please try again.</div>`;
    }
}

function renderProducts(products) {
    const grid = document.getElementById('products-grid');
    if (!grid) return;
    if (!products.length) {
        grid.innerHTML = `<div style="text-align:center;padding:60px;grid-column:1/-1;color:var(--text-light)">No products in this category yet.</div>`;
        return;
    }
    grid.innerHTML = products.map(p => {
        const discount = p.originalPrice ? Math.round((1 - p.price / p.originalPrice) * 100) : 0;
        return `
    <div class="product-card reveal">
      <div class="product-img-wrap">
        <img src="${p.image}" alt="${p.name}" loading="lazy" onerror="this.src='/images/hero.png'" />
        ${p.badge ? `<div class="product-badge">${p.badge}</div>` : ''}
      </div>
      <div class="product-body">
        <div class="product-category">${p.category}</div>
        <div class="product-name">${p.name}</div>
        <div class="product-rating">
          <span class="stars">${renderStars(p.rating)}</span>
          <span class="count">(${p.reviews})</span>
        </div>
        <div class="product-price-row">
          <span class="product-price">${formatCurrency(p.price)}</span>
          ${p.originalPrice ? `<span class="product-original">${formatCurrency(p.originalPrice)}</span>` : ''}
          ${discount ? `<span class="product-discount">${discount}% OFF</span>` : ''}
        </div>
        <div class="product-actions">
          <button class="btn btn-secondary btn-sm" onclick="addToCart('${p.id}')">🛒 Add to Cart</button>
          <button class="btn btn-primary btn-sm" onclick="buyNow('${p.id}')">Buy Now</button>
        </div>
      </div>
    </div>`;
    }).join('');
    // Re-observe newly added cards
    initScrollReveal();
}

function addToCart(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;
    Cart.add(product, 1);
}

function buyNow(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;
    Cart.add(product, 1);
    window.location.href = '/cart';
}

// ── Filter Tabs ────────────────────────────────────────────────────
function filterProducts(category) {
    currentCategory = category;
    // Update tab active state
    document.querySelectorAll('.filter-tab').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.cat === category);
    });
    // Scroll to products
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    loadProducts(category);
}

function initFilterTabs() {
    document.querySelectorAll('.filter-tab').forEach(btn => {
        btn.addEventListener('click', () => filterProducts(btn.dataset.cat));
    });
}

// ── Testimonials Slider ────────────────────────────────────────────
let testimonialIndex = 0;
let testimonialCount = 0;
let autoSlideInterval = null;

function initTestimonials() {
    const track = document.getElementById('testimonials-track');
    const dotsContainer = document.getElementById('slider-dots');
    if (!track) return;

    const cards = track.querySelectorAll('.testimonial-card');
    testimonialCount = cards.length;

    // Build dots
    if (dotsContainer) {
        dotsContainer.innerHTML = '';
        for (let i = 0; i < testimonialCount; i++) {
            const dot = document.createElement('div');
            dot.className = `slider-dot${i === 0 ? ' active' : ''}`;
            dot.onclick = () => goToTestimonial(i);
            dotsContainer.appendChild(dot);
        }
    }

    startAutoSlide();
}

function getVisibleCards() {
    const w = window.innerWidth;
    if (w >= 1024) return 3;
    if (w >= 640) return 2;
    return 1;
}

function goToTestimonial(idx) {
    const track = document.getElementById('testimonials-track');
    if (!track) return;
    const cards = track.querySelectorAll('.testimonial-card');
    const visible = getVisibleCards();
    const max = testimonialCount - visible;
    idx = Math.max(0, Math.min(idx, max));
    testimonialIndex = idx;
    const cardWidth = cards[0].offsetWidth + 24;
    track.style.transform = `translateX(-${idx * cardWidth}px)`;

    document.querySelectorAll('.slider-dot').forEach((d, i) => {
        d.classList.toggle('active', i === idx);
    });
}

function slideTestimonials(dir) {
    goToTestimonial(testimonialIndex + dir);
    restartAutoSlide();
}

function startAutoSlide() {
    if (autoSlideInterval) clearInterval(autoSlideInterval);
    autoSlideInterval = setInterval(() => {
        const visible = getVisibleCards();
        const max = testimonialCount - visible;
        if (testimonialIndex >= max) goToTestimonial(0);
        else goToTestimonial(testimonialIndex + 1);
    }, 4000);
}

function restartAutoSlide() {
    clearInterval(autoSlideInterval);
    startAutoSlide();
}

// ── Contact Form ───────────────────────────────────────────────────
function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('contact-submit');
        btn.disabled = true; btn.textContent = 'Sending...';
        try {
            await API.post('/messages', {
                name: document.getElementById('contact-name').value,
                email: document.getElementById('contact-email').value,
                message: document.getElementById('contact-message').value
            });
            showToast('Message sent! We\'ll get back to you soon. 💌', 'success');
            form.reset();
        } catch (e) {
            showToast('Failed to send message. Please try again.', 'error');
        } finally {
            btn.disabled = false; btn.textContent = 'Send Message 🚀';
        }
    });
}

// ── Parallax on Hero Image ─────────────────────────────────────────
function initHeroParallax() {
    const hero = document.querySelector('.hero');
    const img = document.getElementById('hero-img');
    if (!hero || !img) return;
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        img.style.transform = `translateY(${scrollY * 0.1}px)`;
    }, { passive: true });
}

// ── Init ───────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    createParticles();
    loadProducts('all');
    initFilterTabs();
    initTestimonials();
    initContactForm();
    initHeroParallax();
    window.addEventListener('resize', () => goToTestimonial(0));
});
