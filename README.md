# Shop React Django

A full-stack mini e-commerce site built with React (Vite) and Django (DRF): product list/detail, cart, and order flow. The backend uses session authentication, Django Admin for product/inventory management, and Postgres by default (Docker).

Now it's fully deployed on Cloud, frontend on Netlify, backend on Render and database is on Neon. Checkout [frontend url](https://shiny-basbousa-7cd09c.netlify.app/). Note that if not receiving inbounding traffic, [Render will spin down on idle](https://render.com/docs/free#other-limitations-1:~:text=paid%20instance%20type.-,Spinning%20down%20on%20idle,-Render%20spins%20down), so it'll take around half second to reactivate.
## Table of Contents
- Scope
- Tech Stack
- Project Structure
- Database Choice
- Quick Start (Docker)
- Local Development (No Docker)
- Session Auth and CSRF
- Data Model
- API Reference
- FAQ

## Scope
### MVP
- Product list / search
- Product detail (stock, price)
- Cart (add/remove/update quantity)
- Order creation (shipping info, line items)
- Admin management (products, inventory, orders)

### Optional Extensions
- User registration/login (currently login/logout only)
- Payment integration (Stripe/Alipay sandbox)
- Coupons/discounts
- Order status workflow
- Recommendations/bestsellers

## Tech Stack
### Backend
- Django
- Django REST Framework
- django-filter (filtering)
- django-cors-headers (CORS)
- Pillow (images)
- python-dotenv (load .env)

### Frontend
- React (Vite)
- React Router
- Fetch API (built-in)

### Database
- Postgres (default in Docker Compose)
- SQLite (fallback when Postgres env vars are not set)

## Project Structure
```
shop_react_django/
  docker-compose.yml
  backend/
    Dockerfile
    manage.py
    shop/                # Django project settings
    catalog/             # Products and categories
    orders/              # Orders and line items
    users/               # Session auth API
    requirements.txt
  frontend/
    Dockerfile
    src/
      api/               # API client
      pages/             # Pages
      components/        # UI components
      store/             # State management
    vite.config.js
    package.json
```

## Database Choice
- Postgres is recommended for production-like behavior, concurrency, and Docker-friendly setup.
- For quick local work, leaving `POSTGRES_*` unset will automatically use SQLite.

## Quick Start (Docker)
### 1) Start the stack (out of the box)
```bash
docker compose up --build
```

On first boot, migrations run automatically and a superuser is created.  
Default admin: `admin` / `admin123` (dev only).  
To change credentials, edit `DJANGO_SUPERUSER_*` in `docker-compose.yml` or create a `.env` file next to `docker-compose.yml`.

Visit:
- Frontend: http://localhost:5173
- Backend: http://localhost:8000
- Django Admin: http://localhost:8000/admin

## Local Development (No Docker)
### 1) Backend
```bash
python -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt

cp backend/.env.example backend/.env
python backend/manage.py migrate
python backend/manage.py createsuperuser
python backend/manage.py runserver
```

### 2) Frontend
```bash
cd frontend
npm install
npm run dev
```

## Session Auth and CSRF
- Auth mode: session (Django default)
- Frontend must call `/api/auth/csrf/` to set the CSRF cookie
- POST/PUT/DELETE must include `X-CSRFToken` and `credentials: "include"`

Example:
```js
await fetch("/api/auth/csrf/", { credentials: "include" });
await fetch("/api/orders/", {
  method: "POST",
  credentials: "include",
  headers: { "X-CSRFToken": "<token>", "Content-Type": "application/json" },
  body: JSON.stringify(payload),
});
```

## Data Model
### Product
- name, description, price, stock, image, category, is_active

### Category
- name, slug

### Order
- user, status, total_amount, created_at, shipping_name, shipping_phone, shipping_address

### OrderItem
- order, product, product_name, unit_price, quantity

## API Reference
Prefix: `/api`

### Products
- `GET /products/` list
- `GET /products/:id/` detail
- `GET /categories/` list

### Orders
- `POST /orders/` create (guest allowed)
- `GET /orders/` list (auth only)
- `GET /orders/:id/` detail (auth only)

### Auth
- `GET /auth/csrf/` CSRF token
- `POST /auth/login/` login
- `POST /auth/logout/` logout
- `GET /auth/me/` current user

## FAQ
### 1) CORS
Enable `django-cors-headers` and set `CORS_ALLOWED_ORIGINS` and `CSRF_TRUSTED_ORIGINS`.

### 2) Product images
Pillow backs the image field. Use `MEDIA_ROOT` locally; in production, use object storage.

### 3) Stock deduction
Order creation locks products and deducts stock; insufficient stock returns an error.
