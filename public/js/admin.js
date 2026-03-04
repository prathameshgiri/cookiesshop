/**
 * admin.js — Admin Panel Logic
 */

// ── Init ───────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    if (!Auth.requireAdmin()) return;

    // Set admin info
    document.getElementById('admin-name').textContent = Auth.getName();
    document.getElementById('admin-email').textContent = Auth.getEmail();

    // Live time
    updateTime();
    setInterval(updateTime, 1000);

    // Load data
    loadAnalytics();
    loadRecentOrders();

    // Auto-refresh every 30s
    setInterval(() => {
        const activeTab = document.querySelector('.admin-tab:not(.hidden)')?.id;
        if (activeTab === 'tab-dashboard') loadAnalytics();
        if (activeTab === 'tab-orders') loadAdminOrders();
        if (activeTab === 'tab-messages') loadMessages();
    }, 30000);
});

function updateTime() {
    const el = document.getElementById('admin-time');
    if (el) el.textContent = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

// ── Tab Switching ──────────────────────────────────────────────────
const tabTitles = { dashboard: 'Dashboard', orders: 'Orders', products: 'Products', messages: 'Messages' };

function switchAdminTab(tab, link) {
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.add('hidden'));
    document.querySelectorAll('.admin-nav-link').forEach(l => l.classList.remove('active'));
    const el = document.getElementById(`tab-${tab}`);
    if (el) el.classList.remove('hidden');
    if (link) link.classList.add('active');
    else {
        document.querySelectorAll('.admin-nav-link').forEach(l => {
            if (l.dataset.tab === tab) l.classList.add('active');
        });
    }
    document.getElementById('admin-page-title').textContent = tabTitles[tab] || tab;

    // Load data for the tab
    if (tab === 'orders') loadAdminOrders();
    if (tab === 'products') loadAdminProducts();
    if (tab === 'messages') loadMessages();
    return false;
}

// ── Sidebar Toggle ─────────────────────────────────────────────────
function toggleSidebar() {
    document.getElementById('admin-sidebar').classList.toggle('open');
}

// ── Analytics ──────────────────────────────────────────────────────
async function loadAnalytics() {
    try {
        const data = await API.get('/analytics');
        setText('ac-orders', data.totalOrders);
        setText('ac-revenue', formatCurrency(data.totalRevenue));
        setText('ac-users', data.activeUsers);
        setText('ac-products', data.totalProducts);
        setText('ac-pending', data.pendingOrders);
        setText('ac-msgs', data.unreadMessages);
        setText('pending-badge', data.pendingOrders);
        setText('msg-badge', data.unreadMessages);
    } catch (e) { /* silent fail */ }
}

function setText(id, val) { const el = document.getElementById(id); if (el) el.textContent = val; }

// ── Recent Orders (Dashboard) ──────────────────────────────────────
async function loadRecentOrders() {
    const el = document.getElementById('recent-orders-table');
    if (!el) return;
    try {
        const orders = await API.get('/orders');
        const recent = orders.slice(0, 6);
        el.innerHTML = renderOrdersTable(recent, true);
    } catch (e) {
        el.innerHTML = '<div class="table-loading">Failed to load orders</div>';
    }
}

// ── Admin Orders ───────────────────────────────────────────────────
async function loadAdminOrders() {
    const el = document.getElementById('admin-orders-table');
    if (!el) return;
    el.innerHTML = '<div class="table-loading">Loading orders...</div>';
    try {
        const orders = await API.get('/orders');
        el.innerHTML = renderOrdersTable(orders, false);
    } catch (e) {
        el.innerHTML = '<div class="table-loading">Failed to load orders.</div>';
    }
}

