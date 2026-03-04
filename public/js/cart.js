/**
 * cart.js — Shopping cart page logic
 */

function renderCart() {
    const items = Cart.get();
    const listEl = document.getElementById('cart-items-list');
    const emptyEl = document.getElementById('empty-cart');
    const layoutEl = document.getElementById('cart-layout');
    const countEl = document.getElementById('cart-count-text');

    if (!items.length) {
        if (layoutEl) layoutEl.style.display = 'none';
        if (emptyEl) emptyEl.style.display = 'block';
        if (countEl) countEl.textContent = 'Your cart is empty';
        return;
    }

    if (layoutEl) layoutEl.style.display = 'grid';
    if (emptyEl) emptyEl.style.display = 'none';
    if (countEl) countEl.textContent = `${Cart.count()} item${Cart.count() !== 1 ? 's' : ''} in your cart`;

    if (listEl) {
        listEl.innerHTML = items.map(item => `
      <div class="cart-item">
        <img class="cart-item-img" src="${item.image}" alt="${item.name}" onerror="this.src='/images/hero.png'" />
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">${formatCurrency(item.price)} each</div>
          <div class="cart-qty-ctrl">
            <button class="qty-btn" onclick="changeQty('${item.productId}', -1)">−</button>
            <span class="qty-num">${item.quantity}</span>
            <button class="qty-btn" onclick="changeQty('${item.productId}', 1)">+</button>
          </div>
        </div>
        <div class="cart-item-total">${formatCurrency(item.price * item.quantity)}</div>
        <button class="cart-remove-btn" onclick="removeItem('${item.productId}')" title="Remove">✕</button>
      </div>
    `).join('');
    }

    // Update summary
    const total = Cart.total();
    const subtotalEl = document.getElementById('summary-subtotal');
    const totalEl = document.getElementById('summary-total');
    if (subtotalEl) subtotalEl.textContent = formatCurrency(total);
    if (totalEl) totalEl.textContent = formatCurrency(total);
}

function changeQty(productId, delta) {
    const cart = Cart.get();
    const item = cart.find(i => i.productId === productId);
    if (!item) return;
    const newQty = item.quantity + delta;
    if (newQty <= 0) {
        Cart.remove(productId);
    } else {
        Cart.updateQty(productId, newQty);
    }
    renderCart();
}

function removeItem(productId) {
    Cart.remove(productId);
    renderCart();
    showToast('Item removed from cart', 'info');
}

function proceedCheckout() {
    if (!Auth.isLoggedIn()) {
        showToast('Please login to proceed to checkout!', 'warning');
        setTimeout(() => { window.location.href = '/login'; }, 1200);
        return;
    }
    window.location.href = '/checkout';
}

document.addEventListener('DOMContentLoaded', renderCart);
