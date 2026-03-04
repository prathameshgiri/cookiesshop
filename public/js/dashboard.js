/**
 * dashboard.js — User dashboard logic
 */

document.addEventListener('DOMContentLoaded', () => {
    if (!Auth.requireUser()) return;

    // Populate user info
    const name = Auth.getName();
    const email = Auth.getEmail();
    const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

    setEl('sidebar-name', name);
    setEl('sidebar-email', email);
    setEl('sidebar-avatar', initials);
    setEl('nav-username', name.split(' ')[0]);

    // Profile fields
    setVal('pf-name', name);
    setVal('pf-email', email);
    setEl('profile-avatar-big', initials);

    loadOrders();
});

function setEl(id, text) { const el = document.getElementById(id); if (el) el.textContent = text; }
function setVal(id, val) { const el = document.getElementById(id); if (el) el.value = val; }

// ── Tab Switching ──────────────────────────────────────────────────
function switchTab(tab, link) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.add('hidden'));
    document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
    const el = document.getElementById(`tab-${tab}`);
    if (el) el.classList.remove('hidden');
    if (link) link.classList.add('active');
    return false;
}

// ── Load Orders ────────────────────────────────────────────────────
async function loadOrders() {
    const container = document.getElementById('orders-container');
    if (!container) return;
    container.innerHTML = '<div class="dash-loading">Loading your orders...</div>';
    try {
        const orders = await API.get('/orders');

        // Update stats
        setEl('stat-total', orders.length);
        setEl('stat-pending', orders.filter(o => o.status === 'Pending').length);
        setEl('stat-delivered', orders.filter(o => o.status === 'Delivered').length);
        const spent = orders
            .filter(o => o.status !== 'Cancelled')
            .reduce((s, o) => s + (o.total || 0), 0);
        setEl('stat-spent', formatCurrency(spent));

        if (!orders.length) {
            container.innerHTML = `
        <div class="no-orders">
          <div class="no-icon">📦</div>
          <h3>No Orders Yet</h3>
          <p>You haven't placed any orders. Start shopping!</p>
          <a href="/#products" class="btn btn-primary" style="margin-top:20px">Shop Now 🍪</a>
        </div>`;
            return;
        }

        container.innerHTML = orders.map(order => `
      <div class="order-card">
        <div class="order-card-header">
          <div>
            <div class="order-id">Order #${order.id}</div>
            <div class="order-date">${formatDate(order.createdAt)}</div>
          </div>
          <span class="status-badge status-${order.status.toLowerCase()}">${statusIcon(order.status)} ${order.status}</span>
        </div>
        <div class="order-items-list">
          ${order.items.map(item => `
            <div class="order-item-row">
              <img class="order-item-img" src="${item.image}" alt="${item.name}" onerror="this.src='/images/hero.png'" />
              <span class="order-item-name">${item.name}</span>
              <span class="order-item-qty">x${item.quantity}</span>
              <span class="order-item-price">${formatCurrency(item.price * item.quantity)}</span>
            </div>
          `).join('')}
        </div>
        <div class="order-card-footer">
          <div class="order-total">Total: <span>${formatCurrency(order.total)}</span></div>
          <div style="display:flex;gap:10px;align-items:center">
            ${order.address ? `<small style="color:var(--text-light);font-size:0.78rem">📍 ${order.address.slice(0, 40)}...</small>` : ''}
            ${order.status === 'Pending' ? `<button class="cancel-btn" onclick="cancelOrder('${order.id}')">Cancel Order</button>` : ''}
          </div>
        </div>
      </div>
    `).join('');
    } catch (e) {
        container.innerHTML = `<div class="dash-loading">Failed to load orders. <a href="#" onclick="loadOrders()">Retry</a></div>`;
    }
}

function statusIcon(status) {
    const icons = { Pending: '⏳', Confirmed: '✅', Delivered: '🎉', Cancelled: '❌' };
    return icons[status] || '📦';
}

async function cancelOrder(orderId) {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    try {
        await API.delete(`/orders/${orderId}`);
        showToast('Order cancelled successfully', 'success');
        loadOrders();
    } catch (e) {
        showToast(e.message, 'error');
    }
}

function saveProfile() {
    showToast('Profile updated successfully! 👤', 'success');
}
