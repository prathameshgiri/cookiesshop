# 🍪 Good Cookie Chocolate Store

> A modern, full-stack eCommerce web application for handcrafted Chocolates & Cookies — built as a college project for **Arpita Survase**.

---

## 📸 Preview

| Page | Description |
|------|-------------|
| 🏠 Home | Hero section, product catalog, gallery, testimonials, contact |
| 👤 User Dashboard | Order history, stats, profile management |
| 🛡 Admin Panel | Analytics, order/product/message management |

---

## ✨ Features

- 🎨 **Premium UI** — Glassmorphism, dark chocolate hero, smooth animations
- 🔐 **Role-Based Auth** — Separate User & Admin login flows
- 🛒 **Full Cart System** — Add, update, remove items with live badge counter
- 📦 **Order Management** — Place, track, cancel, and update order status
- 🛍 **Product Catalog** — Filter by Chocolates, Cookies, Gift Combos
- 📊 **Admin Analytics** — Revenue, orders, active users dashboard
- 💬 **Contact Messages** — Submit, read, mark as read, delete
- 📱 **Responsive Design** — Mobile-first layout across all pages

---

## 🔐 Login Credentials

### 👤 User Login — `http://localhost:3000/login`
| Field | Value |
|-------|-------|
| Email | `arpita@user.com` |
| Password | `1234` |
| Redirects to | User Dashboard |

### 🛡 Admin Login — `http://localhost:3001/admin-login`
| Field | Value |
|-------|-------|
| Email | `arpita@admin.com` |
| Password | `1234` |
| Redirects to | Admin Panel |

> 💡 Both login pages have an **Auto Fill** button for quick demo access.

---

## 🌐 Application URLs

| Role | URL | Description |
|------|-----|-------------|
| 🏠 Home | `http://localhost:3000` | Main shop (User side) |
| 🔑 User Login | `http://localhost:3000/login` | User login page |
| 🛒 Cart | `http://localhost:3000/cart` | Shopping cart |
| 📦 Checkout | `http://localhost:3000/checkout` | Place an order |
| 👤 Dashboard | `http://localhost:3000/dashboard` | User order history & profile |
| 🛡 Admin Panel | `http://localhost:3001/admin` | Admin control panel |
| 🔒 Admin Login | `http://localhost:3001/admin-login` | Admin-only login |

---

## 🚀 How to Run

### Prerequisites
Make sure you have **Node.js** (v16 or higher) installed.
```bash
node --version   # should be v16+
npm --version
```

### 1. Clone / Open the Project
```bash
cd "d:\Workspaces\OpenSource Projects\Arpita Survase\Good cookie chocolate store"
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start User Server (Port 3000)
```bash
npm run start:user
# or
node server.js
```

### 4. Start Admin Server (Port 3001) — in a new terminal
```bash
npm run start:admin
# or
node admin-server.js
```

> ✅ Open `http://localhost:3000` in your browser for the user store.  
> ✅ Open `http://localhost:3001/admin` for the admin panel.

---

## 🏗️ Project Structure

```
Good cookie chocolate store/
│
├── server.js              # Main Express server (Port 3000 — User Store)
├── admin-server.js        # Admin Express server (Port 3001 — Admin Panel)
├── package.json           # Project config & npm scripts
│
├── data/
│   └── db.json            # JSON-based database (users, products, orders, messages)
│
├── routes/
│   ├── auth.js            # POST /api/auth/login, /logout
│   ├── products.js        # GET/POST/PUT/DELETE /api/products
│   ├── orders.js          # GET/POST/PUT/DELETE /api/orders
│   ├── messages.js        # GET/POST/PUT/DELETE /api/messages
│   └── analytics.js       # GET /api/analytics (admin only)
│
├── middleware/
│   └── auth.js            # requireAuth, requireAdmin middleware
│
└── public/
    ├── index.html         # 🏠 Home Page
    ├── images/            # Product & hero images
    │
    ├── pages/
    │   ├── login.html         # User login page
    │   ├── admin-login.html   # Admin login page
    │   ├── dashboard.html     # User dashboard
    │   ├── cart.html          # Shopping cart
    │   ├── checkout.html      # Checkout & order placement
    │   └── admin.html         # Admin panel
    │
    ├── css/
    │   ├── style.css          # Global design system & tokens
    │   ├── home.css           # Home page styles
    │   ├── auth.css           # Login page styles
    │   ├── cart.css           # Cart & checkout styles
    │   ├── dashboard.css      # User dashboard styles
    │   └── admin.css          # Admin panel styles
    │
    └── js/
        ├── app.js             # Shared: API helper, Auth, Cart, Toast utilities
        ├── home.js            # Home page logic (products, filters, testimonials)
        ├── cart.js            # Cart page logic
        ├── dashboard.js       # User dashboard logic
        └── admin.js           # Admin panel logic (CRUD, analytics, messages)
```

