# Checkout API Boundary

Frontend checkout code no longer calls legacy PHP endpoints directly.

Current structure:

- `src/checkout/infrastructure/repositories/ApiCheckoutRepository.ts`
- `src/checkout/infrastructure/repositories/MockCheckoutRepository.ts`
- `src/shared-kernel/infrastructure/http/nuxt-api-client.ts`
- `server/api/checkout/*`
- `server/utils/legacy-php-client.ts`

Business-shaped frontend endpoints:

- `GET /api/checkout/snapshot`
- `POST /api/checkout/address`
- `POST /api/checkout/submit`
