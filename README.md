# KHMarket — Cambodia Marketplace

A dynamic Cambodia marketplace built with Next.js, TypeScript, Tailwind CSS, Prisma, and SQLite for local development.

## Quick start

1. Install dependencies: `npm install`
2. Generate Prisma client: `npx prisma generate`
3. Sync the local SQLite database with the Prisma schema: `npx prisma db push`
4. Seed sample data: `npm run prisma:seed`
5. Start the app: `npm run dev`

## Premium membership

The existing Prisma/SQLite database stores each user's membership and Premium dates. A Premium account can publish and manage listings from **Sell** and **My Products**. A Free account can browse and save products, and is shown the Premium upgrade page when opening **Sell**.

The Premium plan is a simulated checkout at **$5.99 per month**. It does not collect or process real payment details. Uploaded JPEG, PNG, and WebP listing photos (up to three, 2 MB each) are stored in the existing product-image table.

For local testing, the seeded accounts use the password `password123`: `seller@khmarket.com` (active Premium seller), `demo@khmarket.com` (Free buyer), and `admin@khmarket.com` (administrator). The seeded Premium seller can publish listings immediately. Sign in as the buyer, open **Premium**, complete the demo checkout, and then publish a listing from **Sell**. The administrator can grant or revoke Premium membership and remove listings from **Admin**. Re-run `npm run prisma:seed` to restore the seeded seller's active one-month Premium membership.

## Notes

The existing Next.js frontend still reads and writes the Prisma SQLite database. The Laravel backend is configured separately for MySQL; do not point live traffic at it until the frontend has been migrated and verified.

## Laravel API migration

A Laravel 13 API project is available in [`backend/`](./backend/README.md). It includes the MySQL schema, Sanctum authentication, marketplace APIs, server-side Premium checks, administrative APIs, and development seeders.

**Migration is not complete yet.** The existing Next.js pages and API handlers still use Prisma/SQLite, and the current SQLite data has not been imported into MySQL. Keep running the existing frontend as documented above until the backend data migration and frontend integration are finished. Follow the backend README to run its tests or use its API in isolation.