---

## 🧰 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | HTML5, CSS3 (Vanilla), JavaScript (Vanilla ES6+) |
| **Backend** | Node.js, Express.js |
| **Database** | JSON file (`data/db.json`) — MongoDB-ready structure |
| **Auth** | Token-based auth with `localStorage` |
| **Fonts** | Playfair Display, Poppins (Google Fonts) |
| **Design** | Glassmorphism, Dark Chocolate Hero, Scroll Animations |
| **Icons** | Emoji-based icons (no dependencies) |

---

## 📦 npm Scripts

```bash
npm start           # Start user server (port 3000)
npm run start:user  # Start user server (port 3000)
npm run start:admin # Start admin server (port 3001)
npm run start:all   # Start both servers together
npm run dev         # Development mode (port 3000)
```

---

## 🔌 API Endpoints

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/login` | Login with email & password |
| POST | `/api/auth/logout` | Logout current session |

### Products
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/products` | Get all products (filter by `?category=`) |
| POST | `/api/products` | Add new product *(admin only)* |
| PUT | `/api/products/:id` | Update product *(admin only)* |
| DELETE | `/api/products/:id` | Delete product *(admin only)* |

### Orders
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/orders` | Get user's orders (admin gets all) |
| POST | `/api/orders` | Place a new order |
| PUT | `/api/orders/:id` | Update order status *(admin only)* |
| DELETE | `/api/orders/:id` | Cancel order |

### Messages
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/messages` | Submit contact message |
| GET | `/api/messages` | Get all messages *(admin only)* |
| PUT | `/api/messages/:id` | Mark as read *(admin only)* |
| DELETE | `/api/messages/:id` | Delete message *(admin only)* |

### Analytics
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/analytics` | Dashboard stats *(admin only)* |

---

## 🎨 Design Highlights

- **Dark Chocolate Hero** — Deep `#1A0808` gradient with gold accents `#F0B845`
- **Playfair Display** serif font for premium, artisanal feel
- **Glassmorphism Cards** — Frosted glass effect on floating cards
- **Our Story Timeline** — Gold-dotted chronological company history
- **Scroll Reveal Animations** — Intersection Observer-powered fade-ins
- **Toast Notifications** — Contextual success/error/info alerts
- **Mobile Responsive** — Works on phones, tablets, and desktops

---

## 🧑‍💼 About the Developer

<div align="center">

### Prathamesh Giri

*Full-Stack Developer & UI/UX Designer*

🌐 **Portfolio:** [prathameshgiri.in](https://prathameshgiri.in/)  
🛠 **Build Projects:** [build.prathameshgiri.in](https://build.prathameshgiri.in/)

</div>

---

## 🎓 Project Info

| Field | Details |
|-------|---------|
| **Project Type** | College eCommerce Project |
| **Made For** | Arpita Survase |
| **Developer** | Prathamesh Giri |
| **Year** | 2026 |
| **Purpose** | Academic / Demo |

---

## 📄 License

This project was built as a **college project** for **Arpita Survase**.  
Developed by **Prathamesh Giri** — All rights reserved © 2026.

---

<div align="center">

Made with Prathamesh Giri in India

**[prathameshgiri.in](https://prathameshgiri.in/)** • **[build.prathameshgiri.in](https://build.prathameshgiri.in/)**

</div>
