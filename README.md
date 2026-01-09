# Shop React Django

React (Vite) + Django (DRF) 的电商小站：商品列表/详情/购物车/订单。后端使用 Session 认证，Django Admin 管理商品与库存，默认搭配 Postgres（Docker）。

## 目录
- 功能范围
- 技术栈
- 项目结构
- 数据库选择
- 快速开始（Docker）
- 本地开发（无 Docker）
- Session 认证与 CSRF
- 数据模型设计
- API 设计
- 常见问题

## 功能范围
### MVP
- 商品列表 / 搜索
- 商品详情（库存、价格）
- 购物车（增删、数量调整）
- 订单创建（收货信息、订单项）
- 后台管理（商品、库存、订单）

### 可选扩展
- 用户注册/登录（目前仅登录/登出）
- 支付对接（Stripe/支付宝沙箱）
- 优惠券/满减
- 订单状态流转
- 推荐/热销榜

## 技术栈
### 后端
- Django
- Django REST Framework
- django-filter（筛选）
- django-cors-headers（跨域）
- Pillow（商品图片）
- python-dotenv（加载 .env）

### 前端
- React（Vite）
- React Router
- Fetch API（内置）

### 数据库
- Postgres（Docker Compose 默认）
- SQLite（未配置 Postgres 时自动回退）

## 项目结构
```
shop_react_django/
  docker-compose.yml
  backend/
    Dockerfile
    manage.py
    shop/                # Django 项目配置
    catalog/             # 商品与分类
    orders/              # 订单与订单项
    users/               # Session 认证 API
    requirements.txt
  frontend/
    Dockerfile
    src/
      api/               # API 封装
      pages/             # 页面
      components/        # 组件
      store/             # 状态管理
    vite.config.js
    package.json
```

## 数据库选择
- 推荐 Postgres：更接近真实线上环境、并发更好、可用 Docker 一键启动。
- 本地轻量开发：不设置 `POSTGRES_*` 环境变量时自动使用 SQLite。

## 快速开始（Docker）
### 1) 启动服务（开箱即用）
```bash
docker compose up --build
```

第一次启动会自动执行数据库迁移，并创建管理员账号。  
默认管理员账号：`admin` / `admin123`（仅用于本地开发）。  
如需修改账号密码，可在 `docker-compose.yml` 中调整 `DJANGO_SUPERUSER_*` 环境变量，或者在项目根目录创建 `.env` 覆盖默认值。

访问：
- 前端：http://localhost:5173
- 后端：http://localhost:8000
- Django Admin：http://localhost:8000/admin

## 本地开发（无 Docker）
### 1) 后端
```bash
python -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt

cp backend/.env.example backend/.env
python backend/manage.py migrate
python backend/manage.py createsuperuser
python backend/manage.py runserver
```

### 2) 前端
```bash
cd frontend
npm install
npm run dev
```

## Session 认证与 CSRF
- 登录模式：Session（Django 默认）
- 前端需先请求 `/api/auth/csrf/` 获取 CSRF Cookie
- POST/PUT/DELETE 需要带 `X-CSRFToken`，并设置 `credentials: "include"`

示例：
```js
await fetch("/api/auth/csrf/", { credentials: "include" });
await fetch("/api/orders/", {
  method: "POST",
  credentials: "include",
  headers: { "X-CSRFToken": "<token>", "Content-Type": "application/json" },
  body: JSON.stringify(payload),
});
```

## 数据模型设计
### Product（商品）
- name, description, price, stock, image, category, is_active

### Category（分类）
- name, slug

### Order（订单）
- user, status, total_amount, created_at, shipping_name, shipping_phone, shipping_address

### OrderItem（订单项）
- order, product, product_name, unit_price, quantity

## API 设计
前缀：`/api`

### 商品
- `GET /products/` 商品列表
- `GET /products/:id/` 商品详情
- `GET /categories/` 分类列表

### 订单
- `POST /orders/` 创建订单（允许未登录）
- `GET /orders/` 订单列表（仅登录用户）
- `GET /orders/:id/` 订单详情（仅登录用户）

### 认证
- `GET /auth/csrf/` 获取 CSRF Token
- `POST /auth/login/` 登录
- `POST /auth/logout/` 登出
- `GET /auth/me/` 当前用户

## 常见问题
### 1) 前端跨域
确保后端开启 `django-cors-headers` 并配置 `CORS_ALLOWED_ORIGINS` 与 `CSRF_TRUSTED_ORIGINS`。

### 2) 商品图片上传
使用 `Pillow` 支持图片字段；本地开发可用 `MEDIA_ROOT`，生产环境建议使用对象存储。

### 3) 订单库存扣减
后端下单时会锁定商品并扣减库存，库存不足会直接报错。
