# KHMarket Laravel API

Laravel 13 API backend for the existing KHMarket Next.js marketplace. The Next.js application remains in the repository root; this project provides the API and MySQL persistence layer without replacing the current UI.

## Requirements

- PHP 8.3 or later with `pdo_mysql`, `fileinfo`, `mbstring`, `openssl`, and `zip`
- Composer 2
- MySQL 8.0+ (the marketplace migration uses a full-text index)
- Node.js and npm for the existing frontend

## Local setup

From this `backend` directory:

```powershell
composer install
Copy-Item .env.example .env
php artisan key:generate
```

Create the local database in MySQL:

```sql
CREATE DATABASE khmarket_marketplace CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Set `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, and `DB_PASSWORD` in `backend/.env`. Use credentials supplied by your local MySQL installation; never commit `.env`.

Then initialize and run the API:

```powershell
php artisan migrate
php artisan db:seed
php artisan marketplace:import-prisma-sqlite
php artisan storage:link
php artisan route:list --path=api
php artisan serve
```

Laravel listens at `http://127.0.0.1:8000` by default. The development seeder creates:

| Account | Role / membership | Development password |
|---|---|---|
| `seller@khmarket.com` | Premium seller (active for one month) | `password123` |
| `demo@khmarket.com` | Free buyer | `password123` |
| `admin@khmarket.com` | Admin | `password123` |

These are development-only accounts; change or remove them before production. Seeding inserts password hashes, never plaintext passwords.

The SQLite import command reads `../dev.db` by default (or accepts an explicit path). It migrates existing users, categories, products, images, favorites, orders, messages, notifications, reviews, reports, and newsletter subscriptions. It tracks the source file hash to prevent importing the same database twice. Legacy authentication sessions are intentionally not copied; users must sign in again. Legacy orders receive a `PENDING` payment status because the source schema did not contain payment confirmation data.

## API overview

All endpoints are under `/api`. First-party SPA authentication uses Laravel sessions through Sanctum; include credentials on browser requests and send the `Origin`/`Referer` for the configured frontend origin. Obtain the CSRF cookie from `/sanctum/csrf-cookie` before state-changing browser requests.

| Surface | Endpoints |
|---|---|
| Authentication | `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`, password reset routes |
| Marketplace | `GET /products`, `GET /products/{id}`, `GET /products/slug/{slug}`, `GET /categories`, `GET /locations` |
| Listings | `POST /products`, `PUT/PATCH/DELETE /products/{id}`, `PATCH /products/{id}/status`, `GET /seller/products`, `GET /seller/dashboard` |
| Membership | `POST /premium/checkout` (simulated; it does not process real payments) |
| Account and engagement | Profile, favorites, cart, orders, messages, notifications, reviews, and reports routes in `routes/api.php` |
| Administration | `/admin/dashboard`, users, products, categories, reports, and reviews; protected by the `ADMIN` role middleware |

Product creation is rejected by server-side validation and policy checks unless the signed-in user is an admin or has an unexpired active Premium membership. Product images are validated and written to the public storage disk.

## Testing and checks

Feature tests use in-memory SQLite and exercise membership enforcement, listing create/edit/delete, demo membership activation, role protection, session login/logout, and repeatable development seeds:

```powershell
php artisan test
vendor/bin/pint --test
php artisan route:list --path=api
php artisan migrate:status
```

Before using MySQL, configure the local `.env`, then run `php artisan migrate` and `php artisan db:seed`. Do not run `migrate:fresh` against a database that contains data.

## Migration status

This backend is being introduced alongside the existing Next.js/Prisma application. Existing SQLite marketplace records have not yet been imported into MySQL, and frontend pages still contain Prisma-backed reads and API handlers. Do not point production traffic at this API until that data migration and frontend integration are completed and verified.