function renderOrdersTable(orders, compact = false) {
    if (!orders.length) return '<div class="table-loading">No orders found.</div>';
    return `
  <div class="admin-table-wrap">
    <table class="admin-table">
      <thead>
        <tr>
          <th>Order ID</th>
          <th>Customer</th>
          <th>Items</th>
          <th>Total</th>
          <th>Status</th>
          ${compact ? '' : '<th>Date</th><th>Actions</th>'}
        </tr>
      </thead>
      <tbody>
        ${orders.map(o => `
          <tr>
            <td><strong>#${o.id.slice(-6)}</strong></td>
            <td>
              <div style="font-weight:600">${o.userName}</div>
              <div style="font-size:0.75rem;color:var(--text-light)">${o.userEmail}</div>
            </td>
            <td>${o.items.length} item${o.items.length !== 1 ? 's' : ''}</td>
            <td><strong>${formatCurrency(o.total)}</strong></td>
            <td>
              ${compact
            ? `<span class="status-badge status-${o.status.toLowerCase()}">${o.status}</span>`
            : `<select class="order-status-select status-${o.status.toLowerCase()}" onchange="updateOrderStatus('${o.id}', this.value)">
                    <option${o.status === 'Pending' ? ' selected' : ''}>Pending</option>
                    <option${o.status === 'Confirmed' ? ' selected' : ''}>Confirmed</option>
                    <option${o.status === 'Delivered' ? ' selected' : ''}>Delivered</option>
                    <option${o.status === 'Cancelled' ? ' selected' : ''}>Cancelled</option>
                   </select>`
        }
            </td>
            ${compact ? '' : `
            <td style="font-size:0.78rem;color:var(--text-light)">${formatDate(o.createdAt)}</td>
            <td>
              <div class="actions-col">
                <button class="table-action-btn" onclick="viewOrderDetails('${o.id}')">View</button>
              </div>
            </td>`}
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>`;
}

async function updateOrderStatus(orderId, status) {
    try {
        await API.put(`/orders/${orderId}`, { status });
        showToast(`Order status updated to ${status}`, 'success');
        loadAnalytics();
    } catch (e) {
        showToast('Failed to update status', 'error');
    }
}

function viewOrderDetails(orderId) {
    showToast(`Order #${orderId.slice(-6)} details view — coming soon!`, 'info');
}

// ── Products ───────────────────────────────────────────────────────
let editingProductId = null;

async function loadAdminProducts() {
    const el = document.getElementById('admin-products-table');
    if (!el) return;
    el.innerHTML = '<div class="table-loading">Loading products...</div>';
    try {
        const products = await API.get('/products');
        el.innerHTML = `
    <div class="admin-table-wrap">
      <table class="admin-table">
        <thead>
          <tr><th>Image</th><th>Name</th><th>Category</th><th>Price</th><th>Rating</th><th>Stock</th><th>Actions</th></tr>
        </thead>
        <tbody>
          ${products.map(p => `
          <tr>
            <td><img class="table-img" src="${p.image}" alt="${p.name}" onerror="this.src='/images/hero.png'" /></td>
            <td><div class="product-name-cell">${p.name}</div><div style="font-size:0.75rem;color:var(--text-light)">${p.description?.slice(0, 50) || ''}...</div></td>
            <td><span class="status-badge status-delivered">${p.category}</span></td>
            <td><strong>${formatCurrency(p.price)}</strong>${p.originalPrice ? `<br><small style="text-decoration:line-through;color:var(--text-light)">${formatCurrency(p.originalPrice)}</small>` : ''}</td>
            <td>⭐ ${p.rating} <small style="color:var(--text-light)">(${p.reviews})</small></td>
            <td>${p.stock || 'N/A'}</td>
            <td>
              <div class="actions-col">
                <button class="table-action-btn" onclick="openProductModal('${p.id}')">✏ Edit</button>
                <button class="table-action-btn danger" onclick="deleteProduct('${p.id}')">🗑 Delete</button>
              </div>
            </td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
    } catch (e) {
        el.innerHTML = '<div class="table-loading">Failed to load products.</div>';
    }
}

async function openProductModal(productId = null) {
    editingProductId = productId;
    const modal = document.getElementById('product-modal');
    const form = document.getElementById('product-form');
    const title = document.getElementById('modal-title');
    form.reset();

    if (productId) {
        title.textContent = 'Edit Product';
        try {
            const p = await API.get(`/products/${productId}`);
            document.getElementById('p-name').value = p.name || '';
            document.getElementById('p-category').value = p.category || 'chocolates';
            document.getElementById('p-price').value = p.price || '';
            document.getElementById('p-original-price').value = p.originalPrice || '';
            document.getElementById('p-rating').value = p.rating || '';
            document.getElementById('p-badge').value = p.badge || '';
            document.getElementById('p-description').value = p.description || '';
            document.getElementById('p-image').value = p.image || '';
        } catch (e) { showToast('Failed to load product', 'error'); return; }
    } else {
        title.textContent = 'Add Product';
    }
    modal.style.display = 'flex';
}

