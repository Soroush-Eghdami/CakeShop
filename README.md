# 🎂 CakeShop — Online Cake Store

A modern, delightful e-commerce web application for selling cakes and bakery products, built with **React** and **Tailwind CSS**.

---

## ✨ Overview

CakeShop is a frontend web application designed to showcase and sell handcrafted cakes online. It features a clean, warm UI with product listings, a shopping cart, and an order flow — all powered by React components and styled with Tailwind CSS utility classes.

---

## 🚀 Tech Stack

| Technology                               | Purpose                      |
| ---------------------------------------- | ---------------------------- |
| [React](https://react.dev/)              | UI component library         |
| [Tailwind CSS](https://tailwindcss.com/) | Utility-first styling        |
| [React Router](https://reactrouter.com/) | Client-side routing          |
| [Vite](https://vitejs.dev/)              | Fast dev server & build tool |

---

## 📁 Project Structure

```
cakeshop/
├── public/
│   └── assets/          # Static images and icons
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── Navbar.jsx
│   │   ├── CakeCard.jsx
│   │   ├── Cart.jsx
│   │   └── Footer.jsx
│   ├── pages/           # Route-level page components
│   │   ├── Home.jsx
│   │   ├── Menu.jsx
│   │   ├── ProductDetail.jsx
│   │   └── Checkout.jsx
│   ├── data/            # Static product data (or API calls)
│   │   └── cakes.js
│   ├── App.jsx          # Root component with routing
│   ├── main.jsx         # React entry point
│   └── index.css        # Tailwind directives
├── tailwind.config.js
├── vite.config.js
├── package.json
└── README.md
```

---

## ⚙️ Getting Started

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) v18+
- pnpm

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/anahita05/cake-website-project.git

# 2. Install dependencies
pnpm install

# 3. Start the development server
pnpm run dev
```

The app will be running at `http://localhost:5173`.

### Build for Production

```bash
pnpm run build
```

The optimized output will be in the `dist/` folder.

---

## 🎨 Tailwind CSS Setup

Tailwind is configured via `tailwind.config.js`. The content paths are set to scan all JSX files:

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        caramel: "#C68642",
        cream: "#FFF8F0",
        chocolate: "#3B1F0F",
      },
      fontFamily: {
        display: ["Playfair Display", "serif"],
        body: ["Lato", "sans-serif"],
      },
    },
  },
  plugins: [],
};
```

---

## 🛠️ Backend (Django API)

The project also includes a **Django REST Framework** backend in the `Back/` folder, which powers authentication, products, cart, and orders.

### Tech Stack

| Technology                                            | Purpose                  |
| ----------------------------------------------------- | ------------------------ |
| [Django](https://www.djangoproject.com/)              | Web framework            |
| [DRF](https://www.django-rest-framework.org/)         | REST API                 |
| [Simple JWT](https://django-rest-framework-simplejwt.readthedocs.io/) | Cookie-based JWT auth |
| [drf-spectacular](https://drf-spectacular.readthedocs.io/) | OpenAPI docs / Swagger |
| [django-cors-headers](https://github.com/adamchainz/django-cors-headers) | CORS for the frontend |
| SQLite                                                | Dev database             |

### Project Structure

```
Back/
├── accounts/      # Custom user (UUID, email login), JWT register/login/logout/me
├── products/      # Categories + products (list / detail)
├── cart/          # Per-user cart + cart items
├── orders/        # Orders created from the cart
├── core/          # Settings & root URL config
├── manage.py
└── requirements.txt
```

### API Endpoints

| Base              | Routes                                                        |
| ----------------- | ------------------------------------------------------------- |
| `/api/auth/`      | `register/`, `login/`, `logout/`, `me/`                       |
| `/api/products/`  | `/` (list, `?category=<slug>`), `categories/`, `<uuid>/`      |
| `/api/cart/`      | `/`, `items/`, `items/<uuid>/`, `clear/`                      |
| `/api/orders/`    | `/` (list), `create/` (from cart), `<id>/`                    |
| `/admin/`         | Django admin                                                  |
| `/api/docs/`      | Swagger UI (via `/api/schema/`)                               |

### Running the Backend

```bash
# 1. Go to the backend folder
cd Back

# 2. Create and activate a virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1   # Windows
# source venv/bin/activate    # macOS / Linux

# 3. Install dependencies
pip install -r requirements.txt

# 4. Apply migrations and create an admin user
python manage.py migrate
python manage.py createsuperuser

# 5. Start the API server
python manage.py runserver
```

The API will be running at `http://127.0.0.1:8000`, alongside the frontend at `http://localhost:5173`.

---

> Made with ❤️ and a lot of sugar 🍰
