/**
 * app.js — Shared frontend utilities
 * Good Cookie Chocolate Store
 */

// ── API Helper ─────────────────────────────────────────────────────
const API = {
    base: '/api',

    getToken() { return localStorage.getItem('token') || ''; },

    headers(extra = {}) {
        return {
            'Content-Type': 'application/json',
            'Authorization': this.getToken(),
            ...extra
        };
    },

    async get(url) {
        const res = await fetch(this.base + url, { headers: this.headers() });
        if (!res.ok) throw new Error((await res.json()).error || 'Request failed');
        return res.json();
    },

    async post(url, body) {
        const res = await fetch(this.base + url, {
            method: 'POST',
            headers: this.headers(),
            body: JSON.stringify(body)
        });
        if (!res.ok) throw new Error((await res.json()).error || 'Request failed');
        return res.json();
    },

    async put(url, body) {
        const res = await fetch(this.base + url, {
            method: 'PUT',
            headers: this.headers(),
            body: JSON.stringify(body)
        });
        if (!res.ok) throw new Error((await res.json()).error || 'Request failed');
        return res.json();
    },

    async delete(url) {
        const res = await fetch(this.base + url, {
            method: 'DELETE',
            headers: this.headers()
        });
        if (!res.ok) throw new Error((await res.json()).error || 'Request failed');
        return res.json();
    }
};

// ── Auth Helper ────────────────────────────────────────────────────
const Auth = {
    save(data) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role);
        localStorage.setItem('userName', data.name);
        localStorage.setItem('userEmail', data.email);
        localStorage.setItem('userId', data.id);
    },
    clear() {
        ['token', 'role', 'userName', 'userEmail', 'userId'].forEach(k => localStorage.removeItem(k));
    },
    isLoggedIn() { return !!localStorage.getItem('token'); },
    isAdmin() { return localStorage.getItem('role') === 'admin'; },
    getName() { return localStorage.getItem('userName') || 'User'; },
    getEmail() { return localStorage.getItem('userEmail') || ''; },
    requireUser() {
        if (!this.isLoggedIn()) { window.location.href = '/login'; return false; }
        return true;
    },
    requireAdmin() {
        if (!this.isLoggedIn() || !this.isAdmin()) { window.location.href = '/admin-login'; return false; }
        return true;
    },
    logout() {
        API.post('/auth/logout').catch(() => { });
        this.clear();
        Cart.clear();
        window.location.href = '/login';
    }
};

// ── Cart Helper ────────────────────────────────────────────────────
const Cart = {
    get() {
        try { return JSON.parse(localStorage.getItem('cart')) || []; }
        catch { return []; }
    },
    save(cart) { localStorage.setItem('cart', JSON.stringify(cart)); this.updateBadge(); },
    clear() { localStorage.removeItem('cart'); this.updateBadge(); },

    add(product, qty = 1) {
        const cart = this.get();
        const idx = cart.findIndex(i => i.productId === product.id);
        if (idx > -1) { cart[idx].quantity += qty; }
        else {
            cart.push({
                productId: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: qty
            });
        }
        this.save(cart);
        showToast('Added to cart! 🛒', 'success');
    },

    remove(productId) {
        const cart = this.get().filter(i => i.productId !== productId);
        this.save(cart);
    },

    updateQty(productId, qty) {
        const cart = this.get();
        const idx = cart.findIndex(i => i.productId === productId);
        if (idx > -1) { cart[idx].quantity = qty; if (qty <= 0) cart.splice(idx, 1); }
        this.save(cart);
    },

    total() { return this.get().reduce((s, i) => s + i.price * i.quantity, 0); },
    count() { return this.get().reduce((s, i) => s + i.quantity, 0); },

    updateBadge() {
        const badge = document.querySelector('.cart-badge');
        if (badge) {
            const c = this.count();
            badge.textContent = c;
            badge.style.display = c > 0 ? 'flex' : 'none';
        }
    }
};

// ── Toast ──────────────────────────────────────────────────────────
function showToast(msg, type = 'success', duration = 3000) {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }
    const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span class="toast-icon">${icons[type] || '💬'}</span><span class="toast-msg">${msg}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = 'toastOut 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// ── Stars Renderer ─────────────────────────────────────────────────
function renderStars(rating) {
    let s = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= Math.floor(rating)) s += '★';
        else if (i - rating < 1) s += '⭐';
        else s += '☆';
    }
    return s;
}

// ── Navbar Scroll Effect ───────────────────────────────────────────
function initNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;
    const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 30);
    window.addEventListener('scroll', onScroll, { passive: true });
}

// ── Mobile Menu ────────────────────────────────────────────────────
function initMobileMenu() {
    const btn = document.getElementById('mobile-menu-btn');
    const nav = document.getElementById('mobile-nav');
    if (!btn || !nav) return;
    btn.addEventListener('click', () => nav.classList.toggle('open'));
    document.addEventListener('click', e => {
        if (!btn.contains(e.target) && !nav.contains(e.target)) nav.classList.remove('open');
    });
}

// ── Scroll Reveal ──────────────────────────────────────────────────
function initScrollReveal() {
    const els = document.querySelectorAll('.reveal');
    const io = new IntersectionObserver((entries) => {
        entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    els.forEach(el => io.observe(el));
}

// ── Currency Formatter ─────────────────────────────────────────────
function formatCurrency(amount) {
    return '₹' + Number(amount).toLocaleString('en-IN');
}

// ── Date Formatter ─────────────────────────────────────────────────
function formatDate(iso) {
    return new Date(iso).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
}

// ── Loader ─────────────────────────────────────────────────────────
function hideLoader() {
    const loader = document.querySelector('.loader-overlay');
    if (loader) loader.classList.add('hidden');
}
function showLoader() {
    const loader = document.querySelector('.loader-overlay');
    if (loader) loader.classList.remove('hidden');
}

// ── Navbar Auth Control ────────────────────────────────────────────
function updateNavAuth() {
    const loginBtn = document.getElementById('nav-login-btn');
    const userMenu = document.getElementById('nav-user-menu');
    const userName = document.getElementById('nav-username');
    if (!loginBtn) return;
    if (Auth.isLoggedIn()) {
        loginBtn.style.display = 'none';
        if (userMenu) userMenu.style.display = 'flex';
        if (userName) userName.textContent = Auth.getName().split(' ')[0];
    } else {
        loginBtn.style.display = 'flex';
        if (userMenu) userMenu.style.display = 'none';
    }
}

// ── Init ───────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    initNavbarScroll();
    initMobileMenu();
    initScrollReveal();
    Cart.updateBadge();
    updateNavAuth();
    setTimeout(hideLoader, 600);
});