function closeProductModal() {
    document.getElementById('product-modal').style.display = 'none';
    editingProductId = null;
}

document.getElementById('product-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('product-submit-btn');
    btn.disabled = true; btn.textContent = 'Saving...';

    const payload = {
        name: document.getElementById('p-name').value,
        category: document.getElementById('p-category').value,
        price: Number(document.getElementById('p-price').value),
        originalPrice: Number(document.getElementById('p-original-price').value) || undefined,
        rating: Number(document.getElementById('p-rating').value) || 4.5,
        reviews: 0,
        badge: document.getElementById('p-badge').value,
        description: document.getElementById('p-description').value,
        image: document.getElementById('p-image').value || '/images/chocolate.png',
        stock: 50
    };

    try {
        if (editingProductId) {
            await API.put(`/products/${editingProductId}`, payload);
            showToast('Product updated successfully! ✅', 'success');
        } else {
            await API.post('/products', payload);
            showToast('Product added successfully! ✅', 'success');
        }
        closeProductModal();
        loadAdminProducts();
        loadAnalytics();
    } catch (err) {
        showToast('Error: ' + err.message, 'error');
    } finally {
        btn.disabled = false; btn.textContent = 'Save Product';
    }
});

async function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
        await API.delete(`/products/${productId}`);
        showToast('Product deleted', 'success');
        loadAdminProducts();
        loadAnalytics();
    } catch (e) {
        showToast('Failed to delete product', 'error');
    }
}

// ── Messages ───────────────────────────────────────────────────────
async function loadMessages() {
    const el = document.getElementById('messages-list');
    if (!el) return;
    el.innerHTML = '<div class="table-loading">Loading messages...</div>';
    try {
        const msgs = await API.get('/messages');
        if (!msgs.length) {
            el.innerHTML = '<div class="table-loading">No messages yet.</div>';
            return;
        }
        el.innerHTML = msgs.map(m => `
      <div class="message-card${m.read ? '' : ' unread'}">
        ${!m.read ? '<div class="unread-dot"></div>' : '<div style="width:8px"></div>'}
        <div class="msg-avatar">${m.name.slice(0, 2).toUpperCase()}</div>
        <div style="flex:1">
          <div class="msg-name">${m.name}</div>
          <div class="msg-email">${m.email}</div>
          <div class="msg-text">${m.message}</div>
          <div class="msg-meta">
            <span class="msg-date">${formatDate(m.createdAt)}</span>
            ${!m.read ? `<button class="table-action-btn btn-sm" onclick="markMsgRead('${m.id}')">Mark Read</button>` : '<span style="font-size:0.75rem;color:var(--text-light)">✓ Read</span>'}
          </div>
        </div>
        <div class="msg-actions">
          <button class="table-action-btn danger" onclick="deleteMessage('${m.id}')">🗑</button>
        </div>
      </div>
    `).join('');
    } catch (e) {
        el.innerHTML = '<div class="table-loading">Failed to load messages.</div>';
    }
}

async function markMsgRead(msgId) {
    try {
        await API.put(`/messages/${msgId}`, { read: true });
        showToast('Marked as read', 'success');
        loadMessages();
        loadAnalytics();
    } catch (e) { showToast('Error', 'error'); }
}

async function deleteMessage(msgId) {
    if (!confirm('Delete this message?')) return;
    try {
        await API.delete(`/messages/${msgId}`);
        showToast('Message deleted', 'success');
        loadMessages();
    } catch (e) { showToast('Error', 'error'); }
}

// Close modal on backdrop click
document.getElementById('product-modal').addEventListener('click', function (e) {
    if (e.target === this) closeProductModal();
});
